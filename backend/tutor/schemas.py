"""
Pydantic request/response schemas.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth schemas ───────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email:    EmailStr
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def password_not_whitespace(cls, v: str) -> str:
        if v.strip() != v:
            raise ValueError("Password must not start or end with whitespace")
        return v


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserProfile(BaseModel):
    user_id:    str
    email:      Optional[str]
    tier:       str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str
    expires_in:    int      # seconds until access token expires
    user:          UserProfile


# ── Chapter schemas ────────────────────────────────────────────────────────────

class ChapterSummary(BaseModel):
    id:             str     # slug, e.g. "how-llms-work"
    number:         int
    title:          str
    summary:        str
    tier_required:  str
    estimated_mins: int
    tags:           list[str]
    has_quiz:       bool


class ChapterDetail(ChapterSummary):
    content_md: str


# ── Quiz schemas ───────────────────────────────────────────────────────────────

class QuizOption(BaseModel):
    id:   str
    text: str


class QuizQuestion(BaseModel):
    id:      str
    text:    str
    options: list[QuizOption]


class QuizPublic(BaseModel):
    """Quiz questions served to the client — no correct_option exposed."""
    chapter_id:    str
    title:         str
    quiz_type:     str
    passing_score: int
    questions:     list[QuizQuestion]


class QuizSubmission(BaseModel):
    """Body for POST /quiz/{id}/submit.  user_id is taken from the JWT."""
    answers: dict[str, str] = Field(
        ...,
        description="Map of question_id → chosen option id, e.g. {'q1': 'b', 'q2': 'c'}",
    )

    @field_validator("answers")
    @classmethod
    def answers_not_empty(cls, v: dict) -> dict:
        if not v:
            raise ValueError("answers must contain at least one entry")
        return v


class QuestionResult(BaseModel):
    question_id:    str
    correct:        bool
    your_answer:    str
    correct_answer: str
    explanation:    Optional[str]


class QuizResult(BaseModel):
    chapter_id:      str
    user_id:         str
    score:           int
    passed:          bool
    passing_score:   int
    correct_count:   int
    total_questions: int
    results:         list[QuestionResult]


# ── Progress schemas ───────────────────────────────────────────────────────────

class ProgressUpdate(BaseModel):
    chapter_id: str = Field(..., min_length=1)
    status:     Literal["not_started", "in_progress", "completed"]


class ProgressResponse(BaseModel):
    user_id:     str
    chapter_id:  str
    status:      str
    quiz_score:  Optional[int]
    quiz_passed: Optional[bool]
    updated_at:  Optional[datetime]


# ── Search schemas ─────────────────────────────────────────────────────────────

class SearchResult(BaseModel):
    id:         str
    number:     int
    title:      str
    summary:    str
    matched_in: str   # "title" | "summary" | "content"
    relevance:  int


class SearchResponse(BaseModel):
    query:   str
    total:   int
    results: list[SearchResult]


# ── Access schemas ─────────────────────────────────────────────────────────────

class AccessCheckResponse(BaseModel):
    user_id:       str
    chapter_id:    str
    accessible:    bool
    reason:        str
    tier_required: str
    user_tier:     str
