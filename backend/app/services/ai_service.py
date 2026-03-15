"""
AI service — wrappers around Gemini (primary), OpenAI, and Anthropic.

Functions
---------
ask_tutor_gemini    Primary: Google Gemini via google-generativeai.
ask_tutor           Fallback: OpenAI gpt-4o-mini.
ask_tutor_claude    Fallback: Anthropic Claude.
text_to_speech      Convert text to mp3 bytes via OpenAI TTS-1.
generate_course     Generate a 5-chapter course outline + quiz questions as a dict.
"""
import json

from openai import AsyncOpenAI


def _build_system_msg(chapter_title: str, chapter_content: str) -> str:
    return (
        f'You are an expert AI tutor for a "Generative AI Fundamentals" course. '
        f'The student is reading the chapter: "{chapter_title}". '
        f'Use the chapter content provided to answer their question clearly and concisely. '
        f'If the question is outside the chapter scope, still help with your general knowledge.\n\n'
        f'CHAPTER CONTENT:\n{chapter_content[:3500]}'
    )


async def ask_tutor_gemini(
    chapter_title: str,
    chapter_content: str,
    question: str,
    api_key: str,
    model: str = "gemini-2.0-flash",
) -> str:
    """Call Google Gemini. Primary AI provider."""
    import google.generativeai as genai  # lazy import — avoids startup crash if not installed
    genai.configure(api_key=api_key)
    gemini_model = genai.GenerativeModel(
        model_name=model,
        system_instruction=_build_system_msg(chapter_title, chapter_content),
    )
    response = await gemini_model.generate_content_async(question)
    return response.text


async def ask_tutor(
    chapter_title: str,
    chapter_content: str,
    question: str,
    api_key: str,
) -> str:
    """Fallback: call OpenAI gpt-4o-mini."""
    client = AsyncOpenAI(api_key=api_key)
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": _build_system_msg(chapter_title, chapter_content)},
            {"role": "user",   "content": question},
        ],
        max_tokens=800,
        temperature=0.7,
    )
    return response.choices[0].message.content or "Sorry, I couldn't generate an answer. Please try again."


async def ask_tutor_openrouter(
    chapter_title: str,
    chapter_content: str,
    question: str,
    api_key: str,
    model: str = "meta-llama/llama-3.1-8b-instruct:free",
) -> str:
    """Fallback: call OpenRouter (OpenAI-compatible API, supports free models)."""
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": _build_system_msg(chapter_title, chapter_content)},
            {"role": "user",   "content": question},
        ],
        max_tokens=800,
        temperature=0.7,
    )
    return response.choices[0].message.content or "Sorry, I couldn't generate an answer. Please try again."


async def ask_tutor_claude(
    chapter_title: str,
    chapter_content: str,
    question: str,
    api_key: str,
) -> str:
    """Fallback: call Anthropic Claude when other providers are unavailable."""
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=api_key)
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        system=_build_system_msg(chapter_title, chapter_content),
        messages=[{"role": "user", "content": question}],
    )
    return response.content[0].text


async def text_to_speech(text: str, api_key: str) -> bytes:
    """Convert text to speech using OpenAI TTS-1 (alloy voice). Returns raw mp3 bytes."""
    client = AsyncOpenAI(api_key=api_key)
    response = await client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=text[:4096],
        response_format="mp3",
    )
    return response.content


async def generate_course(topic: str, api_key: str, model: str = "gemini-2.0-flash") -> dict:
    """Generate a 5-chapter course using Gemini."""
    import google.generativeai as genai  # lazy import
    genai.configure(api_key=api_key)

    prompt = f"""Create a structured 5-chapter mini-course on: "{topic}"

Return ONLY valid JSON matching this exact schema:
{{
  "course_title": "string",
  "chapters": [
    {{
      "number": 1,
      "title": "string",
      "summary": "2-3 sentence overview",
      "content_md": "Full markdown content (300-400 words with ## headings, bullet lists, examples)",
      "quiz_questions": [
        {{
          "id": "q1",
          "text": "Question?",
          "options": [
            {{"id": "a", "text": "Option A"}},
            {{"id": "b", "text": "Option B"}},
            {{"id": "c", "text": "Option C"}},
            {{"id": "d", "text": "Option D"}}
          ],
          "correct_option": "a",
          "explanation": "Why this answer is correct"
        }}
      ]
    }}
  ]
}}

Requirements:
- Exactly 5 chapters
- Each chapter has exactly 4 quiz questions
- quiz_questions use ids q1, q2, q3, q4
- correct_option is always one of: a, b, c, d
- Return ONLY the JSON object, no other text"""

    gemini_model = genai.GenerativeModel(
        model_name=model,
        generation_config={"response_mime_type": "application/json"},
    )
    response = await gemini_model.generate_content_async(prompt)
    return json.loads(response.text)
