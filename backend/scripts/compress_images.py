#!/usr/bin/env python3
"""EduQuest Smart Image Optimization and Compression Engine.

Tailored specifically for reducing the file size of high-resolution screenshots
(2K/4K) taken from PDF documents and textbooks, cutting file sizes by 50% - 85%
while maintaining crisp, razor-sharp text and diagram legibility.

Why this script exists:
  When users study with 2K/4K displays and capture cropped regions of PDF exams
  or lecture slides, standard screenshot tools create 24-bit/32-bit RGBA PNGs or
  uncompressed JPEGs with massive dimensions (often 1800px - 2800px wide) and
  heavy anti-aliasing artifacts. These images weigh 500 KB - 3 MB each, despite
  being rendered on the web in card columns rarely wider than 800px - 1000px.
  This script automates iLoveIMG/TinyPNG-style optimization locally and offline.

Core Optimization Pipeline:
  1. Smart Downscaling (Lanczos filter):
     - Downscales oversized 2K/4K images exceeding `--max-dim` (default 1440px)
       to optimal web display resolutions while keeping full typographic clarity.
  2. Color Quantization (8-bit Adaptive Palette):
     - For PNG images, reduces 16M RGB colors to a 256-color indexed palette
       using Pillow's FastOctree algorithm while strictly preserving the Alpha
       transparency channel. Eliminates millions of sub-pixel noise variations.
  3. Safe Format & Magic Byte Detection:
     - Detects the true binary codec of each file. Avoids corruption when files
       internally stored as JPEG are misnamed with `.png` extensions.
  4. Huffman & Progressive JPEG Optimization:
     - Applies MozJPEG-style Huffman table optimization and progressive rendering.
  5. WebP Encoding (Optional `--to-webp`):
     - Compresses to modern WebP (method 6) and automatically updates all
       references in `.md` files.
  6. Atomic In-Place Writes & Size Guard:
     - Writes to `.tmp` files and swaps atomically to guarantee zero data loss.
     - Never saves a compressed file if the new size is larger than the original.

Usage & Examples:
  - Default dry-run analysis (safe, read-only, outputs subject summary table):
      python backend/scripts/compress_images.py
  - Single-image test mode (creates 2 compressed test files in scripts/test/):
      python backend/scripts/compress_images.py --test "data/test/note/img/arrow.png"
  - Apply in-place compression to all images (preserves all markdown links):
      python backend/scripts/compress_images.py --apply
  - Apply in-place compression with automatic original backup to .backup_images/:
      python backend/scripts/compress_images.py --apply --backup
  - Target a specific subject folder:
      python backend/scripts/compress_images.py --apply --subject "Mạng máy tính"
  - Customize max dimension (e.g. 1280px) and quality level (e.g. 80):
      python backend/scripts/compress_images.py --apply --max-dim 1280 --quality 80
  - Convert to WebP format and rewrite Markdown references:
      python backend/scripts/compress_images.py --apply --to-webp
"""

from __future__ import annotations

import argparse
import io
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from PIL import Image

# Đảm bảo in tiếng Việt mượt mà trên console Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = WORKSPACE_ROOT / "data"
SCRIPTS_DIR = Path(__file__).resolve().parent

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff"}

# Regex tìm kiếm liên kết ảnh trong file Markdown để cập nhật khi dùng --to-webp
MD_IMG_REGEX = re.compile(r"(!?\[.*?\]\s*\()(.*?)(\))")
HTML_IMG_REGEX = re.compile(r'(<img\s+[^>]*src=["\'])(.*?)(["\'])', re.IGNORECASE)


def _format_size(size_bytes: int) -> str:
    """Định dạng dung lượng byte sang KB hoặc MB dễ đọc."""
    if size_bytes <= 0:
        return "0 KB"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.2f} MB"


def _find_pngquant() -> Path | None:
    """Tìm file thực thi pngquant trong hệ thống hoặc thư mục bin nội bộ."""
    # Kiểm tra trong thư mục bin nội bộ của backend/scripts nếu có
    local_bin = (
        SCRIPTS_DIR / "bin" / ("pngquant.exe" if os.name == "nt" else "pngquant")
    )
    if local_bin.is_file() and os.access(local_bin, os.X_OK):
        return local_bin

    # Kiểm tra trong PATH hệ thống
    which_path = shutil.which("pngquant")
    if which_path:
        return Path(which_path)
    return None


