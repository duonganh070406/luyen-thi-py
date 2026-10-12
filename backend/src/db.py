"""Luu tru SQLite (thay flat-file JSON) cho EduQuest.

- File DB: DATA_ROOT/app.db (ton trong DATA_DIR), che do WAL + busy_timeout
  de nhieu thread doc song song, ghi tuan tu khong mat du lieu.
- File .md de thi / ghi chu / anh giu nguyen tren dia (SQLite khong chua blob).
- File JSON cu GIU LAI lam backup, khong xoa; migrate 1 lan khi DB moi tao.

13 bang: users, tokens, login_attempts, rooms, room_sessions, subjects,
bank_questions, history_attempts, reports, units, settings, ai_profiles.

Quy uoc: boolean luu INTEGER 0/1; object/list luu TEXT JSON (utf-8).
"""
from __future__ import annotations

import json
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

from src.config import BACKEND_DIR, DATA_ROOT

DB_PATH = DATA_ROOT / "app.db"

_SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  created_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tokens(
  token TEXT PRIMARY KEY,
  username TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  created_at INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER
);
CREATE TABLE IF NOT EXISTS login_attempts(
  username TEXT PRIMARY KEY,
  fails INTEGER NOT NULL DEFAULT 0,
  locked_until INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS rooms(
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  topics TEXT NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'Hon hop',
  count INTEGER NOT NULL DEFAULT 10,
  time_limit INTEGER NOT NULL DEFAULT 30,
  shuffle_questions INTEGER NOT NULL DEFAULT 1,
  shuffle_options INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open',
  created_by TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  max_violations INTEGER NOT NULL DEFAULT 3,
  auto_submit INTEGER NOT NULL DEFAULT 0,
  show_answers INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS room_sessions(
  room_id TEXT NOT NULL,
  participant TEXT NOT NULL,
  id_number TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  ticket TEXT NOT NULL DEFAULT '',
  questions TEXT NOT NULL DEFAULT '[]',
  answers TEXT NOT NULL DEFAULT '{}',
  violations INTEGER NOT NULL DEFAULT 0,
  joins INTEGER NOT NULL DEFAULT 1,
  joined_at INTEGER NOT NULL DEFAULT 0,
  deadline INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  submitted INTEGER NOT NULL DEFAULT 0,
  submitted_at INTEGER,
  score INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  manual_edit INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(room_id, participant, id_number)
);
CREATE INDEX IF NOT EXISTS idx_sessions_room ON room_sessions(room_id);
CREATE TABLE IF NOT EXISTS subjects(
  name TEXT PRIMARY KEY,
  active INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL DEFAULT '',
  other_information TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS bank_questions(
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL REFERENCES subjects(name) ON DELETE CASCADE,
  question TEXT NOT NULL DEFAULT '',
  options TEXT NOT NULL DEFAULT '[]',
  answer TEXT NOT NULL DEFAULT 'A',
  difficulty TEXT NOT NULL DEFAULT 'Trung binh',
  topic TEXT NOT NULL DEFAULT 'Chung',
  explanation TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_bank_subject ON bank_questions(subject);
CREATE TABLE IF NOT EXISTS history_attempts(
  attempt_id TEXT PRIMARY KEY,
  subject TEXT NOT NULL DEFAULT '',
  timestamp TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '{}',
  snapshot TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_history_subject ON history_attempts(subject);
CREATE TABLE IF NOT EXISTS reports(
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL DEFAULT '',
  question_id TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  reporter TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'moi',
  created_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_reports_subject ON reports(subject);
CREATE TABLE IF NOT EXISTS units(
  name TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS settings(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS ai_profiles(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL DEFAULT '',
  base_url TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT ''
);
"""

from contextlib import contextmanager
from collections.abc import Iterator


@contextmanager
def session() -> Iterator[sqlite3.Connection]:
    """Mo connection dung xong tu dong dong (doc/ghi ngan)."""
    conn = connect()
    try:
        yield conn
    finally:
        try:
            conn.close()
        except Exception:
            pass


_WRITE = threading.Lock()


@contextmanager
def transaction() -> Iterator[sqlite3.Connection]:
    """Ghi 1 cum thao tac duoi BEGIN IMMEDIATE (nguyen tu, tuan tu)."""
    conn = connect()
    try:
        with _WRITE:
            conn.execute("BEGIN IMMEDIATE")
            try:
                yield conn
                conn.execute("COMMIT")
            except Exception:
                try:
                    conn.execute("ROLLBACK")
                except Exception:
                    pass
                raise
    finally:
        try:
            conn.close()
        except Exception:
            pass


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(
        str(DB_PATH), timeout=30.0, isolation_level=None, check_same_thread=False
    )
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA busy_timeout=30000")
        conn.execute("PRAGMA foreign_keys=ON")
    except Exception:
        pass
    return conn


def _dump(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False)


def _load(text: Any, default: Any) -> Any:
    if text is None or text == "":
        return default
    try:
        return json.loads(text)
    except Exception:
        return default


def _write(conn: sqlite3.Connection, sql: str, params: tuple = ()) -> None:
    """Ghi tuan tu duoi lock + BEGIN IMMEDIATE (chong mat du lieu dong thoi)."""
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute(sql, params)
            conn.execute("COMMIT")
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


def _write_many(conn: sqlite3.Connection, sql: str, rows: list[tuple]) -> None:
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.executemany(sql, rows)
            conn.execute("COMMIT")
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- users ----------

def users_public(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    return [
        {"username": r["username"], "role": r["role"], "created_at": r["created_at"]}
        for r in conn.execute("SELECT username, role, created_at FROM users ORDER BY username")
    ]


def find_user(conn: sqlite3.Connection, username: str) -> dict[str, Any] | None:
    r = conn.execute(
        "SELECT username, password_hash, role, created_at FROM users WHERE username=?",
        ((username or "").strip(),),
    ).fetchone()
    return dict(r) if r else None


def create_user(conn: sqlite3.Connection, username: str, password_hash: str, role: str, created_at: int) -> None:
    _write(
        conn,
        "INSERT INTO users(username, password_hash, role, created_at) VALUES(?,?,?,?)",
        (username, password_hash, role, created_at),
    )


def set_password_hash(conn: sqlite3.Connection, username: str, password_hash: str) -> bool:
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            cur = conn.execute(
                "UPDATE users SET password_hash=? WHERE username=?", (password_hash, username)
            )
            conn.execute("COMMIT")
            return cur.rowcount > 0
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


def user_delete(conn: sqlite3.Connection, username: str) -> bool:
    """Xoa tai khoan + thu hoi het phien dang nhap. Tra ve True neu co xoa."""
    name = (username or "").strip()
    if not name:
        return False
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute("DELETE FROM tokens WHERE username=?", (name,))
            conn.execute("DELETE FROM login_attempts WHERE username=?", (name,))
            cur = conn.execute("DELETE FROM users WHERE username=?", (name,))
            conn.execute("COMMIT")
            return cur.rowcount > 0
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- tokens ----------

def token_get(conn: sqlite3.Connection, token: str) -> dict[str, Any] | None:
    r = conn.execute(
        "SELECT token, username, role, created_at, expires_at FROM tokens WHERE token=?",
        (token,),
    ).fetchone()
    return dict(r) if r else None


def token_put(
    conn: sqlite3.Connection, token: str, username: str, role: str,
    created_at: int, expires_at: int | None,
) -> None:
    _write(
        conn,
        "INSERT OR REPLACE INTO tokens(token, username, role, created_at, expires_at)"
        " VALUES(?,?,?,?,?)",
        (token, username, role, created_at, expires_at),
    )


def token_set_expiry(conn: sqlite3.Connection, token: str, expires_at: int) -> None:
    _write(conn, "UPDATE tokens SET expires_at=? WHERE token=?", (expires_at, token))


def token_delete(conn: sqlite3.Connection, token: str) -> None:
    _write(conn, "DELETE FROM tokens WHERE token=?", (token,))


def tokens_delete_user(conn: sqlite3.Connection, username: str) -> bool:
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            cur = conn.execute("DELETE FROM tokens WHERE username=?", (username,))
            conn.execute("COMMIT")
            return cur.rowcount > 0
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- login_attempts ----------

def attempt_get(conn: sqlite3.Connection, username: str) -> dict[str, Any]:
    r = conn.execute(
        "SELECT fails, locked_until FROM login_attempts WHERE username=?",
        ((username or "").strip(),),
    ).fetchone()
    if r:
        return {"fails": r["fails"], "locked_until": r["locked_until"]}
    return {"fails": 0, "locked_until": 0}


def attempt_put(conn: sqlite3.Connection, username: str, fails: int, locked_until: int) -> None:
    _write(
        conn,
        "INSERT INTO login_attempts(username, fails, locked_until) VALUES(?,?,?)"
        " ON CONFLICT(username) DO UPDATE SET fails=excluded.fails, locked_until=excluded.locked_until",
        ((username or "").strip(), fails, locked_until),
    )


def attempt_delete(conn: sqlite3.Connection, username: str) -> None:
    _write(conn, "DELETE FROM login_attempts WHERE username=?", ((username or "").strip(),))


# ---------- rooms ----------

_ROOM_COLS = (
    "id, code, name, subject, unit, topics, difficulty, count, time_limit,"
    " shuffle_questions, shuffle_options, status, created_by, created_at, max_violations,"
    " auto_submit, show_answers"
)


def _room_from_row(r: sqlite3.Row) -> dict[str, Any]:
    d = dict(r)
    d["topics"] = _load(d.get("topics"), [])
    d["shuffle_questions"] = bool(d.get("shuffle_questions", 1))
    d["shuffle_options"] = bool(d.get("shuffle_options", 1))
    d["auto_submit"] = bool(d.get("auto_submit", 0))
    d["show_answers"] = bool(d.get("show_answers", 1))
    return d


def rooms_all(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    return [_room_from_row(r) for r in conn.execute(f"SELECT {_ROOM_COLS} FROM rooms ORDER BY created_at")]


def room_by_id(conn: sqlite3.Connection, room_id: str) -> dict[str, Any] | None:
    r = conn.execute(f"SELECT {_ROOM_COLS} FROM rooms WHERE id=?", (room_id,)).fetchone()
    return _room_from_row(r) if r else None


def room_by_code(conn: sqlite3.Connection, code: str) -> dict[str, Any] | None:
    r = conn.execute(
        f"SELECT {_ROOM_COLS} FROM rooms WHERE code=?", ((code or "").strip().upper(),)
    ).fetchone()
    return _room_from_row(r) if r else None


def room_codes(conn: sqlite3.Connection) -> set[str]:
    return {r["code"] for r in conn.execute("SELECT code FROM rooms")}


def room_insert(conn: sqlite3.Connection, room: dict[str, Any]) -> None:
    _write(
        conn,
        "INSERT INTO rooms(id, code, name, subject, unit, topics, difficulty, count,"
        " time_limit, shuffle_questions, shuffle_options, status, created_by, created_at,"
        " max_violations, auto_submit, show_answers) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,?)",
        (
            room.get("id"), str(room.get("code", "")).strip().upper(),
            room.get("name", ""), room.get("subject", ""), room.get("unit", ""),
            _dump(room.get("topics") or []), room.get("difficulty") or "Hon hop",
            int(room.get("count") or 10), int(room.get("time_limit") or 30),
            1 if room.get("shuffle_questions", True) else 0,
            1 if room.get("shuffle_options", True) else 0,
            room.get("status", "open"), room.get("created_by", ""),
            int(room.get("created_at") or 0), int(room.get("max_violations") or 3),
            1 if room.get("auto_submit") else 0, 0 if room.get("show_answers") is False else 1,
        ),
    )


def room_upsert(conn: sqlite3.Connection, room: dict[str, Any]) -> None:
    _write(
        conn,
        "INSERT INTO rooms(id, code, name, subject, unit, topics, difficulty, count,"
        " time_limit, shuffle_questions, shuffle_options, status, created_by, created_at,"
        " max_violations, auto_submit, show_answers) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,?)"
        " ON CONFLICT(id) DO UPDATE SET code=excluded.code, name=excluded.name,"
        " subject=excluded.subject, unit=excluded.unit, topics=excluded.topics,"
        " difficulty=excluded.difficulty, count=excluded.count, time_limit=excluded.time_limit,"
        " shuffle_questions=excluded.shuffle_questions, shuffle_options=excluded.shuffle_options,"
        " status=excluded.status, created_by=excluded.created_by, created_at=excluded.created_at,"
        " max_violations=excluded.max_violations, auto_submit=excluded.auto_submit,"
        " show_answers=excluded.show_answers",
        (
            room.get("id"), str(room.get("code", "")).strip().upper(),
            room.get("name", ""), room.get("subject", ""), room.get("unit", ""),
            _dump(room.get("topics") or []), room.get("difficulty") or "Hon hop",
            int(room.get("count") or 10), int(room.get("time_limit") or 30),
            1 if room.get("shuffle_questions", True) else 0,
            1 if room.get("shuffle_options", True) else 0,
            room.get("status", "open"), room.get("created_by", ""),
            int(room.get("created_at") or 0), int(room.get("max_violations") or 3),
            1 if room.get("auto_submit") else 0, 0 if room.get("show_answers") is False else 1,
        ),
    )


def room_update_fields(conn: sqlite3.Connection, room_id: str, fields: dict[str, Any]) -> bool:
    cols: list[str] = []
    vals: list[Any] = []
    for k, v in fields.items():
        if k in ("name", "subject", "unit", "difficulty", "status", "created_by",
                 "count", "time_limit", "max_violations", "created_at",
                 "auto_submit", "show_answers"):
            cols.append(f"{k}=?")
            vals.append(v)
        elif k in ("shuffle_questions", "shuffle_options"):
            cols.append(f"{k}=?")
            vals.append(1 if v else 0)
        elif k == "topics":
            cols.append("topics=?")
            vals.append(_dump(v or []))
    if not cols:
        return room_by_id(conn, room_id) is not None
    vals.append(room_id)
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            cur = conn.execute(f"UPDATE rooms SET {', '.join(cols)} WHERE id=?", tuple(vals))
            hit = cur.rowcount > 0
            if not hit:
                # gia tri moi giong het gia tri cu -> van coi la thanh cong neu phong ton tai
                hit = conn.execute("SELECT 1 FROM rooms WHERE id=?", (room_id,)).fetchone() is not None
            conn.execute("COMMIT")
            return hit
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- room_sessions ----------

_SESS_COLS = (
    "room_id, participant, unit, id_number, ticket, questions, answers, violations, joins,"
    " joined_at, deadline, updated_at, submitted, submitted_at, score, total, manual_edit"
)


def _sess_from_row(r: sqlite3.Row) -> dict[str, Any]:
    d = dict(r)
    d["id_number"] = str(d.get("id_number") or "")
    d["questions"] = _load(d.get("questions"), [])
    d["answers"] = _load(d.get("answers"), {})
    for k in ("violations", "joins", "joined_at", "deadline", "updated_at", "score", "total"):
        try:
            d[k] = int(d.get(k) or 0)
        except Exception:
            d[k] = 0
    d["submitted"] = bool(d.get("submitted", 0))
    d["manual_edit"] = bool(d.get("manual_edit", 0))
    return d


def session_get(
    conn: sqlite3.Connection, room_id: str, participant: str, id_number: str = ""
) -> dict[str, Any] | None:
    """Doc session theo dinh danh (room, ho ten, CCCD)."""
    r = conn.execute(
        f"SELECT {_SESS_COLS} FROM room_sessions WHERE room_id=? AND participant=? AND id_number=?",
        (room_id, (participant or "").strip(), (id_number or "").strip()),
    ).fetchone()
    return _sess_from_row(r) if r else None


def session_get_by_name(conn: sqlite3.Connection, room_id: str, participant: str) -> list[dict[str, Any]]:
    """Tat ca session cung ho ten trong 1 phong (phuc vu fallback client cu)."""
    return [
        _sess_from_row(r)
        for r in conn.execute(
            f"SELECT {_SESS_COLS} FROM room_sessions WHERE room_id=? AND participant=?",
            (room_id, (participant or "").strip()),
        ).fetchall()
    ]


def session_put(conn: sqlite3.Connection, sess: dict[str, Any]) -> None:
    _write(
        conn,
        "INSERT INTO room_sessions(room_id, participant, unit, id_number, ticket, questions, answers,"
        " violations, joins, joined_at, deadline, updated_at, submitted, submitted_at,"
        " score, total, manual_edit) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
        " ON CONFLICT(room_id, participant, id_number) DO UPDATE SET unit=excluded.unit,"
        " ticket=excluded.ticket, questions=excluded.questions, answers=excluded.answers,"
        " violations=excluded.violations, joins=excluded.joins, joined_at=excluded.joined_at,"
        " deadline=excluded.deadline, updated_at=excluded.updated_at,"
        " submitted=excluded.submitted, submitted_at=excluded.submitted_at,"
        " score=excluded.score, total=excluded.total, manual_edit=excluded.manual_edit",
        (
            str(sess.get("room_id", "")), str(sess.get("participant", "")),
            str(sess.get("unit") or ""), str(sess.get("id_number") or ""),
            str(sess.get("ticket") or ""),
            _dump(sess.get("questions") or []), _dump(sess.get("answers") or {}),
            int(sess.get("violations") or 0), int(sess.get("joins") or 1),
            int(sess.get("joined_at") or 0), int(sess.get("deadline") or 0),
            int(sess.get("updated_at") or 0), 1 if sess.get("submitted") else 0,
            sess.get("submitted_at"), int(sess.get("score") or 0),
            int(sess.get("total") or 0), 1 if sess.get("manual_edit") else 0,
        ),
    )


def sessions_of_room(conn: sqlite3.Connection, room_id: str) -> list[dict[str, Any]]:
    return [
        _sess_from_row(r)
        for r in conn.execute(
            f"SELECT {_SESS_COLS} FROM room_sessions WHERE room_id=? ORDER BY participant", (room_id,)
        )
    ]


def sessions_all(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    return [
        _sess_from_row(r)
        for r in conn.execute(f"SELECT {_SESS_COLS} FROM room_sessions ORDER BY room_id, participant")
    ]


# ---------- subjects ----------

def subjects_all(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    return [
        {
            "name": r["name"],
            "active": bool(r["active"]),
            "description": r["description"] or "",
            "other_information": r["other_information"] or "",
        }
        for r in conn.execute("SELECT name, active, description, other_information FROM subjects ORDER BY name")
    ]


def subject_get(conn: sqlite3.Connection, name: str) -> dict[str, Any] | None:
    r = conn.execute(
        "SELECT name, active, description, other_information FROM subjects WHERE name=?",
        ((name or "").strip(),),
    ).fetchone()
    if not r:
        return None
    return {
        "name": r["name"], "active": bool(r["active"]),
        "description": r["description"] or "", "other_information": r["other_information"] or "",
    }


def subject_ensure(conn: sqlite3.Connection, name: str) -> None:
    name = (name or "").strip()
    if not name:
        return
    _write(
        conn,
        "INSERT INTO subjects(name, active, description, other_information)"
        " VALUES(?,1,'','') ON CONFLICT(name) DO NOTHING",
        (name,),
    )


def subject_save_config(conn: sqlite3.Connection, name: str, active: bool, description: str, other: str) -> None:
    subject_ensure(conn, name)
    _write(
        conn,
        "UPDATE subjects SET active=?, description=?, other_information=? WHERE name=?",
        (1 if active else 0, description or "", other or "", (name or "").strip()),
    )


# ---------- bank ----------

_BANK_COLS = "id, subject, question, options, answer, difficulty, topic, explanation, created_at, updated_at"


def _bank_from_row(r: sqlite3.Row) -> dict[str, Any]:
    d = dict(r)
    d["options"] = _load(d.get("options"), [])
    return d


def bank_list(conn: sqlite3.Connection, subject: str) -> list[dict[str, Any]]:
    return [
        _bank_from_row(r)
        for r in conn.execute(
            f"SELECT {_BANK_COLS} FROM bank_questions WHERE subject=? ORDER BY created_at, id",
            ((subject or "").strip(),),
        )
    ]


def bank_replace(conn: sqlite3.Connection, subject: str, items: list[dict[str, Any]]) -> None:
    subject_ensure(conn, subject)
    rows = [
        (
            q.get("id"), (subject or "").strip(), q.get("question", ""),
            _dump(q.get("options") or []), q.get("answer", "A"),
            q.get("difficulty", "Trung binh"), q.get("topic", "Chung"),
            q.get("explanation", ""), int(q.get("created_at") or 0), int(q.get("updated_at") or 0),
        )
        for q in items
    ]
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute("DELETE FROM bank_questions WHERE subject=?", ((subject or "").strip(),))
            if rows:
                conn.executemany(
                    "INSERT INTO bank_questions(id, subject, question, options, answer,"
                    " difficulty, topic, explanation, created_at, updated_at)"
                    " VALUES(?,?,?,?,?,?,?,?,?,?)",
                    rows,
                )
            conn.execute("COMMIT")
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


def bank_count(conn: sqlite3.Connection, subject: str) -> int:
    r = conn.execute(
        "SELECT COUNT(*) AS n FROM bank_questions WHERE subject=?", ((subject or "").strip(),)
    ).fetchone()
    return int(r["n"]) if r else 0


def bank_delete(conn: sqlite3.Connection, subject: str, qid: str) -> bool:
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            cur = conn.execute(
                "DELETE FROM bank_questions WHERE subject=? AND id=?", ((subject or "").strip(), qid)
            )
            conn.execute("COMMIT")
            return cur.rowcount > 0
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- history ----------

def history_list(conn: sqlite3.Connection, subject: str) -> list[dict[str, Any]]:
    out = []
    for r in conn.execute(
        "SELECT attempt_id, timestamp, summary, snapshot FROM history_attempts"
        " WHERE subject=? ORDER BY rowid",
        ((subject or "").strip(),),
    ):
        # giu dung thu tu key cu: attemptId, timestamp, summary, snapshot
        out.append(
            {
                "attemptId": r["attempt_id"],
                "timestamp": r["timestamp"] or "",
                "summary": _load(r["summary"], {}),
                "snapshot": _load(r["snapshot"], []),
            }
        )
    return out


def history_add(conn: sqlite3.Connection, subject: str, attempt: dict[str, Any]) -> None:
    _write(
        conn,
        "INSERT OR REPLACE INTO history_attempts(attempt_id, subject, timestamp, summary, snapshot)"
        " VALUES(?,?,?,?,?)",
        (
            str(attempt.get("attemptId", "")), (subject or "").strip(),
            str(attempt.get("timestamp", "")), _dump(attempt.get("summary") or {}),
            _dump(attempt.get("snapshot") or []),
        ),
    )


def history_delete(conn: sqlite3.Connection, subject: str, attempt_id: str) -> bool:
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            cur = conn.execute(
                "DELETE FROM history_attempts WHERE subject=? AND attempt_id=?",
                ((subject or "").strip(), attempt_id),
            )
            conn.execute("COMMIT")
            return cur.rowcount > 0
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- reports ----------

def reports_list(conn: sqlite3.Connection, subject: str) -> list[dict[str, Any]]:
    return [
        {
            "id": r["id"], "question_id": r["question_id"], "message": r["message"],
            "reporter": r["reporter"], "status": r["status"], "created_at": r["created_at"],
        }
        for r in conn.execute(
            "SELECT id, question_id, message, reporter, status, created_at FROM reports"
            " WHERE subject=? ORDER BY created_at",
            ((subject or "").strip(),),
        )
    ]


def report_add(conn: sqlite3.Connection, rep: dict[str, Any]) -> None:
    subject_ensure(conn, str(rep.get("subject", "")))
    _write(
        conn,
        "INSERT INTO reports(id, subject, question_id, message, reporter, status, created_at)"
        " VALUES(?,?,?,?,?,?,?)",
        (
            rep.get("id"), str(rep.get("subject", "")), str(rep.get("question_id", "")),
            str(rep.get("message", "")), str(rep.get("reporter", "")),
            str(rep.get("status", "moi")), int(rep.get("created_at") or 0),
        ),
    )


def report_set_status(conn: sqlite3.Connection, subject: str, rid: str, status: str) -> bool:
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            cur = conn.execute(
                "UPDATE reports SET status=? WHERE subject=? AND id=?",
                (status, (subject or "").strip(), rid),
            )
            conn.execute("COMMIT")
            return cur.rowcount > 0
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- units ----------

def units_all(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    return [{"name": r["name"]} for r in conn.execute("SELECT name FROM units ORDER BY name")]


def unit_add(conn: sqlite3.Connection, name: str) -> bool:
    try:
        _write(conn, "INSERT INTO units(name) VALUES(?)", ((name or "").strip(),))
        return True
    except sqlite3.IntegrityError:
        return False


def unit_delete(conn: sqlite3.Connection, name: str) -> bool:
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            cur = conn.execute(
                "DELETE FROM units WHERE lower(name)=lower(?)", ((name or "").strip(),)
            )
            conn.execute("COMMIT")
            return cur.rowcount > 0
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- settings + ai_profiles ----------

def setting_get(conn: sqlite3.Connection, key: str, default: str = "") -> str:
    r = conn.execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
    return r["value"] if r else default


def setting_set(conn: sqlite3.Connection, key: str, value: str) -> None:
    _write(
        conn,
        "INSERT INTO settings(key, value) VALUES(?,?)"
        " ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        (key, value),
    )


def ai_profiles_all(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    return [
        {
            "id": r["id"], "name": r["name"] or "", "aiApiKey": r["api_key"] or "",
            "aiBaseUrl": r["base_url"] or "", "aiModel": r["model"] or "",
        }
        for r in conn.execute("SELECT id, name, api_key, base_url, model FROM ai_profiles ORDER BY id")
    ]


def ai_profiles_replace(conn: sqlite3.Connection, profiles: list[dict[str, Any]]) -> None:
    rows = [
        (p.get("id"), p.get("name", ""), p.get("aiApiKey", ""), p.get("aiBaseUrl", ""), p.get("aiModel", ""))
        for p in profiles if isinstance(p, dict) and str(p.get("id", "")).strip()
    ]
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute("DELETE FROM ai_profiles")
            if rows:
                conn.executemany(
                    "INSERT INTO ai_profiles(id, name, api_key, base_url, model) VALUES(?,?,?,?,?)", rows
                )
            conn.execute("COMMIT")
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


# ---------- migrate tu JSON cu ----------

def _read_json_file(path: Path, default: Any) -> Any:
    try:
        if not path.is_file():
            return default
        text = path.read_text(encoding="utf-8")
        if not text.strip():
            return default
        return json.loads(text)
    except Exception:
        return default


def _migrate_from_json(conn: sqlite3.Connection) -> dict[str, int]:
    """Doc toan bo JSON cu trong DATA_ROOT (+ ai_config) nap vao DB. Tra ve so luong."""
    import hashlib as _hashlib
    import secrets as _secrets

    counts: dict[str, int] = {}
    root = DATA_ROOT

    def _pbkdf2(pw: str) -> str:
        salt = _secrets.token_hex(16)
        dk = _hashlib.pbkdf2_hmac("sha256", (pw or "").encode("utf-8"), salt.encode("utf-8"), 200_000)
        return f"pbkdf2$200000${salt}${dk.hex()}"

    # 1. users (va user mat hash: admin -> dat lai admin123 de dang nhap duoc)
    users = _read_json_file(root / "users.json", [])
    n = 0
    if isinstance(users, list):
        for u in users:
            if not isinstance(u, dict) or not str(u.get("username", "")).strip():
                continue
            name = str(u["username"]).strip()
            stored = str(u.get("password_hash", "") or "")
            if not stored and name == "admin":
                stored = _pbkdf2("admin123")
                print(f"[migrate] admin mat password_hash -> dat lai mat khau mac dinh admin123")
            try:
                create_user(conn, name, stored, u.get("role", "user") or "user", int(u.get("created_at") or 0))
                n += 1
            except sqlite3.IntegrityError:
                pass
    counts["users"] = n

    # 2. tokens
    toks = _read_json_file(root / "tokens.json", {})
    n = 0
    if isinstance(toks, dict):
        for tok, info in toks.items():
            if not isinstance(info, dict):
                continue
            try:
                exp = info.get("expires_at")
                token_put(
                    conn, str(tok), str(info.get("username", "")),
                    str(info.get("role", "user")), int(info.get("created_at") or 0),
                    int(exp) if isinstance(exp, int) else None,
                )
                n += 1
            except Exception:
                pass
    counts["tokens"] = n

    # 3. login_attempts
    atts = _read_json_file(root / "login_attempts.json", {})
    n = 0
    if isinstance(atts, dict):
        for name, rec in atts.items():
            if not isinstance(rec, dict):
                continue
            try:
                attempt_put(conn, str(name), int(rec.get("fails", 0) or 0), int(rec.get("locked_until", 0) or 0))
                n += 1
            except Exception:
                pass
    counts["login_attempts"] = n

    # 4. rooms
    rooms = _read_json_file(root / "rooms.json", [])
    n = 0
    if isinstance(rooms, list):
        for r in rooms:
            if not isinstance(r, dict) or not r.get("id"):
                continue
            try:
                room_insert(conn, r)
                n += 1
            except sqlite3.IntegrityError:
                pass
    counts["rooms"] = n

    # 5. sessions: file legacy gop + moi thi sinh 1 file (file rieng thang khi trung)
    merged: dict[tuple[str, str], dict] = {}
    legacy = _read_json_file(root / "room_sessions.json", [])
    if isinstance(legacy, list):
        for s in legacy:
            if isinstance(s, dict) and s.get("room_id") and s.get("participant"):
                merged[(str(s["room_id"]), str(s["participant"]))] = s
    base = root / "room_sessions"
    if base.is_dir():
        for room_dir in sorted(base.iterdir()):
            if not room_dir.is_dir():
                continue
            for p in sorted(room_dir.glob("*.json")):
                s = _read_json_file(p, None)
                if isinstance(s, dict) and s.get("room_id") and s.get("participant"):
                    merged[(str(s["room_id"]), str(s["participant"]))] = s
    n = 0
    for s in merged.values():
        try:
            session_put(conn, s)
            n += 1
        except Exception:
            pass
    counts["room_sessions"] = n

    # 6. units
    units = _read_json_file(root / "units.json", [])
    n = 0
    if isinstance(units, list):
        seen: set[str] = set()
        for u in units:
            name = str((u or {}).get("name", "")).strip() if isinstance(u, dict) else ""
            if name and name.lower() not in seen:
                seen.add(name.lower())
                if unit_add(conn, name):
                    n += 1
    counts["units"] = n

    # 7. contact -> settings
    contact = _read_json_file(root / "contact.json", None)
    if isinstance(contact, dict):
        if str(contact.get("email", "")).strip():
            setting_set(conn, "contact.email", str(contact["email"]).strip())
        if str(contact.get("phone", "")).strip():
            setting_set(conn, "contact.phone", str(contact["phone"]).strip())
        counts["contact"] = 1
    else:
        counts["contact"] = 0

    # 8. ai_config.json (nam ngoai DATA_ROOT, trong backend/config)
    ai = _read_json_file(BACKEND_DIR / "config" / "ai_config.json", None)
    if isinstance(ai, dict):
        if "profiles" not in ai and ("aiApiKey" in ai or "aiBaseUrl" in ai or "aiModel" in ai):
            ai = {
                "enableAIGrading": bool(ai.get("enableAIGrading", True)),
                "activeProfileId": "default",
                "profiles": [{
                    "id": "default", "name": "Google Gemini (Migrated)",
                    "aiApiKey": str(ai.get("aiApiKey", "")).strip(),
                    "aiBaseUrl": str(ai.get("aiBaseUrl", "")).strip(),
                    "aiModel": str(ai.get("aiModel", "")).strip(),
                }],
            }
        setting_set(conn, "ai.enable_grading", "1" if ai.get("enableAIGrading", True) else "0")
        if ai.get("activeProfileId") is not None:
            setting_set(conn, "ai.active_profile", str(ai["activeProfileId"]))
        profs = [p for p in (ai.get("profiles") or []) if isinstance(p, dict) and str(p.get("id", "")).strip()]
        if profs:
            ai_profiles_replace(conn, [
                {"id": str(p["id"]), "name": str(p.get("name", "")), "aiApiKey": str(p.get("aiApiKey", "")).strip(),
                 "aiBaseUrl": str(p.get("aiBaseUrl", "")).strip(), "aiModel": str(p.get("aiModel", "")).strip()}
                for p in profs
            ])
        counts["ai_profiles"] = len(profs)
    else:
        counts["ai_profiles"] = 0

    # 9. subjects: config + bank + history + reports theo tung thu muc mon
    n_sub = n_q = n_h = n_r = 0
    if root.is_dir():
        for entry in sorted(root.iterdir(), key=lambda p: p.name.lower()):
            if not entry.is_dir() or entry.name == "room_sessions":
                continue
            has_bank = (entry / "questions.json").is_file()
            has_md = next((entry / "markdown").rglob("*.md"), None) is not None if (entry / "markdown").is_dir() else False
            if not has_bank and not has_md:
                continue
            name = entry.name
            cfg = _read_json_file(entry / "subject_config.json", {})
            cfg = cfg if isinstance(cfg, dict) else {}
            subject_ensure(conn, name)
            subject_save_config(
                conn, name, bool(cfg.get("active", True)),
                str(cfg.get("description", "") or ""), str(cfg.get("other_information", "") or ""),
            )
            n_sub += 1
            bank = _read_json_file(entry / "questions.json", [])
            if isinstance(bank, list):
                items = [q for q in bank if isinstance(q, dict) and q.get("id")]
                if items:
                    bank_replace(conn, name, [
                        {
                            "id": str(q.get("id")), "question": str(q.get("question", "")),
                            "options": q.get("options") or [], "answer": str(q.get("answer", "A")),
                            "difficulty": str(q.get("difficulty", "Trung binh")),
                            "topic": str(q.get("topic", "Chung")),
                            "explanation": str(q.get("explanation", "")),
                            "created_at": int(q.get("created_at") or 0),
                            "updated_at": int(q.get("updated_at") or 0),
                        }
                        for q in items
                    ])
                    n_q += len(items)
            hist = _read_json_file(entry / "history.json", [])
            if isinstance(hist, list):
                for att in hist:
                    if not isinstance(att, dict) or not att.get("attemptId"):
                        continue
                    try:
                        history_add(conn, name, att)
                        n_h += 1
                    except Exception:
                        pass
            reps = _read_json_file(entry / "reports.json", [])
            if isinstance(reps, list):
                for r in reps:
                    if not isinstance(r, dict) or not r.get("id"):
                        continue
                    try:
                        report_add(conn, {
                            "id": str(r.get("id")), "subject": name,
                            "question_id": str(r.get("question_id", "")),
                            "message": str(r.get("message", "")),
                            "reporter": str(r.get("reporter", "")),
                            "status": str(r.get("status", "moi")),
                            "created_at": int(r.get("created_at") or 0),
                        })
                        n_r += 1
                    except Exception:
                        pass
    counts["subjects"] = n_sub
    counts["bank_questions"] = n_q
    counts["history_attempts"] = n_h
    counts["reports"] = n_r
    return counts


def _ensure_seed_admin(conn: sqlite3.Connection) -> None:
    import hashlib as _hashlib
    import secrets as _secrets

    u = find_user(conn, "admin")
    if u is None:
        salt = _secrets.token_hex(16)
        dk = _hashlib.pbkdf2_hmac("sha256", b"admin123", salt.encode(), 200_000)
        create_user(conn, "admin", f"pbkdf2$200000${salt}${dk.hex()}", "admin", int(time.time()))
        print("[db] da tao tai khoan admin mac dinh (admin123)")


def _migrate_sessions_pk(conn: sqlite3.Connection) -> bool:
    """Nang PK room_sessions (room_id, participant) -> (room_id, participant, id_number).

    DB cu: 2 thi sinh trung ho ten dung chung 1 dong. Rebuild bang trong
    transaction, giu nguyen du lieu (id_number thieu -> ''). Tra ve True neu da rebuild.
    """
    row = conn.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='room_sessions'"
    ).fetchone()
    sql = str((row["sql"] if row else "") or "")
    if "PRIMARY KEY(room_id, participant, id_number)" in sql:
        return False
    have = {c["name"] for c in conn.execute("PRAGMA table_info(room_sessions)").fetchall()}
    if not have:
        return False
    cols = ["room_id", "participant", "id_number", "unit", "ticket", "questions", "answers",
            "violations", "joins", "joined_at", "deadline", "updated_at", "submitted",
            "submitted_at", "score", "total", "manual_edit"]
    collist = ", ".join(cols)
    sellist = ", ".join("'' AS id_number" if (c == "id_number" and c not in have) else c for c in cols)
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute(
                "CREATE TABLE room_sessions_new("
                " room_id TEXT NOT NULL, participant TEXT NOT NULL,"
                " id_number TEXT NOT NULL DEFAULT '', unit TEXT NOT NULL DEFAULT '',"
                " ticket TEXT NOT NULL DEFAULT '', questions TEXT NOT NULL DEFAULT '[]',"
                " answers TEXT NOT NULL DEFAULT '{}', violations INTEGER NOT NULL DEFAULT 0,"
                " joins INTEGER NOT NULL DEFAULT 1, joined_at INTEGER NOT NULL DEFAULT 0,"
                " deadline INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0,"
                " submitted INTEGER NOT NULL DEFAULT 0, submitted_at INTEGER,"
                " score INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0,"
                " manual_edit INTEGER NOT NULL DEFAULT 0,"
                " PRIMARY KEY(room_id, participant, id_number))"
            )
            conn.execute(
                f"INSERT INTO room_sessions_new({collist}) SELECT {collist} FROM room_sessions"
            )
            conn.execute("DROP TABLE room_sessions")
            conn.execute("ALTER TABLE room_sessions_new RENAME TO room_sessions")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_room ON room_sessions(room_id)")
            conn.execute("COMMIT")
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise
    return True


def subject_delete(conn: sqlite3.Connection, name: str) -> bool:
    """Xoa ca bo de: cau hoi + dong subject. Tra ve True neu co xoa."""
    name = (name or "").strip()
    if not name:
        return False
    with _WRITE:
        conn.execute("BEGIN IMMEDIATE")
        try:
            conn.execute("DELETE FROM bank_questions WHERE subject=?", (name,))
            cur = conn.execute("DELETE FROM subjects WHERE name=?", (name,))
            conn.execute("COMMIT")
            return cur.rowcount > 0
        except Exception:
            try:
                conn.execute("ROLLBACK")
            except Exception:
                pass
            raise


def _backup_db() -> None:
    """Sao luu app.db (tối đa 1 bản/ngày, giữ 7 bản mới nhất).

    Dung SQLite backup API nen an toan ngay khi DB dang mo (WAL).
    """
    try:
        bdir = DATA_ROOT / "backups"
        bdir.mkdir(parents=True, exist_ok=True)
        existing = sorted(bdir.glob("app-*.db"))
        now = int(time.time())
        if existing:
            newest = existing[-1]
            try:
                if now - int(newest.stat().st_mtime) < 24 * 3600:
                    return
            except Exception:
                pass
        stamp = time.strftime("%Y%m%d-%H%M%S", time.localtime(now))
        dest = bdir / f"app-{stamp}.db"
        src = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
        try:
            dst = sqlite3.connect(str(dest))
            try:
                src.backup(dst)
            finally:
                dst.close()
        finally:
            src.close()
        for old in sorted(bdir.glob("app-*.db"))[:-7]:
            try:
                old.unlink()
            except Exception:
                pass
    except Exception as e:
        print(f"[db] canh bao backup: {e}")


def _purge_expired_tokens(conn: sqlite3.Connection) -> None:
    """Xoa token het han (giai phong DB)."""
    try:
        conn.execute("DELETE FROM tokens WHERE expires_at IS NOT NULL AND expires_at < ?", (int(time.time()),))
        conn.commit()
    except Exception:
        pass


_INITIALIZED = False
_INIT_LOCK = threading.Lock()


def init_db() -> dict[str, int] | None:
    """Tao schema + migrate JSON cu neu DB moi. Tra ve so luong migrate (None neu DB da co)."""
    global _INITIALIZED
    with _INIT_LOCK:
        if _INITIALIZED:
            return None
        fresh = not DB_PATH.is_file()
        conn = connect()
        try:
            conn.executescript(_SCHEMA)
            # DB cu (tao truoc khi co 2 cot nay): them neu thieu
            for ddl in (
                "ALTER TABLE rooms ADD COLUMN auto_submit INTEGER NOT NULL DEFAULT 0",
                "ALTER TABLE rooms ADD COLUMN show_answers INTEGER NOT NULL DEFAULT 1",
                "ALTER TABLE room_sessions ADD COLUMN id_number TEXT NOT NULL DEFAULT ''",
            ):
                try:
                    conn.execute(ddl)
                except Exception:
                    pass
            try:
                if _migrate_sessions_pk(conn):
                    print("[db] da nang PK room_sessions -> (room_id, participant, id_number)")
            except Exception as e:
                print(f"[db] canh bao migrate PK sessions: {e}")
            _purge_expired_tokens(conn)
            counts: dict[str, int] | None = None
            if fresh:
                counts = _migrate_from_json(conn)
                print(f"[db] migrate JSON -> SQLite xong: {counts}")
            _backup_db()
            _ensure_seed_admin(conn)
            _INITIALIZED = True
            return counts
        finally:
            conn.close()
