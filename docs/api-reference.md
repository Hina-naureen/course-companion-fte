# API Reference – Course Companion FTE

Base URL (local): `http://localhost:8000/api/v1`

---

## Authentication

All protected routes require:
```
Authorization: Bearer <access_token>
```

JWT Claims:
```json
{
  "sub": "user-uuid",
  "tier": "free",
  "exp": 1710000000,
  "iat": 1709996400
}
```

---

## Auth Endpoints

### `POST /auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword",
  "full_name": "Jane Doe"
}
```

**Response `201`:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com", "tier": "free" },
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

---

### `POST /auth/login`
**Request:**
```json
{ "email": "user@example.com", "password": "strongpassword" }
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### `POST /auth/refresh`
**Request:**
```json
{ "refresh_token": "eyJ..." }
```
**Response `200`:** New access token.

---

### `GET /auth/me`
Returns current user profile. Requires auth.

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "tier": "free",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## Chapters Endpoints

### `GET /chapters`
List all chapters (metadata only — no content_md). Tier-aware.

**Query params:** `?page=1&limit=20&tag=prompting`

**Response `200`:**
```json
{
  "total": 12,
  "page": 1,
  "chapters": [
    {
      "id": "uuid",
      "number": 1,
      "slug": "intro-to-generative-ai",
      "title": "Introduction to Generative AI",
      "summary": "...",
      "tier_required": "free",
      "estimated_mins": 15,
      "tags": ["fundamentals"],
      "locked": false
    },
    {
      "id": "uuid",
      "number": 4,
      "slug": "advanced-prompt-engineering",
      "title": "Advanced Prompt Engineering",
      "summary": "...",
      "tier_required": "pro",
      "locked": true
    }
  ]
}
```

`locked: true` when `chapter.tier_required == "pro"` and `user.tier == "free"`.

---

### `GET /chapters/{chapter_id}`
Get full chapter content. Returns `403` if tier insufficient.

**Response `200`:**
```json
{
  "id": "uuid",
  "number": 1,
  "slug": "intro-to-generative-ai",
  "title": "Introduction to Generative AI",
  "summary": "...",
  "content_md": "# Introduction\n\n...",
  "estimated_mins": 15,
  "tags": ["fundamentals"],
  "has_quiz": true
}
```

**Response `403`:**
```json
{ "detail": "This chapter requires a Pro subscription.", "upgrade_url": "/upgrade" }
```

---

### `GET /chapters/{chapter_id}/quiz`
Get the quiz for a chapter. Returns quiz without correct answers.

**Response `200`:**
```json
{
  "id": "uuid",
  "title": "Chapter 1 Quiz",
  "quiz_type": "mcq",
  "questions": [
    {
      "id": "q1",
      "text": "What does LLM stand for?",
      "options": [
        { "id": "a", "text": "Large Language Model" },
        { "id": "b", "text": "Linear Learning Machine" }
      ]
    }
  ],
  "passing_score": 70
}
```

---

## Quizzes Endpoints

### `POST /quizzes/{quiz_id}/attempt`
Submit a quiz attempt. Requires auth.

**Request:**
```json
{
  "answers": { "q1": "a", "q2": "c", "q3": "b" },
  "time_taken_secs": 120
}
```

**Response `201`:**
```json
{
  "attempt_id": "uuid",
  "score": 85,
  "passed": true,
  "passing_score": 70,
  "results": [
    {
      "question_id": "q1",
      "correct": true,
      "your_answer": "a",
      "correct_answer": "a",
      "explanation": "LLM stands for Large Language Model..."
    }
  ]
}
```

---

### `GET /quizzes/{quiz_id}/attempts`
Get current user's attempt history for a quiz.

**Response `200`:**
```json
{
  "quiz_id": "uuid",
  "attempts": [
    { "id": "uuid", "score": 85, "passed": true, "attempted_at": "..." }
  ]
}
```

---

## Progress Endpoints

### `GET /progress`
Get overall progress for current user.

