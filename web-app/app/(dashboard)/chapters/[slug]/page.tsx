"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { chaptersApi, progressApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { ChapterDetail } from "@/lib/types";
import type { AxiosResponse } from "axios";
import AITeacher from "@/components/AITeacher";
import { ChapterDetailSkeleton } from "@/components/skeletons";

export default function ChapterDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    chaptersApi
      .get(slug)
      .then(async (res: AxiosResponse<ChapterDetail>) => {
        setChapter(res.data);

        // Mark chapter as in_progress
        if (user?.user_id) {
          try {
            await progressApi.update(user.user_id, res.data.id, "in_progress");
          } catch {
            // Progress update is best-effort; don't block reading
          }
        }
      })
      .catch(() => setError("Failed to load chapter. It may not exist or you may not have access."))
      .finally(() => setLoading(false));
  }, [slug, user]);

  if (loading) return <ChapterDetailSkeleton />;

  if (error || !chapter) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error ?? "Chapter not found."}</p>
        <Link href="/chapters" className="text-blue-400 hover:text-blue-300">
          ← Back to chapters
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/dashboard" className="hover:text-gray-300 transition">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/chapters" className="hover:text-gray-300 transition">
          Chapters
        </Link>
        <span>/</span>
        <span className="text-gray-300">Chapter {chapter.number}</span>
      </nav>

      {/* Chapter header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-500 font-medium">
            Chapter {chapter.number}
          </span>
          <span className="text-xs text-gray-500">·</span>
          <span className="text-xs text-gray-500">
            {chapter.estimated_mins} min read
          </span>
          {chapter.tier_required === "pro" && (
            <>
              <span className="text-xs text-gray-500">·</span>
              <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full">
                Pro
              </span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-100 mb-3">
          {chapter.title}
        </h1>
        <p className="text-gray-400 text-base">{chapter.summary}</p>

        {/* Tags */}
        {chapter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {chapter.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <article className="mb-10 text-gray-300 leading-relaxed space-y-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-100 [&_h1]:mt-8 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-100 [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-200 [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:text-gray-300 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_li]:text-gray-300 [&_code]:bg-gray-800 [&_code]:text-blue-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_pre]:bg-gray-800 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_strong]:text-gray-100 [&_strong]:font-semibold [&_a]:text-blue-400 [&_a]:hover:text-blue-300 [&_hr]:border-gray-700">
        <ReactMarkdown>{chapter.content_md}</ReactMarkdown>
      </article>

      {/* AI Teacher Avatar */}
      <AITeacher chapterId={chapter.id} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 pt-6 mt-8 border-t border-gray-800">
        {chapter.has_quiz && (
          <Link
            href={`/quizzes/${chapter.id}`}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-semibold transition"
          >
            Take Quiz →
          </Link>
        )}
        <Link
          href="/chapters"
          className="text-sm text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 px-4 py-2.5 rounded-lg transition"
        >
          ← All Chapters
        </Link>
      </div>
    </div>
  );
}
