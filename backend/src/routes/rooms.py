"""API phong thi online: tao phong, join (ten + ma), autosave, giam sat, BXH, xuat bao cao."""
from __future__ import annotations

import csv
import io
import threading
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from src import auth as auth_store
from src import examrooms as store
from src.utils import load_units, require_subject, save_units

router = APIRouter()


class RoomCreateBody(BaseModel):
    name: str = "Phong thi"
    subject: str = ""
    unit: str = ""
    topics: list[str] = []
    difficulty: str = "Hon hop"
    count: int = 10
    time_limit: int = 30
    shuffle_questions: bool = True
    shuffle_options: bool = True
    max_violations: int = 3
    auto_submit: bool = False
    show_answers: bool = True


@router.post("/api/rooms", status_code=201)
def create_room(body: RoomCreateBody, user: auth_store.AuthUser = Depends(auth_store.require_admin)):
    if not body.subject.strip():
        raise HTTPException(status_code=400, detail="Cần chọn môn (subject) cho phòng thi.")
    # Mon phai ton tai: tranh phong ma (join tra 0 cau, nop 0/0).
    require_subject(body.subject)
    room = store.create_room(body.model_dump(mode="json"), created_by=user.username)
    return {"ok": True, "room": room}


@router.get("/api/rooms")
def list_rooms(user: auth_store.AuthUser = Depends(auth_store.require_admin)):
    return {"rooms": store.load_rooms()}


