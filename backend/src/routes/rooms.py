"""API phong thi online: tao phong, join (ten + ma), autosave, giam sat, BXH, xuat bao cao."""
from __future__ import annotations

import csv
import io
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from src import auth as auth_store
from src import examrooms as store

router = APIRouter()


class RoomCreateBody(BaseModel):
    name: str = "Phong thi"
    subject: str = ""
    topics: list[str] = []
    difficulty: str = "Hon hop"
    count: int = 10
    time_limit: int = 30
    shuffle_questions: bool = True
    shuffle_options: bool = True
    max_violations: int = 3


@router.post("/api/rooms", status_code=201)
def create_room(body: RoomCreateBody, user: auth_store.AuthUser = Depends(auth_store.require_admin)):
    if not body.subject.strip():
        raise HTTPException(status_code=400, detail="Cần chọn môn (subject) cho phòng thi.")
    room = store.create_room(body.model_dump(mode="json"), created_by=user.username)
    return {"ok": True, "room": room}


@router.get("/api/rooms")
def list_rooms(user: auth_store.AuthUser = Depends(auth_store.require_admin)):
    return {"rooms": store.load_rooms()}


@router.get("/api/rooms/{room_id}")
def get_room(room_id: str, user: auth_store.AuthUser = Depends(auth_store.require_admin)):
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    return {"room": room}


class RoomUpdateBody(BaseModel):
    name: str | None = None
    status: str | None = None
    time_limit: int | None = None
    max_violations: int | None = None


