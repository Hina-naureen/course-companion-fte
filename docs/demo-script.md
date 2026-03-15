# Course Companion FTE — 5-Minute Demo Video Script

**Hackathon IV — Panaversity Agent Factory**
**Total runtime: ~5:00 minutes**

---

## PRE-RECORDING CHECKLIST

Before recording:
- [ ] Backend running: `docker-compose up -d`
- [ ] Web app running: `cd web-app && npm run dev`
- [ ] Backend seeded: `python seed.py`
- [ ] A free test user registered: `test@example.com`
- [ ] A pro test user registered: `pro@example.com`
- [ ] ChatGPT GPT configured with correct Actions URL
- [ ] Browser at 1920×1080, zoom at 100%
- [ ] Silence notifications

---

## SECTION 1 — INTRODUCTION (0:00 – 0:30)

**[Screen: Project logo / landing page at localhost:3000]**

> "This is **Course Companion FTE** — a three-phase AI-enhanced learning platform for Generative AI Fundamentals, built for the Panaversity Agent Factory Hackathon IV.

> The platform delivers 5 structured chapters, adaptive quizzes, progress analytics, and an AI voice tutor — all under a freemium model.

> What makes this unique is the **Zero-Backend-LLM architecture**. In Phase 1, the FastAPI backend is a pure data API — not a single LLM call. All conversational intelligence lives in the ChatGPT Custom GPT layer."

---

## SECTION 2 — ARCHITECTURE OVERVIEW (0:30 – 1:15)

**[Screen: Architecture diagram — docs/architecture-diagram.md or a slide]**

> "Let me walk through the architecture quickly.

> We have three phases built on the same backend:

> **Phase 1 — Zero-Backend-LLM:** A ChatGPT Custom GPT acts as the conversational UI. It calls our FastAPI backend through OpenAPI Actions. The backend handles auth, content, quizzes, and progress — zero LLM calls.

> **Phase 2 — Hybrid Intelligence:** We add Claude claude-sonnet-4-6 as a skills layer. Four skill modules — concept explanation, adaptive hints, quiz generation, and semantic reranking — are mounted only when the Anthropic API key is present. The backend gracefully degrades to Phase 1 otherwise.

> **Phase 3 — Full Web App:** A Next.js 15 frontend replaces ChatGPT as the primary UI. It features an animated AI voice tutor orb, React Query caching, and Zustand auth store.

> All three phases share the same FastAPI backend and PostgreSQL database."

**[Screen: Show `GET /health` response in Swagger UI]**
```json
{ "status": "ok", "phase": 2, "skills_enabled": true }
```

---

## SECTION 3 — CHATGPT APP DEMO (1:15 – 2:30)

**[Screen: ChatGPT Custom GPT — the "Course Companion FTE" GPT]**

> "Let's start with the ChatGPT interface — Phase 1."

**[Type in ChatGPT:]** `"Show me what chapters are available"`

> "The GPT calls `GET /api/v1/chapters` and formats the response. We get 5 chapters — the first three are free, the last two require Pro."

**[Type:]** `"Open chapter 1 — What is Generative AI"`

> "It calls `GET /api/v1/chapters/{id}` and returns the full markdown content, which the GPT formats nicely. It also automatically calls `PUT /progress/chapters/{id}` to mark it as in-progress."

**[Type:]** `"Quiz me on chapter 1"`

> "The GPT calls `GET /api/v1/chapters/1/quiz` to get the questions — answers stripped — and presents them one by one. I'll answer quickly."

**[Answer 3-4 questions quickly]**

> "Now let me submit all answers."

**[Type the last answer]**

> "It calls `POST /api/v1/quizzes/{id}/attempt` with our rule-based grader. No LLM involved — just a dictionary lookup. We get a score, pass/fail, and per-question feedback. This is the Zero-Backend-LLM principle in action."

**[Type:]** `"Show my progress"`

> "It calls `GET /api/v1/progress` and displays completion percentage and per-chapter status. Completely rule-based."

---

## SECTION 4 — WEB APP DEMO (2:30 – 3:45)

**[Switch to browser: localhost:3000]**

> "Now let's look at the Phase 3 Next.js web app."

**[Show landing page]**

> "The landing page has a live AI tutor chat widget. Let me show the dashboard."

**[Login as test@example.com — notice instant load]**

> "Thanks to Zustand's persist middleware, the user profile is restored from localStorage instantly — no loading state on the dashboard."

**[Dashboard visible immediately]**

