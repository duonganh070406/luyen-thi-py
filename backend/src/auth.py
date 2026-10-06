"""Xac thuc don gian cho EduQuest: admin + user, token Bearer.

Luu tru flat-file de chay local khong can DB:
- DATA_ROOT/users.json   : [{username, password_hash, role, created_at}]
- DATA_ROOT/tokens.json  : {token: {username, role, created_at}}

Mat khau hash SHA256 + salt don gian. Du cho chay local.
"""
from __future__ import annotations

import hashlib
import json
import secrets
import time
from pathlib import Path
from typing import Any

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from src.config import DATA_ROOT

_SALT = "eduquest-local-salt-v1"
_bearer = HTTPBearer(auto_error=False)


def _users_path() -> Path:
    return DATA_ROOT / "users.json"


def _tokens_path() -> Path:
    return DATA_ROOT / "tokens.json"


def hash_password(password: str) -> str:
    return hashlib.sha256((_SALT + password).encode("utf-8")).hexdigest()


def _read_json(path: Path, default: Any) -> Any:
    if not path.is_file():
        return default
    try:
        text = path.read_text(encoding="utf-8")
        if not text.strip():
            return default
        return json.loads(text)
    except Exception:
        return default


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


def _ensure_seed_admin() -> None:
    users = _read_json(_users_path(), [])
    if not isinstance(users, list):
        users = []
    names = {u.get("username") for u in users if isinstance(u, dict)}
    if "admin" not in names:
        users.append(
            {
                "username": "admin",
                "password_hash": hash_password("admin123"),
                "role": "admin",
                "created_at": int(time.time()),
            }
        )
        _write_json(_users_path(), users)


def list_users() -> list[dict[str, Any]]:
    _ensure_seed_admin()
    users = _read_json(_users_path(), [])
    out = []
    for u in users:
        if isinstance(u, dict):
            out.append(
                {
                    "username": u.get("username", ""),
                    "role": u.get("role", "user"),
                    "created_at": u.get("created_at", 0),
                }
            )
    return out


def find_user(username: str) -> dict[str, Any] | None:
    _ensure_seed_admin()
    users = _read_json(_users_path(), [])
    name = (username or "").strip()
    for u in users:
        if isinstance(u, dict) and u.get("username") == name:
            return u
    return None


def create_user(username: str, password: str, role: str = "user") -> dict[str, Any]:
    _ensure_seed_admin()
    name = (username or "").strip()
    if not name or not password or len(password) < 3:
        raise ValueError("Ten dang nhap/mat khau khong hop le (mat khau >= 3 ky tu).")
    if role not in ("admin", "user"):
        role = "user"
    users = _read_json(_users_path(), [])
    for u in users:
        if isinstance(u, dict) and u.get("username") == name:
            raise ValueError("Ten dang nhap da ton tai.")
    users.append(
        {
            "username": name,
            "password_hash": hash_password(password),
            "role": role,
            "created_at": int(time.time()),
        }
    )
    _write_json(_users_path(), users)
    return {"username": name, "role": role}


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password or "") == (password_hash or "")


def issue_token(username: str, role: str) -> str:
    tokens = _read_json(_tokens_path(), {})
    if not isinstance(tokens, dict):
        tokens = {}
    token = secrets.token_urlsafe(32)
    tokens[token] = {"username": username, "role": role, "created_at": int(time.time())}
    _write_json(_tokens_path(), tokens)
    return token


def revoke_token(token: str) -> None:
    tokens = _read_json(_tokens_path(), {})
    if isinstance(tokens, dict) and token in tokens:
        del tokens[token]
        _write_json(_tokens_path(), tokens)


def lookup_token(token: str) -> dict[str, Any] | None:
    tokens = _read_json(_tokens_path(), {})
    if isinstance(tokens, dict):
        info = tokens.get(token)
        if isinstance(info, dict):
            return info
    return None


class AuthUser(BaseModel):
    username: str
    role: str


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Chua dang nhap.")
    info = lookup_token(creds.credentials)
    if not info:
        raise HTTPException(status_code=401, detail="Phien dang nhap het han.")
    return AuthUser(username=info.get("username", ""), role=info.get("role", "user"))


def require_admin(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Can quyen quan tri vien.")
    return user
