# Course Companion FTE — Cost Analysis

**Hackathon IV — Panaversity Agent Factory**
**Date: March 2026 | Version: 1.0**

---

## Executive Summary

Course Companion FTE operates on a **near-zero infrastructure cost** during Phase 1 (Zero-Backend-LLM) because the heavy lifting is done by ChatGPT's existing infrastructure. Phase 2 and 3 introduce Claude API and hosting costs that remain well within a sustainable freemium SaaS model.

**Total estimated monthly cost at launch: $12–40/month**
**Break-even: 2 Pro subscribers ($9.99/month each)**

---

## Phase 1 Cost Breakdown

### Infrastructure

| Service | Plan | Monthly Cost | Notes |
|---|---|---|---|
| **PostgreSQL (Neon)** | Free tier | $0 | 0.5 GB, 1 compute unit |
| **FastAPI Backend (Railway)** | Hobby | $5 | 512 MB RAM, shared CPU |
| **Next.js Frontend (Vercel)** | Hobby | $0 | 100 GB bandwidth |
| **Domain (.com)** | Namecheap | $1/mo | Annualized at $12/yr |
| **Total Phase 1** | | **$6–7/month** | |

### LLM Costs in Phase 1

**$0.00** — The backend makes zero LLM API calls in Phase 1. All intelligence is in the ChatGPT Custom GPT which users access through their own ChatGPT Plus subscription ($20/month) or ChatGPT Team. **We pay nothing for the LLM layer in Phase 1.**

---

## Phase 2 Cost Breakdown (Hybrid Intelligence)

### Claude API — Skills Layer

Claude claude-sonnet-4-6 pricing (as of March 2026):
- Input: $3.00 per million tokens
- Output: $15.00 per million tokens

#### Per-skill token estimates

| Skill | Avg Input Tokens | Avg Output Tokens | Cost per Call |
|---|---|---|---|
| `explain_concept` | 800 | 600 | $0.0033 |
| `adaptive_hint` | 600 | 300 | $0.0027 |
| `generate_quiz` | 1,200 | 800 | $0.0156 |
| `semantic_search` | 1,000 | 400 | $0.0090 |

#### Monthly projection by user count

| Users | Avg AI calls/user/day | Monthly AI calls | Claude API Cost |
|---|---|---|---|
| 100 (free) | 3 (capped at 5) | 9,000 | $25 |
| 100 (free) + 10 (pro) | free: 3, pro: 20 | 15,000 | $42 |
| 500 (free) + 50 (pro) | same ratios | 75,000 | $210 |

**Free tier cap (5 AI explains/day) protects against cost overruns.**

---

## Phase 3 Additional Costs (AI Tutor — Multi-Provider Fallback)

The AI tutor `/ai/tutor` uses a fallback chain to minimize costs:

| Provider | Model | Cost per 1K tokens | Priority |
|---|---|---|---|
| **Gemini Flash** | gemini-2.0-flash | ~$0.00015 | 1st (cheapest) |
| **OpenRouter** | llama-3.1-8b (free tier) | $0.00000 | 2nd (free) |
| **OpenAI** | gpt-4o-mini | $0.00015 | 3rd |
| **Claude** | claude-haiku-4-5 | $0.00025 | Last resort |

**Effective cost per AI tutor conversation (5 exchanges): ~$0.001–0.003**

### OpenAI TTS (voice output)

- TTS-1 pricing: $0.015 per 1,000 characters
- Average AI response: 300 characters
- Cost per voice response: **$0.0045**
- 1,000 voice responses/day: **$4.50/day = $135/month**

**Mitigation:** TTS is only generated when explicitly requested. Web Speech API browser-native TTS is used as a free fallback when the premium voice is not triggered.

---

## Full Monthly Cost Summary

### Startup Phase (0–100 users)

| Cost Item | Monthly |
|---|---|
| Infrastructure (Railway + Neon) | $5 |
| Domain + SSL | $1 |
| Claude API (skills, ~5K calls) | $15 |
| AI Tutor (Gemini/OpenRouter, ~2K calls) | $2 |
| TTS (500 uses, partially browser fallback) | $3 |
| **Total** | **~$26/month** |

### Growth Phase (100 free + 20 pro users)

| Cost Item | Monthly |
|---|---|
| Infrastructure (upgrade to standard) | $15 |
| Claude API (skills, ~20K calls) | $55 |
| AI Tutor (~8K calls) | $8 |
| TTS (~2K premium uses) | $9 |
| Stripe fees (20 × $9.99 × 2.9% + $0.30) | $12 |
| **Total** | **~$99/month** |
| **Revenue** (20 × $9.99) | **$200/month** |
| **Net margin** | **+$101/month** |

---

## Freemium Tier Cost Protection

The following rate limits prevent cost spirals:

| Limit | Free Tier | Protection |
|---|---|---|
| AI explains/day | 5 | Claude API capped at 5 calls/user/day |
| Quiz attempts/day | 3 | Prevents gaming the grader |
| Searches/day | 10 | pg_tsvector is cheap; just prevents abuse |
| Chapters | 1–3 only | Premium content behind Pro paywall |

**At 1,000 free users × 5 AI calls/day = 5,000 calls/day = ~$16/day**
This extreme scenario triggers only at meaningful scale, and at that point Pro revenue would far exceed AI costs.

---

## Competitor Cost Comparison

| Platform | Monthly Cost | Our Equivalent |
|---|---|---|
| Coursera | $59/month | Our Pro: $9.99/month |
| Pluralsight | $29/month | Our Pro: $9.99/month |
| ChatGPT Plus alone | $20/month | Our Free: $0 |

**Course Companion FTE is 3–6× cheaper than competitors** and includes an interactive AI tutor.

---

## 12-Month Cost Projection

| Month | Free Users | Pro Users | Revenue | Costs | Net |
|---|---|---|---|---|---|
| 1 | 50 | 0 | $0 | $26 | -$26 |
| 2 | 100 | 5 | $50 | $30 | +$20 |
| 3 | 200 | 15 | $150 | $50 | +$100 |
| 6 | 500 | 40 | $400 | $120 | +$280 |
| 12 | 1,000 | 100 | $999 | $280 | +$719 |

**Break-even: Month 2 (5 Pro subscribers)**

---

## Key Cost Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Claude API price increase | Low | OpenRouter free fallback available |
| TTS cost overrun | Medium | Browser Web Speech API as free fallback |
| DB cost spike | Low | pg_tsvector is efficient; Neon scales gradually |
| Abuse of free AI tier | Medium | Rate limits in DB + 429 responses |
| OpenRouter free tier limits | Medium | Gemini Flash as primary (very cheap) |

---

## Conclusion

Course Companion FTE achieves **break-even with just 3 Pro subscribers** ($29.97/month covers $26/month costs). The Zero-Backend-LLM Phase 1 architecture is the key advantage — we pay $0 in LLM costs during Phase 1 while delivering a full conversational learning experience through ChatGPT's infrastructure.

The multi-provider AI fallback chain ensures we always choose the cheapest available provider, with Gemini Flash and OpenRouter's free Llama 3.1 handling the vast majority of AI tutor calls.
