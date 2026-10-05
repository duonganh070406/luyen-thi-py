from __future__ import annotations

import os
from abc import ABC, abstractmethod
from typing import Any

from openai import OpenAI
from pydantic import BaseModel


class GradingResult(BaseModel):
    score: float  # 0.0 to 1.0
    is_correct: bool | None  # None for essay before manual review, otherwise bool
    feedback: str | None = None


class BaseGradingStrategy(ABC):
    @property
    @abstractmethod
    def question_type(self) -> str:
        """The identifier of the question type (e.g., 'single', 'matching')."""
        pass

    @abstractmethod
    async def grade(
        self,
        question: dict[str, Any],
        user_answer: Any,
        enable_ai: bool = True,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ) -> GradingResult:
        """Calculate the score and generate feedback for a question."""
        pass


def _get_essay_feedback(
    question_text: str,
    user_answer: str,
    reference_answer: str = "",
    api_key: str | None = None,
    base_url: str | None = None,
    model: str | None = None,
) -> str:
    """Call the LLM provider API via OpenAI compatibility client to get feedback."""
    resolved_api_key = (
        api_key
        or os.environ.get("AI_API_KEY")
        or os.environ.get("GEMINI_API_KEY")
        or os.environ.get("OPENAI_API_KEY")
    )
    if not resolved_api_key:
        return "Lỗi: Chưa cấu hình API Key cho AI chấm điểm."

    resolved_base_url = (
        base_url
        or os.environ.get("AI_BASE_URL")
        or "https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    if resolved_base_url and not resolved_base_url.endswith("/"):
        resolved_base_url += "/"

    resolved_model = (
        model
        or os.environ.get("AI_MODEL")
        or "gemini-2.5-flash"
    )

    prompt = f"""You are an expert grading assistant.
Evaluate the student's essay response based on the question and reference answer (if provided).
Analyze the language of the question and the student's answer, and output your entire feedback in the same language.

Question: "{question_text}"
Student's Answer: "{user_answer}"
{f'Reference Answer: "{reference_answer}"' if reference_answer else ""}

Provide a concise feedback covering:
1. Relevance: Evaluate whether the answer is on-topic.
2. Strengths: Highlight correct parts of the answer.
3. Weaknesses: Identify errors or missing details.
4. Improvements: Provide suggestions for a better answer.
5. Score: Grade on a 10-point scale (allow decimals like .25, .5, .75)."""

    try:
        client = OpenAI(
            api_key=resolved_api_key,
            base_url=resolved_base_url,
        )
        response = client.chat.completions.create(
            model=resolved_model,
            messages=[{"role": "user", "content": prompt}],
            timeout=15.0,
        )
        if response.choices and response.choices[0].message.content:
            return response.choices[0].message.content.strip()
        return "Không thể lấy nhận xét từ AI."
    except Exception as e:
        print(f"Error in AI grading with OpenAI client: {e}")
        return "Lỗi khi chấm bài bằng AI."


class SingleChoiceGrading(BaseGradingStrategy):
    @property
    def question_type(self) -> str:
        return "single"

    async def grade(
        self,
        question: dict[str, Any],
        user_answer: Any,
        enable_ai: bool = True,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ) -> GradingResult:
        correct_answers = question.get("correctAnswers", [0])
        correct_idx = correct_answers[0] if correct_answers else 0

        is_ok = user_answer == correct_idx
        return GradingResult(
            score=1.0 if is_ok else 0.0,
            is_correct=is_ok,
            feedback=None,
        )


class MultiChoiceGrading(BaseGradingStrategy):
    @property
    def question_type(self) -> str:
        return "multiple"

    async def grade(
        self,
        question: dict[str, Any],
        user_answer: Any,
        enable_ai: bool = True,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ) -> GradingResult:
        correct_answers = sorted(question.get("correctAnswers", []))
        ua = sorted(user_answer) if isinstance(user_answer, list) else []

        is_ok = correct_answers == ua
        return GradingResult(
            score=1.0 if is_ok else 0.0,
            is_correct=is_ok,
            feedback=None,
        )


class ShortAnswerGrading(BaseGradingStrategy):
    @property
    def question_type(self) -> str:
        return "short_answer"

    async def grade(
        self,
        question: dict[str, Any],
        user_answer: Any,
        enable_ai: bool = True,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ) -> GradingResult:
        ua = str(user_answer).strip().lower() if user_answer is not None else ""
        ca = str(question.get("referenceAnswer", "")).strip().lower()

        is_ok = ua == ca
        return GradingResult(
            score=1.0 if is_ok else 0.0,
            is_correct=is_ok,
            feedback=None,
        )


class EssayGrading(BaseGradingStrategy):
    @property
    def question_type(self) -> str:
        return "essay"

    async def grade(
        self,
        question: dict[str, Any],
        user_answer: Any,
        enable_ai: bool = True,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ) -> GradingResult:
        feedback = None
        if enable_ai and user_answer:
            feedback = _get_essay_feedback(
                question_text=question.get("text", ""),
                user_answer=str(user_answer),
                reference_answer=(
                    question.get("referenceAnswer")
                    or question.get("explanation")
                    or ""
                ),
                api_key=api_key,
                base_url=base_url,
                model=model,
            )
        return GradingResult(
            score=0.0,
            is_correct=None,
            feedback=feedback,
        )


class MatchingGrading(BaseGradingStrategy):
    @property
    def question_type(self) -> str:
        return "matching"

    async def grade(
        self,
        question: dict[str, Any],
        user_answer: Any,
        enable_ai: bool = True,
        api_key: str | None = None,
        base_url: str | None = None,
        model: str | None = None,
    ) -> GradingResult:
        correct_answers = question.get("correctAnswers", [])
        ua = user_answer if isinstance(user_answer, list) else []

        is_ok = correct_answers == ua
        return GradingResult(
            score=1.0 if is_ok else 0.0,
            is_correct=is_ok,
            feedback=None,
        )


class GradingRegistry:
    _strategies: dict[str, BaseGradingStrategy] = {}

    @classmethod
    def register(cls, strategy: BaseGradingStrategy) -> None:
        cls._strategies[strategy.question_type] = strategy

    @classmethod
    def get(cls, question_type: str) -> BaseGradingStrategy | None:
        # Map 'multi' to 'multiple' for safety
        normalized_type = "multiple" if question_type == "multi" else question_type
        return cls._strategies.get(normalized_type)