def _atomic_write(target_path: Path, data: bytes) -> None:
    """Ghi đè file một cách an toàn (atomic) thông qua file tạm."""
    target_path.parent.mkdir(parents=True, exist_ok=True)
    temp_dir = target_path.parent
    with tempfile.NamedTemporaryFile(
        dir=temp_dir, delete=False, suffix=".tmp"
    ) as temp_file:
        temp_path = Path(temp_file.name)
        temp_file.write(data)
        temp_file.flush()
        os.fsync(temp_file.fileno())

    temp_path.replace(target_path)


def _backup_image(img_path: Path, backup_root: Path) -> Path:
    """Sao lưu file ảnh gốc trước khi nén, bảo toàn cấu trúc thư mục."""
    rel_path = img_path.relative_to(DATA_DIR)
    backup_dest = backup_root / rel_path
    backup_dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(img_path, backup_dest)
    return backup_dest


def _compress_png_with_pngquant(png_bytes: bytes, pngquant_bin: Path) -> bytes | None:
    """Nén thêm dữ liệu PNG bằng công cụ pngquant nếu có."""
    try:
        proc = subprocess.run(
            [str(pngquant_bin), "--quality=65-85", "--speed=1", "-"],
            input=png_bytes,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if proc.returncode == 0 and proc.stdout:
            return proc.stdout
    except Exception:
        pass
    return None


def compress_single_image(
    img_path: Path,
    max_dim: int = 1440,
    quality: int = 82,
    to_webp: bool = False,
    pngquant_bin: Path | None = None,
) -> tuple[bytes, str, tuple[int, int], tuple[int, int]]:
    """Xử lý và nén một file ảnh đơn lẻ.

    Returns:
        tuple (compressed_bytes, output_extension, (orig_w, orig_h), (new_w, new_h))
    """
    with Image.open(img_path) as im:
        real_fmt = im.format or "PNG"
        orig_w, orig_h = im.size
        ext = img_path.suffix.lower()

        # 1. Smart Downscale: Thu nhỏ ảnh 2K/4K nếu vượt ngưỡng max_dim
        if max_dim > 0 and max(orig_w, orig_h) > max_dim:
            ratio = max_dim / max(orig_w, orig_h)
            new_w = max(1, int(round(orig_w * ratio)))
            new_h = max(1, int(round(orig_h * ratio)))
            im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            new_w, new_h = orig_w, orig_h

        buf = io.BytesIO()

        # 2. Xử lý xuất ra định dạng WebP nếu có cờ --to-webp
        if to_webp:
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "transparency" in im.info else "RGB")
            im.save(buf, format="WEBP", quality=quality, method=6)
            return buf.getvalue(), ".webp", (orig_w, orig_h), (new_w, new_h)

        # 3. Nén in-place theo định dạng gốc
        # Kiểm tra file là JPEG (kể cả trường hợp file ruột JPEG nhưng đuôi .png)
        is_jpeg = real_fmt == "JPEG" or ext in (".jpg", ".jpeg")

        if is_jpeg:
            # Xử lý các mode màu đặc biệt sang RGB nền trắng trước khi nén JPEG
            if im.mode in ("RGBA", "LA", "P"):
                bg = Image.new("RGB", im.size, (255, 255, 255))
                if im.mode == "P":
                    im = im.convert("RGBA")
                if "A" in im.mode:
                    bg.paste(im, mask=im.split()[-1])
                else:
                    bg.paste(im)
                im = bg
            elif im.mode != "RGB":
                im = im.convert("RGB")

            im.save(
                buf,
                format="JPEG",
                quality=quality,
                optimize=True,
                progressive=True,
            )
            return buf.getvalue(), ext, (orig_w, orig_h), (new_w, new_h)

        # Xử lý định dạng PNG
        if real_fmt == "PNG" or ext == ".png":
            # Color Quantization: Chuyển sang bảng màu 256 màu (8-bit)
            if im.mode in ("RGBA", "LA"):
                # FastOctree bảo toàn kênh alpha tốt nhất cho ảnh có độ trong suốt
                im_q = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
            elif im.mode == "P":
                im_q = im
            else:
                im_rgb = im.convert("RGB")
                im_q = im_rgb.quantize(colors=256, method=Image.Quantize.FASTOCTREE)

            im_q.save(buf, format="PNG", optimize=True)
            result_bytes = buf.getvalue()

            # Nếu có pngquant, thử nén thêm một bước nữa
            if pngquant_bin:
                quant_bytes = _compress_png_with_pngquant(result_bytes, pngquant_bin)
                if quant_bytes and len(quant_bytes) < len(result_bytes):
                    result_bytes = quant_bytes

            return result_bytes, ext, (orig_w, orig_h), (new_w, new_h)

        # Xử lý WebP đã có sẵn
        if real_fmt == "WEBP" or ext == ".webp":
            im.save(buf, format="WEBP", quality=quality, method=6)
            return buf.getvalue(), ext, (orig_w, orig_h), (new_w, new_h)

        # Các định dạng khác (GIF, BMP, TIFF)
        im.save(buf, format=real_fmt, optimize=True)
        return buf.getvalue(), ext, (orig_w, orig_h), (new_w, new_h)


