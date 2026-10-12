from __future__ import annotations

import copy
import urllib.parse
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import HTTPException

from src import db as store
from src.config import DATA_ROOT
from src.markdown_parser import _rewrite_image_urls, parse_md


def resolve_subject_dir(subject: str) -> Path:
    """Resolve and validate the subject directory path securely."""
    name = urllib.parse.unquote(subject).strip()
    if not name:
        raise HTTPException(status_code=404, detail="Subject not found")
    candidate = (DATA_ROOT / name).resolve()
    root = DATA_ROOT.resolve()
    try:
        candidate.relative_to(root)
    except ValueError:
        raise HTTPException(status_code=404, detail="Subject not found")
    if not candidate.is_dir():
        raise HTTPException(status_code=404, detail="Subject not found")
    return candidate


def get_exam_files(subject_dir: Path) -> list[str]:
    """Liệt kê các file .md trong thư mục markdown của môn học (hỗ trợ subfolder)."""
    md_dir = subject_dir / "markdown"
    if not md_dir.is_dir():
        return []
    files = [
        entry.relative_to(md_dir).as_posix()
        for entry in md_dir.rglob("*.md")
        if entry.is_file()
    ]
    return sorted(files, key=lambda s: s.lower())


def has_exam_files(subject_dir: Path) -> bool:
    """Kiểm tra nhanh xem môn học có ít nhất một file đề .md hay không."""
    md_dir = subject_dir / "markdown"
    if not md_dir.is_dir():
        return False
    return next(md_dir.rglob("*.md"), None) is not None


def get_note_files(subject_dir: Path) -> list[str]:
    """Liệt kê các file .md trong thư mục note của môn học (hỗ trợ subfolder)."""
    note_dir = subject_dir / "note"
    if not note_dir.is_dir():
        return []
    files = [
        entry.relative_to(note_dir).as_posix()
        for entry in note_dir.rglob("*.md")
        if entry.is_file()
    ]
    return sorted(files, key=lambda s: s.lower())


def _image_base_url(dir_path: Path) -> str:
    """
    Tính URL prefix để rewrite ảnh tương đối trong file .md thành đường dẫn
    tuyệt đối phục vụ bởi static mount /data/.

    Ví dụ: dir_path = .../data/Mạng máy tính/markdown
             → returns '/data/Mạng%20máy%20t%C3%ADnh/markdown'
    """
    try:
        rel = dir_path.resolve().relative_to(DATA_ROOT.resolve())
        parts = [urllib.parse.quote(p, safe="") for p in rel.parts]
        return "/data/" + "/".join(parts)
    except ValueError:
        return ""


def _file_signature(path: Path) -> tuple[int, int]:
    """Return a lightweight file signature for cache invalidation."""
    stat = path.stat()
    return stat.st_mtime_ns, stat.st_size


def read_subject_config(subject_dir: Path) -> dict[str, Any]:
    """Read subject config tu SQLite (DB la nguon chinh; JSON cu da migrate)."""
    defaults = {
        "active": True,
        "description": "",
        "other_information": "",
    }
    try:
        with store.session() as conn:
            cfg = store.subject_get(conn, subject_dir.name)
        if cfg is None:
            # mon co thu muc nhung chua co dong DB (VD them tay): tao mac dinh
            try:
                with store.session() as conn:
                    store.subject_ensure(conn, subject_dir.name)
            except Exception:
                pass
            return defaults.copy()
        return {
            "active": bool(cfg.get("active", True)),
            "description": str(cfg.get("description", "")),
            "other_information": str(cfg.get("other_information", "")),
        }
    except Exception:
        return defaults.copy()


@lru_cache(maxsize=128)
def _parse_exam_cached(
    path_str: str, image_base_url: str, mtime_ns: int, size: int
) -> list[Any]:
    return parse_md(path_str, image_base_url=image_base_url)


def parse_exam_file(path: Path, image_base_url: str = "") -> list[Any]:
    """Parse markdown exam content with automatic cache invalidation on file changes."""
    signature = _file_signature(path)
    return copy.deepcopy(_parse_exam_cached(str(path), image_base_url, *signature))


@lru_cache(maxsize=128)
def _read_note_content_cached(
    path_str: str, image_base_url: str, mtime_ns: int, size: int
) -> str:
    content = Path(path_str).read_text(encoding="utf-8")
    if image_base_url:
        content = _rewrite_image_urls(content, image_base_url)
    return content


def read_note_content(path: Path, image_base_url: str = "") -> str:
    """Read markdown note content with automatic cache invalidation on file changes."""
    signature = _file_signature(path)
    return _read_note_content_cached(str(path), image_base_url, *signature)


# ---------- Units (Phòng ban/Khoa) ----------

def load_units() -> list[dict[str, Any]]:
    """Load all units tu SQLite (JSON cu da migrate)."""
    try:
        with store.session() as conn:
            return store.units_all(conn)
    except Exception:
        return []


def save_units(units: list[dict[str, Any]]) -> None:
    """Ghi de danh sach units (giu tuong thich ham cu)."""
    try:
        with store.transaction() as conn:
            conn.execute("DELETE FROM units")
            seen: set[str] = set()
            for u in units or []:
                name = str((u or {}).get("name", "")).strip() if isinstance(u, dict) else ""
                if name and name.lower() not in seen:
                    seen.add(name.lower())
                    conn.execute("INSERT OR IGNORE INTO units(name) VALUES(?)", (name,))
    except Exception:
        pass
