"""
Course Tutor API — FastAPI backend with JWT authentication.

Public endpoints (no token required):
  POST /auth/register
  POST /auth/login
  POST /auth/refresh
  POST /auth/logout

Protected endpoints (Bearer token required):
  GET  /auth/me
  GET  /chapters
  GET  /chapters/{id}
  GET  /chapters/{id}/next
  POST /quiz/{id}/submit
  PUT  /progress/{user_id}
  GET  /search?q=
  GET  /access/check

Run:
  cd backend
  uvicorn tutor.main:app --reload --port 8001
"""
import logging
import re
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .auth import get_current_user, router as auth_router
from .content_loader import ContentLoader
from .database import Base, engine, get_db
from .models import Progress, User
from .quiz_engine import QuizEngine
from .schemas import (
    AccessCheckResponse,
    ChapterDetail,
    ChapterSummary,
    ProgressResponse,
    ProgressUpdate,
    QuizOption,
    QuizPublic,
    QuizQuestion,
    QuizResult,
    QuizSubmission,
    SearchResponse,
    SearchResult,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
log = logging.getLogger(__name__)

# ── Singletons ─────────────────────────────────────────────────────────────────

loader      = ContentLoader()
quiz_engine = QuizEngine(loader)

# ── Lifespan ───────────────────────────────────────────────────────────────────

def _migrate(conn) -> None:
    """
    Add columns introduced by the auth update to an existing `users` table.
    SQLite does not support ADD COLUMN IF NOT EXISTS, so we inspect first.
    New tables (refresh_tokens) are handled by create_all.
    """
    insp = inspect(conn)
    if "users" not in insp.get_table_names():
        return  # create_all will build it fresh

    existing = {col["name"] for col in insp.get_columns("users")}
    if "email" not in existing:
        conn.execute(text("ALTER TABLE users ADD COLUMN email TEXT"))
        log.info("Migration: added users.email")
    if "password_hash" not in existing:
        conn.execute(text("ALTER TABLE users ADD COLUMN password_hash TEXT"))
        log.info("Migration: added users.password_hash")


@asynccontextmanager
async def lifespan(app: FastAPI):
    with engine.begin() as conn:
        _migrate(conn)
        Base.metadata.create_all(bind=conn)
    log.info("Database ready.")

    loader.load()

    yield

    log.info("Shutting down.")


# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Course Tutor API",
    description=(
        "JWT-authenticated, zero-LLM backend for the Generative AI Fundamentals course.\n\n"
        "**Auth flow:** `POST /auth/register` → receive tokens → "
        "send `Authorization: Bearer <access_token>` on all other requests."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.include_router(auth_router)

# Type aliases used as FastAPI dependencies
DbDep      = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


# ── Shared helpers ─────────────────────────────────────────────────────────────

def _chapter_or_404(chapter_id: str):
    ch = loader.get_chapter(chapter_id)
    if ch is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter not found: '{chapter_id}'",
        )
    return ch


def _to_summary(ch) -> ChapterSummary:
    return ChapterSummary(
        id             = ch.slug,
        number         = ch.number,
        title          = ch.title,
        summary        = ch.summary,
        tier_required  = ch.tier_required,
        estimated_mins = ch.estimated_mins,
        tags           = ch.tags,
        has_quiz       = ch.has_quiz,
    )


def _upsert_progress(
    db:          Session,
    *,
    user_id:     str,
    chapter_id:  str,
    status:      str,
    quiz_score:  int  | None = None,
    quiz_passed: bool | None = None,
) -> Progress:
    """
    Create or update a Progress row.
    `quiz_score` / `quiz_passed` are only written when explicitly supplied.
    """
    row = (
        db.query(Progress)
        .filter_by(user_id=user_id, chapter_id=chapter_id)
        .first()
    )
    if row is None:
        row = Progress(
            user_id     = user_id,
            chapter_id  = chapter_id,
            status      = status,
            quiz_score  = quiz_score,
            quiz_passed = quiz_passed,
        )
        db.add(row)
    else:
        row.status = status
        if quiz_score is not None:
            row.quiz_score  = quiz_score
            row.quiz_passed = quiz_passed

    db.commit()
    db.refresh(row)
    return row


# ── GET /chapters ──────────────────────────────────────────────────────────────

@app.get(
    "/chapters",
    response_model=list[ChapterSummary],
    summary="List all chapters",
    tags=["chapters"],
)
def list_chapters(_: CurrentUser):
    """Returns metadata for all chapters in order. `content_md` excluded."""
    return [_to_summary(ch) for ch in loader.all_chapters()]


# ── GET /chapters/{id} ─────────────────────────────────────────────────────────

@app.get(
    "/chapters/{chapter_id}",
    response_model=ChapterDetail,
    summary="Get a chapter with full markdown content",
    tags=["chapters"],
)
def get_chapter(chapter_id: str, _: CurrentUser):
    """Accepts the chapter slug (`how-llms-work`) or number (`2`)."""
    ch = _chapter_or_404(chapter_id)
    return ChapterDetail(
        id             = ch.slug,
        number         = ch.number,
        title          = ch.title,
        summary        = ch.summary,
        content_md     = ch.content_md,
        tier_required  = ch.tier_required,
        estimated_mins = ch.estimated_mins,
        tags           = ch.tags,
        has_quiz       = ch.has_quiz,
    )


# ── GET /chapters/{id}/next ────────────────────────────────────────────────────

@app.get(
    "/chapters/{chapter_id}/next",
    response_model=ChapterSummary,
    summary="Get the next chapter in the sequence",
    tags=["chapters"],
)
def get_next_chapter(chapter_id: str, _: CurrentUser):
    """Returns 404 if `chapter_id` is the last chapter."""
    _chapter_or_404(chapter_id)
    nxt = loader.next_chapter(chapter_id)
    if nxt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No next chapter — this is the last chapter in the course.",
        )
    return _to_summary(nxt)


