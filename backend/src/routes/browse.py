from __future__ import annotations

import urllib.parse

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import FileResponse

from src import auth as auth_store
from src.config import DATA_ROOT

router = APIRouter()

# Chi file anh duoc tai public (anh minh hoa trong de thi).
# Moi thu con lai (json chua hash mat khau/dap an/bai thi, .md de thi) chi admin.
_PUBLIC_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico"}


def _resolve_data(path: str):
    from pathlib import Path as _P

    target = (DATA_ROOT / urllib.parse.unquote(path)).resolve()
    try:
        target.relative_to(DATA_ROOT.resolve())
    except ValueError as e:
        raise HTTPException(status_code=403, detail="Access denied") from e
    return target


def _is_admin_token(authorization: str | None) -> bool:
    if not authorization or not authorization.lower().startswith("bearer "):
        return False
    info = auth_store.lookup_token(authorization[7:].strip())
    return bool(info) and info.get("role") == "admin"


@router.get("/data/{path:path}")
def serve_data_file(path: str, authorization: str | None = Header(default=None)):
    """Thay StaticFiles mount: anh public, file nhay cam chi admin."""
    target = _resolve_data(path)
    if not target.is_file():
        raise HTTPException(status_code=404, detail="Path not found")
    if target.suffix.lower() not in _PUBLIC_EXTS and not _is_admin_token(authorization):
        raise HTTPException(status_code=403, detail="Cần quyền quản trị viên.")
    return FileResponse(path=str(target))
