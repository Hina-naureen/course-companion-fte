# Course Companion FTE — Architecture Diagrams

---

## Diagram 1 — Full System (All Phases)

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                          COURSE COMPANION FTE                                    ║
║              Generative AI Fundamentals — Hackathon IV Submission                ║
╠════════════════════╦═══════════════════════╦═════════════════════════════════════╣
║  PHASE 1           ║  PHASE 2              ║  PHASE 3                            ║
║  Zero-Backend-LLM  ║  Hybrid Intelligence  ║  Full Web App                       ║
╠════════════════════╬═══════════════════════╬═════════════════════════════════════╣
║                    ║                       ║                                     ║
║ ┌──────────────┐   ║ ┌───────────────────┐ ║ ┌─────────────────────────────────┐ ║
║ │ ChatGPT GPT  │   ║ │  ChatGPT GPT      │ ║ │      Next.js 15 Web App         │ ║
║ │              │   ║ │  (system prompt   │ ║ │                                 │ ║
║ │ system prompt│   ║ │   + Claude skills)│ ║ │  / ──── Landing Page            │ ║
║ │ + Actions    │   ║ │                   │ ║ │  /dashboard ── Progress Stats   │ ║
║ │ schema       │   ║ │ /skills/explain   │ ║ │  /chapters ─── Chapter Library  │ ║
║ │              │   ║ │ /skills/hint      │ ║ │  /chapters/[slug] ─ Reader      │ ║
║ │ "Aria" tutor │   ║ │ /skills/generate  │ ║ │  /quizzes/[id] ─── Quiz Engine  │ ║
║ │ persona      │   ║ │ /skills/semantic  │ ║ │  /progress ─── Analytics (Pro)  │ ║
║ └──────┬───────┘   ║ └─────────┬─────────┘ ║ │  AI Voice Tutor Orb             │ ║
║        │ HTTPS     ║           │           ║ └──────────────┬──────────────────┘ ║
║        │ OpenAPI   ║           │           ║                │ Axios + JWT        ║
╠════════╪═══════════╩═══════════╪═══════════╩════════════════╪════════════════════╣
║        ▼                       ▼                            ▼                    ║
║ ╔═════════════════════════════════════════════════════════════════════════════╗   ║
║ ║                        FastAPI Backend   /api/v1/                          ║   ║
║ ║                                                                             ║   ║
║ ║  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  ║   ║
║ ║  │  /auth       │  │  /chapters  │  │  /quizzes    │  │  /progress     │  ║   ║
║ ║  │              │  │             │  │              │  │                │  ║   ║
║ ║  │ register     │  │ list()      │  │ attempt()    │  │ summary()      │  ║   ║
║ ║  │ login        │  │ get(id)     │  │ ── rule-based│  │ update()       │  ║   ║
║ ║  │ refresh      │  │ quiz(id)    │  │    grading   │  │ analytics()    │  ║   ║
║ ║  │ me()         │  │ tier check  │  │ ── no LLM    │  │ Pro guard      │  ║   ║
║ ║  └──────────────┘  └─────────────┘  └──────────────┘  └────────────────┘  ║   ║
║ ║                                                                             ║   ║
║ ║  ┌──────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐   ║   ║
║ ║  │  /search     │  │  /skills    │  │  /ai  (multi-provider tutor)    │   ║   ║
║ ║  │              │  │  (Phase 2)  │  │                                 │   ║   ║
║ ║  │ full-text    │  │             │  │  Gemini Flash ──► primary        │   ║   ║
║ ║  │ pg_tsvector  │  │ only if     │  │  OpenRouter ───► fallback 1      │   ║   ║
║ ║  │ 10/day free  │  │ ANTHROPIC_  │  │  OpenAI ───────► fallback 2      │   ║   ║
║ ║  │ rate limit   │  │ API_KEY set │  │  Claude ───────► fallback 3      │   ║   ║
║ ║  └──────────────┘  └──────┬──────┘  └─────────────────────────────────┘   ║   ║
║ ║                            │                                               ║   ║
║ ║                ┌───────────▼───────────┐                                   ║   ║
║ ║                │  Claude claude-sonnet-4-6      │    ← Phase 2 only        ║   ║
║ ║                │  skills/ modules      │                                   ║   ║
║ ║                │  explain_concept.py   │                                   ║   ║
║ ║                │  adaptive_hint.py     │                                   ║   ║
║ ║                │  generate_quiz.py     │                                   ║   ║
║ ║                │  semantic_search.py   │                                   ║   ║
║ ║                └───────────────────────┘                                   ║   ║
║ ║                                                                             ║   ║
║ ║  Middleware: JWT HS256 auth · bcrypt passwords · Pydantic v2 validation    ║   ║
║ ║  ◄─────────────── ZERO LLM CALLS IN PHASE 1 ───────────────────────────►  ║   ║
║ ╚═════════════════════════════════╤═══════════════════════════════════════════╝   ║
║                                   │ async asyncpg driver                         ║
║ ╔═════════════════════════════════▼═══════════════════════════════════════════╗   ║
║ ║                          PostgreSQL 16                                      ║   ║
║ ║                                                                             ║   ║
║ ║  users            email · password_hash · tier(free|pro) · is_active       ║   ║
║ ║  chapters         number · slug · content_md · search_vector(tsvector)     ║   ║
║ ║  quizzes          chapter_id · questions(JSONB) · quiz_type · passing_score ║   ║
║ ║  quiz_attempts    user_id · answers(JSONB) · score · passed                ║   ║
║ ║  progress         user_id · chapter_id · status(not_started|in_progress    ║   ║
║ ║                             |completed)                                    ║   ║
║ ║  subscriptions    user_id · plan · stripe_subscription_id · expires_at     ║   ║
║ ║  search_log       user_id · query · searched_at  (rate-limit tracking)     ║   ║
║ ║                                                                             ║   ║
║ ║  Indexes: GIN on search_vector · composite on (user_id, quiz_id, date)     ║   ║
║ ╚═════════════════════════════════════════════════════════════════════════════╝   ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## Diagram 2 — Phase 1 Request Flow (Zero-Backend-LLM)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PHASE 1 REQUEST FLOWS                            │
└─────────────────────────────────────────────────────────────────────┘

