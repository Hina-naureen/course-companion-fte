"""
Phase 2: Claude API skills router.
Each endpoint delegates to a skills/ module that calls claude-sonnet-4-6.
No LLM calls exist in Phase 1 — this router is only mounted when ANTHROPIC_API_KEY is set.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, UTC
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models.chapter import Chapter
from app.models.quiz import Quiz
from app.models.search_log import SearchLog
from app.models.user import User
from app.middleware.auth import get_current_user, require_pro
from app.config import get_settings

router = APIRouter(prefix="/skills", tags=["skills (Phase 2)"])
settings = get_settings()


# ── Request / Response schemas ──────────────────────────────────────────────

class ExplainRequest(BaseModel):
    chapter_id: uuid.UUID
    concept: str
    depth: str = "beginner"   # beginner | intermediate | expert


class ExplainResponse(BaseModel):
    concept: str
    explanation: str
    analogy: str | None = None
    key_points: list[str]
    further_reading: list[str]


class HintRequest(BaseModel):
    quiz_id: uuid.UUID
    question_id: str
    user_answer: str
    hint_level: int = 1


class HintResponse(BaseModel):
    hint: str
    hint_level: int
    max_hints: int = 3


class GenerateQuizRequest(BaseModel):
    chapter_id: uuid.UUID
    count: int = 5
    difficulty: str = "medium"
    quiz_type: str = "mcq"


class SemanticSearchRequest(BaseModel):
    query: str
    candidate_ids: list[uuid.UUID]


class RankedResult(BaseModel):
    chapter_id: uuid.UUID
    relevance_score: float
    reason: str


class SemanticSearchResponse(BaseModel):
    ranked_results: list[RankedResult]


# ── Helpers ─────────────────────────────────────────────────────────────────

async def _get_chapter_or_404(chapter_id: uuid.UUID, db: AsyncSession) -> Chapter:
    result = await db.execute(select(Chapter).where(Chapter.id == chapter_id))
    chapter = result.scalar_one_or_none()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chapter


async def _check_free_explain_limit(user_id, db: AsyncSession) -> None:
    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    # Re-use search_log as a proxy; in production use a dedicated ai_usage table
    result = await db.execute(
        select(func.count()).where(
            SearchLog.user_id == user_id,
            SearchLog.query.like("__explain__%"),
            SearchLog.searched_at >= today_start,
        )
    )
    count = result.scalar()
    if count >= settings.free_ai_explains_daily:
        raise HTTPException(
            status_code=429,
            detail=f"Free tier: {settings.free_ai_explains_daily} AI explanations/day. Upgrade to Pro.",
        )


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/explain", response_model=ExplainResponse)
async def explain_concept(
    body: ExplainRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.tier == "free":
        await _check_free_explain_limit(current_user.id, db)

    chapter = await _get_chapter_or_404(body.chapter_id, db)

    from skills.explain_concept import explain
    response = await explain(
        concept=body.concept,
        chapter_content=chapter.content_md,
        depth=body.depth,
    )

    # Log usage
    log = SearchLog(
        user_id=current_user.id,
        query=f"__explain__{body.concept}",
        result_count=1,
    )
    db.add(log)

    return response


@router.post("/hint", response_model=HintResponse)
async def get_hint(
    body: HintRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Quiz).where(Quiz.id == body.quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    question = next((q for q in quiz.questions if q["id"] == body.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    from skills.adaptive_hint import get_hint as _get_hint
    return await _get_hint(
        question=question,
        user_answer=body.user_answer,
        hint_level=body.hint_level,
    )


@router.post("/quiz/generate")
async def generate_quiz(
    body: GenerateQuizRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_pro),
):
    chapter = await _get_chapter_or_404(body.chapter_id, db)

    from skills.generate_quiz import generate
    return await generate(
        chapter_content=chapter.content_md,
        chapter_title=chapter.title,
        count=body.count,
        difficulty=body.difficulty,
        quiz_type=body.quiz_type,
    )


@router.post("/search/semantic", response_model=SemanticSearchResponse)
async def semantic_search(
    body: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Chapter).where(Chapter.id.in_(body.candidate_ids))
    )
    chapters = result.scalars().all()
    if not chapters:
        raise HTTPException(status_code=404, detail="No matching chapters found")

    from skills.semantic_search import rerank
    return await rerank(query=body.query, chapters=chapters)
