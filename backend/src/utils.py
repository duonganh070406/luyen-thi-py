from __future__ import annotations

import copy
import json
import os
import tempfile
import urllib.parse
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import HTTPException

from src.config import DATA_ROOT, UNITS_FILE
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


def history_path(subject_dir: Path) -> Path:
    """Returns path to the subject's history.json file."""
    return subject_dir / "history.json"


def _file_signature(path: Path) -> tuple[int, int]:
    """Return a lightweight file signature for cache invalidation."""
    stat = path.stat()
    return stat.st_mtime_ns, stat.st_size


@lru_cache(maxsize=128)
def _read_json_list_cached(
    path_str: str, mtime_ns: int, size: int
) -> list[Any]:
    path = Path(path_str)
    text = path.read_text(encoding="utf-8")
    if not text.strip():
        return []
    data = json.loads(text)
    if not isinstance(data, list):
        raise HTTPException(
            status_code=400, detail=f"Expected JSON array in {path.name}"
        )
    return data


def read_json_list(path: Path) -> list[Any]:
    """Read a JSON file and return its parsed list content safely."""
    if not path.is_file():
        return []
    try:
        signature = _file_signature(path)
        data = _read_json_list_cached(str(path), *signature)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid JSON in {path.name}: {e}"
        ) from e
    return copy.deepcopy(data)


def write_json_atomic(path: Path, payload: Any) -> None:
    """Write data to a JSON file atomically using a temporary file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(
        dir=path.parent,
        prefix=".history_",
        suffix=".tmp",
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        Path(tmp_name).replace(path)
    except Exception:
        try:
            Path(tmp_name).unlink(missing_ok=True)
        except OSError:
            pass
        raise


def config_path(subject_dir: Path) -> Path:
    """Returns path to the subject's subject_config.json file."""
    return subject_dir / "subject_config.json"


@lru_cache(maxsize=128)
def _read_subject_config_cached(
    path_str: str, mtime_ns: int, size: int
) -> dict[str, Any]:
    path = Path(path_str)
    text = path.read_text(encoding="utf-8")
    if not text.strip():
        return {}
    data = json.loads(text)
    if not isinstance(data, dict):
        return {}
    return data


def read_subject_config(subject_dir: Path) -> dict[str, Any]:
    """Read the subject_config.json, returning default dict if not exists or invalid."""
    path = config_path(subject_dir)
    defaults = {
        "active": True,
        "description": "",
        "other_information": "",
    }
    if not path.is_file():
        # Auto-create the default configuration file so the user can edit it manually
        try:
            write_json_atomic(path, defaults)
        except Exception:
            pass
        return defaults

    try:
        data = _read_subject_config_cached(str(path), *_file_signature(path))
        if not data:
            return defaults.copy()

        # Ensure all fields exist
        config = {}
        config["active"] = bool(data.get("active", defaults["active"]))
        config["description"] = str(
            data.get("description", defaults["description"])
        )
        config["other_information"] = str(
            data.get("other_information", defaults["other_information"])
        )
        return config
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

def units_path() -> Path:
    """Returns path to the units.json file."""
    return UNITS_FILE


def load_units() -> list[dict[str, Any]]:
    """Load all units from units.json."""
    if not UNITS_FILE.is_file():
        return []
    return read_json_list(UNITS_FILE)


def save_units(units: list[dict[str, Any]]) -> None:
    """Save units to units.json atomically."""
    write_json_atomic(UNITS_FILE, units)
