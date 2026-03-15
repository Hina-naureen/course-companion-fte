"""
AI router — Feature 1 (AI Tutor + TTS) and Feature 4 (AI Course Generator).

Provider priority for /ai/tutor:
  1. Gemini (primary)   — if GEMINI_API_KEY is set
  2. OpenAI gpt-4o-mini — fallback if OPENAI_API_KEY is set
  3. Anthropic Claude   — fallback if ANTHROPIC_API_KEY is set
"""
import asyncio
import logging
import re
import uuid as uuid_lib
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.chapter import Chapter
from app.models.quiz import Quiz
from app.models.user import User
from app.middleware.auth import get_current_user
from app.schemas.ai import (
    TutorRequest, TutorResponse,
    GenerateCourseRequest, GenerateCourseResponse,
)
import openai as _openai

from app.services.ai_service import (
    ask_tutor_gemini, ask_tutor, ask_tutor_openrouter, ask_tutor_claude, text_to_speech, generate_course,
)
from app.config import get_settings

log = logging.getLogger(__name__)

# Audio files are saved here and served at /static/audio/
AUDIO_DIR = Path("static/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/ai", tags=["ai"])
settings = get_settings()


def _friendly_api_error(openai_exc: Exception, claude_exc: Exception) -> str:
    """
    Inspect both exceptions and return a clear, actionable message.
    Anthropic credit errors come back as 400 BadRequestError with a specific message.
    """
    claude_msg = str(claude_exc).lower()
    openai_msg = str(openai_exc).lower()

    if "credit balance" in claude_msg or "insufficient_quota" in openai_msg or "quota" in openai_msg:
        return (
            "Both API accounts are out of credits. "
            "Top up at platform.openai.com (OpenAI) or console.anthropic.com (Claude) to restore the AI teacher."
        )
    return f"AI service unavailable — OpenAI: {type(openai_exc).__name__}, Claude: {type(claude_exc).__name__}."


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:80]


# ── Feature 1: AI Tutor ───────────────────────────────────────────────────────

