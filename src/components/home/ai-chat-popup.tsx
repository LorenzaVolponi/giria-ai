"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Loader2, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starters = [
  "Meu filho falou que eu estou farmando aura. É elogio?",
  "Isso foi ironia ou brincadeira?",
  "Como eu posso responder sem parecer perdido?",
];

export default function AiChatPopup() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(text?: string) {
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
        body: JSON.stringify({ message: value, history: nextMessages.slice(-8) }),
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
    void sendMessage();
  }

  function reset() {
    setMessages([]);
    setQuery("");
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-slate-950 px-4 py-3 font-black text-white shadow-[0_18px_60px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:bg-emerald-600 sm:bottom-7 sm:right-7"
        aria-label="Abrir conversa com a IA"
      >
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
          <Bot className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-300" />
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-[10px] uppercase tracking-[0.16em] text-emerald-300">Gíria AI</span>
          <span className="block text-sm">Pergunte à IA</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end bg-slate-950/35 p-0 backdrop-blur-sm sm:p-6">
          <button type="button" className="absolute inset-0" onClick={() => setOpen(false)} aria-label="Fechar chat" />

          <section className="relative z-10 flex h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-white shadow-2xl sm:h-[680px] sm:rounded-[2rem]">
            <header className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-black">Gíria AI</p>
                  <p className="text-xs text-slate-400">Entendo palavra, frase e contexto</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button type="button" onClick={reset} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" title="Recomeçar">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" title="Fechar">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-5">
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col justify-center">
                  <div className="mx-auto text-center">
                    <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                      <Sparkles className="h-7 w-7" />
                    </span>
                    <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">Conte a situação completa.</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">Eu explico o significado, o tom, a intenção e como responder sem julgamento.</p>
                  </div>

                  <div className="mt-7 space-y-2">
                    {starters.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => void sendMessage(starter)}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-semibold leading-6 text-slate-600 transition hover:border-emerald-300 hover:text-slate-950 hover:shadow-sm"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[88%] rounded-3xl px-5 py-4 text-sm leading-7 ${message.role === "user" ? "rounded-br-md bg-slate-950 text-white" : "rounded-bl-md border border-emerald-100 bg-white text-slate-700 shadow-sm"}`}>
                        {message.role === "assistant" ? <ReactMarkdown>{message.content}</ReactMarkdown> : message.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-3 rounded-3xl rounded-bl-md border border-emerald-100 bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" /> Analisando contexto...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            </div>

            <form onSubmit={submit} className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-2 transition focus-within:border-emerald-400 focus-within:bg-white focus-within:shadow-lg">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pergunte sobre uma conversa ou expressão..."
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Enviar pergunta"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