> "The dashboard shows completion percentage, quizzes passed, average score, and the chapter grid with status badges. Data is pre-cached from the React Query shared key system — if you visited chapters before, this renders instantly."

**[Click a chapter]**

> "Chapter pages use a skeleton loading state while the content loads. Here's the full markdown rendered as a beautiful article."

**[Scroll to AI Teacher orb at the bottom of the chapter]**

> "This is **Aria** — our AI voice tutor. Watch the animated orb — it's a pure CSS and Framer Motion energy orb with orbit rings and a breathing animation."

**[Click the orb / type a question]**
Type: `"Can you explain transformers briefly?"`

> "The question goes to our AI tutor API. We have a multi-provider fallback chain: Gemini Flash first, then OpenRouter (free Llama 3.1), then OpenAI, then Claude. The response streams back and Aria speaks it using OpenAI TTS."

**[Show the orb pulsing while speaking]**

> "Watch the orb — the rings speed up, sonar pulses appear, and the core breathes faster when Aria is speaking."

**[Show locked Pro chapter]**

> "Free users see chapters 1-3. Chapter 4 and 5 show an upgrade prompt. The freemium check happens in the JWT itself — tier is a claim in the access token, so no database hit required."

---

## SECTION 5 — PHASE 2 HYBRID FEATURE (3:45 – 4:30)

**[Screen: Swagger UI at localhost:8000/docs — or terminal showing API call]**

> "Let me show Phase 2 — the Claude skills layer."

**[Open Swagger UI, expand `/skills/explain`]**

> "Phase 2 adds four Claude-powered skill endpoints. They're only mounted when `ANTHROPIC_API_KEY` is in the environment — otherwise the backend stays pure Phase 1."

**[Execute the `/skills/explain` endpoint with body:]**
```json
{
  "concept": "attention mechanism",
  "depth": "beginner",
  "chapter_id": "<any-id>"
}
```

> "Claude claude-sonnet-4-6 is called with a structured output schema. It returns an explanation, an analogy, and key points as distinct JSON fields — not a blob of text. The frontend can render each part differently."

**[Show the structured response]**

> "The adaptive hint endpoint is my favourite. You ask for a hint, and it gives a Socratic hint at level 1 — a gentle nudge. Level 2 is more direct. Level 3 is nearly the answer. The model is explicitly told: never reveal the answer directly."

**[Paste the health check response showing `skills_enabled: true`]**

> "The health endpoint tells you which phase is active. This makes testing and deployment easy."

---

## SECTION 6 — TECHNICAL HIGHLIGHTS (4:30 – 5:00)

**[Screen: Quick terminal / code snippets]**

> "A few technical highlights worth noting:

> First — **zero-LLM Phase 1**: the quiz grader is pure Python dictionary comparison. No API call needed.

> Second — **PostgreSQL full-text search**: we use `pg_tsvector` with a GIN index for fast chapter search. The search rate limit is tracked in a `search_log` table — a simple COUNT query over the last 24 hours.

> Third — **React Query shared cache keys**: the dashboard and chapters page share the same `KEYS.chapters` query key, so navigating between them never fires a second API call.

> Fourth — **graceful Phase 2 degradation**: the skills router is conditionally imported. If `ANTHROPIC_API_KEY` is missing, the route simply doesn't exist. No errors, no broken endpoints.

> Course Companion FTE is production-ready, fully documented, and demonstrates all three phases of the Zero-Backend-LLM to Hybrid Intelligence architecture.

> Thank you."

---

## RECORDING NOTES

- Keep the energy consistent throughout — no "umm" or long pauses
- When the API loads slowly, say "while this loads, note that..." and fill the gap
- Use browser zoom (Cmd/Ctrl +) to make text readable on recording
- Record at 1080p minimum
- For the ChatGPT section, have pre-typed answers ready to paste so quiz demo is fast
- For the orb demo, make sure sound is ON so viewers can hear TTS
- Recommended: record each section separately and edit together
- Upload to YouTube (unlisted) and include link in submission

---

## SLIDE DECK OUTLINE (optional companion)

1. Title slide — Course Companion FTE
2. Problem: Learning GenAI is hard without adaptive, affordable tools
3. Solution: 3-phase platform with freemium model
4. Architecture diagram (from docs/architecture-diagram.md)
5. Phase 1: Zero-Backend-LLM demo screenshots
6. Phase 2: Hybrid Intelligence — Claude skills
7. Phase 3: Next.js web app screenshots
8. Tech stack table
9. Freemium tier comparison
10. Hackathon checklist — all green
