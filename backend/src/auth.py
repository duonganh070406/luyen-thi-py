"""Xac thuc cho EduQuest: admin + user, JWT Bearer (stateless).

Luu tru SQLite (src/db.py, file DATA_ROOT/app.db):
- users            : {username, password_hash, role, created_at}
- login_attempts   : {username -> fails, locked_until}

Phien dang nhap la JWT ky HS256 bang JWT_SECRET, payload {sub, role, iat, exp},
het han sau 12 gio. Backend verify chu ky + exp ma KHONG truy van DB.
Dang xuat = client xoa token (server khong luu trang thai phien).

Bao mat:
- Mat khau hash PBKDF2-HMAC-SHA256 200k vong + salt rieng/user.
  Hash cu (SHA256 don gian) van verify duoc va tu dong rehash khi login.
- Khoa dang nhap 5 phut sau 5 lan sai lien tiep (luu DB, restart khong mat).
- Tai khoan con dung mat khau mac dinh admin123 bi bat doi mat khau.
"""
from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from typing import Any

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from src import db as store
from src.config import JWT_ALGORITHM, JWT_EXPIRATION_HOURS, JWT_SECRET

_SALT = "eduquest-local-salt-v1"
_PBKDF2_ITER = 200_000
_SESSION_TTL = JWT_EXPIRATION_HOURS * 3600
_MAX_FAILS = 5
_LOCK_SECS = 5 * 60
_VALID_ROLES = ("admin", "user")
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
    """Cap JWT {sub, role, iat, exp}. Stateless: khong luu DB."""
    now = int(time.time())
    payload = {
        "sub": username,
        "role": role if role in _VALID_ROLES else "user",
        "iat": now,
        "exp": now + _SESSION_TTL,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any] | None:
    """Verify chu ky HS256 + han exp. Tra ve payload, None neu gia/het han."""
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
    if not isinstance(data, dict) or not str(data.get("sub", "")).strip():
        return None
    if data.get("role") not in _VALID_ROLES:
        data["role"] = "user"
    return data


def set_password(username: str, new_password: str) -> None:
    with store.session() as conn:
        if not store.set_password_hash(conn, username, hash_password(new_password)):
            raise ValueError("Không tìm thấy tài khoản.")


def admin_reset_password(username: str, new_password: str) -> None:
    """Quan tri dat lai mat khau cho user (thu hoi het phien cu)."""
    if not (new_password or "") or len(new_password) < 3:
        raise ValueError("Mật khẩu mới phải từ 3 ký tự trở lên.")
    set_password((username or "").strip(), new_password)


def delete_user(username: str) -> None:
    """Xoa tai khoan (dung cho quan tri)."""
    with store.session() as conn:
        if not store.user_delete(conn, (username or "").strip()):
            raise ValueError("Không tìm thấy tài khoản.")


class AuthUser(BaseModel):
    username: str
    role: str


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập.")
    payload = decode_token(creds.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập hết hạn hoặc không hợp lệ.")
    return AuthUser(username=str(payload.get("sub", "")), role=str(payload.get("role", "user")))


def require_admin(user: AuthUser = Depends(get_current_user)) -> AuthUser:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Cần quyền quản trị viên.")
    return user
