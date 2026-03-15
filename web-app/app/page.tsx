"use client";

import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Brain, BookOpen, Zap, BarChart3, MessageSquare,
  Code2, ChevronRight, Sparkles, Shield, Clock,
  GraduationCap, ArrowRight, Send, Cpu, Layers,
  CheckCircle, Star, Users,
} from "lucide-react";

// ── Easing constants ────────────────────────────────────────────────────────
const E = "easeOut" as const;

// ── Variants ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: any = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeIn: any = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger: any = { visible: { transition: { staggerChildren: 0.1 } } };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const staggerFast: any = { visible: { transition: { staggerChildren: 0.06 } } };

// ── Reusable section reveal ──────────────────────────────────────────────────
function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.62, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
      }}
    />
  );
}

// ── Chat conversation ────────────────────────────────────────────────────────
const CHAT_SCRIPT = [
  {
    role: "user" as const,
    text: "What exactly is the attention mechanism?",
  },
  {
    role: "ai" as const,
    text: "Great question! Attention lets each token in a sequence 'look at' every other token simultaneously — it assigns a weight to how relevant each word is to the current one.",
  },
  {
    role: "user" as const,
    text: "Can you give me a simple analogy?",
  },
  {
    role: "ai" as const,
    text: "Think of a spotlight on a stage. When processing the word 'bank', attention decides whether to shine the spotlight on 'river' or 'money' — resolving ambiguity with context.",
  },
];

// ── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 h-4 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-blue-400 inline-block"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

