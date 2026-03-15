# Database Schema – Course Companion FTE

## Engine: PostgreSQL 16

---

## Entity Relationship Diagram

```
users ──────────────────────────────────────────────────────┐
  │                                                          │
  ├──< progress >──── chapters ──< quizzes                   │
  │                                                          │
  ├──< quiz_attempts >── quizzes                             │
  │                                                          │
  ├──< subscriptions                                         │
  │                                                          │
  └──< search_log                                            │
```

---

## Table Definitions

### `users`
```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,                    -- bcrypt
    full_name   TEXT,
    tier        TEXT NOT NULL DEFAULT 'free'        -- 'free' | 'pro'
                    CHECK (tier IN ('free', 'pro')),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### `chapters`
```sql
CREATE TABLE chapters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number          INTEGER UNIQUE NOT NULL,        -- display order
    slug            TEXT UNIQUE NOT NULL,           -- URL-safe identifier
    title           TEXT NOT NULL,
    summary         TEXT NOT NULL,                 -- shown to all tiers
    content_md      TEXT NOT NULL,                 -- gated by tier_required
    tier_required   TEXT NOT NULL DEFAULT 'free'
                        CHECK (tier_required IN ('free', 'pro')),
    estimated_mins  INTEGER NOT NULL DEFAULT 15,
    tags            TEXT[] DEFAULT '{}',
    search_vector   TSVECTOR GENERATED ALWAYS AS (
                        to_tsvector('english', title || ' ' || summary || ' ' || content_md)
                    ) STORED,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chapters_search ON chapters USING GIN(search_vector);
CREATE INDEX idx_chapters_number ON chapters(number);
```

### `quizzes`
```sql
CREATE TABLE quizzes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id      UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    quiz_type       TEXT NOT NULL DEFAULT 'mcq'
                        CHECK (quiz_type IN ('mcq', 'open')),
    tier_required   TEXT NOT NULL DEFAULT 'free'
                        CHECK (tier_required IN ('free', 'pro')),
    questions       JSONB NOT NULL,                -- see JSONB schema below
    passing_score   INTEGER NOT NULL DEFAULT 70,   -- percentage
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_chapter ON quizzes(chapter_id);
```

**`questions` JSONB Schema (MCQ):**
```json
[
  {
    "id": "q1",
    "text": "What is a Large Language Model?",
    "options": [
      {"id": "a", "text": "A statistical model trained on text"},
      {"id": "b", "text": "A rule-based chatbot"},
      {"id": "c", "text": "A search engine"},
      {"id": "d", "text": "A relational database"}
    ],
    "correct_option": "a",
    "explanation": "LLMs are neural networks trained on large text corpora..."
  }
]
```

**`questions` JSONB Schema (Open-ended):**
```json
[
  {
    "id": "q1",
    "text": "Explain the difference between zero-shot and few-shot prompting.",
    "rubric": ["mentions examples", "explains transfer learning", "uses correct terminology"],
    "sample_answer": "Zero-shot prompting provides no examples..."
  }
]
```

### `quiz_attempts`
```sql
CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id         UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    answers         JSONB NOT NULL,                -- {"q1": "a", "q2": "c"}
    score           INTEGER NOT NULL,              -- 0-100
    passed          BOOLEAN NOT NULL,
    time_taken_secs INTEGER,
    attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_attempts_quiz  ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_date  ON quiz_attempts(user_id, attempted_at);
```

### `progress`
```sql
CREATE TABLE progress (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_id      UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'not_started'
                        CHECK (status IN ('not_started', 'in_progress', 'completed')),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    UNIQUE(user_id, chapter_id)
);

CREATE INDEX idx_progress_user ON progress(user_id);
```

### `subscriptions`
```sql
CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                    TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
    status                  TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'cancelled', 'expired')),
    started_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at              TIMESTAMPTZ,
    stripe_subscription_id  TEXT UNIQUE,
    stripe_customer_id      TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
```

### `search_log`
Used for free-tier rate limiting (10 searches/day).
```sql
CREATE TABLE search_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query       TEXT NOT NULL,
    result_count INTEGER NOT NULL DEFAULT 0,
    searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_log_user_day
    ON search_log(user_id, date_trunc('day', searched_at));
```

---

## Full-Text Search Query Pattern

```sql
SELECT id, number, title, summary,
       ts_rank(search_vector, query) AS rank
FROM chapters, to_tsquery('english', 'prompt & engineering') query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 10;
```
