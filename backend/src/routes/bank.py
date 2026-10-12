"""API ngan hang de + import Excel/CSV + luyen thi + ML + bao loi."""
from __future__ import annotations

import random
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from pydantic import BaseModel

from src import auth as auth_store
from src import bank as bank_store
from src.utils import history_path, read_json_list, resolve_subject_dir

router = APIRouter()


# ---------- Ngan hang de ----------

@router.get("/api/subjects/{subject}/bank")
def get_bank(subject: str, topic: str = "", difficulty: str = "") -> dict[str, Any]:
    items = bank_store.load_bank(subject)
    if topic:
        items = [q for q in items if str(q.get("topic", "")).strip().lower() == topic.strip().lower()]
    if difficulty and difficulty.strip().lower() not in ("hon hop", "tat ca", "all", ""):
        want = bank_store.normalize_difficulty(difficulty)
        items = [q for q in items if bank_store.normalize_difficulty(q.get("difficulty")) == want]
    return {"items": items, "total": len(items), "counts": bank_store.bank_counts(subject)}


@router.get("/api/subjects/{subject}/bank/topics")
def get_topics(subject: str) -> dict[str, Any]:
    return {"topics": bank_store.bank_topics(subject), "counts": bank_store.bank_counts(subject)}


class BankCreateBody(BaseModel):
    question: str
    options: list[str]
    answer: str = "A"
    difficulty: str = "Trung binh"
    topic: str = "Chung"
    explanation: str = ""


@router.post("/api/subjects/{subject}/bank", status_code=201)
def add_question(
    subject: str,
    body: BankCreateBody,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
):
    if not body.question.strip() or len(body.options) < 2:
        raise HTTPException(status_code=400, detail="Câu hỏi cần nội dung + ít nhất 2 phương án.")
    res = bank_store.import_items(
        subject,
        [
            {
                "question": body.question.strip(),
                "options": [o for o in body.options if str(o).strip()],
                "answer": bank_store.normalize_answer(body.answer, len(body.options)),
                "difficulty": bank_store.normalize_difficulty(body.difficulty),
                "topic": body.topic.strip() or "Chung",
                "explanation": body.explanation,
            }
        ],
    )
    return {"ok": True, **res}


class BankUpdateBody(BaseModel):
    question: str | None = None
    options: list[str] | None = None
    answer: str | None = None
    difficulty: str | None = None
    topic: str | None = None
    explanation: str | None = None


@router.put("/api/subjects/{subject}/bank/{qid}")
def update_question(
    subject: str,
    qid: str,
    body: BankUpdateBody,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
):
    items = bank_store.load_bank(subject)
    found = False
    for q in items:
        if str(q.get("id")) == qid:
            found = True
            if body.question is not None:
                q["question"] = body.question
            if body.options is not None:
                q["options"] = body.options
            if body.answer is not None:
                q["answer"] = bank_store.normalize_answer(body.answer, len(q.get("options", []) or [1, 2]))
            if body.difficulty is not None:
                q["difficulty"] = bank_store.normalize_difficulty(body.difficulty)
            if body.topic is not None:
                q["topic"] = body.topic
            if body.explanation is not None:
                q["explanation"] = body.explanation
            q["updated_at"] = int(time.time())
    if not found:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi.")
    bank_store.save_bank(subject, items)
    return {"ok": True}


@router.delete("/api/subjects/{subject}/bank/{qid}")
def delete_question(
    subject: str,
    qid: str,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
):
    items = bank_store.load_bank(subject)
    rest = [q for q in items if str(q.get("id")) != qid]
    if len(rest) == len(items):
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi.")
    bank_store.save_bank(subject, rest)
    return {"ok": True, "total": len(rest)}


# ---------- Import Excel/CSV (format image.png) ----------

def _sanitize_subject_name(subject: str) -> str:
    name = (subject or "").strip()
    if not name or "/" in name or "\\" in name or ".." in name:
        raise HTTPException(status_code=400, detail="Tên bộ câu hỏi không hợp lệ.")
    return name