**Response `200`:**
```json
{
  "completed_chapters": 2,
  "total_chapters": 12,
  "completion_pct": 16,
  "chapters": [
    { "chapter_id": "uuid", "slug": "intro-to-generative-ai", "status": "completed" },
    { "chapter_id": "uuid", "slug": "prompt-engineering-basics", "status": "in_progress" }
  ]
}
```

---

### `PUT /progress/chapters/{chapter_id}`
Update chapter progress status.

**Request:**
```json
{ "status": "completed" }
```
Values: `"not_started"` | `"in_progress"` | `"completed"`

**Response `200`:**
```json
{ "chapter_id": "uuid", "status": "completed", "completed_at": "2026-03-12T10:00:00Z" }
```

---

### `GET /progress/analytics`
Detailed analytics. **Pro tier only.** Returns `403` for free users.

**Response `200`:**
```json
{
  "streak_days": 5,
  "avg_quiz_score": 78,
  "time_spent_mins": 240,
  "weakest_topics": ["transformers", "fine-tuning"],
  "quiz_history": [ { "quiz_id": "uuid", "score": 65, "date": "..." } ]
}
```

---

## Search Endpoint

### `GET /search`
Full-text search across chapters. Rate-limited: 10/day (free), unlimited (pro).

**Query params:** `?q=prompt+engineering&limit=5`

**Response `200`:**
```json
{
  "query": "prompt engineering",
  "results": [
    {
      "chapter_id": "uuid",
      "number": 2,
      "slug": "prompt-engineering-basics",
      "title": "Prompt Engineering Basics",
      "summary": "...",
      "rank": 0.92,
      "locked": false
    }
  ],
  "remaining_searches_today": 7
}
```

**Response `429`:**
```json
{ "detail": "Daily search limit reached. Upgrade to Pro for unlimited searches." }
```

---

## Skills Endpoints (Phase 2 – Claude API)

### `POST /skills/explain`
Explain a concept from a chapter at a specified depth.

**Request:**
```json
{
  "chapter_id": "uuid",
  "concept": "attention mechanism",
  "depth": "beginner"
}
```
`depth`: `"beginner"` | `"intermediate"` | `"expert"`

**Response `200`:**
```json
{
  "concept": "attention mechanism",
  "explanation": "Think of attention like a spotlight...",
  "analogy": "Like a librarian who...",
  "key_points": ["...", "..."],
  "further_reading": ["Chapter 5: Transformers"]
}
```

---

### `POST /skills/hint`
Adaptive hint for a quiz question. Does not reveal the answer.

**Request:**
```json
{
  "quiz_id": "uuid",
  "question_id": "q1",
  "user_answer": "b",
  "hint_level": 1
}
```

**Response `200`:**
```json
{
  "hint": "Think about what 'large' refers to in this context...",
  "hint_level": 1,
  "max_hints": 3
}
```

---

### `POST /skills/quiz/generate`
Generate novel quiz questions from chapter content. **Pro only.**

**Request:**
```json
{
  "chapter_id": "uuid",
  "count": 5,
  "difficulty": "medium",
  "quiz_type": "mcq"
}
```

**Response `200`:**
```json
{
  "questions": [
    {
      "text": "...",
      "options": [...],
      "correct_option": "a",
      "explanation": "..."
    }
  ]
}
```

---

### `POST /skills/search/semantic`
Rerank search results using semantic relevance via Claude.

**Request:**
```json
{
  "query": "how does RLHF work",
  "candidate_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response `200`:**
```json
{
  "ranked_results": [
    { "chapter_id": "uuid2", "relevance_score": 0.97, "reason": "Directly covers RLHF..." },
    { "chapter_id": "uuid1", "relevance_score": 0.72, "reason": "Covers reward modeling..." }
  ]
}
```

---

## Error Responses

| Code | Meaning |
|---|---|
| `400` | Validation error (Pydantic) |
| `401` | Missing or invalid JWT |
| `403` | Insufficient tier |
| `404` | Resource not found |
| `422` | Unprocessable entity |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

All errors follow:
```json
{ "detail": "Human-readable message", "code": "MACHINE_CODE" }
```
