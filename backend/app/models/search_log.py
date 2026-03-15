import uuid
from datetime import datetime, UTC
from sqlalchemy import String, Integer, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class SearchLog(Base):
    __tablename__ = "search_log"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    query: Mapped[str] = mapped_column(String, nullable=False)
    result_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    searched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC)
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="search_logs")
