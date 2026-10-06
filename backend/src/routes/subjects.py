from __future__ import annotations

import random
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from src.config import DATA_ROOT
from src.bank import pick_with_mix, shuffle_options
from src.models import (
    HistoryAttemptCreate,
    SubjectConfigModel,
    SubjectDetailResponse,
    AIConfigModel,
    AIProfileModel,
    QuizConfigModel,
)
from src.utils import (
    _image_base_url,
    get_exam_files,
    get_note_files,
    has_exam_files,
    history_path,
    parse_exam_file,
    read_json_list,
    read_note_content,
    resolve_subject_dir,
    write_json_atomic,
    read_subject_config,
    config_path,
)
from src.config_manager import read_ai_config, write_ai_config
from src.grading_strategies import (
    GradingRegistry,
    SingleChoiceGrading,
    MultiChoiceGrading,
    ShortAnswerGrading,
    EssayGrading,
    MatchingGrading,
)

router = APIRouter()

# Đăng ký các bộ chấm điểm
GradingRegistry.register(SingleChoiceGrading())
GradingRegistry.register(MultiChoiceGrading())
GradingRegistry.register(ShortAnswerGrading())
GradingRegistry.register(EssayGrading())
GradingRegistry.register(MatchingGrading())


@router.get("/api/subjects", response_model=list[SubjectDetailResponse])
def list_subjects(include_inactive: bool = False) -> list[SubjectDetailResponse]:
    """Liệt kê các môn học hợp lệ."""
    if not DATA_ROOT.is_dir():
        return []
    subjects: list[SubjectDetailResponse] = []
    for entry in sorted(DATA_ROOT.iterdir(), key=lambda p: p.name.lower()):
        if not entry.is_dir():
            continue
        if not has_exam_files(entry) and not (entry / "questions.json").is_file():
            continue
        config_dict = read_subject_config(entry)
        # Ẩn môn học nếu active là False và không yêu cầu hiển thị tất cả
        if not include_inactive and not config_dict.get("active", True):
            continue
        subjects.append(
            SubjectDetailResponse(
                id=entry.name,
                name=entry.name,
                config=SubjectConfigModel(**config_dict),
            )
        )
    return subjects


@router.put("/api/subjects/{subject}/config")
def update_subject_config(
    subject: str, config: SubjectConfigModel
) -> dict[str, Any]:
    """Cập nhật cấu hình subject_config.json của môn học."""
    subject_dir = resolve_subject_dir(subject)
    path = config_path(subject_dir)
    config_dict = config.model_dump(mode="json")
    try:
        write_json_atomic(path, config_dict)
    except OSError:
        pass
    return {"ok": True}


@router.get("/api/config/ai", response_model=AIConfigModel)
def get_ai_config_endpoint() -> AIConfigModel:
    """Lấy cấu hình AI chấm điểm hiện tại."""
    config_dict = read_ai_config()
    return AIConfigModel(**config_dict)


@router.put("/api/config/ai")
def update_ai_config_endpoint(config: AIConfigModel) -> dict[str, Any]:
    """Cập nhật cấu hình AI chấm điểm."""
    config_dict = config.model_dump(mode="json")
    write_ai_config(config_dict)
    return {"ok": True}


@router.post("/api/config/ai/test")
async def test_ai_config_endpoint(config: AIProfileModel) -> dict[str, Any]:
    """Kiểm tra kết nối và độ chính xác của AI bằng prompt mặc định."""
    import os
    import traceback
    from openai import OpenAI

    resolved_api_key = config.aiApiKey.strip()
    resolved_base_url = config.aiBaseUrl.strip()
    resolved_model = config.aiModel.strip()

    # Fallback to env variables if not provided
    if not resolved_api_key:
        resolved_api_key = (
            os.environ.get("AI_API_KEY")
            or os.environ.get("GEMINI_API_KEY")
            or os.environ.get("OPENAI_API_KEY")
        )
    if not resolved_base_url:
        resolved_base_url = (
            os.environ.get("AI_BASE_URL")
            or "https://generativelanguage.googleapis.com/v1beta/openai/"
        )

    # Ensure base_url has a trailing slash to prevent library URL merging issues (e.g. 404)
    if resolved_base_url and not resolved_base_url.endswith("/"):
        resolved_base_url += "/"

    if not resolved_model:
        resolved_model = os.environ.get("AI_MODEL") or "gemini-2.5-flash"

    if not resolved_api_key:
        return {
            "success": False,
            "response": "",
            "error": "Lỗi: Không tìm thấy API Key.",
        }

    try:
        client = OpenAI(api_key=resolved_api_key, base_url=resolved_base_url)
        response = client.chat.completions.create(
            model=resolved_model,
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Who developed you and what is your model version? "
                        "Please answer concisely and make sure to explicitly include "
                        "your exact model version/name identifier in the response."
                    ),
                }
            ],
            timeout=15.0,
        )
        if response.choices and response.choices[0].message.content:
            return {
                "success": True,
                "response": response.choices[0].message.content.strip(),
                "error": None,
            }
        return {
            "success": False,
            "response": "",
            "error": "Không thể lấy phản hồi hợp lệ từ mô hình AI.",
        }
    except Exception as e:
        err_msg = str(e)
        if "404" in err_msg or "NotFoundError" in type(e).__name__:
            err_msg = (
                f"Lỗi 404 (Không tìm thấy): Đường dẫn API (Base URL) '{resolved_base_url}' "
                f"có thể bị thiếu dấu gạch chéo '/' ở cuối, hoặc tên mô hình (Model Name) "
                f"'{resolved_model}' không tồn tại trên hệ thống của nhà cung cấp.\n\n"
                f"Chi tiết lỗi hệ thống:\n{err_msg}"
            )
        else:
            err_msg = f"{err_msg}\n\nTraceback:\n{traceback.format_exc()}"

        return {
            "success": False,
            "response": "",
            "error": err_msg,
        }




