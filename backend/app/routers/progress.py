from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, UTC
import uuid

from app.database import get_db
from app.models.chapter import Chapter
from app.models.progress import Progress
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User
from app.schemas.progress import (
    ProgressSummary, ChapterProgressItem, ProgressUpdate,
    ProgressAnalytics, QuizHistoryItem,
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=ProgressSummary)
async def get_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chapter_result = await db.execute(select(Chapter).order_by(Chapter.number))
    all_chapters = chapter_result.scalars().all()
    total = len(all_chapters)

    progress_result = await db.execute(
        select(Progress).where(Progress.user_id == current_user.id)
    )
    progress_map = {p.chapter_id: p for p in progress_result.scalars().all()}

    completed = 0
    items = []
    for ch in all_chapters:
        p = progress_map.get(ch.id)
        status = p.status if p else "not_started"
        if status == "completed":
            completed += 1
        items.append(ChapterProgressItem(
            chapter_id=ch.id,
            slug=ch.slug,
            title=ch.title,
            status=status,
        ))

    return ProgressSummary(
        completed_chapters=completed,
        total_chapters=total,
        completion_pct=round((completed / total) * 100) if total > 0 else 0,
        chapters=items,
    )


@router.put("/chapters/{chapter_id}", response_model=ChapterProgressItem)
async def update_chapter_progress(
    chapter_id: uuid.UUID,
    body: ProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid_statuses = {"not_started", "in_progress", "completed"}
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"status must be one of {valid_statuses}")

    ch_result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = ch_result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    prog_result = await db.execute(
        select(Progress).where(
            Progress.user_id == current_user.id,
            Progress.chapter_id == chapter_id,
        )
    )
    progress = prog_result.scalar_one_or_none()

    now = datetime.now(UTC)
    if progress is None:
        progress = Progress(
            user_id=current_user.id,
            chapter_id=chapter_id,
            status=body.status,
            started_at=now if body.status in ("in_progress", "completed") else None,
            completed_at=now if body.status == "completed" else None,
        )
        db.add(progress)
    else:
        progress.status = body.status
        if body.status == "in_progress" and not progress.started_at:
            progress.started_at = now
        if body.status == "completed":
            progress.completed_at = now

    await db.flush()

    return ChapterProgressItem(
        chapter_id=chapter.id,
        slug=chapter.slug,
        title=chapter.title,
        status=progress.status,
    )


@router.get("/analytics", response_model=ProgressAnalytics)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),  # available to all tiers
):
    # Quiz attempt history
    attempts_result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.attempted_at.desc())
        .limit(50)
    )
    attempts = attempts_result.scalars().all()

    avg_score = round(sum(a.score for a in attempts) / len(attempts)) if attempts else 0

    quiz_history = [
        QuizHistoryItem(quiz_id=a.quiz_id, score=a.score, date=a.attempted_at)
        for a in attempts[:20]
    ]

    # Chapter progress
    all_chapters_result = await db.execute(select(Chapter).order_by(Chapter.number))
    all_chapters = all_chapters_result.scalars().all()
    total_chapters = len(all_chapters)

    completed_result = await db.execute(
        select(Progress)
        .where(Progress.user_id == current_user.id, Progress.status == "completed")
    )
    completed_rows = completed_result.scalars().all()
    completed_count = len(completed_rows)
    completion_pct = round((completed_count / total_chapters) * 100) if total_chapters > 0 else 0
    time_spent = completed_count * 15  # estimate 15 mins per completed chapter

    return ProgressAnalytics(
        completed_chapters=completed_count,
        total_chapters=total_chapters,
        completion_percent=completion_pct,
        average_quiz_score=float(avg_score),
        streak_days=0,
        time_spent_mins=time_spent,
        weakest_topics=[],
        quiz_history=quiz_history,
    )