@router.post("/api/rooms/{room_id}/close")
def close_room(room_id: str, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Quan tri vien dong bai thi: khoa phong, tu dong thu bai tat ca."""
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    store.update_room_fields(room_id, {"status": "closed"})
    for s in store.sessions_of(room_id):
        if not s.get("submitted"):
            store.finalize_session(s)
            store.save_session(s)
    return {"ok": True}


class JoinBody(BaseModel):
    code: str = ""
    participant: str = ""
    unit: str = ""
    id_number: str = ""


@router.post("/api/rooms/join")
def join(body: JoinBody):
    """Thi sinh vao thi: chi can nhap ten + ma phong (khong can mat khau).

    Tra ve ticket phien thi + de da CAT DAP AN. Xem lai dap an dung
    chi co trong `detail` va chi khi bai da nop.
    """
    try:
        room, sess = store.join_room(body.code, body.participant, body.unit, body.id_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    show = room.get("show_answers", True)
    return {
        "ok": True,
        "room": {k: room[k] for k in ("id", "code", "name", "subject", "time_limit", "max_violations", "status")},
        "ticket": sess.get("ticket", ""),
        "deadline": sess.get("deadline", 0),
        "questions": [store.public_question(q) for q in sess.get("questions") or []],
        "answers": sess.get("answers") or {},
        "violations": sess.get("violations", 0),
        "submitted": bool(sess.get("submitted")),
        "show_answers": bool(show),
        "detail": store.session_detail(sess) if (sess.get("submitted") and show) else [],
    }


class AnswerBody(BaseModel):
    code: str = ""
    participant: str = ""
    ticket: str = ""
    question_id: str = ""
    answer: Any = None
    id_number: str = ""


def _check_ticket_or_403(sess: dict[str, Any], ticket: str) -> None:
    try:
        store.check_ticket(sess, ticket)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.post("/api/rooms/answer")
def save_answer(body: AnswerBody):
    """Luu trang thai lien tuc: bam cau nao luu ngay cau do cho quan tri vien."""
    room = store.get_room_by_code(body.code)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")

    def _apply(s: dict[str, Any]) -> None:
        _check_ticket_or_403(s, body.ticket)
        if store.is_expired(room, s):
            store.finalize_session(s)
            raise HTTPException(status_code=400, detail="Hết giờ làm bài. Bài thi đã tự động thu.")
        if s.get("submitted"):
            raise HTTPException(status_code=400, detail="Bài thi đã nộp.")
        answers = dict(s.get("answers") or {})
        answers[str(body.question_id)] = body.answer
        s["answers"] = answers
        s["updated_at"] = int(time.time())

    try:
        s = store.update_session(room["id"], body.participant, _apply, body.id_number)
    except ValueError:
        raise HTTPException(status_code=404, detail="Chưa join phòng.")
    return {"ok": True, "answered": len(s.get("answers") or {})}


class ViolationBody(BaseModel):
    code: str = ""
    participant: str = ""
    ticket: str = ""
    id_number: str = ""


# Chong dem lap vi pham: 2 request cach nhau < 2s (blur + visibilitychange
# cung luc, hoac client cu) chi tinh 1 lan.
_VIOL_DEBOUNCE_SECS = 2.0
_LAST_VIOL: dict[str, float] = {}
_LAST_VIOL_GUARD = threading.Lock()


@router.post("/api/rooms/violation")
def report_violation(body: ViolationBody):
    """Chong gian lan: dem so lan chuyen tab. Tu dong thu neu phong bat auto_submit va vuot gioi han."""
    room = store.get_room_by_code(body.code)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    maxv = int(room.get("max_violations") or 3)
    auto = bool(room.get("auto_submit", False))
    just_expired = False
    auto_took = False

    def _apply(s: dict[str, Any]) -> None:
        nonlocal just_expired, auto_took
        _check_ticket_or_403(s, body.ticket)
        if s.get("submitted"):
            return
        if store.is_expired(room, s):
            store.finalize_session(s)
            just_expired = True
            return
        key = f"{room['id']}\u0000{s.get('participant', '')}\u0000{s.get('id_number', '')}"
        now = time.time()
        with _LAST_VIOL_GUARD:
            if len(_LAST_VIOL) > 10000:
                cutoff = now - 3600
                for k in [k for k, t in _LAST_VIOL.items() if t < cutoff]:
                    del _LAST_VIOL[k]
            last = _LAST_VIOL.get(key, 0.0)
            if now - last < _VIOL_DEBOUNCE_SECS:
                return
            _LAST_VIOL[key] = now
        s["violations"] = int(s.get("violations", 0)) + 1
        s["updated_at"] = int(time.time())
        # Tu thu bai khi vuot so lan cho phep (neu ky thi bat che do nay)
        if auto and int(s["violations"]) > maxv:
            store.finalize_session(s)
            auto_took = True

    try:
        s = store.update_session(room["id"], body.participant, _apply, body.id_number)
    except ValueError:
        raise HTTPException(status_code=404, detail="Chưa join phòng.")
    if just_expired:
        return {"ok": True, "violations": s.get("violations", 0), "submitted": True, "max": maxv, "expired": True}
    return {"ok": True, "violations": s.get("violations", 0), "submitted": bool(s.get("submitted")), "max": maxv, "auto_submitted": auto_took}


class SubmitBody(BaseModel):
    code: str = ""
    participant: str = ""
    ticket: str = ""
    id_number: str = ""


@router.post("/api/rooms/submit")
def submit(body: SubmitBody):
    """Nop bai (tu nguyen/het gio). Bai da nop thi tra lai ket qua + chi tiet (idempotent)."""
    room = store.get_room_by_code(body.code)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")

    def _apply(s: dict[str, Any]) -> None:
        _check_ticket_or_403(s, body.ticket)
        if not s.get("submitted"):
            store.finalize_session(s)

    try:
        s = store.update_session(room["id"], body.participant, _apply, body.id_number)
    except ValueError:
        raise HTTPException(status_code=404, detail="Chưa join phòng.")
    show = room.get("show_answers", True)
    return {
        "ok": True,
        "score": s.get("score", 0),
        "total": s.get("total", len(s.get("questions") or [])),
        "show_answers": bool(show),
        "detail": store.session_detail(s) if show else [],
    }


@router.get("/api/rooms/{room_id}/monitor")
def monitor(room_id: str, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Dashboard giam sat nguoi lam trong luc thi."""
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    rows = []
    for s in store.sessions_of(room_id):
        answers = s.get("answers") or {}
        total = len(s.get("questions") or [])
        score, _ = store.grade_session(s.get("questions") or [], answers)
        rows.append(
            {
                "participant": s.get("participant"),
                "unit": s.get("unit", ""),
                "id_number": s.get("id_number", ""),
                "answered": len(answers),
                "total": total,
                "current_score": score,
                "violations": s.get("violations", 0),
                "joins": int(s.get("joins") or 1),
                "submitted": bool(s.get("submitted")),
                "joined_at": s.get("joined_at"),
                "updated_at": s.get("updated_at"),
                "answers": answers,
            }
        )
    rows.sort(key=lambda r: (-r["answered"], str(r["participant"])))
    return {"room": room, "participants": rows, "total": len(rows)}


@router.get("/api/rooms/{room_id}/leaderboard")
def get_leaderboard(room_id: str):
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    ranking = []
    for r in store.leaderboard(room_id):
        # BXH public: AN SO CCCD (chi giam sat/export admin moi thay)
        ranking.append({k: v for k, v in r.items() if k != "id_number"})
    return {"room": {"id": room["id"], "code": room["code"], "name": room["name"]}, "ranking": ranking}


@router.get("/api/rooms/{room_id}/leaderboard/full")
def get_leaderboard_full(room_id: str, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """BXH day du cho quan tri (gom CCCD de phan biet trung ten)."""
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    return {"room": {"id": room["id"], "code": room["code"], "name": room["name"]}, "ranking": store.leaderboard(room_id)}


class ScoreEditBody(BaseModel):
    participant: str = ""
    score: int = 0
    id_number: str = ""


@router.put("/api/rooms/{room_id}/leaderboard")
def edit_leaderboard(room_id: str, body: ScoreEditBody, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Quan tri vien sua diem thi sinh tren bang xep hang."""
    def _apply(s: dict[str, Any]) -> None:
        total = int(s.get("total") or len(s.get("questions") or []) or 0)
        s["score"] = max(0, min(int(body.score), total))
        s["submitted"] = True
        if not s.get("submitted_at"):
            s["submitted_at"] = int(time.time())
        s["updated_at"] = int(time.time())
        s["manual_edit"] = True

    try:
        store.update_session(room_id, (body.participant or "").strip(), _apply, body.id_number)
    except ValueError:
        raise HTTPException(status_code=404, detail="Không tìm thấy thí sinh.")
    return {"ok": True}


@router.get("/api/rooms/{room_id}/export")
def export_report(room_id: str, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Xuat mau bao cao sau thi (CSV) cho quan tri vien."""
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    ranking = store.leaderboard(room_id)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["Phong thi", room.get("name", ""), "Ma", room.get("code", ""), "Mon", room.get("subject", "")])
    w.writerow(["Hang", "Thi sinh", "Don vi", "So CCCD", "Diem", "Tong", "Da lam", "Vi pham tab", "So lan vao", "Da nop"])
    for i, r in enumerate(ranking, start=1):
        w.writerow([i, r["participant"], r.get("unit", ""), r.get("id_number", ""), r["score"], r["total"], r["answered"], r["violations"], r.get("joins", 1), "Co" if r["submitted"] else "Chua"])
    # BOM giup Excel hien dung tieng Viet
    return PlainTextResponse("\ufeff" + buf.getvalue(), media_type="text/csv; charset=utf-8")


# ---------- Units (Phòng ban/Khoa) CRUD ----------


class UnitCreateBody(BaseModel):
    name: str = ""


@router.get("/api/units")
def list_units():
    """Lay danh sach don vi (public de thi sinh chon khi vao phong thi)."""
    return {"units": load_units()}


@router.post("/api/units", status_code=201)
def create_unit(body: UnitCreateBody, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Them don vi moi."""
    name = (body.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Cần nhập tên đơn vị.")
    units = load_units()
    # Check duplicate
    for u in units:
        if u.get("name", "").strip().lower() == name.lower():
            raise HTTPException(status_code=400, detail="Đơn vị này đã tồn tại.")
    units.append({"name": name})
    save_units(units)
    return {"ok": True, "unit": {"name": name}}


@router.delete("/api/units/{unit_name}")
def delete_unit(unit_name: str, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Xoa don vi."""
    units = load_units()
    rest = [u for u in units if u.get("name", "").strip().lower() != unit_name.strip().lower()]
    if len(rest) == len(units):
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn vị.")
    save_units(rest)
    return {"ok": True, "total": len(rest)}