# ── GET /quiz/{id} ────────────────────────────────────────────────────────────

@app.get(
    "/quiz/{chapter_id}",
    response_model=QuizPublic,
    summary="Get quiz questions for a chapter (no answer keys)",
    tags=["quiz"],
)
def get_quiz(chapter_id: str, _: CurrentUser):
    """Returns questions and options. `correct_option` is never exposed."""
    _chapter_or_404(chapter_id)
    qd = loader.get_quiz(chapter_id)
    if qd is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No quiz found for chapter: '{chapter_id}'",
        )
    return QuizPublic(
        chapter_id    = chapter_id,
        title         = qd.title,
        quiz_type     = qd.quiz_type,
        passing_score = qd.passing_score,
        questions     = [
            QuizQuestion(
                id      = q["id"],
                text    = q["text"],
                options = [QuizOption(id=o["id"], text=o["text"]) for o in q["options"]],
            )
            for q in qd.questions
        ],
    )


# ── POST /quiz/{id}/submit ─────────────────────────────────────────────────────

@app.post(
    "/quiz/{chapter_id}/submit",
    response_model=QuizResult,
    summary="Submit quiz answers and receive graded results",
    tags=["quiz"],
)
def submit_quiz(
    chapter_id:   str,
    body:         QuizSubmission,
    current_user: CurrentUser,
    db:           DbDep,
):
    """
    Grades answers against the static answer key.
    The submitting user is taken from the Bearer token — no `user_id` in body.
    Also writes the result to the progress table automatically.
    """
    try:
        graded = quiz_engine.grade(chapter_id, current_user.user_id, body.answers)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

    _upsert_progress(
        db,
        user_id     = current_user.user_id,
        chapter_id  = graded.chapter_id,
        status      = "completed" if graded.passed else "in_progress",
        quiz_score  = graded.score,
        quiz_passed = graded.passed,
    )

    return graded.to_schema()


# ── PUT /progress/{user_id} ────────────────────────────────────────────────────

@app.put(
    "/progress/{user_id}",
    response_model=ProgressResponse,
    summary="Create or update chapter progress",
    tags=["progress"],
)
def update_progress(
    user_id:      str,
    body:         ProgressUpdate,
    current_user: CurrentUser,
    db:           DbDep,
):
    """
    Users may only update their own progress.
    The `user_id` path param must match the authenticated user's id.
    """
    if user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own progress.",
        )

    ch = loader.get_chapter(body.chapter_id)
    if ch is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter not found: '{body.chapter_id}'",
        )

    row = _upsert_progress(
        db,
        user_id    = current_user.user_id,
        chapter_id = ch.slug,
        status     = body.status,
    )

    return ProgressResponse(
        user_id     = row.user_id,
        chapter_id  = row.chapter_id,
        status      = row.status,
        quiz_score  = row.quiz_score,
        quiz_passed = row.quiz_passed,
        updated_at  = row.updated_at,
    )


# ── GET /search ────────────────────────────────────────────────────────────────

@app.get(
    "/search",
    response_model=SearchResponse,
    summary="Keyword search across all chapters",
    tags=["search"],
)
def search_chapters(
    current_user: CurrentUser,
    q:     Annotated[str, Query(min_length=1, max_length=200)],
    limit: Annotated[int, Query(ge=1, le=20)] = 5,
):
    """
    Relevance scoring: title match (+3), summary match (+2), content match (+1, capped at +5).
    Results returned in descending relevance order.
    """
    hits = loader.search(q, limit=limit)
    results = [
        SearchResult(
            id         = ch.slug,
            number     = ch.number,
            title      = ch.title,
            summary    = ch.summary,
            matched_in = field,
            relevance  = score,
        )
        for ch, field, score in hits
    ]
    return SearchResponse(query=q, total=len(results), results=results)


# ── GET /access/check ─────────────────────────────────────────────────────────

@app.get(
    "/access/check",
    response_model=AccessCheckResponse,
    summary="Check whether the current user can access a chapter",
    tags=["access"],
)
def check_access(
    current_user: CurrentUser,
    chapter_id:   Annotated[str, Query(min_length=1, description="Chapter slug or number")],
):
    """
    Freemium rules:
    - `free` tier → accessible only when `chapter.tier_required == "free"`.
    - `pro`  tier → all chapters accessible.

    The user is identified from the Bearer token — no `user_id` query param needed.
    """
    ch = loader.get_chapter(chapter_id)
    if ch is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter not found: '{chapter_id}'",
        )

    if ch.tier_required == "free":
        accessible, reason = True,  "Free chapter — accessible to all users."
    elif current_user.tier == "pro":
        accessible, reason = True,  "Pro chapter — user has a Pro subscription."
    else:
        accessible, reason = False, "Pro chapter — upgrade to Pro to unlock this content."

    return AccessCheckResponse(
        user_id       = current_user.user_id,
        chapter_id    = ch.slug,
        accessible    = accessible,
        reason        = reason,
        tier_required = ch.tier_required,
        user_tier     = current_user.tier,
    )
