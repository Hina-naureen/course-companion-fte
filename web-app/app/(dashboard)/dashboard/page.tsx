"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { authApi, chaptersApi, progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { KEYS } from "@/lib/query-client";
import { DashboardSkeleton } from "@/components/skeletons";
import type { ChapterSummary, ProgressSummary } from "@/lib/types";
import {
  BookOpen, CheckCircle2, Target, Zap, Lock,
  ArrowRight, Clock, Trophy, TrendingUp, Sparkles,
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();

  // ── Data fetching via React Query ────────────────────────────────────────
  // KEYS.chapters is shared with the Chapters page — navigating between them
  // hits the cache instead of making a new network request.

  const { data: userData } = useQuery({
    queryKey: KEYS.me,
    queryFn:  () => authApi.me().then((r) => r.data),
    staleTime: 60 * 1000, // re-use for 1 min
  });

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: KEYS.chapters,
    queryFn:  async () => {
      const res = await chaptersApi.list();
      const raw = res.data as unknown;
      return Array.isArray(raw)
        ? (raw as ChapterSummary[])
        : ((raw as { chapters: ChapterSummary[] }).chapters ?? []);
    },
  });

  const { data: progress } = useQuery<ProgressSummary>({
    queryKey: KEYS.progress,
    queryFn:  () => progressApi.summary().then((r) => r.data),
    staleTime: 30 * 1000,
    retry:    false, // non-critical — don't retry if it fails
  });

  // Sync fresh user profile into the auth store
  useEffect(() => {
    if (userData) setUser(userData);
  }, [userData, setUser]);

  // ── O(1) status lookup — was O(n) .find() per chapter ────────────────────
  const statusMap = useMemo(() => {
    const m = new Map<string, string>();
    progress?.chapters.forEach((c) => m.set(c.chapter_id, c.status));
    return m;
  }, [progress?.chapters]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const completedCount = progress?.chapters_completed ?? 0;
  const totalCount     = chapters.length || 1;
  const completionPct  = Math.round((completedCount / totalCount) * 100);
  const avgScore       = progress?.overall_score_avg != null
    ? Math.round(progress.overall_score_avg * 100)
    : null;

  const isLocked = (ch: ChapterSummary) =>
    ch.tier_required === "pro" && user?.tier === "free";

  const username = user?.email?.split("@")[0] ?? "there";

  // Show skeleton only on first load (no cached data yet)
  if (chaptersLoading && chapters.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>

      {/* ── Welcome ────────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-yellow-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-400">
            Welcome back
          </p>
        </div>
        <h1 className="text-3xl font-black text-white">
          Hey, {username}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> 👋</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Continue your Generative AI Fundamentals journey.
        </p>
      </motion.div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Completion"
          value={`${completionPct}%`}
          sub={`${completedCount} of ${totalCount} chapters`}
          color="blue"
        />
        <StatCard
          icon={<Trophy size={16} />}
          label="Quizzes Passed"
          value={String(progress?.quizzes_passed ?? 0)}
          color="green"
        />
        <StatCard
          icon={<Target size={16} />}
          label="Avg Score"
          value={avgScore != null ? `${avgScore}%` : "—"}
          color="purple"
        />
        <StatCard
          icon={<Zap size={16} />}
          label="Your Plan"
          value={user?.tier === "pro" ? "Pro" : "Free"}
          color={user?.tier === "pro" ? "purple" : "yellow"}
          action={
            user?.tier !== "pro"
              ? { label: "Upgrade →", href: "/upgrade" }
              : undefined
          }
        />
      </motion.div>

      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      {progress && (
        <motion.div
          variants={fadeUp}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-200">Course Progress</span>
            <span className="text-sm font-bold text-white">{completionPct}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2.5 mb-3 overflow-hidden">
            <motion.div
              className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {progress.chapters_completed} completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              {progress.chapters_started} in progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" />
              {totalCount - progress.chapters_started - progress.chapters_completed} not started
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Chapter grid ──────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Course Chapters</h2>
        <Link
          href="/chapters"
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium transition"
        >
          View all <ArrowRight size={14} />
        </Link>
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((ch) => (
          <ChapterCard
            key={ch.id}
            chapter={ch}
            locked={isLocked(ch)}
            status={statusMap.get(ch.id) ?? "not_started"}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ── Stat card ──────────────────────────────────────────────────────────────── */
function StatCard({
  icon, label, value, sub, color, action,
}: {
  icon:    React.ReactNode;
  label:   string;
  value:   string;
  sub?:    string;
  color:   "blue" | "green" | "purple" | "yellow";
  action?: { label: string; href: string };
}) {
  const iconColor = {
    blue:   "text-blue-400 bg-blue-500/10",
    green:  "text-green-400 bg-green-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
  }[color];
  const valueColor = {
    blue:   "text-white",
    green:  "text-white",
    purple: "text-purple-300",
    yellow: "text-yellow-300",
  }[color];

  return (
    <motion.div
      variants={fadeUp}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${iconColor}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      {action && (
        <Link
          href={action.href}
          className="text-xs text-yellow-400 hover:text-yellow-300 font-bold mt-2 inline-block transition"
        >
          {action.label}
        </Link>
      )}
    </motion.div>
  );
}

/* ── Chapter card ───────────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  completed:   { label: "Completed",   dot: "bg-green-500", badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  in_progress: { label: "In Progress", dot: "bg-blue-500",  badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  not_started: { label: "Not Started", dot: "bg-gray-600",  badge: "bg-white/5 text-gray-500 border-white/10" },
};

function ChapterCard({ chapter, locked, status }: {
  chapter: ChapterSummary;
  locked:  boolean;
  status:  string;
}) {
  const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started;

  return (
    <motion.div
      variants={fadeUp}
      className={`group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col hover:bg-white/8 hover:border-white/20 transition-all duration-200 ${
        locked ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <BookOpen size={13} className="text-blue-400" />
          </div>
          <span className="text-xs text-gray-500 font-medium">Ch {chapter.number}</span>
        </div>
        {locked ? (
          <span className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
            <Lock size={9} /> Pro
          </span>
        ) : (
          <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${s.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        )}
      </div>

      <h3 className="font-bold text-white mb-1.5 leading-snug group-hover:text-blue-100 transition">
        {chapter.title}
      </h3>
      <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-2 leading-relaxed">
        {chapter.summary}
      </p>

      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={11} /> {chapter.estimated_mins} min
        </span>
        {chapter.has_quiz && (
          <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
            Quiz
          </span>
        )}
      </div>

      {locked ? (
        <Link href="/upgrade" className="flex items-center justify-center gap-1.5 text-sm font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 hover:bg-yellow-500/20 transition">
          <Zap size={13} /> Upgrade to unlock
        </Link>
      ) : status === "completed" ? (
        <Link href={`/chapters/${chapter.id}`} className="flex items-center justify-center gap-1.5 text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 hover:bg-green-500/20 transition">
          <CheckCircle2 size={13} /> Review
        </Link>
      ) : status === "in_progress" ? (
        <Link href={`/chapters/${chapter.id}`} className="flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl px-4 py-2.5 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition">
          Continue <ArrowRight size={13} />
        </Link>
      ) : (
        <Link href={`/chapters/${chapter.id}`} className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-300 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 hover:bg-white/10 hover:text-white transition">
          Start <ArrowRight size={13} />
        </Link>
      )}
    </motion.div>
  );
}
