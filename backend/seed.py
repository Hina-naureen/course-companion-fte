"""
Database seeder — loads all 5 chapter markdown files and quiz JSON files
from the content/ directory into PostgreSQL.

Usage:
    cd backend
    python seed.py            # upsert (create or update)
    python seed.py --clear    # delete everything first, then seed
    python seed.py --dry-run  # print what would be seeded without touching the DB

Run after: alembic upgrade head
"""
import asyncio
import json
import sys
import time
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, str(Path(__file__).parent))

from app.database import AsyncSessionLocal
from app.models.chapter import Chapter
from app.models.quiz import Quiz

# ── Paths ─────────────────────────────────────────────────────────────────────

BACKEND_DIR  = Path(__file__).parent
CONTENT_DIR  = BACKEND_DIR.parent / "content"
CHAPTERS_DIR = CONTENT_DIR / "chapters"
QUIZZES_DIR  = CONTENT_DIR / "quizzes"

# ── Static metadata ────────────────────────────────────────────────────────────
# Summaries live here (not in the markdown) so parsing is never fragile.
# slug = filename after stripping the leading "NN-" prefix.

CHAPTER_META: dict[str, dict] = {
    "what-is-generative-ai": {
        "number": 1,
        "tier_required": "free",
        "estimated_mins": 15,
        "tags": ["fundamentals", "overview"],
        "summary": (
            "Discover what makes AI 'generative' and how it differs from traditional AI. "
            "Learn about Large Language Models, image generators, and the milestones that "
            "brought generative AI to hundreds of millions of users."
        ),
    },
    "how-llms-work": {
        "number": 2,
        "tier_required": "free",
        "estimated_mins": 20,
        "tags": ["fundamentals", "transformers", "architecture"],
        "summary": (
            "Go under the hood of Large Language Models — from tokenisation and embeddings "
            "to the Transformer's self-attention mechanism, next-token training, and RLHF. "
            "No maths required."
        ),
    },
    "prompt-engineering": {
        "number": 3,
        "tier_required": "free",
        "estimated_mins": 20,
        "tags": ["prompting", "techniques", "best-practices"],
        "summary": (
            "Master the craft of writing prompts that get results. "
            "Covers zero-shot, few-shot, chain-of-thought, system prompts, "
            "and iterative refinement with concrete before/after examples."
        ),
    },
    "ai-ethics-and-responsible-use": {
        "number": 4,
        "tier_required": "free",
        "estimated_mins": 20,
        "tags": ["ethics", "safety", "responsible-ai"],
        "summary": (
            "Understand the five core ethical challenges of generative AI: hallucinations, "
            "bias, privacy, copyright, and misuse. Illustrated with real cases including "
            "the $25M deepfake fraud and Amazon's biased hiring tool."
        ),
    },
    "building-with-generative-ai": {
        "number": 5,
        "tier_required": "free",
        "estimated_mins": 25,
        "tags": ["development", "rag", "agents", "api"],
        "summary": (
            "Learn how AI-powered products are actually built — APIs, "
            "Retrieval-Augmented Generation (RAG), agents, fine-tuning, and vector databases. "
            "Includes a full reference architecture for a production AI app."
        ),
    },
}


# ── Markdown parser ────────────────────────────────────────────────────────────

def parse_chapter(path: Path) -> tuple[str, str, str]:
    """
    Parse a chapter markdown file.

    Returns:
        slug        — derived from the filename ("01-what-is-generative-ai" → "what-is-generative-ai")
        title       — text of the first H1 heading
        content_md  — the full file contents
    """
    content_md = path.read_text(encoding="utf-8")

    # Slug: strip leading "NN-" from the stem
    parts = path.stem.split("-")
    slug = "-".join(parts[1:]) if parts[0].isdigit() else path.stem

    # Title: first line that starts with "# "
    title = slug  # fallback
    for line in content_md.splitlines():
        if line.startswith("# "):
            title = line[2:].strip()
            break

    return slug, title, content_md


# ── Core seed logic ────────────────────────────────────────────────────────────

async def clear_content(db: AsyncSession) -> None:
    """Delete all quizzes then all chapters (FK order)."""
    await db.execute(delete(Quiz))
    await db.execute(delete(Chapter))
    await db.flush()


async def upsert_chapter(
    db: AsyncSession,
    slug: str,
    title: str,
    content_md: str,
    meta: dict,
    *,
    dry_run: bool,
) -> tuple[Chapter | None, str]:
    """
    Insert or update a chapter row.

    Returns (chapter_instance_or_None, action_label).
    """
    result = await db.execute(select(Chapter).where(Chapter.slug == slug))
    existing = result.scalar_one_or_none()

    fields = dict(
        number        = meta["number"],
        slug          = slug,
        title         = title,
        summary       = meta["summary"],
        content_md    = content_md,
        tier_required = meta["tier_required"],
        estimated_mins= meta["estimated_mins"],
        tags          = meta["tags"],
    )

    if dry_run:
        action = "CREATE" if existing is None else "UPDATE"
        return None, action

    if existing is None:
        chapter = Chapter(**fields)
        db.add(chapter)
        await db.flush()  # populate chapter.id before quiz inserts
        return chapter, "CREATE"

    for key, value in fields.items():
        setattr(existing, key, value)
    return existing, "UPDATE"


