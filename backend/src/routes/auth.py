from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from src import auth as auth_store

router = APIRouter()


class RegisterBody(BaseModel):
    username: str
    password: str
    role: str = "user"


class LoginBody(BaseModel):
    username: str
    password: str


@router.post("/api/auth/register")
def register(body: RegisterBody):
    # Tu dang ky chi duoc role user de tranh leo thang quyen.
    try:
        user = auth_store.create_user(body.username, body.password, "user")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    token = auth_store.issue_token(user["username"], user["role"])
    return {"ok": True, "token": token, "username": user["username"], "role": user["role"], "must_change_password": False}


@router.post("/api/auth/login")
def login(body: LoginBody):
    name = (body.username or "").strip()
    remaining = auth_store.lock_remaining(name)
    if remaining > 0:
        m, s = divmod(remaining, 60)
        parts = []
        if m:
            parts.append(f"{m} phút")
        if s or not parts:
            parts.append(f"{s} giây")
        raise HTTPException(
            status_code=403,
            detail=f"Tài khoản bị khóa {' '.join(parts)} vì nhập sai quá 5 lần. Hãy thử lại sau.",
        )
    u = auth_store.find_user(name)
    if not u or not auth_store.verify_password(body.password, u.get("password_hash", "")):
        locked_for = auth_store.record_failed_login(name)
        if locked_for > 0:
            raise HTTPException(status_code=403, detail="Nhập sai quá 5 lần. Tài khoản bị khóa 5 phút.")
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu.")
    auth_store.reset_failed_login(name)
    # tu nang cap hash cu -> PBKDF2
    try:
        auth_store.rehash_password(u["username"], body.password)
    except Exception:
        pass
    stored = auth_store.find_user(name) or u
    must_change = auth_store.is_default_admin_password(str(stored.get("password_hash", "")))
    token = auth_store.issue_token(u["username"], u.get("role", "user"))
    return {
        "ok": True,
        "token": token,
        "username": u["username"],
        "role": u.get("role", "user"),
        "must_change_password": must_change,
    }


@router.get("/api/auth/me")
def me(user: auth_store.AuthUser = Depends(auth_store.get_current_user)):
    u = auth_store.find_user(user.username) or {}
    must_change = auth_store.is_default_admin_password(str(u.get("password_hash", "")))
    return {"username": user.username, "role": user.role, "must_change_password": must_change}


class ChangePasswordBody(BaseModel):
    old_password: str = ""
    new_password: str = ""


@router.put("/api/auth/password")
def change_password(body: ChangePasswordBody, user: auth_store.AuthUser = Depends(auth_store.get_current_user)):
    """Doi mat khau. Doi xong thu hoi het phien cu -> phai dang nhap lai."""
    u = auth_store.find_user(user.username)
    if not u or not auth_store.verify_password(body.old_password or "", u.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Mật khẩu hiện tại không đúng.")
    if not (body.new_password or "") or len(body.new_password) < 3:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải từ 3 ký tự trở lên.")
    try:
        auth_store.set_password(user.username, body.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


@router.post("/api/auth/logout")
def logout(authorization: str | None = Header(default=None)):
    """Thu hoi token phia server (client tu xoa ban sao local)."""
    if authorization and authorization.lower().startswith("bearer "):
        auth_store.revoke_token(authorization[7:].strip())
    return {"ok": True}


@router.get("/api/auth/users")
def list_users(_: auth_store.AuthUser = Depends(auth_store.require_admin)):
    return {"users": auth_store.list_users()}


class AdminCreateUserBody(BaseModel):
    username: str
    password: str
    role: str = "user"


@router.post("/api/auth/users")
def admin_create_user(
    body: AdminCreateUserBody,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
):
    try:
        user = auth_store.create_user(body.username, body.password, body.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True, **user}


class AdminResetPasswordBody(BaseModel):
    new_password: str = ""


@router.put("/api/auth/users/{username}/password")
def admin_reset_password(
    username: str,
    body: AdminResetPasswordBody,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
):
    """Quan tri dat lai mat khau cho user (user phai dang nhap lai)."""
    try:
        auth_store.admin_reset_password(username, body.new_password or "")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"ok": True}


@router.delete("/api/auth/users/{username}")
def admin_delete_user(
    username: str,
    user: auth_store.AuthUser = Depends(auth_store.require_admin),
):
    """Xoa tai khoan (khong duoc tu xoa chinh minh)."""
    if (username or "").strip() == user.username:
        raise HTTPException(status_code=400, detail="Không thể tự xóa tài khoản của mình.")
    try:
        auth_store.delete_user(username)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"ok": True}