USER                  ChatGPT GPT              FastAPI              PostgreSQL
 │                       │                        │                      │
 │  "open chapter 2"     │                        │                      │
 ├──────────────────────►│                        │                      │
 │                       │  GET /chapters/2       │                      │
 │                       ├───────────────────────►│                      │
 │                       │                        │  SELECT * FROM       │
 │                       │                        │  chapters WHERE      │
 │                       │                        │  id = '...'          │
 │                       │                        ├─────────────────────►│
 │                       │                        │  {chapter row}       │
 │                       │                        │◄─────────────────────┤
 │                       │  {id, title, content}  │                      │
 │                       │◄───────────────────────┤                      │
 │  Formatted chapter    │                        │                      │
 │  content with nice    │ PUT /progress/chapters/ │                      │
 │  headers & structure  ├───────────────────────►│                      │
 │◄──────────────────────┤                        │  UPSERT progress     │
 │                       │  {status: in_progress} │  SET in_progress     │
 │                       │◄───────────────────────┤─────────────────────►│
 │                       │                        │                      │

USER                  ChatGPT GPT              FastAPI              PostgreSQL
 │                       │                        │                      │
 │  "take the quiz"      │                        │                      │
 ├──────────────────────►│                        │                      │
 │                       │  GET /chapters/2/quiz  │                      │
 │                       ├───────────────────────►│                      │
 │                       │  {questions, NO answers}                      │
 │                       │◄───────────────────────┤                      │
 │  Q1: "What is a       │                        │                      │
 │  transformer?"        │                        │                      │
 │◄──────────────────────┤                        │                      │
 │  (user answers Q1-Q5) │                        │                      │
 │                       │  POST /quizzes/id/attempt                     │
 │                       │  {answers: {q1:"B"...}}│                      │
 │                       ├───────────────────────►│                      │
 │                       │                        │  Rule-based grading  │
 │                       │                        │  (no LLM needed)     │
 │                       │                        ├─────────────────────►│
 │                       │  {score:80%, passed,   │  INSERT attempt      │
 │                       │   feedback per Q}      │◄─────────────────────┤
 │                       │◄───────────────────────┤                      │
 │  "You scored 80%! ✅  │                        │                      │
 │   You passed. Here's  │                        │                      │
 │   feedback on each Q" │                        │                      │
 │◄──────────────────────┤                        │                      │
```

---

## Diagram 3 — Phase 2 Skills Layer (Hybrid Intelligence)

```
┌─────────────────────────────────────────────────────────────────────┐
│                   PHASE 2 HYBRID INTELLIGENCE                       │
└─────────────────────────────────────────────────────────────────────┘

