"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { quizApi } from "@/lib/api";
import { KEYS } from "@/lib/query-client";
import { QuizPageSkeleton } from "@/components/skeletons";
import type { QuizPublic, QuizResult } from "@/lib/types";

const QUIZ_DURATION_SECS = 120; // 2 minutes

export default function QuizPage() {
  const { chapterId }  = useParams<{ chapterId: string }>();
  const queryClient    = useQueryClient();

  const [retryKey,    setRetryKey]    = useState(0);
  const [answers,     setAnswers]     = useState<Record<string, string>>({});
  const [result,      setResult]      = useState<QuizResult | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [timeLeft,    setTimeLeft]    = useState(QUIZ_DURATION_SECS);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  // New quiz set each open (staleTime 0 + retryKey forces a fresh fetch)
  const { data: quiz, isLoading, isError } = useQuery<QuizPublic>({
    queryKey: [...KEYS.quiz(chapterId ?? ""), retryKey],
    queryFn:  () => quizApi.get(chapterId!).then((r) => r.data),
    enabled:  !!chapterId,
    staleTime: 0,
    gcTime:    0,
  });

  // ── Submit helper (shared by button and auto-submit) ────────────────────────

  const doSubmit = useCallback(async (currentAnswers: Record<string, string>) => {
    if (!quiz || submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const { data } = await quizApi.submit(chapterId, currentAnswers);
      setResult(data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Failed to submit quiz. Please try again.";
      setSubmitError(message);
      submittedRef.current = false; // allow retry on network error
    } finally {
      setSubmitting(false);
    }
  }, [quiz, chapterId]);

  // ── Countdown timer ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!quiz || result) return; // don't start until quiz is loaded, stop after submit

    submittedRef.current = false;
    setTimeLeft(QUIZ_DURATION_SECS);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-submit with whatever answers were given
          setAnswers((a) => { doSubmit(a); return a; });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz]); // restart timer whenever a new quiz set loads

  // ── UI helpers ──────────────────────────────────────────────────────────────

  function handleSelect(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function handleSubmit() {
    if (!quiz) return;
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setSubmitError(
        `Please answer all questions. ${unanswered.length} question(s) remaining.`
      );
      return;
    }
    setSubmitError(null);
    await doSubmit(answers);
  }

  function handleRetry() {
    if (timerRef.current) clearInterval(timerRef.current);
    submittedRef.current = false;
    queryClient.removeQueries({ queryKey: [...KEYS.quiz(chapterId ?? ""), retryKey] });
    setResult(null);
    setAnswers({});
    setSubmitError(null);
    setRetryKey((k) => k + 1);
  }

  // Timer colour
  const timerColor =
    timeLeft > 60 ? "text-green-400" :
    timeLeft > 30 ? "text-yellow-400" :
                    "text-red-400";

  // ── Loading / error ─────────────────────────────────────────────────────────

  if (isLoading) return <QuizPageSkeleton />;

  if (isError || !quiz) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">
          {isError
            ? "Failed to load quiz. It may not exist for this chapter."
            : "Quiz not found."}
        </p>
        <Link href="/chapters" className="text-blue-400 hover:text-blue-300">
          ← Back to chapters
        </Link>
      </div>
    );
  }

  // ── Results view ────────────────────────────────────────────────────────────

  if (result) {
    const percentage = Math.round(result.score * 100);
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-400 text-sm mb-8">Quiz Results</p>

        {/* Score card */}
        <div
          className={`rounded-xl p-6 mb-8 border ${
            result.passed
              ? "bg-green-900/20 border-green-700"
              : "bg-red-900/20 border-red-700"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`text-5xl font-black ${
                result.passed ? "text-green-400" : "text-red-400"
              }`}
            >
              {percentage}%
            </div>
            <div>
              <p
                className={`text-xl font-semibold ${
                  result.passed ? "text-green-300" : "text-red-300"
                }`}
              >
                {result.passed ? "Passed!" : "Not Passed"}
              </p>
              <p className="text-gray-400 text-sm mt-0.5">
                {result.correct_count} of {result.total_questions} correct ·
                Passing score: {Math.round(result.passing_score * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <h2 className="text-lg font-semibold mb-4">Question Review</h2>
        <div className="space-y-4 mb-8">
          {quiz.questions.map((q, idx) => {
            const qResult = result.results.find((r) => r.question_id === q.id);
            const correct = qResult?.correct ?? false;
            return (
              <div
                key={q.id}
                className={`bg-gray-900 border rounded-xl p-5 ${
                  correct ? "border-green-800" : "border-red-800"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      correct
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {correct ? "✓" : "✗"}
                  </span>
                  <p className="text-gray-100 font-medium">
                    {idx + 1}. {q.text}
                  </p>
                </div>

                {/* Options */}
                <div className="ml-9 space-y-1 mb-3">
                  {q.options.map((opt) => {
                    const isYours         = qResult?.your_answer === opt.id;
                    const isCorrectAnswer = qResult?.correct_answer === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`text-sm px-3 py-1.5 rounded-lg ${
                          isCorrectAnswer
                            ? "bg-green-900/40 text-green-300 font-medium"
                            : isYours && !correct
                            ? "bg-red-900/40 text-red-300"
                            : "text-gray-400"
                        }`}
                      >
                        {opt.text}
                        {isCorrectAnswer && (
                          <span className="ml-2 text-xs text-green-400">(correct)</span>
                        )}
                        {isYours && !isCorrectAnswer && (
                          <span className="ml-2 text-xs text-red-400">(your answer)</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {qResult?.explanation && (
                  <p className="ml-9 text-sm text-gray-400 italic">
                    {qResult.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
          <Link
            href={`/chapters/${chapterId}`}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition text-sm"
          >
            ← Back to Chapter
          </Link>
          <Link
            href="/chapters"
            className="text-sm text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition"
          >
            All Chapters
          </Link>
          <button
            onClick={handleRetry}
            className="text-sm text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition"
          >
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz form ───────────────────────────────────────────────────────────────

  const answeredCount = Object.keys(answers).length;
  const totalCount    = quiz.questions.length;
  const mins          = Math.floor(timeLeft / 60);
  const secs          = timeLeft % 60;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <span className="text-sm text-gray-400">
          {answeredCount}/{totalCount} answered
        </span>
      </div>
      <div className="flex items-center justify-between mb-8">
        <p className="text-gray-400 text-sm">
          Passing score: {quiz.passing_score}% · {quiz.quiz_type}
        </p>
        {/* Countdown timer */}
        <span className={`text-sm font-mono font-semibold tabular-nums ${timerColor}`}>
          ⏱ {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-8">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${(answeredCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {quiz.questions.map((q, idx) => (
          <div
            key={q.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <p className="font-medium text-gray-100 mb-4">
              {idx + 1}. {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                      selected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700 hover:border-gray-500 hover:bg-gray-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.id}
                      checked={selected}
                      onChange={() => handleSelect(q.id, opt.id)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm text-gray-200">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      {submitError && (
        <p className="text-red-400 text-sm mb-4">{submitError}</p>
      )}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg font-semibold transition"
        >
          {submitting ? "Submitting…" : "Submit Quiz"}
        </button>
        <Link
          href={`/chapters/${chapterId}`}
          className="text-sm text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 px-4 py-2.5 rounded-lg transition"
        >
          ← Back to Chapter
        </Link>
        <Link
          href="/chapters"
          className="text-sm text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 px-4 py-2.5 rounded-lg transition"
        >
          All Chapters
        </Link>
      </div>
    </div>
  );
}
