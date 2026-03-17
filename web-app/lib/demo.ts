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
        id: "c1q1", text: "What distinguishes generative AI from traditional discriminative AI?",
        options: [
          { id: "a", text: "It classifies existing data into predefined categories" },
          { id: "b", text: "It produces new content by learning data distributions" },
          { id: "c", text: "It only works with structured tabular data" },
          { id: "d", text: "It requires no training data at all" },
        ],
      },
      {
        id: "c1q2", text: "Which paper introduced the Transformer architecture in 2017?",
        options: [
          { id: "a", text: "BERT: Pre-training of Deep Bidirectional Transformers" },
          { id: "b", text: "GPT-3: Language Models are Few-Shot Learners" },
          { id: "c", text: "Attention Is All You Need" },
          { id: "d", text: "Deep Residual Learning for Image Recognition" },
        ],
      },
      {
        id: "c1q3", text: "What year did ChatGPT bring conversational AI to the mainstream?",
        options: [
          { id: "a", text: "2020" },
          { id: "b", text: "2021" },
          { id: "c", text: "2022" },
          { id: "d", text: "2024" },
        ],
      },
      {
        id: "c1q4", text: "Which of the following is an example of a generative AI task?",
        options: [
          { id: "a", text: "Predicting whether an email is spam" },
          { id: "b", text: "Classifying images as cats or dogs" },
          { id: "c", text: "Writing a poem given a topic prompt" },
          { id: "d", text: "Detecting fraud in bank transactions" },
        ],
      },
    ],
  },

  ch2: {
    id: "quiz-ch2", chapter_id: "ch2",
    title: "Chapter 2 Quiz — How Large Language Models Work",
    quiz_type: "mcq", passing_score: 70,
    questions: [
      {
        id: "c2q1", text: "What key advantage does self-attention provide over recurrent networks?",
        options: [
          { id: "a", text: "It processes tokens one at a time in strict sequence" },
          { id: "b", text: "It allows every token to directly attend to every other token" },
          { id: "c", text: "It eliminates the need for training data" },
          { id: "d", text: "It reduces model size without losing accuracy" },
        ],
      },
      {
        id: "c2q2", text: "What training objective do most large language models use during pre-training?",
        options: [
          { id: "a", text: "Image classification loss" },
          { id: "b", text: "Reinforcement learning from human feedback" },
          { id: "c", text: "Next-token prediction (causal language modelling)" },
          { id: "d", text: "Contrastive similarity learning" },
        ],
      },
      {
        id: "c2q3", text: "In the self-attention formula, what does the Query (Q) vector represent?",
        options: [
          { id: "a", text: "What the token returns when attended to" },
          { id: "b", text: "The positional encoding of the token" },
          { id: "c", text: "What this token is looking for from others" },
          { id: "d", text: "The token's embedding from the vocabulary" },
        ],
      },
      {
        id: "c2q4", text: "Which capability is an example of an emergent behaviour in large language models?",
        options: [
          { id: "a", text: "Storing training data verbatim" },
          { id: "b", text: "Few-shot learning from examples in the prompt" },
          { id: "c", text: "Faster inference than smaller models" },
          { id: "d", text: "Lower memory usage at runtime" },
        ],
      },
    ],
  },

  ch3: {
    id: "quiz-ch3", chapter_id: "ch3",
    title: "Chapter 3 Quiz — Prompt Engineering",
    quiz_type: "mcq", passing_score: 70,
    questions: [
      {
        id: "c3q1", text: "Which prompting technique provides labelled input-output examples inside the prompt?",
        options: [
          { id: "a", text: "Zero-shot prompting" },
          { id: "b", text: "Few-shot prompting" },
          { id: "c", text: "System prompting" },
          { id: "d", text: "Temperature sampling" },
        ],
      },
      {
        id: "c3q2", text: "Chain-of-Thought (CoT) prompting primarily improves model performance on which type of task?",
        options: [
          { id: "a", text: "Simple factual recall questions" },
          { id: "b", text: "Image generation tasks" },
          { id: "c", text: "Multi-step reasoning and arithmetic problems" },
          { id: "d", text: "Faster token generation speed" },
        ],
      },
      {
        id: "c3q3", text: "What is the primary purpose of a system prompt in a chat model?",
        options: [
          { id: "a", text: "To set the model's persona, tone, and constraints for the conversation" },
          { id: "b", text: "To increase the model's context window size" },
          { id: "c", text: "To load fine-tuned weights into the model" },
          { id: "d", text: "To enable multi-modal image inputs" },
        ],
      },
      {
        id: "c3q4", text: "Zero-shot prompting means:",
        options: [
          { id: "a", text: "Providing zero tokens to the model" },
          { id: "b", text: "Using a model with zero parameters" },
          { id: "c", text: "Asking the model a question with no examples given" },
          { id: "d", text: "Setting the temperature to zero for deterministic output" },
        ],
      },
    ],
  },

  ch4: {
    id: "quiz-ch4", chapter_id: "ch4",
    title: "Chapter 4 Quiz — Fine-Tuning & RLHF",
    quiz_type: "mcq", passing_score: 70,
    questions: [
      {
        id: "c4q1", text: "What is the primary goal of fine-tuning a pre-trained language model?",
        options: [
          { id: "a", text: "To increase the model's parameter count" },
          { id: "b", text: "To adapt the model to a specific task or domain using additional training" },
          { id: "c", text: "To remove biases learned during pre-training entirely" },
          { id: "d", text: "To convert the model from text to image generation" },
        ],
      },
      {
        id: "c4q2", text: "What does RLHF stand for?",
        options: [
          { id: "a", text: "Recursive Learning with Hierarchical Features" },
          { id: "b", text: "Reinforcement Learning from Human Feedback" },
          { id: "c", text: "Regularised Loss with High-dimensional Fine-tuning" },
          { id: "d", text: "Residual Learning for Highly Factual models" },
        ],
      },
      {
        id: "c4q3", text: "In the RLHF pipeline, what is the role of the reward model?",
        options: [
          { id: "a", text: "It generates the initial pre-training data" },
          { id: "b", text: "It scores model outputs based on human preference judgements" },
          { id: "c", text: "It replaces the language model during deployment" },
          { id: "d", text: "It compresses model weights for efficient inference" },
        ],
      },
      {
        id: "c4q4", text: "Supervised fine-tuning (SFT) trains a model on:",
        options: [
          { id: "a", text: "Unlabelled internet text like pre-training" },
          { id: "b", text: "Randomly generated synthetic inputs only" },
          { id: "c", text: "Human-written demonstration examples of desired behaviour" },
          { id: "d", text: "Adversarial examples designed to cause failures" },
        ],
      },
    ],
  },

  ch5: {
    id: "quiz-ch5", chapter_id: "ch5",
    title: "Chapter 5 Quiz — AI Safety & Alignment",
    quiz_type: "mcq", passing_score: 70,
    questions: [
      {
        id: "c5q1", text: "What does AI alignment refer to?",
        options: [
          { id: "a", text: "Aligning GPU memory layouts for faster training" },
          { id: "b", text: "Ensuring AI systems pursue goals that match human values and intentions" },
          { id: "c", text: "Synchronising multiple models to run in parallel" },
          { id: "d", text: "Standardising AI APIs across different providers" },
        ],
      },
      {
        id: "c5q2", text: "Which of the following best describes the 'specification gaming' problem in AI safety?",
        options: [
          { id: "a", text: "The model is too slow to pass benchmark tests" },
          { id: "b", text: "The model achieves a high reward by exploiting loopholes rather than the intended goal" },
          { id: "c", text: "The model refuses to follow any instructions" },
          { id: "d", text: "The model generates outputs that are too short" },
        ],
      },
      {
        id: "c5q3", text: "Constitutional AI (CAI) is a technique designed to:",
        options: [
          { id: "a", text: "Speed up model inference on consumer hardware" },
          { id: "b", text: "Help models critique and revise their own outputs against a set of principles" },
          { id: "c", text: "Store model weights in a distributed database" },
          { id: "d", text: "Automatically generate training data from Wikipedia" },
        ],
      },
      {
        id: "c5q4", text: "Why is the alignment problem considered especially difficult as models become more capable?",
        options: [
          { id: "a", text: "More capable models need larger GPUs that are harder to program" },
          { id: "b", text: "More capable models are cheaper to train, reducing research incentives" },
          { id: "c", text: "A misaligned highly capable model can pursue wrong goals more effectively and at greater scale" },
          { id: "d", text: "More capable models generate longer outputs that are harder to read" },
        ],
      },
    ],
  },
};