USER              ChatGPT GPT          FastAPI          Claude API
 │                    │                    │                  │
 │  "Explain          │                    │                  │
 │  attention         │                    │                  │
 │  mechanisms        │                    │                  │
 │  simply"           │                    │                  │
 ├───────────────────►│                    │                  │
 │                    │  POST /skills/     │                  │
 │                    │  explain           │                  │
 │                    │  {concept:         │                  │
 │                    │  "attention",      │                  │
 │                    │  depth: "beginner"}│                  │
 │                    ├───────────────────►│                  │
 │                    │                    │  explain_        │
 │                    │                    │  concept.py      │
 │                    │                    ├─────────────────►│
 │                    │                    │  Structured JSON │
 │                    │                    │  response        │
 │                    │                    │◄─────────────────┤
 │                    │  {explanation,     │                  │
 │                    │   analogy,         │                  │
 │                    │   key_points[]}    │                  │
 │                    │◄───────────────────┤                  │
 │  Rich formatted    │                    │                  │
 │  explanation with  │                    │                  │
 │  analogy & bullets │                    │                  │
 │◄───────────────────┤                    │                  │

             Skills Layer Architecture
             ─────────────────────────

             /skills/explain  ──► explain_concept.py
                                  depth: beginner|intermediate|advanced
                                  returns: explanation + analogy + key_points

             /skills/hint     ──► adaptive_hint.py
                                  level: 1 (gentle) → 3 (near-answer)
                                  Socratic method — never gives away answer

             /skills/quiz/    ──► generate_quiz.py
             generate              Pro tier only
                                  Novel questions from chapter content

             /skills/search/  ──► semantic_search.py
             semantic              Reranks pg_tsvector results
                                  by semantic relevance
```

---

## Diagram 4 — Authentication & Tier Control

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTH & FREEMIUM FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

Register/Login
──────────────
POST /auth/register { email, password }
          │
          ▼
    hash password (bcrypt, factor 12)
          │
          ▼
    INSERT INTO users (email, hash, tier="free")
          │
          ▼
    create_access_token({ sub: user_id, tier: "free", type: "access" })
    create_refresh_token({ sub: user_id, type: "refresh" })
          │
          ▼
    { access_token, refresh_token, user }

Every Protected Request
───────────────────────
GET /chapters/4
  Authorization: Bearer <access_token>
          │
          ▼
    decode JWT → { sub: user_id, tier: "free" }    ← O(0) - no DB hit
          │
          ▼
    chapter.tier_required == "pro"
    user.tier == "free"
          │
          ▼
    403 { detail: "Pro tier required" }    ← tier check in JWT

Rate Limit Check (search, quizzes, AI explains)
────────────────────────────────────────────────
GET /search?q=attention
          │
          ▼
    SELECT COUNT(*) FROM search_log
    WHERE user_id = ? AND searched_at > NOW() - INTERVAL '1 day'
          │
          ├── count >= 10 (free limit) ──► 429 Too Many Requests
          │
          └── count < 10 ──► proceed, INSERT search_log row, return results

JWT Payload Structure
─────────────────────
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  ← user_id
  "tier": "free",                                   ← tier claim (no DB hit needed)
  "type": "access",                                 ← "access" | "refresh"
  "exp": 1710000000,                                ← 1h from now
  "iat": 1709996400
}
```

---

## Diagram 5 — Database Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA (ER DIAGRAM)                     │
└─────────────────────────────────────────────────────────────────────┘

users
─────────────────────────────────
PK  id              UUID
    email           VARCHAR UNIQUE
    password_hash   VARCHAR
    tier            ENUM(free, pro)
    is_active       BOOLEAN
    created_at      TIMESTAMP
    updated_at      TIMESTAMP (trigger)
    │
    ├──1:N──► progress (user_id FK)
    ├──1:N──► quiz_attempts (user_id FK)
    ├──1:1──► subscriptions (user_id FK)
    └──1:N──► search_log (user_id FK)

chapters
─────────────────────────────────
PK  id              UUID
    number          INTEGER (1-5)
    slug            VARCHAR UNIQUE
    title           VARCHAR
    summary         TEXT
    content_md      TEXT (full markdown)
    estimated_mins  INTEGER
    tier_required   ENUM(free, pro)
    tags            JSONB
    search_vector   TSVECTOR  ◄── GIN INDEX for full-text search
    has_quiz        BOOLEAN
    created_at      TIMESTAMP
    updated_at      TIMESTAMP (trigger)
    │
    └──1:1──► quizzes (chapter_id FK)

