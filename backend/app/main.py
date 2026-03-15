from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, chapters, quizzes, progress, search
from app.routers import quiz as quiz_chapter  # chapter-based quiz endpoints

settings = get_settings()


# Ensure the audio output directory exists before the app starts
_STATIC_AUDIO = Path("static/audio")
_STATIC_AUDIO.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
## Course Companion FTE – Generative AI Fundamentals

A three-phase AI-enhanced learning platform.

**Phase 1** — Zero-Backend-LLM: Pure data API serving course content, quizzes, progress, and search.
**Phase 2** — Hybrid Intelligence: Claude-powered skills for adaptive explanations and quiz generation.
**Phase 3** — Full Web App: Next.js frontend replacing ChatGPT Custom GPT.

### Auth
All endpoints (except `/auth/register` and `/auth/login`) require:
```
Authorization: Bearer <access_token>
```
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",  # used by ChatGPT Custom GPT Actions
)

# CORS — wildcard in dev, strict list in production
_cors_origins = ["*"] if settings.debug else settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=False if settings.debug else True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Phase 1 routers
API_PREFIX = "/api/v1"
app.include_router(auth.router,        prefix=API_PREFIX)
app.include_router(chapters.router,    prefix=API_PREFIX)
app.include_router(quizzes.router,     prefix=API_PREFIX)
app.include_router(quiz_chapter.router, prefix=API_PREFIX)  # Feature 2: /quiz/{chapter_id}
app.include_router(progress.router,    prefix=API_PREFIX)
app.include_router(search.router,      prefix=API_PREFIX)

# Phase 2: mount skills router only if Claude API key is configured
if settings.anthropic_api_key:
    from app.routers.skills import router as skills_router
    app.include_router(skills_router, prefix=API_PREFIX)

# Phase 2 / Feature 1: AI tutor + course generator.
# Only mounted when at least one AI provider key is configured.
# With no keys set the backend is a pure Phase 1 Zero-Backend-LLM server.
_any_ai_key = any([
    settings.gemini_api_key,
    settings.openrouter_api_key,
    settings.openai_api_key,
    settings.anthropic_api_key,
])
if _any_ai_key:
    from app.routers.ai import router as ai_router
    app.include_router(ai_router, prefix=API_PREFIX)

# Serve generated audio files at /static/audio/<filename>.mp3
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Ensure unhandled 500 errors still carry CORS headers.
    Without this, the browser reports a CORS error instead of the real 500."""
    origin = request.headers.get("origin", "")
    headers = {"Access-Control-Allow-Origin": origin or "*"}
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
    )


@app.get("/health", tags=["meta"])
async def health():
    skills_enabled  = bool(settings.anthropic_api_key)
    ai_tutor_enabled = _any_ai_key
    phase = 1
    if skills_enabled:
        phase = 2
    elif ai_tutor_enabled:
        phase = 2   # AI tutor keys only → still hybrid, not pure Phase 1
    return {
        "status": "ok",
        "version": settings.app_version,
        "phase": phase,
        "skills_enabled": skills_enabled,
        "ai_tutor_enabled": ai_tutor_enabled,
    }
