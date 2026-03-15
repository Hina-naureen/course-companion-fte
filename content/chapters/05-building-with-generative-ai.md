# Chapter 5: Building with Generative AI

> **Level:** Beginner | **Estimated time:** 25 minutes | **Tier:** Free

---

## Learning Objectives

By the end of this chapter, you will be able to:

- Explain what an AI API is and describe the three things you send in a request
- Describe how RAG (Retrieval-Augmented Generation) solves the limitations of base LLMs
- Distinguish between AI chatbots and AI agents, and identify when to use each
- Use a decision framework to choose between API-only, RAG, fine-tuning, and agent approaches

---

## Explanation

### From User to Builder

The first four chapters taught you *what* generative AI is, *how* it works under the hood, *how to prompt* it effectively, and *how to use it responsibly*. This chapter answers the next natural question: **how do you build something with it?**

You don't need to train your own model. You don't need a PhD in machine learning. The modern AI ecosystem is designed so that developers — and even technical non-developers — can build powerful AI-powered products using existing models through APIs, pre-built tools, and a handful of design patterns.

This chapter covers the five foundational building blocks of AI applications, then shows how they fit together in a real production architecture.

---

### Building Block 1: The API — Your Connection to the Model

An **API (Application Programming Interface)** is how your code communicates with an AI model running on someone else's servers. Instead of running the model yourself — which requires expensive GPU hardware and significant infrastructure — you send a request over the internet and receive a response in milliseconds.

**The analogy:** Think of it like ordering from a restaurant. You don't need to own a kitchen or know how to cook. You send an order (your request), the kitchen prepares it (the model runs), and you receive the meal (the response). You pay per order, not for the kitchen.

**What you send in an API request:**

| Parameter | What it does | Example |
|-----------|-------------|---------|
| `system` | Sets the AI's persistent role and behaviour for the session | `"You are a helpful customer support agent for Acme Inc."` |
| `messages` | The conversation history — alternating user/assistant turns | `[{"role": "user", "content": "How do I reset my password?"}]` |
| `model` | Which model to use | `"claude-sonnet-4-6"` |
| `max_tokens` | Maximum response length | `1024` |
| `temperature` | Controls creativity (0 = deterministic, 1 = creative) | `0.7` |

**What you receive:**

A response object containing the generated text, the number of tokens used (for billing), and metadata. If you use streaming, tokens arrive word by word as they're generated.

**A real API call — Python:**

```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system="You are a helpful course tutor for Generative AI Fundamentals.",
    messages=[
        {"role": "user", "content": "Explain what a transformer is in simple terms."}
    ]
)

print(message.content[0].text)
# Output: "A transformer is a type of neural network architecture
# that processes text by allowing every word to 'look at' every
# other word simultaneously, rather than reading left to right..."
```

