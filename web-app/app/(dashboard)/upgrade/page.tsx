"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/auth-store";
import { Check, X, Zap, ArrowLeft, Sparkles, Shield, Crown } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const FREE_FEATURES = [
  "Chapters 1–3 (15–20 min each)",
  "5 MCQ quizzes with instant feedback",
  "3 quiz attempts per day",
  "10 course searches per day",
  "Progress tracking",
  "AI concept explainer (5/day)",
];

const PRO_FEATURES = [
  "All 5 chapters — full curriculum",
  "MCQ + open-ended quizzes",
  "Unlimited quiz attempts",
  "Unlimited searches",
  "Full progress analytics",
  "Unlimited AI concept explainer",
  "Socratic tutor & adaptive hints",
  "AI quiz generator on any topic",
  "Priority support",
];

const COMPARISON_ROWS = [
  { feature: "Chapters",           free: "1–3 only",    pro: "All 5"            },
  { feature: "Quiz types",         free: "MCQ only",    pro: "MCQ + open-ended" },
  { feature: "Quiz attempts",      free: "3/day",       pro: "Unlimited"        },
  { feature: "Course searches",    free: "10/day",      pro: "Unlimited"        },
  { feature: "AI explanations",    free: "5/day",       pro: "Unlimited"        },
  { feature: "Adaptive hints",     free: null,          pro: "Included"         },
  { feature: "Socratic tutor",     free: null,          pro: "Included"         },
  { feature: "AI quiz generator",  free: null,          pro: "Included"         },
  { feature: "Progress analytics", free: "Basic",       pro: "Full analytics"   },
];

const FAQ = [
  {
    q: "Can I cancel at any time?",
    a: "Yes. Cancel before your next billing date and you won't be charged again. You'll keep Pro access until the period ends.",
  },
  {
    q: "What is the AI tutor?",
    a: "The AI tutor is powered by Claude (Anthropic). It explains concepts, generates quiz questions, provides Socratic hints, and coaches your progress — grounded in the course content.",
  },
  {
    q: "Do I keep access if I downgrade?",
    a: "Your progress is saved permanently. If you downgrade, chapters 1–3 and all quiz results remain accessible.",
  },
  {
    q: "Is there a student discount?",
    a: "Contact us with your .edu email. We offer 50% off for verified students.",
  },
];

export default function UpgradePage() {
  const { user } = useAuthStore();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const isPro = user?.tier === "pro";

  const MONTHLY = 9;
  const ANNUAL  = 6;
  const price   = billing === "annual" ? ANNUAL : MONTHLY;

  if (isPro) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
          <Crown size={36} className="text-purple-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">You&apos;re on Pro</h1>
        <p className="text-gray-400 mb-8">
          You have access to all chapters, unlimited quizzes, and every AI skill.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-semibold text-gray-200 transition"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-5xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Zap size={12} /> Upgrade to Pro
        </div>
        <h1 className="text-4xl font-black text-white mb-3">
          Learn without{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            limits
          </span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
          Unlock all 5 chapters, unlimited AI tutoring, and full analytics.
          Everything you need to master Generative AI Fundamentals.
        </p>
      </motion.div>

      {/* ── Billing toggle ──────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex justify-center mb-10">
        <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1">
          {(["monthly", "annual"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setBilling(period)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                billing === period
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {period === "monthly" ? "Monthly" : "Annual"}
              {period === "annual" && (
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                  Save 33%
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Pricing cards ───────────────────────────────────────────────── */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

        {/* Free card */}
        <motion.div
          variants={fadeUp}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <div className="mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-500/10 border border-gray-500/20 flex items-center justify-center mb-3">
              <Shield size={18} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Free</h2>
            <p className="text-gray-500 text-sm">Get started with the basics</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-black text-white">$0</span>
            <span className="text-gray-500 ml-1 text-sm">/ forever</span>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                <Check size={14} className="text-gray-600 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="text-center text-sm text-gray-500 py-3 border border-white/10 rounded-xl bg-white/5">
            Your current plan
          </div>
        </motion.div>

        {/* Pro card */}
        <motion.div
          variants={fadeUp}
          className="relative bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-transparent border border-blue-500/30 rounded-2xl p-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600 rounded-full filter blur-3xl opacity-10" />

          <div className="relative mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">Pro</h2>
              <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                Recommended
              </span>
            </div>
            <p className="text-gray-400 text-sm">Everything, unlimited</p>
          </div>

          <div className="relative mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">${price}</span>
              <span className="text-gray-400 text-sm">/ month</span>
            </div>
            {billing === "annual" && (
              <p className="text-xs text-green-400 mt-0.5">
                Billed ${ANNUAL * 12}/year · Save ${(MONTHLY - ANNUAL) * 12}/year
              </p>
            )}
          </div>

          <ul className="space-y-3 mb-8 relative">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-200">
                <Check size={14} className="text-blue-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={() => alert("Payment integration coming soon — contact us to upgrade.")}
            className="relative w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200"
          >
            <span className="flex items-center justify-center gap-2">
              <Zap size={15} /> Upgrade to Pro
            </span>
          </button>
          <p className="text-xs text-gray-600 text-center mt-3">Cancel anytime · No hidden fees</p>
        </motion.div>
      </motion.div>

      {/* ── Comparison table ────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-12"
      >
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-bold text-white">Feature Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Feature</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Free</th>
                <th className="text-center px-4 py-3 text-blue-400 font-bold">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
                >
                  <td className="px-6 py-3.5 text-gray-300">{row.feature}</td>
                  <td className="px-4 py-3.5 text-center">
                    {row.free === null ? (
                      <X size={14} className="text-gray-600 mx-auto" />
                    ) : (
                      <span className="text-gray-500">{row.free}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center text-blue-300 font-semibold">
                    {row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="max-w-2xl mx-auto mb-12">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <div
              key={q}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition"
            >
              <p className="font-semibold text-white mb-1.5">{q}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Footer CTA ──────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="text-center py-8 border-t border-white/5"
      >
        <p className="text-gray-500 text-sm mb-3">
          Questions? Reach us at{" "}
          <span className="text-gray-400 font-medium">support@coursecompanion.ai</span>
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </motion.div>

    </motion.div>
  );
}
