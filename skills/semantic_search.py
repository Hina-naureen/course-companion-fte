"""
Skill: Semantic Search Reranking
Uses Claude to rerank keyword search results by true semantic relevance.
"""
import anthropic
import json
from app.config import get_settings
from app.models.chapter import Chapter

settings = get_settings()
_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are a search relevance expert for a Generative AI course.
Given a user query and candidate chapters, rank them by true semantic relevance.
Respond with valid JSON only."""


async def rerank(query: str, chapters: list[Chapter]) -> dict:
    candidates = [
        {"id": str(ch.id), "title": ch.title, "summary": ch.summary}
        for ch in chapters
    ]

    user_prompt = f"""User query: "{query}"

Candidate chapters:
{json.dumps(candidates, indent=2)}

Rank these chapters by how well they answer the query.
Score from 0.0 (irrelevant) to 1.0 (perfectly relevant).

Respond ONLY with this JSON:
{{
  "ranked_results": [
    {{
      "chapter_id": "<uuid>",
      "relevance_score": <0.0-1.0>,
      "reason": "<one sentence why>"
    }}
  ]
}}

Order by relevance_score descending."""

    message = _client.messages.create(
        model=settings.claude_model,
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return json.loads(message.content[0].text)
