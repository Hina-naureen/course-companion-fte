"""
Quiz engine — grades a submission against the answer key stored in the quiz JSON.

No LLM calls. Pure answer-key comparison.

Grading rules:
  - MCQ:  user answer must exactly match correct_option (case-insensitive).
  - Score = (correct / total) * 100, rounded to nearest integer.
  - Unanswered questions count as wrong.
  - Questions in the submission that don't exist in the quiz are ignored.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

from .content_loader import ContentLoader, QuizData
from .schemas import QuestionResult, QuizResult

log = logging.getLogger(__name__)


@dataclass
class GradedResult:
    chapter_id:      str
    user_id:         str
    score:           int   # 0-100
    passed:          bool
    passing_score:   int
    correct_count:   int
    total_questions: int
    results:         list[QuestionResult]

    def to_schema(self) -> QuizResult:
        return QuizResult(
            chapter_id      = self.chapter_id,
            user_id         = self.user_id,
            score           = self.score,
            passed          = self.passed,
            passing_score   = self.passing_score,
            correct_count   = self.correct_count,
            total_questions = self.total_questions,
            results         = self.results,
        )


class QuizEngine:
    def __init__(self, loader: ContentLoader) -> None:
        self._loader = loader

    def grade(
        self,
        chapter_id: str | int,
        user_id: str,
        answers: dict[str, str],
    ) -> GradedResult:
        """
        Grade a quiz submission.

        Args:
            chapter_id: chapter slug or number
            user_id:    the submitting user
            answers:    mapping of question_id → chosen option id

        Returns:
            GradedResult with per-question breakdown

        Raises:
            LookupError: if no chapter or no quiz exists for chapter_id
        """
        chapter = self._loader.get_chapter(chapter_id)
        if chapter is None:
            raise LookupError(f"Chapter not found: {chapter_id!r}")

        quiz = self._loader.get_quiz(chapter.slug)
        if quiz is None:
            raise LookupError(f"No quiz found for chapter: {chapter.slug!r}")

        question_results = self._grade_mcq(quiz, answers)
        correct_count    = sum(1 for r in question_results if r.correct)
        total            = len(quiz.questions)
        score            = round((correct_count / total) * 100) if total else 0
        passed           = score >= quiz.passing_score

        log.info(
            "Quiz graded: user=%s chapter=%s score=%d passed=%s",
            user_id, chapter.slug, score, passed,
        )

        return GradedResult(
            chapter_id      = chapter.slug,
            user_id         = user_id,
            score           = score,
            passed          = passed,
            passing_score   = quiz.passing_score,
            correct_count   = correct_count,
            total_questions = total,
            results         = question_results,
        )

    @staticmethod
    def _grade_mcq(quiz: QuizData, answers: dict[str, str]) -> list[QuestionResult]:
        """Compare each question's submitted answer to its correct_option."""
        results: list[QuestionResult] = []

        for question in quiz.questions:
            qid          = question["id"]
            correct_ans  = question.get("correct_option", "").strip().lower()
            user_ans     = answers.get(qid, "").strip().lower()
            is_correct   = bool(user_ans and user_ans == correct_ans)

            results.append(
                QuestionResult(
                    question_id    = qid,
                    correct        = is_correct,
                    your_answer    = user_ans,
                    correct_answer = correct_ans,
                    explanation    = question.get("explanation"),
                )
            )

        return results