@router.get("/api/subjects/{subject}/exams")
def list_subject_exams(subject: str) -> list[str]:
    """Trả về danh sách tên các file đề thi trong môn học."""
    subject_dir = resolve_subject_dir(subject)
    return get_exam_files(subject_dir)


@router.get("/api/subjects/{subject}/exams/{exam_name:path}")
def get_exam_data(subject: str, exam_name: str) -> list[Any]:
    """Trả về nội dung câu hỏi của một đề thi cụ thể."""
    subject_dir = resolve_subject_dir(subject)
    md_dir = subject_dir / "markdown"
    unquoted = urllib.parse.unquote(exam_name).strip()
    exam_path = (md_dir / unquoted).resolve()

    # Bảo mật: không cho phép đọc file ngoài thư mục markdown
    try:
        exam_path.relative_to(md_dir.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    if not exam_path.is_file():
        raise HTTPException(status_code=404, detail="Exam not found")

    try:
        img_base = _image_base_url(exam_path.parent)
        return parse_exam_file(exam_path, image_base_url=img_base)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse markdown: {str(e)}",
        ) from e


@router.get("/api/subjects/{subject}/data")
def get_subject_data(subject: str) -> list[Any]:
    """Legacy: Lấy dữ liệu từ file đề đầu tiên tìm thấy."""
    subject_dir = resolve_subject_dir(subject)
    exams = get_exam_files(subject_dir)
    if not exams:
        raise HTTPException(status_code=404, detail="No exams found")

    md_dir = subject_dir / "markdown"
    try:
        first_exam_path = (md_dir / exams[0]).resolve()
        img_base = _image_base_url(first_exam_path.parent)
        return parse_exam_file(first_exam_path, image_base_url=img_base)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse markdown: {str(e)}",
        ) from e


@router.get("/api/subjects/{subject}/history")
def get_history(subject: str) -> list[Any]:
    """Lấy toàn bộ lịch sử làm bài của môn học."""
    subject_dir = resolve_subject_dir(subject)
    hpath = history_path(subject_dir)
    return read_json_list(hpath)


@router.get("/api/subjects/{subject}/notes")
def list_subject_notes(subject: str) -> list[str]:
    """Trả về danh sách tên các file ghi chú .md trong môn học."""
    subject_dir = resolve_subject_dir(subject)
    return get_note_files(subject_dir)


@router.get("/api/subjects/{subject}/notes/{note_name:path}")
def get_note_content(subject: str, note_name: str) -> dict[str, str]:
    """Trả về nội dung một file ghi chú cụ thể."""
    subject_dir = resolve_subject_dir(subject)
    note_dir = subject_dir / "note"
    unquoted = urllib.parse.unquote(note_name).strip()
    note_path = (note_dir / unquoted).resolve()

    try:
        note_path.relative_to(note_dir.resolve())
    except ValueError:
        raise HTTPException(status_code=403, detail="Access denied")

    if not note_path.is_file():
        raise HTTPException(status_code=404, detail="Note not found")

    try:
        img_base = _image_base_url(note_path.parent)
        content = read_note_content(note_path, image_base_url=img_base)
        return {"content": content}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read note: {str(e)}",
        ) from e


