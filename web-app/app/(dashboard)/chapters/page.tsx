"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { chaptersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { KEYS } from "@/lib/query-client";
import { ChaptersPageSkeleton } from "@/components/skeletons";
import type { ChapterSummary } from "@/lib/types";
import { BookOpen, Clock, Lock, Zap, ArrowRight } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function ChaptersPage() {
  const { user } = useAuthStore();

  // KEYS.chapters is shared with the Dashboard — if the user visited the
  // dashboard first this renders instantly from cache with no network call.
  const { data: chapters = [], isLoading, isError } = useQuery({
    queryKey: KEYS.chapters,
    queryFn:  async () => {
      const res = await chaptersApi.list();
      const raw = res.data as unknown;
      return Array.isArray(raw)
        ? (raw as ChapterSummary[])
        : ((raw as { chapters: ChapterSummary[] }).chapters ?? []);
    },
  });

  if (isLoading && chapters.length === 0) return <ChaptersPageSkeleton />;
  if (isError) return <div className="py-20 text-center text-red-400">Failed to load chapters.</div>;

  const isLocked = (ch: ChapterSummary) =>
    ch.tier_required === "pro" && user?.tier === "free";

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={14} className="text-blue-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Curriculum</p>
        </div>
        <h1 className="text-3xl font-black text-white">Chapter Library</h1>
        <p className="text-gray-400 text-sm mt-1">
          {chapters.length} chapters · Generative AI Fundamentals
        </p>
      </motion.div>

      {/* ── Chapter list ────────────────────────────────────────────────── */}
      <motion.div variants={stagger} className="space-y-4">
        {chapters.map((ch) => {
          const locked = isLocked(ch);
          return (
            <motion.div
              key={ch.id}
              variants={fadeUp}
              className={`group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-200 ${
                locked ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-0.5">
                      <BookOpen size={10} className="text-blue-400" />
                      <span className="text-xs text-blue-400 font-medium">Ch {ch.number}</span>
                    </div>
                    {locked && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-lg">
                        <Lock size={9} /> Pro
                      </span>
                    )}
                    {ch.has_quiz && (
                      <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                        Quiz
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={10} /> {ch.estimated_mins} min
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white mb-1.5 group-hover:text-blue-100 transition">
                    {ch.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">{ch.summary}</p>

                  {ch.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {ch.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs bg-white/5 text-gray-500 border border-white/10 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {locked ? (
                    <Link
                      href="/upgrade"
                      className="flex items-center gap-1.5 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 font-semibold whitespace-nowrap hover:bg-yellow-500/20 transition"
                    >
                      <Zap size={13} /> Upgrade
                    </Link>
                  ) : (
                    <Link
                      href={`/chapters/${ch.id}`}
                      className="flex items-center gap-1.5 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition"
                    >
                      Read <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
