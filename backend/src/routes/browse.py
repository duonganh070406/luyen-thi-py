from __future__ import annotations

import urllib.parse
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from src.config import DATA_ROOT

router = APIRouter()


@router.get("/api/browse")
def browse_data(path: str = "") -> dict[str, Any]:
    """Duyệt cây thư mục data. Truy vấn ?path=Toán học để xem thư mục con."""
    target = (DATA_ROOT / urllib.parse.unquote(path)).resolve()
    # Bảo mật: không cho phép truy cập ngoài DATA_ROOT
    try:
        target.relative_to(DATA_ROOT.resolve())
    except ValueError as e:
        raise HTTPException(status_code=403, detail="Access denied") from e
    if not target.exists():
        raise HTTPException(status_code=404, detail="Path not found")

    def _entry(p: Path) -> dict[str, Any]:
        rel = p.relative_to(DATA_ROOT).as_posix()
        if p.is_dir():
            children = [
                _entry(c) for c in p.iterdir()
            ]
            sorted_children = sorted(
                children,
                key=lambda e: (e["type"] == "file", e["name"].lower()),
            )
            return {
                "name": p.name,
                "type": "directory",
                "path": rel,
                "children": sorted_children,
            }
        return {
            "name": p.name,
            "type": "file",
            "path": rel,
            "size": p.stat().st_size,
            "url": f"/data/{urllib.parse.quote(rel)}",
        }

    return _entry(target)
