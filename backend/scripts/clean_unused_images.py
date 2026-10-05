#!/usr/bin/env python3
"""EduQuest Unused Image Audit and Cleanup Utility.

Scans all Markdown examination and note files in the `data/` directory to identify
and optionally delete orphaned image files that are no longer referenced.

Why this script exists:
  During question editing, syllabus updates, or exam authoring, images frequently
  get replaced or deleted in Markdown files (`.md`), leaving behind unused binary
  image files in the `img/` folders. Over time, these orphaned assets consume disk
  space and clutter backup archives. This utility parses Markdown and HTML syntax
  to verify image references across subjects.

Detection Mechanism:
  1. Parses Markdown image syntax: `![alt](path/to/image.png)`
  2. Parses HTML `<img>` tag syntax: `<img src="path/to/image.png" ...>`
  3. Parses Markdown link syntax pointing to images: `[description](path/to/image.png)`
  4. Resolves relative paths against the `.md` parent folder and `/data/` root paths.
  5. URL-decodes and cleans query strings, anchor hashes, and title attributes.
  6. Compares actual files on disk against the set of referenced paths per subject.

Usage & Examples:
  - Default execution is a read-only dry-run that reports statistics:
      python backend/scripts/clean_unused_images.py
  - To display only subjects containing images (hiding 0-image subjects):
      python backend/scripts/clean_unused_images.py --only-with-images
  - To display only subjects that have orphaned images:
      python backend/scripts/clean_unused_images.py --only-unused
  - To inspect the list of specific orphaned image paths before acting:
      python backend/scripts/clean_unused_images.py --verbose
  - To permanently delete all unreferenced images (CAUTION: permanent deletion):
      python backend/scripts/clean_unused_images.py --delete
  - When running in test environments, include test folders:
      python backend/scripts/clean_unused_images.py --include-test-scratch
"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.parse
from pathlib import Path

# Đảm bảo in tiếng Việt trên console Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_DIR = WORKSPACE_ROOT / "data"

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}

# Regex bắt ảnh cú pháp Markdown ![alt](<src "title">), HTML <img src="...">,
# và liên kết Markdown tới file ảnh [alt](src)
MD_IMG_PATTERN = re.compile(r"!\[.*?\]\s*\((.*?)\)")
HTML_IMG_PATTERN = re.compile(
    r"<img\s+[^>]*src=[\"']?(.*?)(?:[\"']|\s|>)", re.IGNORECASE
)
MD_LINK_PATTERN = re.compile(r"\[.*?\]\s*\((.*?)\)")


def _clean_url_token(raw_match: str) -> str:
    """Tách URL sạch, loại bỏ title, query params, hash và url-decode."""
    tokens = raw_match.strip().split()
    if not tokens:
        return ""
    # Lấy token đầu tiên (loại bỏ "title" phía sau nếu có)
    token = tokens[0].split("?")[0].split("#")[0].strip("\"'")
    return urllib.parse.unquote(token).strip()


def _format_size(size_bytes: int) -> str:
    """Định dạng dung lượng byte sang KB hoặc MB dễ đọc."""
    if size_bytes <= 0:
        return "0 KB"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.2f} MB"


def extract_referenced_images(md_file: Path) -> set[Path]:
    """Trích xuất tất cả đường dẫn Path tuyệt đối của ảnh được tham chiếu."""
    referenced: set[Path] = set()
    try:
        content = md_file.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        print(f"  [Lỗi đọc file] {md_file}: {e}")
        return referenced

    raw_matches = MD_IMG_PATTERN.findall(content) + HTML_IMG_PATTERN.findall(content)

    # Bổ sung các liên kết dạng [link text](path/to/image.png)
    for link_match in MD_LINK_PATTERN.findall(content):
        cleaned = _clean_url_token(link_match)
        if any(cleaned.lower().endswith(ext) for ext in IMAGE_EXTENSIONS):
            raw_matches.append(link_match)

    for match in raw_matches:
        cleaned = _clean_url_token(match)
        if not cleaned or cleaned.startswith(("http://", "https://", "data:")):
            continue

        # Xử lý đường dẫn tuyệt đối /data/..., data/... hoặc tương đối so với file .md
        normalized = cleaned.replace("\\", "/")
        if normalized.startswith("/data/"):
            rel_path = normalized[len("/data/") :].lstrip("/")
            target = (DATA_DIR / rel_path).resolve()
        elif normalized.startswith("data/"):
            rel_path = normalized[len("data/") :].lstrip("/")
            target = (DATA_DIR / rel_path).resolve()
        else:
            target = (md_file.parent / cleaned).resolve()

        referenced.add(target)

    return referenced


def scan_images(
    include_test_scratch: bool = False,
    do_delete: bool = False,
    verbose: bool = False,
    only_with_images: bool = False,
    only_unused: bool = False,
) -> None:
    """Quét ảnh và thống kê / xóa các ảnh thừa không được tham chiếu.

    Chỉ tính các thư mục cấp 1 trực tiếp trong data/ (mỗi thư mục tương ứng
    với một môn học như Viettel, Giải tích 3, Nhập môn an toàn thông tin...).
    """
    if not DATA_DIR.is_dir():
        print(f"Thư mục data không tồn tại: {DATA_DIR}")
        return

    ignored_dirs = set() if include_test_scratch else {"scratch", "test", ".agents"}

    # 1. Thu thập tất cả ảnh được tham chiếu theo Path thực tế
    referenced_paths: set[Path] = set()
    md_count = 0

    for md_path in DATA_DIR.rglob("*.md"):
        if not md_path.is_file():
            continue
        if any(ig in md_path.parts for ig in ignored_dirs):
            continue
        md_count += 1
        referenced_paths.update(extract_referenced_images(md_path))

    # 2. Thống kê theo từng thư mục cấp 1 (Môn học)
    subjects = sorted(
        [d for d in DATA_DIR.iterdir() if d.is_dir() and d.name not in ignored_dirs],
        key=lambda x: x.name.lower(),
    )

    total_images_all = 0
    total_used_all = 0
    total_unused_all = 0
    total_size_bytes_all = 0
    total_unused_size_bytes = 0
    all_unused_files: list[Path] = []
    subjects_with_images = 0
    subjects_with_unused = 0

    header = (
        f"{'Thư mục cấp 1 (Môn học)':<36} | {'Tổng ảnh':<9} | "
        f"{'Tổng dung lượng':<16} | {'Được dùng':<10} | "
        f"{'Ảnh thừa':<9} | {'Dung lượng thừa':<16} | {'Trạng thái'}"
    )
    sep = "-" * 122

    print("=== BÁO CÁO QUÉT ẢNH THEO THƯ MỤC CẤP 1 TRONG DATA ===")
    print(f"- Tổng số thư mục cấp 1: {len(subjects)}")
    print(f"- Tổng số file Markdown đã quét: {md_count}")
    print(f"- Tổng số ảnh hợp lệ được tham chiếu: {len(referenced_paths)}\n")
    print(header)
    print(sep)

    for subj in subjects:
        images_in_subj = [
            p
            for p in subj.rglob("*")
            if p.is_file()
            and p.suffix.lower() in IMAGE_EXTENSIONS
            and not any(ig in p.parts for ig in ignored_dirs)
        ]

        used_in_subj = []
        unused_in_subj = []
        total_subj_size = 0
        unused_size = 0

        for img in images_in_subj:
            img_size = img.stat().st_size
            total_subj_size += img_size
            if img.resolve() in referenced_paths:
                used_in_subj.append(img)
            else:
                unused_in_subj.append(img)
                unused_size += img_size

        if images_in_subj:
            subjects_with_images += 1
        if unused_in_subj:
            subjects_with_unused += 1

        total_images_all += len(images_in_subj)
        total_used_all += len(used_in_subj)
        total_unused_all += len(unused_in_subj)
        total_size_bytes_all += total_subj_size
        total_unused_size_bytes += unused_size
        all_unused_files.extend(unused_in_subj)

        # Bộ lọc hiển thị nếu người dùng yêu cầu
        if only_with_images and not images_in_subj:
            continue
        if only_unused and not unused_in_subj:
            continue

        total_size_str = _format_size(total_subj_size)
        unused_size_str = _format_size(unused_size)
        status = f"⚠️ Có {len(unused_in_subj)} ảnh thừa" if unused_in_subj else "✅ Sạch"
        print(
            f"{subj.name:<36} | {len(images_in_subj):<9} | "
            f"{total_size_str:<16} | {len(used_in_subj):<10} | "
            f"{len(unused_in_subj):<9} | {unused_size_str:<16} | {status}"
        )

    print(sep)
    total_mb_str = _format_size(total_size_bytes_all)
    unused_mb_str = _format_size(total_unused_size_bytes)
    total_label = f"TỔNG CỘNG ({len(subjects)} thư mục)"
    total_status = (
        f"⚠️ {subjects_with_unused} thư mục có ảnh thừa"
        if subjects_with_unused > 0
        else "✅ Tất cả sạch"
    )
    print(
        f"{total_label:<36} | {total_images_all:<9} | "
        f"{total_mb_str:<16} | {total_used_all:<10} | "
        f"{total_unused_all:<9} | {unused_mb_str:<16} | {total_status}\n"
    )

    # 3. Hiển thị chi tiết nếu có flag --verbose
    if verbose and all_unused_files:
        print("📋 DANH SÁCH CHI TIẾT CÁC FILE ẢNH THỪA:")
        for idx, unused_path in enumerate(all_unused_files, 1):
            rel = unused_path.relative_to(DATA_DIR)
            size_kb = unused_path.stat().st_size / 1024
            print(f"  {idx:3d}. {rel} ({size_kb:.1f} KB)")
        print()

    # 4. Thực hiện xóa nếu có flag --delete
    if do_delete:
        if not all_unused_files:
            print("Không có ảnh thừa nào để xóa!")
            return
        print(f"Đang xóa {len(all_unused_files)} ảnh thừa...")
        deleted_count = 0
        for img in all_unused_files:
            try:
                img.unlink()
                deleted_count += 1
            except Exception as e:
                print(f"  [Lỗi không xóa được] {img}: {e}")
        print(
            f"✅ ĐÃ XÓA THÀNH CÔNG {deleted_count} ẢNH THỪA! "
            f"Giải phóng {unused_mb_str}."
        )
    else:
        if all_unused_files:
            print("💡 Lưu ý: Đây là chế độ kiểm tra (dry-run, chưa xóa gì).")
            print(
                "  - Xem chi tiết từng file thừa:  "
                "python backend/scripts/clean_unused_images.py --verbose"
            )
            print(
                "  - Chỉ hiện thư mục có ảnh:      "
                "python backend/scripts/clean_unused_images.py --only-with-images"
            )
            print(
                "  - Xóa thực sự các ảnh thừa:     "
                "python backend/scripts/clean_unused_images.py --delete"
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Quét và thống kê ảnh thừa theo từng thư mục cấp 1 trong EduQuest"
    )
    parser.add_argument(
        "--delete", action="store_true", help="Xóa thực sự các file ảnh thừa"
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Hiển thị danh sách chi tiết các file ảnh thừa",
    )
    parser.add_argument(
        "--only-with-images",
        action="store_true",
        help="Chỉ hiển thị các thư mục có chứa ảnh (ẩn các thư mục 0 ảnh)",
    )
    parser.add_argument(
        "--only-unused",
        action="store_true",
        help="Chỉ hiển thị các thư mục có ảnh thừa",
    )
    parser.add_argument(
        "--include-test-scratch",
        action="store_true",
        help="Quét cả thư mục test và scratch",
    )
    args = parser.parse_args()

    scan_images(
        include_test_scratch=args.include_test_scratch,
        do_delete=args.delete,
        verbose=args.verbose,
        only_with_images=args.only_with_images,
        only_unused=args.only_unused,
    )
