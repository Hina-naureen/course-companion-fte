"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { searchApi } from "@/lib/api";
import type { SearchResult } from "@/lib/types";
import { Search, Lock, ArrowRight, Zap, BookOpen } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

const SUGGESTIONS = ["transformer", "prompt engineering", "hallucination", "RAG", "attention mechanism"];

export default function SearchPage() {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<SearchResult[]>([]);
  const [total,     setTotal]     = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [searched,  setSearched]  = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    await doSearch(query.trim());
  }

  async function doSearch(q: string) {
    setLoading(true);
    setError(null);
    setSearched(true);
    setQuery(q);

    try {
      const { data } = await searchApi.search(q, 8);
      setResults(data.results);
      setTotal(data.total);
      setRemaining((data as { remaining_searches_today?: number }).remaining_searches_today ?? null);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 429
          ? "Daily search limit reached. Upgrade to Pro for unlimited searches."
          : "Search failed. Please try again."
      );
      setResults([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Search size={14} className="text-blue-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Discovery</p>
        </div>
        <h1 className="text-3xl font-black text-white">Search</h1>
        <p className="text-gray-400 text-sm mt-1">
          Search across all course chapters and content.
        </p>
      </motion.div>

      {/* ── Search form ─────────────────────────────────────────────────── */}
      <motion.form
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        onSubmit={handleSearch}
        className="mb-4"
      >
        <div className="relative flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. self-attention, RAG, prompt engineering…"
              className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-200"
              minLength={2}
              maxLength={200}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || query.trim().length < 2}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching
              </span>
            ) : "Search"}
          </button>
        </div>
      </motion.form>

      {/* ── Suggestions ─────────────────────────────────────────────────── */}
      {!searched && (
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp}
          className="flex flex-wrap gap-2 mb-8"
        >
          <span className="text-xs text-gray-600 self-center">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => doSearch(s)}
              className="text-xs text-gray-400 bg-white/5 border border-white/10 hover:border-blue-500/30 hover:text-blue-400 px-3 py-1.5 rounded-full transition"
            >
              {s}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Rate limit indicator ─────────────────────────────────────────── */}
      {remaining !== null && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xs text-gray-500 mb-4"
        >
          {remaining} search{remaining !== 1 ? "es" : ""} remaining today ·{" "}
          <Link href="/upgrade" className="text-blue-400 hover:text-blue-300 font-medium transition">
            Upgrade for unlimited
          </Link>
        </motion.p>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
          >
            <p className="text-red-400 text-sm">{error}</p>
            {error.includes("limit") && (
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-1 mt-2 text-xs text-yellow-400 font-semibold hover:text-yellow-300 transition"
              >
                <Zap size={11} /> Upgrade to Pro
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {searched && !loading && !error && (
          <motion.div key="results" initial="hidden" animate="visible" variants={stagger}>
            {total === 0 ? (
              <motion.div variants={fadeUp} className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-gray-600" />
                </div>
                <p className="font-semibold text-gray-300 mb-1">
                  No results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-sm text-gray-500">Try a different keyword or phrase.</p>
              </motion.div>
            ) : (
              <>
                <motion.p variants={fadeUp} className="text-sm text-gray-500 mb-4">
                  {total} result{total !== 1 ? "s" : ""} for &ldquo;
                  <span className="text-gray-300">{query}</span>&rdquo;
                </motion.p>
                <ul className="space-y-3">
                  {results.map((r) => (
                    <motion.li
                      key={r.id}
                      variants={fadeUp}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg">
                              <BookOpen size={10} /> Ch {r.number}
                            </span>
                            {r.locked && (
                              <span className="flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-lg">
                                <Lock size={9} /> Pro
                              </span>
                            )}
                            {r.matched_in && (
                              <span className="text-xs text-gray-600">
                                matched in {r.matched_in}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-white mb-1 truncate">{r.title}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                            {r.summary}
                          </p>
                        </div>

                        {r.locked ? (
                          <Link
                            href="/upgrade"
                            className="shrink-0 flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 px-3 py-2 rounded-xl font-semibold transition"
                          >
                            <Zap size={11} /> Unlock
                          </Link>
                        ) : (
                          <Link
                            href={`/chapters/${r.id}`}
                            className="shrink-0 flex items-center gap-1 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-3 py-2 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition"
                          >
                            Read <ArrowRight size={11} />
                          </Link>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {!searched && (
          <motion.div
            key="empty"
            initial="hidden" animate="visible" variants={fadeUp}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <BookOpen size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">Enter a keyword to search the course</p>
            <p className="text-sm mt-1 text-gray-600">
              Try: <span className="text-gray-500 italic">transformer, prompt, hallucination, RAG</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
