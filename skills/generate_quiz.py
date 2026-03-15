"""
Skill: Generate Quiz  (Pro only)
Generates novel MCQ or open-ended questions from chapter content.
"""
import anthropic
import json
from app.config import get_settings

settings = get_settings()
_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are a curriculum designer for a Generative AI course.
Create high-quality quiz questions that test genuine understanding, not just memorization.
Respond with valid JSON only."""


async def generate(
    chapter_content: str,
    chapter_title: str,
    count: int = 5,
    difficulty: str = "medium",
    quiz_type: str = "mcq",
) -> dict:
    if quiz_type == "mcq":
        schema = """{
  "questions": [
    {
      "text": "<question text>",
      "options": [
        {"id": "a", "text": "<option>"},
        {"id": "b", "text": "<option>"},
        {"id": "c", "text": "<option>"},
        {"id": "d", "text": "<option>"}
      ],
      "correct_option": "<a|b|c|d>",
      "explanation": "<why this is correct>"
    }
  ]
}"""
    else:
        schema = """{
  "questions": [
    {
      "text": "<open-ended question>",
      "rubric": ["<grading criterion 1>", "<criterion 2>"],
      "sample_answer": "<ideal answer>"
    }
  ]
}"""

    user_prompt = f"""Chapter: "{chapter_title}"

Content:
---
{chapter_content[:4000]}
---

Generate {count} {difficulty}-difficulty {quiz_type} questions based on this content.
Questions should test conceptual understanding, not just fact recall.

Respond ONLY with this JSON schema:
{schema}"""

    message = _client.messages.create(
        model=settings.claude_model,
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return json.loads(message.content[0].text)
