"""
Feature 2 — Quiz Engine router.

Provides chapter-based quiz access endpoints that the frontend calls:
  GET  /api/v1/quiz/{chapter_id}        → fetch quiz (no correct answers exposed)
  POST /api/v1/quiz/{chapter_id}/submit → submit answers, get scored result

Scores returned as 0.0–1.0 floats to match the frontend QuizResult type.
"""
import uuid as uuid_lib
from datetime import datetime, UTC

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.chapter import Chapter
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User
from app.middleware.auth import get_current_user
from app.config import get_settings
from app.schemas.quiz import (
    QuizPublic, QuizQuestion, QuizOption,
    QuestionResult, QuizSubmitRequest, QuizSubmitResult,
)

router = APIRouter(prefix="/quiz", tags=["quiz"])
settings = get_settings()


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _get_chapter_and_quiz(
    chapter_id: uuid_lib.UUID,
    db: AsyncSession,
) -> tuple[Chapter, Quiz]:
    ch_res = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = ch_res.scalar_one_or_none()
    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")

    quiz_res = await db.execute(select(Quiz).where(Quiz.chapter_id == chapter_id))
    quiz = quiz_res.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(status_code=404, detail="No quiz found for this chapter")

    return chapter, quiz


def _public_questions(raw: list[dict]) -> list[QuizQuestion]:
    """Strip correct_option and explanation from each question."""
    return [
        QuizQuestion(
            id=q["id"],
            text=q["text"],
            options=[QuizOption(**opt) for opt in q.get("options", [])],
        )
        for q in raw
    ]


def _score(
    raw_questions: list[dict],
    answers: dict[str, str],
) -> tuple[float, int, int, list[QuestionResult]]:
    correct_count = 0
    results: list[QuestionResult] = []

    for q in raw_questions:
        qid = q["id"]
        user_ans = answers.get(qid, "")
        correct_ans = q.get("correct_option", "")
        is_correct = user_ans == correct_ans
        if is_correct:
            correct_count += 1
        results.append(QuestionResult(
            question_id=qid,
            correct=is_correct,
            your_answer=user_ans,
            correct_answer=correct_ans,
            explanation=q.get("explanation"),
        ))

    total = len(raw_questions)
    score_pct = correct_count / total if total > 0 else 0.0
    return score_pct, correct_count, total, results


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "/{chapter_id}",
    response_model=QuizPublic,
    summary="Get the quiz for a chapter (no correct answers)",
)
async def get_chapter_quiz(
    chapter_id: uuid_lib.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chapter, quiz = await _get_chapter_and_quiz(chapter_id, db)
    return QuizPublic(
        id=quiz.id,
        chapter_id=quiz.chapter_id,
        title=quiz.title,
        quiz_type=quiz.quiz_type,
        questions=_public_questions(quiz.questions),
        passing_score=quiz.passing_score,
    )


@router.post(
    "/{chapter_id}/submit",
    response_model=QuizSubmitResult,
    status_code=status.HTTP_201_CREATED,
    summary="Submit quiz answers and receive a scored result",
)
async def submit_chapter_quiz(
    chapter_id: uuid_lib.UUID,
    body: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chapter, quiz = await _get_chapter_and_quiz(chapter_id, db)

    # Rate-limit free users
    if current_user.tier == "free":
        today = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        count_res = await db.execute(
            select(func.count()).where(
                QuizAttempt.user_id == current_user.id,
                QuizAttempt.quiz_id == quiz.id,
                QuizAttempt.attempted_at >= today,
            )
        )
        if count_res.scalar() >= settings.free_quiz_attempts_daily:
            raise HTTPException(
                status_code=429,
                detail=(
                    f"Free tier limit: {settings.free_quiz_attempts_daily} attempts/day. "
                    "Upgrade to Pro for unlimited attempts."
                ),
            )

    score_float, correct_count, total, question_results = _score(quiz.questions, body.answers)
    passing_float = quiz.passing_score / 100.0
    passed = score_float >= passing_float

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        answers=body.answers,
        score=round(score_float * 100),  # stored as integer 0-100
        passed=passed,
    )
    db.add(attempt)
    await db.flush()

    return QuizSubmitResult(
        chapter_id=chapter_id,
        user_id=current_user.id,
        score=score_float,
        passed=passed,
        passing_score=passing_float,
        correct_count=correct_count,
        total_questions=total,
        results=question_results,
    )
