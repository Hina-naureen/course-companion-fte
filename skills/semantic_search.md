# Skill: Semantic Search Reranking

**File:** `skills/semantic_search.py`
**Phase:** 2 (Hybrid Intelligence)
**Endpoint:** `POST /api/v1/skills/search/semantic`
**Tier:** Free · Pro

---

## Purpose

Reranks a set of candidate chapter IDs (typically the output of `GET /api/v1/search`) by **true semantic relevance** rather than keyword frequency. The caller first runs a fast pg_tsvector keyword search to get candidates, then passes those IDs here for Claude-based reranking.

This two-stage approach (keyword filter → semantic rerank) gives the best of both worlds: fast retrieval with accurate ranking.

---

## Request Schema

```json
{
  "query":         "how does self-attention work",
  "candidate_ids": [
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "6d5ec8a2-3a12-4f71-9b5e-8d7c2b1a4e3f"
  ]
}
```

| Field           | Type          | Required | Notes                                   |
|---|---|---|---|
| `query`         | string        | Yes      | The original search query               |
| `candidate_ids` | list[UUID]    | Yes      | Chapter IDs to rerank (from keyword search) |

---

## Response Schema

```json
{
  "ranked_results": [
    {
      "chapter_id":      "6d5ec8a2-3a12-4f71-9b5e-8d7c2b1a4e3f",
      "relevance_score": 0.95,
      "reason":          "Directly explains the self-attention mechanism in Transformers."
    },
    {
      "chapter_id":      "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "relevance_score": 0.42,
      "reason":          "Mentions attention in passing but focuses on tokenisation."
    }
  ]
}
```

Results are returned **ordered by `relevance_score` descending**.

---

## How It Works

1. Router fetches the chapter rows for all `candidate_ids` from PostgreSQL.
2. Each chapter's `title` and `summary` are sent to Claude (not the full `content_md` — keeps token costs low).
3. Claude scores each chapter 0.0–1.0 and explains its reasoning in one sentence.
4. The reranked list is returned directly to the caller.

---

## Claude Prompt Design

- **System:** Search relevance expert for a Generative AI course. JSON only.
- **Context sent:** `title` + `summary` for each candidate (not full content).
- **Max tokens:** 512 output tokens.
- **Model:** `claude-sonnet-4-6`
- **Expected latency:** ~800ms for 5 candidates.

---

## Typical Usage Flow

```
Client → GET /api/v1/search?q=attention+mechanism  →  5 keyword results
Client → POST /api/v1/skills/search/semantic         →  same 5 IDs reranked by Claude
Client renders results in Claude's order
```

---

## Error Handling

| Condition               | HTTP Status | Detail                       |
|---|---|---|
| No chapters found for IDs | 404       | "No matching chapters found" |
| Malformed JSON from Claude | 500      | JSON parse error propagated  |

---

## Design Notes

- **Cost-conscious:** Only `title` + `summary` (~100 tokens/chapter) are sent, not `content_md`. Sending full content would cost ~10× more per call.
- **No rate limit** on this endpoint — it piggybacks on the keyword search rate limit (free users are already capped at 10 searches/day at the `/search` layer).
- If Claude returns IDs that don't match the input candidates, the router silently drops them to prevent broken responses.
