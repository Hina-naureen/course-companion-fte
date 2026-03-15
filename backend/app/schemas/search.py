from pydantic import BaseModel
import uuid


class SearchResult(BaseModel):
    chapter_id: uuid.UUID
    number: int
    slug: str
    title: str
    summary: str
    rank: float
    locked: bool


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
    remaining_searches_today: int | None = None  # None for pro users
