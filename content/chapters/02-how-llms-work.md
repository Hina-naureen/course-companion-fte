# Chapter 2: How Large Language Models Work

> **Level:** Beginner | **Estimated time:** 20 minutes | **Tier:** Free

---

## Learning Objectives

By the end of this chapter, you will be able to:

- Explain what a token is and why LLMs use them instead of words or characters
- Describe how embeddings represent meaning as numbers
- Explain the attention mechanism in plain language — what it does and why it matters
- Describe the three-stage training process: pre-training, fine-tuning, and RLHF
- Identify the key limitations that follow directly from how LLMs are built

---

## Explanation

### The Big Picture: What Is an LLM Actually Doing?

Before diving into mechanics, here is the one sentence that explains large language models:

> **An LLM is a system that predicts the most likely next token given all the tokens that came before.**

That's it. Everything else — the coherent arguments, the working code, the nuanced analysis — emerges from this one operation applied billions of times, at enormous scale, on an enormous amount of human-generated text.

Understanding *how* it does this prediction is what this chapter covers.

---

### Step 1: Tokenisation — Breaking Text into Pieces

Before an LLM can process text, it must convert it into a form computers can work with: numbers. The first step is **tokenisation** — splitting text into chunks called **tokens**.

Tokens are not words. They are sub-word units, typically 2–6 characters long. Here's why:

**Why not use characters?**
Too granular. "Unbelievable" as individual characters is 12 separate units. The model would need to learn that u-n-b-e-l-i-e-v-a-b-l-e forms a meaningful word — an inefficient use of its capacity.

**Why not use whole words?**
The vocabulary would be unmanageable. English alone has over 170,000 words — plus names, technical terms, code, and every language on earth. Storing and computing over a vocabulary this large is impractical.

**The solution: sub-word tokenisation**
Common words become single tokens. Rare or compound words are split into recognisable parts.

```
"Unbelievable" → ["Un", "bel", "iev", "able"]       (4 tokens)
"cat"          → ["cat"]                              (1 token)
"tokenisation" → ["token", "isation"]                 (2 tokens)
"ChatGPT"      → ["Chat", "G", "PT"]                  (3 tokens)
```

**Token counts matter for three reasons:**

1. **Context window limits** — models can only process a fixed number of tokens at once (e.g., 200,000 tokens for Claude 3.5 Sonnet). Longer documents must be chunked or summarised.
2. **Pricing** — AI APIs charge per token. A typical page of text is roughly 500–700 tokens.
3. **Reasoning depth** — complex reasoning tasks use more tokens, which means more cost and latency.

A rough rule of thumb: **1 token ≈ 4 characters ≈ ¾ of a word**. So 1,000 tokens ≈ 750 words.

---

### Step 2: Embeddings — Meaning as Numbers

Once text is tokenised, each token must be converted into a number the model can compute with. This is done via **embeddings** — vectors (lists of numbers) where **similar meanings produce similar vectors**.

Think of an embedding as coordinates in a high-dimensional space. In a well-trained embedding space:

- "king" and "queen" are close together
- "cat" and "dog" are close together
- "cat" and "democracy" are far apart
- "king" − "man" + "woman" ≈ "queen" (the famous example)

This mathematical representation of meaning is not hand-coded by humans. It **emerges from training** — the model learns to place tokens near other tokens that appear in similar contexts across billions of sentences.

**Why this matters:**

A keyword search for "automobile" won't find a document about "car" — they're different strings. But in embedding space, "automobile" and "car" are nearly identical vectors, because they appear in the same contexts. This is why semantic search (vector search) dramatically outperforms keyword search for natural language.

The embedding layer is where meaning enters the model. Everything the model does afterward — attention, reasoning, generation — operates on these numerical representations of meaning.

---

### Step 3: The Transformer — Attention Is All You Need

The architecture that powers every major LLM is called the **Transformer**, introduced by Google in 2017 in a paper titled "Attention Is All You Need." The key innovation: **the attention mechanism**.

**The problem attention solves:**

Consider the sentence: *"The animal didn't cross the street because it was too tired."*

What does "it" refer to? The animal, not the street. You know this because "tired" connects semantically to "animal," not to "street." You resolved the ambiguity by attending to the right word in context.

Earlier AI systems (RNNs, LSTMs) processed text left-to-right, like reading one word at a time. By the time they reached "it," the context of "animal" had partly faded. The Transformer solves this by allowing every token to "look at" every other token simultaneously.

**How attention works (plain language):**

