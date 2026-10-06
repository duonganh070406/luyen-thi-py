"""Ngan hang de (question bank) luu flat-file JSON theo mon.

Moi mon: DATA_ROOT/<mon>/questions.json : list[dict]
Schema moi cau:
  id, question, options(list theo thu tu A..E), answer(letter A-E),
  difficulty (De | Trung binh | Kho), topic, explanation, created_at, updated_at

Chuan hoa tieng Viet co dau -> De / Trung binh / Kho.
Ty le tron do kho mac dinh (kiem soat ngan hang de):
  De        -> 50% De, 30% Trung binh, 20% Kho
  Trung binh-> 30% De, 40% Trung binh, 30% Kho
  Kho       -> 20% De, 30% Trung binh, 50% Kho
  Hon hop   -> lay deu / theo ty le thuc te trong bank
"""
from __future__ import annotations

import csv
import io
import random
import time
import unicodedata
from pathlib import Path
from typing import Any

from fastapi import HTTPException

from src.utils import parse_exam_file, read_json_list, resolve_subject_dir, write_json_atomic

LETTERS = ["A", "B", "C", "D", "E"]

# ty le pha tron khi user chon 1 muc do kho
MIX_RATIOS: dict[str, dict[str, float]] = {
    "De": {"De": 0.5, "Trung binh": 0.3, "Kho": 0.2},
    "Trung binh": {"De": 0.3, "Trung binh": 0.4, "Kho": 0.3},
    "Kho": {"De": 0.2, "Trung binh": 0.3, "Kho": 0.5},
}


def _strip_accents(s: str) -> str:
    # NFD khong tach duoc chu d voi gach (đ/Đ) -> map thu cong truoc
    s = (s or "").replace("đ", "d").replace("Đ", "d")
    return "".join(
        c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn"
    ).lower().strip()


def normalize_difficulty(raw: Any) -> str:
    s = _strip_accents(str(raw or ""))
    if "kho" in s and "trung" not in s:
        return "Kho"
    if "trung" in s:
        return "Trung binh"
    if "de" in s or "easy" in s:
        return "De"
    # ma so 1/2/3
    if str(raw).strip() == "1":
        return "De"
    if str(raw).strip() == "2":
        return "Trung binh"
    if str(raw).strip() == "3":
        return "Kho"
    return "Trung binh"


def normalize_answer(raw: Any, n_options: int = 4) -> str:
    s = str(raw or "").strip().upper()
    # lay chu cai dau tien A-E
    for ch in s:
        if ch in LETTERS[: max(2, n_options)]:
            return ch
    # so 0/1/2... -> A/B/C...
    if s.isdigit():
        idx = int(s)
        if 0 <= idx < len(LETTERS):
            return LETTERS[idx]
        if 1 <= idx <= len(LETTERS):
            return LETTERS[idx - 1]
    return "A"


def questions_path(subject_dir: Path) -> Path:
    return subject_dir / "questions.json"


def load_bank(subject: str) -> list[dict[str, Any]]:
    subject_dir = resolve_subject_dir(subject)
    path = questions_path(subject_dir)
    data = read_json_list(path)
    return [d for d in data if isinstance(d, dict)]


def save_bank(subject: str, items: list[dict[str, Any]]) -> None:
    subject_dir = resolve_subject_dir(subject)
    write_json_atomic(questions_path(subject_dir), items)


def bank_topics(subject: str) -> list[str]:
    topics: dict[str, None] = {}
    for q in load_bank(subject):
        t = str(q.get("topic") or "Chung").strip() or "Chung"
        topics.setdefault(t, None)
    return sorted(topics.keys())


def bank_counts(subject: str) -> dict[str, Any]:
    items = load_bank(subject)
    by_diff: dict[str, int] = {"De": 0, "Trung binh": 0, "Kho": 0}
    by_topic: dict[str, int] = {}
    for q in items:
        d = normalize_difficulty(q.get("difficulty"))
        by_diff[d] = by_diff.get(d, 0) + 1
        t = str(q.get("topic") or "Chung").strip() or "Chung"
        by_topic[t] = by_topic.get(t, 0) + 1
    return {"total": len(items), "byDifficulty": by_diff, "byTopic": by_topic}


