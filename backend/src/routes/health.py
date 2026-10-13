from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from src.config import APP_NAME, APP_VERSION

router = APIRouter()


@router.get("/health")
def health() -> dict[str, Any]:
    """Health check endpoint to verify backend status."""
    return {"ok": True, "app": APP_NAME, "version": APP_VERSION}
