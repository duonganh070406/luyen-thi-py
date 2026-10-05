from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.config import DATA_ROOT, get_cors_origins
from src.routes import browse, health, subjects

app = FastAPI(
    title="EduQuest Storage",
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

if DATA_ROOT.is_dir():
    app.mount("/data", StaticFiles(directory=DATA_ROOT, html=False), name="data")

app.include_router(health.router)
app.include_router(browse.router)
app.include_router(subjects.router)
