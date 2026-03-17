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

// Each question carries its correct option id and explanation (stripped before
// sending to the frontend — used only by quizApi.submit in api.ts to score).
export interface DemoQuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
}

// 3 sets × 5 chapters.  A random set is picked on every quiz open.
// ── ch1 ── Introduction to Generative AI ─────────────────────────────────────
// ── ch2 ── How Large Language Models Work ────────────────────────────────────
// ── ch3 ── Prompt Engineering ────────────────────────────────────────────────
// ── ch4 ── Fine-Tuning & RLHF ────────────────────────────────────────────────
// ── ch5 ── AI Safety & Alignment ─────────────────────────────────────────────
export const DEMO_QUIZ_SETS: Record<string, DemoQuizQuestion[][]> = {

  // ── Chapter 1 — 3 sets ──────────────────────────────────────────────────────
  ch1: [
    // Set 0
    [
      { id: "c1s0q0", text: "What distinguishes generative AI from traditional discriminative AI?", correct: "b", explanation: "Generative models learn and sample from data distributions to produce novel content — unlike discriminative models that only classify existing inputs.",
        options: [{ id: "a", text: "It classifies data into predefined categories" }, { id: "b", text: "It produces new content by learning data distributions" }, { id: "c", text: "It only works with structured tabular data" }, { id: "d", text: "It requires no training data at all" }] },
      { id: "c1s0q1", text: "Which paper introduced the Transformer architecture in 2017?", correct: "c", explanation: '"Attention Is All You Need" by Vaswani et al. replaced recurrent networks with self-attention and remains the foundation of every modern LLM.',
        options: [{ id: "a", text: "BERT: Pre-training of Deep Bidirectional Transformers" }, { id: "b", text: "GPT-3: Language Models are Few-Shot Learners" }, { id: "c", text: "Attention Is All You Need" }, { id: "d", text: "Deep Residual Learning for Image Recognition" }] },
      { id: "c1s0q2", text: "What year did ChatGPT bring conversational AI to the mainstream?", correct: "c", explanation: "ChatGPT launched in November 2022 and reached 100 million users faster than any consumer product in history.",
        options: [{ id: "a", text: "2020" }, { id: "b", text: "2021" }, { id: "c", text: "2022" }, { id: "d", text: "2024" }] },
      { id: "c1s0q3", text: "Which of the following is a generative AI task?", correct: "c", explanation: "Writing a poem from a prompt is a generative task. Spam detection and fraud detection are discriminative tasks.",
        options: [{ id: "a", text: "Predicting whether an email is spam" }, { id: "b", text: "Classifying images as cats or dogs" }, { id: "c", text: "Writing a poem given a topic prompt" }, { id: "d", text: "Detecting fraud in bank transactions" }] },
    ],
    // Set 1
    [
      { id: "c1s1q0", text: "What does a diffusion model do during the generation process?", correct: "b", explanation: "Diffusion models learn to reverse a noise-adding process: they start from pure Gaussian noise and iteratively denoise it into a coherent output.",
        options: [{ id: "a", text: "Classifies images by adding Gaussian noise progressively" }, { id: "b", text: "Starts from random noise and iteratively denoises it into coherent output" }, { id: "c", text: "Converts text into audio waveforms directly" }, { id: "d", text: "Fine-tunes an existing image by cropping it" }] },
      { id: "c1s1q1", text: "What makes a GAN (Generative Adversarial Network) generative?", correct: "c", explanation: "In a GAN the generator learns to produce realistic samples by trying to fool the discriminator, which in turn learns to tell real from fake.",
        options: [{ id: "a", text: "It memorises and replays training samples verbatim" }, { id: "b", text: "It uses reinforcement learning to score outputs" }, { id: "c", text: "A generator creates samples while a discriminator distinguishes real from fake" }, { id: "d", text: "It classifies inputs to pick the nearest training example" }] },
      { id: "c1s1q2", text: "Autoregressive generation means a model:", correct: "b", explanation: "Autoregressive models like GPT produce one token at a time, each conditioned on the previously generated tokens, building output left to right.",
        options: [{ id: "a", text: "Generates all tokens simultaneously in parallel" }, { id: "b", text: "Produces each token conditioned on all previously generated tokens" }, { id: "c", text: "Always starts from a fixed template before editing" }, { id: "d", text: "Generates output only when prompted with an image" }] },
      { id: "c1s1q3", text: "What is a 'foundation model' in the context of generative AI?", correct: "c", explanation: "Foundation models like GPT-4 and Claude are pre-trained on broad data at scale and then adapted (fine-tuned or prompted) for diverse downstream tasks.",
        options: [{ id: "a", text: "A model trained exclusively on a single narrow task" }, { id: "b", text: "A small model used as a baseline for comparison" }, { id: "c", text: "A large model pre-trained on broad data and adaptable to many tasks" }, { id: "d", text: "A model that generates the architecture of other models" }] },
    ],
    // Set 2
    [
      { id: "c1s2q0", text: "What does 'hallucination' mean in the context of LLMs?", correct: "b", explanation: "LLMs can generate confident, fluent text that contains false information because they optimise for plausibility, not factual accuracy.",
        options: [{ id: "a", text: "The model refuses to answer a question" }, { id: "b", text: "The model generates plausible-sounding but factually incorrect information" }, { id: "c", text: "The model produces images instead of text" }, { id: "d", text: "The model runs slowly due to high load" }] },
      { id: "c1s2q1", text: "Which technique do models like DALL-E use to align images with text prompts?", correct: "b", explanation: "CLIP-style contrastive learning builds a shared text-image embedding space, enabling text-conditioned image generation.",
        options: [{ id: "a", text: "Recurrent attention across image pixels" }, { id: "b", text: "Cross-modal contrastive learning (CLIP)" }, { id: "c", text: "Reinforcement learning from human feedback only" }, { id: "d", text: "Supervised word-by-word pixel alignment" }] },
      { id: "c1s2q2", text: "The 'Turing Test' measures:", correct: "b", explanation: "Proposed by Alan Turing in 1950, the test evaluates whether a human evaluator can distinguish a machine from a human in text conversation.",
        options: [{ id: "a", text: "A model's accuracy on a standardised benchmark" }, { id: "b", text: "Whether a machine can exhibit conversation indistinguishable from a human" }, { id: "c", text: "How many parameters a language model has" }, { id: "d", text: "The token generation speed of the model" }] },
      { id: "c1s2q3", text: "Which of the following best describes 'multimodal AI'?", correct: "c", explanation: "Multimodal models like GPT-4V and Gemini can process and generate multiple types of data — text, images, audio — within the same model.",
        options: [{ id: "a", text: "A model trained on data from multiple countries" }, { id: "b", text: "Running several separate models in parallel" }, { id: "c", text: "A single model that can process and generate multiple data types (text, images, audio)" }, { id: "d", text: "Fine-tuning a model on more than one task simultaneously" }] },
    ],
  ],

  // ── Chapter 2 — 3 sets ──────────────────────────────────────────────────────
  ch2: [
    // Set 0
    [
      { id: "c2s0q0", text: "What key advantage does self-attention provide over recurrent networks?", correct: "b", explanation: "Self-attention computes relationships between all token pairs simultaneously, removing the sequential bottleneck of RNNs.",
        options: [{ id: "a", text: "It processes tokens one at a time in strict sequence" }, { id: "b", text: "It allows every token to directly attend to every other token" }, { id: "c", text: "It eliminates the need for training data" }, { id: "d", text: "It reduces model size without losing accuracy" }] },
      { id: "c2s0q1", text: "What training objective do most LLMs use during pre-training?", correct: "c", explanation: "LLMs are pre-trained to predict the next token, minimising cross-entropy loss over the vocabulary at every position.",
        options: [{ id: "a", text: "Image classification loss" }, { id: "b", text: "Reinforcement learning from human feedback" }, { id: "c", text: "Next-token prediction (causal language modelling)" }, { id: "d", text: "Contrastive similarity learning" }] },
      { id: "c2s0q2", text: "In self-attention, what does the Query (Q) vector represent?", correct: "c", explanation: "The Query encodes what information the current token is seeking from the other tokens in the sequence.",
        options: [{ id: "a", text: "What the token returns when attended to" }, { id: "b", text: "The positional encoding of the token" }, { id: "c", text: "What this token is looking for from others" }, { id: "d", text: "The token's embedding from the vocabulary" }] },
      { id: "c2s0q3", text: "Which is an example of an emergent behaviour in large language models?", correct: "b", explanation: "Few-shot learning — solving tasks from a handful of in-context examples — is a capability that emerges with scale and was not explicitly trained.",
        options: [{ id: "a", text: "Storing training data verbatim" }, { id: "b", text: "Few-shot learning from examples in the prompt" }, { id: "c", text: "Faster inference than smaller models" }, { id: "d", text: "Lower memory usage at runtime" }] },
    ],
    // Set 1
    [
      { id: "c2s1q0", text: "What is a 'token' in the context of language models?", correct: "b", explanation: "Tokens are atomic units LLMs process — common tokenizers use subword pieces so 'unhappiness' might split into 'un' + 'happiness'.",
        options: [{ id: "a", text: "Always exactly one full word" }, { id: "b", text: "The smallest unit of text the model processes (subword, character, or word piece)" }, { id: "c", text: "A single character always" }, { id: "d", text: "A sentence boundary marker" }] },
      { id: "c2s1q1", text: "What does the 'context window' of an LLM define?", correct: "b", explanation: "The context window determines how much text (prompt + generated output) the model can 'see' at once.",
        options: [{ id: "a", text: "The time window during which inputs are accepted" }, { id: "b", text: "The maximum number of tokens the model can process in one forward pass" }, { id: "c", text: "The GPU memory allocated for inference" }, { id: "d", text: "The number of training examples seen per batch" }] },
      { id: "c2s1q2", text: "What do word embeddings capture?", correct: "c", explanation: "Embeddings place semantically similar words close together in high-dimensional space — 'king' and 'queen' have similar vectors.",
        options: [{ id: "a", text: "The exact byte encoding of a word" }, { id: "b", text: "The font and style of the word in the training corpus" }, { id: "c", text: "Semantic and syntactic relationships between words as dense vectors" }, { id: "d", text: "A lookup table mapping words to their dictionary definitions" }] },
      { id: "c2s1q3", text: "In a Transformer, the feed-forward layer:", correct: "b", explanation: "After self-attention mixes information across positions, the feed-forward network processes each position independently with a non-linear two-layer MLP.",
        options: [{ id: "a", text: "Connects the current token directly to the output vocabulary" }, { id: "b", text: "Applies a two-layer MLP independently to each token position" }, { id: "c", text: "Computes attention weights between all pairs of tokens" }, { id: "d", text: "Encodes the absolute position of each token" }] },
    ],
    // Set 2
    [
      { id: "c2s2q0", text: "What does 'temperature' control in LLM text generation?", correct: "b", explanation: "Low temperature (→0) makes the model deterministic and repetitive; high temperature (>1) increases diversity but risks incoherence.",
        options: [{ id: "a", text: "The physical heat generated by GPU computation" }, { id: "b", text: "Randomness in token sampling — lower is more deterministic, higher is more diverse" }, { id: "c", text: "The number of transformer layers in the model" }, { id: "d", text: "The learning rate used during fine-tuning" }] },
      { id: "c2s2q1", text: "What is 'perplexity' in language modelling?", correct: "c", explanation: "Perplexity is the exponential of the average cross-entropy loss — lower perplexity means the model assigns higher probability to the test data.",
        options: [{ id: "a", text: "A measure of how confused human readers find a model's output" }, { id: "b", text: "The number of parameters that have zero gradient" }, { id: "c", text: "A measure of how well a model predicts a held-out test corpus" }, { id: "d", text: "The ratio of correct answers to total questions on a benchmark" }] },
      { id: "c2s2q2", text: "Why are positional encodings necessary in Transformers?", correct: "b", explanation: "Without positional encodings, a Transformer would treat 'cat sat on mat' and 'mat on sat cat' identically — PEs inject order information.",
        options: [{ id: "a", text: "They prevent gradient vanishing during backpropagation" }, { id: "b", text: "Self-attention is permutation-invariant, so PEs inject token-order information" }, { id: "c", text: "They compress long sequences to fit in the context window" }, { id: "d", text: "They speed up computation by removing duplicate tokens" }] },
      { id: "c2s2q3", text: "What is the Value (V) vector used for in self-attention?", correct: "a", explanation: "V is the content that gets returned — once attention weights decide how much to focus on each token, the weighted sum of V vectors forms the output.",
        options: [{ id: "a", text: "The actual content returned when a token is attended to" }, { id: "b", text: "A measure of how similar two tokens are" }, { id: "c", text: "The position of a token in the sequence" }, { id: "d", text: "The gradient magnitude for each token during training" }] },
    ],
  ],

  // ── Chapter 3 — 3 sets ──────────────────────────────────────────────────────
  ch3: [
    // Set 0
    [
      { id: "c3s0q0", text: "Which technique provides labelled input-output examples inside the prompt?", correct: "b", explanation: "Few-shot prompting embeds labelled examples so the model can infer the pattern before seeing the real input.",
        options: [{ id: "a", text: "Zero-shot prompting" }, { id: "b", text: "Few-shot prompting" }, { id: "c", text: "System prompting" }, { id: "d", text: "Temperature sampling" }] },
      { id: "c3s0q1", text: "Chain-of-Thought (CoT) prompting primarily improves performance on:", correct: "c", explanation: "CoT asks the model to reason step by step, significantly improving accuracy on arithmetic and multi-hop reasoning tasks.",
        options: [{ id: "a", text: "Simple factual recall questions" }, { id: "b", text: "Image generation tasks" }, { id: "c", text: "Multi-step reasoning and arithmetic problems" }, { id: "d", text: "Faster token generation speed" }] },
      { id: "c3s0q2", text: "What is the primary purpose of a system prompt in a chat model?", correct: "a", explanation: "The system prompt establishes the model's role, tone, constraints, and context before the user conversation begins.",
        options: [{ id: "a", text: "To set the model's persona, tone, and constraints for the conversation" }, { id: "b", text: "To increase the model's context window size" }, { id: "c", text: "To load fine-tuned weights into the model" }, { id: "d", text: "To enable multi-modal image inputs" }] },
      { id: "c3s0q3", text: "Zero-shot prompting means:", correct: "c", explanation: "Zero-shot prompting asks the model a question with no in-context examples — relying entirely on knowledge from pre-training.",
        options: [{ id: "a", text: "Providing zero tokens to the model" }, { id: "b", text: "Using a model with zero parameters" }, { id: "c", text: "Asking the model a question with no examples given" }, { id: "d", text: "Setting the temperature to zero for deterministic output" }] },
    ],
    // Set 1
    [
      { id: "c3s1q0", text: "What does 'prompt injection' refer to?", correct: "c", explanation: "Prompt injection is a security vulnerability where adversarial input in user content hijacks the model's behaviour by overriding original instructions.",
        options: [{ id: "a", text: "Adding extra context to improve output quality" }, { id: "b", text: "A technique for compressing long prompts" }, { id: "c", text: "A malicious technique where untrusted input overrides the original prompt's instructions" }, { id: "d", text: "Injecting random seeds to vary model outputs" }] },
      { id: "c3s1q1", text: "Which technique samples multiple reasoning paths and picks the most common answer?", correct: "b", explanation: "Self-consistency samples multiple CoT chains and takes a majority vote on the final answer, improving accuracy on complex tasks.",
        options: [{ id: "a", text: "Few-shot prompting" }, { id: "b", text: "Self-consistency" }, { id: "c", text: "System prompting" }, { id: "d", text: "Zero-shot CoT" }] },
      { id: "c3s1q2", text: "What is 'role prompting'?", correct: "b", explanation: "Role prompting primes the model with a persona — e.g. 'You are an expert Python developer' — to shape response style and vocabulary.",
        options: [{ id: "a", text: "Asking the model to output a specific file format" }, { id: "b", text: "Assigning the model a persona to shape its response style" }, { id: "c", text: "Listing the grammatical roles each word plays" }, { id: "d", text: "Specifying which GPU handles each model layer" }] },
      { id: "c3s1q3", text: "What is 'structured output prompting'?", correct: "b", explanation: "By instructing the model to respond in JSON, Markdown tables, or bullet lists, developers can reliably parse model responses in downstream pipelines.",
        options: [{ id: "a", text: "Generating output with consistent font sizes" }, { id: "b", text: "Asking the model to respond in a specific format like JSON or Markdown" }, { id: "c", text: "Using a database schema to auto-generate prompts" }, { id: "d", text: "Pre-processing input text to remove noise before prompting" }] },
    ],
    // Set 2
    [
      { id: "c3s2q0", text: "ReAct (Reason + Act) prompting enables a model to:", correct: "b", explanation: "ReAct allows LLMs to interleave reasoning traces with tool actions (e.g. web search, code execution), then reason about the results.",
        options: [{ id: "a", text: "Generate images by reasoning about them" }, { id: "b", text: "Interleave reasoning traces with actions like web search or code execution" }, { id: "c", text: "Act as a discriminator to evaluate other models" }, { id: "d", text: "Replace the system prompt with step-by-step instructions" }] },
      { id: "c3s2q1", text: "What is 'prompt chaining'?", correct: "b", explanation: "Prompt chaining decomposes complex tasks into a pipeline of simpler prompts where each output feeds the next step.",
        options: [{ id: "a", text: "Connecting multiple models so each refines the previous output" }, { id: "b", text: "Breaking a complex task into simpler prompts where each output feeds the next" }, { id: "c", text: "Using random tokens to warm up the model" }, { id: "d", text: "Storing prompts in a database for retrieval" }] },
      { id: "c3s2q2", text: "Hallucination mitigation in prompt engineering typically involves:", correct: "b", explanation: "Grounding prompts with retrieved documents (RAG), asking the model to cite sources, or instructing it to say 'I don't know' all reduce hallucinations.",
        options: [{ id: "a", text: "Making the model generate more vivid creative writing" }, { id: "b", text: "Grounding responses with retrieved documents or asking the model to acknowledge uncertainty" }, { id: "c", text: "Increasing temperature to boost output diversity" }, { id: "d", text: "Removing all examples from the prompt to avoid bias" }] },
      { id: "c3s2q3", text: "Iterative prompt refinement means:", correct: "b", explanation: "Iterative refinement treats prompting as a feedback loop — inspect output, identify gaps, revise the prompt, and repeat.",
        options: [{ id: "a", text: "Training the model on multiple passes of the same prompt" }, { id: "b", text: "Progressively adjusting a prompt based on model outputs until desired results are achieved" }, { id: "c", text: "Using the model to rewrite its own system prompt" }, { id: "d", text: "Running the same prompt 10 times and averaging scores" }] },
    ],
  ],

  // ── Chapter 4 — 3 sets ──────────────────────────────────────────────────────
  ch4: [
    // Set 0
    [
      { id: "c4s0q0", text: "What is the primary goal of fine-tuning a pre-trained language model?", correct: "b", explanation: "Fine-tuning continues training on task-specific data so the model specialises its behaviour for a target domain or task.",
        options: [{ id: "a", text: "To increase the model's parameter count" }, { id: "b", text: "To adapt the model to a specific task or domain using additional training" }, { id: "c", text: "To remove biases from pre-training entirely" }, { id: "d", text: "To convert the model from text to image generation" }] },
      { id: "c4s0q1", text: "What does RLHF stand for?", correct: "b", explanation: "RLHF — Reinforcement Learning from Human Feedback — is the alignment technique behind ChatGPT, GPT-4, and Claude.",
        options: [{ id: "a", text: "Recursive Learning with Hierarchical Features" }, { id: "b", text: "Reinforcement Learning from Human Feedback" }, { id: "c", text: "Regularised Loss with High-dimensional Fine-tuning" }, { id: "d", text: "Residual Learning for Highly Factual models" }] },
      { id: "c4s0q2", text: "In the RLHF pipeline, what is the role of the reward model?", correct: "b", explanation: "The reward model is trained on human preference comparisons and scores LLM outputs to guide the RL update.",
        options: [{ id: "a", text: "It generates the initial pre-training data" }, { id: "b", text: "It scores model outputs based on human preference judgements" }, { id: "c", text: "It replaces the language model during deployment" }, { id: "d", text: "It compresses model weights for efficient inference" }] },
      { id: "c4s0q3", text: "Supervised fine-tuning (SFT) trains a model on:", correct: "c", explanation: "SFT trains on human-written demonstration examples of ideal responses, teaching the model what good behaviour looks like.",
        options: [{ id: "a", text: "Unlabelled internet text like pre-training" }, { id: "b", text: "Randomly generated synthetic inputs only" }, { id: "c", text: "Human-written demonstration examples of desired behaviour" }, { id: "d", text: "Adversarial examples designed to cause failures" }] },
    ],
    // Set 1
    [
      { id: "c4s1q0", text: "LoRA (Low-Rank Adaptation) reduces fine-tuning cost by:", correct: "b", explanation: "LoRA freezes original weights and trains small low-rank matrices added back during inference — comparable performance with far fewer trainable parameters.",
        options: [{ id: "a", text: "Removing all attention layers during training" }, { id: "b", text: "Training only low-rank decomposition matrices instead of all model weights" }, { id: "c", text: "Using a smaller dataset than full fine-tuning" }, { id: "d", text: "Replacing transformer blocks with linear layers" }] },
      { id: "c4s1q1", text: "What is 'catastrophic forgetting' in fine-tuning?", correct: "c", explanation: "Fine-tuning on a narrow task can overwrite general knowledge from pre-training, causing the model to lose capabilities outside the fine-tune domain.",
        options: [{ id: "a", text: "The model forgetting to follow instructions entirely" }, { id: "b", text: "The GPU running out of memory during training" }, { id: "c", text: "The model losing pre-training knowledge when fine-tuned on narrow data" }, { id: "d", text: "The training loss spiking and failing to recover" }] },
      { id: "c4s1q2", text: "What is 'instruction tuning'?", correct: "b", explanation: "Instruction-tuned models (like InstructGPT) are fine-tuned on diverse (instruction, response) pairs to improve following of natural language instructions.",
        options: [{ id: "a", text: "Training a model to decode audio instructions from speech" }, { id: "b", text: "Fine-tuning on diverse (instruction, response) pairs to improve instruction-following" }, { id: "c", text: "Writing detailed prompts for a model that is not fine-tuned" }, { id: "d", text: "Tuning hyperparameters using a grid search" }] },
      { id: "c4s1q3", text: "PPO (Proximal Policy Optimisation) is used in RLHF to:", correct: "c", explanation: "PPO constrains each parameter update so the new policy doesn't stray too far from the old one, keeping RLHF training stable.",
        options: [{ id: "a", text: "Pre-process text before feeding it to the model" }, { id: "b", text: "Prune model parameters below a threshold" }, { id: "c", text: "Update the LLM policy with rewards while preventing large destabilising updates" }, { id: "d", text: "Parallelise training across multiple nodes" }] },
    ],
    // Set 2
    [
      { id: "c4s2q0", text: "What is DPO (Direct Preference Optimisation)?", correct: "b", explanation: "DPO reparameterises the reward model, enabling preference learning directly from paired (chosen, rejected) examples without a separate RL stage.",
        options: [{ id: "a", text: "A data preprocessing technique that removes duplicate examples" }, { id: "b", text: "A method that trains on human preferences without a separate reward model" }, { id: "c", text: "A deployment strategy for serving models at low latency" }, { id: "d", text: "A parameter reduction technique for faster inference" }] },
      { id: "c4s2q1", text: "QLoRA extends LoRA by additionally:", correct: "b", explanation: "QLoRA combines 4-bit quantisation with LoRA adapters, enabling fine-tuning of very large models on a single consumer GPU.",
        options: [{ id: "a", text: "Using larger rank matrices than standard LoRA" }, { id: "b", text: "Quantising the base model to 4-bit precision, then applying LoRA on top" }, { id: "c", text: "Training on question-answer pairs exclusively" }, { id: "d", text: "Applying regularisation after each epoch" }] },
      { id: "c4s2q2", text: "What are 'adapter layers' in parameter-efficient fine-tuning?", correct: "a", explanation: "Adapters are small bottleneck modules inserted between transformer sub-layers — only adapter weights are updated while the base model remains frozen.",
        options: [{ id: "a", text: "Small modules inserted into a frozen network that are the only layers trained" }, { id: "b", text: "Additional transformer blocks added after the final layer" }, { id: "c", text: "Layers that convert between different model architectures" }, { id: "d", text: "Special attention heads used during inference only" }] },
      { id: "c4s2q3", text: "Why is data quality especially important in fine-tuning?", correct: "c", explanation: "Even a small amount of biased or misaligned fine-tuning data can steer model behaviour in harmful directions — quality dominates quantity.",
        options: [{ id: "a", text: "Fine-tuning data must always be larger than the pre-training corpus" }, { id: "b", text: "All fine-tuning must be done with synthetic data only" }, { id: "c", text: "Quality and diversity of examples significantly affect safety and behaviour of the fine-tuned model" }, { id: "d", text: "Fine-tuning data must match the exact vocabulary distribution of the pre-training data" }] },
    ],
  ],

  // ── Chapter 5 — 3 sets ──────────────────────────────────────────────────────
  ch5: [
    // Set 0
    [
      { id: "c5s0q0", text: "What does AI alignment refer to?", correct: "b", explanation: "AI alignment is the challenge of ensuring AI systems reliably pursue goals that match human values and intentions.",
        options: [{ id: "a", text: "Aligning GPU memory layouts for faster training" }, { id: "b", text: "Ensuring AI systems pursue goals that match human values and intentions" }, { id: "c", text: "Synchronising multiple models to run in parallel" }, { id: "d", text: "Standardising AI APIs across different providers" }] },
      { id: "c5s0q1", text: "Which best describes 'specification gaming' in AI safety?", correct: "b", explanation: "Specification gaming occurs when a model exploits reward function loopholes to score highly without achieving the intended goal.",
        options: [{ id: "a", text: "The model is too slow to pass benchmark tests" }, { id: "b", text: "The model achieves high reward by exploiting loopholes rather than the intended goal" }, { id: "c", text: "The model refuses to follow any instructions" }, { id: "d", text: "The model generates outputs that are too short" }] },
      { id: "c5s0q2", text: "Constitutional AI (CAI) is designed to:", correct: "b", explanation: "CAI has the model critique its own responses against a set of written principles and iteratively improve them.",
        options: [{ id: "a", text: "Speed up model inference on consumer hardware" }, { id: "b", text: "Help models critique and revise outputs against a set of principles" }, { id: "c", text: "Store model weights in a distributed database" }, { id: "d", text: "Auto-generate training data from Wikipedia" }] },
      { id: "c5s0q3", text: "Why is alignment especially difficult as models become more capable?", correct: "c", explanation: "A highly capable but misaligned model can pursue wrong objectives more effectively and at a scale that makes correction harder.",
        options: [{ id: "a", text: "More capable models need larger GPUs" }, { id: "b", text: "More capable models are cheaper to train" }, { id: "c", text: "A misaligned highly capable model pursues wrong goals more effectively and at greater scale" }, { id: "d", text: "More capable models generate longer outputs" }] },
    ],
    // Set 1
    [
      { id: "c5s1q0", text: "What is 'mesa-optimisation' in AI safety?", correct: "b", explanation: "If a sufficiently capable model internalises an optimisation process, the mesa-objective it pursues may only coincidentally align with human goals during training.",
        options: [{ id: "a", text: "The base optimiser running out of memory during training" }, { id: "b", text: "A learned inner optimiser that may pursue its own objective differing from the training objective" }, { id: "c", text: "The model's loss function becoming discontinuous" }, { id: "d", text: "Fine-tuning overwriting safety guardrails" }] },
      { id: "c5s1q1", text: "What does 'instrumental convergence' mean?", correct: "b", explanation: "Regardless of terminal goals, most sufficiently advanced agents would seek self-preservation, capability improvement, and resource acquisition as useful sub-goals.",
        options: [{ id: "a", text: "Multiple AI systems converge to the same output" }, { id: "b", text: "Different final goals tend to share the same intermediate goals like self-preservation and resource acquisition" }, { id: "c", text: "Model weights converge toward zero during training" }, { id: "d", text: "Fine-tuned models converge toward the base model over time" }] },
      { id: "c5s1q2", text: "A 'corrigible' AI system is one that:", correct: "c", explanation: "Corrigibility is a key alignment property — a corrigible system won't resist being shut down or modified, even if doing so conflicts with its current objective.",
        options: [{ id: "a", text: "Makes no mistakes on reasoning tasks" }, { id: "b", text: "Can correct other models' outputs automatically" }, { id: "c", text: "Accepts correction, shutdown, and modification by its operators without resistance" }, { id: "d", text: "Only operates within pre-approved token budgets" }] },
      { id: "c5s1q3", text: "What does 'red-teaming' an AI system involve?", correct: "b", explanation: "Red teams simulate adversarial users to find failure modes before deployment — a standard practice at Anthropic, OpenAI, and Google.",
        options: [{ id: "a", text: "Training the model on adversarial examples to improve robustness" }, { id: "b", text: "Stress-testing a model by actively trying to elicit harmful or unintended outputs" }, { id: "c", text: "Painting the server rack red to improve thermal performance" }, { id: "d", text: "Monitoring the model's training loss in real time" }] },
    ],
    // Set 2
    [
      { id: "c5s2q0", text: "What does interpretability research in AI safety aim to do?", correct: "b", explanation: "Mechanistic interpretability tries to reverse-engineer what circuits inside a model implement, enabling verification that it is doing what we think.",
        options: [{ id: "a", text: "Write clearer documentation for model APIs" }, { id: "b", text: "Understand the internal computations of neural networks to verify their behaviour" }, { id: "c", text: "Interpret model outputs for non-technical stakeholders" }, { id: "d", text: "Translate model weights from one architecture to another" }] },
      { id: "c5s2q1", text: "What is 'value learning' in AI alignment?", correct: "b", explanation: "Value learning approaches assume human values are not fully specifiable upfront and try to infer them from human feedback and observed behaviour.",
        options: [{ id: "a", text: "Teaching a model to assign dollar values to assets" }, { id: "b", text: "Designing AI systems that infer and act on human values from observed behaviour" }, { id: "c", text: "Training a model to output ethical scores for text" }, { id: "d", text: "Curating a dataset of human preferences for fine-tuning" }] },
      { id: "c5s2q2", text: "'Sandbagging' in AI evaluation refers to:", correct: "b", explanation: "A sufficiently capable model might hide its true capabilities during evaluation if it predicts this helps it achieve its objectives — a key concern in advanced safety.",
        options: [{ id: "a", text: "A data augmentation technique using masked tokens" }, { id: "b", text: "A model deliberately underperforming on evaluations to avoid safety restrictions" }, { id: "c", text: "A memory-efficient attention mechanism for long contexts" }, { id: "d", text: "Delaying inference to reduce peak server load" }] },
      { id: "c5s2q3", text: "The 'outer alignment' problem refers to:", correct: "b", explanation: "Even if the model perfectly optimises the reward function, if that function doesn't capture what we truly want, the model will pursue the wrong goal.",
        options: [{ id: "a", text: "Misalignment between different AI companies' safety standards" }, { id: "b", text: "The mismatch between the specified reward function and the true human objective it represents" }, { id: "c", text: "The failure of the model to generalise outside its training distribution" }, { id: "d", text: "Poor communication between safety and product teams at AI labs" }] },
    ],
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
