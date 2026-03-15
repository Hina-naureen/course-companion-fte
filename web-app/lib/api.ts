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

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