@router.post("/api/subjects/{subject}/history", status_code=201)
async def append_history(subject: str, body: HistoryAttemptCreate) -> dict[str, Any]:
    """Ghi thêm một lần làm bài mới vào history.json sau khi chấm điểm ở backend."""
    subject_dir = resolve_subject_dir(subject)
    hpath = history_path(subject_dir)
    current = read_json_list(hpath)

    ai_config = read_ai_config()
    enable_ai = body.enableAIGrading and ai_config.get("enableAIGrading", True)

    # Resolve active profile configuration
    active_profile = None
    active_id = ai_config.get("activeProfileId")
    for profile in ai_config.get("profiles", []):
        if profile.get("id") == active_id:
            active_profile = profile
            break

    # If no active profile match, fallback to first profile in list
    if not active_profile and ai_config.get("profiles"):
        active_profile = ai_config["profiles"][0]

    api_key = active_profile.get("aiApiKey") if active_profile else None
    base_url = active_profile.get("aiBaseUrl") if active_profile else None
    model = active_profile.get("aiModel") if active_profile else None

    correct = 0
    wrong = 0
    pending_essay = 0
    unanswered = 0

    type_counts = {
        "single": 0,
        "multiple": 0,
        "essay": 0,
        "short_answer": 0,
        "matching": 0
    }

    snapshot = []

    for q in body.questions:
        q_id = q.get("id")
        user_ans = body.answers.get(str(q_id))
        if user_ans is None:
            user_ans = body.answers.get(q_id)

        q_type = q.get("type")
        normalized_type = "multiple" if q_type in ["multi", "multiple"] else q_type
        if normalized_type in type_counts:
            type_counts[normalized_type] += 1

        # Kiểm tra xem câu hỏi có được trả lời không
        is_ans = False
        if user_ans is not None:
            if q_type == "single":
                is_ans = (user_ans != -1)
            elif q_type in ["multi", "multiple", "matching"]:
                is_ans = isinstance(user_ans, list) and len(user_ans) > 0 and any(v != -1 for v in user_ans)
            else:
                is_ans = str(user_ans).strip() != ""

        # 1. Chấm điểm theo Strategy tương ứng
        if not is_ans:
            unanswered += 1
            is_correct = None
            feedback = None
        else:
            strategy = GradingRegistry.get(q_type)
            if strategy:
                res = await strategy.grade(
                    q,
                    user_ans,
                    enable_ai=enable_ai,
                    api_key=api_key,
                    base_url=base_url,
                    model=model,
                )
                is_correct = res.is_correct
                feedback = res.feedback
                
                if q_type == "essay":
                    if not feedback:
                        pending_essay += 1
                    else:
                        correct += 1
                else:
                    if is_correct:
                        correct += 1
                    else:
                        wrong += 1
            else:
                is_correct = None
                feedback = None
                wrong += 1

        # 2. Xác định correctAnswer & userAnswer cho snapshot
        if q_type == "single":
            correct_answer = q.get("correctAnswers", [0])[0] if q.get("correctAnswers") else 0
            user_out = int(user_ans) if isinstance(user_ans, (int, float)) else -1
        elif q_type in ["multi", "multiple"]:
            correct_answer = sorted(q.get("correctAnswers", []))
            user_out = sorted(user_ans) if isinstance(user_ans, list) else []
        elif q_type == "matching":
            correct_answer = q.get("correctAnswers", [])
            user_out = user_ans if isinstance(user_ans, list) else []
        elif q_type == "short_answer":
            correct_answer = q.get("referenceAnswer") or ""
            user_out = str(user_ans) if user_ans is not None else ""
        else:
            correct_answer = q.get("referenceAnswer") or q.get("explanation") or ""
            user_out = str(user_ans) if user_ans is not None else ""

        snapshot.append({
            "id": int(q_id) if isinstance(q_id, (int, float)) or (isinstance(q_id, str) and q_id.isdigit()) else q_id,
            "name": q.get("name"),
            "type": normalized_type,
            "question": q.get("text", ""),
            "options": None if q_type in ["essay", "short_answer"] else q.get("options", []),
            "correctAnswer": correct_answer,
            "userAnswer": user_out,
            "isCorrect": is_correct,
            "explanation": q.get("explanation", ""),
            "feedback": feedback
        })

    timestamp_str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    graded_attempt = {
        "attemptId": body.attemptId,
        "timestamp": timestamp_str,
        "summary": {
            "score": correct,
            "total": len(body.questions),
            "correct": correct,
            "wrong": wrong,
            "pendingEssay": pending_essay,
            "unanswered": unanswered,
            "questionTypes": type_counts,
            "examName": body.examName or "Đề ngẫu nhiên"
        },
        "snapshot": snapshot
    }

    current.append(graded_attempt)
    try:
        write_json_atomic(hpath, current)
    except OSError:
        pass

    return {"ok": True, "length": len(current), "attempt": graded_attempt}


