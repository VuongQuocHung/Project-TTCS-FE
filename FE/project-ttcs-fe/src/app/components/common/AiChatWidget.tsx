"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { aiApi } from "@/lib/api-endpoints";
import type { ApiError } from "@/lib/api";
import type { AiChatResponse, AiProductSuggestion } from "@/types/api";

const DEFAULT_PROMPTS = [
  "Goi y laptop hoc tap duoi 15 trieu",
  "Laptop do hoa tot, man hinh dep",
  "Laptop pin trau de di hoc",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: AiProductSuggestion[];
};

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Xin chao! Minh co the tu van laptop va goi y san pham cho ban. Hay dat cau hoi nhe.",
    },
  ]);

  const now = Date.now();
  const cooldownMs = Math.max(0, cooldownUntil - now);
  const canSend = input.trim().length > 0 && !loading && cooldownMs === 0;

  useEffect(() => {
    if (!cooldownUntil) return undefined;
    const remaining = cooldownUntil - Date.now();
    if (remaining <= 0) {
      setCooldownUntil(0);
      return undefined;
    }
    const timerId = window.setTimeout(() => {
      setCooldownUntil(0);
    }, remaining);
    return () => window.clearTimeout(timerId);
  }, [cooldownUntil]);

  const suggestions = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].suggestions && messages[i].suggestions?.length) {
        return messages[i].suggestions as AiProductSuggestion[];
      }
    }
    return [] as AiProductSuggestion[];
  }, [messages]);

  const sendMessage = async (text: string) => {
    const content = text.trim();
    if (!content) return;
    const cooldownRemaining = Math.max(0, cooldownUntil - Date.now());
    if (cooldownRemaining > 0) {
      const seconds = Math.ceil(cooldownRemaining / 1000);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-cooldown-${Date.now()}`,
          role: "assistant",
          content: `Ban gui qua nhanh. Thu lai sau ${seconds}s.`,
        },
      ]);
      return;
    }

    const messageId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const userMessage: ChatMessage = {
      id: `user-${messageId}`,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const attemptChat = async (attempt: number): Promise<AiChatResponse> => {
      try {
        return await aiApi.chat({
          message: content,
          limit: 5,
        });
      } catch (err) {
        const apiErr = err as ApiError | null;
        const status = apiErr?.status ?? 0;
        const shouldRetry = attempt < 2 && (status === 429 || status >= 500);
        if (!shouldRetry) throw err;

        const backoff = Math.min(4000, 1000 * Math.pow(2, attempt));
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return attemptChat(attempt + 1);
      }
    };

    try {
      const response = await attemptChat(0);

      const assistantMessage: ChatMessage = {
        id: `assistant-${messageId}`,
        role: "assistant",
        content: response.reply || "Minh da nhan duoc yeu cau cua ban.",
        suggestions: response.suggestions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const apiError = error as ApiError | null;
      const isRateLimited = apiError?.status === 429;
      const status = apiError?.status ? `HTTP ${apiError.status}` : "";
      const detail = apiError?.message ? `: ${apiError.message}` : "";
      const assistantMessage: ChatMessage = {
        id: `assistant-${messageId}`,
        role: "assistant",
        content:
          isRateLimited
            ? "Xin loi, he thong dang qua tai. Thu lai sau it phut."
            : `Xin loi, hien tai minh chua the tra loi. ${status}${detail}`.trim(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
      setCooldownUntil(Date.now() + 2000);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-[320px] sm:w-[360px] h-[520px] rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.6)] overflow-hidden ring-1 ring-slate-200/70 backdrop-blur flex flex-col">
          <div className="relative overflow-hidden px-4 py-3">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 opacity-90" />
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-white">
                  AI tu van laptop
                </p>
                <p className="text-xs text-white/85">Goi y san pham nhanh</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-white/80 hover:text-white"
                  aria-label="Dong chat"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50">
            <div className="px-4 py-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_10px_24px_-18px_rgba(13,148,136,0.8)]"
                        : "bg-white/90 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-white/90 text-slate-500 border border-slate-200">
                    Dang xu ly...
                  </div>
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-4 bg-white">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  San pham goi y
                </p>
                <div className="space-y-2">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id || item.name}
                      href={item.id ? `/product/${item.id}` : "/product/list"}
                      className="block rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:border-emerald-300 hover:text-emerald-700 bg-gradient-to-r from-white to-slate-50"
                    >
                      <span className="font-semibold text-slate-900">
                        {item.name || "San pham"}
                      </span>
                      {(item.brandName || item.categoryName) && (
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          {[item.brandName, item.categoryName]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-4 space-y-3 bg-white">
            <div className="flex flex-wrap gap-2">
              {DEFAULT_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500 hover:border-emerald-300 hover:text-emerald-700 bg-white"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhap cau hoi..."
                className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canSend) {
                    event.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button
                type="button"
                disabled={!canSend}
                onClick={() => sendMessage(input)}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-slate-800"
              >
                {cooldownMs > 0 ? `Doi ${Math.ceil(cooldownMs / 1000)}s` : "Gui"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-slate-900 text-white px-4 py-3 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.8)] font-semibold text-sm hover:bg-slate-800"
        >
          AI tu van
        </button>
      )}
    </div>
  );
}
