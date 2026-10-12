"""Xac thuc cho EduQuest: admin + user, token Bearer.

Luu tru flat-file de chay local khong can DB:
- DATA_ROOT/users.json   : [{username, password_hash, role, created_at}]
- DATA_ROOT/tokens.json  : {token: {username, role, created_at, expires_at}}

Bao mat:
- Mat khau hash PBKDF2-HMAC-SHA256 200k vong + salt rieng/user.
  Hash cu (SHA256 don gian) van verify duoc va tu dong rehash khi login.
- Khoa dang nhap 5 phut sau 5 lan sai lien tiep (luu file, restart khong mat).
- Phien dang nhap het han sau 12 gio.
- Tai khoan con dung mat khau mac dinh admin123 bi bat doi mat khau.
"""
from __future__ import annotations

import hashlib
import hmac
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
_PBKDF2_ITER = 200_000
_SESSION_TTL = 12 * 3600
_MAX_FAILS = 5
_LOCK_SECS = 5 * 60
_bearer = HTTPBearer(auto_error=False)


def _users_path() -> Path:
    return DATA_ROOT / "users.json"


def _tokens_path() -> Path:
    return DATA_ROOT / "tokens.json"


def _attempts_path() -> Path:
    return DATA_ROOT / "login_attempts.json"


def _legacy_hash(password: str) -> str:
    return hashlib.sha256((_SALT + password).encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", (password or "").encode("utf-8"), salt.encode("utf-8"), _PBKDF2_ITER)
    return f"pbkdf2${_PBKDF2_ITER}${salt}${dk.hex()}"


def needs_rehash(stored: str) -> bool:
    return not (stored or "").startswith("pbkdf2$")


def verify_password(password: str, password_hash: str) -> bool:
    stored = password_hash or ""
    if stored.startswith("pbkdf2$"):
        try:
            _, iters, salt, hexd = stored.split("$")
            dk = hashlib.pbkdf2_hmac("sha256", (password or "").encode("utf-8"), salt.encode("utf-8"), int(iters))
            return hmac.compare_digest(dk.hex(), hexd)
        except Exception:
            return False
    # hash cu (SHA256 + salt tinh): van chap nhan de tu rehash khi login
    return hmac.compare_digest(_legacy_hash(password or ""), stored)


def is_default_admin_password(stored: str) -> bool:
    """Tai khoan con dung mat khau mac dinh admin123?"""
    return hmac.compare_digest(_legacy_hash("admin123"), stored or "")


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
        raise ValueError("Tên đăng nhập/mật khẩu không hợp lệ (mật khẩu >= 3 ký tự).")
    if role not in ("admin", "user"):
        role = "user"
    users = _read_json(_users_path(), [])
    for u in users:
        if isinstance(u, dict) and u.get("username") == name:
            raise ValueError("Tên đăng nhập đã tồn tại.")
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


def _load_attempts() -> dict[str, Any]:
    data = _read_json(_attempts_path(), {})
    return data if isinstance(data, dict) else {}


def lock_remaining(username: str) -> int:
    """So giay con lai bi khoa (0 = khong bi khoa). Het han tu mo."""
    try:
        rec = _load_attempts().get((username or "").strip(), {})
        until = int(rec.get("locked_until", 0))
        return max(0, until - int(time.time()))
    except Exception:
        return 0


def record_failed_login(username: str) -> int:
    """Ghi 1 lan sai. Tra ve so giay bi khoa (0 neu chua den nguong)."""
    name = (username or "").strip()
    if not name:
        return 0
    data = _load_attempts()
    rec = data.get(name, {})
    if not isinstance(rec, dict):
        rec = {}
    fails = int(rec.get("fails", 0)) + 1
    rec["fails"] = fails
    locked_for = 0
    if fails >= _MAX_FAILS:
        rec["locked_until"] = int(time.time()) + _LOCK_SECS
        locked_for = _LOCK_SECS
    data[name] = rec
    _write_json(_attempts_path(), data)
    return locked_for


def reset_failed_login(username: str) -> None:
    name = (username or "").strip()
    if not name:
        return
    data = _load_attempts()
    if name in data:
        del data[name]
        _write_json(_attempts_path(), data)


def rehash_password(username: str, password: str) -> None:
    """Nang cap hash cu -> PBKDF2 sau khi login thanh cong."""
    users = _read_json(_users_path(), [])
    changed = False
    for u in users:
        if isinstance(u, dict) and u.get("username") == username:
            if needs_rehash(str(u.get("password_hash", ""))):
                u["password_hash"] = hash_password(password)
                changed = True
    if changed:
        _write_json(_users_path(), users)


def issue_token(username: str, role: str) -> str:
    tokens = _read_json(_tokens_path(), {})
    if not isinstance(tokens, dict):
        tokens = {}
    token = secrets.token_urlsafe(32)
    now = int(time.time())
    tokens[token] = {"username": username, "role": role, "created_at": now, "expires_at": now + _SESSION_TTL}
    _write_json(_tokens_path(), tokens)
    return token


def revoke_token(token: str) -> None:
    tokens = _read_json(_tokens_path(), {})
    if isinstance(tokens, dict) and token in tokens:
        del tokens[token]
        _write_json(_tokens_path(), tokens)


def revoke_user_tokens(username: str) -> None:
    """Thu hoi TOAN BO phien cua 1 user (dung khi doi mat khau)."""
    tokens = _read_json(_tokens_path(), {})
    if not isinstance(tokens, dict):
        return
    kept = {t: i for t, i in tokens.items() if not isinstance(i, dict) or i.get("username") != username}
    if len(kept) != len(tokens):
        _write_json(_tokens_path(), kept)


def set_password(username: str, new_password: str) -> None:
    users = _read_json(_users_path(), [])
    found = False
    for u in users:
        if isinstance(u, dict) and u.get("username") == username:
            u["password_hash"] = hash_password(new_password)
            found = True
    if not found:
        raise ValueError("Không tìm thấy tài khoản.")
    _write_json(_users_path(), users)
    revoke_user_tokens(username)


def lookup_token(token: str) -> dict[str, Any] | None:
    tokens = _read_json(_tokens_path(), {})
    if not isinstance(tokens, dict):
        return None
    info = tokens.get(token)
    if not isinstance(info, dict):
        return None
    now = int(time.time())
    exp = info.get("expires_at")
    if exp is None:
        # token cu (truoc khi co TTL): cho song them 12h ke tu bay gio
        info["expires_at"] = now + _SESSION_TTL
        _write_json(_tokens_path(), tokens)
        return info
    try:
        if now > int(exp):
            del tokens[token]
            _write_json(_tokens_path(), tokens)
            return None
    except Exception:
        return None
    return info


class AuthUser(BaseModel):
    username: str
    role: str


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập.")
    info = lookup_token(creds.credentials)
    if not info:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập hết hạn.")
    return AuthUser(username=info.get("username", ""), role=info.get("role", "user"))


def require_admin(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Cần quyền quản trị viên.")
    return user
