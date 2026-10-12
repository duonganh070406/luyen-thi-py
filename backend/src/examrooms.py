"""Phong thi online, luu tru SQLite (src/db.py, file DATA_ROOT/app.db).

- rooms          : 1 dong / phong
- room_sessions  : khoa chinh (room_id, participant) — MOI THI SINH 1 DONG rieng
  (du lieu JSON cu da duoc migrate vao DB luc khoi dong)

Room: id, code, name, subject, topics, difficulty, count, time_limit,
      shuffle_questions, shuffle_options, status(open|closed),
      created_by, created_at, max_violations
Session: room_id, participant, ticket, questions(list quiz item day du,
      chi luu server), answers, violations, joins, joined_at, deadline,
      updated_at, submitted, submitted_at, score, total

Chong mat bai dong thoi: moi session 1 dong + ghi tuan tu duoi
BEGIN IMMEDIATE (+ lock theo session trong process).

Chong gian lan:
- Dap an dung KHONG bao gio gui cho client truoc khi nop bai.
- Moi phien lam bai co ticket rieng; cac API answer/violation/submit
  deu phai kem ticket khop thi moi duoc chap nhan.
- Server tu dong thu bai khi qua deadline (ke ca client khong gui gi).
"""
from __future__ import annotations

import random
import secrets
import string
import threading
import time
from typing import Any, Callable

from src import db as store
from src.bank import pick_with_mix, shuffle_options, unified_questions

store.init_db()


def load_rooms() -> list[dict[str, Any]]:
    with store.session() as conn:
        return store.rooms_all(conn)


def save_rooms(rooms: list[dict[str, Any]]) -> None:
    """Upsert toan bo danh sach (giu tuong thich ham cu; route nen dung update_room_fields)."""
    with store.session() as conn:
        for r in rooms:
            if isinstance(r, dict) and r.get("id"):
                store.room_upsert(conn, r)


def update_room_fields(room_id: str, fields: dict[str, Any]) -> bool:
    """Cap nhat 1 phong theo truong (khong doc-ghi ca bang)."""
    with store.session() as conn:
        return store.room_update_fields(conn, room_id, fields)


def load_session(room_id: str, participant: str) -> dict[str, Any] | None:
    """Doc 1 session cua thi sinh."""
    with store.session() as conn:
        return store.session_get(conn, room_id, participant)


def save_session(sess: dict[str, Any]) -> None:
    """Ghi 1 session (upsert theo khoa room_id + participant)."""
    with store.session() as conn:
        store.session_put(conn, sess)


_LOCKS: dict[str, threading.Lock] = {}
_LOCKS_GUARD = threading.Lock()


def _lock_for(room_id: str, participant: str) -> threading.Lock:
    key = f"{room_id}\u0000{(participant or '').strip()}"
    with _LOCKS_GUARD:
        lock = _LOCKS.get(key)
        if lock is None:
            lock = threading.Lock()
            _LOCKS[key] = lock
        return lock


def update_session(room_id: str, participant: str, fn: Callable[[dict[str, Any]], None]) -> dict[str, Any]:
    """Doc -> sua -> ghi 1 session DUOI KHOA (chong mat bai khi luu dong thoi).

    Tra ve session sau khi sua. Raise ValueError neu chua join.
    Moi exception khac do fn gay ra duoc giu nguyen de route xu ly.
    """
    name = (participant or "").strip()
    with _lock_for(room_id, name):
        s = load_session(room_id, name)
        if s is None:
            raise ValueError("Chưa join phòng.")
        fn(s)
        save_session(s)
        return s


def sessions_of(room_id: str) -> list[dict[str, Any]]:
    """Tat ca session cua 1 phong."""
    with store.session() as conn:
        return store.sessions_of_room(conn, room_id)


def load_sessions() -> list[dict[str, Any]]:
    """Gop session MOI phong (chu yeu cho giam sat/BXH xuat bao cao)."""
    with store.session() as conn:
        return store.sessions_all(conn)


