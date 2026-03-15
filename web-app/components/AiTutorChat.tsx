"use client";

import { useState, useRef, useEffect } from "react";
import { aiApi } from "@/lib/api";
import type { TutorMessage } from "@/lib/types";

interface Props {
  chapterId: string;
}

export default function AiTutorChat({ chapterId }: Props) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI tutor for this chapter. Ask me anything about what you just read.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message only after the first user interaction
  useEffect(() => {
    if (messages.length <= 1) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const { data } = await aiApi.askTutor(chapterId, question);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? "AI tutor is unavailable right now. Please try again.");
      // Remove the user message on failure so they can retry
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="mt-10 border border-gray-800 rounded-2xl overflow-hidden bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-800 bg-gray-900/60">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <p className="text-sm font-semibold text-gray-200">AI Tutor</p>
        <span className="text-xs text-gray-500 ml-auto">Powered by GPT-4o mini</span>
      </div>

      {/* Message history */}
      <div className="h-80 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-200 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="px-5 py-2 text-xs text-red-400 bg-red-950/30 border-t border-red-900/40">
          {error}
        </p>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 border-t border-gray-800 bg-gray-900/40">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this chapter… (Enter to send)"
          disabled={loading}
          className="flex-1 resize-none bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition"
          style={{ maxHeight: "120px", overflowY: "auto" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
