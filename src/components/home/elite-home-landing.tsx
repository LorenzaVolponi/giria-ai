"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Loader2, MessageCircle, Search, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

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
    intent: string;
    clarificationQuestion?: string | null;
  };
};

const popularTerms = ["six seven", "farmar aura", "brainrot", "delulu", "cooked"];

function BrandMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? "h-9 w-9" : "h-11 w-11";
  return (
    <span className={`relative inline-flex ${size} items-center justify-center rounded-[38%] bg-[#d7cf00] text-[#173526] shadow-[0_10px_30px_rgba(183,176,0,0.16)]`}>
      <MessageCircle className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.2} />
      <span className="absolute -bottom-1 left-2 h-3 w-3 rotate-45 rounded-[2px] bg-[#d7cf00]" aria-hidden="true" />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#fbfaf4] bg-[#173526]" aria-hidden="true" />
    </span>
  );
}

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
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
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
    setTimeout(() => setCopied(false), 1600);
  }

  async function sendFeedback(verdict: "correct" | "incorrect") {
    if (!translation || feedback) return;
    setFeedback(verdict);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ verdict, term: translation.term, query, matchType: translation.matchType, confidence: translation.intelligence?.confidence }),
        keepalive: true,
      });
    } catch {
      setFeedback(null);
    }
  }

  const intelligence = translation?.intelligence;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf4] text-[#173526] selection:bg-[#d7cf00]/40">
      <div className="pointer-events-none fixed inset-0 opacity-70" aria-hidden="true">
        <div className="absolute -left-20 top-32 h-52 w-52 rounded-[42%] border-[24px] border-[#d7cf00]/8 sm:h-72 sm:w-72" />
        <div className="absolute -right-16 top-28 h-72 w-24 rotate-[24deg] rounded-full bg-[#d7cf00]/7 sm:h-[440px] sm:w-36" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-8 lg:px-12">
        <header className="flex h-[72px] items-center justify-between border-b border-[#173526]/10">
          <a href="/" className="flex items-center gap-3" aria-label="Gíria AI">
            <BrandMark compact />
            <div>
              <div className="text-lg font-black tracking-[-0.035em]">Gíria AI</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#173526]/42">Fala do seu jeito.</div>
            </div>
          </a>
          <nav className="hidden gap-7 text-sm font-medium text-[#173526]/60 md:flex">
            <a href="#populares" className="hover:text-[#8d8800]">Populares</a>
            <a href="#como-funciona" className="hover:text-[#8d8800]">Como funciona</a>
          </nav>
        </header>

        <section className="mx-auto w-full max-w-5xl pb-8 pt-10 text-center sm:pt-16 lg:pt-20">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[#d7cf00]/25 bg-[#fffdf0] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8f8900]">
            <Sparkles className="h-3.5 w-3.5" /> Entenda agora
          </div>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-[2.6rem] font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-[5.2rem]">
            Entenda <span className="relative inline-block text-[#b7b000] after:absolute after:-bottom-1 after:left-0 after:h-[5px] after:w-full after:rounded-full after:bg-[#d7cf00]/30 after:content-['']">qualquer</span> gíria.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-6 text-[#173526]/58 sm:text-lg sm:leading-7">
            Cole a palavra, frase ou meme. A gente explica o que significa e o que a pessoa quis dizer.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#173526]/38">Se tiver duplo sentido, a gente avisa.</p>

          <form onSubmit={(event) => void translate(event)} className="mx-auto mt-7 max-w-4xl rounded-[1.35rem] border border-[#173526]/12 bg-white p-2 shadow-[0_18px_60px_rgba(39,53,38,0.08)] sm:mt-9">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a59f00]" />
                <span className="sr-only">Cole uma gíria, frase ou meme</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cole aqui o que você não entendeu"
                  enterKeyHint="search"
                  autoComplete="off"
                  inputMode="text"
                  className="h-14 w-full rounded-2xl border-0 bg-transparent pl-12 pr-4 text-base text-[#173526] outline-none placeholder:text-[#173526]/32 sm:h-16"
                />
              </label>
              <button type="submit" disabled={loading || !query.trim()} className="inline-flex h-14 min-w-36 items-center justify-center gap-2 rounded-2xl bg-[#d7cf00] px-7 font-bold text-[#173526] transition duration-200 hover:-translate-y-0.5 hover:bg-[#c8c000] active:translate-y-0 disabled:translate-y-0 disabled:opacity-45 sm:h-16">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Explicar
              </button>
            </div>
          </form>

          <div id="populares" className="-mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 text-sm [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
            <span className="self-center whitespace-nowrap text-xs text-[#173526]/38">Tente:</span>
            {popularTerms.map((term) => (
              <button key={term} type="button" onClick={() => void translate(undefined, term)} className="min-h-10 shrink-0 snap-start rounded-full border border-[#173526]/10 bg-white/80 px-4 py-1.5 font-medium text-[#173526]/65 transition hover:border-[#d7cf00] hover:text-[#8d8800]">{term}</button>
            ))}
          </div>

          <div ref={resultRef} aria-live="polite" className="mx-auto scroll-mt-4 max-w-4xl text-left">
            {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
            {translation && !loading && (
              <article className="mt-7 overflow-hidden rounded-[1.7rem] border border-[#173526]/10 bg-white shadow-[0_24px_80px_rgba(39,53,38,0.08)]">
                <div className="flex items-start justify-between gap-4 border-b border-[#173526]/8 px-5 py-5 sm:px-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9d9700]">{translation.matchType === "approximate" ? "Pode ser isso" : translation.matchType === "contextual" ? "Nesse contexto" : "Significa"}</p>
                    <h2 className="mt-1 break-words text-2xl font-black sm:text-3xl">“{translation.term || query}”</h2>
                  </div>
                  <button type="button" onClick={() => void copyResult()} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#173526]/10 text-[#173526]/65 transition hover:border-[#d7cf00]" aria-label="Copiar resposta">{copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}</button>
                </div>
                <div className="p-5 sm:p-8">
                  <div className="rounded-[1.4rem] bg-[#f6f4d7] p-5 sm:p-6"><p className="text-lg font-bold leading-7 sm:leading-8">{translation.contextualMeaning || translation.adultTranslation || translation.meaning}</p></div>
                  {intelligence?.clarificationQuestion ? <div className="mt-4 rounded-2xl border border-[#d7cf00]/35 bg-[#fffbe6] p-4 text-sm font-semibold leading-6 text-[#665f00]">{intelligence.clarificationQuestion}</div> : null}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ResultCard label="Em outras palavras" value={translation.meaning} />
                    <ResultCard label="O que quiseram dizer" value={intelligence?.intent} />
                    <ResultCard label="Exemplo" value={translation.safeExample} />
                    <ResultCard label="Origem" value={translation.origin} />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#173526]/8 pt-5 text-sm">
                    <span className="mr-1 text-[#173526]/48">Fez sentido?</span>
                    <button type="button" onClick={() => void sendFeedback("correct")} disabled={Boolean(feedback)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#173526]/10 px-4 font-semibold text-[#173526]/68 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-60"><ThumbsUp className="h-4 w-4" />Sim</button>
                    <button type="button" onClick={() => void sendFeedback("incorrect")} disabled={Boolean(feedback)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#173526]/10 px-4 font-semibold text-[#173526]/68 hover:border-amber-500 hover:text-amber-700 disabled:opacity-60"><ThumbsDown className="h-4 w-4" />Não</button>
                    {feedback ? <span className="ml-1 text-[#173526]/42">Valeu.</span> : null}
                  </div>
                </div>
              </article>
            )}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto my-8 grid w-full max-w-5xl gap-3 sm:grid-cols-3">
          <MiniCard title="Contexto primeiro" text="A frase inteira vale mais do que a palavra isolada." />
          <MiniCard title="Sem chute" text="Quando pode ter mais de um sentido, a gente sinaliza." />
          <MiniCard title="Português claro" text="Explicação curta, direta e sem linguagem técnica." />
        </section>

        <section className="mx-auto mb-9 flex w-full max-w-5xl items-center gap-5 rounded-[1.6rem] border border-[#173526]/8 bg-[#f7f4e8] p-6 sm:p-8">
          <BrandMark />
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9d9700]">Fala do seu jeito.</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] sm:text-2xl">A internet muda a linguagem. A gente acompanha.</h2>
          </div>
        </section>

        <footer className="mt-auto flex flex-col gap-3 border-t border-[#173526]/10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-center text-[11px] leading-5 text-[#173526]/45 md:flex-row md:items-center md:justify-between md:text-left">
          <div className="font-semibold text-[#173526]/62">Gíria AI · Fala do seu jeito.</div>
          <div><span className="font-semibold text-[#173526]/62">AIX8C</span> · Um site do grupo <a href="https://volponi.tech" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#8d8800]">volponi.tech</a> · <a href="https://www.instagram.com/lorenzavolponi" target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[#8d8800]">@lorenzavolponi</a> · #01 em tecnologia no Brasil</div>
        </footer>
      </div>
    </main>
  );
}

function ResultCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <div className="rounded-2xl border border-[#173526]/8 bg-[#fcfbf7] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#173526]/35">{label}</p><p className="mt-2 text-sm leading-6 text-[#173526]/72">{value}</p></div>;
}

function MiniCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[1.25rem] border border-[#173526]/8 bg-white/80 p-5 text-left"><div className="mb-4 h-1.5 w-10 rounded-full bg-[#d7cf00]" /><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#173526]/52">{text}</p></div>;
}
