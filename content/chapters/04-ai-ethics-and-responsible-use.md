# Chapter 4: AI Ethics and Responsible Use

> **Level:** Beginner | **Estimated time:** 20 minutes | **Tier:** Free

---

## Learning Objectives

By the end of this chapter, you will be able to:

- Explain the five core ethical challenges of generative AI: hallucinations, bias, privacy, copyright, and misuse
- Identify real-world cases where AI caused harm and describe what went wrong
- Apply the Responsible AI Framework to evaluate an AI use case
- List practical rules for using AI tools responsibly in professional contexts

---

## Explanation

### Why Ethics Matters in AI

Generative AI is one of the most powerful tools ever created. Like electricity, the internet, or pharmaceuticals, it can be used to help people or to harm them. The difference is rarely the technology itself — it's **how it's designed and used**.

A hammer can build a house or break a window. The ethics are not in the hammer. They're in the hands holding it, the intentions behind it, and the systems that govern its use.

This chapter covers five ethical challenges that every user of generative AI must understand — not because they make AI dangerous, but because understanding them makes you a responsible and effective user.

---

### Challenge 1: Hallucinations — When AI Confidently Gets It Wrong

One of the most important things to understand about large language models is that **they can be wrong with complete confidence**.

This is called a **hallucination** — when the model generates text that sounds fluent and authoritative but is factually incorrect. The term comes from psychology (perceiving something that isn't there), and it's apt: the AI isn't lying, it's confabulating.

**Why does this happen?**

LLMs don't "know" facts the way you know your own name. They generate statistically likely continuations of text. When asked about something they have sparse or conflicting training data on, they produce plausible-sounding content that may be entirely invented.

The model has no internal fact-checker. It cannot distinguish between what it knows with high confidence and what it's guessing. Both come out sounding identical.

**What hallucinations look like in practice:**

- Inventing citations to academic papers that don't exist
- Getting specific statistics slightly — or wildly — wrong
- Confusing dates, names, or sequences of historical events
- Generating fictional legal cases, medical studies, or company policies
- Describing how to do something in a plausible but incorrect way

**A real case: Mata v. Avianca (2023)**

A New York attorney named Steven Schwartz used ChatGPT to research legal precedents for a personal injury case. The AI generated six case citations — complete with court names, dates, and summaries. All six cases were entirely fabricated. Schwartz filed the brief without verifying them. When the opposing counsel and the judge tried to locate the cases, none existed. The attorney faced sanctions and public embarrassment.

The lesson: ChatGPT didn't warn him that the cases were invented. It presented them with the same confident, detailed formatting as a real citation.

**How to reduce hallucination risk:**

1. **Verify anything you plan to act on.** Cross-check facts, statistics, and citations against primary sources.
2. **Use retrieval-augmented generation (RAG).** Grounding the model in verified documents dramatically reduces hallucination for factual queries.
3. **Use grounding prompts.** Instruct the model: "Only use information I have provided. If you don't know, say so."
4. **Treat AI output as a draft, not a final answer.** Especially in high-stakes domains: law, medicine, finance, engineering.

---

### Challenge 2: Bias — When AI Reflects Our Worst Patterns

AI models are trained on human-generated data. That data reflects the biases, assumptions, and inequalities of the societies that produced it. The model learns and reproduces those patterns — often invisibly.

**What is AI bias?**

AI bias occurs when a model produces systematically unfair or inaccurate outputs for certain groups. It's not usually intentional — it emerges from patterns in training data.

**Types of bias in AI:**

| Type | Definition | Example |
|------|-----------|---------|
| **Representation bias** | Some groups appear less in training data | Medical AI trained mostly on white male patients performs poorly on others |
| **Historical bias** | Data reflects past discrimination | Hiring AI trained on historical hires replicates historical prejudices |
| **Measurement bias** | Proxy variables encode protected attributes | Using zip code as a credit risk variable encodes racial segregation |
| **Amplification bias** | Model amplifies existing stereotypes | Image generator consistently shows women in domestic roles |

**A real case: Amazon's AI Hiring Tool (2018)**

Amazon built an AI system to rank job applicants for software engineering roles. It was trained on CVs submitted to Amazon over 10 years — the vast majority from men, because the tech industry skewed heavily male during that period.

The AI learned to penalise CVs that contained the word "women's" (as in "women's chess club" or "women's college"). It also downgraded graduates of all-women's colleges. The model didn't discriminate intentionally — it discovered that historical hires were predominantly male and used that as a pattern.

Amazon quietly shelved the tool in 2018 when the bias was discovered internally.

**Why bias matters beyond offense:**

In high-stakes decisions — hiring, lending, bail decisions, medical diagnosis, insurance pricing — biased AI can systematically disadvantage entire groups, at scale, invisibly. Unlike a biased human decision-maker, a biased AI applies its bias to thousands or millions of decisions simultaneously.

**Mitigation strategies:**

- Audit model outputs across demographic groups before deployment
- Use diverse, representative training datasets
- Apply fairness metrics (demographic parity, equalised odds)
- Maintain human oversight for consequential decisions
- Build feedback mechanisms for affected users

---

### Challenge 3: Privacy — What Happens to Your Data

When you type into a consumer AI chatbot, your input travels across the internet to a company's servers. Depending on the service and your settings, that data may be:

- Logged and stored
- Used to improve the model in future training runs
- Accessible to the company's staff under certain conditions
- Subject to breaches if the company is hacked

**What this means in practice:**

Any sensitive information you type into a public AI tool — client details, personal medical information, proprietary code, financial data, trade secrets — should be treated as potentially transmitted to a third party.

**A real case: Samsung / ChatGPT Leak (2023)**

Three Samsung semiconductor engineers used ChatGPT to assist with their work. One pasted proprietary source code to ask for debugging help. Another uploaded internal meeting notes. A third used it to convert notes from a sensitive internal meeting into a presentation.

All three incidents were discovered and reported internally. Samsung issued a temporary ban on generative AI tools and began building an internal, self-hosted AI system. The incident demonstrated that even well-intentioned, productivity-focused AI use can expose highly sensitive intellectual property.

**GDPR and data regulations:**

Under GDPR (and similar laws), organisations have obligations around how personal data is processed. Using a third-party AI tool to process personal data about EU residents may require data processing agreements and impact assessments. Many organisations are still grappling with how to comply.

**Safe practices:**

1. **Use enterprise agreements.** Major AI providers (OpenAI, Anthropic, Google) offer enterprise plans with stronger data protection guarantees and opt-outs from training.
2. **Anonymise data before using AI.** Remove names, client identifiers, and sensitive references before pasting.
3. **Use on-premise or private deployment.** For the most sensitive use cases, run models in your own infrastructure.
4. **Check your organisation's policy.** Many companies now have explicit AI use policies — know yours.

---

### Challenge 4: Copyright and Intellectual Property

Generative AI creates content. That raises two overlapping copyright questions:

**1. What was it trained on?**

Most large language models and image generators were trained on data scraped from the internet — including copyrighted books, articles, code, images, and more. The companies argue this constitutes "fair use" under US law. Rights holders disagree.

In December 2023, *The New York Times* sued OpenAI and Microsoft, alleging that GPT-4 was trained on millions of Times articles without permission. The lawsuit includes examples of GPT-4 reproducing long verbatim passages from copyrighted NYT content.

The legal question is unresolved and will likely take years to settle.

**2. Who owns AI-generated content?**

This is equally unsettled. In the US, the Copyright Office has ruled that purely AI-generated images cannot be copyrighted — copyright requires human authorship. However, works where a human provides substantial creative direction may qualify.

For practical purposes:

| Scenario | Current guidance |
|----------|-----------------|
| You write text with minor AI editing | You likely own it |
| AI writes text from your detailed brief | Unclear — consult a lawyer for commercial use |
| AI generates an image from your prompt | Copyright uncertain; safe to use cautiously |
| AI reproduces large chunks of copyrighted text | High infringement risk — avoid |

**Practical guidance:**

- Don't rely on AI to reproduce or paraphrase copyrighted works at scale
- For commercial projects, treat AI output as a starting point requiring human creative contribution
- Keep records of your creative input into AI-assisted work
- Monitor how copyright law evolves in your jurisdiction — it's changing fast

---

### Challenge 5: Misuse and Deepfakes

Generative AI can create content that appears authentic but is entirely fabricated. The most dangerous application is **deepfakes** — AI-generated video, audio, or images that realistically depict a real person saying or doing something they never did.

**What deepfakes can do:**

- Impersonate executives, politicians, or public figures in video calls
- Generate realistic voice clones from minutes of audio
- Create non-consensual intimate imagery of real people
- Fabricate "evidence" of events that never happened
- Spread disinformation at scale, cheaply and at speed

**A real case: The $25M Hong Kong Deepfake Fraud (2024)**

In January 2024, an employee at a multinational corporation in Hong Kong was summoned to a video call with who appeared to be the company's CFO and several other colleagues — all of whom seemed present, real, and in full video.

The CFO gave instructions to transfer approximately HK$200 million ($25.6 million USD) to five bank accounts. The employee complied.

Every person on the call was a deepfake. The real CFO and colleagues knew nothing about it. Criminals had used publicly available footage to create convincing video clones of all the participants. It was the most sophisticated AI fraud case reported to that point.

**Detection and limitations:**

Deepfake detection tools exist but are in a technological arms race with deepfake generators. At present, no detection tool is reliable enough to be a primary defence. The more robust defences are procedural:

- **Verify major financial transactions through a secondary channel** (call a known number, not one provided in the meeting)
- **Establish code words** for sensitive requests
- **Implement approval workflows** that cannot be bypassed by a single request, even from senior leadership

**Other forms of AI misuse:**

- Generating phishing emails at scale, personalised and grammatically perfect
- Creating disinformation campaigns with synthetic news articles, images, and social media profiles
- Bypassing content moderation at scale
- Automating harassment

---

### The Responsible AI Framework

Five principles guide responsible AI development and use:

| Principle | Definition | In Practice |
|-----------|-----------|-------------|
| **Transparency** | Being clear about when and how AI is being used | Disclosing AI use to clients, customers, or audiences when it affects them |
| **Fairness** | Ensuring AI outcomes don't systematically disadvantage groups | Auditing outputs across demographics; having diverse review teams |
| **Accountability** | Having a human responsible for AI-driven decisions | Maintaining human oversight; being able to explain and reverse AI decisions |
| **Privacy** | Protecting personal data used by or generated through AI | Using enterprise agreements; anonymising inputs; following GDPR |
| **Safety** | Preventing harm from AI outputs | Testing for misuse cases; having incident response plans |

These principles are complementary, not competing. A tool can be transparent about using AI while still being unfair if the AI itself is biased. All five are necessary.

---

### Practical Guidelines for Responsible Use

1. **Verify before you publish or act.** Treat all AI-generated facts, citations, and statistics as unverified until you check them.
2. **Never paste confidential data into consumer AI tools.** Use enterprise-grade tools with appropriate data agreements.
3. **Disclose AI use when it matters.** In journalism, academic work, client deliverables, and legal filings.
4. **Audit AI tools for bias before deploying in consequential decisions.** Especially for hiring, lending, healthcare, or criminal justice.
5. **Keep humans in the loop for irreversible decisions.** Don't automate firing, loan denial, or medical treatment without human review.
6. **Verify high-value requests through secondary channels.** Never execute a large financial transfer or sensitive action based solely on an AI-mediated communication.
7. **Check your organisation's AI policy.** Most enterprises now have guidance — know it and follow it.
8. **Report AI-generated misinformation when you see it.** Especially deepfakes of public figures during elections or crises.
9. **Treat AI output as a draft, not a final product.** Apply your expertise and judgment before publishing or acting.
10. **Stay current.** AI capabilities and the laws governing them are changing monthly. What's safe practice today may not be in a year.

---

## Case Studies

### Case Study 1: The AI Lawyer (Mata v. Avianca, 2023)

**What happened:** Attorney Steven Schwartz submitted a legal brief containing six AI-generated case citations. All six cases were fabricated by ChatGPT. The error was discovered when no one could locate the cited cases.

**What went wrong:** The attorney used AI output without verification in a professional context where accuracy is a legal and ethical obligation.

**What we can learn:** AI tools do not signal their own uncertainty. A hallucinated citation looks identical to a real one. Any use of AI in high-stakes professional work requires independent verification of every factual claim.

---

### Case Study 2: The $25M Deepfake Fraud (Hong Kong, 2024)

**What happened:** A finance employee transferred $25.6 million after a video conference with deepfake impersonations of the company's CFO and colleagues.

**What went wrong:** The employee had no secondary verification procedure for large financial transfers initiated via video call. The visual authenticity of video conferencing was assumed to be sufficient proof of identity.

**What we can learn:** Deepfakes have reached a quality where visual confirmation is no longer reliable proof of identity. Organisations must implement secondary verification procedures for high-value, irreversible actions — independent of how the request arrives.

---

### Case Study 3: Amazon's Biased Hiring AI (2018)

**What happened:** Amazon's AI-powered CV ranking tool was found to systematically penalise female applicants — downgrading CVs mentioning women's organisations and graduates of women's colleges.

**What went wrong:** The model was trained on historical hiring data that reflected the tech industry's historical gender imbalance. It learned to replicate that imbalance. The bias was invisible until someone looked for it.

**What we can learn:** Bias in AI is not intentional — it's structural. It emerges from data that reflects past patterns. Any AI system used in consequential decisions about people must be actively audited for bias across protected characteristics before and after deployment.

---

## Key Takeaways

1. **Hallucinations are structural, not bugs.** LLMs generate plausible text, not verified facts. They cannot distinguish confident knowledge from confident guessing — both look the same in output.

2. **AI bias comes from biased data.** Models trained on human-generated content absorb and amplify human biases. In high-stakes decisions, this bias operates invisibly at scale.

3. **Your inputs are not necessarily private.** Consumer AI tools transmit your prompts to third-party servers. Confidential data requires enterprise-grade agreements or private deployment.

4. **Deepfakes have crossed the threshold of deception.** AI-generated video and audio can convincingly impersonate real people. Visual verification is no longer sufficient. Procedural safeguards — secondary channels, code words, approval workflows — are necessary.

5. **Responsibility doesn't disappear when AI is involved.** Using AI to make a decision or produce content doesn't reduce your accountability for the outcome. The Responsible AI Framework — transparency, fairness, accountability, privacy, safety — applies to every use.

---

## ❓ Self-Check Questions

1. A colleague says "I know the AI might hallucinate, but for general research it's fine — I'll just be careful." What's the specific risk they may be underestimating?

2. Your company wants to use an AI tool to screen CVs. What steps should you take before deploying it to reduce the risk of discriminatory outcomes?

3. You receive a video call from what appears to be your manager asking you to urgently transfer funds to a new vendor. What procedural steps should you follow before acting?

---

**← Previous:** [Chapter 3: Prompt Engineering](03-prompt-engineering.md) | **Next →** [Chapter 5: Building with Generative AI](05-building-with-generative-ai.md)