def update_markdown_references(old_img_path: Path, new_img_path: Path) -> int:
    """Cập nhật các liên kết trích dẫn ảnh trong file Markdown của môn học."""
    updated_files = 0
    old_filename = old_img_path.name
    new_filename = new_img_path.name

    # Định vị thư mục môn học sở hữu ảnh để tránh thay thế nhầm môn học khác
    subject_dir = old_img_path.parent
    while subject_dir.parent != DATA_DIR and subject_dir != DATA_DIR:
        subject_dir = subject_dir.parent

    search_dir = subject_dir if subject_dir != DATA_DIR else DATA_DIR

    for md_path in search_dir.rglob("*.md"):
        if not md_path.is_file():
            continue
        try:
            content = md_path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        if old_filename not in content:
            continue

        # Thay thế tên file cũ bằng tên file mới trong nội dung
        new_content = content.replace(old_filename, new_filename)
        if new_content != content:
            try:
                _atomic_write(md_path, new_content.encode("utf-8"))
                updated_files += 1
            except Exception as e:
                print(f"  [Lỗi cập nhật Markdown] {md_path}: {e}")

    return updated_files


def run_compression(
    apply_changes: bool = False,
    backup: bool = False,
    target_subject: str | None = None,
    max_dim: int = 1440,
    quality: int = 82,
    min_size_kb: int = 20,
    verbose: bool = False,
    include_test_scratch: bool = False,
    to_webp: bool = False,
) -> None:
    """Quét và thực thi tối ưu hóa ảnh toàn bộ hoặc theo môn học."""
    if not DATA_DIR.is_dir():
        print(f"Thư mục data không tồn tại: {DATA_DIR}")
        return

    pngquant_bin = _find_pngquant()
    backup_root = WORKSPACE_ROOT / ".backup_images"

    ignored_dirs = set() if include_test_scratch else {"scratch", "test", ".agents"}

    print("=" * 88)
    print("🚀 EDUQUEST - CÔNG CỤ TỐI ƯU HÓA & GIẢM DUNG LƯỢNG ẢNH")
    print("=" * 88)
    print(f"  - Thư mục làm việc : {DATA_DIR}")
    print(
        f"  - Chế độ thực thi  : {'⚡ THỰC SỰ ÁP DỤNG (--apply)' if apply_changes else '🔍 DRY-RUN (Chỉ kiểm tra, không sửa file)'}"
    )
    print(
        f"  - Sao lưu ảnh gốc  : {'✅ Có (.backup_images/)' if (backup and apply_changes) else '❌ Không'}"
    )
    print(f"  - Cạnh tối đa (px) : {max_dim if max_dim > 0 else 'Tắt (không resize)'}")
    print(f"  - Chất lượng nén   : {quality}/100")
    print(f"  - Bỏ qua ảnh dưới  : {min_size_kb} KB")
    print(
        f"  - Định dạng đích   : {'WebP (.webp)' if to_webp else 'In-place (giữ nguyên định dạng gốc)'}"
    )
    print(
        f"  - Engine pngquant  : {'✅ ' + str(pngquant_bin) if pngquant_bin else '⚡ Sử dụng Pillow Native'}"
    )
    print("-" * 88)

    subjects = sorted(
        [d for d in DATA_DIR.iterdir() if d.is_dir() and d.name not in ignored_dirs],
        key=lambda p: p.name.lower(),
    )

    if target_subject:
        subjects = [s for s in subjects if s.name.lower() == target_subject.lower()]
        if not subjects:
            print(f"❌ Không tìm thấy thư mục môn học: '{target_subject}'")
            return

    min_size_bytes = min_size_kb * 1024

    total_images_scanned = 0
    total_images_optimized = 0
    total_orig_bytes = 0
    total_new_bytes = 0

    col_w_subj = 34
    header = (
        f"{'Môn học':<{col_w_subj}} | {'Tổng ảnh':<9} | {'Tối ưu':<8} | "
        f"{'Kích thước cũ':<14} | {'Kích thước mới':<14} | {'Tiết kiệm':<16}"
    )
    sep = "-" * len(header)
    print(f"\n{header}")
    print(sep)

    all_detailed_logs: list[str] = []

    for subj in subjects:
        # Tìm tất cả file ảnh trong môn học
        img_files: list[Path] = []
        for ext in SUPPORTED_EXTENSIONS:
            img_files.extend(subj.rglob(f"*{ext}"))
            img_files.extend(subj.rglob(f"*{ext.upper()}"))
        img_files = sorted(list(set(img_files)), key=lambda p: p.name.lower())

        subj_orig_bytes = 0
        subj_new_bytes = 0
        subj_opt_count = 0

        for img_path in img_files:
            if not img_path.is_file():
                continue

            orig_size = img_path.stat().st_size
            subj_orig_bytes += orig_size
            total_images_scanned += 1

            # Bỏ qua ảnh quá nhỏ
            if orig_size < min_size_bytes:
                subj_new_bytes += orig_size
                continue

            try:
                comp_bytes, new_ext, orig_dims, new_dims = compress_single_image(
                    img_path=img_path,
                    max_dim=max_dim,
                    quality=quality,
                    to_webp=to_webp,
                    pngquant_bin=pngquant_bin,
                )
            except Exception as e:
                subj_new_bytes += orig_size
                if verbose:
                    all_detailed_logs.append(f"  ❌ Lỗi đọc ảnh {img_path.name}: {e}")
                continue

            new_size = len(comp_bytes)

            # Quy tắc an toàn: Chỉ chấp nhận nếu kích thước mới thực sự nhỏ hơn kích thước cũ
            if new_size < orig_size:
                saved_bytes = orig_size - new_size
                pct = (saved_bytes / orig_size) * 100
                subj_new_bytes += new_size
                subj_opt_count += 1
                total_images_optimized += 1

                rel_str = str(img_path.relative_to(DATA_DIR))
                dim_info = (
                    f"{orig_dims[0]}x{orig_dims[1]} -> {new_dims[0]}x{new_dims[1]}"
                    if orig_dims != new_dims
                    else f"{orig_dims[0]}x{orig_dims[1]}"
                )
                all_detailed_logs.append(
                    f"  ✅ {rel_str:<50} | {_format_size(orig_size):>9} -> "
                    f"{_format_size(new_size):>9} (-{pct:4.1f}%) | {dim_info}"
                )

                # Thực hiện ghi nếu có cờ --apply
                if apply_changes:
                    if backup:
                        _backup_image(img_path, backup_root)

                    if to_webp and new_ext != img_path.suffix.lower():
                        new_target_path = img_path.with_suffix(".webp")
                        _atomic_write(new_target_path, comp_bytes)
                        # Cập nhật link Markdown và xóa file cũ
                        update_markdown_references(img_path, new_target_path)
                        img_path.unlink()
                    else:
                        _atomic_write(img_path, comp_bytes)
            else:
                subj_new_bytes += orig_size

        total_orig_bytes += subj_orig_bytes
        total_new_bytes += subj_new_bytes

        subj_saved = subj_orig_bytes - subj_new_bytes
        subj_pct = (subj_saved / subj_orig_bytes * 100) if subj_orig_bytes > 0 else 0.0
        saving_str = (
            f"-{_format_size(subj_saved)} (-{subj_pct:.1f}%)"
            if subj_saved > 0
            else "Đã tối ưu"
        )

        subj_name_display = (
            (subj.name[: col_w_subj - 3] + "...")
            if len(subj.name) > col_w_subj
            else subj.name
        )

        print(
            f"{subj_name_display:<{col_w_subj}} | "
            f"{len(img_files):<9} | "
            f"{subj_opt_count:<8} | "
            f"{_format_size(subj_orig_bytes):<14} | "
            f"{_format_size(subj_new_bytes):<14} | "
            f"{saving_str:<16}"
        )

    print(sep)
    total_saved = total_orig_bytes - total_new_bytes
    total_pct = (total_saved / total_orig_bytes * 100) if total_orig_bytes > 0 else 0.0
    total_saving_str = f"-{_format_size(total_saved)} (-{total_pct:.1f}%)"
    total_label = f"TỔNG CỘNG ({len(subjects)} môn học)"
    print(
        f"{total_label:<{col_w_subj}} | "
        f"{total_images_scanned:<9} | "
        f"{total_images_optimized:<8} | "
        f"{_format_size(total_orig_bytes):<14} | "
        f"{_format_size(total_new_bytes):<14} | "
        f"{total_saving_str:<16}\n"
    )

    if verbose and all_detailed_logs:
        print("📋 CHI TIẾT TỪNG FILE ĐƯỢC TỐI ƯU HÓA:")
        for log in all_detailed_logs:
            print(log)
        print()

    if not apply_changes:
        print("💡 Lưu ý: Đây là chế độ kiểm tra xem trước (dry-run, chưa ghi đè).")
        print(
            "  - Để nén thật sự in-place:       python backend/scripts/compress_images.py --apply"
        )
        print(
            "  - Để nén kèm sao lưu an toàn:   python backend/scripts/compress_images.py --apply --backup"
        )
        print(
            "  - Để xem danh sách từng file:   python backend/scripts/compress_images.py --verbose"
        )
        print(
            '  - Để nén chỉ 1 môn học:         python backend/scripts/compress_images.py --apply --subject "Mạng máy tính"'
        )
    else:
        print(
            f"🎉 ĐÃ HOÀN TẤT NÉN! Tiết kiệm thành công {_format_size(total_saved)} ({total_pct:.1f}%)."
        )
        if backup:
            print(f"📁 Bản sao lưu ảnh gốc đã được lưu tại: {backup_root}")


