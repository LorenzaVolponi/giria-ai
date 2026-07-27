"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowUp,
  Bot,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ConciergeResponse = {
  response?: string;
  suggestions?: string[];
  context?: {
    platform?: string;
    tone?: string;
    generation?: string;
    relationship?: string;
    risk?: string;
    confidence?: number;
  };
  error?: string;
};

const starters = [
  "Meu filho falou que eu estou farmando aura. É elogio?",
  "O que significa six seven?",
  "Isso foi ironia, zoeira ou provocação?",
];

const typingLabels = [
  "Lendo o contexto...",
  "Entendendo o tom...",
  "Conectando os sinais culturais...",
  "Preparando uma resposta clara...",
];

export default function AiChatPopup() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingIndex, setTypingIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleOpen(event: Event) {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const message = customEvent.detail?.message?.trim();
      setOpen(true);
      if (message) {
        setQuery(message);
        window.setTimeout(() => inputRef.current?.focus(), 180);
      }
    }

    window.addEventListener("giria-ai:open", handleOpen);
    return () => window.removeEventListener("giria-ai:open", handleOpen);
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setTypingIndex((current) => (current + 1) % typingLabels.length);
    }, 1150);
    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, error, suggestions]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  async function sendMessage(text?: string) {
    const value = (text ?? query).trim();
    if (!value || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: value }];
    setMessages(nextMessages);
    setQuery("");
    setSuggestions([]);
    setConfidence(null);
    setLoading(true);
    setTypingIndex(0);
    setError(null);

    try {
      const response = await fetch("/api/chat/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: value,
          history: nextMessages.slice(-10),
        }),
      });
      const data = (await response.json()) as ConciergeResponse;
      if (!response.ok) throw new Error(data.error || "Não consegui responder agora.");

      const answer = data.response || "Não encontrei uma interpretação segura para isso.";
      setMessages((current) => [...current, { role: "assistant", content: answer }]);
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : []);
      setConfidence(typeof data.context?.confidence === "number" ? data.context.confidence : null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não consegui responder agora.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  function reset() {
    setMessages([]);
    setSuggestions([]);
    setConfidence(null);
    setQuery("");
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-slate-950 px-3 py-3 text-white shadow-[0_24px_80px_rgba(15,23,42,0.32)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(16,185,129,0.24)] sm:bottom-7 sm:right-7 sm:px-4"
        aria-label="Abrir conversa com a Gíria AI"
      >
        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#a7f3d0,#34d399_58%,#059669)] text-slate-950 shadow-inner">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/20" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-300" />
        </span>
        <span className="hidden pr-1 text-left sm:block">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Gíria AI</span>
          <span className="block text-sm font-semibold">Converse comigo</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end bg-slate-950/45 p-0 backdrop-blur-md sm:p-5 lg:p-7">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-label="Fechar conversa"
          />

          <section className="relative z-10 flex h-[92dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#f7f8f7] shadow-[0_40px_120px_rgba(2,6,23,0.38)] sm:h-[760px] sm:rounded-[2rem]">
            <header className="border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-emerald-300 shadow-lg">
                    <Bot className="h-5 w-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold tracking-tight text-slate-950">Gíria AI</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> online
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">Copiloto de cultura digital brasileira</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={reset}
                      className="rounded-full p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-950"
                      title="Recomeçar conversa"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-950"
                    title="Fechar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col justify-center">
                  <div className="mx-auto max-w-sm text-center">
                    <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-600 shadow-sm">
                      <Sparkles className="h-6 w-6" />
                    </span>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Copiloto cultural</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.75rem]">
                      Me conta o que foi dito.
                    </h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                      Eu traduzo a expressão, leio o tom e explico como responder sem parecer perdido ou alarmista.
                    </p>
                  </div>

                  <div className="mt-7 space-y-2.5">
                    {starters.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => void sendMessage(starter)}
                        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-medium leading-5 text-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_12px_40px_rgba(16,185,129,0.09)]"
                      >
                        <span>{starter}</span>
                        <ArrowUp className="h-4 w-4 rotate-45 text-slate-300 transition group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <span className="mr-2 mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300">
                          <Bot className="h-4 w-4" />
                        </span>
                      )}
                      <div
                        className={
                          message.role === "user"
                            ? "max-w-[86%] rounded-[1.35rem] rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white shadow-lg"
                            : "prose prose-sm max-w-[88%] rounded-[1.35rem] rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 text-slate-700 shadow-[0_10px_35px_rgba(15,23,42,0.05)] prose-headings:mb-2 prose-headings:mt-3 prose-headings:text-slate-950 prose-p:my-2 prose-p:leading-6 prose-strong:text-slate-950 prose-ul:my-2 prose-li:my-0.5"
                        }
                      >
                        {message.role === "assistant" ? <ReactMarkdown>{message.content}</ReactMarkdown> : message.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <span className="mr-2 mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300">
                        <Bot className="h-4 w-4" />
                      </span>
                      <div className="rounded-[1.35rem] rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-500 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.24s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.12s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" />
                          </span>
                          <span>{typingLabels[typingIndex]}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!loading && confidence !== null && messages.at(-1)?.role === "assistant" && (
                    <div className="ml-10 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Confiança da interpretação</span>
                        <span>{Math.round(confidence * 100)}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                          style={{ width: `${Math.max(8, Math.round(confidence * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!loading && suggestions.length > 0 && (
                    <div className="ml-10 flex flex-wrap gap-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => void sendMessage(suggestion)}
                          className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={submit} className="border-t border-slate-200/80 bg-white p-3.5 sm:p-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2 shadow-inner transition focus-within:border-emerald-300 focus-within:bg-white focus-within:shadow-[0_12px_40px_rgba(16,185,129,0.10)]">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={query}
                  maxLength={500}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Cole uma frase, gíria ou conte a situação..."
                  className="max-h-28 min-h-12 w-full resize-none bg-transparent px-3 py-2 text-sm font-medium leading-6 text-slate-950 outline-none placeholder:text-slate-400"
                />
                <div className="flex items-center justify-between px-1 pb-1 pl-3">
                  <span className="text-[11px] text-slate-400">Enter para enviar · Shift + Enter para quebrar linha</span>
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300 transition hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Enviar mensagem"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
                Interpretação contextual baseada na base Gíria AI. Em situações de risco, confirme o contexto real.
              </p>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
