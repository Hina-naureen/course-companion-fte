"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { progressApi, chaptersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { KEYS } from "@/lib/query-client";
import { ProgressPageSkeleton } from "@/components/skeletons";
import type { ProgressSummary, ChapterSummary, ProgressStatus, ProgressAnalytics } from "@/lib/types";
import {
  TrendingUp, Trophy, Target, Clock,
  CheckCircle2, Lock, ArrowRight, Zap, PartyPopper,
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const STATUS_CONFIG: Record<ProgressStatus, { label: string; dot: string; badge: string }> = {
  completed:   { label: "Completed",   dot: "bg-green-500", badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  in_progress: { label: "In Progress", dot: "bg-blue-500",  badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  not_started: { label: "Not Started", dot: "bg-gray-600",  badge: "bg-white/5 text-gray-500 border-white/10" },
};

export default function ProgressPage() {
  const { user } = useAuthStore();

  // Reuses the cached chapters list from Dashboard/Chapters page — zero extra network call
  // when the user has visited those pages within the last 5 minutes.
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<ChapterSummary[]>({
    queryKey: KEYS.chapters,
    queryFn:  async () => {
      const res = await chaptersApi.list();
      const raw = res.data as unknown;
      return Array.isArray(raw)
        ? (raw as ChapterSummary[])
        : ((raw as { chapters: ChapterSummary[] }).chapters ?? []);
    },
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<ProgressSummary>({
    queryKey: KEYS.progress,
    queryFn:  () => progressApi.summary().then((r) => r.data),
    staleTime: 30 * 1000,
    retry:    false,
  });

  const { data: analytics } = useQuery<ProgressAnalytics>({
    queryKey: KEYS.analytics,
    queryFn:  () => progressApi.analytics().then((r) => r.data),
    staleTime: 60 * 1000,
    retry:    false,
  });

  // Show skeleton only on first load (no cached data yet)
  const isLoading = (chaptersLoading && chapters.length === 0) || (summaryLoading && !summary);
  if (isLoading) return <ProgressPageSkeleton />;

  const total         = chapters.length || 1;
  const completed     = summary?.chapters_completed ?? 0;
  const completionPct = Math.round((completed / total) * 100);
  const avgScore      = summary?.overall_score_avg != null
    ? Math.round(summary.overall_score_avg * 100)
    : null;

  const progressMap = Object.fromEntries(
    (summary?.chapters ?? []).map((c) => [c.chapter_id, c])
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} className="text-blue-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Analytics</p>
        </div>
        <h1 className="text-3xl font-black text-white">Your Progress</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Generative AI Fundamentals · {user?.email}
        </p>
      </motion.div>

      {/* ── Overview cards ──────────────────────────────────────────────── */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <CheckCircle2 size={16} />, label: "Completed",     value: `${completed}/${total}`, sub: "chapters",  color: "green" },
          { icon: <Clock size={16} />,        label: "In Progress",   value: String(summary?.chapters_started ?? 0), sub: "chapters", color: "blue" },
          { icon: <Trophy size={16} />,       label: "Quizzes Passed",value: String(summary?.quizzes_passed ?? 0), color: "yellow" },
          { icon: <Target size={16} />,       label: "Avg Score",     value: avgScore != null ? `${avgScore}%` : "—", color: "purple" },
        ].map((card) => (
          <motion.div
            key={card.label}
            variants={fadeUp}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
              card.color === "green"  ? "bg-green-500/10 text-green-400" :
              card.color === "blue"   ? "bg-blue-500/10 text-blue-400" :
              card.color === "yellow" ? "bg-yellow-500/10 text-yellow-400" :
              "bg-purple-500/10 text-purple-400"
            }`}>
              {card.icon}
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${
              card.color === "green"  ? "text-white" :
              card.color === "blue"   ? "text-white" :
              card.color === "yellow" ? "text-yellow-300" :
              "text-purple-300"
            }`}>{card.value}</p>
            {card.sub && <p className="text-xs text-gray-500 mt-0.5">{card.sub}</p>}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Completion bar ──────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-200">Course Completion</span>
          <span className="text-3xl font-black text-white">{completionPct}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-3 mb-4 overflow-hidden">
          <motion.div
            className="h-3 rounded-full"
            style={{
              background: completionPct === 100
                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {(["completed", "in_progress", "not_started"] as ProgressStatus[]).map((s) => {
            const count =
              s === "completed"   ? completed :
              s === "in_progress" ? (summary?.chapters_started ?? 0) :
              total - completed - (summary?.chapters_started ?? 0);
            return (
              <span key={s} className="flex items-center gap-1.5 text-gray-400">
                <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                {STATUS_CONFIG[s].label}:{" "}
                <span className="text-gray-200 font-semibold">{count}</span>
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* ── Feature 3: Analytics summary card ───────────────────────────── */}
      {analytics && (
        <motion.div
          variants={fadeUp}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {[
            { label: "Completed",   value: `${analytics.completed_chapters} / ${analytics.total_chapters}`, sub: "chapters" },
            { label: "Completion",  value: `${analytics.completion_percent}%`,  sub: "of course" },
            { label: "Avg Score",   value: `${Math.round(analytics.average_quiz_score)}%`, sub: "quiz average" },
            { label: "Time Spent",  value: `${analytics.time_spent_mins} min`,  sub: "estimated" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-2xl font-black text-white">{item.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Completion banner ───────────────────────────────────────────── */}
      {completionPct === 100 && (
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper size={20} className="text-green-400" />
            <p className="text-2xl font-black text-green-400">Course Complete!</p>
          </div>
          <p className="text-gray-400 text-sm">
            You completed all {total} chapters of Generative AI Fundamentals.
            {avgScore != null && ` Average quiz score: ${avgScore}%.`}
          </p>
        </motion.div>
      )}

      {/* ── Chapter breakdown ───────────────────────────────────────────── */}
      <motion.h2 variants={fadeUp} className="text-lg font-bold text-white mb-4">
        Chapter Breakdown
      </motion.h2>

      <motion.div variants={stagger} className="space-y-3">
        {chapters.map((ch) => {
          const p      = progressMap[ch.id];
          const status: ProgressStatus = p?.status ?? "not_started";
          const cfg    = STATUS_CONFIG[status];
          const score  = p?.quiz_score != null ? Math.round(p.quiz_score * 100) : null;
          const locked = ch.tier_required === "pro" && user?.tier === "free";

          return (
            <motion.div
              key={ch.id}
              variants={fadeUp}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
            >
              {/* Chapter info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium shrink-0">Ch {ch.number}</span>
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {locked && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      <Lock size={9} /> Pro
                    </span>
                  )}
                </div>
                <p className="font-semibold text-white truncate">{ch.title}</p>
                {p?.started_at && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Started {new Date(p.started_at).toLocaleDateString()}
                    {p.completed_at && (
                      <> · Completed {new Date(p.completed_at).toLocaleDateString()}</>
                    )}
                  </p>
                )}
              </div>

              {/* Quiz score */}
              <div className="shrink-0 text-center w-20">
                {score != null ? (
                  <>
                    <p className={`text-xl font-black ${p?.quiz_passed ? "text-green-400" : "text-red-400"}`}>
                      {score}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {p?.quiz_passed ? "Passed" : "Failed"}
                    </p>
                  </>
                ) : ch.has_quiz ? (
                  <p className="text-xs text-gray-600">Quiz pending</p>
                ) : (
                  <p className="text-xs text-gray-700">—</p>
                )}
              </div>

              {/* Action */}
              <div className="shrink-0">
                {locked ? (
                  <Link
                    href="/upgrade"
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition font-semibold"
                  >
                    <Zap size={11} /> Upgrade
                  </Link>
                ) : status === "completed" ? (
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={`/chapters/${ch.id}`}
                      className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition text-center justify-center"
                    >
                      Review
                    </Link>
                    {ch.has_quiz && (
                      <Link
                        href={`/quizzes/${ch.id}`}
                        className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition text-center justify-center"
                      >
                        Retry Quiz
                      </Link>
                    )}
                  </div>
                ) : status === "in_progress" ? (
                  <Link
                    href={`/chapters/${ch.id}`}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition"
                  >
                    Continue <ArrowRight size={11} />
                  </Link>
                ) : (
                  <Link
                    href={`/chapters/${ch.id}`}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition"
                  >
                    Start <ArrowRight size={11} />
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
