from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import DATA_ROOT, get_cors_origins
from src.routes import auth, bank, browse, health, rooms, subjects

app = FastAPI(
    title="He thong kiem tra danh gia",
    version="1.0.0",
    docs_url="/swagger",  # Swagger UI at /swagger
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
