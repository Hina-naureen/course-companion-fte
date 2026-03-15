from pydantic import BaseModel
from datetime import datetime
import uuid


class QuizOption(BaseModel):
    id: str
    text: str


class QuizQuestion(BaseModel):
    id: str
    text: str
    options: list[QuizOption] | None = None  # None for open-ended


class QuizPublic(BaseModel):
    id: uuid.UUID
    chapter_id: uuid.UUID
    title: str
    quiz_type: str
    questions: list[QuizQuestion]
    passing_score: int

    model_config = {"from_attributes": True}


class AttemptRequest(BaseModel):
    answers: dict[str, str]  # {"q1": "a", "q2": "c"}
    time_taken_secs: int | None = None


class QuestionResult(BaseModel):
    question_id: str
    correct: bool
    your_answer: str
    correct_answer: str
    explanation: str | None = None


class AttemptResult(BaseModel):
    attempt_id: uuid.UUID
    score: int
    passed: bool
    passing_score: int
    results: list[QuestionResult]


class AttemptSummary(BaseModel):
    id: uuid.UUID
    score: int
    passed: bool
    attempted_at: datetime

    model_config = {"from_attributes": True}


class AttemptHistory(BaseModel):
    quiz_id: uuid.UUID
    attempts: list[AttemptSummary]


# ── Feature 2: chapter-based quiz submit (used by /quiz/{chapter_id}/submit) ─

class QuizSubmitRequest(BaseModel):
    answers: dict[str, str]  # {"q1": "a", "q2": "c"}


class QuizSubmitResult(BaseModel):
    """Scores expressed as 0.0-1.0 floats to match the frontend QuizResult type."""
    chapter_id: uuid.UUID
    user_id: uuid.UUID
    score: float           # 0.0–1.0
    passed: bool
    passing_score: float   # 0.0–1.0
    correct_count: int
    total_questions: int
    results: list[QuestionResult]
