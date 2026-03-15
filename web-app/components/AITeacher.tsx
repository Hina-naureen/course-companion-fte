"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi } from "@/lib/api";
import type { TutorMessage } from "@/lib/types";

interface Props {
  chapterId: string;
}

// ── Sound bar amplitudes — bell-curve shape so centre bars are tallest ────────
const SOUND_AMPS  = [0.20, 0.45, 0.75, 0.55, 1.0, 0.65, 1.2, 0.85, 1.1, 0.60, 0.95, 0.70, 1.15, 0.50, 0.25];
// Slower per-bar durations → smooth, musical movement instead of jitter
const SOUND_SPEEDS = [0.55, 0.48, 0.40, 0.60, 0.44, 0.52, 0.38, 0.50, 0.45, 0.58, 0.42, 0.37, 0.46, 0.53, 0.49];

// ── Futuristic AI Voice Orb ───────────────────────────────────────────────────
function TeacherAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 select-none">

      {/* ── Orb stage ── */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>

        {/* Ambient neon bloom — gently breathes at idle, flares when speaking */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{ inset: -28 }}
          animate={
            isSpeaking
              ? {
                  boxShadow: [
                    "0 0 50px 20px #7c3aed42, 0 0 85px 38px #4f46e520",
                    "0 0 95px 48px #7c3aed78, 0 0 145px 65px #6d28d942",
                    "0 0 50px 20px #7c3aed42, 0 0 85px 38px #4f46e520",
                  ],
                }
              : {
                  boxShadow: [
                    "0 0 26px 8px #4f46e518, 0 0 44px 14px #7c3aed0c",
                    "0 0 38px 14px #4f46e528, 0 0 58px 22px #7c3aed16",
                    "0 0 26px 8px #4f46e518, 0 0 44px 14px #7c3aed0c",
                  ],
                }
          }
          transition={{
            duration: isSpeaking ? 1.8 : 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Orbit ring 1 — speeds up 3× when speaking */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: -10,
            border: "1px solid transparent",
            backgroundImage:
              "linear-gradient(#0a0a0f, #0a0a0f), linear-gradient(135deg, #818cf8cc, #4f46e500 40%, #a78bfa99)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: isSpeaking ? 3.5 : 10, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-indigo-400"
            style={{
              top: -5,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: isSpeaking ? "0 0 20px 9px #818cf8cc" : "0 0 10px 4px #818cf8",
              transition: "box-shadow 0.5s ease",
            }}
          />
        </motion.div>

        {/* Orbit ring 2 — counter-clockwise, speeds up 2.5× */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: -22,
            border: "1px solid transparent",
            backgroundImage:
              "linear-gradient(#0a0a0f, #0a0a0f), linear-gradient(225deg, #a78bfaaa, #4f46e500 45%, #c4b5fd77)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: isSpeaking ? 6 : 16, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute w-2 h-2 rounded-full bg-purple-400"
            style={{
              bottom: -4,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: isSpeaking ? "0 0 16px 7px #a78bfacc" : "0 0 8px 3px #a78bfa",
              transition: "box-shadow 0.5s ease",
            }}
          />
        </motion.div>

        {/* Orbit ring 3 — dashed outer, also speeds up */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: -38,
            border: isSpeaking ? "1px solid #6366f145" : "1px dashed #6366f128",
            transition: "border 0.5s ease",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: isSpeaking ? 9 : 24, repeat: Infinity, ease: "linear" }}
        />

        {/* ── 3 staggered sonar pulse rings — only when speaking ── */}
        <AnimatePresence>
          {isSpeaking && (
            <>
              <motion.div
                key="pulse-violet"
                className="absolute rounded-full pointer-events-none"
                style={{ inset: 0, border: "1.5px solid #7c3aed" }}
                initial={{ scale: 1, opacity: 0.9 }}
                animate={{ scale: 1.65, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.95, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                key="pulse-indigo"
                className="absolute rounded-full pointer-events-none"
                style={{ inset: 0, border: "1px solid #6366f1" }}
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 1.95, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.95, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              />
              <motion.div
                key="pulse-purple"
                className="absolute rounded-full pointer-events-none"
                style={{ inset: 0, border: "1px solid #9333ea" }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.95, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* ── Core orb ── */}
        <motion.div
          className="relative rounded-full overflow-hidden"
          style={{
            width: 148,
            height: 148,
            background:
              "radial-gradient(circle at 38% 30%, #818cf8 0%, #4f46e5 28%, #1e1b4b 62%, #07050f 100%)",
          }}
          animate={
            isSpeaking
              ? {
                  y: [0, -8, 0],
                  scale: [1, 1.055, 1],
                  boxShadow: [
                    "0 0 30px 9px #4f46e54c, inset 0 0 26px 9px #312e8140",
                    "0 0 70px 30px #7c3aed7a, inset 0 0 50px 20px #4c1d9565",
                    "0 0 30px 9px #4f46e54c, inset 0 0 26px 9px #312e8140",
                  ],
                }
              : {
                  // Calm breathing: very subtle scale + gentle float
                  y: [0, -5, 0],
                  scale: [1, 1.015, 1],
                  boxShadow: "0 0 28px 8px #4f46e542, inset 0 0 22px 7px #312e8132",
                }
          }
          transition={
            isSpeaking
              ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
              : {
                  y:         { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  scale:     { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  boxShadow: { duration: 0.8 },
                }
          }
        >
          {/* Inner energy core — base layer */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "22%",
              background: "radial-gradient(circle, #c4b5fd55 0%, #818cf825 50%, transparent 80%)",
              filter: "blur(10px)",
            }}
          />

          {/* Inner energy core — bright overlay, animates independently */}
          <motion.div
            className="absolute rounded-full"
            style={{
              inset: "18%",
              background: "radial-gradient(circle, #e9d5ffcc 0%, #a78bfa60 45%, transparent 75%)",
              filter: "blur(12px)",
            }}
            animate={{ opacity: isSpeaking ? [0.25, 1, 0.25] : [0.08, 0.18, 0.08] }}
            transition={
              isSpeaking
                ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                : { duration: 5,   repeat: Infinity, ease: "easeInOut" }
            }
          />

          {/* Specular highlight */}
          <div
            className="absolute rounded-full"
            style={{
              top: "10%",
              left: "14%",
              width: "42%",
              height: "26%",
              background: "radial-gradient(ellipse, rgba(255,255,255,0.28) 0%, transparent 70%)",
            }}
          />

          {/* Scan sweep — restarts at new speed on isSpeaking change */}
          <motion.div
            key={isSpeaking ? "scan-fast" : "scan-slow"}
            className="absolute w-full"
            style={{
              height: 2,
              background:
                "linear-gradient(to right, transparent 5%, #a5b4fc70 38%, #c4b5fdaa 50%, #a5b4fc70 62%, transparent 95%)",
            }}
            animate={{ top: ["8%", "90%", "8%"] }}
            transition={{
              duration: isSpeaking ? 1.5 : 3.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Hex overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 148 148">
            {[-1, 0, 1, 2].map((row) =>
              [-2, -1, 0, 1, 2].map((col) => {
                const hx = 74 + col * 20 + (Math.abs(row) % 2) * 10;
                const hy = 74 + row * 17;
                return (
                  <circle key={`${row}-${col}`} cx={hx} cy={hy} r="8"
                    fill="none" stroke="white" strokeWidth="0.5" />
                );
              })
            )}
          </svg>
        </motion.div>

        {/* Status dot */}
        <motion.div
          className="absolute bottom-2 right-2 z-20"
          animate={isSpeaking ? { scale: [1, 1.6, 1] } : { scale: 1 }}
          transition={{ duration: 0.65, repeat: Infinity }}
        >
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 border-gray-950 transition-colors duration-500 ${
              isSpeaking
                ? "bg-emerald-400 shadow-lg shadow-emerald-400/70"
                : "bg-gray-600"
            }`}
          />
        </motion.div>
      </div>

      {/* Name badge */}
      <div className="text-center space-y-0.5">
        <p className="text-base font-bold text-white tracking-wide">Aria</p>
        <motion.p
          className="text-xs font-medium"
          animate={{ color: isSpeaking ? "#a78bfa" : "#818cf880" }}
          transition={{ duration: 0.5 }}
        >
          {isSpeaking ? "Speaking…" : "AI Teacher · GenAI Expert"}
        </motion.p>
      </div>

      {/* Sound wave equaliser — reactive bars */}
      <div className="flex items-end gap-[3px] h-9">
        {SOUND_AMPS.map((amp, i) => (
          <motion.span
            key={i}
            className="rounded-full"
            style={{
              width: 3,
              background: isSpeaking
                ? "linear-gradient(to top, #4338ca, #c084fc)"
                : "#1f2937",
              transition: "background 0.4s ease",
            }}
            animate={
              isSpeaking
                ? { height: [`2px`, `${amp * 36}px`, `2px`] }
                : { height: "3px" }
            }
            transition={
              isSpeaking
                ? {
                    duration: SOUND_SPEEDS[i],
                    repeat: Infinity,
                    delay: (i * 0.038) % 0.3,
                    ease: "easeInOut",
                  }
                : { duration: 0.5, ease: "easeOut" }
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg, audioUrl }: { msg: TutorMessage; audioUrl?: string | null }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2.5`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-500/20">
          A
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm shadow-md shadow-indigo-900/30"
            : "bg-gray-800/60 text-gray-100 rounded-bl-sm border border-gray-700/35 shadow-sm shadow-black/25 backdrop-blur-sm"
        }`}
      >
        {msg.content}
        {!isUser && audioUrl && (
          <audio src={audioUrl} controls className="mt-2.5 w-full h-8 rounded-lg opacity-50 hover:opacity-90 transition-opacity duration-200" />
        )}
      </div>
    </motion.div>
  );
}

// ── Web Speech API ────────────────────────────────────────────────────────────

function speakWithBrowser(text: string, onStart: () => void, onEnd: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.92;
  utter.pitch = 1.15;
  utter.volume = 1;

  const applyVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = ["Google UK English Female","Microsoft Zira","Samantha","Karen","Moira","Tessa","Fiona","Victoria"];
    const female = preferred.map(n => voices.find(v => v.name.includes(n))).find(Boolean)
      ?? voices.find(v => v.lang.startsWith("en") && /female|woman/i.test(v.name))
      ?? voices.find(v => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB"))
      ?? null;
    if (female) utter.voice = female;
    utter.onstart = onStart;
    utter.onend   = onEnd;
    utter.onerror = onEnd;
    window.speechSynthesis.speak(utter);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", applyVoiceAndSpeak, { once: true });
  } else {
    applyVoiceAndSpeak();
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AITeacher({ chapterId }: Props) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm Aria, your AI teacher for this chapter. Ask me anything and I'll explain it clearly — I'll speak the answer for you too!",
    },
  ]);
  const [latestAudioUrl, setLatestAudioUrl] = useState<string | null>(null);
  const [latestAnswer,   setLatestAnswer]   = useState("");
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [isSpeaking,     setIsSpeaking]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length <= 1) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
    };
  }, []);

  // Play backend audio when url changes
  useEffect(() => {
    if (!latestAudioUrl) return;
    const audio = new Audio(latestAudioUrl);
    audioRef.current = audio;
    audio.addEventListener("play",  () => setIsSpeaking(true));
    audio.addEventListener("ended", () => setIsSpeaking(false));
    audio.addEventListener("pause", () => setIsSpeaking(false));
    audio.addEventListener("error", () => {
      setIsSpeaking(false);
      // Backend audio failed — fall back to browser TTS
      if (latestAnswer) speakWithBrowser(latestAnswer, () => setIsSpeaking(true), () => setIsSpeaking(false));
    });
    audio.play().catch(() => { /* autoplay blocked — user can play manually */ });
    return () => { audio.pause(); audio.src = ""; };
  }, [latestAudioUrl, latestAnswer]);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || loading) return;
    if (question.length < 3) {
      setError("Question must be at least 3 characters.");
      return;
    }

    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setInput("");
    setError(null);
    setMessages((p) => [...p, { role: "user", content: question }]);
    setLoading(true);

    try {
      const { data } = await aiApi.askTutor(chapterId, question);
      setMessages((p) => [...p, { role: "assistant", content: data.answer }]);
      setLatestAnswer(data.answer);

      if (data.audio_url) {
        setLatestAudioUrl(data.audio_url);
      } else {
        speakWithBrowser(data.answer, () => setIsSpeaking(true), () => setIsSpeaking(false));
      }
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { detail?: unknown } } })?.response;
      const status = res?.status;
      const rawDetail = res?.data?.detail;
      // Pydantic 422 returns detail as an array of {msg, loc} objects
      const detail = Array.isArray(rawDetail)
        ? (rawDetail as { msg: string }[]).map((e) => e.msg).join(", ")
        : typeof rawDetail === "string" ? rawDetail : undefined;
      let msg: string;
      if (status === 422) msg = `⚠️ Validation: ${detail ?? "Invalid request. Check your question."}`;
      else if (status === 402 || status === 429) msg = `💳 ${detail ?? "API credits exhausted."}`;
      else if (status === 503) msg = `🔧 ${detail ?? "AI service temporarily unavailable."}`;
      else if (status === 500) msg = `⚠️ ${detail ?? "Server error. Check backend logs."}`;
      else if (status === 401 || status === 403) msg = "🔒 Authentication error. Please log in again.";
      else if (!status) msg = "❌ Cannot reach the backend — make sure it is running on port 8000.";
      else msg = `❌ Unexpected error (${status}). Please try again.`;
      setError(msg);
      setMessages((p) => p.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
    }
  }, [chapterId, input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const lastAiIdx    = [...messages].reverse().findIndex((m) => m.role === "assistant");
  const lastAiAbsIdx = lastAiIdx >= 0 ? messages.length - 1 - lastAiIdx : -1;

  return (
    <div className="mt-10 rounded-2xl overflow-hidden bg-gray-950 border border-indigo-900/30 shadow-2xl shadow-indigo-950/50">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-indigo-950/80 to-gray-950 border-b border-indigo-900/30">
        <motion.span
          className="w-2 h-2 rounded-full bg-indigo-400"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <p className="text-sm font-semibold text-indigo-200">AI Teacher — Aria</p>
        <div className="ml-auto flex items-center gap-2">
          {isSpeaking && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-400 font-medium"
            >
              ● Speaking
            </motion.span>
          )}
          <span className="text-xs text-indigo-400/50">Gemini · Voice</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row min-h-[480px]">
        {/* Avatar panel */}
        <div className="lg:w-56 shrink-0 flex flex-col items-center justify-center py-8 px-4 border-b lg:border-b-0 lg:border-r border-indigo-900/20 bg-gradient-to-b from-indigo-950/20 to-transparent">
          <TeacherAvatar isSpeaking={isSpeaking} />
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-h-96">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <Bubble
                  key={idx}
                  msg={msg}
                  audioUrl={idx === lastAiAbsIdx ? latestAudioUrl : null}
                />
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
                className="flex gap-2.5 items-end"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-500/20">
                  A
                </div>
                <div className="bg-gray-800/60 rounded-2xl rounded-bl-sm px-4 py-3.5 border border-gray-700/35 shadow-sm shadow-black/25">
                  <div className="flex items-center gap-[5px]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500"
                        animate={{ scale: [1, 1.6, 1], opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-2.5 text-xs text-red-300 bg-red-950/40 border-t border-red-900/30 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="flex items-end gap-2 px-4 py-3 border-t border-indigo-900/20 bg-indigo-950/10">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aria anything… (min 3 chars, Enter to send)"
              disabled={loading}
              className="flex-1 resize-none bg-gray-800/70 border border-gray-700/60 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:bg-gray-800 disabled:opacity-50 transition"
              style={{ maxHeight: "100px", overflowY: "auto" }}
            />
            <button
              onClick={handleSend}
              disabled={input.trim().length < 3 || loading}
              className="shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-900/30"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