**Pricing model:** You pay per token — both input tokens (your prompt) and output tokens (the model's response). Claude Sonnet costs approximately $3 per million input tokens and $15 per million output tokens. A typical explanation response of 300 words costs about $0.005.

---

### Building Block 2: RAG — Giving the Model Your Knowledge

Out of the box, an LLM has two fundamental limitations:

1. **Training cutoff:** It doesn't know about events after its training data was collected
2. **Context window:** It can't read your entire knowledge base — only what fits in the prompt

**Retrieval-Augmented Generation (RAG)** solves both by retrieving relevant documents at query time and injecting them into the prompt.

**How RAG works — step by step:**

```
Step 1: Chunk your documents
  → Split your knowledge base (PDFs, docs, web pages) into
    overlapping chunks of ~500 tokens each

Step 2: Embed the chunks
  → Convert each chunk into a vector (a list of numbers)
    using an embedding model. Similar content → similar vectors.

Step 3: Store in a vector database
  → Save all vectors + their source text in a searchable
    store (pgvector, Pinecone, Weaviate, Chroma)

Step 4: At query time — retrieve
  → Convert the user's question into a vector
  → Find the top-K most similar chunks using vector search
  → Inject those chunks into the prompt as context

Step 5: Generate with context
  → The LLM now answers with your specific documents in view
  → "According to your Q3 report, revenue increased by 23%..."
```

**Why semantic search beats keyword search:**

A keyword search for "car" won't find a document about "automobile." A semantic (vector) search will, because "car" and "automobile" are close in embedding space — they appear in similar contexts across training data. This makes RAG robust to paraphrasing and synonyms.

**Real-world example: Customer Support Bot**

A SaaS company has 500 help articles and a product changelog. They build a RAG system where:
- All help articles are chunked and embedded
- A user asks: "Why can't I export to CSV?"
- The system finds the 3 most relevant help article chunks
- The LLM answers: "CSV export is available on Pro plans. Go to Settings → Export → CSV. If you see a lock icon, you'll need to upgrade."

The LLM never "knew" the product — it read the relevant article at query time. The answer is grounded, specific, and accurate.

**When to use RAG:**
- Answering questions about your specific documents, products, or data
- Building knowledge bases, customer support bots, internal search tools
- Any use case where accuracy and grounding in real sources matter

---

### Building Block 3: AI Agents — From Answering to Acting

A standard LLM responds to one message and stops. An **AI agent** can take actions, observe the results, and decide what to do next — operating in a loop until a goal is achieved.

**The agent loop:**

```
Goal received
     ↓
 [Think] — What's the best next action?
     ↓
 [Act]   — Use a tool (search, code, API call, file write)
     ↓
 [Observe] — What was the result?
     ↓
 Repeat until goal is complete
```

**Types of tools agents use:**

| Tool | What it does |
|------|-------------|
| Web search | Fetches current information from the internet |
| Code execution | Writes and runs Python/JavaScript to compute answers |
| File I/O | Reads and writes files, parses PDFs, processes CSVs |
| API calls | Interacts with external services (Slack, GitHub, Salesforce) |
| Database queries | Runs SQL or vector search against stored data |

**A real example: GitHub Copilot Workspace**

A developer opens a bug report: "Users get a 500 error when uploading files larger than 10MB."

The agent:
1. Reads the bug report
2. Searches the codebase for the file upload handler
3. Identifies a missing file size validation
4. Writes the fix
5. Runs the existing test suite
6. Sees a test failure — one test expected the old (broken) behaviour
7. Updates the test
8. Opens a pull request with a description explaining the change

A human reviewed and merged it in 3 minutes. The agent did 20 minutes of work.

**Multi-agent systems:**

Complex tasks can be split across specialised agents:
- **Orchestrator agent:** Receives the goal, breaks it into sub-tasks, delegates
- **Research agent:** Searches the web and summarises findings
- **Writer agent:** Drafts the output
- **Reviewer agent:** Checks for errors, consistency, or policy violations

**Current limitations of agents:**
- **Reliability:** Long agent runs can make errors that compound
- **Cost:** Multi-step loops with large contexts use many tokens
- **Latency:** Each tool call adds seconds to the response time
- **Unpredictability:** Agents can take unexpected paths

Agents are powerful for well-defined, automatable workflows. They are not yet reliable enough for high-stakes, low-tolerance-for-error tasks without human oversight checkpoints.

---

### Building Block 4: Fine-Tuning — Teaching the Model New Tricks

**Fine-tuning** means taking a pre-trained model and continuing its training on your specific data to adjust its style, tone, or format.

**The decision framework — when to use what:**

| Approach | Use when | Not suitable for |
|----------|----------|-----------------|
| **Prompt engineering** | Changing output style or behaviour | You've already exhausted prompt options |
| **RAG** | Answering questions about specific documents | Learning a communication style |
| **Fine-tuning** | Consistent style, domain vocabulary, format | Injecting factual knowledge reliably |
| **Full training** | Entirely new capabilities | Almost everything — enormously expensive |

**The three scenarios where fine-tuning actually helps:**

1. **Style consistency:** You want the model to always respond in a specific brand voice, tone, or format — and prompt instructions aren't consistent enough
2. **Domain terminology:** You need the model to correctly use specialised vocabulary (legal, medical, financial jargon) without extensive prompting
3. **Format enforcement:** You need the model to reliably produce a very specific output structure (e.g., always output valid XML with your schema)

**What fine-tuning does NOT reliably do:**

Fine-tuning does not inject reliable factual knowledge. If you fine-tune a model on your company's documentation, it will learn to *sound like* your documentation — it won't reliably cite facts from it. For factual grounding, use RAG.

Think of it this way: you can teach a person to write in a British legal style (fine-tuning), but that doesn't mean they've memorised the entire British legal code (use RAG for that).

---

### Building Block 5: Streaming — The UX Difference

**Streaming** means sending tokens to the user as they're generated, rather than waiting for the complete response.

Without streaming:
```
User asks question → 6 seconds of loading spinner → Full response appears
```

With streaming:
```
User asks question → First words appear in ~200ms → Text flows in naturally
```

The actual computation time is identical. But the perceived latency is dramatically lower — users see progress immediately, which feels faster and more engaging. This is why ChatGPT, Claude, and every major AI chat product uses streaming.

**How streaming works technically:**

The model generates tokens one by one. With streaming enabled, each token is sent to the client via **Server-Sent Events (SSE)** — a lightweight HTTP mechanism for one-way, real-time data flow from server to browser.

```python
# Streaming example with Anthropic SDK
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain RAG in detail."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)  # Prints each token as it arrives
```

**When NOT to stream:**

- Batch processing jobs (you don't need a user interface)
- Structured data extraction (you want the complete JSON before parsing)
- Background jobs where latency doesn't matter

---

### Putting It Together: A Reference Architecture

Here is the full stack of a production AI-powered learning application — the exact architecture used by Course Companion FTE:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  Next.js 15 (App Router, TypeScript, Tailwind CSS)      │
│  React Query for server state · Zustand for auth state  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS + Bearer JWT
┌──────────────────────▼──────────────────────────────────┐
│                    API Gateway                           │
│  FastAPI (Python 3.12, async) · JWT Auth Middleware      │
│  CORS · Rate Limiting (DB-backed counters)               │
│  /api/v1/auth  /chapters  /quiz  /progress  /search      │
│  /api/v1/skills  ← mounted only if ANTHROPIC_API_KEY set │
└──────┬──────────────────────────────────┬───────────────┘
       │                                  │
┌──────▼──────────┐              ┌────────▼────────┐
│  PostgreSQL 16  │              │  Anthropic API  │
│  users          │              │  claude-sonnet  │
│  chapters       │              │  -4-6           │
│  quizzes        │              │  Streaming SSE  │
│  progress       │              └─────────────────┘
│  search_log     │
│  pg_tsvector    │       ┌─────────────────────┐
│  (full-text)    │       │  Cloudflare R2      │
└─────────────────┘       │  Chapter .md files  │
                          │  Quiz .json files   │
                          │  Media assets       │
                          │  Zero egress fees   │
                          └─────────────────────┘
```

**What each layer does:**

- **Next.js frontend** — Renders pages, handles auth tokens in localStorage, calls the FastAPI backend
- **FastAPI backend** — Pure data API in Phase 1 (zero LLM calls). Mounts the skills router only when the Anthropic API key is present.
- **PostgreSQL** — All operational data. `pg_tsvector` index handles keyword search without a separate search service.
- **Cloudflare R2** — Chapter content and assets. S3-compatible, no egress fees, global CDN.
- **Anthropic API** — Called only from the skills layer. Graceful degradation: if unavailable, static fallbacks serve instead.

---

### The Decision Matrix: Which Approach to Use?

```
                    LOW data specificity
                           │
          Prompt           │         Prompt
          Engineering      │         + RAG
                           │
  ─────────────────────────┼─────────────────────────
  LOW task                 │                HIGH task
  complexity               │                complexity
                           │
          Fine-tuning      │         Agents
          + Prompt         │         + RAG
                           │
                    HIGH data specificity
```

**Read it like this:**

| Situation | Recommended approach |
|-----------|---------------------|
| Simple task, general knowledge | Prompt engineering only |
| Simple task, your specific documents | Prompt + RAG |
| Complex task, general knowledge | Agents (or fine-tune for style) |
| Complex task, your specific documents | Agents + RAG |

---

## Real-World Examples

### Example 1: Customer Support Bot with RAG

**Problem:** An e-commerce company wants to automate 60% of support tickets.

**Architecture:** All help articles are chunked and embedded into pgvector. A RAG pipeline retrieves the 3 most relevant articles per question. GPT-4o generates the response, citing the article it used.

**Result:** 63% of tickets resolved without human intervention. Average handle time for escalated tickets reduced from 8 minutes to 3 minutes (agent sees AI's draft response as a starting point).

---

### Example 2: Coding Assistant

**Problem:** A developer wants AI-powered autocomplete trained on their company's internal coding standards.

**Architecture:** Fine-tuning on the company's codebase (for style and internal library usage) + real-time code context injected into the prompt (for suggestions relevant to the current file).

**Key insight:** Fine-tuning handles the style ("always use our internal `httpClient` not `requests`"). The current file context handles the specific suggestion.

---

### Example 3: Content Moderation Agent

**Problem:** A social platform needs to review 50,000 posts per day for policy violations.

**Architecture:** An LLM classifier rates each post (0–1 probability of violation per policy category). Posts above a threshold go to a human review queue. Posts below go through automatically. An agent writes a brief explanation of the decision for human reviewers.

**Result:** Human reviewers focus on genuinely ambiguous cases. Clear violations and clear passes are handled automatically, at 10× the speed of a human-only system.

---

### Example 4: Personalised AI Tutor

**Problem:** An edtech platform wants an AI tutor that adapts to each student's level and weak spots.

**Architecture:**
- Student progress stored in PostgreSQL (quiz scores, chapter completion)
- RAG over course materials for concept explanations grounded in course content
- An orchestrator that selects between three modes: explain (concept-explainer skill), quiz (quiz-master skill), or guide (socratic-tutor skill) based on context
- Streaming for all LLM responses

**Result:** This is the exact architecture of Course Companion FTE.

---

## Key Takeaways

1. **The API is the foundation.** Everything is built on sending structured requests to AI models. Understanding what goes into a request — system prompt, messages, temperature, max tokens — gives you control over the output.

2. **RAG solves LLM's core limitations.** Training cutoff and context window limits are structural. RAG bypasses both by retrieving your documents at query time and grounding answers in real sources.

3. **Agents loop, chatbots respond.** An agent can take multi-step actions using tools — search, code execution, API calls. This unlocks automation of complex workflows, but requires oversight because errors compound.

4. **Fine-tune for style, use RAG for facts.** Fine-tuning teaches the model *how* to communicate. It does not reliably inject factual knowledge. Use RAG when accuracy to specific documents matters.

5. **Streaming is a UX decision, not a capability one.** It doesn't change what the model says — it changes how quickly users start seeing it. In user-facing products, stream by default.

---

## ❓ Self-Check Questions

1. A startup wants their support AI to answer questions accurately about their specific product. They're choosing between fine-tuning the model on their docs and building a RAG system. Which would you recommend, and why?

2. Describe the four steps of the agent loop. At which step does a mistake have the highest potential to compound?

3. You're building a customer-facing chat feature. Without changing any model parameters, what's the single UX improvement that would make the biggest difference to how users perceive response speed?

---

**← Previous:** [Chapter 4: AI Ethics and Responsible Use](04-ai-ethics-and-responsible-use.md) | **Course Complete! 🎉**

---

*You've completed the Generative AI Fundamentals course. You now understand what generative AI is, how LLMs work, how to write effective prompts, how to use AI responsibly, and how to build real products with it. Most people who use these tools every day don't understand what you now understand.*
