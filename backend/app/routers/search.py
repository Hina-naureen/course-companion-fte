from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime, UTC

from app.database import get_db
from app.models.chapter import Chapter
from app.models.search_log import SearchLog
from app.models.user import User
from app.schemas.search import SearchResponse, SearchResult
from app.middleware.auth import get_current_user
from app.config import get_settings

router = APIRouter(prefix="/search", tags=["search"])
settings = get_settings()


async def _count_searches_today(user_id, db: AsyncSession) -> int:
    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.count()).where(
            SearchLog.user_id == user_id,
            SearchLog.searched_at >= today_start,
        )
    )
    return result.scalar()


@router.get("", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=2, max_length=200),
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Rate limit for free users
    if current_user.tier == "free":
        searches_today = await _count_searches_today(current_user.id, db)
        if searches_today >= settings.free_search_daily_limit:
            raise HTTPException(
                status_code=429,
                detail="Daily search limit reached. Upgrade to Pro for unlimited searches.",
            )

    # Full-text search via pg_tsvector
    search_query = text("""
        SELECT id, number, slug, title, summary, tier_required,
               ts_rank(
                   to_tsvector('english', title || ' ' || summary || ' ' || content_md),
                   plainto_tsquery('english', :q)
               ) AS rank
        FROM chapters
        WHERE to_tsvector('english', title || ' ' || summary || ' ' || content_md)
              @@ plainto_tsquery('english', :q)
        ORDER BY rank DESC
        LIMIT :limit
    """)

    result = await db.execute(search_query, {"q": q, "limit": limit})
    rows = result.fetchall()

    # Log the search
    log = SearchLog(user_id=current_user.id, query=q, result_count=len(rows))
    db.add(log)

    results = [
        SearchResult(
            chapter_id=row.id,
            number=row.number,
            slug=row.slug,
            title=row.title,
            summary=row.summary,
            rank=round(float(row.rank), 4),
            locked=row.tier_required == "pro" and current_user.tier == "free",
        )
        for row in rows
    ]

    remaining = None
    if current_user.tier == "free":
        searches_today = await _count_searches_today(current_user.id, db)
        remaining = max(0, settings.free_search_daily_limit - searches_today)

    return SearchResponse(query=q, results=results, remaining_searches_today=remaining)