quizzes
─────────────────────────────────
PK  id              UUID
FK  chapter_id      UUID → chapters.id
    title           VARCHAR
    quiz_type       ENUM(mcq, open)
    questions       JSONB  ◄── [{id, question, options, answer, explanation}]
    passing_score   FLOAT  (0.0-1.0, default 0.7)
    tier_required   ENUM(free, pro)
    │
    └──1:N──► quiz_attempts (quiz_id FK)

quiz_attempts
─────────────────────────────────
PK  id              UUID
FK  user_id         UUID → users.id
FK  quiz_id         UUID → quizzes.id
    answers         JSONB  ◄── {question_id: selected_answer}
    score           FLOAT  (0.0-1.0)
    passed          BOOLEAN
    time_taken_secs INTEGER
    attempted_at    TIMESTAMP
    INDEX (user_id, quiz_id, attempted_at)  ◄── daily rate-limit queries

progress
─────────────────────────────────
PK  id              UUID
FK  user_id         UUID → users.id
FK  chapter_id      UUID → chapters.id
    status          ENUM(not_started, in_progress, completed)
    started_at      TIMESTAMP
    completed_at    TIMESTAMP
    UNIQUE (user_id, chapter_id)  ◄── one row per user/chapter pair

subscriptions
─────────────────────────────────
PK  id                      UUID
FK  user_id                 UUID → users.id UNIQUE
    plan                    ENUM(free, pro)
    status                  ENUM(active, cancelled, expired, trialing)
    stripe_subscription_id  VARCHAR
    stripe_customer_id      VARCHAR
    expires_at              TIMESTAMP

search_log
─────────────────────────────────
PK  id              UUID
FK  user_id         UUID → users.id
    query           VARCHAR
    result_count    INTEGER
    searched_at     TIMESTAMP
    INDEX (user_id, searched_at)  ◄── daily rate-limit queries
```

---

## Diagram 6 — Frontend Architecture (Phase 3)

```
┌─────────────────────────────────────────────────────────────────────┐
│               NEXT.JS 15 FRONTEND ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────┘

Browser
   │
   ▼
middleware.ts  ──── checks access_token cookie
   │                    ├── missing → redirect to /login
   │                    └── present → allow
   ▼
app/ (App Router)
   │
   ├── (auth)/
   │   ├── login/page.tsx      ← prefetches /dashboard on mount
   │   └── register/page.tsx   ← prefetches /dashboard on mount
   │
   ├── (dashboard)/            ← layout.tsx (Navbar + sidebar)
   │   ├── dashboard/page.tsx  ← useQuery(KEYS.chapters) + useQuery(KEYS.progress)
   │   ├── chapters/page.tsx   ← useQuery(KEYS.chapters) ← SHARED CACHE
   │   ├── chapters/[slug]/    ← useQuery(KEYS.chapter(id))
   │   │   └── page.tsx        ← AITeacher component
   │   ├── quizzes/[id]/
   │   └── upgrade/
   │
   └── page.tsx                ← Landing + AiTutorChat widget

State Management
   │
   ├── Zustand (client state)
   │   └── auth-store.ts
   │       ├── user: UserProfile | null
   │       ├── setUser()
   │       ├── logout()
   │       └── persist middleware → localStorage("auth-user")
   │           └── instant restore on page reload (no authApi.me() needed)
   │
   └── React Query (server state)
       └── query-client.ts
           ├── staleTime: 5 min
           ├── gcTime: 15 min
           ├── KEYS.me       = ["me"]
           ├── KEYS.chapters = ["chapters"]  ← shared across dashboard + chapters page
           ├── KEYS.progress = ["progress-summary"]
           └── KEYS.chapter  = (id) => ["chapter", id]

API Layer (lib/api.ts)
   │
   ├── axios instance → baseURL: NEXT_PUBLIC_API_URL
   ├── request interceptor → inject Authorization: Bearer <token>
   └── response interceptor → 401 → POST /auth/refresh → retry request

Components
   │
   ├── AITeacher.tsx      ← AI voice orb + chat (Framer Motion)
   ├── AiTutorChat.tsx    ← Landing page chat widget
   ├── skeletons.tsx      ← Skeleton UI (DashboardSkeleton, ChaptersPageSkeleton...)
   ├── providers.tsx      ← QueryClientProvider wrapper
   └── Navbar.tsx         ← Navigation with logout
```