def to_quiz_item(q: dict[str, Any]) -> dict[str, Any]:
    """Chuyen cau bank -> format tuong thich frontend (ca cu + moi)."""
    opts = q.get("options") or []
    if isinstance(opts, dict):
        ordered = [opts.get(k, "") for k in LETTERS if opts.get(k)]
    else:
        ordered = [str(o) for o in list(opts)]
    letter = normalize_answer(q.get("answer"), len(ordered) or 4)
    idx = LETTERS.index(letter) if letter in LETTERS else 0
    return {
        "id": q.get("id"),
        "type": "single",
        "name": q.get("id"),
        # ca 2 key de tuong thich mapBackend cu + snapshot moi
        "question": q.get("question", ""),
        "text": q.get("question", ""),
        "options": ordered,
        "answer": idx,
        "correctAnswers": [idx],
        "correctAnswer": idx,
        "answerLetter": letter,
        "explanation": q.get("explanation", ""),
        "difficulty": normalize_difficulty(q.get("difficulty")),
        "topic": str(q.get("topic") or "Chung"),
    }


def unified_questions(subject: str) -> list[dict[str, Any]]:
    """Gop bank (questions.json) + markdown cu -> danh sach quiz item thong nhat."""
    out: list[dict[str, Any]] = []
    for q in load_bank(subject):
        try:
            out.append(to_quiz_item(q))
        except Exception:
            continue
    # markdown legacy: gan topic/difficulty mac dinh de van luyen duoc
    try:
        subject_dir = resolve_subject_dir(subject)
        md_dir = subject_dir / "markdown"
        if md_dir.is_dir():
            from src.utils import get_exam_files
            from src.utils import _image_base_url

            for f in get_exam_files(subject_dir):
                p = (md_dir / f)
                try:
                    img_base = _image_base_url(p.parent)
                    for raw in parse_exam_file(p, image_base_url=img_base):
                        if not isinstance(raw, dict):
                            continue
                        qtype = raw.get("type", "single")
                        if qtype != "single":
                            continue
                        ans = raw.get("answer", 0)
                        idx = ans if isinstance(ans, int) else 0
                        opts = raw.get("options", []) or []
                        out.append(
                            {
                                "id": f"md_{f}_{raw.get('id', len(out))}",
                                "type": "single",
                                "name": raw.get("name", ""),
                                "question": raw.get("question", ""),
                                "text": raw.get("question", ""),
                                "options": opts,
                                "answer": idx,
                                "correctAnswers": [idx],
                                "correctAnswer": idx,
                                "answerLetter": LETTERS[idx] if 0 <= idx < len(LETTERS) else "A",
                                "explanation": raw.get("explanation", ""),
                                "difficulty": "Trung binh",
                                "topic": "Chung",
                                "source": f,
                            }
                        )
                except Exception:
                    continue
    except Exception:
        pass
    return out


def pick_with_mix(
    pool: list[dict[str, Any]],
    difficulty: str = "Hon hop",
    topics: list[str] | None = None,
    count: int = 10,
    rng: random.Random | None = None,
) -> list[dict[str, Any]]:
    """Chon cau theo chu de + do kho co kiem soat ty le tron."""
    rng = rng or random.Random()
    items = list(pool)
    if topics:
        wanted = {t.strip().lower() for t in topics if t.strip()}
        if wanted and "hon hop" not in wanted and "tat ca" not in wanted:
            items = [q for q in items if str(q.get("topic", "")).strip().lower() in wanted]
    if not items:
        return []
    diff = (difficulty or "Hon hop").strip()
    if diff.lower() in ("hon hop", "tat ca", "mixed", "all", ""):
        rng.shuffle(items)
        return items[: max(0, count)]
    # chuan hoa ten ("De"/"Dễ"/"easy"/1 -> "De", ...)
    key = normalize_difficulty(diff) if diff not in MIX_RATIOS else diff
    ratio = MIX_RATIOS.get(key, MIX_RATIOS["Trung binh"])
    buckets: dict[str, list[dict[str, Any]]] = {"De": [], "Trung binh": [], "Kho": []}
    for q in items:
        buckets[normalize_difficulty(q.get("difficulty"))].append(q)
    for v in buckets.values():
        rng.shuffle(v)
    # so luong moi nhom theo ty le, lam tron + bu tru thieu
    want: dict[str, int] = {k: int(round(count * p)) for k, p in ratio.items()}
    # dieu chinh tong = count
    total = sum(want.values())
    if total != count:
        # cong/tru vao nhom co ty le lon nhat
        big = max(ratio, key=lambda k: ratio[k])
        want[big] += count - total
    picked: list[dict[str, Any]] = []
    deficit = 0
    for k in ("De", "Trung binh", "Kho"):
        take = min(want.get(k, 0), len(buckets[k]))
        picked.extend(buckets[k][:take])
        deficit += want.get(k, 0) - take
    # bu phan thieu tu cac cau con lai (uu tien nhom gan nhat)
    if deficit > 0:
        rest: list[dict[str, Any]] = []
        for k in ("De", "Trung binh", "Kho"):
            rest.extend(buckets[k][want.get(k, 0):])
        rng.shuffle(rest)
        picked.extend(rest[:deficit])
    rng.shuffle(picked)
    return picked[:count]