def run_single_file_test(
    image_path_str: str,
    max_dim: int = 1440,
    quality: int = 82,
) -> None:
    """Nén thử nghiệm 1 ảnh mẫu và sinh đồng thời 2 file vào backend/scripts/test/.

    - File 1: Nén theo định dạng gốc (PNG/JPG...) với color quantization / optimize.
    - File 2: Nén chuyển đổi sang định dạng WebP.
    """
    raw_path = Path(image_path_str)
    candidate_paths = [
        raw_path,
        WORKSPACE_ROOT / raw_path,
        DATA_DIR / raw_path,
        Path.cwd() / raw_path,
    ]

    target_file: Path | None = None
    for p in candidate_paths:
        if p.is_file():
            target_file = p.resolve()
            break

    if not target_file:
        print(f"❌ Không tìm thấy file ảnh: '{image_path_str}'")
        print(
            "  Gợi ý: Hãy nhập đường dẫn tương đối (ví dụ: data/test/note/img/arrow.png)"
            " hoặc đường dẫn tuyệt đối."
        )
        return

    test_out_dir = SCRIPTS_DIR / "test"
    test_out_dir.mkdir(parents=True, exist_ok=True)
    pngquant_bin = _find_pngquant()

    orig_size = target_file.stat().st_size

    print("=" * 88)
    print("🧪 EDUQUEST - CHẾ ĐỘ THỬ NGHIỆM NÉN ẢNH (SINGLE FILE TEST)")
    print("=" * 88)
    print(f"  - File gốc         : {target_file}")
    print(f"  - Dung lượng gốc   : {_format_size(orig_size)} ({orig_size:,} bytes)")
    print(f"  - Thư mục xuất file: {test_out_dir}")
    print(f"  - Cạnh tối đa (px) : {max_dim if max_dim > 0 else 'Tắt (không resize)'}")
    print(f"  - Chất lượng nén   : {quality}/100")
    print(
        f"  - Engine pngquant  : "
        f"{'✅ ' + str(pngquant_bin) if pngquant_bin else '⚡ Sử dụng Pillow Native'}"
    )
    print("-" * 88)

    # 1. Nén File 1: Giữ nguyên định dạng gốc
    comp1_bytes, out1_ext, orig_dims, dims1 = compress_single_image(
        img_path=target_file,
        max_dim=max_dim,
        quality=quality,
        to_webp=False,
        pngquant_bin=pngquant_bin,
    )
    file1_name = f"{target_file.stem}_compressed{out1_ext}"
    file1_path = test_out_dir / file1_name
    _atomic_write(file1_path, comp1_bytes)
    size1 = len(comp1_bytes)
    saved1 = orig_size - size1
    pct1 = (saved1 / orig_size) * 100

    # 2. Nén File 2: Chuyển sang WebP
    comp2_bytes, _, _, dims2 = compress_single_image(
        img_path=target_file,
        max_dim=max_dim,
        quality=quality,
        to_webp=True,
        pngquant_bin=pngquant_bin,
    )
    file2_name = f"{target_file.stem}_compressed.webp"
    file2_path = test_out_dir / file2_name
    _atomic_write(file2_path, comp2_bytes)
    size2 = len(comp2_bytes)
    saved2 = orig_size - size2
    pct2 = (saved2 / orig_size) * 100

    print(f"Độ phân giải gốc: {orig_dims[0]} x {orig_dims[1]} px\n")

    print(f"1️⃣  FILE 1 (Nén giữ nguyên định dạng {out1_ext}):")
    print(f"   - Tên file    : {file1_name}")
    print(f"   - Đường dẫn   : {file1_path}")
    print(f"   - Độ phân giải: {dims1[0]} x {dims1[1]} px")
    print(f"   - Dung lượng  : {_format_size(size1)} ({size1:,} bytes)")
    print(f"   - Tiết kiệm   : -{_format_size(saved1)} (-{pct1:.1f}%)\n")

    print(f"2️⃣  FILE 2 (Nén chuyển đổi sang .webp):")
    print(f"   - Tên file    : {file2_name}")
    print(f"   - Đường dẫn   : {file2_path}")
    print(f"   - Độ phân giải: {dims2[0]} x {dims2[1]} px")
    print(f"   - Dung lượng  : {_format_size(size2)} ({size2:,} bytes)")
    print(f"   - Tiết kiệm   : -{_format_size(saved2)} (-{pct2:.1f}%)\n")

    print("=" * 88)
    print("✨ Bạn hãy mở thư mục sau để xem và so sánh chất lượng thực tế của 2 file:")
    print(f"   👉 {test_out_dir}")
    print("=" * 88)