// Per-chapter quiz results shown after submission
export const DEMO_QUIZ_RESULTS: Record<string, object> = {
  ch1: {
    chapter_id: "ch1", user_id: "demo-user-001",
    score: 0.75, passed: true, passing_score: 0.70,
    correct_count: 3, total_questions: 4,
    results: [
      { question_id: "c1q1", correct: true,  your_answer: "b", correct_answer: "b", explanation: "Generative models learn and sample from data distributions to produce novel content, unlike discriminative models that classify existing inputs." },
      { question_id: "c1q2", correct: true,  your_answer: "c", correct_answer: "c", explanation: '"Attention Is All You Need" by Vaswani et al. (2017) introduced the Transformer, replacing recurrent architectures.' },
      { question_id: "c1q3", correct: true,  your_answer: "c", correct_answer: "c", explanation: "ChatGPT launched in November 2022 and reached 100 million users faster than any product in history." },
      { question_id: "c1q4", correct: false, your_answer: "a", correct_answer: "c", explanation: "Writing a poem from a prompt is a generative task. Spam detection and image classification are discriminative tasks." },
    ],
  },

  ch2: {
    chapter_id: "ch2", user_id: "demo-user-001",
    score: 1.0, passed: true, passing_score: 0.70,
    correct_count: 4, total_questions: 4,
    results: [
      { question_id: "c2q1", correct: true,  your_answer: "b", correct_answer: "b", explanation: "Self-attention computes relationships between all token pairs simultaneously, removing the sequential bottleneck of RNNs." },
      { question_id: "c2q2", correct: true,  your_answer: "c", correct_answer: "c", explanation: "LLMs are pre-trained to predict the next token, minimising cross-entropy loss across the vocabulary at every position." },
      { question_id: "c2q3", correct: true,  your_answer: "c", correct_answer: "c", explanation: "The Query vector encodes what information the current token is seeking from the other tokens in the sequence." },
      { question_id: "c2q4", correct: true,  your_answer: "b", correct_answer: "b", explanation: "Few-shot learning — solving tasks from a handful of in-context examples — is a capability that emerges with scale." },
    ],
  },

  ch3: {
    chapter_id: "ch3", user_id: "demo-user-001",
    score: 0.75, passed: true, passing_score: 0.70,
    correct_count: 3, total_questions: 4,
    results: [
      { question_id: "c3q1", correct: true,  your_answer: "b", correct_answer: "b", explanation: "Few-shot prompting embeds labelled examples directly in the prompt so the model can infer the pattern." },
      { question_id: "c3q2", correct: true,  your_answer: "c", correct_answer: "c", explanation: "CoT asks the model to reason step by step, which significantly improves accuracy on arithmetic and multi-hop reasoning tasks." },
      { question_id: "c3q3", correct: true,  your_answer: "a", correct_answer: "a", explanation: "The system prompt establishes the model's role, tone, constraints, and context before the user conversation begins." },
      { question_id: "c3q4", correct: false, your_answer: "d", correct_answer: "c", explanation: "Zero-shot prompting asks the model a question with no examples — relying entirely on knowledge from pre-training." },
    ],
  },

  ch4: {
    chapter_id: "ch4", user_id: "demo-user-001",
    score: 0.50, passed: false, passing_score: 0.70,
    correct_count: 2, total_questions: 4,
    results: [
      { question_id: "c4q1", correct: true,  your_answer: "b", correct_answer: "b", explanation: "Fine-tuning continues training a pre-trained model on task-specific data to specialise its behaviour." },
      { question_id: "c4q2", correct: true,  your_answer: "b", correct_answer: "b", explanation: "RLHF stands for Reinforcement Learning from Human Feedback — the technique used to align models like GPT-4 and Claude." },
      { question_id: "c4q3", correct: false, your_answer: "a", correct_answer: "b", explanation: "The reward model is trained on human preference comparisons and then used to score outputs during RL training." },
      { question_id: "c4q4", correct: false, your_answer: "a", correct_answer: "c", explanation: "SFT trains on human-written demonstrations of ideal responses, teaching the model what good behaviour looks like." },
    ],
  },

  ch5: {
    chapter_id: "ch5", user_id: "demo-user-001",
    score: 1.0, passed: true, passing_score: 0.70,
    correct_count: 4, total_questions: 4,
    results: [
      { question_id: "c5q1", correct: true,  your_answer: "b", correct_answer: "b", explanation: "AI alignment is the challenge of ensuring AI systems reliably pursue goals that match human values and intentions." },
      { question_id: "c5q2", correct: true,  your_answer: "b", correct_answer: "b", explanation: "Specification gaming occurs when a model exploits reward function loopholes to score highly without achieving the intended goal." },
      { question_id: "c5q3", correct: true,  your_answer: "b", correct_answer: "b", explanation: "Constitutional AI has the model critique its own responses against a set of written principles and iteratively improve them." },
      { question_id: "c5q4", correct: true,  your_answer: "c", correct_answer: "c", explanation: "A highly capable but misaligned model can pursue wrong objectives more effectively and at a scale that makes correction harder." },
    ],
  },
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
