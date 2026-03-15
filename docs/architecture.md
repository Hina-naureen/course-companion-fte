# Course Companion FTE – Architecture

## Overview

Course Companion FTE (Fundamentals Track Edition) is a three-phase AI-enhanced learning platform for Generative AI fundamentals. Each phase builds on the last without breaking existing contracts.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COURSE COMPANION FTE                            │
│                                                                     │
│  Phase 1: Zero-Backend-LLM          Phase 2: Hybrid Intelligence   │
│  ┌─────────────────────────┐        ┌──────────────────────────┐   │
│  │   ChatGPT Custom GPT    │        │   ChatGPT + Claude API   │   │
│  │   (Actions → FastAPI)   │        │   Skills Layer           │   │
│  └──────────┬──────────────┘        └────────────┬─────────────┘   │
│             │                                    │                  │
│  ┌──────────▼──────────────────────────────────▼─────────────┐    │
│  │                    FastAPI Backend                          │    │
│  │  /auth  /chapters  /quizzes  /progress  /search  /skills   │    │
│  │                    (No LLM in Phase 1)                      │    │
│  └──────────────────────────┬───────────────────────────────┘    │
│                             │                                       │
│  ┌──────────────────────────▼───────────────────────────────┐     │
│  │                   PostgreSQL Database                      │     │
│  │  users │ chapters │ quizzes │ progress │ subscriptions     │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                     │
│  Phase 3: Full Web App                                              │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │              Next.js 15 (App Router)                      │      │
│  │  Dashboard │ Course Reader │ Quiz Engine │ Analytics       │      │
│  └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1 – Zero-Backend-LLM

### Principle
The FastAPI backend is a **pure data API**. Zero LLM calls. All intelligence lives in the ChatGPT Custom GPT system prompt and Actions schema.

### Components

| Component | Technology | Role |
|---|---|---|
| Frontend | ChatGPT Custom GPT | UX, conversation, routing |
| API Gateway | FastAPI | REST API, auth, data |
| Database | PostgreSQL 16 | Persistence |
| Auth | JWT (HS256) | Stateless auth, tier claims |
| Search | PostgreSQL `pg_tsvector` | Full-text search |
| Content | Markdown files seeded to DB | Course chapters |

### ChatGPT Custom GPT Architecture
The GPT uses **OpenAPI Actions** to call the FastAPI backend. The system prompt handles:
- Conversational UX ("Let's review Chapter 2...")
- Formatting quiz questions from API JSON
- Tracking user intent and routing to correct action
- Enforcing freemium messaging ("Upgrade to Pro to unlock Chapter 4")

### Access Control Flow
```
Request → JWT decode → tier claim ("free"|"pro") → resource check → 200 or 403
```

---

## Phase 2 – Hybrid Intelligence

### Principle
Claude API is added as a **skills layer** — a set of discrete AI-powered endpoints that augment the static content. The backend now calls Claude for specific tasks only.

### New Skills Endpoints

| Endpoint | Claude Task |
|---|---|
| `POST /skills/explain` | Explain a concept in multiple depths |
| `POST /skills/hint` | Adaptive quiz hint without revealing answer |
| `POST /skills/quiz/generate` | Generate novel quiz questions from chapter content |
| `POST /skills/search/semantic` | Rerank search results by semantic relevance |

### Model: `claude-sonnet-4-6`
Selected for best balance of reasoning depth and latency for educational tasks.

### Skills Architecture
```
Client → FastAPI /skills/* → skills/ module → Claude API → structured JSON → Client
```

Each skill uses structured output (JSON mode) to return predictable schemas the frontend can render without further parsing.

---

## Phase 3 – Full Web App

### Technology
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (client), React Query (server)
- **Auth**: JWT stored in httpOnly cookie

### Key Pages
| Route | Description |
|---|---|
| `/` | Landing + freemium CTA |
| `/dashboard` | Progress overview |
| `/chapters` | Chapter library |
| `/chapters/[slug]` | Chapter reader with AI explain button |
| `/quizzes/[id]` | Interactive quiz with adaptive hints |
| `/progress` | Analytics (Pro only) |
| `/upgrade` | Subscription/payment |

---

## Security Model

- Passwords: bcrypt (cost factor 12)
- JWT: HS256, 1h access token, 7d refresh token
- Rate limiting: 100 req/min (free), 500 req/min (pro)
- Search rate limit: free tier limited via DB counter (daily reset)
- CORS: explicit allowlist per phase
- Input validation: Pydantic v2 strict mode

---

## Freemium Access Matrix

| Feature | Free | Pro |
|---|---|---|
| Chapters | 1–3 only | All chapters |
| Quiz types | MCQ only | MCQ + open-ended |
| Quiz attempts | 3/day per quiz | Unlimited |
| Search queries | 10/day | Unlimited |
| Progress view | Pass/fail only | Full analytics |
| AI explain (Phase 2) | 5/day | Unlimited |
| AI quiz generation (Phase 2) | — | Yes |
