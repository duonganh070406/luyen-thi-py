from __future__ import annotations

import urllib.parse
from typing import Any

from fastapi import HTTPException

from src import db as store


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
