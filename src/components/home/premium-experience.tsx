"use client";

import { FormEvent, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Copy,
  Loader2,
  MessageCircle,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type Mode = "translate" | "chat";

type Translation = {
  term?: string;
  meaning?: string;
  adultTranslation?: string;
  context?: string;
  category?: string;
  riskLabel?: string;
  safeExample?: string;
  origin?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starters = [
  "Meu filho falou que eu estou farmando aura. É elogio?",
  "Qual a diferença entre cringe e vergonha alheia?",
  "O que significa cooked em uma conversa?",
];

export default function PremiumExperience() {
  const [mode, setMode] = useState<Mode>("translate");
  const [query, setQuery] = useState("");
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function translate(event?: FormEvent) {
    event?.preventDefault();
    const value = query.trim();
    if (!value || loading) return;

    setLoading(true);
    setError(null);
    setTranslation(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slang: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível traduzir agora.");
      setTranslation(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível traduzir agora.");
    } finally {
      setLoading(false);
    }
  }

  async function sendChat(text?: string) {
    const value = (text ?? query).trim();
    if (!value || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: value }];
    setMessages(nextMessages);
    setQuery("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: value,
          history: nextMessages.slice(-8),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "A IA não conseguiu responder agora.");
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.response || "Não encontrei uma resposta segura para isso." },
      ]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "A IA não conseguiu responder agora.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === "translate") void translate();
    else void sendChat();
  }

  async function copyResult() {
    if (!translation) return;
    const text = [
      translation.term,
      translation.meaning,
      translation.adultTranslation,
      translation.context,
    ]
      .filter(Boolean)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function reset() {
    setQuery("");
    setTranslation(null);
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <section id="tradutor" className="relative overflow-hidden border-t border-slate-200 bg-slate-950 py-20 text-white dark:border-slate-800 sm:py-28">
      <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="absolute -bottom-44 -right-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            <WandSparkles className="h-4 w-4" /> Experiência Gíria AI
          </div>
          <h2 className="mt-6 text-balance text-4xl font-black tracking-[-0.045em] sm:text-6xl">
            Uma busca rápida quando você sabe a palavra. Uma conversa quando precisa entender a situação.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Escolha o modo ideal. A mesma inteligência, sem navegar entre interfaces diferentes.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white shadow-[0_40px_140px_rgba(0,0,0,0.35)]">
          <div className="grid border-b border-slate-200 bg-slate-50 p-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("translate")}
              className={`flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-black transition ${
                mode === "translate"
                  ? "bg-slate-950 text-white shadow-lg"
                  : "text-slate-500 hover:bg-white hover:text-slate-950"
              }`}
            >
              <Search className="h-4 w-4" /> Traduzir uma gíria
            </button>
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={`flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-black transition ${
                mode === "chat"
                  ? "bg-emerald-500 text-slate-950 shadow-lg"
                  : "text-slate-500 hover:bg-white hover:text-slate-950"
              }`}
            >
              <Bot className="h-4 w-4" /> Perguntar à IA
            </button>
          </div>

          <div className="grid min-h-[620px] lg:grid-cols-[0.82fr_1.18fr]">
            <aside className="border-b border-slate-200 bg-slate-50 p-6 text-slate-950 lg:border-b-0 lg:border-r sm:p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  {mode === "translate" ? <Sparkles className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">{mode === "translate" ? "Resposta direta" : "Análise contextual"}</p>
                  <h3 className="text-xl font-black">{mode === "translate" ? "Descubra em segundos" : "Converse naturalmente"}</h3>
                </div>
              </div>

              <p className="mt-6 text-sm leading-7 text-slate-600">
                {mode === "translate"
                  ? "Ideal para descobrir rapidamente o significado, origem, exemplo e contexto de uma expressão."
                  : "Ideal para frases completas, comparações, dúvidas de pais e situações em que o tom muda o significado."}
              </p>

              <div className="mt-7 space-y-3">
                {["Linguagem clara", "Contexto brasileiro", "Sem julgamento"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {item}
                  </div>
                ))}
              </div>

              {mode === "chat" && (
                <div className="mt-8">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Experimente perguntar</p>
                  <div className="mt-3 space-y-2">
                    {starters.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => void sendChat(starter)}
                        className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-semibold leading-6 text-slate-600 transition hover:border-emerald-300 hover:text-slate-950 hover:shadow-md"
                      >
                        {starter}
                        <ArrowRight className="ml-2 inline h-3.5 w-3.5 transition group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <div className="flex min-h-[620px] flex-col bg-white text-slate-950">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sm:px-8">
                <div className="flex items-center gap-3">
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Bot className="h-5 w-5" />
                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </span>
                  <div>
                    <p className="font-black">Gíria AI</p>
                    <p className="text-xs text-slate-400">Especialista em cultura digital brasileira</p>
                  </div>
                </div>
                <button type="button" onClick={reset} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title="Recomeçar">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-8">
                {mode === "translate" ? (
                  <div className="h-full">
                    {!translation && !loading && (
                      <div className="flex h-full min-h-[330px] flex-col items-center justify-center text-center">
                        <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                          <Search className="h-7 w-7" />
                        </span>
                        <h4 className="mt-6 text-2xl font-black">Qual expressão você quer entender?</h4>
                        <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">Digite uma palavra, abreviação, frase ou meme. A resposta aparecerá aqui organizada para leitura rápida.</p>
                      </div>
                    )}

                    {loading && (
                      <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
                        <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
                        <p className="mt-4 font-black">Interpretando contexto...</p>
                      </div>
                    )}

                    {translation && !loading && (
                      <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Resultado</p>
                            <h4 className="mt-1 text-3xl font-black tracking-tight">“{translation.term || query}”</h4>
                          </div>
                          <button type="button" onClick={() => void copyResult()} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50">
                            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>

                        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Em português claro</p>
                          <p className="mt-3 text-lg font-bold leading-8 text-slate-800">{translation.adultTranslation || translation.meaning}</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <ResultCard label="Significado" value={translation.meaning} />
                          <ResultCard label="Contexto" value={translation.context} />
                          <ResultCard label="Exemplo" value={translation.safeExample} />
                          <ResultCard label="Origem" value={translation.origin} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {translation.category && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{translation.category}</span>}
                          {translation.riskLabel && <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">{translation.riskLabel}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.length === 0 && !loading && (
                      <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
                        <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600">
                          <Bot className="h-7 w-7" />
                        </span>
                        <h4 className="mt-6 text-2xl font-black">Pode contar a situação completa.</h4>
                        <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">A IA interpreta tom, intenção e contexto — não apenas palavras isoladas.</p>
                      </div>
                    )}

                    {messages.map((message, index) => (
                      <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-3xl px-5 py-4 text-sm leading-7 ${message.role === "user" ? "rounded-br-md bg-slate-950 text-white" : "rounded-bl-md border border-emerald-100 bg-emerald-50 text-slate-700"}`}>
                          {message.role === "assistant" ? <ReactMarkdown>{message.content}</ReactMarkdown> : message.content}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-3 rounded-3xl rounded-bl-md border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                          <Loader2 className="h-4 w-4 animate-spin" /> Analisando o contexto...
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
                )}
              </div>

              <form onSubmit={submit} className="border-t border-slate-100 bg-white p-4 sm:p-6">
                <div className="flex gap-2 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-2 transition focus-within:border-emerald-400 focus-within:bg-white focus-within:shadow-lg">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={mode === "translate" ? "Digite uma gíria, frase ou meme..." : "Conte o que aconteceu ou faça sua pergunta..."}
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${mode === "translate" ? "bg-slate-950 text-white hover:bg-emerald-600" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"}`}
                    aria-label={mode === "translate" ? "Traduzir" : "Enviar pergunta"}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "translate" ? <ArrowRight className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Respostas educativas. O contexto sempre importa.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  );
}
