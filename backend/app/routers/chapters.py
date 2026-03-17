import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.chapter import Chapter
from app.models.quiz import Quiz
from app.models.user import User
from app.schemas.chapter import ChapterSummary, ChapterDetail, ChapterListResponse
from app.schemas.quiz import QuizPublic, QuizQuestion, QuizOption
from app.middleware.auth import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/chapters", tags=["chapters"])
settings = get_settings()


def _is_locked(chapter: Chapter, user: User) -> bool:
    return chapter.tier_required == "pro" and user.tier == "free"


def _strip_answers(questions: list) -> list[QuizQuestion]:
    result = []
    for q in questions:
        options = None
        if "options" in q:
            options = [QuizOption(id=o["id"], text=o["text"]) for o in q["options"]]
        result.append(QuizQuestion(id=q["id"], text=q["text"], options=options))
    return result


@router.get("", response_model=ChapterListResponse)
async def list_chapters(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    tag: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Chapter).order_by(Chapter.number)
    if tag:
        query = query.where(Chapter.tags.contains([tag]))

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar()

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    chapters = result.scalars().all()

    # Check which chapters have quizzes
    chapter_ids = [c.id for c in chapters]
    quiz_result = await db.execute(
        select(Quiz.chapter_id).where(Quiz.chapter_id.in_(chapter_ids))
    )
    chapters_with_quizzes = {row[0] for row in quiz_result.fetchall()}

    summaries = []
    for ch in chapters:
        summary = ChapterSummary(
            id=ch.id,
            number=ch.number,
            slug=ch.slug,
            title=ch.title,
            summary=ch.summary,
            tier_required=ch.tier_required,
            estimated_mins=ch.estimated_mins,
            tags=ch.tags,
            has_quiz=ch.id in chapters_with_quizzes,
            locked=_is_locked(ch, current_user),
        )
        summaries.append(summary)

    return ChapterListResponse(total=total, page=page, limit=limit, chapters=summaries)


@router.get("/{chapter_id}", response_model=ChapterDetail)
async def get_chapter(
    chapter_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Support lookup by UUID or slug
    try:
        uid = uuid.UUID(chapter_id)
        result = await db.execute(select(Chapter).where(Chapter.id == uid))
    except ValueError:
        result = await db.execute(select(Chapter).where(Chapter.slug == chapter_id))

    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    if _is_locked(chapter, current_user):
        raise HTTPException(
            status_code=403,
            detail="This chapter requires a Pro subscription.",
            headers={"X-Upgrade-Url": "/upgrade"},
        )

    quiz_result = await db.execute(
        select(Quiz).where(Quiz.chapter_id == chapter.id).limit(1)
    )
    has_quiz = quiz_result.scalar_one_or_none() is not None

    return ChapterDetail(
        id=chapter.id,
        number=chapter.number,
        slug=chapter.slug,
        title=chapter.title,
        summary=chapter.summary,
        content_md=chapter.content_md,
        tier_required=chapter.tier_required,
        estimated_mins=chapter.estimated_mins,
        tags=chapter.tags,
        has_quiz=has_quiz,
        locked=False,
        updated_at=chapter.updated_at,
    )


@router.get("/{chapter_id}/quiz", response_model=QuizPublic)
async def get_chapter_quiz(
    chapter_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        uid = uuid.UUID(chapter_id)
        ch_result = await db.execute(select(Chapter).where(Chapter.id == uid))
    except ValueError:
        ch_result = await db.execute(select(Chapter).where(Chapter.slug == chapter_id))

    chapter = ch_result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    if _is_locked(chapter, current_user):
        raise HTTPException(status_code=403, detail="Chapter requires Pro subscription")

    quiz_result = await db.execute(
        select(Quiz).where(Quiz.chapter_id == chapter.id).limit(1)
    )
    quiz = quiz_result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="No quiz for this chapter")

    if quiz.quiz_type == "open" and current_user.tier == "free":
        raise HTTPException(
            status_code=403,
            detail="Open-ended quizzes require a Pro subscription.",
        )

    return QuizPublic(
        id=quiz.id,
        chapter_id=quiz.chapter_id,
        title=quiz.title,
        quiz_type=quiz.quiz_type,
        questions=_strip_answers(quiz.questions),
        passing_score=quiz.passing_score,
    )
