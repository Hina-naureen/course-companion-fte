/**
 * Axios-based API client targeting the tutor FastAPI backend.
 * Base URL: NEXT_PUBLIC_API_URL (default http://localhost:8000/api/v1)
 *
 * Token strategy:
 *   - access_token  stored in localStorage, attached as Bearer header
 *   - refresh_token stored in localStorage, used for silent renewal on 401
 */
import axios from "axios";
import type {
  TokenResponse,
  UserProfile,
  ChapterSummary,
  ChapterDetail,
  QuizPublic,
  QuizResult,
  ProgressResponse,
  ProgressSummary,
  ProgressAnalytics,
  SearchResponse,
  AccessCheckResponse,
  TutorResponse,
  GenerateCourseResponse,
} from "./types";
import {
  DEMO_MODE,
  DEMO_USER,
  DEMO_TOKEN,
  DEMO_REFRESH_TOKEN,
  DEMO_CHAPTERS,
  DEMO_CHAPTER_CONTENT,
  DEMO_QUIZ_DATA,
  DEMO_QUIZ_RESULT,
  DEMO_PROGRESS_SUMMARY,
  DEMO_ANALYTICS,
} from "./demo";

// Use NEXT_PUBLIC_API_URL for explicit overrides (e.g. local dev direct calls).
// Defaults to /api/v1 (relative) so Vercel's rewrite proxy forwards to the backend —
// no CORS config required on the backend for Vercel traffic.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach access token ──────────────────────────────────

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent token refresh on 401 ────────────────────────