@router.put("/api/rooms/{room_id}")
def update_room(room_id: str, body: RoomUpdateBody, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    rooms = store.load_rooms()
    found = False
    for r in rooms:
        if r.get("id") == room_id:
            found = True
            if body.name is not None:
                r["name"] = body.name
            if body.status in ("open", "closed"):
                r["status"] = body.status
            if body.time_limit is not None:
                r["time_limit"] = max(1, int(body.time_limit))
            if body.max_violations is not None:
                r["max_violations"] = max(1, int(body.max_violations))
    if not found:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    store.save_rooms(rooms)
    return {"ok": True}


@router.post("/api/rooms/{room_id}/close")
def close_room(room_id: str, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Quan tri vien dong bai thi: khoa phong, tu dong thu bai tat ca."""
    rooms = store.load_rooms()
    room = next((r for r in rooms if r.get("id") == room_id), None)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    room["status"] = "closed"
    store.save_rooms(rooms)
    sessions = store.load_sessions()
    for s in sessions:
        if s.get("room_id") == room_id and not s.get("submitted"):
            score, total = store.grade_session(s.get("questions") or [], s.get("answers") or {})
            s["score"] = score
            s["total"] = total
            s["submitted"] = True
            s["submitted_at"] = int(time.time())
            s["updated_at"] = int(time.time())
    store.save_sessions(sessions)
    return {"ok": True}


class JoinBody(BaseModel):
    code: str = ""
    participant: str = ""


@router.post("/api/rooms/join")
def join(body: JoinBody):
    """Thi sinh vao thi: chi can nhap ten + ma phong (khong can mat khau)."""
    try:
        room, sess = store.join_room(body.code, body.participant)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {
        "ok": True,
        "room": {k: room[k] for k in ("id", "code", "name", "subject", "time_limit", "max_violations", "status")},
        "questions": sess.get("questions") or [],
        "answers": sess.get("answers") or {},
        "violations": sess.get("violations", 0),
        "submitted": bool(sess.get("submitted")),
    }


class AnswerBody(BaseModel):
    code: str = ""
    participant: str = ""
    question_id: str = ""
    answer: Any = None


@router.post("/api/rooms/answer")
def save_answer(body: AnswerBody):
    """Luu trang thai lien tuc: bam cau nao luu ngay cau do cho quan tri vien."""
    room = store.get_room_by_code(body.code)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    sessions = store.load_sessions()
    for s in sessions:
        if s.get("room_id") == room["id"] and s.get("participant") == (body.participant or "").strip():
            if s.get("submitted"):
                raise HTTPException(status_code=400, detail="Bài thi đã nộp.")
            answers = dict(s.get("answers") or {})
            answers[str(body.question_id)] = body.answer
            s["answers"] = answers
            s["updated_at"] = int(time.time())
            store.save_sessions(sessions)
            return {"ok": True, "answered": len(answers)}
    raise HTTPException(status_code=404, detail="Chưa join phòng.")


class ViolationBody(BaseModel):
    code: str = ""
    participant: str = ""


@router.post("/api/rooms/violation")
def report_violation(body: ViolationBody):
    """Chong gian lan: dem so lan chuyen tab. Qua gioi han -> tu dong thu bai."""
    room = store.get_room_by_code(body.code)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    sessions = store.load_sessions()
    for s in sessions:
        if s.get("room_id") == room["id"] and s.get("participant") == (body.participant or "").strip():
            if s.get("submitted"):
                return {"ok": True, "submitted": True, "violations": s.get("violations", 0)}
            s["violations"] = int(s.get("violations", 0)) + 1
            s["updated_at"] = int(time.time())
            maxv = int(room.get("max_violations") or 3)
            auto = s["violations"] >= maxv
            if auto:
                score, total = store.grade_session(s.get("questions") or [], s.get("answers") or {})
                s["score"] = score
                s["total"] = total
                s["submitted"] = True
                s["submitted_at"] = int(time.time())
            store.save_sessions(sessions)
            return {"ok": True, "violations": s["violations"], "submitted": bool(s.get("submitted")), "max": maxv}
    raise HTTPException(status_code=404, detail="Chưa join phòng.")


class SubmitBody(BaseModel):
    code: str = ""
    participant: str = ""


@router.post("/api/rooms/submit")
def submit(body: SubmitBody):
    """Tu dong thu bai khi het gio / thi sinh nop / admin dong phong."""
    room = store.get_room_by_code(body.code)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    sessions = store.load_sessions()
    for s in sessions:
        if s.get("room_id") == room["id"] and s.get("participant") == (body.participant or "").strip():
            score, total = store.grade_session(s.get("questions") or [], s.get("answers") or [])
            s["score"] = score
            s["total"] = total
            s["submitted"] = True
            s["submitted_at"] = int(time.time())
            s["updated_at"] = int(time.time())
            store.save_sessions(sessions)
            return {"ok": True, "score": score, "total": total}
    raise HTTPException(status_code=404, detail="Chưa join phòng.")


@router.get("/api/rooms/{room_id}/monitor")
def monitor(room_id: str, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Dashboard giam sat nguoi lam trong luc thi."""
    room = store.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng.")
    sessions = [s for s in store.load_sessions() if s.get("room_id") == room_id]
    rows = []
    for s in sessions:
        answers = s.get("answers") or {}
        total = len(s.get("questions") or [])
        score, _ = store.grade_session(s.get("questions") or [], answers)
        rows.append(
            {
                "participant": s.get("participant"),
                "answered": len(answers),
                "total": total,
                "current_score": score,
                "violations": s.get("violations", 0),
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
    return {"room": {"id": room["id"], "code": room["code"], "name": room["name"]}, "ranking": store.leaderboard(room_id)}


class ScoreEditBody(BaseModel):
    participant: str = ""
    score: int = 0


@router.put("/api/rooms/{room_id}/leaderboard")
def edit_leaderboard(room_id: str, body: ScoreEditBody, _: auth_store.AuthUser = Depends(auth_store.require_admin)):
    """Quan tri vien sua diem thi sinh tren bang xep hang."""
    sessions = store.load_sessions()
    found = False
    for s in sessions:
        if s.get("room_id") == room_id and s.get("participant") == (body.participant or "").strip():
            s["score"] = max(0, int(body.score))
            s["submitted"] = True
            if not s.get("submitted_at"):
                s["submitted_at"] = int(time.time())
            s["updated_at"] = int(time.time())
            s["manual_edit"] = True
            found = True
    if not found:
        raise HTTPException(status_code=404, detail="Không tìm thấy thí sinh.")
    store.save_sessions(sessions)
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
    w.writerow(["Hang", "Thi sinh", "Diem", "Tong", "Da lam", "Vi pham tab", "Da nop"])
    for i, r in enumerate(ranking, start=1):
        w.writerow([i, r["participant"], r["score"], r["total"], r["answered"], r["violations"], "Co" if r["submitted"] else "Chua"])
    return PlainTextResponse(buf.getvalue(), media_type="text/csv; charset=utf-8")
