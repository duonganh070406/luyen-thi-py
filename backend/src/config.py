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
ENV_SAMPLE_PATH = WORKSPACE_ROOT / ".env.sample"


def parse_env_text(content: str) -> dict[str, str]:
    """Parse noi dung kieu dotenv thanh dict (khong cham vao os.environ)."""
    out: dict[str, str] = {}
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[len("export "):].strip()
        if "=" not in line:
            continue
        key, val = line.split("=", 1)
        key = key.strip()
        val = val.strip()
        # Strip quotes if present
        if len(val) >= 2 and (
            (val.startswith('"') and val.endswith('"'))
            or (val.startswith("'") and val.endswith("'"))
        ):
            val = val[1:-1]
        if key:
            out[key] = val
    return out


def parse_env_file(path: Path) -> dict[str, str]:
    """Doc 1 file .env/.env.sample (thieu file -> dict rong)."""
    try:
        if not path.is_file():
            return {}
        return parse_env_text(path.read_text(encoding="utf-8"))
    except Exception:
        # Fail silently or log if needed, matching fallback behavior
        return {}


def load_env_file(path: Path) -> None:
    """Nap 1 file env vao os.environ (khong ghi de bien moi truong that)."""
    for key, val in parse_env_file(path).items():
        if key and key not in os.environ:
            os.environ[key] = val


def load_env_with_fallback() -> None:
    """Nap cau hinh theo thu tu uu tien (cao -> thap):

    1. Bien moi truong that (export / Docker / Vercel) — khong bao gio bi ghi de.
    2. File `.env` (may ca nhan, gitignore).
    3. File `.env.sample` (mac dinh chung, duoc commit).
    """
    # Nap sample truoc, .env sau de `.env` thang `.env.sample`.
    # Ca hai deu khong duoc ghi de bien moi truong that, nen can nho
    # key nao do sample dat de `.env` van ghi de duoc.
    from_sample = set()
    for key, val in parse_env_file(ENV_SAMPLE_PATH).items():
        if key and key not in os.environ:
            os.environ[key] = val
            from_sample.add(key)
    for key, val in parse_env_file(ENV_FILE_PATH).items():
        if key and (key not in os.environ or key in from_sample):
            os.environ[key] = val


# Load the environment files upon initialization
load_env_with_fallback()


def _env(key: str, default: str = "") -> str:
    """Lay bien moi truong, coi chuoi rong nhu chua dat (dung default)."""
    val = os.environ.get(key, "")
    if isinstance(val, str):
        val = val.strip()
    return val or default


def get_cors_origins() -> list[str]:
    """Parse CORS_ORIGINS from environment or return default origins."""
    raw = _env("CORS_ORIGINS", "")
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


# ---- Thong tin ung dung (het chet cung: doi qua .env / .env.sample) ----
APP_NAME = _env("APP_NAME", "Hệ thống kiểm tra đánh giá")
APP_VERSION = _env("APP_VERSION", "1.0.0")


BACKEND_PORT = int(os.environ.get("PORT", _env("BACKEND_PORT", "8000")) or 8000)


def _default_backend_url() -> str:
    return f"http://localhost:{BACKEND_PORT}"


BACKEND_URL = _env("BACKEND_URL", _default_backend_url()).rstrip("/")


# --- JWT (xac thuc stateless, HS256) ---
# Production BAT BUOC dat JWT_SECRET rieng qua bien moi truong hoac file .env
# (config tu nap .env o WORKSPACE_ROOT). Secret mac dinh chi dung cho dev.
JWT_SECRET = _env("JWT_SECRET", "eduquest-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 12
