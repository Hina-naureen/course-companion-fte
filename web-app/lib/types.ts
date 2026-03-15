// ── Auth ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  user_id:    string;
  email:      string | null;
  tier:       "free" | "pro";
  created_at: string | null;
}

export interface TokenResponse {
  access_token:  string;
  refresh_token: string;
  token_type:    string;
  expires_in:    number;
  user:          UserProfile;
}

// ── Chapters ──────────────────────────────────────────────────────────────────

export interface ChapterSummary {
  id:             string;   // slug e.g. "how-llms-work"
  number:         number;
  title:          string;
  summary:        string;
  tier_required:  string;
  estimated_mins: number;
  tags:           string[];
  has_quiz:       boolean;
}

export interface ChapterDetail extends ChapterSummary {
  content_md: string;
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export interface QuizOption {
  id:   string;
  text: string;
}

export interface QuizQuestion {
  id:      string;
  text:    string;
  options: QuizOption[];
}

export interface QuizPublic {
  chapter_id:    string;
  title:         string;
  quiz_type:     string;
  passing_score: number;
  questions:     QuizQuestion[];
}

export interface QuestionResult {
  question_id:    string;
  correct:        boolean;
  your_answer:    string;
  correct_answer: string;
  explanation:    string | null;
}

export interface QuizResult {
  chapter_id:      string;
  user_id:         string;
  score:           number;
  passed:          boolean;
  passing_score:   number;
  correct_count:   number;
  total_questions: number;
  results:         QuestionResult[];
}

// ── Progress ──────────────────────────────────────────────────────────────────

export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface ProgressResponse {
  user_id:     string;
  chapter_id:  string;
  status:      ProgressStatus;
  quiz_score:  number | null;
  quiz_passed: boolean | null;
  updated_at:  string | null;
}

// Client-side progress map: chapter_id → progress data
export type ProgressMap = Record<string, {
  status:      ProgressStatus;
  quiz_score:  number | null;
  quiz_passed: boolean | null;
}>;

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  id:         string;
  number:     number;
  title:      string;
  summary:    string;
  matched_in: string;
  relevance:  number;
  locked?:    boolean;
}

export interface SearchResponse {
  query:                    string;
  total:                    number;
  results:                  SearchResult[];
  remaining_searches_today?: number | null;
}

// ── Progress (extended) ────────────────────────────────────────────────────────

export interface ChapterProgressItem {
  chapter_id:   string;
  chapter_title: string;
  status:       ProgressStatus;
  quiz_score:   number | null;
  quiz_passed:  boolean | null;
  started_at:   string | null;
  completed_at: string | null;
}

export interface ProgressSummary {
  user_id:            string;
  chapters_total:     number;
  chapters_started:   number;
  chapters_completed: number;
  quizzes_passed:     number;
  overall_score_avg:  number | null;
  chapters:           ChapterProgressItem[];
}

// ── Access ────────────────────────────────────────────────────────────────────

export interface AccessCheckResponse {
  user_id:       string;
  chapter_id:    string;
  accessible:    boolean;
  reason:        string;
  tier_required: string;
  user_tier:     string;
}

// ── Feature 1: AI Tutor Chat ──────────────────────────────────────────────────

export interface TutorMessage {
  role:    "user" | "assistant";
  content: string;
}

export interface TutorResponse {
  answer: string;
  audio_url: string | null;
}

// ── Feature 3: Progress Analytics ─────────────────────────────────────────────

export interface ProgressAnalytics {
  completed_chapters: number;
  total_chapters:     number;
  completion_percent: number;
  average_quiz_score: number;
  streak_days:        number;
  time_spent_mins:    number;
  weakest_topics:     string[];
}

// ── Feature 4: AI Course Generator ───────────────────────────────────────────

export interface GenerateCourseRequest {
  topic: string;
}

export interface GenerateCourseResponse {
  course_title:   string;
  topic:          string;
  chapters_saved: number;
  chapter_ids:    string[];
}