@router.post("/api/import/preview")
async def import_preview(
    file: UploadFile,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
) -> dict[str, Any]:
    """Doc file Excel/CSV va tra ve cau hoi PHAN TICH DUOC ma KHONG luu.
    Frontend hien preview, user sua ten bo de roi bam Luu (goi PUT bank)."""
    name = (file.filename or "").strip()
    lower = name.lower()
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="File rỗng.")
    try:
        if lower.endswith(".csv"):
            rows = bank_store.read_csv_bytes(data)
        elif lower.endswith((".xlsx", ".xlsm", ".xltx")):
            rows = bank_store.read_xlsx_bytes(data)
        elif lower.endswith(".xls"):
            raise HTTPException(status_code=400, detail="File .xls cũ không được hỗ trợ. Hãy Save As .xlsx hoặc .csv.")
        else:
            try:
                rows = bank_store.read_csv_bytes(data)
            except Exception:
                raise HTTPException(status_code=400, detail="Định dạng không hỗ trợ. Hãy dùng .xlsx hoặc .csv.")
        items, errors = bank_store.parse_rows(rows)
        stem = name.rsplit(".", 1)[0].strip() if "." in name else name
        return {
            "ok": True,
            "filename": name,
            "suggested": stem,
            "items": items,
            "errors": errors[:20],
            "total": len(items),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi đọc file: {e}")


class BankReplaceBody(BaseModel):
    items: list[dict[str, Any]] = []


@router.put("/api/subjects/{subject}/bank")
def replace_bank(
    subject: str,
    body: BankReplaceBody,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
) -> dict[str, Any]:
    """Ghi DE TOAN BO ngan hang de (tao bo moi neu chua co).
    Dung cho: Luu bo de sau khi preview import + Luu thay doi sau khi sua staged."""
    from src.config import DATA_ROOT

    name = _sanitize_subject_name(subject)
    subject_dir = DATA_ROOT / name
    subject_dir.mkdir(parents=True, exist_ok=True)
    (subject_dir / "markdown").mkdir(parents=True, exist_ok=True)

    clean: list[dict[str, Any]] = []
    errors: list[str] = []
    seen_ids: set[str] = set()
    n = 0
    for i, raw in enumerate(body.items or []):
        if not isinstance(raw, dict):
            continue
        q_text = str(raw.get("question") or "").strip()
        if not q_text:
            continue
        opts = [str(o).strip() for o in (raw.get("options") or []) if str(o or "").strip()]
        if len(opts) < 2:
            errors.append(f"Câu {i + 1}: cần ít nhất 2 phương án (đã bỏ qua).")
            continue
        letter = bank_store.normalize_answer(raw.get("answer"), len(opts))
        qid = str(raw.get("id") or "").strip()
        if not qid or qid in seen_ids or qid.startswith("new_"):
            n += 1
            qid = f"q_{int(time.time())}_{n}"
            while qid in seen_ids:
                n += 1
                qid = f"q_{int(time.time())}_{n}"
        seen_ids.add(qid)
        clean.append(
            {
                "id": qid,
                "question": q_text,
                "options": opts,
                "answer": letter,
                "difficulty": bank_store.normalize_difficulty(raw.get("difficulty")),
                "topic": str(raw.get("topic") or "").strip() or "Chung",
                "explanation": str(raw.get("explanation") or ""),
                "created_at": int(time.time()),
                "updated_at": int(time.time()),
            }
        )
    bank_store.save_bank(name, clean)
    return {"ok": True, "saved": len(clean), "total": len(clean), "errors": errors[:20]}


@router.post("/api/subjects/{subject}/import")
async def import_file(
    subject: str,
    file: UploadFile,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
) -> dict[str, Any]:
    # Dam bao mon ton tai (tu tao thu muc neu chua co)
    from src.config import DATA_ROOT

    name = (file.filename or "").strip()
    lower = name.lower()
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="File rỗng.")
    try:
        if lower.endswith(".csv"):
            rows = bank_store.read_csv_bytes(data)
        elif lower.endswith((".xlsx", ".xlsm", ".xltx")):
            rows = bank_store.read_xlsx_bytes(data)
        elif lower.endswith(".xls"):
            raise HTTPException(status_code=400, detail="File .xls cũ không được hỗ trợ. Hãy Save As .xlsx hoặc .csv.")
        else:
            # thu doan csv truoc, neu that bai thi bao loi dinh dang
            try:
                rows = bank_store.read_csv_bytes(data)
            except Exception:
                raise HTTPException(status_code=400, detail="Định dạng không hỗ trợ. Hãy dùng .xlsx hoặc .csv.")
        items, errors = bank_store.parse_rows(rows)
        if not items:
            raise HTTPException(
                status_code=400,
                detail="Không đọc được câu hỏi nào. " + (" ".join(errors[:3])),
            )
        # tu tao subject dir neu chua co
        subject_dir = DATA_ROOT / subject.strip()
        subject_dir.mkdir(parents=True, exist_ok=True)
        (subject_dir / "markdown").mkdir(parents=True, exist_ok=True)
        res = bank_store.import_items(subject, items)
        return {"ok": True, "filename": name, "errors": errors[:20], **res}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi import: {e}")


@router.get("/api/subjects/{subject}/import/template")
def import_template() -> dict[str, Any]:
    return {
        "headers": ["Cau hoi", "A", "B", "C", "D", "E", "Dap an", "Do kho", "Chu de", "Giai thich"],
        "example": [
            {
                "Cau hoi": "Ngay Phap luat nuoc Cong hoa xa hoi chu nghia Viet Nam duoc to chuc hang nam vao ngay nao?",
                "A": "1 thang 5", "B": "2 thang 9", "C": "9 thang 11", "D": "20 thang 11", "E": "",
                "Dap an": "C", "Do kho": "De", "Chu de": "Phap luat",
                "Giai thich": "Ngay 9/11 hang nam la Ngay Phap luat cua Viet Nam.",
            }
        ],
    }


# ---------- Luyen thi: chon chu de hon hop + do kho + so luong + tron ----------

