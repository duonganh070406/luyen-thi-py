"""Cau hinh global: AI + lien he, luu SQLite (bang settings + ai_profiles).

Du lieu ai_config.json / contact.json cu da duoc migrate vao DB luc khoi dong.
"""
from __future__ import annotations

from typing import Any

from src import db as store
from src.config import BACKEND_DIR

AI_CONFIG_PATH = BACKEND_DIR / "config" / "ai_config.json"  # giu de tham chieu duong dan cu

DEFAULT_AI_CONFIG = {
    "enableAIGrading": True,
    "activeProfileId": "default",
    "profiles": [
        {
            "id": "default",
            "name": "Google Gemini (Default)",
            "aiApiKey": "",
            "aiBaseUrl": "https://generativelanguage.googleapis.com/v1beta/openai/",
            "aiModel": "gemini-3.5-flash",
        }
    ],
}

store.init_db()


def read_ai_config() -> dict[str, Any]:
    """Doc cau hinh AI (sanitize + migrate schema cu nhu ban file truoc)."""
    with store.session() as conn:
        enable = store.setting_get(conn, "ai.enable_grading", "")
        active = store.setting_get(conn, "ai.active_profile", "")
        profiles = store.ai_profiles_all(conn)
    if enable == "" and active == "" and not profiles:
        return {
            "enableAIGrading": DEFAULT_AI_CONFIG["enableAIGrading"],
            "activeProfileId": DEFAULT_AI_CONFIG["activeProfileId"],
            "profiles": [dict(p) for p in DEFAULT_AI_CONFIG["profiles"]],
        }
    resolved: dict[str, Any] = {}
    resolved["enableAIGrading"] = enable != "0" if enable != "" else True
    resolved["activeProfileId"] = active or None
    cleaned = []
    for p in profiles:
        if isinstance(p, dict) and p.get("id"):
            cleaned.append(
                {
                    "id": str(p["id"]),
                    "name": str(p.get("name", "Unnamed Profile")),
                    "aiApiKey": str(p.get("aiApiKey", "")).strip(),
                    "aiBaseUrl": str(p.get("aiBaseUrl", "")).strip(),
                    "aiModel": str(p.get("aiModel", "")).strip(),
                }
            )
    if not cleaned:
        cleaned = [dict(p) for p in DEFAULT_AI_CONFIG["profiles"]]
        resolved["activeProfileId"] = "default"
    resolved["profiles"] = cleaned
    return resolved


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


def write_ai_config(config: dict[str, Any]) -> None:
    """Luu cau hinh AI multi-profile."""
    profiles_raw = config.get("profiles", [])
    cleaned_profiles = []
    if isinstance(profiles_raw, list):
        for p in profiles_raw:
            if isinstance(p, dict) and "id" in p:
                cleaned_profiles.append(
                    {
                        "id": str(p["id"]).strip(),
                        "name": str(p.get("name", "Unnamed Profile")).strip(),
                        "aiApiKey": str(p.get("aiApiKey", "")).strip(),
                        "aiBaseUrl": str(p.get("aiBaseUrl", "")).strip(),
                        "aiModel": str(p.get("aiModel", "")).strip(),
                    }
                )
    active_id = config.get("activeProfileId")
    if active_id is not None:
        active_id = str(active_id).strip()
    with store.session() as conn:
        store.setting_set(conn, "ai.enable_grading", "1" if config.get("enableAIGrading", True) else "0")
        store.setting_set(conn, "ai.active_profile", active_id or "")
        store.ai_profiles_replace(conn, cleaned_profiles)