For each token in the sequence, the model asks: *"How relevant is every other token in this sentence to my current meaning?"*

It computes a relevance score between every pair of tokens. These scores determine how much each token's meaning should be influenced by every other token. The result: each token's representation is updated based on what it attended to.

In practice:
- Processing "bank" in "river bank" → high attention to "river"
- Processing "bank" in "bank account" → high attention to "account"
- Same word, different context, different attention pattern, different meaning captured

**Multi-head attention:**

The model runs this attention process many times in parallel (each "head"), allowing it to simultaneously track:
- Grammatical relationships (subject → verb)
- Semantic relationships (noun → descriptor)
- Long-range dependencies (pronoun → antecedent)

This parallelism is what allows Transformers to handle extremely long contexts with high coherence.

---

### Step 4: Training — Where the Model Learns

Training an LLM happens in three stages.

**Stage 1: Pre-training**

The model is exposed to an enormous corpus of text — hundreds of billions of words from books, websites, academic papers, code repositories, conversations, and more.

The training objective is simple: **predict the next token**. Given the tokens "The capital of France is", predict "Paris."

The model starts with random weights and makes terrible predictions. A loss function measures how wrong each prediction is. Gradients propagate backwards through the network, adjusting billions of parameters incrementally to make better predictions next time.

This process runs for weeks or months on thousands of specialised AI chips (GPUs/TPUs). The compute cost for training a frontier model is estimated at $50–100 million or more.

What emerges from this process: a model that has compressed the patterns, facts, reasoning structures, and linguistic conventions of human knowledge into its parameters.

**Stage 2: Supervised Fine-Tuning (SFT)**

The pre-trained model knows how to complete text — but that's not the same as being helpful or safe. In SFT, human contractors write thousands of examples of ideal conversations: questions followed by high-quality answers.

The model is trained on these examples to learn the format and style of helpful, accurate responses. This is where "be helpful, honest, and harmless" gets encoded into behaviour.

**Stage 3: Reinforcement Learning from Human Feedback (RLHF)**

SFT teaches the model *one* good response. RLHF teaches the model to *rank* and *prefer* better responses over worse ones.

Human raters compare pairs of model outputs and label which is better. A **reward model** is trained on these preferences. The LLM is then trained using reinforcement learning to maximise the reward model's score — essentially learning to produce outputs that humans prefer.

RLHF is responsible for much of what makes modern LLMs feel qualitatively different from earlier models: they are more helpful, more honest, more appropriately cautious, and better at following complex instructions.

---

### Step 5: Inference — How the Model Generates Text

Once trained, the model generates text through a process called **autoregressive inference**:

```
Prompt: "Explain photosynthesis in simple terms."

Step 1: Tokenise prompt → [token_1, token_2, ..., token_N]
Step 2: Run through Transformer → probability distribution over all tokens
Step 3: Sample next token → "Photo"
Step 4: Append to sequence → [token_1, ..., token_N, "Photo"]
Step 5: Repeat from step 2 → "synthesis"
...continue until end token or max_tokens reached
```

The model generates **one token at a time**, each time considering the full sequence of everything generated so far.

**The temperature parameter:**

When sampling the next token from the probability distribution, **temperature** controls randomness:

- **Temperature = 0**: Always pick the highest-probability token. Deterministic, predictable, no creativity.
- **Temperature = 0.7**: Sample from the distribution with some randomness. Coherent but varied.
- **Temperature = 1.0+**: More randomness — creative but can drift into incoherence.

For factual tasks (data extraction, code generation), use low temperature. For creative tasks (brainstorming, writing), use higher temperature.

---

### What LLMs Know and Don't Know

Understanding LLM capabilities starts with understanding the nature of what they learned:

**What LLMs are good at:**
- Synthesising, summarising, and restructuring information
- Generating fluent, well-structured text in any style or format
- Writing, explaining, and debugging code
- Reasoning through multi-step problems
- Translation and cross-lingual understanding
- Pattern recognition in complex text

**What LLMs are not:**
- Databases — they don't store or retrieve facts reliably
- Calculators — arithmetic is approximate and error-prone
- Browsers — they don't have real-time access to current information
- Fact-checkers — they have no internal mechanism to verify claims

**Key limitations:**

| Limitation | Why it exists | Implication |
|------------|---------------|-------------|
| **Training cutoff** | Pre-training data has an end date | Model doesn't know about recent events |
| **Hallucinations** | Plausible-next-token ≠ accurate | Always verify factual claims |
| **Context window** | Finite attention span | Very long documents require chunking |
| **No persistent memory** | Each conversation starts fresh | Prior conversations aren't remembered |
| **Math errors** | Arithmetic via token patterns, not computation | Use code execution for reliable maths |

