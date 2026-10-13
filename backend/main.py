"""EduQuest storage API: entrypoint to run the uvicorn development server."""

from __future__ import annotations

import os

import uvicorn

from src.app import app
from src.config import APP_NAME, APP_VERSION, BACKEND_PORT, BACKEND_URL

# Expose app at module level for uvicorn main:app command
__all__ = ["app"]

if __name__ == "__main__":
    is_production = (
        os.environ.get("RENDER") == "true"
        or os.environ.get("ENV") == "production"
    )
    print(f"{APP_NAME} v{APP_VERSION} — backend {BACKEND_URL} (port {BACKEND_PORT})...")
    uvicorn.run(
        "src.app:app",
        host="0.0.0.0",
        port=BACKEND_PORT,
        reload=not is_production,
    )