def save_sessions(sessions: list[dict[str, Any]]) -> None:
    """Ghi nhieu session (moi cai 1 dong upsert). Giu tuong thich ham cu."""
    for s in sessions:
        if isinstance(s, dict) and s.get("room_id") and s.get("participant"):
            save_session(s)


def _new_code(existing: set[str]) -> str:
    for _ in range(100):
        code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        code = code.replace("0", "X").replace("O", "Y")
        if code not in existing:
            return code
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


def create_room(payload: dict[str, Any], created_by: str) -> dict[str, Any]:
    with store.session() as conn:
        existing = store.room_codes(conn)
    rng = random.Random()
    room = {
        "id": f"room_{int(time.time())}_{rng.randint(1000, 9999)}",
        "code": payload.get("code") or _new_code(existing),
        "name": (payload.get("name") or "Phong thi").strip() or "Phong thi",
        "subject": (payload.get("subject") or "").strip(),
        "unit": (payload.get("unit") or "").strip(),
        "topics": payload.get("topics") or [],
        "difficulty": payload.get("difficulty") or "Hon hop",
        "count": int(payload.get("count") or 10),
        "time_limit": int(payload.get("time_limit") or 30),
        "shuffle_questions": bool(payload.get("shuffle_questions", True)),
        "shuffle_options": bool(payload.get("shuffle_options", True)),
        "status": "open",
        "created_by": created_by,
        "created_at": int(time.time()),
        "max_violations": int(payload.get("max_violations") or 3),
    }
    room["code"] = str(room["code"]).strip().upper()
    with store.session() as conn:
        store.room_insert(conn, room)
    return room


def get_room(room_id: str) -> dict[str, Any] | None:
    with store.session() as conn:
        return store.room_by_id(conn, room_id)


def get_room_by_code(code: str) -> dict[str, Any] | None:
    with store.session() as conn:
        return store.room_by_code(conn, code)


def grade_session(questions: list[dict[str, Any]], answers: dict[str, Any]) -> tuple[int, int]:
    correct = 0
    total = len(questions)
    for q in questions:
        qid = str(q.get("id"))
        ua = answers.get(qid)
        try:
            if int(ua) == int(q.get("answer", -999)):
                correct += 1
        except Exception:
            continue
    return correct, total


def build_questions_for_participant(room: dict[str, Any]) -> list[dict[str, Any]]:
    pool = unified_questions(room.get("subject", ""))
    count = max(1, min(int(room.get("count") or 10), 200))
    picked = pick_with_mix(
        pool,
        difficulty=room.get("difficulty") or "Hon hop",
        topics=room.get("topics") or [],
        count=count,
        rng=random.Random(),
    )
    rng = random.Random()
    if room.get("shuffle_questions", True):
        rng.shuffle(picked)
    if room.get("shuffle_options", True):
        picked = [shuffle_options(q, rng) for q in picked]
    return picked


def public_question(q: dict[str, Any]) -> dict[str, Any]:
    """Ban cau hoi gui cho thi sinh: cat bo moi truong dap an."""
    return {
        "id": q.get("id"),
        "type": q.get("type", "single"),
        "name": q.get("name"),
        "question": q.get("question", ""),
        "text": q.get("text", q.get("question", "")),
        "options": q.get("options", []),
        "explanation": "",
        "difficulty": q.get("difficulty", ""),
        "topic": q.get("topic", ""),
    }


def session_detail(sess: dict[str, Any]) -> list[dict[str, Any]]:
    """Chi tiet cham tung cau (chi tra SAU KHI nop bai)."""
    answers = sess.get("answers") or {}
    out = []
    for q in sess.get("questions") or []:
        qid = str(q.get("id"))
        ua = answers.get(qid)
        try:
            ok = ua is not None and int(ua) == int(q.get("answer", -999))
        except Exception:
            ok = False
        out.append(
            {
                "id": q.get("id"),
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "userAnswer": ua,
                "correctAnswer": q.get("answer", 0),
                "isCorrect": bool(ok),
            }
        )
    return out


