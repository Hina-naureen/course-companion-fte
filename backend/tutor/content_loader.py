"""
Content loader — reads chapter markdown files and quiz JSON files from disk
and caches them in memory for the lifetime of the process.

Chapter slugs are derived from filenames:
  "01-what-is-generative-ai.md" → slug "what-is-generative-ai"

Chapters are looked up by:
  - slug  ("what-is-generative-ai")
  - number as string ("1", "2", …)
  - number as int   (1, 2, …)

No LLM calls. No external network requests.
"""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path

log = logging.getLogger(__name__)

# ── Static metadata (summaries, tags, times) ──────────────────────────────────
# Stored here rather than parsed from markdown so content changes don't
# accidentally break the API contract.

_META: dict[str, dict] = {
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
            "Go under the hood of Large Language Models — tokenisation, embeddings, "
            "the Transformer's self-attention mechanism, next-token training, and RLHF. "
            "No mathematics required."
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
            "The five core ethical challenges of generative AI: hallucinations, bias, "
            "privacy, copyright, and misuse — illustrated with real cases including "
            "the $25M deepfake fraud and Amazon's biased hiring tool."
        ),
    },
    "building-with-generative-ai": {
        "number": 5,
        "tier_required": "free",
        "estimated_mins": 25,
        "tags": ["development", "rag", "agents", "api"],
        "summary": (
            "How AI-powered products are actually built — APIs, RAG, agents, fine-tuning, "
            "and vector databases. Includes a full reference architecture for a "
            "production AI app."
        ),
    },
}


# ── Data classes ───────────────────────────────────────────────────────────────

@dataclass
class ChapterData:
    number:         int
    slug:           str
    title:          str
    summary:        str
    content_md:     str
    tier_required:  str
    estimated_mins: int
    tags:           list[str]
    has_quiz:       bool = False


@dataclass
class QuizData:
    chapter_slug:  str
    title:         str
    quiz_type:     str
    tier_required: str
    passing_score: int
    questions:     list[dict] = field(default_factory=list)


# ── Loader ─────────────────────────────────────────────────────────────────────

