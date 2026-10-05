from __future__ import annotations

import json
from typing import Any

from src.config import BACKEND_DIR
from src.utils import write_json_atomic

AI_CONFIG_PATH = BACKEND_DIR / "config" / "ai_config.json"

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


def read_ai_config() -> dict[str, Any]:
    """Read the global AI configurations, migrating old schema if needed."""
    if not AI_CONFIG_PATH.is_file():
        # Auto-create the default configuration file
        try:
            write_json_atomic(AI_CONFIG_PATH, DEFAULT_AI_CONFIG)
        except Exception:
            pass
        return DEFAULT_AI_CONFIG.copy()

    try:
        text = AI_CONFIG_PATH.read_text(encoding="utf-8")
        if not text.strip():
            return DEFAULT_AI_CONFIG.copy()
        data = json.loads(text)
        if not isinstance(data, dict):
            return DEFAULT_AI_CONFIG.copy()

        # Check if we need to migrate from old single-profile schema
        if "profiles" not in data and ("aiApiKey" in data or "aiBaseUrl" in data or "aiModel" in data):
            migrated_profile = {
                "id": "default",
                "name": "Google Gemini (Migrated)",
                "aiApiKey": str(data.get("aiApiKey", "")).strip(),
                "aiBaseUrl": str(data.get("aiBaseUrl", "")).strip(),
                "aiModel": str(data.get("aiModel", "")).strip(),
            }
            migrated_config = {
                "enableAIGrading": bool(data.get("enableAIGrading", True)),
                "activeProfileId": "default",
                "profiles": [migrated_profile],
            }
            try:
                write_json_atomic(AI_CONFIG_PATH, migrated_config)
            except Exception:
                pass
            return migrated_config

        # Sanitize and ensure multi-profile keys exist
        resolved = {}
        resolved["enableAIGrading"] = bool(
            data.get("enableAIGrading", DEFAULT_AI_CONFIG["enableAIGrading"])
        )
        resolved["activeProfileId"] = data.get(
            "activeProfileId", DEFAULT_AI_CONFIG["activeProfileId"]
        )
        if resolved["activeProfileId"] is not None:
            resolved["activeProfileId"] = str(resolved["activeProfileId"])

        profiles_raw = data.get("profiles", [])
        resolved_profiles = []
        if isinstance(profiles_raw, list):
            for p in profiles_raw:
                if isinstance(p, dict) and "id" in p:
                    resolved_profiles.append({
                        "id": str(p["id"]),
                        "name": str(p.get("name", "Unnamed Profile")),
                        "aiApiKey": str(p.get("aiApiKey", "")).strip(),
                        "aiBaseUrl": str(p.get("aiBaseUrl", "")).strip(),
                        "aiModel": str(p.get("aiModel", "")).strip(),
                    })
        
        # If active profile is missing or profiles list is empty, default it
        if not resolved_profiles:
            resolved_profiles = DEFAULT_AI_CONFIG["profiles"].copy()
            resolved["activeProfileId"] = "default"

        resolved["profiles"] = resolved_profiles
        return resolved
    except Exception:
        return DEFAULT_AI_CONFIG.copy()


def write_ai_config(config: dict[str, Any]) -> None:
    """Save the multi-profile AI configurations atomically."""
    profiles_raw = config.get("profiles", [])
    cleaned_profiles = []
    if isinstance(profiles_raw, list):
        for p in profiles_raw:
            if isinstance(p, dict) and "id" in p:
                cleaned_profiles.append({
                    "id": str(p["id"]).strip(),
                    "name": str(p.get("name", "Unnamed Profile")).strip(),
                    "aiApiKey": str(p.get("aiApiKey", "")).strip(),
                    "aiBaseUrl": str(p.get("aiBaseUrl", "")).strip(),
                    "aiModel": str(p.get("aiModel", "")).strip(),
                })

    active_id = config.get("activeProfileId")
    if active_id is not None:
        active_id = str(active_id).strip()

    cleaned = {
        "enableAIGrading": bool(config.get("enableAIGrading", True)),
        "activeProfileId": active_id,
        "profiles": cleaned_profiles,
    }
    write_json_atomic(AI_CONFIG_PATH, cleaned)
