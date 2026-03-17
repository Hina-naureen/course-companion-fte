"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, BookOpen, Zap, BarChart3, GraduationCap } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_MODE, DEMO_TOKEN, DEMO_REFRESH_TOKEN } from "@/lib/demo";

const PERKS = [
  { icon: <BookOpen size={15} />, text: "5 structured chapters — 100 min total" },
  { icon: <Brain size={15} />,    text: "Claude-powered AI tutor" },
  { icon: <Zap size={15} />,      text: "Adaptive quizzes with explanations" },
  { icon: <BarChart3 size={15} />, text: "Full progress analytics" },
];

export default function LoginPage() {
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
      const { data } = await authApi.login({ email, password });
      const accessToken  = DEMO_MODE ? DEMO_TOKEN         : data.access_token;
      const refreshToken = DEMO_MODE ? DEMO_REFRESH_TOKEN  : data.refresh_token;
      localStorage.setItem("access_token",  accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      document.cookie = `access_token=${accessToken}; path=/`;
      setUser(data.user);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex overflow-hidden">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-[#030712]">
        {/* Blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute bottom-20 right-0 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-10 animate-blob" style={{ animationDelay: "3s" }} />

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
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Welcome back</p>
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Your AI tutor<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              is ready
            </span>
          </h2>
          <div className="space-y-3">
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="text-blue-400">{p.icon}</span>
                {p.text}
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-sm text-gray-300 italic leading-relaxed mb-3">
            &ldquo;This is the clearest explanation of attention mechanisms I&apos;ve ever read. The AI tutor made it click in minutes.&rdquo;
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
            <span className="text-xs text-gray-500">Maya K. · ML Engineer</span>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600 rounded-full filter blur-3xl opacity-5 pointer-events-none" />

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
            <h1 className="text-2xl font-black text-white mb-1">Sign in</h1>
            <p className="text-gray-400 text-sm mb-7">
              Continue your Generative AI journey
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                    Signing in…
                  </span>
                ) : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
