import uuid
from datetime import datetime, UTC
from sqlalchemy import String, Integer, DateTime, ForeignKey, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    chapter_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    quiz_type: Mapped[str] = mapped_column(String, nullable=False, default="mcq")
    tier_required: Mapped[str] = mapped_column(String, nullable=False, default="free")
    questions: Mapped[list] = mapped_column(JSON, nullable=False)
    passing_score: Mapped[int] = mapped_column(Integer, nullable=False, default=70)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC)
    )

    # Relationships
    chapter: Mapped["Chapter"] = relationship(back_populates="quizzes")
    attempts: Mapped[list["QuizAttempt"]] = relationship(back_populates="quiz")