@router.delete("/api/subjects/{subject}/history/{attempt_id}", status_code=200)
def delete_history_attempt(subject: str, attempt_id: str) -> dict[str, Any]:
    """Xóa một attempt cụ thể trong history.json."""
    subject_dir = resolve_subject_dir(subject)
    hpath = history_path(subject_dir)
    current = read_json_list(hpath)

    new_history = []
    found = False
    for att in current:
        att_id = str(att.get("attemptId", ""))
        if att_id == attempt_id:
            found = True
        else:
            new_history.append(att)

    if not found:
        raise HTTPException(status_code=404, detail="Attempt not found")

    try:
        write_json_atomic(hpath, new_history)
    except OSError:
        pass
    return {"ok": True, "length": len(new_history)}


@router.post("/api/subjects/{subject}/comprehensive-quiz")
def get_comprehensive_quiz(
    subject: str,
    quiz_config: QuizConfigModel,
) -> list[Any]:
    """Tổng hợp tất cả câu hỏi từ các đề và chọn ngẫu nhiên theo loại."""
    subject_dir = resolve_subject_dir(subject)
    exam_files = get_exam_files(subject_dir)
    md_dir = subject_dir / "markdown"

    if quiz_config.sources:
        allowed = {s.lower() for s in quiz_config.sources}
        filtered = []
        for f in exam_files:
            stem = f.rsplit(".", 1)[0] if "." in f else f
            file_name = f.split("/")[-1]
            file_stem = (
                file_name.rsplit(".", 1)[0] if "." in file_name else file_name
            )
            parts = Path(f).parts[:-1]
            is_match = (
                f.lower() in allowed
                or stem.lower() in allowed
                or file_name.lower() in allowed
                or file_stem.lower() in allowed
                or any(part.lower() in allowed for part in parts)
            )
            if is_match:
                filtered.append(f)
        exam_files = filtered

    all_questions = []
    for exam_file in exam_files:
        exam_path = md_dir / exam_file
        try:
            img_base = _image_base_url(exam_path.parent)
            questions = parse_exam_file(exam_path, image_base_url=img_base)
            all_questions.extend(questions)
        except Exception:
            pass  # Bỏ qua nếu lỗi parse

    # Gop them ngan hang de (questions.json import tu Excel/CSV) de luyen theo chu de/do kho
    try:
        from src import bank as bank_store

        for bq in bank_store.unified_questions(subject):
            all_questions.append(
                {
                    "id": bq.get("id"),
                    "type": "single",
                    "name": bq.get("id"),
                    "question": bq.get("question", ""),
                    "options": bq.get("options", []),
                    "answer": bq.get("answer", 0),
                    "explanation": bq.get("explanation", ""),
                    "difficulty": bq.get("difficulty", "Trung binh"),
                    "topic": bq.get("topic", "Chung"),
                }
            )
    except Exception:
        pass

    # Loc theo chu de hon hop + do kho co kiem soat ty le tron (neu FE gui kem).
    # Khong co topics/difficulty -> roi xuong logic cu (ty le theo loai cau).
    _topics = list(getattr(quiz_config, "topics", None) or [])
    _difficulty = str(getattr(quiz_config, "difficulty", None) or "")
    if _topics or _difficulty.strip().lower() not in ("hon hop", "tat ca", "all", ""):
        try:
            num = quiz_config.num_questions if quiz_config.num_questions not in (None, -1) else 40
            picked = pick_with_mix(
                [
                    {
                        "id": q.get("id"),
                        "question": q.get("question", ""),
                        "options": q.get("options", []),
                        "answer": 0,
                        "difficulty": q.get("difficulty", "Trung binh"),
                        "topic": q.get("topic", "Chung"),
                        "_raw": q,
                    }
                    for q in all_questions
                ],
                difficulty=_difficulty or "Hon hop",
                topics=_topics,
                count=int(num),
            )
            all_questions = [p["_raw"] for p in picked]
            if getattr(quiz_config, "shuffle_options", False):
                all_questions = [
                    shuffle_options({**q, "options": q.get("options", []), "answer": q.get("answer", 0)}, random.Random())
                    for q in all_questions
                ]
            if getattr(quiz_config, "shuffle_questions", True):
                random.shuffle(all_questions)
            return all_questions
        except Exception:
            pass

    single_qs = [q for q in all_questions if q.get("type") == "single"]
    multi_qs = [q for q in all_questions if q.get("type") == "multiple"]
    essay_qs = [q for q in all_questions if q.get("type") == "essay"]
    short_answer_qs = [
        q for q in all_questions if q.get("type") == "short_answer"
    ]
    matching_qs = [q for q in all_questions if q.get("type") == "matching"]

    # Determine num_questions
    num_qs = quiz_config.num_questions if quiz_config.num_questions is not None else 40
    if num_qs == -1:
        if len(all_questions) > 0:
            num_qs = random.randint(10, max(10, min(50, len(all_questions))))
        else:
            num_qs = 0

    # Determine proportions
    single_p = quiz_config.single
    multi_p = quiz_config.multi
    essay_p = quiz_config.essay
    short_answer_p = quiz_config.short_answer
    matching_p = quiz_config.matching

    # If any is -1, randomize it
    if single_p == -1:
        single_p = random.random()
    if multi_p == -1:
        multi_p = random.random()
    if essay_p == -1:
        essay_p = random.random()
    if short_answer_p == -1:
        short_answer_p = random.random()
    if matching_p == -1:
        matching_p = random.random()

    single_p = 0.0 if single_p is None else single_p
    multi_p = 0.0 if multi_p is None else multi_p
    essay_p = 0.0 if essay_p is None else essay_p
    short_answer_p = 0.0 if short_answer_p is None else short_answer_p
    matching_p = 0.0 if matching_p is None else matching_p

    total_p = single_p + multi_p + essay_p + short_answer_p + matching_p
    if total_p <= 0:
        single_p = multi_p = essay_p = short_answer_p = matching_p = 0.2
        total_p = 1.0

    counts = {
        "single": max(0, int(round(num_qs * (single_p / total_p)))),
        "multiple": max(0, int(round(num_qs * (multi_p / total_p)))),
        "essay": max(0, int(round(num_qs * (essay_p / total_p)))),
        "short_answer": max(0, int(round(num_qs * (short_answer_p / total_p)))),
        "matching": max(0, int(round(num_qs * (matching_p / total_p)))),
    }

    # Optional adjustment to match num_qs exactly, if total count differs due to rounding
    total_count = sum(counts.values())
    if total_count != num_qs and total_count > 0:
        best_type = max(
            counts.keys(),
            key=lambda k: (
                single_p if k == "single" else
                multi_p if k == "multiple" else
                essay_p if k == "essay" else
                short_answer_p if k == "short_answer" else
                matching_p
            )
        )
        diff = num_qs - total_count
        counts[best_type] = max(0, counts[best_type] + diff)

    selected = []
    if counts["single"] > 0:
        selected.extend(
            random.sample(single_qs, min(len(single_qs), counts["single"]))
        )
    if counts["multiple"] > 0:
        selected.extend(
            random.sample(multi_qs, min(len(multi_qs), counts["multiple"]))
        )
    if counts["essay"] > 0:
        selected.extend(
            random.sample(essay_qs, min(len(essay_qs), counts["essay"]))
        )
    if counts["short_answer"] > 0:
        selected.extend(
            random.sample(
                short_answer_qs, min(len(short_answer_qs), counts["short_answer"])
            )
        )
    if counts["matching"] > 0:
        selected.extend(
            random.sample(
                matching_qs, min(len(matching_qs), counts["matching"])
            )
        )

    random.shuffle(selected)
    return selected


