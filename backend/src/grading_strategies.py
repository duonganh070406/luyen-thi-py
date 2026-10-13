from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

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
    ) -> GradingResult:
        """Calculate the score and generate feedback for a question."""
        pass


class SingleChoiceGrading(BaseGradingStrategy):
    @property
    def question_type(self) -> str:
        return "single"

    async def grade(
        self,
        question: dict[str, Any],
        user_answer: Any,
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
    ) -> GradingResult:
        # Tu luan cho giao vien cham tay: khong tu dong cong diem, khong nhan xet tu dong.
        return GradingResult(
            score=0.0,
            is_correct=None,
            feedback=None,
        )


class MatchingGrading(BaseGradingStrategy):
    @property
    def question_type(self) -> str:
        return "matching"

    async def grade(
        self,
        question: dict[str, Any],
        user_answer: Any,
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