// ── Live AI Chat Widget ──────────────────────────────────────────────────────
function AIChatWidget() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idx = 0;

    function showNext() {
      if (idx >= CHAT_SCRIPT.length) {
        setTimeout(() => {
          setVisibleMessages(0);
          setIsTyping(false);
          idx = 0;
          setTimeout(showNext, 1000);
        }, 4000);
        return;
      }
      const msg = CHAT_SCRIPT[idx];
      if (msg.role === "ai") {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          idx++;
          setVisibleMessages(idx);
          setTimeout(showNext, msg.text.length * 18);
        }, 1400);
      } else {
        idx++;
        setVisibleMessages(idx);
        setTimeout(showNext, 900);
      }
    }

    const t = setTimeout(showNext, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleMessages, isTyping]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: E }}
      className="w-full max-w-[380px]"
    >
      {/* Outer glow ring */}
      <div className="relative">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent blur-sm" />
        <div className="relative bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10">

          {/* Header */}
          <div className="px-4 py-3 border-b border-white/8 bg-white/[0.03] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Orb */}
              <div className="relative w-8 h-8 flex-shrink-0">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
                  animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center z-10">
                  <Brain size={14} className="text-white" />
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-full bg-blue-500/20 blur-md"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Tutor</p>
                <div className="flex items-center gap-1 text-[10px] text-green-400">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Online · Claude-powered
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {["bg-red-500", "bg-yellow-500", "bg-green-500"].map((c) => (
                <div key={c} className={`w-2.5 h-2.5 rounded-full ${c} opacity-60`} />
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="h-[240px] overflow-y-auto px-4 py-3 space-y-3 scrollbar-none">
            <AnimatePresence>
              {CHAT_SCRIPT.slice(0, visibleMessages).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: E }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center mr-2 mt-0.5">
                      <Brain size={10} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] text-[11px] leading-relaxed rounded-xl px-3 py-2 ${
                      msg.role === "user"
                        ? "bg-white/10 text-gray-200 border border-white/10"
                        : "bg-gradient-to-br from-blue-600/25 to-purple-600/20 border border-blue-500/25 text-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                    <Brain size={10} className="text-white" />
                  </div>
                  <div className="bg-blue-600/15 border border-blue-500/20 rounded-xl px-3 py-2">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Capability badges */}
          <div className="px-4 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none">
            {["Concept Explainer", "Quiz Master", "Socratic Tutor", "Progress Coach"].map((t) => (
              <span
                key={t}
                className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-500"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Input bar */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
              <input
                className="flex-1 bg-transparent text-[11px] text-gray-300 placeholder-gray-600 outline-none"
                placeholder="Ask anything about Generative AI…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30 hover:scale-110 transition-transform">
                <Send size={10} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        className="absolute -left-8 top-1/3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-gray-300 flex items-center gap-1.5 shadow-lg"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles size={10} className="text-yellow-400" /> Adaptive learning
      </motion.div>
      <motion.div
        className="absolute -right-6 bottom-1/4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-gray-300 flex items-center gap-1.5 shadow-lg"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <CheckCircle size={10} className="text-green-400" /> 100% free to start
      </motion.div>
    </motion.div>
  );
}

// ── Feature data ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <BookOpen size={20} />,
    title: "5 Structured Chapters",
    desc: "From LLM basics to building real AI products — a complete curriculum in ~100 minutes.",
    gradient: "from-blue-500 to-blue-600",
    glow: "blue",
  },
  {
    icon: <Brain size={20} />,
    title: "AI Concept Explainer",
    desc: "Claude breaks down any concept at exactly your level — beginner to advanced.",
    gradient: "from-purple-500 to-purple-600",
    glow: "purple",
  },
  {
    icon: <MessageSquare size={20} />,
    title: "Socratic Tutor",
    desc: "Never just given the answer — guided through reasoning with smart questions.",
    gradient: "from-cyan-500 to-cyan-600",
    glow: "cyan",
  },
  {
    icon: <Zap size={20} />,
    title: "Adaptive Quiz Engine",
    desc: "MCQs with instant explanations. Fail a question? Get targeted feedback.",
    gradient: "from-yellow-500 to-orange-500",
    glow: "yellow",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Progress Analytics",
    desc: "Track exactly which chapters you've mastered and where your gaps are.",
    gradient: "from-green-500 to-emerald-500",
    glow: "green",
  },
  {
    icon: <Code2 size={20} />,
    title: "Real Code Examples",
    desc: "Every concept includes working Python examples — build as you learn.",
    gradient: "from-pink-500 to-rose-500",
    glow: "pink",
  },
];

const STEPS = [
  {
    n: "01",
    icon: <BookOpen size={22} />,
    title: "Pick a chapter",
    desc: "Start with Chapter 1 — What is Generative AI? Free for everyone, no signup needed.",
    color: "from-blue-600 to-blue-700",
  },
  {
    n: "02",
    icon: <Brain size={22} />,
    title: "Learn with your AI tutor",
    desc: "Read the structured lesson. Ask the AI tutor any question, any time — it adapts to you.",
    color: "from-purple-600 to-purple-700",
  },
  {
    n: "03",
    icon: <Zap size={22} />,
    title: "Test & advance",
    desc: "Take the adaptive quiz, review your gaps with AI explanations, unlock the next chapter.",
    color: "from-cyan-600 to-blue-600",
  },
];

const STATS = [
  { value: "5",    label: "Chapters",      icon: <BookOpen size={13} /> },
  { value: "25+",  label: "Quiz questions", icon: <Zap size={13} /> },
  { value: "4",    label: "AI skills",     icon: <Brain size={13} /> },
  { value: "Free", label: "To start",      icon: <Shield size={13} /> },
  { value: "100",  label: "Min total",     icon: <Clock size={13} /> },
];

const TESTIMONIALS = [
  {
    text: "The attention mechanism finally clicked for me after 3 years of trying. The AI tutor explained it in a way no blog post ever could.",
    name: "Maya K.",
    role: "ML Engineer",
    rating: 5,
  },
  {
    text: "I built my first RAG pipeline after Chapter 4. This is the most practical GenAI course I've seen.",
    name: "James T.",
    role: "Backend Developer",
    rating: 5,
  },
  {
    text: "The Socratic tutor mode is genius — it never just gives you the answer, it makes you think.",
    name: "Priya S.",
    role: "Data Scientist",
    rating: 5,
  },
];

// ── Blob ─────────────────────────────────────────────────────────────────────
function Blob({ className, color, delay = 0 }: { className: string; color: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full filter blur-3xl pointer-events-none ${color} ${className}`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(3,7,18,0)", "rgba(3,7,18,0.95)"]);

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <ScrollProgress />

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <motion.nav
        style={{ backgroundColor: navBg }}
        className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/30">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">
              Course<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Companion</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features"    className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#demo"        className="hover:text-white transition-colors">AI Demo</a>
            <a href="#pricing"     className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-24 px-4 min-h-screen flex items-center" style={{ isolation: "isolate" }}>
        {/* clip blobs without blocking page scroll */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <Blob className="w-[600px] h-[600px] -top-40 -left-40"   color="bg-purple-700" delay={0} />
          <Blob className="w-[500px] h-[500px] -top-20 right-0"    color="bg-blue-700"   delay={2} />
          <Blob className="w-[400px] h-[400px] bottom-0 left-1/3"  color="bg-cyan-700"   delay={4} />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Radial fade from center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.08),transparent)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300 mb-7 backdrop-blur-sm"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Cpu size={13} className="text-blue-400" />
                </motion.span>
                Powered by Claude AI · Anthropic
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="text-5xl md:text-6xl lg:text-[68px] font-black leading-[1.06] tracking-tight mb-6"
              >
                Master{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
                  Generative AI
                </span>
                <br />
                with Your{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                    AI Tutor
                  </span>
                  {/* Animated underline */}
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 10"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: E }}
                  >
                    <motion.path
                      d="M4 6 Q75 1 150 6 Q225 11 296 6"
                      stroke="url(#u1)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <defs>
                      <linearGradient id="u1" x1="0" x2="300" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#a78bfa" />
                        <stop offset="1" stopColor="#f472b6" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-gray-400 mb-9 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                A structured 5-chapter curriculum with an adaptive Claude-powered AI tutor that
                explains concepts at your level, asks Socratic questions, and personalises
                every quiz. Free to start.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base overflow-hidden transition-all duration-200 hover:scale-105"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 transition" />
                  <span className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
                  <span className="relative flex items-center gap-2">
                    Start for Free
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Glow */}
                  <span className="absolute -bottom-2 inset-x-8 h-6 bg-blue-500/40 blur-xl" />
                </Link>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/[0.04] font-semibold text-gray-300 hover:text-white transition-all duration-200"
                >
                  Sign in
                  <ChevronRight size={16} />
                </Link>
              </motion.div>

              {/* Trust line */}
              <motion.div
                variants={fadeUp}
                className="mt-7 flex items-center gap-4 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {["bg-blue-500","bg-purple-500","bg-pink-500","bg-cyan-500"].map((c,i) => (
                    <div key={i} className={`w-7 h-7 rounded-full border-2 border-[#030712] ${c} flex items-center justify-center text-[9px] font-bold`}>
                      {["M","J","P","A"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  <span className="text-gray-300 font-semibold">2,400+</span> learners · Free forever for Ch 1–3
                </p>
              </motion.div>
            </motion.div>

            {/* Right: AI Chat widget */}
            <div className="flex justify-center lg:justify-end relative">
              <AIChatWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <motion.section
        className="py-10 px-4 border-y border-white/5 bg-white/[0.02]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: E }}
              >
                <p className="text-2xl sm:text-3xl font-black text-white mb-0.5">{s.value}</p>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  {s.icon} {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
              <Layers size={11} /> Features
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                actually understand AI
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Not just videos and slides — a full interactive learning system built on Claude.
            </p>
          </Reveal>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-colors duration-300 cursor-default overflow-hidden"
              >
                {/* Hover glow overlay */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(99,102,241,0.08), transparent 65%)`,
                  }}
                />

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 text-white shadow-lg`}>
                  {f.icon}
                </div>

                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI Tutor Demo ──────────────────────────────────────────────────── */}
      <section id="demo" className="py-28 px-4 relative overflow-hidden border-y border-white/5 bg-white/[0.015]">
        <Blob className="w-96 h-96 top-10 right-20 opacity-10"  color="bg-purple-600" delay={0} />
        <Blob className="w-80 h-80 bottom-10 left-20 opacity-10" color="bg-blue-600"   delay={3} />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: explanation */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.12 }}
            >
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full"
              >
                <Brain size={11} /> AI Tutor Experience
              </motion.span>

              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-5 leading-tight">
                Your personal tutor,{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  always available
                </span>
              </motion.h2>

              <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-8 leading-relaxed">
                The AI tutor isn&apos;t just a chatbot — it&apos;s grounded in your course content and adapts
                its explanation style to exactly where you are in the curriculum.
              </motion.p>

              <motion.ul variants={staggerFast} className="space-y-4">
                {[
                  { icon: <MessageSquare size={15} />, color: "text-blue-400",   label: "Concept Explainer",   desc: "Ask any GenAI concept and get a tailored, jargon-free explanation." },
                  { icon: <Brain size={15} />,         color: "text-purple-400", label: "Socratic Tutor",      desc: "Guided reasoning — never just given the answer, always made to think." },
                  { icon: <Zap size={15} />,           color: "text-yellow-400", label: "Quiz Generator",      desc: "Generates custom MCQs on any topic from the curriculum." },
                  { icon: <BarChart3 size={15} />,     color: "text-green-400",  label: "Progress Coach",      desc: "Analyses your results and recommends exactly what to study next." },
                ].map((item) => (
                  <motion.li key={item.label} variants={fadeUp} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm mb-0.5">{item.label}</p>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            {/* Right: expanded chat */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.8, ease: E }}
              className="relative"
            >
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-transparent blur-lg" />
              <div className="relative bg-[#0d1117]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                {/* Window bar */}
                <div className="px-5 py-3 bg-white/[0.03] border-b border-white/8 flex items-center gap-2">
                  {["bg-red-500","bg-yellow-500","bg-green-500"].map((c) => (
                    <div key={c} className={`w-3 h-3 rounded-full ${c} opacity-70`} />
                  ))}
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-4 py-1 text-xs text-gray-500">
                      <Shield size={10} className="text-green-400" /> AI Tutor · Course Companion
                    </div>
                  </div>
                </div>

                {/* Larger demo conversation */}
                <div className="p-6 space-y-4">
                  {[
                    { role: "system", text: "Welcome! I'm your AI tutor for Generative AI Fundamentals. What would you like to learn today?" },
                    { role: "user",   text: "I'm confused about transformers vs RNNs. What's the key difference?" },
                    { role: "ai",     text: "Great question! The fundamental difference is how they process sequences. RNNs process tokens one-by-one, left to right — this means information from the start gets diluted by the time it reaches the end. Transformers throw that constraint out entirely..." },
                    { role: "ai",     text: "Instead of sequential processing, transformers use **self-attention** — every token can directly attend to every other token in parallel. This solves the long-range dependency problem and also enables massive GPU parallelism during training.", extra: true },
                  ].map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.12 }}
                      transition={{ delay: i * 0.15, duration: 0.4, ease: E }}
                    >
                      {msg.role !== "user" && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center mt-0.5 shadow-md shadow-blue-500/30">
                          <Brain size={12} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] text-sm leading-relaxed rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-blue-600/20 border border-blue-500/25 text-gray-200 rounded-tr-sm"
                            : msg.role === "system"
                            ? "bg-white/5 border border-white/8 text-gray-400 italic text-xs"
                            : "bg-white/[0.06] border border-white/10 text-gray-200 rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  <motion.div
                    className="flex gap-3"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                      <Brain size={12} className="text-white" />
                    </div>
                    <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                      <TypingDots />
                    </div>
                  </motion.div>
                </div>

                {/* Input */}
                <div className="px-5 pb-5">
                  <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <input
                      className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none"
                      placeholder="Ask a follow-up question…"
                      readOnly
                    />
                    <button className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                      <Send size={13} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How it Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-green-400 mb-4 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
              <Zap size={11} /> How it works
            </span>
            <h2 className="text-4xl md:text-5xl font-black">Three steps to mastery</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-12 left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                className="text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: E }}
              >
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-xl`}>
                  <span className="text-white">{step.icon}</span>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-[10px] font-black text-gray-900 flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full">
              <Star size={11} /> Learner reviews
            </span>
            <h2 className="text-3xl font-black text-white">What learners say</h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA / Pricing ─────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.6 }}
          >
            {/* BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-cyan-600/10" />
            <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />
            <Blob className="w-64 h-64 -top-16 -right-16"   color="bg-blue-500"   delay={0} />
            <Blob className="w-48 h-48 -bottom-10 -left-10" color="bg-purple-500" delay={2} />

            {/* Grid on CTA */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-green-400 mb-5 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                <CheckCircle size={11} /> Free to start
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Start learning{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  today
                </span>
              </h2>
              <p className="text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
                Chapters 1–3 are completely free. No credit card, no time limit.
                Upgrade to Pro for the full 5-chapter curriculum and unlimited AI tutoring.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Link
                  href="/register"
                  className="group relative flex items-center justify-center gap-2 px-9 py-4 rounded-xl font-bold text-base overflow-hidden hover:scale-105 transition-all duration-200"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500 transition" />
                  <span className="absolute -bottom-3 inset-x-12 h-8 bg-blue-500/50 blur-xl" />
                  <span className="relative flex items-center gap-2">
                    Create free account
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="px-9 py-4 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 font-semibold text-gray-300 hover:text-white transition-all duration-200"
                >
                  Sign in
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-500" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-green-500" /> Free forever Ch 1–3</span>
                <span className="flex items-center gap-1.5"><Users size={13} className="text-blue-400" /> 2,400+ learners</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <GraduationCap size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">
                Course<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Companion</span>
                <span className="text-gray-500 font-normal ml-1">FTE</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/login"    className="hover:text-gray-300 transition">Login</Link>
              <Link href="/register" className="hover:text-gray-300 transition">Register</Link>
              <a href="#features"   className="hover:text-gray-300 transition">Features</a>
              <a href="#pricing"    className="hover:text-gray-300 transition">Pricing</a>
            </div>

            <p className="text-xs text-gray-600 flex items-center gap-1.5">
              <Cpu size={11} /> Built with Next.js · FastAPI · Claude by Anthropic
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-700">
              © 2025 Course Companion FTE · Generative AI Fundamentals
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
