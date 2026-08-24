"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Loader2, MessageCircle, Search, Sparkles, Target, ThumbsDown, ThumbsUp, Zap, ShieldCheck } from "lucide-react";

type Translation = {
  term?: string;
  meaning?: string;
  adultTranslation?: string;
  contextualMeaning?: string;
  context?: string;
  safeExample?: string;
  origin?: string;
  matchType?: "exact" | "contextual" | "approximate" | "fallback";
  intelligence?: {
    confidence: "alta" | "media" | "baixa";
    confidenceScore: number;
    tone: "positivo" | "neutro" | "ironico" | "provocativo" | "sensivel";
    intent: string;
    platform?: string | null;
    ambiguity: boolean;
    clarificationQuestion?: string | null;
  };
};

const popularTerms = ["six seven", "farmar aura", "brainrot", "delulu", "cooked"];
const featureCards = [
  { icon: Zap, title: "Rápido", text: "Resposta direta, sem enrolação." },
  { icon: Target, title: "Contextual", text: "Entende a frase inteira, não só a palavra." },
  { icon: ShieldCheck, title: "Claro", text: "Explica em português simples e humano." },
  { icon: MessageCircle, title: "Popular", text: "Feito para a linguagem que circula na internet." },
];

export default function EliteHomeLanding() {
  const [query, setQuery] = useState("");
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function translate(event?: FormEvent, preset?: string) {
    event?.preventDefault();
    const value = (preset ?? query).trim();
    if (!value || loading) return;
    setQuery(value);
    setLoading(true);
    setError(null);
    setTranslation(null);
    setFeedback(null);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slang: value }),
      });
      const data = (await response.json()) as Translation & { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível explicar agora.");
      setTranslation(data);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível explicar agora.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!translation) return;
    await navigator.clipboard.writeText(
      [translation.term, translation.contextualMeaning || translation.adultTranslation || translation.meaning, translation.context]
        .filter(Boolean)
        .join("\n\n"),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function sendFeedback(verdict: "correct" | "incorrect") {
    if (!translation || feedback) return;
    setFeedback(verdict);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          verdict,
          term: translation.term,
          query,
          matchType: translation.matchType,
          confidence: translation.intelligence?.confidence,
        }),
        keepalive: true,
      });
    } catch {
      setFeedback(null);
    }
  }

  const intelligence = translation?.intelligence;

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf4] text-[#173526]">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-70" aria-hidden="true">
        <div className="absolute -left-24 top-40 h-72 w-72 rounded-full border-[30px] border-[#d7cf00]/10" />
        <div className="absolute -right-24 top-16 h-[460px] w-40 rotate-[24deg] bg-[#d7cf00]/8" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#173526]/10 py-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d7cf00] text-[#173526]">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xl font-black tracking-[-0.03em]">Gíria AI</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#173526]/45">Fala do seu jeito.</div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#173526]/70 md:flex">
            <a href="#populares" className="transition hover:text-[#8d8800]">Populares</a>
            <a href="#como-funciona" className="transition hover:text-[#8d8800]">Como funciona</a>
          </nav>
        </header>

        <section className="mx-auto w-full max-w-5xl pb-10 pt-16 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#d7cf00]/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8d8800]">
            <Sparkles className="h-4 w-4" /> Entenda agora
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-[3rem] font-semibold leading-[0.95] tracking-[-0.055em] text-[#173526] sm:text-6xl lg:text-[5.35rem]">
            Entenda <span className="text-[#c5bd00]">qualquer</span> gíria.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#173526]/58 sm:text-lg">
            Cole a palavra, frase ou meme. A gente explica o que significa e o que a pessoa quis dizer.
          </p>

          <form onSubmit={(event) => void translate(event)} className="mx-auto mt-9 max-w-4xl rounded-[1.4rem] border border-[#173526]/12 bg-white p-2 shadow-[0_18px_60px_rgba(39,53,38,0.08)]">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a59f00]" />
                <span className="sr-only">Cole uma gíria, frase ou meme</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cole aqui o que você não entendeu"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoFocus
                  className="h-16 w-full rounded-2xl border-0 bg-transparent pl-13 pr-4 text-base text-[#173526] outline-none placeholder:text-[#173526]/35 focus:ring-0"
                />
              </label>
              <button type="submit" disabled={loading || !query.trim()} className="inline-flex h-16 min-w-36 items-center justify-center gap-2 rounded-2xl bg-[#d7cf00] px-7 font-bold text-[#173526] transition hover:bg-[#c8c000] disabled:opacity-45">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Explicar
              </button>
            </div>
          </form>

          <div id="populares" className="mt-5 flex gap-2 overflow-x-auto pb-2 text-sm sm:flex-wrap sm:justify-center sm:overflow-visible">
            <span className="self-center whitespace-nowrap text-xs text-[#173526]/40">Tente:</span>
            {popularTerms.map((term) => (
              <button key={term} type="button" onClick={() => void translate(undefined, term)} className="min-h-10 shrink-0 rounded-full border border-[#173526]/10 bg-white/75 px-4 py-1.5 font-medium text-[#173526]/68 transition hover:border-[#d7cf00] hover:text-[#8d8800]">
                {term}
              </button>
            ))}
          </div>

          <div ref={resultRef} aria-live="polite" className="mx-auto max-w-4xl text-left">
            {error && <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
            {translation && !loading && (
              <article className="mt-8 overflow-hidden rounded-[1.8rem] border border-[#173526]/10 bg-white shadow-[0_24px_80px_rgba(39,53,38,0.08)]">
                <div className="flex items-start justify-between gap-4 border-b border-[#173526]/8 px-5 py-5 sm:px-8">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9d9700]">
                      {translation.matchType === "approximate" ? "Pode ser isso" : translation.matchType === "contextual" ? "Nesse contexto" : "Significa"}
                    </p>
                    <h2 className="mt-1 text-3xl font-black text-[#173526]">“{translation.term || query}”</h2>
                  </div>
                  <button type="button" onClick={() => void copyResult()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#173526]/10 text-[#173526]/65 transition hover:border-[#d7cf00] hover:text-[#8d8800]" aria-label="Copiar resposta">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-5 sm:p-8">
                  <div className="rounded-3xl bg-[#f6f4d7] p-5 sm:p-6">
                    <p className="text-lg font-bold leading-8 text-[#173526]">{translation.contextualMeaning || translation.adultTranslation || translation.meaning}</p>
                  </div>
                  {intelligence?.clarificationQuestion ? <div className="mt-4 rounded-2xl border border-[#d7cf00]/40 bg-[#fffbe6] p-4 text-sm font-semibold leading-6 text-[#665f00]">{intelligence.clarificationQuestion}</div> : null}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <ResultCard label="Em outras palavras" value={translation.meaning} />
                    <ResultCard label="O que quiseram dizer" value={intelligence?.intent} />
                    <ResultCard label="Exemplo" value={translation.safeExample} />
                    <ResultCard label="Origem" value={translation.origin} />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#173526]/8 pt-5 text-sm">
                    <span className="mr-1 text-[#173526]/50">Fez sentido?</span>
                    <button type="button" onClick={() => void sendFeedback("correct")} disabled={Boolean(feedback)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#173526]/10 px-3.5 font-semibold text-[#173526]/70 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-60"><ThumbsUp className="h-4 w-4" />Sim</button>
                    <button type="button" onClick={() => void sendFeedback("incorrect")} disabled={Boolean(feedback)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#173526]/10 px-3.5 font-semibold text-[#173526]/70 hover:border-amber-500 hover:text-amber-700 disabled:opacity-60"><ThumbsDown className="h-4 w-4" />Não</button>
                    {feedback ? <span className="ml-1 text-[#173526]/45">Valeu.</span> : null}
                  </div>
                </div>
              </article>
            )}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto grid w-full max-w-5xl gap-px overflow-hidden rounded-[1.6rem] border border-[#173526]/10 bg-[#173526]/10 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white/85 p-6 text-left">
              <Icon className="h-5 w-5 text-[#a59f00]" />
              <h3 className="mt-4 font-bold text-[#173526]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#173526]/55">{text}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto my-10 grid w-full max-w-5xl items-center gap-8 rounded-[1.8rem] border border-[#173526]/8 bg-[#f7f4e8] p-7 sm:p-10 md:grid-cols-[0.8fr_1.2fr]">
          <div className="flex items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white text-[#b8b000] shadow-sm">
              <MessageCircle className="h-20 w-20 stroke-[1.4]" />
              <Sparkles className="absolute -right-2 top-2 h-6 w-6" />
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9d9700]">Fala do seu jeito.</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#173526]">A internet muda a linguagem. A gente acompanha.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#173526]/58">Gírias, memes e expressões mudam rápido. O Gíria AI combina significado e contexto para explicar o que realmente está sendo dito.</p>
          </div>
        </section>

        <footer className="mt-auto flex flex-col gap-4 border-t border-[#173526]/10 py-7 text-center text-[11px] leading-5 text-[#173526]/45 md:flex-row md:items-center md:justify-between md:text-left">
          <div className="font-semibold text-[#173526]/65">Gíria AI · Fala do seu jeito.</div>
          <div><span className="font-semibold text-[#173526]/65">AIX8C</span> · Um site do grupo <a href="https://volponi.tech" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#8d8800]">volponi.tech</a> · <a href="https://www.instagram.com/lorenzavolponi" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#8d8800]">@lorenzavolponi</a> · #01 em tecnologia no Brasil</div>
        </footer>
      </div>
    </main>
  );
}

function ResultCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <div className="rounded-2xl border border-[#173526]/8 bg-[#fbfaf4] p-4"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#173526]/35">{label}</p><p className="mt-2 text-sm leading-6 text-[#173526]/72">{value}</p></div>;
}