class ContentLoader:
    """
    Reads content files once on startup and serves them from memory.

    content_dir should point to the project-level `content/` folder:
      content/
        chapters/01-what-is-generative-ai.md
        chapters/02-how-llms-work.md  …
        quizzes/ch01-quiz.json  …
    """

    def __init__(self, content_dir: Path | None = None) -> None:
        if content_dir is None:
            # Default: three levels up from this file → project root → content/
            content_dir = Path(__file__).parent.parent.parent / "content"
        self._content_dir = content_dir
        self._chapters:   dict[str, ChapterData] = {}  # slug → ChapterData
        self._by_number:  dict[int,  ChapterData] = {}  # number → ChapterData
        self._quizzes:    dict[str, QuizData]     = {}  # chapter_slug → QuizData
        self._loaded = False

    # ── Public API ─────────────────────────────────────────────────────────────

    def load(self) -> None:
        """Parse all markdown and JSON files. Called once at startup."""
        chapters_dir = self._content_dir / "chapters"
        quizzes_dir  = self._content_dir / "quizzes"

        if not chapters_dir.exists():
            raise FileNotFoundError(f"Chapters directory not found: {chapters_dir}")

        # Load quizzes first so we know which chapters have them
        quiz_slugs: set[str] = set()
        if quizzes_dir.exists():
            for qf in sorted(quizzes_dir.glob("ch*.json")):
                try:
                    qd = self._parse_quiz(qf)
                    self._quizzes[qd.chapter_slug] = qd
                    quiz_slugs.add(qd.chapter_slug)
                    log.info("Loaded quiz: %s", qf.name)
                except Exception as exc:
                    log.warning("Skipping quiz %s: %s", qf.name, exc)

        # Load chapters
        for md_file in sorted(chapters_dir.glob("*.md")):
            try:
                ch = self._parse_chapter(md_file)
                ch.has_quiz = ch.slug in quiz_slugs
                self._chapters[ch.slug] = ch
                self._by_number[ch.number] = ch
                log.info("Loaded chapter %d: %s", ch.number, ch.title)
            except Exception as exc:
                log.warning("Skipping chapter %s: %s", md_file.name, exc)

        self._loaded = True
        log.info(
            "Content loaded: %d chapters, %d quizzes",
            len(self._chapters),
            len(self._quizzes),
        )

    def all_chapters(self) -> list[ChapterData]:
        """All chapters sorted by number."""
        self._assert_loaded()
        return sorted(self._chapters.values(), key=lambda c: c.number)

    def get_chapter(self, chapter_id: str | int) -> ChapterData | None:
        """
        Look up a chapter by slug, number-as-string, or number-as-int.
        Returns None if not found.
        """
        self._assert_loaded()
        if isinstance(chapter_id, int):
            return self._by_number.get(chapter_id)
        # Try as slug first
        ch = self._chapters.get(chapter_id)
        if ch:
            return ch
        # Try as numeric string ("1", "2", …)
        if chapter_id.isdigit():
            return self._by_number.get(int(chapter_id))
        return None

    def next_chapter(self, chapter_id: str | int) -> ChapterData | None:
        """Return the chapter immediately after `chapter_id`, or None if it's the last."""
        self._assert_loaded()
        current = self.get_chapter(chapter_id)
        if current is None:
            return None
        return self._by_number.get(current.number + 1)

    def get_quiz(self, chapter_id: str | int) -> QuizData | None:
        """Return the quiz for a chapter, or None if no quiz exists."""
        self._assert_loaded()
        ch = self.get_chapter(chapter_id)
        if ch is None:
            return None
        return self._quizzes.get(ch.slug)

    def search(self, query: str, limit: int = 10) -> list[tuple[ChapterData, str, int]]:
        """
        Simple relevance-ranked keyword search across title, summary, content.

        Returns a list of (ChapterData, matched_field, relevance_score) tuples,
        sorted by descending score.

        Scoring per chapter:
          - Each match in title   → +3
          - Each match in summary → +2
          - Each match in content → +1  (capped at +5 to prevent content domination)
        """
        self._assert_loaded()
        if not query.strip():
            return []

        # Build a list of lowercase search terms (split on whitespace)
        terms = [t.lower() for t in query.strip().split() if t]

        results: list[tuple[ChapterData, str, int]] = []

        for ch in self._chapters.values():
            title_l   = ch.title.lower()
            summary_l = ch.summary.lower()
            content_l = ch.content_md.lower()

            score = 0
            best_field = ""

            title_hits = sum(title_l.count(t) for t in terms)
            if title_hits:
                score += title_hits * 3
                best_field = "title"

            summary_hits = sum(summary_l.count(t) for t in terms)
            if summary_hits:
                score += summary_hits * 2
                if not best_field:
                    best_field = "summary"

            content_hits = sum(content_l.count(t) for t in terms)
            if content_hits:
                score += min(content_hits, 5)   # cap content contribution
                if not best_field:
                    best_field = "content"

            if score > 0:
                results.append((ch, best_field, score))

        results.sort(key=lambda x: x[2], reverse=True)
        return results[:limit]

    # ── Private helpers ────────────────────────────────────────────────────────

    def _assert_loaded(self) -> None:
        if not self._loaded:
            raise RuntimeError("ContentLoader.load() has not been called yet.")

    @staticmethod
    def _slug_from_filename(path: Path) -> str:
        """
        "01-what-is-generative-ai.md" → "what-is-generative-ai"
        """
        parts = path.stem.split("-")
        return "-".join(parts[1:]) if parts[0].isdigit() else path.stem

    @staticmethod
    def _title_from_markdown(text: str) -> str:
        """Extract the first H1 heading from markdown text."""
        for line in text.splitlines():
            if line.startswith("# "):
                return line[2:].strip()
        return ""

    def _parse_chapter(self, path: Path) -> ChapterData:
        content_md = path.read_text(encoding="utf-8")
        slug       = self._slug_from_filename(path)
        meta       = _META.get(slug)

        if meta is None:
            raise ValueError(f"No metadata entry for slug '{slug}' in _META")

        title = self._title_from_markdown(content_md) or slug

        return ChapterData(
            number         = meta["number"],
            slug           = slug,
            title          = title,
            summary        = meta["summary"],
            content_md     = content_md,
            tier_required  = meta["tier_required"],
            estimated_mins = meta["estimated_mins"],
            tags           = meta["tags"],
        )

    @staticmethod
    def _parse_quiz(path: Path) -> QuizData:
        data = json.loads(path.read_text(encoding="utf-8"))

        required = ("chapter_slug", "title", "quiz_type", "questions")
        for key in required:
            if key not in data:
                raise KeyError(f"Quiz file {path.name} missing required key: '{key}'")

        if not data["questions"]:
            raise ValueError(f"Quiz file {path.name} has no questions")

        return QuizData(
            chapter_slug  = data["chapter_slug"],
            title         = data["title"],
            quiz_type     = data["quiz_type"],
            tier_required = data.get("tier_required", "free"),
            passing_score = data.get("passing_score", 60),
            questions     = data["questions"],
        )
