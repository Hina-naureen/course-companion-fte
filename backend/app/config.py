from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    app_name: str = "Course Companion FTE"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/course_companion"

    # JWT
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 7

    # Claude API (Phase 2)
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-6"

    # OpenAI API (Feature 1 – AI Tutor TTS)
    openai_api_key: str = ""

    # Gemini API — primary AI tutor + course generator
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # OpenRouter API — free/cheap fallback (OpenAI-compatible, base_url differs)
    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.1-8b-instruct:free"

    # Freemium limits
    free_chapter_limit: int = 3          # chapters 1–N are free
    free_search_daily_limit: int = 10
    free_quiz_attempts_daily: int = 3
    free_ai_explains_daily: int = 5

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "https://chat.openai.com"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
