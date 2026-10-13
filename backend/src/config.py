from __future__ import annotations

import os
from pathlib import Path

SRC_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SRC_DIR.parent
WORKSPACE_ROOT = BACKEND_DIR.parent


def _resolve_data_root() -> Path:
    """Resolve the data directory across local, Docker, and serverless environments."""
    if os.environ.get("DATA_DIR"):
        return Path(os.environ["DATA_DIR"]).resolve()

    # 1. Ưu tiên thư mục data gốc ở workspace (môi trường local dev)
    workspace_data = (WORKSPACE_ROOT / "data").resolve()
    if workspace_data.is_dir():
        return workspace_data

    # 2. Dự phòng thư mục backend/data (môi trường đóng gói Vercel serverless)
    backend_data = (BACKEND_DIR / "data").resolve()
    if backend_data.is_dir():
        return backend_data

    # 3. Thư mục hiện tại (CWD)
    cwd_data = (Path.cwd() / "data").resolve()
    if cwd_data.is_dir():
        return cwd_data

    return workspace_data


DATA_ROOT = _resolve_data_root()
ENV_FILE_PATH = WORKSPACE_ROOT / ".env"


def load_env_file(path: Path) -> None:
    """Loads environment variables from a .env file into os.environ."""
    if not path.is_file():
        return
    try:
        content = path.read_text(encoding="utf-8")
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip()
                # Strip quotes if present
                if (val.startswith('"') and val.endswith('"')) or (
                    val.startswith("'") and val.endswith("'")
                ):
                    val = val[1:-1]
                if key and key not in os.environ:
                    os.environ[key] = val
    except Exception:
        # Fail silently or log if needed, matching fallback behavior
        pass


# Load the environment file upon initialization
load_env_file(ENV_FILE_PATH)


def get_cors_origins() -> list[str]:
    """Parse CORS_ORIGINS from environment or return default origins."""
    raw = os.environ.get("CORS_ORIGINS", "").strip()
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


BACKEND_PORT = int(os.environ.get("PORT", os.environ.get("BACKEND_PORT", 8000)))
