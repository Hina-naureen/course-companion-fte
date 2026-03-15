from pydantic import BaseModel
from datetime import datetime
import uuid


class ChapterProgressItem(BaseModel):
    chapter_id: uuid.UUID
    slug: str
    title: str
    status: str

    model_config = {"from_attributes": True}


class ProgressSummary(BaseModel):
    completed_chapters: int
    total_chapters: int
    completion_pct: int
    chapters: list[ChapterProgressItem]


class ProgressUpdate(BaseModel):
    status: str

    def validate_status(self) -> None:
        valid = {"not_started", "in_progress", "completed"}
        if self.status not in valid:
            raise ValueError(f"status must be one of {valid}")


class QuizHistoryItem(BaseModel):
    quiz_id: uuid.UUID
    score: int
    date: datetime


class ProgressAnalytics(BaseModel):
    # Feature 3 simple fields (available to all users)
    completed_chapters: int
    total_chapters: int
    completion_percent: int
    average_quiz_score: float
    # Extended fields
    streak_days: int
    time_spent_mins: int
    weakest_topics: list[str]
    quiz_history: list[QuizHistoryItem]
