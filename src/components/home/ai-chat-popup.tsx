"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertCircle,
  ArrowUp,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  MessageCircle,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ConciergeContext = {
  platform?: string;
  tone?: string;
  generation?: string;
  relationship?: string;
  risk?: string;
  confidence?: number;
};

type ConciergeResponse = {
  response?: string;
  suggestions?: string[];
  context?: ConciergeContext;
  error?: string;
};

const starters = [
  "O que significa 'farmar aura'?",
  "Colei uma frase. Foi ironia ou provocação?",
  "Como respondo sem parecer perdido?",
];

const typingLabels = [
  "Lendo a frase...",
  "Verificando a base...",
  "Analisando o contexto...",
  "Preparando uma resposta clara...",
];

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

function contextItems(context: ConciergeContext | null) {
  if (!context) return [];
  return [
    ["Tom", context.tone],
    ["Plataforma", context.platform],
    ["Geração", context.generation],
    ["Risco", context.risk],
  ].filter((item): item is [string, string] => Boolean(item[1]));
}

export default function AiChatPopup() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [context, setContext] = useState<ConciergeContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingIndex, setTypingIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function handleOpen(event: Event) {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const message = customEvent.detail?.message?.trim();
      setOpen(true);
      if (message) setQuery(message);
    }

    window.addEventListener("giria-ai:open", handleOpen);
    return () => window.removeEventListener("giria-ai:open", handleOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 160);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setTypingIndex((current) => (current + 1) % typingLabels.length);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: messages.length > 2 ? "smooth" : "auto",
    });
  }, [messages, loading, error, suggestions]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [query]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function sendMessage(text?: string) {
    const value = (text ?? query).trim();
    if (!value || loading) return;

    const userMessage = createMessage("user", value);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setQuery("");
    setSuggestions([]);
    setContext(null);
    setLoading(true);
    setTypingIndex(0);
    setError(null);
    setLastFailedMessage(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: value,
          history: nextMessages.slice(-10).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = (await response.json()) as ConciergeResponse;
      if (!response.ok) throw new Error(data.error || "Não consegui responder agora.");

      const answer = data.response || "Não encontrei uma interpretação segura para isso.";
      setMessages((current) => [...current, createMessage("assistant", answer)]);
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : []);
      setContext(data.context ?? null);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setLastFailedMessage(value);
      setError(reason instanceof Error ? reason.message : "Não consegui responder agora.");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setSuggestions([]);
    setContext(null);
    setQuery("");
    setError(null);
    setLastFailedMessage(null);
    setLoading(false);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  async function copyMessage(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  }

  const metadata = contextItems(context);
  const confidence = typeof context?.confidence === "number" ? context.confidence : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 flex min-h-14 items-center gap-3 rounded-full border border-white/10 bg-slate-950 px-3 py-2.5 text-white shadow-[0_18px_55px_rgba(15,23,42,0.32)] transition hover:-translate-y-0.5 sm:bottom-7 sm:right-7 sm:px-4 motion-reduce:transform-none"
        aria-label="Abrir conversa com a Gíria AI"
      >
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-white" />
        </span>
        <span className="hidden pr-1 text-left sm:block">
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Gíria AI</span>
          <span className="block text-sm font-semibold">Pergunte agora</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end bg-slate-950/45 backdrop-blur-sm sm:p-5 lg:p-7">
          <button type="button" className="absolute inset-0 hidden sm:block" onClick={() => setOpen(false)} aria-label="Fechar conversa" />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Chat com a Gíria AI"
            className="relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f7f8f7] shadow-[0_35px_110px_rgba(2,6,23,0.38)] sm:h-[min(780px,calc(100dvh-2.5rem))] sm:max-w-[520px] sm:rounded-[2rem] sm:border sm:border-white/10"
          >
            <header className="shrink-0 border-b border-slate-200/80 bg-white/95 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-xl sm:px-6 sm:pt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300">
                    <Bot className="h-5 w-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold tracking-tight text-slate-950">Gíria AI</p>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> online
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500">Traduz gíria, tom e intenção</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button type="button" onClick={reset} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100" aria-label="Recomeçar conversa">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  <button type="button" onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100" aria-label="Fechar">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col justify-center py-4">
                  <div className="mx-auto max-w-sm text-center">
                    <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-emerald-600 shadow-sm">
                      <Sparkles className="h-6 w-6" />
                    </span>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Pergunte do seu jeito</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Cole a frase completa.</h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Quanto mais contexto você trouxer, melhor eu separo significado, brincadeira, ironia e risco real.
                    </p>
                  </div>

                  <div className="mt-6 space-y-2">
                    {starters.map((starter) => (
                      <button key={starter} type="button" onClick={() => void sendMessage(starter)} className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium leading-5 text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40">
                        <span>{starter}</span>
                        <ArrowUp className="h-4 w-4 shrink-0 rotate-45 text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4" aria-live="polite">
                  {messages.map((message) => (
                    <div key={message.id} className={`group flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      {message.role === "assistant" && (
                        <span className="mr-2 mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300">
                          <Bot className="h-4 w-4" />
                        </span>
                      )}
                      <div className="relative max-w-[88%]">
                        <div className={message.role === "user"
                          ? "rounded-[1.35rem] rounded-br-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white shadow-md"
                          : "prose prose-sm max-w-none rounded-[1.35rem] rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 text-slate-700 shadow-sm prose-headings:mb-2 prose-headings:mt-3 prose-headings:text-slate-950 prose-p:my-2 prose-p:leading-6 prose-strong:text-slate-950 prose-ul:my-2 prose-li:my-0.5"}
                        >
                          {message.role === "assistant" ? <ReactMarkdown>{message.content}</ReactMarkdown> : message.content}
                        </div>
                        {message.role === "assistant" && (
                          <button type="button" onClick={() => void copyMessage(message)} className="mt-1 inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-[11px] font-semibold text-slate-400 transition hover:bg-white hover:text-slate-700" aria-label="Copiar resposta">
                            {copiedId === message.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedId === message.id ? "Copiado" : "Copiar"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <span className="mr-2 mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300"><Bot className="h-4 w-4" /></span>
                      <div className="rounded-[1.35rem] rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-500 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1" aria-hidden="true">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.24s] motion-reduce:animate-none" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.12s] motion-reduce:animate-none" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 motion-reduce:animate-none" />
                          </span>
                          <span>{typingLabels[typingIndex]}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!loading && metadata.length > 0 && messages.at(-1)?.role === "assistant" && (
                    <div className="ml-0 flex flex-wrap gap-2 sm:ml-10">
                      {metadata.map(([label, value]) => (
                        <span key={`${label}-${value}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                          <span className="text-slate-400">{label}:</span> {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {!loading && confidence !== null && messages.at(-1)?.role === "assistant" && (
                    <div className="ml-0 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm sm:ml-10">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Confiança da interpretação</span>
                        <span>{Math.round(confidence * 100)}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 motion-reduce:transition-none" style={{ width: `${Math.max(8, Math.round(confidence * 100))}%` }} />
                      </div>
                    </div>
                  )}

                  {!loading && suggestions.length > 0 && (
                    <div className="ml-0 flex flex-wrap gap-2 sm:ml-10">
                      {suggestions.map((suggestion) => (
                        <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} className="min-h-10 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>
                  {lastFailedMessage && (
                    <button type="button" onClick={() => void sendMessage(lastFailedMessage)} className="mt-3 min-h-10 rounded-full border border-red-200 bg-white px-4 text-xs font-bold text-red-700">Tentar novamente</button>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={submit} className="shrink-0 border-t border-slate-200/80 bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:p-4">
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-2 transition focus-within:border-emerald-300 focus-within:bg-white focus-within:shadow-[0_10px_32px_rgba(16,185,129,0.10)]">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={query}
                  maxLength={500}
                  disabled={loading}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Cole a frase ou conte a situação..."
                  className="min-h-12 w-full resize-none overflow-y-auto bg-transparent px-3 py-2 text-base font-medium leading-6 text-slate-950 outline-none placeholder:text-slate-400 disabled:opacity-60 sm:text-sm"
                />
                <div className="flex items-center justify-between gap-3 px-1 pb-1 pl-3">
                  <span className="text-[11px] text-slate-400">{query.length}/500</span>
                  <button type="submit" disabled={loading || !query.trim()} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-emerald-300 transition hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="Enviar mensagem">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">Base cultural própria. Confirme o contexto em situações sensíveis.</p>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
