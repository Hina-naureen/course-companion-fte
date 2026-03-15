# Skill: Explain Concept

**File:** `skills/explain_concept.py`
**Phase:** 2 (Hybrid Intelligence)
**Endpoint:** `POST /api/v1/skills/explain`
**Tier:** Free (capped at 5/day) · Pro (unlimited)

---

## Purpose

Takes a concept name and a chapter context, then uses `claude-sonnet-4-6` to produce a structured, depth-calibrated explanation. The explanation is grounded entirely in the chapter content — Claude never invents out-of-scope information.

---

## Request Schema

```json
{
  "chapter_id": "uuid",
  "concept":    "attention mechanism",
  "depth":      "beginner | intermediate | expert"
}
```

| Field        | Type   | Required | Notes                                      |
|---|---|---|---|
| `chapter_id` | UUID   | Yes      | Must be an existing chapter in the DB      |
| `concept`    | string | Yes      | The term or idea to explain                |
| `depth`      | string | No       | Default `beginner`. Controls language level |

---

## Response Schema

```json
{
  "concept":         "attention mechanism",
  "explanation":     "...",
  "analogy":         "Think of it like a spotlight...",
  "key_points":      ["Point 1", "Point 2", "Point 3"],
  "further_reading": ["Chapter 3: Prompt Engineering"]
}
```

---

## Depth Levels

| Level          | Instruction to Claude                                                         |
|---|---|
| `beginner`     | Use simple language, everyday analogies, avoid jargon. No prior AI knowledge assumed. |
| `intermediate` | Assume basic ML knowledge. Use technical terms but explain them briefly.      |
| `expert`       | Use precise technical language. Include mathematical intuition where relevant. |

---

## Rate Limiting

Free-tier users are limited to **5 AI explanations per day**. Usage is tracked in the `search_log` table using the prefix `__explain__` on the query field. Exceeding the limit returns HTTP `429`.

---

## Claude Prompt Design

- **System:** Expert AI educator. Responds only with valid JSON.
- **Context window used:** First 3,000 characters of `chapter.content_md`.
- **Max tokens:** 1,024 output tokens.
- **Model:** `claude-sonnet-4-6`

---

## Error Handling

| Condition                      | HTTP Status | Detail                                  |
|---|---|---|
| Chapter not found              | 404         | "Chapter not found"                     |
| Free daily limit exceeded      | 429         | "5 AI explanations/day. Upgrade to Pro" |
| Claude API unavailable         | 503         | Caller should fall back to static text  |
| Malformed JSON from Claude     | 500         | JSON parse error propagated             |

---

## Zero-LLM Fallback

If `ANTHROPIC_API_KEY` is not set, this endpoint is **not mounted**. The `/skills` router is conditionally included in `app/main.py` only when the key is present. The frontend should check `/health` (field `phase`) to decide whether to show the "Explain this" button.