let _refreshing = false;
let _refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (_refreshing) {
      return new Promise((resolve) => {
        _refreshQueue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api.request(original));
        });
      });
    }

    _refreshing = true;
    const refreshToken = localStorage.getItem("refresh_token");

    // In demo mode never redirect — just silently reject so React Query shows an error state
    if (DEMO_MODE) {
      _refreshing = false;
      return Promise.reject(error);
    }

    if (!refreshToken) {
      _refreshing = false;
      localStorage.clear();
      document.cookie = "access_token=; path=/; max-age=0";
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<TokenResponse>(`${BASE}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      localStorage.setItem("access_token",  data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      _refreshQueue.forEach((cb) => cb(data.access_token));
      _refreshQueue = [];

      original.headers.Authorization = `Bearer ${data.access_token}`;
      return api.request(original);
    } catch {
      localStorage.clear();
      document.cookie = "access_token=; path=/; max-age=0";
      window.location.href = "/login";
      return Promise.reject(error);
    } finally {
      _refreshing = false;
    }
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

// -------- Auth API --------

export const authApi = {

  // Register user
  register: (body: { email: string; password: string }) =>
    api.post<TokenResponse>("/auth/register", body),

  // Login user
  login: (body: { email: string; password: string }) =>
    api.post<TokenResponse>("/auth/login", body),

  // Get current user
  me: () =>
    api.get<UserProfile>("/auth/me"),

  // Refresh token
  refresh: (refresh_token: string) =>
    api.post<TokenResponse>("/auth/refresh", { refresh_token }),

  // Logout
  logout: (refresh_token: string) =>
    api.post<void>("/auth/logout", { refresh_token }),

};

// ── Chapters ──────────────────────────────────────────────────────────────────

export const chaptersApi = {
  list: () =>
    api.get<ChapterSummary[]>("/chapters"),

  get: (slugOrNumber: string) =>
    api.get<ChapterDetail>(`/chapters/${slugOrNumber}`),

  next: (slugOrNumber: string) =>
    api.get<ChapterSummary>(`/chapters/${slugOrNumber}/next`),
};

// ── Quiz ──────────────────────────────────────────────────────────────────────

export const quizApi = {
  get: (chapterId: string) =>
    api.get<QuizPublic>(`/quiz/${chapterId}`),

  submit: (chapterId: string, answers: Record<string, string>) =>
    api.post<QuizResult>(`/quiz/${chapterId}/submit`, { answers }),
};

// ── Progress ──────────────────────────────────────────────────────────────────

export const progressApi = {
  summary: () =>
    api.get<ProgressSummary>("/progress"),

  update: (userId: string, chapterId: string, status: string) =>
    api.put<ProgressResponse>(`/progress/chapters/${chapterId}`, { status }),

  // Feature 3: Progress Analytics (available to all users)
  analytics: () =>
    api.get<ProgressAnalytics>("/progress/analytics"),
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchApi = {
  search: (q: string, limit = 8) =>
    api.get<SearchResponse>("/search", { params: { q, limit } }),
};

// ── Access ────────────────────────────────────────────────────────────────────

export const accessApi = {
  check: (chapterId: string) =>
    api.get<AccessCheckResponse>("/access/check", {
      params: { chapter_id: chapterId },
    }),
};

// ── Feature 1 & 4: AI endpoints ───────────────────────────────────────────────

export const aiApi = {
  // Feature 1: AI Tutor — ask a question about a chapter
  askTutor: (chapter_id: string, question: string) =>
    api.post<TutorResponse>("/ai/tutor", { chapter_id, question }),

  // Feature 4: Generate a course from a topic
  generateCourse: (topic: string) =>
    api.post<GenerateCourseResponse>("/ai/generate-course", { topic }),
};

// ── Demo mode overrides ───────────────────────────────────────────────────────
// When DEMO_MODE is true every API call is intercepted and returns local mock
// data. No network requests reach the backend. Set DEMO_MODE = false in
// lib/demo.ts to restore real API calls.

if (DEMO_MODE) {
  const ok = <T>(data: T) =>
    Promise.resolve({ data, status: 200, statusText: "OK", headers: {}, config: {} as never });

  authApi.login    = () => ok({ access_token: DEMO_TOKEN, refresh_token: DEMO_REFRESH_TOKEN, token_type: "bearer", expires_in: 3600, user: DEMO_USER });
  authApi.register = () => ok({ access_token: DEMO_TOKEN, refresh_token: DEMO_REFRESH_TOKEN, token_type: "bearer", expires_in: 3600, user: DEMO_USER });
  authApi.me       = () => ok(DEMO_USER);
  authApi.refresh  = () => ok({ access_token: DEMO_TOKEN, refresh_token: DEMO_REFRESH_TOKEN, token_type: "bearer", expires_in: 3600, user: DEMO_USER });
  authApi.logout   = () => ok(undefined);

  chaptersApi.list = () => ok(DEMO_CHAPTERS as ChapterSummary[]);
  chaptersApi.get  = (slugOrId: string) => {
    const ch = DEMO_CHAPTERS.find((c) => c.id === slugOrId || c.slug === slugOrId);
    if (!ch) return Promise.reject(new Error("Chapter not found"));
    return ok({ ...ch, content_md: DEMO_CHAPTER_CONTENT[ch.id] ?? "# Demo Chapter\n\nContent coming soon.", updated_at: new Date().toISOString() } as ChapterDetail);
  };

  quizApi.get    = (chapterId: string) => ok((DEMO_QUIZ_DATA[chapterId] ?? DEMO_QUIZ_DATA["ch1"]) as QuizPublic);
  quizApi.submit = () => ok(DEMO_QUIZ_RESULT as QuizResult);

  progressApi.summary   = () => ok(DEMO_PROGRESS_SUMMARY as ProgressSummary);
  progressApi.analytics = () => ok(DEMO_ANALYTICS as ProgressAnalytics);
  progressApi.update    = () => ok({ user_id: "demo-user-001", chapter_id: "", status: "in_progress", quiz_score: null, quiz_passed: null, updated_at: null } as ProgressResponse);

  searchApi.search = (q: string) => ok({
    query: q, total: 2,
    results: DEMO_CHAPTERS.slice(0, 2).map((c) => ({ id: c.id, number: c.number, title: c.title, summary: c.summary, matched_in: "title", relevance: 0.9, locked: c.locked })),
  } as SearchResponse);
}
