"""Xac thuc cho EduQuest: admin + user, token Bearer.

Luu tru SQLite (src/db.py, file DATA_ROOT/app.db):
- users            : {username, password_hash, role, created_at}
- tokens           : {token -> username, role, created_at, expires_at}
- login_attempts   : {username -> fails, locked_until}

Bao mat:
- Mat khau hash PBKDF2-HMAC-SHA256 200k vong + salt rieng/user.
  Hash cu (SHA256 don gian) van verify duoc va tu dong rehash khi login.
- Khoa dang nhap 5 phut sau 5 lan sai lien tiep (luu DB, restart khong mat).
- Phien dang nhap het han sau 12 gio.
- Tai khoan con dung mat khau mac dinh admin123 bi bat doi mat khau.
"""
from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from typing import Any

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from src import db as store

_SALT = "eduquest-local-salt-v1"
_PBKDF2_ITER = 200_000
_SESSION_TTL = 12 * 3600
_MAX_FAILS = 5
_LOCK_SECS = 5 * 60
_bearer = HTTPBearer(auto_error=False)

store.init_db()


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
    """Tai khoan con dung mat khau mac dinh admin123? (moi format hash deu bat duoc)."""
    try:
        return verify_password("admin123", stored or "")
    except Exception:
        return False


def list_users() -> list[dict[str, Any]]:
    with store.session() as conn:
        return store.users_public(conn)


def find_user(username: str) -> dict[str, Any] | None:
    with store.session() as conn:
        return store.find_user(conn, username)


def create_user(username: str, password: str, role: str = "user") -> dict[str, Any]:
    name = (username or "").strip()
    if not name or not password or len(password) < 3:
        raise ValueError("Tên đăng nhập/mật khẩu không hợp lệ (mật khẩu >= 3 ký tự).")
    if role not in ("admin", "user"):
        role = "user"
    with store.session() as conn:
        if store.find_user(conn, name):
            raise ValueError("Tên đăng nhập đã tồn tại.")
        store.create_user(conn, name, hash_password(password), role, int(time.time()))
    return {"username": name, "role": role}


def lock_remaining(username: str) -> int:
    """So giay con lai bi khoa (0 = khong bi khoa). Het han tu mo."""
    try:
        with store.session() as conn:
            rec = store.attempt_get(conn, username)
        return max(0, int(rec.get("locked_until", 0)) - int(time.time()))
    except Exception:
        return 0


def record_failed_login(username: str) -> int:
    """Ghi 1 lan sai. Tra ve so giay bi khoa (0 neu chua den nguong)."""
    name = (username or "").strip()
    if not name:
        return 0
    with store.session() as conn:
        rec = store.attempt_get(conn, name)
        fails = int(rec.get("fails", 0)) + 1
        locked_for = 0
        locked_until = int(rec.get("locked_until", 0))
        if fails >= _MAX_FAILS:
            locked_until = int(time.time()) + _LOCK_SECS
            locked_for = _LOCK_SECS
        store.attempt_put(conn, name, fails, locked_until)
    return locked_for


def reset_failed_login(username: str) -> None:
    name = (username or "").strip()
    if not name:
        return
    with store.session() as conn:
        store.attempt_delete(conn, name)


def rehash_password(username: str, password: str) -> None:
    """Nang cap hash cu -> PBKDF2 sau khi login thanh cong."""
    with store.session() as conn:
        u = store.find_user(conn, username)
        if u and needs_rehash(str(u.get("password_hash", ""))):
            store.set_password_hash(conn, username, hash_password(password))


def issue_token(username: str, role: str) -> str:
    token = secrets.token_urlsafe(32)
    now = int(time.time())
    with store.session() as conn:
        store.token_put(conn, token, username, role, now, now + _SESSION_TTL)
    return token


def revoke_token(token: str) -> None:
    with store.session() as conn:
        store.token_delete(conn, token)


def revoke_user_tokens(username: str) -> None:
    """Thu hoi TOAN BO phien cua 1 user (dung khi doi mat khau)."""
    with store.session() as conn:
        store.tokens_delete_user(conn, username)


def set_password(username: str, new_password: str) -> None:
    with store.session() as conn:
        if not store.set_password_hash(conn, username, hash_password(new_password)):
            raise ValueError("Không tìm thấy tài khoản.")
        store.tokens_delete_user(conn, username)


def lookup_token(token: str) -> dict[str, Any] | None:
    with store.session() as conn:
        info = store.token_get(conn, token)
        if not info:
            return None
        now = int(time.time())
        exp = info.get("expires_at")
        if exp is None:
            # token cu (truoc khi co TTL): cho song them 12h ke tu bay gio
            store.token_set_expiry(conn, token, now + _SESSION_TTL)
            info["expires_at"] = now + _SESSION_TTL
            return info
        try:
            if now > int(exp):
                store.token_delete(conn, token)
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
