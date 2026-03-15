"""
SQLite ORM models.

Tables
------
users          — registered accounts: email, bcrypt password hash, tier.
refresh_tokens — hashed refresh JWTs for single-use rotation + revocation.
progress       — one row per (user_id, chapter_id) pair.
"""
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey,
    Integer, String, UniqueConstraint, func,
)

from .database import Base


class User(Base):
    __tablename__ = "users"

    user_id       = Column(String, primary_key=True)
    email         = Column(String, unique=True, nullable=True, index=True)
    password_hash = Column(String, nullable=True)
    tier          = Column(String, nullable=False, default="free")  # "free" | "pro"
    created_at    = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<User {self.user_id!r} email={self.email!r} tier={self.tier!r}>"


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    user_id    = Column(
        String,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<RefreshToken user={self.user_id!r} expires={self.expires_at}>"


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("user_id", "chapter_id", name="uq_progress"),)

    id          = Column(Integer, primary_key=True, autoincrement=True)
    user_id     = Column(String, nullable=False, index=True)
    chapter_id  = Column(String, nullable=False)        # chapter slug
    status      = Column(String, nullable=False, default="not_started")
    quiz_score  = Column(Integer, nullable=True)        # 0-100, None if not attempted
    quiz_passed = Column(Boolean, nullable=True)
    updated_at  = Column(
        DateTime,
        server_default=func.now(),
        onupdate=datetime.utcnow,
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Progress {self.user_id!r}/{self.chapter_id!r} {self.status!r}>"
