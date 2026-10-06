from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
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
    return {"ok": True, "token": token, "username": user["username"], "role": user["role"]}


@router.post("/api/auth/login")
def login(body: LoginBody):
    u = auth_store.find_user(body.username)
    if not u or not auth_store.verify_password(body.password, u.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Sai ten dang nhap hoac mat khau.")
    token = auth_store.issue_token(u["username"], u.get("role", "user"))
    return {"ok": True, "token": token, "username": u["username"], "role": u.get("role", "user")}


@router.get("/api/auth/me")
def me(user: auth_store.AuthUser = Depends(auth_store.get_current_user)):
    return {"username": user.username, "role": user.role}


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
