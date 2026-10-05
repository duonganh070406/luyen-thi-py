#!/usr/bin/env python3
"""EduQuest Data Pipeline: Sync from root data/ and optimize WebP in backend/data/.

Synchronizes question banks and notes from root `data/` to `backend/data/`
while keeping the root `data/` directory completely untouched.
Cleans unused/orphaned images and converts remaining images to WebP
(prioritizing lossless for diagram/text crispness) directly inside `backend/data/`
for a lean, production-ready backend bundle.

Design Note:
    This script encapsulates all operations without modifying a single line in
    `sync_data.py`, `clean_unused_images.py`, or `compress_images.py`.

After that:
git add backend/data
git commit --amend --no-edit
git push --force-with-lease
"""

from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

from PIL import Image

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add scripts directory to sys.path so local modules can be imported
SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import clean_unused_images
import compress_images
from sync_data import sync_data

WORKSPACE_ROOT = SCRIPTS_DIR.parent.parent
ROOT_DATA_DIR = WORKSPACE_ROOT / "data"
BACKEND_DATA_DIR = WORKSPACE_ROOT / "backend" / "data"

IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".bmp",
    ".tiff",
}


def _format_size(size_bytes: int) -> str:
    """Format bytes into readable KB or MB strings."""
    if size_bytes <= 0:
        return "0 KB"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.2f} MB"


def get_dir_image_stats(
    dir_path: Path, subject: str | None = None
) -> tuple[int, int]:
    """Calculate total images and total byte size of images in a directory."""
    target = dir_path / subject if subject else dir_path
    if not target.is_dir():
        return 0, 0
    images = [
        f
        for f in target.rglob("*")
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
    ]
    return len(images), sum(f.stat().st_size for f in images)


def _setup_runtime_patches(lossless: bool) -> None:
    """Configure modules to safely target backend/data with lossless WebP."""
    # Point both utilities to operate exclusively on backend/data
    clean_unused_images.DATA_DIR = BACKEND_DATA_DIR
    compress_images.DATA_DIR = BACKEND_DATA_DIR

    if not lossless:
        return

    orig_compress_single = compress_images.compress_single_image

    def lossless_compress_single(
        img_path: Path,
        max_dim: int = 1440,
        quality: int = 82,
        to_webp: bool = False,
        pngquant_bin: Path | None = None,
    ) -> tuple[bytes, str, tuple[int, int], tuple[int, int]]:
        """Wrap single image compression with WebP lossless capability."""
        if not to_webp:
            return orig_compress_single(
                img_path, max_dim, quality, to_webp, pngquant_bin
            )

        with Image.open(img_path) as im:
            # Preserve multi-frame animated GIFs without converting to static WebP
            if getattr(im, "is_animated", False):
                return orig_compress_single(
                    img_path, max_dim, quality, False, pngquant_bin
                )

            orig_w, orig_h = im.size

            # Downscale only if requested (max_dim > 0)
            if max_dim > 0 and max(orig_w, orig_h) > max_dim:
                ratio = max_dim / max(orig_w, orig_h)
                new_w = max(1, int(round(orig_w * ratio)))
                new_h = max(1, int(round(orig_h * ratio)))
                im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
            else:
                new_w, new_h = orig_w, orig_h

            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "transparency" in im.info else "RGB")

            # Try WebP Lossless method 6 (100% bit-exact, zero info loss)
            buf_ll = io.BytesIO()
            im.save(buf_ll, format="WEBP", lossless=True, method=6)
            ll_bytes = buf_ll.getvalue()

            # Safety fallback for misnamed JPEGs: use high-quality lossy
            orig_file_size = img_path.stat().st_size
            if len(ll_bytes) <= orig_file_size:
                return ll_bytes, ".webp", (orig_w, orig_h), (new_w, new_h)

            buf_q = io.BytesIO()
            im.save(buf_q, format="WEBP", quality=max(quality, 88), method=6)
            return buf_q.getvalue(), ".webp", (orig_w, orig_h), (new_w, new_h)

    compress_images.compress_single_image = lossless_compress_single


