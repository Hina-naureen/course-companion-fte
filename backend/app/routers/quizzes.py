from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, UTC

from app.database import get_db
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User
from app.schemas.quiz import (
    AttemptRequest, AttemptResult, QuestionResult, AttemptHistory, AttemptSummary,
)
from app.middleware.auth import get_current_user
from app.config import get_settings
import uuid

router = APIRouter(prefix="/quizzes", tags=["quizzes"])
settings = get_settings()


def _score_mcq(quiz: Quiz, answers: dict[str, str]) -> tuple[int, list[QuestionResult]]:
    correct_count = 0
    results = []
    for q in quiz.questions:
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
    total = len(quiz.questions)
    score = round((correct_count / total) * 100) if total > 0 else 0
    return score, results


@router.post("/{quiz_id}/attempt", response_model=AttemptResult, status_code=status.HTTP_201_CREATED)
async def submit_attempt(
    quiz_id: uuid.UUID,
    body: AttemptRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Rate limit: free users get 3 attempts/day per quiz
    if current_user.tier == "free":
        today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        count_result = await db.execute(
            select(func.count()).where(
                QuizAttempt.user_id == current_user.id,
                QuizAttempt.quiz_id == quiz_id,
                QuizAttempt.attempted_at >= today_start,
            )
        )
        attempts_today = count_result.scalar()
        if attempts_today >= settings.free_quiz_attempts_daily:
            raise HTTPException(
                status_code=429,
                detail=f"Free tier limit: {settings.free_quiz_attempts_daily} attempts/day per quiz. Upgrade to Pro for unlimited.",
            )

    score, question_results = _score_mcq(quiz, body.answers)
    passed = score >= quiz.passing_score

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        answers=body.answers,
        score=score,
        passed=passed,
        time_taken_secs=body.time_taken_secs,
    )
    db.add(attempt)
    await db.flush()

    return AttemptResult(
        attempt_id=attempt.id,
        score=score,
        passed=passed,
        passing_score=quiz.passing_score,
        results=question_results,
    )


@router.get("/{quiz_id}/attempts", response_model=AttemptHistory)
async def get_attempts(
    quiz_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == current_user.id, QuizAttempt.quiz_id == quiz_id)
        .order_by(QuizAttempt.attempted_at.desc())
    )
    attempts = result.scalars().all()

    return AttemptHistory(
        quiz_id=quiz_id,
        attempts=[AttemptSummary.model_validate(a) for a in attempts],
    )
