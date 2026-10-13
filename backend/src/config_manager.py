"""Cau hinh global: lien he, luu SQLite (bang settings).

Du lieu contact.json cu da duoc migrate vao DB luc khoi dong.
"""
from __future__ import annotations

from typing import Any

from src import db as store

store.init_db()


DEFAULT_CONTACT = {
    "email": "hotro@a05.gov.vn",
    "phone": "0123 456 789",
}


def read_contact() -> dict[str, str]:
    """Doc thong tin lien he (public). Chua co -> tra mac dinh."""
    with store.session() as conn:
        email = store.setting_get(conn, "contact.email", "")
        phone = store.setting_get(conn, "contact.phone", "")
    return {
        "email": email.strip() or DEFAULT_CONTACT["email"],
        "phone": phone.strip() or DEFAULT_CONTACT["phone"],
    }


def write_contact(contact: dict[str, Any]) -> dict[str, str]:
    """Luu thong tin lien he (admin)."""
    cleaned = {
        "email": str(contact.get("email", "")).strip() or DEFAULT_CONTACT["email"],
        "phone": str(contact.get("phone", "")).strip() or DEFAULT_CONTACT["phone"],
    }
    with store.session() as conn:
        store.setting_set(conn, "contact.email", cleaned["email"])
        store.setting_set(conn, "contact.phone", cleaned["phone"])
    return cleaned
