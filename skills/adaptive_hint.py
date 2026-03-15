"""
Skill: Adaptive Hint
Provides progressive hints for a quiz question without revealing the answer.
Hint level 1: conceptual nudge | Level 2: narrower direction | Level 3: near-answer hint.
"""
import anthropic
import json
from app.config import get_settings

settings = get_settings()
_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are a Socratic tutor for a Generative AI course.
Your role is to guide students toward the correct answer without telling them directly.
Never reveal the correct answer explicitly. Respond with valid JSON only."""

HINT_STYLES = {
    1: "Give a gentle conceptual nudge. Point them toward the right domain of thinking.",
    2: "Give a more specific hint. Eliminate wrong directions without naming the right one.",
    3: "Give a near-answer hint. The student should immediately recognize the answer after reading this.",
}


async def get_hint(question: dict, user_answer: str, hint_level: int = 1) -> dict:
    hint_level = max(1, min(hint_level, 3))
    style = HINT_STYLES[hint_level]

    options_text = ""
    if "options" in question:
        options_text = "\nOptions:\n" + "\n".join(
            f"  {o['id']}) {o['text']}" for o in question["options"]
        )

    user_prompt = f"""Quiz question: {question['text']}
{options_text}

The student answered: "{user_answer}"
The student is asking for hint level {hint_level}/3.

{style}

CRITICAL: Do NOT reveal the correct answer directly.

Respond ONLY with this JSON:
{{
  "hint": "<your hint text>",
  "hint_level": {hint_level},
  "max_hints": 3
}}"""

    message = _client.messages.create(
        model=settings.claude_model,
        max_tokens=256,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return json.loads(message.content[0].text)