def shuffle_options(item: dict[str, Any], rng: random.Random) -> dict[str, Any]:
    """Dao thu tu dap an A-E va map lai dap an dung."""
    q = dict(item)
    opts = list(q.get("options", []) or [])
    if len(opts) < 2:
        return q
    correct = q.get("answer", 0)
    try:
        correct_text = opts[int(correct)]
    except Exception:
        correct_text = opts[0]
    order = list(range(len(opts)))
    rng.shuffle(order)
    new_opts = [opts[i] for i in order]
    new_idx = new_opts.index(correct_text)
    q["options"] = new_opts
    q["answer"] = new_idx
    q["correctAnswers"] = [new_idx]
    q["correctAnswer"] = new_idx
    q["answerLetter"] = LETTERS[new_idx] if new_idx < len(LETTERS) else "A"
    return q


# ---------- Import Excel/CSV ----------

# header chuan (khong dau) -> field
_HEADER_MAP: dict[str, str] = {
    "cau hoi": "question",
    "question": "question",
    "a": "A", "b": "B", "c": "C", "d": "D", "e": "E",
    "dap an": "answer", "đáp án": "answer", "answer": "answer",
    "do kho": "difficulty", "độ khó": "difficulty", "difficulty": "difficulty",
    "chu de": "topic", "chủ đề": "topic", "topic": "topic", "linh vuc": "topic",
    "giai thich": "explanation", "giải thích": "explanation", "explanation": "explanation",
}


def _norm_header(h: Any) -> str:
    return _strip_accents(str(h or ""))


def parse_rows(rows: list[list[Any]]) -> tuple[list[dict[str, Any]], list[str]]:
    """Parse ma tran Excel/CSV theo format image.png.
    Hang dau la header: Cau hoi | A | B | C | D | E | Dap an | Do kho | Chu de | Giai thich
    """
    items: list[dict[str, Any]] = []
    errors: list[str] = []
    if not rows or len(rows) < 2:
        return items, ["File khong co du lieu (can it nhat 1 hang header + 1 hang cau hoi)."]
    header = [_norm_header(h) for h in rows[0]]
    idx: dict[str, int] = {}
    for i, h in enumerate(header):
        field = _HEADER_MAP.get(h, "")
        if field and field not in idx:
            idx[field] = i

    def cell(r: list[Any], key: str) -> str:
        i = idx.get(key, -1)
        if i is None or i < 0 or i >= len(r):
            return ""
        v = r[i]
        return "" if v is None else str(v).strip()

    if "question" not in idx or "answer" not in idx:
        return items, ["Thieu cot bat buoc: 'Cau hoi' va 'Dap an'. Header hien tai: " + " | ".join(str(h) for h in rows[0])]

    for n, r in enumerate(rows[1:], start=2):
        q_text = cell(r, "question")
        if not q_text:
            continue
        opts: list[str] = []
        letters_present: list[str] = []
        for L in LETTERS:
            v = cell(r, L)
            if v:
                opts.append(v)
                letters_present.append(L)
        if len(opts) < 2:
            errors.append(f"Dong {n}: can it nhat 2 phuong an A-D.")
            continue
        ans_raw = cell(r, "answer")
        letter = normalize_answer(ans_raw, len(opts))
        if letter not in letters_present:
            # neu dap an nam ngoai so phuong an co san -> bao loi nhe nhung van giu
            errors.append(f"Dong {n}: dap an '{ans_raw}' khong khop so phuong an ({len(opts)}). Da chuan hoa ve '{letter}'.")
        items.append(
            {
                "question": q_text,
                "options": opts,
                "answer": letter,
                "difficulty": normalize_difficulty(cell(r, "difficulty") or "Trung binh"),
                "topic": cell(r, "topic") or "Chung",
                "explanation": cell(r, "explanation"),
            }
        )
    return items, errors


