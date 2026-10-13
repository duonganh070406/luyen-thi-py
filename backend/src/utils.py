from __future__ import annotations

import copy
import hashlib
import urllib.parse
from functools import lru_cache
from typing import Any

from fastapi import HTTPException

from src import db as store
from src.config import DATA_ROOT
from src.markdown_parser import _rewrite_image_urls, parse_md_content


def require_subject(subject: str) -> str:
    """Kiem tra mon co trong DB (nguon chinh). Tra ve ten chuan, 404 neu thieu."""
    name = urllib.parse.unquote(subject or "").strip()
    if not name:
        raise HTTPException(status_code=404, detail="Subject not found")
    try:
        with store.session() as conn:
            cfg = store.subject_get(conn, name)
    except Exception:
        cfg = None
    if cfg is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    return str(cfg.get("name") or name)


def subject_image_base(subject: str) -> str:
    """URL prefix cho anh minh hoa cua mon (quy uoc data/assets/<mon>/).

    De/notes luu trong DB co the tham chieu anh tuong doi (vd img/a.png);
    neu thu muc assets ton tai thi rewrite thanh /data/assets/...,
    nguoc lai tra ve "" (giua nguyen duong dan goc).
    """
    try:
        assets = (DATA_ROOT / "assets" / subject).resolve()
        root = DATA_ROOT.resolve()
        assets.relative_to(root)
        if assets.is_dir():
            parts = [urllib.parse.quote(p, safe="") for p in assets.relative_to(root).parts]
            return "/data/" + "/".join(parts)
    except Exception:
        pass
    return ""


@lru_cache(maxsize=128)
def _parse_exam_content_cached(
    subject: str, name: str, digest: str, content: str, image_base_url: str
) -> list[Any]:
    return parse_md_content(content, image_base_url=image_base_url)


def parse_exam_content(
    subject: str, name: str, content: str, image_base_url: str = ""
) -> list[Any]:
    """Parse noi dung markdown de thi tu DB (cache theo hash noi dung)."""
    digest = hashlib.sha1((content or "").encode("utf-8")).hexdigest()
    return copy.deepcopy(
        _parse_exam_content_cached(subject, name, digest, content, image_base_url)
    )


def note_content(content: str, image_base_url: str = "") -> str:
    """Rewrite URL anh trong noi dung ghi chu tu DB."""
    if image_base_url:
        return _rewrite_image_urls(content or "", image_base_url)
    return content or ""


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
