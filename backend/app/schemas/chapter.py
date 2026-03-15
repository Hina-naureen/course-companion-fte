from pydantic import BaseModel, computed_field
from datetime import datetime
import uuid


class ChapterSummary(BaseModel):
    id: uuid.UUID
    number: int
    slug: str
    title: str
    summary: str
    tier_required: str
    estimated_mins: int
    tags: list[str]
    has_quiz: bool = False
    locked: bool = False

    model_config = {"from_attributes": True}


class ChapterDetail(ChapterSummary):
    content_md: str
    updated_at: datetime


class ChapterListResponse(BaseModel):
    total: int
    page: int
    limit: int
    chapters: list[ChapterSummary]