def read_csv_bytes(data: bytes) -> list[list[Any]]:
    for enc in ("utf-8-sig", "utf-8", "cp1258", "latin-1"):
        try:
            text = data.decode(enc)
            break
        except Exception:
            continue
    else:
        text = data.decode("utf-8", errors="ignore")
    sample = text[:2048]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=[",", ";", "\t"])
    except Exception:
        dialect = csv.excel
    return list(csv.reader(io.StringIO(text), dialect))


def read_xlsx_bytes(data: bytes) -> list[list[Any]]:
    try:
        from openpyxl import load_workbook
    except ImportError as e:
        raise HTTPException(
            status_code=500,
            detail="Chua cai openpyxl. Chay: pip install openpyxl",
        ) from e
    wb = load_workbook(filename=io.BytesIO(data), read_only=True, data_only=True)
    ws = wb.active
    rows: list[list[Any]] = []
    for row in ws.iter_rows(values_only=True):
        rows.append(list(row))
    # bo hang trong o cuoi
    while rows and all(c is None or str(c).strip() == "" for c in rows[-1]):
        rows.pop()
    return rows


def import_items(subject: str, new_items: list[dict[str, Any]]) -> dict[str, Any]:
    items = load_bank(subject)
    existing_ids = {str(q.get("id")) for q in items}
    n = len(items)
    added = 0
    for it in new_items:
        n += 1
        qid = f"q_{int(time.time())}_{n}"
        while qid in existing_ids:
            n += 1
            qid = f"q_{int(time.time())}_{n}"
        items.append(
            {
                "id": qid,
                "question": it["question"],
                "options": it["options"],
                "answer": it["answer"],
                "difficulty": it["difficulty"],
                "topic": it["topic"],
                "explanation": it.get("explanation", ""),
                "created_at": int(time.time()),
                "updated_at": int(time.time()),
            }
        )
        existing_ids.add(qid)
        added += 1
    save_bank(subject, items)
    return {"added": added, "total": len(items)}


# ---------- ML goi y do kho (rule-based, mo rong duoc) ----------

def suggest_difficulty(subject: str, question_id: str | None = None, question_text: str | None = None) -> dict[str, Any]:
    """Uoc luong do kho dua tren ty le sai lich su + do dai cau hoi.

    wrong_rate = so lan sai / so lan tra loi (tu history.json snapshot).
    - wrong_rate >= 0.6 -> Kho
    - 0.3 <= wrong_rate < 0.6 -> Trung binh
    - < 0.3 -> De
    Ket hop do dai cau hoi: cau dai + nhieu phuong an dai -> cong diem kho.
    Tra ve {suggested, wrong_rate, attempts, confidence}.
    Day la pipeline ML don gian, co the thay bang model that sau nay.
    """
    from src.utils import history_path

    history: list[dict[str, Any]] = []
    try:
        subject_dir = resolve_subject_dir(subject)
        history = read_json_list(history_path(subject_dir))
    except Exception:
        history = []
    total = 0
    wrong = 0
    for att in history:
        for snap in att.get("snapshot", []) or []:
            match = False
            if question_id is not None and str(snap.get("id")) == str(question_id):
                match = True
            elif question_text and str(snap.get("question", "")).strip() == question_text.strip():
                match = True
            if match:
                ans = snap.get("userAnswer")
                answered = ans is not None and str(ans).strip() not in ("", "-1", "[]")
                if answered:
                    total += 1
                    if snap.get("isCorrect") is False:
                        wrong += 1
    wrong_rate = (wrong / total) if total else None
    # diem do dai (0..0.2)
    qlen = len(question_text or "")
    length_bonus = 0.0
    if qlen > 300:
        length_bonus = 0.15
    elif qlen > 150:
        length_bonus = 0.07
    score = (wrong_rate if wrong_rate is not None else 0.35) + length_bonus
    if score >= 0.6:
        suggested = "Kho"
    elif score >= 0.3:
        suggested = "Trung binh"
    else:
        suggested = "De"
    confidence = "cao" if total >= 20 else ("trung binh" if total >= 5 else "thap")
    return {
        "suggested": suggested,
        "wrong_rate": wrong_rate,
        "attempts": total,
        "wrong": wrong,
        "confidence": confidence,
        "method": "wrong_rate + do_dai_cau_hoi (rule-based, co the thay bang model ML)",
    }
