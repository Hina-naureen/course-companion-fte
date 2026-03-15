"""
Skill: Explain Concept
Uses claude-sonnet-4-6 to explain a GenAI concept at a specified depth.
Returns structured JSON matched to ExplainResponse schema.
"""
import anthropic
import json
from app.config import get_settings

settings = get_settings()
_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

DEPTH_INSTRUCTIONS = {
    "beginner": "Use simple language, everyday analogies, and avoid jargon. Assume no prior AI knowledge.",
    "intermediate": "Assume basic ML knowledge. Use technical terms but explain them briefly.",
    "expert": "Use precise technical language. Include mathematical intuition where relevant.",
}

SYSTEM_PROMPT = """You are an expert AI educator for a Generative AI fundamentals course.
Your explanations are clear, accurate, and pedagogically sound.
Always respond with valid JSON matching the exact schema provided."""


async def explain(concept: str, chapter_content: str, depth: str = "beginner") -> dict:
    depth_instruction = DEPTH_INSTRUCTIONS.get(depth, DEPTH_INSTRUCTIONS["beginner"])

    user_prompt = f"""Explain the concept "{concept}" to a {depth} learner.

Chapter context (use this as your source of truth):
---
{chapter_content[:3000]}
---

{depth_instruction}

Respond ONLY with this JSON structure:
{{
  "concept": "{concept}",
  "explanation": "<2-3 paragraph explanation>",
  "analogy": "<one memorable real-world analogy>",
  "key_points": ["<point 1>", "<point 2>", "<point 3>"],
  "further_reading": ["<chapter or topic recommendation>"]
}}"""

    message = _client.messages.create(
        model=settings.claude_model,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return json.loads(message.content[0].text)
