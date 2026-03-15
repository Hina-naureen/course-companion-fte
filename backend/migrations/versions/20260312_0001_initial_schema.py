"""initial schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-03-12 00:00:00.000000

Creates all tables for Course Companion FTE Phase 1:
  users, chapters, quizzes, quiz_attempts, progress, subscriptions, search_log

Includes:
  - UUID primary keys via gen_random_uuid()
  - pg_tsvector full-text search index on chapters
  - All CHECK constraints matching the ORM model validation
  - All foreign-key ON DELETE CASCADE relationships
  - All covering indexes for common query patterns
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Enable pgcrypto for gen_random_uuid() ──────────────────────────────
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    # ── users ──────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("full_name", sa.Text(), nullable=True),
        sa.Column(
            "tier",
            sa.Text(),
            nullable=False,
            server_default="free",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint("tier IN ('free', 'pro')", name="ck_users_tier"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("idx_users_email", "users", ["email"])

    # updated_at auto-update trigger
    op.execute("""
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
    """)
    op.execute("""
        CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    """)

    # ── chapters ───────────────────────────────────────────────────────────
    op.create_table(
        "chapters",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("slug", sa.Text(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("content_md", sa.Text(), nullable=False),
        sa.Column(
            "tier_required",
            sa.Text(),
            nullable=False,
            server_default="free",
        ),
        sa.Column("estimated_mins", sa.Integer(), nullable=False, server_default="15"),
        sa.Column(
            "tags",
            postgresql.ARRAY(sa.Text()),
            nullable=False,
            server_default="{}",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint(
            "tier_required IN ('free', 'pro')", name="ck_chapters_tier_required"
        ),
        sa.UniqueConstraint("number", name="uq_chapters_number"),
        sa.UniqueConstraint("slug", name="uq_chapters_slug"),
    )
    op.create_index("idx_chapters_number", "chapters", ["number"])
    op.create_index("idx_chapters_slug", "chapters", ["slug"])

    # GIN index for full-text search
    op.execute("""
        CREATE INDEX idx_chapters_search
        ON chapters
        USING GIN (
            to_tsvector('english', title || ' ' || summary || ' ' || content_md)
        )
    """)

    # updated_at trigger
    op.execute("""
        CREATE TRIGGER trg_chapters_updated_at
        BEFORE UPDATE ON chapters
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    """)

    # ── quizzes ────────────────────────────────────────────────────────────
    op.create_table(
        "quizzes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("quiz_type", sa.Text(), nullable=False, server_default="mcq"),
        sa.Column(
            "tier_required",
            sa.Text(),
            nullable=False,
            server_default="free",
        ),
        sa.Column("questions", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("passing_score", sa.Integer(), nullable=False, server_default="70"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint(
            "quiz_type IN ('mcq', 'open')", name="ck_quizzes_quiz_type"
        ),
        sa.CheckConstraint(
            "tier_required IN ('free', 'pro')", name="ck_quizzes_tier_required"
        ),
        sa.CheckConstraint(
            "passing_score BETWEEN 0 AND 100", name="ck_quizzes_passing_score"
        ),
        sa.ForeignKeyConstraint(
            ["chapter_id"],
            ["chapters.id"],
            name="fk_quizzes_chapter_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index("idx_quizzes_chapter_id", "quizzes", ["chapter_id"])

    # ── quiz_attempts ──────────────────────────────────────────────────────
    op.create_table(
        "quiz_attempts",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quiz_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("answers", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("passed", sa.Boolean(), nullable=False),
        sa.Column("time_taken_secs", sa.Integer(), nullable=True),
        sa.Column(
            "attempted_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint(
            "score BETWEEN 0 AND 100", name="ck_quiz_attempts_score"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_quiz_attempts_user_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["quiz_id"],
            ["quizzes.id"],
            name="fk_quiz_attempts_quiz_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index("idx_quiz_attempts_user_id", "quiz_attempts", ["user_id"])
    op.create_index("idx_quiz_attempts_quiz_id", "quiz_attempts", ["quiz_id"])
    # Composite index for daily rate-limit query (user + quiz + date)
    op.execute("""
        CREATE INDEX idx_quiz_attempts_user_quiz_day
        ON quiz_attempts (user_id, quiz_id, date_trunc('day', attempted_at))
    """)

    # ── progress ───────────────────────────────────────────────────────────
    op.create_table(
        "progress",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "status",
            sa.Text(),
            nullable=False,
            server_default="not_started",
        ),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status IN ('not_started', 'in_progress', 'completed')",
            name="ck_progress_status",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_progress_user_id",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["chapter_id"],
            ["chapters.id"],
            name="fk_progress_chapter_id",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("user_id", "chapter_id", name="uq_progress_user_chapter"),
    )
    op.create_index("idx_progress_user_id", "progress", ["user_id"])

    # ── subscriptions ──────────────────────────────────────────────────────
    op.create_table(
        "subscriptions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="active"),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("stripe_subscription_id", sa.Text(), nullable=True),
        sa.Column("stripe_customer_id", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint(
            "plan IN ('free', 'pro')", name="ck_subscriptions_plan"
        ),
        sa.CheckConstraint(
            "status IN ('active', 'cancelled', 'expired')",
            name="ck_subscriptions_status",
        ),
        sa.UniqueConstraint(
            "stripe_subscription_id", name="uq_subscriptions_stripe_id"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_subscriptions_user_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index("idx_subscriptions_user_id", "subscriptions", ["user_id"])

    # ── search_log ─────────────────────────────────────────────────────────
    op.create_table(
        "search_log",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("result_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "searched_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_search_log_user_id",
            ondelete="CASCADE",
        ),
    )
    # Composite index for daily rate-limit count query
    op.execute("""
        CREATE INDEX idx_search_log_user_day
        ON search_log (user_id, date_trunc('day', searched_at))
    """)


def downgrade() -> None:
    op.drop_table("search_log")
    op.drop_table("subscriptions")
    op.drop_table("progress")
    op.drop_table("quiz_attempts")
    op.drop_table("quizzes")
    op.execute("DROP TRIGGER IF EXISTS trg_chapters_updated_at ON chapters")
    op.drop_table("chapters")
    op.execute("DROP TRIGGER IF EXISTS trg_users_updated_at ON users")
    op.drop_table("users")
    op.execute("DROP FUNCTION IF EXISTS set_updated_at()")
