"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, Shield, Zap, GraduationCap, Check } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

const FREE_PERKS = [
  "Chapters 1–3 completely free",
  "5 AI explanations per day",
  "3 quiz attempts per day",
  "Progress tracking",
  "No credit card required",
];

export default function RegisterPage() {
  const router  = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => { router.prefetch("/dashboard"); }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.register({ email, password });
      localStorage.setItem("access_token",  data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      document.cookie = `access_token=${data.access_token}; path=/`;
      setUser(data.user);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex overflow-hidden">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-[#030712]">
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: "2s" }} />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">
            Course<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Companion</span>
          </span>
        </div>

        {/* Content */}
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Free forever</p>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Learn GenAI with<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              your AI tutor
            </span>
          </h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Chapters 1–3 are free. No credit card. Start learning in 30 seconds.
          </p>

          <div className="space-y-2.5">
            {FREE_PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-green-400" />
                </div>
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative grid grid-cols-3 gap-3">
          {[
            { icon: <Brain size={16} />,  label: "AI Tutor",    color: "from-blue-500 to-blue-600" },
            { icon: <Zap size={16} />,    label: "Quizzes",     color: "from-purple-500 to-purple-600" },
            { icon: <Shield size={16} />, label: "Free tier",   color: "from-green-500 to-emerald-600" },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2 text-white`}>
                {item.icon}
              </div>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600 rounded-full filter blur-3xl opacity-5 pointer-events-none" />

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">
              Course<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Companion</span>
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Free badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-semibold mb-5">
              <Check size={11} />
              Free to start · No credit card
            </div>

            <h1 className="text-2xl font-black text-white mb-1">Create account</h1>
            <p className="text-gray-400 text-sm mb-7">
              Start learning Generative AI fundamentals
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 focus:shadow-lg focus:shadow-blue-500/10 transition-all duration-200"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : "Create free account"}
              </button>

              <p className="text-xs text-gray-600 text-center">
                By signing up you agree to our Terms of Service
              </p>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