def finalize_session(sess: dict[str, Any]) -> None:
    """Thu bai + chot diem (dung chung cho nop tay, het gio, vi pham, dong phong)."""
    score, total = grade_session(sess.get("questions") or [], sess.get("answers") or {})
    sess["score"] = score
    sess["total"] = total
    sess["submitted"] = True
    sess["submitted_at"] = int(time.time())
    sess["updated_at"] = int(time.time())


def is_expired(room: dict[str, Any], sess: dict[str, Any]) -> bool:
    """Het gio lam bai chua (tinh tu deadline server, khong tin dong ho client)."""
    if sess.get("submitted"):
        return False
    deadline = sess.get("deadline")
    if not deadline:
        # session cu (truoc khi co deadline): suy ra tu joined_at + time_limit
        try:
            deadline = int(sess.get("joined_at", 0)) + int(room.get("time_limit") or 30) * 60
        except Exception:
            return False
    return int(time.time()) > int(deadline)


def join_room(code: str, participant: str, unit: str = "") -> tuple[dict[str, Any], dict[str, Any]]:
    room = get_room_by_code(code)
    if not room:
        raise ValueError("Mã phòng thi không tồn tại.")
    name = (participant or "").strip()
    if not name:
        raise ValueError("Vui lòng nhập tên để vào thi.")
    unit_name = (unit or "").strip()
    with _lock_for(room["id"], name):
        s = load_session(room["id"], name)
        if s is not None:
            # Vao lai: session da nop van xem duoc ket qua ke ca phong da dong.
            # Xoay ticket moi de chi 1 tab trinh duyet duoc phep lam bai
            # (phien cu tren may/tab khac mat hieu luc ngay).
            s["ticket"] = secrets.token_urlsafe(24)
            s["updated_at"] = int(time.time())
            s["unit"] = unit_name
            try:
                s["joins"] = int(s.get("joins") or 1) + 1
            except Exception:
                s["joins"] = 2
            if not s.get("submitted") and (room.get("status") != "open" or is_expired(room, s)):
                finalize_session(s)
            save_session(s)
            return room, s
        if room.get("status") != "open":
            raise ValueError("Phòng thi đã đóng.")
        questions = build_questions_for_participant(room)
        now = int(time.time())
        sess = {
            "room_id": room["id"],
            "participant": name,
            "unit": unit_name,
            "ticket": secrets.token_urlsafe(24),
            "questions": questions,
            "answers": {},
            "violations": 0,
            "joins": 1,
            "joined_at": now,
            "deadline": now + max(1, int(room.get("time_limit") or 30)) * 60,
            "updated_at": now,
            "submitted": False,
            "submitted_at": None,
            "score": 0,
            "total": len(questions),
        }
        save_session(sess)
        return room, sess


def check_ticket(sess: dict[str, Any], ticket: str) -> None:
    """Xac thuc phien lam bai. Session cu (chua co ticket) duoc cap phat lan dau."""
    if not sess.get("ticket"):
        sess["ticket"] = (ticket or "").strip() or secrets.token_urlsafe(24)
        return
    if (ticket or "").strip() != sess["ticket"]:
        raise ValueError("Phiên thi không hợp lệ (sai ticket). Hãy vào lại phòng thi.")


def leaderboard(room_id: str) -> list[dict[str, Any]]:
    rows = sessions_of(room_id)
    out = []
    for s in rows:
        answers = s.get("answers") or {}
        total = len(s.get("questions") or [])
        if s.get("submitted"):
            score = s.get("score", 0)
        else:
            score, _ = grade_session(s.get("questions") or [], answers)
        out.append(
            {
                "participant": s.get("participant"),
                "unit": s.get("unit", ""),
                "score": score,
                "total": total,
                "answered": len(answers),
                "violations": s.get("violations", 0),
                "joins": int(s.get("joins") or 1),
                "submitted": bool(s.get("submitted")),
                "submitted_at": s.get("submitted_at"),
                "updated_at": s.get("updated_at"),
            }
        )
    out.sort(key=lambda r: (-(r["score"] or 0), (r["violations"] or 0), str(r["participant"])))
    return out
