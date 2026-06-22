"use client";

import { Leaf, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CHAT_PREFILL_EVENT, type ChatPrefillDetail } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Сколько стоит газон 100 м²?",
  "Когда лучше сажать туи?",
  "Какие растения для тенистого участка?",
  "С чего начать проект сада?",
];

const INITIAL_GREETING: Message = {
  role: "assistant",
  content:
    "Здравствуйте! Я ИИ-консультант бюро «Город-сад». Расскажите о вашем участке или задайте вопрос — помогу разобраться.",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Автоскролл к низу при новом сообщении
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Фокус на инпут при открытии
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Открытие чата с предзаполненным вопросом (напр. со страницы растения).
  useEffect(() => {
    function onPrefill(e: Event) {
      const detail = (e as CustomEvent<ChatPrefillDetail>).detail;
      if (!detail?.text) return;
      setOpen(true);
      setInput(detail.text);
      setTimeout(() => inputRef.current?.focus(), 140);
    }
    window.addEventListener(CHAT_PREFILL_EVENT, onPrefill as EventListener);
    return () => window.removeEventListener(CHAT_PREFILL_EVENT, onPrefill as EventListener);
  }, []);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;

    const next: Message[] = [...messages, { role: "user", content: clean }];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply: string =
        typeof data?.reply === "string"
          ? data.reply
          : "Извините, не удалось получить ответ. Попробуйте позвонить 8-937-038-83-44.";
      setMessages((cur) => [...cur, { role: "assistant", content: reply }]);
    } catch {
      setMessages((cur) => [
        ...cur,
        {
          role: "assistant",
          content:
            "Извините, связь временно прервалась. Позвоните 8-937-038-83-44 — там вам всегда ответят.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        type="button"
        aria-label="Открыть ИИ-консультанта"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-aqua-glow transition-all duration-300",
          "bg-gs-fresh text-pine-950 hover:brightness-110",
          open && "rotate-90 scale-95",
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Панель чата */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-40 flex w-[min(380px,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-pine-900/95 shadow-card backdrop-blur-md transition-all duration-300",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
        style={{ height: "min(560px, calc(100vh - 8rem))" }}
      >
        {/* Шапка */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-pine-800/60 px-4 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-aqua-400/15 ring-1 ring-aqua-400/30">
            <Sparkles className="h-4 w-4 text-aqua-400" />
          </div>
          <div className="flex-1">
            <div className="font-display text-lg leading-none text-aqua-400">
              ИИ-консультант
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-mist/50">
              онлайн · отвечает за секунды
            </div>
          </div>
        </div>

        {/* Лента сообщений */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {m.role === "assistant" && (
                  <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua-400/15 ring-1 ring-aqua-400/30">
                    <Leaf className="h-3.5 w-3.5 text-aqua-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-aqua-400 text-pine-950"
                      : "bg-white/[0.06] text-mist/90 ring-1 ring-white/10",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-2">
                <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua-400/15 ring-1 ring-aqua-400/30">
                  <Leaf className="h-3.5 w-3.5 text-aqua-400 animate-pulse" />
                </div>
                <div className="rounded-2xl bg-white/[0.06] px-3.5 py-2.5 text-sm text-mist/60 ring-1 ring-white/10">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>·</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Чипсы-подсказки только при пустом диалоге */}
          {messages.length === 1 && !busy && (
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-mist/80 transition hover:border-aqua-400/40 hover:text-aqua-400"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Инпут */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 border-t border-white/10 bg-pine-800/40 p-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Спросите о саде..."
            rows={1}
            disabled={busy}
            className="max-h-28 flex-1 resize-none rounded-xl border border-white/10 bg-pine-950/60 px-3 py-2 text-sm text-mist placeholder:text-mist/40 focus:border-aqua-400/50 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label="Отправить"
            disabled={busy || !input.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gs-fresh text-pine-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
