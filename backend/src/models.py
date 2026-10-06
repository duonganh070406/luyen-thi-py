from __future__ import annotations

from typing import Any
from pydantic import BaseModel


class HistoryAttemptCreate(BaseModel):
    attemptId: str
    examName: str
    questions: list[dict[str, Any]]
    answers: dict[str, Any]
    enableAIGrading: bool = True


class AIProfileModel(BaseModel):
    id: str
    name: str
    aiApiKey: str = ""
    aiBaseUrl: str = ""
    aiModel: str = ""


class AIConfigModel(BaseModel):
    enableAIGrading: bool = True
    activeProfileId: str | None = None
    profiles: list[AIProfileModel] = []



class SubjectConfigModel(BaseModel):
    active: bool = True
    description: str = ""
    other_information: str = ""


class SubjectDetailResponse(BaseModel):
    id: str
    name: str
    config: SubjectConfigModel


class QuizConfigModel(BaseModel):
    num_questions: int | None = 40
    single: float | None = 0.7
    multi: float | None = 0.2
    essay: float | None = 0.0
    short_answer: float | None = 0.1
    matching: float | None = 0.0
    sources: list[str] | None = None
    # Mo rong: luyen theo chu de / do kho co kiem soat ty le tron + tron de
    topics: list[str] | None = None
    difficulty: str | None = None
    shuffle_questions: bool | None = True
    shuffle_options: bool | None = False