@router.get("/api/subjects/{subject}/stats")
def get_subject_stats(subject: str) -> dict[str, Any]:
    """Thống kê các câu hỏi hay sai và sai gần đây."""
    subject_dir = resolve_subject_dir(subject)
    hpath = history_path(subject_dir)
    history = read_json_list(hpath)

    error_counts: dict[int, dict[str, Any]] = {}
    recent_errors: list[dict[str, Any]] = []
    seen_recent_ids: set[int] = set()

    sorted_history = sorted(
        history, key=lambda x: x.get("timestamp", ""), reverse=True
    )

    for attempt in sorted_history:
        snapshot = attempt.get("snapshot", [])
        for snap in snapshot:
            is_correct = snap.get("isCorrect")
            q_id = snap.get("id")

            if is_correct is False and q_id is not None:
                if q_id not in error_counts:
                    error_counts[q_id] = {"count": 0, "question": snap}
                error_counts[q_id]["count"] += 1

                if q_id not in seen_recent_ids and len(recent_errors) < 50:
                    recent_errors.append(snap)
                    seen_recent_ids.add(q_id)

    most_missed = sorted(
        error_counts.values(), key=lambda x: x["count"], reverse=True
    )

    return {
        "mostMissed": most_missed[:50],
        "recentErrors": recent_errors[:50],
    }
