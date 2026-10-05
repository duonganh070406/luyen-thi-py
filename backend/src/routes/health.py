from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health() -> dict[str, bool]:
    """Health check endpoint to verify backend status."""
    return {"ok": True}
