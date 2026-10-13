from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import APP_NAME, APP_VERSION, DATA_ROOT, get_cors_origins
from src.routes import auth, bank, browse, health, rooms, subjects

# Tai lieu API tuong tac (Swagger/Redoc) lo toan bo so do endpoint + schema:
# tat mac dinh, chi bat khi can debug voi ENABLE_DOCS=1.
_ENABLE_DOCS = os.getenv("ENABLE_DOCS", "").strip().lower() in ("1", "true", "yes")

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    docs_url="/swagger" if _ENABLE_DOCS else None,
    redoc_url="/redoc" if _ENABLE_DOCS else None,
    openapi_url="/openapi.json" if _ENABLE_DOCS else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def _validation_handler(request, exc):
    # Dung tra loi pydantic tho (tieng Anh + lo schema) ra client.
    return JSONResponse(
        status_code=422,
        content={"detail": "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại."},
    )

try:
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
except Exception:
    pass

# Khoi dong SQLite + migrate du lieu JSON cu (neu DB moi) truoc khi nhan request
from src import db as _db

_db.init_db()

# KHONG mount StaticFiles /data public nua (lo hash mat khau + dap an + bai thi).
# File anh public + file nhay cam chi admin qua GET /data/{path} trong browse router.

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(bank.router)
app.include_router(rooms.router)
app.include_router(browse.router)
app.include_router(subjects.router)
