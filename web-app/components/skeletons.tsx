// Reusable skeleton components — replace full-page spinners with content-shaped placeholders.
import type { CSSProperties } from "react";

function Bone({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={`animate-pulse rounded bg-white/8 ${className}`} style={style} />
  );
}

/* ── Chapter card skeleton (used on dashboard grid) ────────────────────────── */
export function ChapterCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Bone className="h-5 w-20" />
        <Bone className="h-5 w-24" />
      </div>
      <Bone className="h-5 w-3/4" />
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Bone className="h-4 w-12" />
        <Bone className="h-4 w-14" />
      </div>
      <Bone className="h-10 w-full mt-1" />
    </div>
  );
}

/* ── Chapters list row skeleton (used on /chapters page) ───────────────────── */
export function ChapterRowSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Bone className="h-5 w-16" />
            <Bone className="h-5 w-12" />
            <Bone className="h-5 w-16" />
          </div>
          <Bone className="h-6 w-2/3" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-4/5" />
          <div className="flex gap-1.5 pt-0.5">
            <Bone className="h-5 w-16 rounded-full" />
            <Bone className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <Bone className="h-10 w-24 rounded-xl flex-shrink-0" />
      </div>
    </div>
  );
}

/* ── Full dashboard skeleton ───────────────────────────────────────────────── */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="space-y-2 mb-8">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-9 w-52" />
        <Bone className="h-4 w-72" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <Bone className="h-8 w-8 rounded-lg" />
            <Bone className="h-3 w-20" />
            <Bone className="h-7 w-14" />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-3">
        <div className="flex justify-between">
          <Bone className="h-4 w-32" />
          <Bone className="h-4 w-10" />
        </div>
        <Bone className="h-2.5 w-full rounded-full" />
        <div className="flex gap-4">
          <Bone className="h-3 w-24" />
          <Bone className="h-3 w-24" />
          <Bone className="h-3 w-24" />
        </div>
      </div>

      {/* Chapter grid */}
      <div className="flex items-center justify-between mb-4">
        <Bone className="h-6 w-36" />
        <Bone className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <ChapterCardSkeleton key={i} />)}
      </div>
    </div>
  );
}

/* ── Full chapters-list page skeleton ─────────────────────────────────────── */
export function ChaptersPageSkeleton() {
  return (
    <div>
      <div className="mb-8 space-y-2">
        <Bone className="h-3.5 w-20" />
        <Bone className="h-9 w-44" />
        <Bone className="h-4 w-56" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <ChapterRowSkeleton key={i} />)}
      </div>
    </div>
  );
}

/* ── Quiz page skeleton ────────────────────────────────────────────────────── */
export function QuizPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <Bone className="h-8 w-48" />
        <Bone className="h-5 w-20" />
      </div>
      <Bone className="h-4 w-56 mb-8" />
      <Bone className="h-1.5 w-full rounded-full mb-8" />
      <div className="space-y-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
            <Bone className="h-5 w-3/4" />
            <div className="space-y-2 mt-4">
              {[...Array(4)].map((_, j) => (
                <Bone key={j} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-4 border-t border-gray-800">
        <Bone className="h-10 w-28 rounded-lg" />
        <Bone className="h-10 w-36 rounded-lg" />
      </div>
    </div>
  );
}

/* ── Progress page skeleton ────────────────────────────────────────────────── */
export function ProgressPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-8 space-y-2">
        <Bone className="h-3.5 w-20" />
        <Bone className="h-9 w-44" />
        <Bone className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <Bone className="h-8 w-8 rounded-lg" />
            <Bone className="h-3 w-20" />
            <Bone className="h-7 w-14" />
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 space-y-3">
        <div className="flex justify-between">
          <Bone className="h-5 w-40" />
          <Bone className="h-7 w-16" />
        </div>
        <Bone className="h-3 w-full rounded-full" />
        <div className="flex gap-4">
          <Bone className="h-4 w-28" />
          <Bone className="h-4 w-28" />
          <Bone className="h-4 w-28" />
        </div>
      </div>
      <Bone className="h-6 w-40 mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Bone className="h-5 w-12" />
                <Bone className="h-5 w-20" />
              </div>
              <Bone className="h-5 w-2/3" />
            </div>
            <Bone className="h-8 w-16 shrink-0" />
            <Bone className="h-9 w-20 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Chapter detail page skeleton ─────────────────────────────────────────── */
export function ChapterDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Bone className="h-4 w-20" />
        <Bone className="h-4 w-3" />
        <Bone className="h-4 w-20" />
        <Bone className="h-4 w-3" />
        <Bone className="h-4 w-24" />
      </div>

      {/* Chapter header */}
      <div className="mb-8 space-y-3">
        <div className="flex gap-2">
          <Bone className="h-4 w-20" />
          <Bone className="h-4 w-20" />
        </div>
        <Bone className="h-9 w-3/4" />
        <Bone className="h-5 w-full" />
        <Bone className="h-5 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Bone className="h-5 w-16 rounded-full" />
          <Bone className="h-5 w-20 rounded-full" />
          <Bone className="h-5 w-14 rounded-full" />
        </div>
      </div>

      {/* Article body lines */}
      <div className="space-y-3 mb-10">
        {[100, 95, 88, 75, 100, 92, 60, 100, 85, 70, 100, 90, 55].map((w, i) => (
          <Bone key={i} className={`h-4`} style={{ width: `${w}%` }} />
        ))}
        <div className="h-4" /> {/* paragraph gap */}
        {[100, 88, 94, 80, 100, 72].map((w, i) => (
          <Bone key={`b${i}`} className="h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
