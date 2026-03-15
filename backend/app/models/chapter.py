import uuid
from datetime import datetime, UTC
from sqlalchemy import String, Integer, DateTime, Text, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    content_md: Mapped[str] = mapped_column(Text, nullable=False)
    tier_required: Mapped[str] = mapped_column(String, nullable=False, default="free")
    estimated_mins: Mapped[int] = mapped_column(Integer, nullable=False, default=15)
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    # Relationships
    quizzes: Mapped[list["Quiz"]] = relationship(back_populates="chapter")
    progress: Mapped[list["Progress"]] = relationship(back_populates="chapter")
