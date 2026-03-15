# Course Companion FTE
### Generative AI Fundamentals — Panaversity Agent Factory Hackathon IV

> A three-phase AI-enhanced learning platform that teaches Generative AI fundamentals through structured chapters, rule-based quizzes, progress tracking, and an optional Claude-powered skills layer — built on the Zero-Backend-LLM architecture.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Live Demo](#live-demo)
- [Phase Breakdown](#phase-breakdown)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Freemium Tiers](#freemium-tiers)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Deployment](#deployment)
- [Hackathon Checklist](#hackathon-checklist)
- [Team](#team)

---

## Project Overview

**Course Companion FTE** (Fundamentals Track Edition) is a complete AI learning platform for Generative AI Fundamentals. It delivers 5 structured chapters (~100 min of reading), adaptive MCQ quizzes, full-text search, progress analytics, and an AI voice tutor — all under a freemium model.

The project demonstrates the **Zero-Backend-LLM** architecture: Phase 1 uses ChatGPT as the intelligence layer while the FastAPI backend remains a pure data API. Phase 2 adds Claude API skills. Phase 3 delivers a full Next.js web app.

### Key Numbers
| Metric | Value |
|---|---|
| Course chapters | 5 (100 min total) |
| Quiz questions | 25+ MCQ + open-ended |
| API endpoints | 16 (Phase 1) + 4 (Phase 2 skills) |
| Database tables | 7 |
| AI providers | 4 (Gemini → OpenRouter → OpenAI → Claude) |
| Frontend pages | 9 (Next.js) |

---

## Architecture

### System Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        COURSE COMPANION FTE                                  ║
║                   Zero-Backend-LLM → Hybrid → Full Web App                   ║
╠══════════════════════╦═══════════════════════╦═══════════════════════════════╣
║   PHASE 1            ║   PHASE 2             ║   PHASE 3                     ║
║   Zero-Backend-LLM   ║   Hybrid Intelligence ║   Full Web App                ║
╠══════════════════════╬═══════════════════════╬═══════════════════════════════╣
║                      ║                       ║                               ║
║  ┌────────────────┐  ║  ┌─────────────────┐  ║  ┌─────────────────────────┐ ║
║  │  ChatGPT GPT   │  ║  │  ChatGPT GPT    │  ║  │   Next.js 15 Web App    │ ║
║  │  Custom App    │  ║  │  + Claude Skills│  ║  │   (App Router)          │ ║
║  │                │  ║  │                 │  ║  │  Dashboard / Chapters   │ ║
║  │  System Prompt │  ║  │  /skills/explain│  ║  │  Quizzes / Analytics    │ ║
║  │  + Actions     │  ║  │  /skills/hint   │  ║  │  AI Voice Tutor         │ ║
║  └───────┬────────┘  ║  └────────┬────────┘  ║  └──────────┬──────────────┘ ║
║          │ OpenAPI   ║           │ OpenAPI   ║             │ REST + JWT     ║
╠══════════╪═══════════╩═══════════╪═══════════╩═════════════╪════════════════╣
║          ▼                       ▼                         ▼                ║
║  ╔═══════════════════════════════════════════════════════════════════════╗   ║
║  ║                     FastAPI Backend  /api/v1/                        ║   ║
║  ║                                                                      ║   ║
║  ║   /auth          JWT HS256 · bcrypt · register/login/refresh/me      ║   ║
║  ║   /chapters      Tier-aware content · pg_tsvector full-text search   ║   ║
║  ║   /quizzes       Rule-based MCQ grading · daily attempt limits       ║   ║
║  ║   /progress      Status tracking · analytics · completion %          ║   ║
║  ║   /search        Full-text search · 10/day free · rate limiting      ║   ║
║  ║   /skills        Claude API skills (Phase 2 — optional mount)        ║   ║
║  ║   /ai            AI Tutor · TTS · multi-provider fallback            ║   ║
║  ║                                                                      ║   ║
║  ║                 ◄── ZERO LLM CALLS IN PHASE 1 ──►                   ║   ║
║  ╚═══════════════════════════════╤═══════════════════════════════════════╝   ║
║                                  │ async asyncpg                            ║
║  ╔═══════════════════════════════▼═══════════════════════════════════════╗   ║
║  ║                    PostgreSQL 16 Database                             ║   ║
║  ║                                                                      ║   ║
║  ║  users │ chapters │ quizzes │ quiz_attempts │ progress               ║   ║
║  ║  subscriptions │ search_log                                          ║   ║
║  ║                                                                      ║   ║
║  ║  GIN index on search_vector (tsvector) · JSONB for quiz questions    ║   ║
║  ╚══════════════════════════════════════════════════════════════════════╝   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Request Flow (Phase 1)

```
User types question
      │
      ▼
ChatGPT Custom GPT
(system prompt interprets intent)
      │
      ├── "show me chapter 2" ──► GET /api/v1/chapters/2
      ├── "take the quiz"      ──► GET /api/v1/chapters/2/quiz
      ├── "submit my answers"  ──► POST /api/v1/quizzes/{id}/attempt
      ├── "my progress"        ──► GET /api/v1/progress
      └── "search for RAG"     ──► GET /api/v1/search?q=RAG
                                          │
                                          ▼
                              FastAPI (pure data API)
                                  JWT auth check
                                  tier access check
                                  DB query / rule-based logic
                                          │
                                          ▼
                              JSON response → ChatGPT formats it
```

### Phase 2 Skills Flow

```
User: "Explain attention mechanisms in simple terms"
      │
      ▼
ChatGPT detects explanation intent
      │
      ▼
POST /api/v1/skills/explain
{ concept: "attention mechanisms", depth: "beginner", chapter_id: "..." }
      │
      ▼
skills/explain_concept.py
      │
      ▼
Claude claude-sonnet-4-6 API
(structured JSON response)
      │
      ▼
{ explanation: "...", analogy: "...", key_points: [...] }
      │
      ▼
ChatGPT renders formatted response to user
```

---

## Live Demo

| Interface | URL |
|---|---|
| Backend API (Swagger) | `http://localhost:8000/docs` |
| Backend API (ReDoc) | `http://localhost:8000/redoc` |
| Next.js Web App | `http://localhost:3000` |
| Health Check | `http://localhost:8000/health` |

---

## Phase Breakdown

### Phase 1 — Zero-Backend-LLM (Complete)
The FastAPI backend is a **pure data API**. Not a single LLM call happens on the server. All conversational intelligence lives in the ChatGPT Custom GPT system prompt and Actions schema.

**What works:**
- User registration & JWT authentication
- 5 course chapters with full markdown content
- Rule-based MCQ quiz grading (no AI needed)
- Progress tracking (not_started → in_progress → completed)
- Full-text search with PostgreSQL `pg_tsvector`
- Freemium gating (chapters 1-3 free, tier checks in JWT)
- Daily rate limits (3 quiz attempts, 10 searches)

### Phase 2 — Hybrid Intelligence (Integrated, optional)
Claude API skills mounted **only when `ANTHROPIC_API_KEY` is set** in environment. The backend gracefully degrades to Phase 1 if the key is absent.

**Skills added:**
- `POST /skills/explain` — Concept explanation at 3 depth levels
- `POST /skills/hint` — Adaptive Socratic quiz hints (3 levels)
- `POST /skills/quiz/generate` — Novel quiz generation from chapter content (Pro)
- `POST /skills/search/semantic` — Semantic reranking of search results

### Phase 3 — Full Web App (Complete)
Next.js 15 App Router frontend replaces ChatGPT GPT as the primary user interface.

**Features:**
- Auth pages (login / register) with JWT persistence
- Dashboard with progress stats and chapter grid
- Chapter reader with `ReactMarkdown` rendering
- AI Voice Tutor (animated orb, TTS, multi-provider fallback)
- Skeleton UI, React Query caching, Zustand auth store
- Freemium upgrade prompts and tier-locked content

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Backend** | FastAPI 0.115 + Python 3.12 | Async, Uvicorn |
| **Database** | PostgreSQL 16 | asyncpg driver, Alembic migrations |
| **ORM** | SQLAlchemy 2.0 (async) | Type-safe models |
| **Auth** | JWT HS256 | 1h access, 7d refresh, tier in claims |
| **Passwords** | bcrypt (factor 12) | Via passlib |
| **Search** | PostgreSQL pg_tsvector | GIN index, ranked results |
| **AI Phase 1** | None (Zero-Backend-LLM) | ChatGPT GPT as intelligence |
| **AI Phase 2** | Claude claude-sonnet-4-6 | Skills layer (optional) |
| **AI Tutor** | Gemini → OpenRouter → OpenAI → Claude | Multi-provider fallback |
| **TTS** | OpenAI TTS-1 (alloy voice) | AI teacher audio |
| **Frontend** | Next.js 15 (App Router) | React 19 |
| **Styling** | Tailwind CSS | Dark theme |
| **Animations** | Framer Motion | Orb, page transitions |
| **State** | Zustand + persist | Auth, instant user restore |
| **Server State** | React Query v5 | Caching, shared keys |
| **HTTP Client** | Axios | JWT interceptors, auto-refresh |
| **Icons** | Lucide React | |
| **Markdown** | react-markdown | Chapter content rendering |
| **Containers** | Docker + Docker Compose | PostgreSQL + backend |

---

## Project Structure

```
course-companion-fte/
│
├── backend/                          # FastAPI backend (Phases 1 & 2)
│   ├── app/
│   │   ├── main.py                   # App entry point, router mounting, lifespan
│   │   ├── config.py                 # Pydantic settings via .env
│   │   ├── database.py               # Async SQLAlchemy engine + session
│   │   ├── models/                   # ORM models (7 tables)
│   │   │   ├── user.py
│   │   │   ├── chapter.py            # includes search_vector (tsvector)
│   │   │   ├── quiz.py               # JSONB questions
│   │   │   ├── quiz_attempt.py       # JSONB answers, score, passed
│   │   │   ├── progress.py           # status enum
│   │   │   ├── subscription.py       # Stripe integration
│   │   │   └── search_log.py         # rate-limit tracking
│   │   ├── schemas/                  # Pydantic v2 request/response models
│   │   ├── routers/
│   │   │   ├── auth.py               # register, login, refresh, me
│   │   │   ├── chapters.py           # list, get (tier-aware)
│   │   │   ├── quiz.py               # chapter-based quiz
│   │   │   ├── quizzes.py            # attempt submission, history
│   │   │   ├── progress.py           # summary, update, analytics
│   │   │   ├── search.py             # full-text search
│   │   │   ├── skills.py             # Phase 2 Claude skills (optional)
│   │   │   └── ai.py                 # AI tutor + course generator
│   │   ├── middleware/
│   │   │   └── auth.py               # get_current_user, require_pro
│   │   ├── services/
│   │   │   └── ai_service.py         # LLM provider wrappers
│   │   └── utils/
│   │       └── jwt.py                # token create/decode
│   ├── migrations/                   # Alembic migration files
│   │   └── versions/
│   │       └── 20260312_0001_initial_schema.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── alembic.ini
│   └── seed.py                       # Seed 5 chapters + quizzes from content/
│
├── skills/                           # Phase 2: Claude API skill modules
│   ├── explain_concept.py            # Multi-depth concept explainer
│   ├── adaptive_hint.py              # 3-level Socratic quiz hints
│   ├── generate_quiz.py              # Novel quiz generation (Pro)
│   └── semantic_search.py            # Search result semantic reranking
│
├── web-app/                          # Phase 3: Next.js 15 frontend
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx    # Progress stats + chapter grid
│   │   │   ├── chapters/page.tsx     # Chapter library
│   │   │   ├── chapters/[slug]/page.tsx  # Chapter reader
│   │   │   ├── quizzes/[id]/page.tsx
│   │   │   ├── progress/page.tsx     # Analytics (Pro)
│   │   │   └── upgrade/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing page + AI chat demo
│   ├── components/
│   │   ├── AITeacher.tsx             # AI voice orb + chat UI
│   │   ├── AiTutorChat.tsx           # Landing page chat widget
│   │   ├── providers.tsx             # React Query provider
│   │   ├── skeletons.tsx             # Skeleton loading states
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── api.ts                    # Axios client + JWT interceptors
│   │   ├── auth-store.ts             # Zustand + persist
│   │   ├── query-client.ts           # React Query config + shared KEYS
│   │   └── types.ts                  # TypeScript definitions
│   ├── middleware.ts                 # Next.js auth routing
│   └── package.json
│
├── content/                          # Course content source files
│   ├── chapters/
│   │   ├── 01-what-is-generative-ai.md
│   │   ├── 02-how-llms-work.md
│   │   ├── 03-prompt-engineering.md
│   │   ├── 04-ai-ethics-and-responsible-use.md
│   │   └── 05-building-with-generative-ai.md
│   └── quizzes/
│       ├── quiz-01.json
│       ├── quiz-02.json
│       ├── quiz-03.json
│       ├── quiz-04.json
│       └── quiz-05.json
│
├── gpt-config/                       # ChatGPT Custom GPT configuration
│   ├── system-prompt.md              # Full GPT system prompt
│   └── openapi-actions.yaml          # OpenAPI spec for GPT Actions
│
├── docs/
│   ├── architecture.md               # System design (this project)
│   ├── architecture-diagram.md       # Detailed ASCII diagrams
│   ├── api-reference.md              # Full API documentation
│   ├── database-schema.md            # PostgreSQL DDL + JSONB schemas
│   ├── demo-script.md                # 5-minute demo video script
│   ├── cost-analysis.md              # Monthly cost breakdown
│   └── roadmap.md                    # Sprint-by-sprint plan
│
├── docker-compose.yml                # Local dev: PostgreSQL + backend
└── README.md                         # This file
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose v2
- Node.js 20+ (for web app)
- Git

### 1. Clone and configure

```bash
git clone https://github.com/your-org/course-companion-fte.git
cd course-companion-fte

cp backend/.env.example backend/.env
# Minimum required: set JWT_SECRET_KEY
# Optional: add ANTHROPIC_API_KEY to enable Phase 2 skills
```

### 2. Start backend + database

```bash
docker-compose up -d
# PostgreSQL starts on :5432, FastAPI on :8000
# Tables created automatically on first startup (lifespan hook)
```

### 3. Seed course content

```bash
cd backend
pip install -r requirements.txt          # if running outside Docker

python seed.py                           # load 5 chapters + quizzes
python seed.py --clear                   # wipe and reload from scratch
```

### 4. Verify backend

```bash
curl http://localhost:8000/health
# → {"status":"ok","phase":1,"skills_enabled":false}

open http://localhost:8000/docs          # Swagger UI
```

### 5. Start web app

```bash
cd web-app
npm install
cp .env.local.example .env.local        # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# → http://localhost:3000
```

### 6. Run database migrations (if needed)

```bash
cd backend
alembic upgrade head       # apply all migrations
alembic current            # verify current revision
alembic history --verbose  # view migration history
```

---

## API Reference

All endpoints are prefixed `/api/v1/`. Full documentation: [`docs/api-reference.md`](docs/api-reference.md)

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Create account, returns JWT pair |
| `POST` | `/auth/login` | None | Login, returns JWT pair |
| `POST` | `/auth/refresh` | None | Refresh access token |
| `GET` | `/auth/me` | Bearer | Get current user profile |

### Content

| Method | Path | Auth | Tier | Description |
|---|---|---|---|---|
| `GET` | `/chapters` | Bearer | Free 1-3, Pro all | List all chapters |
| `GET` | `/chapters/{id}` | Bearer | Free 1-3, Pro all | Get chapter detail + content |
| `GET` | `/chapters/{id}/quiz` | Bearer | Free (MCQ), Pro (all) | Get chapter quiz |

### Quizzes

| Method | Path | Auth | Tier | Description |
|---|---|---|---|---|
| `POST` | `/quizzes/{id}/attempt` | Bearer | Free 3/day, Pro ∞ | Submit answers, get scored result |
| `GET` | `/quizzes/{id}/attempts` | Bearer | — | Attempt history |

### Progress

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/progress` | Bearer | Summary (% complete, counts) |
| `PUT` | `/progress/chapters/{id}` | Bearer | Update chapter status |
| `GET` | `/progress/analytics` | Bearer (Pro) | Full analytics |

### Search

| Method | Path | Auth | Tier | Description |
|---|---|---|---|---|
| `GET` | `/search?q={query}` | Bearer | Free 10/day, Pro ∞ | Full-text chapter search |

### Phase 2 Skills (requires `ANTHROPIC_API_KEY`)

| Method | Path | Auth | Tier | Description |
|---|---|---|---|---|
| `POST` | `/skills/explain` | Bearer | Free 5/day, Pro ∞ | Explain concept at depth |
| `POST` | `/skills/hint` | Bearer | — | Adaptive Socratic hint (levels 1-3) |
| `POST` | `/skills/quiz/generate` | Bearer | Pro only | Generate novel quiz |
| `POST` | `/skills/search/semantic` | Bearer | — | Semantic result reranking |

### Utility

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Health check + phase indicator |

---

## Freemium Tiers

| Feature | Free | Pro |
|---|---|---|
| Chapters | 1–3 only | All 5 chapters |
| Quiz types | MCQ only | MCQ + open-ended |
| Quiz attempts | 3 per day | Unlimited |
| Search queries | 10 per day | Unlimited |
| Progress analytics | Pass/fail only | Full charts + streak |
| AI explanations (Phase 2) | 5 per day | Unlimited |
| AI quiz generation (Phase 2) | No | Yes |
| Price | Free | $9.99/month |

Tier is embedded in the JWT access token (`tier: "free" | "pro"`) to avoid a DB lookup on every request.

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/course_companion

# Auth
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Phase 2 Skills (optional — skills router only mounted when set)
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6

# AI Tutor providers (multi-provider fallback)
GEMINI_API_KEY=AIza...
GEMINI_MODEL=gemini-2.0-flash
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free

# Freemium limits
FREE_CHAPTER_LIMIT=3
FREE_SEARCH_DAILY_LIMIT=10
FREE_QUIZ_ATTEMPTS_DAILY=3
FREE_AI_EXPLAINS_DAILY=5

# App
DEBUG=true
CORS_ORIGINS=["http://localhost:3000","https://chat.openai.com"]
```

### Frontend (`web-app/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Database

### Schema Overview

```
users           — email, password_hash, tier (free|pro), is_active
chapters        — number, slug, title, content_md, tier_required, search_vector
quizzes         — chapter_id, questions (JSONB), quiz_type (mcq|open), passing_score
quiz_attempts   — user_id, quiz_id, answers (JSONB), score, passed
progress        — user_id, chapter_id, status (not_started|in_progress|completed)
subscriptions   — user_id, plan, stripe_subscription_id, expires_at
search_log      — user_id, query, searched_at  ← daily rate-limit tracking
```

Full DDL and schema: [`docs/database-schema.md`](docs/database-schema.md)

### Migrations

```bash
cd backend

alembic upgrade head                                 # apply all
alembic revision --autogenerate -m "add table"       # new migration
alembic downgrade -1                                  # rollback one
alembic downgrade base                                # full rollback
```

---

## Deployment

### Docker Compose (Local / Dev)

```bash
docker-compose up -d        # starts PostgreSQL + FastAPI
docker-compose logs -f      # follow logs
docker-compose down         # stop
docker-compose down -v      # stop and delete volumes
```

### Production Notes

- Set `DEBUG=false` in `.env`
- Generate a strong `JWT_SECRET_KEY` (32+ chars, random)
- Use managed PostgreSQL (e.g. Neon, Supabase, AWS RDS)
- Deploy backend to Railway, Render, or Fly.io
- Deploy frontend to Vercel
- Set `CORS_ORIGINS` to your actual domain

---

## Hackathon Checklist

| Requirement | Status |
|---|---|
| Zero-Backend-LLM in Phase 1 | ✅ FastAPI has zero LLM calls in Phase 1 |
| ChatGPT Custom GPT | ✅ GPT config in `gpt-config/` |
| OpenAPI Actions schema | ✅ `gpt-config/openapi-actions.yaml` |
| FastAPI backend | ✅ Async, PostgreSQL, JWT auth |
| Content API | ✅ 5 chapters, tier-aware |
| Navigation API | ✅ Chapter list + breadcrumbs |
| Quiz API (rule-based) | ✅ MCQ scoring, no LLM |
| Progress tracking | ✅ Per-chapter status + analytics |
| Search API | ✅ pg_tsvector full-text |
| Freemium access control | ✅ JWT tier claims, daily limits |
| Phase 2 Claude skills | ✅ `/skills/*` (optional mount) |
| Phase 3 Web App | ✅ Next.js 15 complete |
| Architecture diagram | ✅ `docs/architecture-diagram.md` |
| API documentation | ✅ Swagger + `docs/api-reference.md` |
| Demo video script | ✅ `docs/demo-script.md` |
| Cost analysis | ✅ `docs/cost-analysis.md` |
| Docker deployment | ✅ `docker-compose.yml` |

---

## Docs

- [Architecture](docs/architecture.md)
- [Architecture Diagrams](docs/architecture-diagram.md)
- [API Reference](docs/api-reference.md)
- [Database Schema](docs/database-schema.md)
- [Demo Script](docs/demo-script.md)
- [Cost Analysis](docs/cost-analysis.md)
- [Development Roadmap](docs/roadmap.md)
- [ChatGPT GPT Config](gpt-config/)

---

## Team

Built for **Panaversity Agent Factory Hackathon IV**.

> Stack: FastAPI · PostgreSQL · Claude claude-sonnet-4-6 · Next.js 15 · Tailwind CSS
