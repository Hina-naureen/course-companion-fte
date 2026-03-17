/**
 * DEMO MODE — bypasses all backend calls.
 * Set DEMO_MODE = false to re-enable real authentication.
 */
export const DEMO_MODE = true;

export const DEMO_TOKEN         = "demo-access-token";
export const DEMO_REFRESH_TOKEN = "demo-refresh-token";

export const DEMO_USER = {
  user_id:    "demo-user-001",
  email:      "demo@coursecompanion.ai",
  tier:       "free" as const,
  created_at: "2026-01-01T00:00:00Z",
};

// ── Mock chapters ─────────────────────────────────────────────────────────────

export const DEMO_CHAPTERS = [
  {
    id: "ch1", slug: "intro-to-generative-ai", number: 1,
    title: "Introduction to Generative AI",
    summary: "Understand what generative AI is, how it differs from traditional AI, and why it matters in the modern world.",
    tier_required: "free", estimated_mins: 20,
    tags: ["fundamentals", "overview"], has_quiz: true, locked: false,
  },
  {
    id: "ch2", slug: "how-llms-work", number: 2,
    title: "How Large Language Models Work",
    summary: "Dive into transformer architectures, attention mechanisms, and how LLMs are trained on massive text corpora.",
    tier_required: "free", estimated_mins: 25,
    tags: ["transformers", "architecture"], has_quiz: true, locked: false,
  },
  {
    id: "ch3", slug: "prompt-engineering", number: 3,
    title: "Prompt Engineering",
    summary: "Learn techniques to craft effective prompts — few-shot examples, chain-of-thought, and instruction tuning.",
    tier_required: "free", estimated_mins: 20,
    tags: ["prompting", "techniques"], has_quiz: true, locked: false,
  },
  {
    id: "ch4", slug: "fine-tuning-and-rlhf", number: 4,
    title: "Fine-Tuning & RLHF",
    summary: "Explore how models are adapted to specific tasks using supervised fine-tuning and reinforcement learning from human feedback.",
    tier_required: "pro", estimated_mins: 30,
    tags: ["fine-tuning", "RLHF"], has_quiz: true, locked: true,
  },
  {
    id: "ch5", slug: "ai-safety-and-alignment", number: 5,
    title: "AI Safety & Alignment",
    summary: "Understand the challenges of aligning powerful AI systems with human values and the research directions addressing them.",
    tier_required: "pro", estimated_mins: 25,
    tags: ["safety", "alignment"], has_quiz: true, locked: true,
  },
];

export const DEMO_CHAPTER_CONTENT: Record<string, string> = {
  ch1: `# Introduction to Generative AI

Generative AI refers to systems that can **produce new content** — text, images, audio, code — by learning patterns from vast training datasets.

## What Makes It Generative?

Unlike discriminative models that classify existing data, generative models learn the *distribution* of training data and can sample from it to create novel outputs.

## Key Milestones

- **2017** — Transformer architecture introduced ("Attention Is All You Need")
- **2020** — GPT-3 demonstrates few-shot learning at scale
- **2022** — ChatGPT brings conversational AI to the mainstream
- **2023–2025** — Multimodal models, reasoning, and agents emerge

## Why It Matters

Generative AI is reshaping software development, creative industries, scientific research, and human-computer interaction. Understanding its foundations is essential for anyone building in the modern tech landscape.

## Summary

In this course you'll move from first principles through to practical deployment. By the end you'll understand how these systems work, how to use them effectively, and how to think critically about their limitations.`,

  ch2: `# How Large Language Models Work

Large Language Models (LLMs) are neural networks trained on internet-scale text to predict the next token in a sequence.

## The Transformer Architecture

Introduced in 2017, the **transformer** replaced recurrent networks with a mechanism called **self-attention**, which allows every token to directly attend to every other token in context.

### Self-Attention

For each token, self-attention computes:

1. **Query (Q)** — what this token is looking for
2. **Key (K)** — what each token offers
3. **Value (V)** — what gets returned if attention is high

\`\`\`
Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V
\`\`\`

## Pre-training

LLMs are trained on the **next-token prediction** objective across hundreds of billions of tokens. The loss function is cross-entropy over the vocabulary at each position.

## Emergent Capabilities

Scale unlocks capabilities that smaller models lack — few-shot learning, chain-of-thought reasoning, and instruction following all emerge as model size increases.`,

  ch3: `# Prompt Engineering

Prompt engineering is the practice of crafting inputs to language models to elicit desired outputs reliably.

## Why Prompting Matters

LLMs are sensitive to phrasing. The same question asked differently can yield wildly different quality responses.

## Core Techniques

### Zero-Shot Prompting
Ask the model directly without examples:
> "Classify the sentiment of this review as positive, negative, or neutral."

### Few-Shot Prompting
Provide examples in the prompt:
\`\`\`
Review: "Great product!" → Positive
Review: "Broke after a week." → Negative
Review: "Does what it says." → [model fills in]
\`\`\`

### Chain-of-Thought (CoT)
Ask the model to reason step by step:
> "Think through this problem step by step before giving your final answer."

CoT dramatically improves performance on multi-step reasoning tasks.

## System Prompts

For chat models, the **system prompt** sets the persona, constraints, and tone for the entire conversation. Keep it clear and specific.`,
};