async def upsert_quiz(
    db: AsyncSession,
    chapter: Chapter,
    data: dict,
    *,
    dry_run: bool,
) -> str:
    """Insert or update a quiz row. Returns action label."""
    result = await db.execute(
        select(Quiz).where(Quiz.chapter_id == chapter.id)
    )
    existing = result.scalar_one_or_none()

    if dry_run:
        return "CREATE" if existing is None else "UPDATE"

    fields = dict(
        title         = data["title"],
        quiz_type     = data["quiz_type"],
        tier_required = data.get("tier_required", "free"),
        questions     = data["questions"],
        passing_score = data.get("passing_score", 60),
    )

    if existing is None:
        db.add(Quiz(chapter_id=chapter.id, **fields))
        return "CREATE"

    for key, value in fields.items():
        setattr(existing, key, value)
    return "UPDATE"


async def seed(db: AsyncSession, *, clear: bool, dry_run: bool) -> None:
    chapter_files = sorted(CHAPTERS_DIR.glob("*.md"))
    quiz_files    = sorted(QUIZZES_DIR.glob("ch*.json"))

    if not chapter_files:
        print(f"  ERROR: No markdown files found in {CHAPTERS_DIR}")
        return

    # Validate all quiz files reference a known chapter slug before touching the DB
    quiz_data_list: list[dict] = []
    for qf in quiz_files:
        data = json.loads(qf.read_text(encoding="utf-8"))
        if "chapter_slug" not in data:
            print(f"  SKIP  {qf.name} — missing 'chapter_slug' key")
            continue
        quiz_data_list.append(data)

    if clear and not dry_run:
        print("  Clearing chapters and quizzes...")
        await clear_content(db)

    # ── Chapters ───────────────────────────────────────────────────────────────
    print(f"\n  {'[DRY RUN] ' if dry_run else ''}Chapters ({len(chapter_files)} files)")
    print("  " + "-" * 52)

    slug_to_chapter: dict[str, Chapter] = {}

    for md_file in chapter_files:
        slug, title, content_md = parse_chapter(md_file)
        meta = CHAPTER_META.get(slug)

        if meta is None:
            print(f"  SKIP  {md_file.name}  ← slug '{slug}' not in CHAPTER_META")
            continue

        chapter, action = await upsert_chapter(
            db, slug, title, content_md, meta, dry_run=dry_run
        )

        label = f"Ch {meta['number']:02d}"
        print(f"  {action:<6}  {label}  {title}")

        if chapter is not None:
            slug_to_chapter[slug] = chapter

    # ── Quizzes ────────────────────────────────────────────────────────────────
    print(f"\n  {'[DRY RUN] ' if dry_run else ''}Quizzes ({len(quiz_data_list)} files)")
    print("  " + "-" * 52)

    for data in quiz_data_list:
        chapter_slug = data["chapter_slug"]
        chapter      = slug_to_chapter.get(chapter_slug)

        if chapter is None:
            if dry_run:
                meta = CHAPTER_META.get(chapter_slug)
                action = "CREATE" if meta else "SKIP  (chapter not found)"
                print(f"  {action}  {data['title']}")
            else:
                print(f"  SKIP   {data['title']}  ← chapter '{chapter_slug}' was not seeded")
            continue

        action = await upsert_quiz(db, chapter, data, dry_run=dry_run)
        q_count = len(data.get("questions", []))
        print(f"  {action:<6}  {data['title']}  ({q_count} questions)")

    if not dry_run:
        await db.commit()


# ── Entry point ────────────────────────────────────────────────────────────────

async def main() -> None:
    clear   = "--clear"   in sys.argv
    dry_run = "--dry-run" in sys.argv

    print("Course Companion FTE — Database Seeder")
    print("=" * 56)
    print(f"  Content dir : {CONTENT_DIR}")
    if dry_run:
        print("  Mode        : DRY RUN (no DB changes)")
    elif clear:
        print("  Mode        : CLEAR + RESEED")
    else:
        print("  Mode        : UPSERT")
    print()

    t0 = time.perf_counter()

    if dry_run:
        # Still need a DB session for SELECT queries, but we won't commit
        async with AsyncSessionLocal() as db:
            await seed(db, clear=clear, dry_run=True)
    else:
        async with AsyncSessionLocal() as db:
            try:
                await seed(db, clear=clear, dry_run=False)
            except Exception as exc:
                await db.rollback()
                print(f"\n  ERROR: {exc}")
                sys.exit(1)

    elapsed = time.perf_counter() - t0
    print(f"\n  Done in {elapsed:.2f}s")


if __name__ == "__main__":
    asyncio.run(main())
