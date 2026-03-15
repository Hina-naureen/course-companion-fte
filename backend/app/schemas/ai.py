from pydantic import BaseModel, Field


class TutorRequest(BaseModel):
    chapter_id: str
    question: str = Field(..., min_length=3, max_length=500)


class TutorResponse(BaseModel):
    answer: str
    audio_url: str | None = None  # full URL to the generated mp3, or None if TTS failed


class GenerateCourseRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200)


class GenerateCourseResponse(BaseModel):
    course_title: str
    topic: str
    chapters_saved: int
    chapter_ids: list[str]