def main() -> None:
    """Entry point for data sync, clean, and WebP optimization pipeline."""
    parser = argparse.ArgumentParser(
        description=(
            "EduQuest Pipeline: Đồng bộ từ data/ sang backend/data/, "
            "dọn ảnh thừa và tối ưu hóa WebP cực độ (bảo toàn 100% data/ gốc)."
        )
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Chạy mô phỏng kiểm tra, không ghi hay xóa bất kỳ file nào.",
    )
    parser.add_argument(
        "--skip-clean",
        action="store_true",
        help="Bỏ qua bước dọn dẹp ảnh thừa không sử dụng trong backend/data/.",
    )
    parser.add_argument(
        "--subject",
        "-s",
        type=str,
        default=None,
        help="Chỉ quét và xử lý 1 môn học cụ thể (ví dụ: 'Mạng máy tính').",
    )
    parser.add_argument(
        "--max-dim",
        type=int,
        default=0,
        help=(
            "Cạnh tối đa của ảnh (pixel). Mặc định: 0 "
            "(giữ nguyên 100%% độ phân giải gốc)."
        ),
    )
    parser.add_argument(
        "--quality",
        "-q",
        type=int,
        default=85,
        help="Chất lượng nén WebP fallback cho ảnh JPEG (1-100, mặc định: 85).",
    )
    parser.add_argument(
        "--min-size-kb",
        type=int,
        default=10,
        help="Bỏ qua các ảnh có dung lượng nhỏ hơn X KB (mặc định: 10 KB).",
    )
    parser.add_argument(
        "--no-lossless",
        action="store_true",
        help="Tắt ưu tiên Lossless (luôn dùng WebP lossy để nén nhỏ nhất có thể).",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Hiển thị chi tiết từng thao tác copy, xóa và nén file.",
    )

    args = parser.parse_args()

    # Apply dynamic module redirection to backend/data
    _setup_runtime_patches(lossless=not args.no_lossless)

    lossless_label = (
        "❌ Tắt (Lossy thuần theo --quality)"
        if args.no_lossless
        else "✅ Ưu tiên Lossless (fallback High Quality q88 nếu JPEG bị phình)"
    )

    print("=" * 88)
    print("🚀 EDUQUEST PIPELINE: ĐỒNG BỘ DỮ LIỆU & TỐI ƯU HÓA WEBP")
    print("=" * 88)
    print(f"  - Thư mục nguồn (GỐC)   : {ROOT_DATA_DIR} [KHÔNG THAY ĐỔI]")
    print(f"  - Thư mục đích (DEPLOY) : {BACKEND_DATA_DIR}")
    if args.subject:
        print(f"  - Môn học mục tiêu      : {args.subject}")
    print(
        f"  - Dọn ảnh thừa (Orphan) : "
        f"{'❌ Bỏ qua' if args.skip_clean else '✅ Tự động xóa trong backend/data/'}"
    )
    print(f"  - Chế độ nén WebP       : {lossless_label}")
    print(
        f"  - Giữ nguyên Resolution : "
        f"{'✅ Có (100% pixel)' if args.max_dim == 0 else f'Resize max {args.max_dim}px'}"
    )
    print(
        f"  - Chế độ chạy           : "
        f"{'🔍 DRY-RUN' if args.dry_run else '⚡ THỰC THI (ACTIVE)'}"
    )
    print("=" * 88)

    # 1. Thống kê trước khi chạy
    orig_img_count, orig_img_bytes = get_dir_image_stats(
        ROOT_DATA_DIR, args.subject
    )
    print(
        f"\n📦 Trạng thái data/ gốc: {orig_img_count} ảnh, "
        f"tổng dung lượng: {_format_size(orig_img_bytes)}"
    )

    # 2. BƯỚC 1: Đồng bộ từ data/ sang backend/data/
    print("\n" + "-" * 88)
    print("▶️  BƯỚC 1: ĐỒNG BỘ TỪ data/ -> backend/data/")
    print("-" * 88)
    sync_data(dry_run=args.dry_run, verbose=args.verbose)

    # Đo dung lượng sau sync
    post_sync_count, post_sync_bytes = get_dir_image_stats(
        BACKEND_DATA_DIR, args.subject
    )

    # 3. BƯỚC 2: Dọn dẹp ảnh thừa không sử dụng trực tiếp trong backend/data/
    if not args.skip_clean:
        print("\n" + "-" * 88)
        print(
            "▶️  BƯỚC 2: DỌN DẸP ẢNH MỒ CÔI (ORPHANED) TRỰC TIẾP TRONG backend/data/"
        )
        print("-" * 88)
        clean_unused_images.scan_images(
            include_test_scratch=False,
            do_delete=not args.dry_run,
            verbose=args.verbose,
        )

    # Đo dung lượng sau dọn ảnh thừa
    post_clean_count, post_clean_bytes = get_dir_image_stats(
        BACKEND_DATA_DIR, args.subject
    )

    # 4. BƯỚC 3: Tối ưu hóa ảnh WebP trong backend/data/
    print("\n" + "-" * 88)
    print("▶️  BƯỚC 3: TỐI ƯU HÓA ẢNH WEBP TRỰC TIẾP TRONG backend/data/")
    print("-" * 88)
    compress_images.run_compression(
        apply_changes=not args.dry_run,
        backup=False,  # Bản gốc ở data/ đã là backup an toàn tuyệt đối
        target_subject=args.subject,
        max_dim=args.max_dim,
        quality=args.quality,
        min_size_kb=args.min_size_kb,
        verbose=args.verbose,
        include_test_scratch=False,
        to_webp=True,
    )

    # 5. Thống kê tổng kết
    final_img_count, final_img_bytes = get_dir_image_stats(
        BACKEND_DATA_DIR, args.subject
    )

    print("\n" + "=" * 88)
    print("✨ TỔNG KẾT TIẾN TRÌNH PIPELINE:")
    print(f"  1. Thư mục data/ gốc       : GIỮ NGUYÊN 100% ({_format_size(orig_img_bytes)})")

    if args.dry_run:
        print(
            f"  2. Thư mục backend/data    : {post_sync_count} ảnh hiện có "
            f"({_format_size(post_sync_bytes)})"
        )
        print("  💡 Lưu ý: Chế độ DRY-RUN chỉ mô phỏng, xem chi tiết dự kiến ở các bảng trên.")
    else:
        orphans_removed = post_sync_count - post_clean_count
        orphan_saved_bytes = max(0, post_sync_bytes - post_clean_bytes)
        comp_saved_bytes = max(0, post_clean_bytes - final_img_bytes)
        total_saved_bytes = orig_img_bytes - final_img_bytes
        total_pct = (
            (total_saved_bytes / orig_img_bytes * 100) if orig_img_bytes > 0 else 0.0
        )

        print(
            f"  2. Thư mục backend/data    : {final_img_count} ảnh "
            f"({_format_size(final_img_bytes)})"
        )
        if orphans_removed > 0:
            print(
                f"  3. Ảnh mồ côi đã dọn       : -{orphans_removed} ảnh "
                f"(-{_format_size(orphan_saved_bytes)})"
            )
        if comp_saved_bytes > 0:
            print(
                f"  4. Tiết kiệm từ nén WebP   : -{_format_size(comp_saved_bytes)}"
            )
        if total_saved_bytes > 0:
            print(
                f"  5. TỔNG DUNG LƯỢNG GIẢM    : -{_format_size(total_saved_bytes)} "
                f"(-{total_pct:.1f}%)"
            )
    print("=" * 88)


if __name__ == "__main__":
    main()
