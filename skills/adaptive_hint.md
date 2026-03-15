# Skill: Adaptive Hint

**File:** `skills/adaptive_hint.py`
**Phase:** 2 (Hybrid Intelligence)
**Endpoint:** `POST /api/v1/skills/hint`
**Tier:** Free · Pro

---

## Purpose

Provides a **Socratic, progressive hint** for a quiz question. The hint guides the student toward the correct answer without ever revealing it directly. Three escalating hint levels are available per question attempt.

---

## Request Schema

```json
{
  "quiz_id":     "uuid",
  "question_id": "q3",
  "user_answer": "a",
  "hint_level":  1
}
```

| Field         | Type    | Required | Notes                          |
|---|---|---|---|
| `quiz_id`     | UUID    | Yes      | Quiz the question belongs to   |
| `question_id` | string  | Yes      | Question ID (e.g. `"q3"`)      |
| `user_answer` | string  | Yes      | The option the student chose   |
| `hint_level`  | integer | No       | 1–3. Default `1`. Clamped automatically. |

---

## Response Schema

```json
{
  "hint":       "Think about what 'next token prediction' means...",
  "hint_level": 1,
  "max_hints":  3
}
```

---

## Hint Levels

| Level | Style                                                                                    |
|---|---|
| `1`   | **Conceptual nudge** — points the student toward the right domain of thinking            |
| `2`   | **Narrowed direction** — eliminates wrong directions without naming the correct one      |
| `3`   | **Near-answer hint** — student should recognise the answer immediately after reading    |

Claude is instructed: *CRITICAL: Do NOT reveal the correct answer directly.*

---

## How It Works

1. Router looks up the quiz in the DB and finds the matching question object from the `questions` JSONB column.
2. The question text, all option texts, and the student's current answer are passed to `skills/adaptive_hint.py`.
3. Claude is told the hint level and its corresponding style instruction.
4. Claude returns a JSON hint without knowing which option is correct (the `correct_option` key is never sent to the prompt).

---

## Claude Prompt Design

- **System:** Socratic tutor. Never reveals the answer. JSON only.
- **Context:** Question text + all options + student's current answer.
- **Max tokens:** 256 output tokens (hints are short by design).
- **Model:** `claude-sonnet-4-6`

---

## Error Handling

| Condition             | HTTP Status | Detail                     |
|---|---|---|
| Quiz not found        | 404         | "Quiz not found"            |
| Question not in quiz  | 404         | "Question not found"        |
| `hint_level` out of range | — | Clamped to 1–3, no error |

---

## Design Notes

- **No rate limit** on hints — a struggling student should always be able to get help.
- The correct answer is **never sent to Claude**. Claude reasons only from the question text and options, reducing the risk of accidental answer leakage.
- Works for both MCQ (options provided) and open-ended questions (no options sent).