@router.post("/tutor", response_model=TutorResponse, summary="Ask the AI tutor a question about a chapter")
async def ai_tutor(
    request: Request,
    body: TutorRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    1. Resolves the chapter (UUID or slug).
    2. Asks the LLM for an explanation.
    3. Converts the answer to speech (TTS-1, alloy voice) and saves it.
    4. Returns { answer, audio_url } — audio_url is None if TTS fails.
    """
    # ── Resolve chapter ───────────────────────────────────────────────────────
    chapter: Chapter | None = None
    try:
        chapter_uuid = uuid_lib.UUID(body.chapter_id)
        result = await db.execute(select(Chapter).where(Chapter.id == chapter_uuid))
        chapter = result.scalar_one_or_none()
    except ValueError:
        pass

    if chapter is None:
        result = await db.execute(select(Chapter).where(Chapter.slug == body.chapter_id))
        chapter = result.scalar_one_or_none()

    if chapter is None:
        raise HTTPException(status_code=404, detail="Chapter not found")

    # ── Generate text answer: Gemini → OpenAI → Claude ───────────────────────
    answer: str | None = None
    tutor_kwargs = dict(
        chapter_title=chapter.title,
        chapter_content=chapter.content_md,
        question=body.question,
    )

    # 1. Gemini (primary)
    if settings.gemini_api_key:
        try:
            answer = await ask_tutor_gemini(
                **tutor_kwargs,
                api_key=settings.gemini_api_key,
                model=settings.gemini_model,
            )
            log.info("Answered via Gemini (%s)", settings.gemini_model)
        except Exception as exc:
            log.warning("Gemini error (%s) — trying fallback", exc)

    # 2. OpenRouter fallback (free models, OpenAI-compatible)
    if answer is None and settings.openrouter_api_key:
        try:
            answer = await ask_tutor_openrouter(
                **tutor_kwargs,
                api_key=settings.openrouter_api_key,
                model=settings.openrouter_model,
            )
            log.info("Answered via OpenRouter (%s)", settings.openrouter_model)
        except Exception as exc:
            log.warning("OpenRouter error (%s) — trying next fallback", exc)

    # 3. OpenAI fallback
    if answer is None and settings.openai_api_key:
        try:
            answer = await ask_tutor(**tutor_kwargs, api_key=settings.openai_api_key)
            log.info("Answered via OpenAI")
        except (_openai.RateLimitError, _openai.AuthenticationError) as exc:
            log.warning("OpenAI unavailable: %s", exc)
        except Exception as exc:
            log.warning("OpenAI error: %s", exc)

    # 4. Claude fallback (if all above failed and key is configured)
    if answer is None and settings.anthropic_api_key:
        try:
            answer = await ask_tutor_claude(**tutor_kwargs, api_key=settings.anthropic_api_key)
            log.info("Answered via Claude")
        except Exception as exc:
            log.warning("Claude error: %s", exc)

    # All providers failed
    if answer is None:
        providers_tried = []
        if settings.gemini_api_key:
            providers_tried.append("Gemini")
        if settings.openrouter_api_key:
            providers_tried.append("OpenRouter")
        if settings.openai_api_key:
            providers_tried.append("OpenAI")
        if settings.anthropic_api_key:
            providers_tried.append("Claude")
        raise HTTPException(
            status_code=503,
            detail=(
                f"No AI provider is available ({', '.join(providers_tried) or 'none configured'} all failed). "
                "Set GEMINI_API_KEY in your .env file."
            ),
        )

    # ── Convert to speech (non-fatal: failure returns answer without audio) ──
    audio_url: str | None = None
    try:
        mp3_bytes = await text_to_speech(answer, api_key=settings.openai_api_key)
        filename = f"{uuid_lib.uuid4().hex}.mp3"
        audio_path = AUDIO_DIR / filename
        await asyncio.to_thread(audio_path.write_bytes, mp3_bytes)

        # Build an absolute URL the browser can fetch directly from the backend
        base = str(request.base_url).rstrip("/")   # e.g. http://localhost:8000
        audio_url = f"{base}/static/audio/{filename}"
    except Exception as exc:
        log.warning("TTS failed, returning text-only response: %s", exc)

    return TutorResponse(answer=answer, audio_url=audio_url)


# ── Feature 4: AI Course Generator ───────────────────────────────────────────

@router.post(
    "/generate-course",
    response_model=GenerateCourseResponse,
    status_code=201,
    summary="Generate a 5-chapter course with quizzes using AI",
)
async def generate_ai_course(
    body: GenerateCourseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Uses the LLM to generate a 5-chapter course on the given topic,
    saves chapters and MCQ quizzes to the database, and returns the result.
    """
    try:
        course_data = await generate_course(topic=body.topic, api_key=settings.gemini_api_key, model=settings.gemini_model)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI generation error: {exc}")

    # Find the next available chapter number to avoid conflicts
    max_result = await db.execute(select(func.max(Chapter.number)))
    next_num = (max_result.scalar() or 0) + 1

    course_title = course_data.get("course_title", body.topic)
    raw_chapters = course_data.get("chapters", [])
    chapter_ids: list[str] = []

    for i, ch_data in enumerate(raw_chapters[:5]):
        chapter_num = next_num + i
        title = ch_data.get("title", f"Chapter {chapter_num}")
        slug_base = _slugify(title)
        slug = f"{slug_base}-{chapter_num}"

        chapter = Chapter(
            number=chapter_num,
            slug=slug,
            title=title,
            summary=ch_data.get("summary", ""),
            content_md=ch_data.get("content_md", ""),
            tier_required="free",
            estimated_mins=15,
            tags=["ai-generated"],
        )
        db.add(chapter)
        await db.flush()  # populate chapter.id

        questions = ch_data.get("quiz_questions", [])
        if questions:
            quiz = Quiz(
                chapter_id=chapter.id,
                title=f"{title} Quiz",
                quiz_type="mcq",
                tier_required="free",
                questions=questions,
                passing_score=70,
            )
            db.add(quiz)

        chapter_ids.append(str(chapter.id))

    await db.flush()

    return GenerateCourseResponse(
        course_title=course_title,
        topic=body.topic,
        chapters_saved=len(chapter_ids),
        chapter_ids=chapter_ids,
    )
