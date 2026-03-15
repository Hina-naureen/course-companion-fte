# Skill: Generate Quiz

**File:** `skills/generate_quiz.py`
**Phase:** 2 (Hybrid Intelligence)
**Endpoint:** `POST /api/v1/skills/quiz/generate`
**Tier:** **Pro only**

---

## Purpose

Generates **novel quiz questions** from a chapter's content using Claude. Questions test genuine conceptual understanding, not rote memorisation. Supports both MCQ and open-ended formats. Questions are ephemeral — they are returned directly and not persisted to the database.

---

## Request Schema

```json
{
  "chapter_id": "uuid",
  "count":      5,
  "difficulty": "easy | medium | hard",
  "quiz_type":  "mcq | open"
}
```

| Field        | Type    | Required | Notes                                     |
|---|---|---|---|
| `chapter_id` | UUID    | Yes      | Chapter to generate questions about       |
| `count`      | integer | No       | Number of questions. Default `5`. Max `10`.|
| `difficulty` | string  | No       | Default `medium`                          |
| `quiz_type`  | string  | No       | `mcq` (default) or `open`                |

---

## Response Schemas

### MCQ Response

```json
{
  "questions": [
    {
      "text": "What is self-attention in a Transformer?",
      "options": [
        { "id": "a", "text": "A mechanism where each token attends to all others" },
        { "id": "b", "text": "A method of compressing long documents" },
        { "id": "c", "text": "A type of regularisation technique" },
        { "id": "d", "text": "The final output layer of the model" }
      ],
      "correct_option": "a",
      "explanation": "Self-attention allows each token to weigh every other token's relevance when building its representation."
    }
  ]
}
```

### Open-Ended Response

```json
{
  "questions": [
    {
      "text": "Explain why LLMs can hallucinate and suggest two mitigation strategies.",
      "rubric": [
        "Mentions statistical nature of token prediction",
        "Identifies at least two strategies (RAG, grounding, temperature reduction, etc.)"
      ],
      "sample_answer": "LLMs hallucinate because they generate statistically likely continuations..."
    }
  ]
}
```

---

## Claude Prompt Design

- **System:** Curriculum designer. High-quality questions that test understanding. JSON only.
- **Context window used:** First 4,000 characters of `chapter.content_md`.
- **Max tokens:** 2,048 output tokens.
- **Model:** `claude-sonnet-4-6`

---

## Access Control

This endpoint uses `require_pro` dependency. Free-tier users receive HTTP `403`:

```json
{ "detail": "This feature requires a Pro subscription." }
```

---

## Error Handling

| Condition              | HTTP Status | Detail                         |
|---|---|---|
| Chapter not found      | 404         | "Chapter not found"            |
| Non-Pro user           | 403         | "Pro subscription required"    |
| Malformed JSON from Claude | 500    | JSON parse error propagated    |

---

## Design Notes

- Generated questions are **not saved** — they exist only in the API response. The rationale is to avoid diluting the curated question bank with AI-generated content of variable quality.
- The `correct_option` field is included in the response for MCQs so the frontend can grade them client-side for instant feedback without a round-trip.
- Difficulty affects Claude's instruction: `easy` = recall-based, `medium` = comprehension, `hard` = application and analysis.