class PracticeBody(BaseModel):
    topics: list[str] = []
    difficulty: str = "Hon hop"
    count: int = 10
    shuffle_questions: bool = True
    shuffle_options: bool = True


@router.post("/api/subjects/{subject}/practice-quiz")
def practice_quiz(subject: str, body: PracticeBody) -> list[Any]:
    pool = bank_store.unified_questions(subject)
    count = max(1, min(int(body.count or 10), 200))
    picked = bank_store.pick_with_mix(
        pool,
        difficulty=body.difficulty or "Hon hop",
        topics=body.topics or [],
        count=count,
        rng=random.Random(),
    )
    rng = random.Random()
    if body.shuffle_questions:
        rng.shuffle(picked)
    if body.shuffle_options:
        picked = [bank_store.shuffle_options(q, rng) for q in picked]
    return picked


# ---------- Bieu do nang luc: dung/sai theo chu de + do kho ----------

@router.get("/api/subjects/{subject}/competency")
def competency(subject: str) -> dict[str, Any]:
    subject_dir = resolve_subject_dir(subject)
    history = read_json_list(history_path(subject_dir))
    # map qid -> (topic, difficulty) tu bank hien tai
    meta: dict[str, dict[str, str]] = {}
    for q in bank_store.load_bank(subject):
        meta[str(q.get("id"))] = {
            "topic": str(q.get("topic") or "Chung"),
            "difficulty": bank_store.normalize_difficulty(q.get("difficulty")),
        }
    by_topic: dict[str, dict[str, int]] = {}
    by_diff: dict[str, dict[str, int]] = {"De": {"correct": 0, "wrong": 0}, "Trung binh": {"correct": 0, "wrong": 0}, "Kho": {"correct": 0, "wrong": 0}}

    def bump(store: dict[str, dict[str, int]], key: str, ok: bool | None):
        if ok is None:
            return
        cell = store.setdefault(key, {"correct": 0, "wrong": 0})
        cell["correct" if ok else "wrong"] += 1

    for att in history:
        for snap in att.get("snapshot", []) or []:
            ok = snap.get("isCorrect")
            if ok is None:
                continue
            qid = str(snap.get("id", ""))
            m = meta.get(qid)
            # snapshot tu phong bank moi co topic/difficulty; legacy thi roi vao Chung/Trung binh
            topic = (snap.get("topic") if isinstance(snap.get("topic"), str) else None) or (m or {}).get("topic") or "Chung"
            diff = (snap.get("difficulty") if isinstance(snap.get("difficulty"), str) else None) or (m or {}).get("difficulty") or "Trung binh"
            diff = bank_store.normalize_difficulty(diff)
            bump(by_topic, topic, bool(ok))
            bump(by_diff, diff, bool(ok))
    return {"byTopic": by_topic, "byDifficulty": by_diff}


# ---------- ML goi y do kho ----------

@router.get("/api/subjects/{subject}/ml-difficulty")
def ml_difficulty(subject: str, question_id: str = "", question: str = "") -> dict[str, Any]:
    return bank_store.suggest_difficulty(subject, question_id or None, question or None)


# ---------- Bao loi cau hoi ----------

def _reports_path(subject: str):
    return resolve_subject_dir(subject) / "reports.json"


@router.post("/api/subjects/{subject}/reports")
def create_report(subject: str, body: dict[str, Any]) -> dict[str, Any]:
    from src.utils import write_json_atomic

    qid = str(body.get("question_id") or body.get("questionId") or "")
    msg = str(body.get("message") or "").strip()
    if not qid or not msg:
        raise HTTPException(status_code=400, detail="Cần question_id + message.")
    try:
        items = read_json_list(_reports_path(subject))
    except Exception:
        items = []
    rep = {
        "id": f"rp_{int(time.time())}_{random.randint(1000, 9999)}",
        "question_id": qid,
        "message": msg,
        "reporter": str(body.get("reporter") or "an danh"),
        "status": "moi",
        "created_at": int(time.time()),
    }
    items.append(rep)
    try:
        write_json_atomic(_reports_path(subject), items)
    except OSError:
        pass
    return {"ok": True, "report": rep}


@router.get("/api/subjects/{subject}/reports")
def list_reports(subject: str, _: auth_store.AuthUser = Depends(auth_store.require_admin)) -> dict[str, Any]:
    try:
        items = read_json_list(_reports_path(subject))
    except Exception:
        items = []
    return {"items": items, "total": len(items)}


class ReportStatusBody(BaseModel):
    status: str = "da_xu_ly"


@router.put("/api/subjects/{subject}/reports/{rid}")
def update_report(
    subject: str,
    rid: str,
    body: ReportStatusBody,
    _: auth_store.AuthUser = Depends(auth_store.require_admin),
):
    from src.utils import write_json_atomic

    items = read_json_list(_reports_path(subject))
    found = False
    for r in items:
        if isinstance(r, dict) and r.get("id") == rid:
            r["status"] = body.status
            found = True
    if not found:
        raise HTTPException(status_code=404, detail="Không tìm thấy báo lỗi.")
    try:
        write_json_atomic(_reports_path(subject), items)
    except OSError:
        pass
    return {"ok": True}