def main() -> None:
    """Hàm khởi chạy chính của script."""
    parser = argparse.ArgumentParser(
        description="EduQuest - Công cụ nén và tối ưu hóa dung lượng ảnh thông minh"
    )
    parser.add_argument(
        "--test",
        "-t",
        type=str,
        default=None,
        metavar="IMAGE_PATH",
        help="Chế độ thử nghiệm: nén 1 ảnh mẫu ra 2 file (định dạng gốc & WebP) vào scripts/test/",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Thực sự ghi đè nén ảnh (mặc định là dry-run xem trước)",
    )
    parser.add_argument(
        "--backup",
        action="store_true",
        help="Tự động sao lưu ảnh gốc vào thư mục .backup_images/ trước khi nén",
    )
    parser.add_argument(
        "--subject",
        "-s",
        type=str,
        default=None,
        help="Chỉ quét và nén trong 1 môn học cụ thể (ví dụ: 'Mạng máy tính')",
    )
    parser.add_argument(
        "--max-dim",
        type=int,
        default=1440,
        help="Kích thước cạnh tối đa theo pixel (mặc định: 1440). Đặt 0 để tắt resize.",
    )
    parser.add_argument(
        "--quality",
        "-q",
        type=int,
        default=82,
        help="Chất lượng nén cho JPEG và WebP từ 1-100 (mặc định: 82)",
    )
    parser.add_argument(
        "--min-size-kb",
        type=int,
        default=20,
        help="Bỏ qua các ảnh có dung lượng nhỏ hơn X KB (mặc định: 20 KB)",
    )
    parser.add_argument(
        "--to-webp",
        action="store_true",
        help="Chuyển đổi ảnh sang WebP và tự động cập nhật liên kết trong file .md",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Hiển thị chi tiết từng file ảnh được nén",
    )
    parser.add_argument(
        "--include-test-scratch",
        action="store_true",
        help="Quét cả thư mục test và scratch",
    )

    args = parser.parse_args()

    # Nếu truyền cờ --test: chỉ chạy thử nghiệm 1 file duy nhất
    if args.test:
        run_single_file_test(
            image_path_str=args.test,
            max_dim=args.max_dim,
            quality=args.quality,
        )
        return

    run_compression(
        apply_changes=args.apply,
        backup=args.backup,
        target_subject=args.subject,
        max_dim=args.max_dim,
        quality=args.quality,
        min_size_kb=args.min_size_kb,
        verbose=args.verbose,
        include_test_scratch=args.include_test_scratch,
        to_webp=args.to_webp,
    )


if __name__ == "__main__":
    main()