export const DEMO_QUIZ_DATA: Record<string, object> = {
  ch1: {
    id: "quiz-ch1", chapter_id: "ch1",
    title: "Chapter 1 Quiz — Introduction to Generative AI",
    quiz_type: "mcq", passing_score: 70,
    questions: [
      {
        id: "q1", text: "What distinguishes generative AI from traditional discriminative AI?",
        options: [
          { id: "a", text: "It classifies existing data" },
          { id: "b", text: "It produces new content by learning data distributions" },
          { id: "c", text: "It only works with structured data" },
          { id: "d", text: "It requires no training data" },
        ],
      },
      {
        id: "q2", text: "Which paper introduced the Transformer architecture?",
        options: [
          { id: "a", text: "BERT: Pre-training of Deep Bidirectional Transformers" },
          { id: "b", text: "GPT-3: Language Models are Few-Shot Learners" },
          { id: "c", text: "Attention Is All You Need" },
          { id: "d", text: "Deep Residual Learning for Image Recognition" },
        ],
      },
      {
        id: "q3", text: "What year did ChatGPT bring conversational AI to the mainstream?",
        options: [
          { id: "a", text: "2020" },
          { id: "b", text: "2021" },
          { id: "c", text: "2022" },
          { id: "d", text: "2023" },
        ],
      },
    ],
  },
};

export const DEMO_QUIZ_RESULT = {
  chapter_id: "ch1", user_id: "demo-user-001",
  score: 0.67, passed: false,
  passing_score: 0.70,
  correct_count: 2, total_questions: 3,
  results: [
    { question_id: "q1", correct: true,  your_answer: "b", correct_answer: "b", explanation: "Generative models learn and sample from data distributions to create new content." },
    { question_id: "q2", correct: true,  your_answer: "c", correct_answer: "c", explanation: '"Attention Is All You Need" (Vaswani et al., 2017) introduced the Transformer.' },
    { question_id: "q3", correct: false, your_answer: "d", correct_answer: "c", explanation: "ChatGPT launched in November 2022 and rapidly reached 100 million users." },
  ],
};

export const DEMO_PROGRESS_SUMMARY = {
  user_id:            "demo-user-001",
  chapters_total:     5,
  chapters_started:   1,
  chapters_completed: 1,
  quizzes_passed:     1,
  overall_score_avg:  0.85,
  chapters: [
    { chapter_id: "ch1", chapter_title: "Introduction to Generative AI", status: "completed", quiz_score: 0.85, quiz_passed: true,  started_at: "2026-03-10T09:00:00Z", completed_at: "2026-03-10T09:22:00Z" },
    { chapter_id: "ch2", chapter_title: "How Large Language Models Work",   status: "in_progress", quiz_score: null, quiz_passed: null, started_at: "2026-03-12T14:00:00Z", completed_at: null },
    { chapter_id: "ch3", chapter_title: "Prompt Engineering",               status: "not_started", quiz_score: null, quiz_passed: null, started_at: null, completed_at: null },
    { chapter_id: "ch4", chapter_title: "Fine-Tuning & RLHF",               status: "not_started", quiz_score: null, quiz_passed: null, started_at: null, completed_at: null },
    { chapter_id: "ch5", chapter_title: "AI Safety & Alignment",            status: "not_started", quiz_score: null, quiz_passed: null, started_at: null, completed_at: null },
  ],
};

export const DEMO_ANALYTICS = {
  completed_chapters: 1,
  total_chapters:     5,
  completion_percent: 20,
  average_quiz_score: 85,
  streak_days:        3,
  time_spent_mins:    45,
  weakest_topics:     [],
};