---

## Real-World Examples

### Example 1: Why Autocomplete Is Surprisingly Hard

Your phone's keyboard predicts the next word — so why is it far less impressive than ChatGPT?

Scale. Your phone's model is trained on your messages and a small corpus, with perhaps millions of parameters. GPT-4 has approximately 1.8 trillion parameters, trained on trillions of tokens. The qualitative leap in capability is almost entirely a function of scale — more data, more compute, more parameters.

This is the central empirical finding of modern AI: **capability scales predictably with compute**. Bigger models trained on more data consistently perform better, across almost every task measured.

---

### Example 2: The "Bank" Ambiguity Test

Ask any LLM: *"I went to the bank. Was I fishing or withdrawing money?"*

The model will correctly tell you it can't know — and will explain why "bank" is ambiguous without more context. This works because the attention mechanism, trained on billions of examples, has learned that "bank" occurs in both financial and geographic contexts and that additional context words (river, fish, withdrawal, teller) disambiguate it.

Ask a keyword-based system the same question and it has no mechanism for this — it sees "bank" and stops there.

---

### Example 3: Code Generation — Why It Works So Well

GitHub reports that Copilot now generates the majority of code in some repositories. Why are LLMs so good at code when they're just "predicting the next token"?

Because code is the most regular, pattern-dense text that humans produce. Every function declaration has predictable structure. Common patterns (null checks, error handling, loops) appear millions of times across training data. The model has seen so many variations of `calculate_monthly_churn` that it can complete your function from the name alone.

Code is also self-verifying: you can run it. This makes code generation one of the highest-value LLM applications, because incorrect outputs are quickly identified and corrected.

---

### Example 4: Context Window — Why It Matters for You

Claude's 200,000-token context window can hold approximately 150,000 words — about the length of *Harry Potter and the Goblet of Fire*.

What this enables:
- Analysing an entire codebase in one prompt
- Reviewing a full research paper and asking detailed questions about specific sections
- Maintaining a long, coherent conversation without context loss
- Processing hour-long transcripts

What falls outside even this window:
- Entire document libraries (use RAG for this)
- Long-term memory across separate sessions (use a database)

Understanding context limits explains why customer support bots sometimes seem to "forget" earlier parts of a long conversation — older messages fall outside the context window.

---

### Example 5: RLHF in Action — Why Claude Declines Certain Requests

When Claude declines to help with harmful tasks, that's RLHF working as designed. During training, human raters consistently rated responses that refused harmful requests higher than those that complied.

The reward model learned this preference. The LLM then optimised to produce responses that score highly on the reward model — meaning refusals on harmful requests became preferred behaviour.

This is also why different models have different refusal thresholds: they were trained with human raters operating under different guidelines and preference schemes.

---

## Key Takeaways

1. **LLMs predict the next token, one at a time.** Everything — coherent essays, working code, nuanced analysis — emerges from this single operation applied at scale.

2. **Tokens are sub-word units, not words.** The model processes roughly ¾ of a word per token. Understanding token counts matters for context limits and pricing.

3. **Embeddings encode meaning as numbers.** Similar concepts cluster together in embedding space — enabling semantic understanding and semantic search.

4. **Attention lets every token see every other token.** This is what allows LLMs to resolve ambiguity, track long-range dependencies, and maintain coherence across long texts.

5. **Three training stages produce capable, safe models.** Pre-training builds knowledge. SFT instils format. RLHF aligns the model's preferences with human preferences.

6. **LLMs are pattern engines, not databases.** They're exceptional at language tasks, poor at precise recall of facts. Verify anything factual before acting on it.

---

## ❓ Self-Check Questions

1. A colleague claims that LLMs "look up" answers from a database of facts they memorised during training. Based on what you've learned, what's the more accurate description of what the model is doing?

2. You're building a document analysis tool and your documents average 50,000 words each. What technical limitation do you immediately need to account for, and what's the standard solution?

3. A language model is asked to complete: "The surgeon walked into the operating theatre. She prepared her instruments." Why can it correctly associate "She" with "surgeon" — and why was this difficult for earlier AI systems?

---

**← Previous:** [Chapter 1: What is Generative AI?](01-what-is-generative-ai.md) | **Next →** [Chapter 3: Prompt Engineering](03-prompt-engineering.md)
