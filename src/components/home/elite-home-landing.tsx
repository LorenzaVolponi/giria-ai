"use client";

import { FormEvent, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Copy,
  Instagram,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Quote,
  ShieldCheck,
  Smile,
  Sparkles,
  Sun,
  Target,
  ThumbsDown,
  ThumbsUp,
  Zap,
} from "lucide-react";

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
const benefits = [
  { icon: Zap, title: "Rápido", text: "Respostas diretas\ne sem enrolação." },
  { icon: Target, title: "Contextual", text: "Entendemos a frase inteira,\nnão só a palavra." },
  { icon: ShieldCheck, title: "Confiável", text: "Explicações claras,\nhumanas e atualizadas." },
  { icon: LockKeyhole, title: "Privado", text: "Sua pesquisa não fica\nsalva nem é exposta." },
];

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`relative inline-flex ${small ? "h-9 w-9" : "h-11 w-11"} items-center justify-center rounded-full bg-[#d5ce00] text-white`}>
      <MessageCircle className={small ? "h-5 w-5" : "h-6 w-6"} strokeWidth={2.2} />
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
    <main className="min-h-screen overflow-x-hidden bg-[#fffefa] text-[#173526] selection:bg-[#d8d100]/25">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute -left-[108px] top-[150px] h-[285px] w-[285px] rounded-full border-[25px] border-[#e6df73]/18" />
        <div className="absolute -right-[72px] top-[85px] h-[385px] w-[95px] rotate-[25deg] bg-[#e6df73]/17" />
        <div className="absolute -right-[128px] top-[85px] h-[385px] w-[95px] -rotate-[25deg] bg-[#e6df73]/17" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col">
        <header className="flex h-[88px] items-center justify-between border-b border-[#173526]/10 px-6 md:px-12 lg:px-16">
          <a href="/" className="flex items-center gap-3" aria-label="Gíria AI">
            <LogoMark />
            <div>
              <div className="text-[27px] font-black leading-none tracking-[-0.04em] text-[#173526]">Gíria AI</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.25em] text-[#173526]/42">Fala do seu jeito.</div>
            </div>
          </a>
          <nav className="hidden items-center gap-10 text-[15px] font-medium text-[#111] md:flex">
            <a href="#populares" className="transition hover:text-[#989100]">Populares</a>
            <a href="#sobre" className="transition hover:text-[#989100]">Sobre</a>
            <a href="#como-funciona" className="transition hover:text-[#989100]">Como funciona</a>
            <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d9d5c4] bg-white px-4 text-sm font-medium text-[#222] shadow-[0_2px_10px_rgba(0,0,0,.02)]">
              <Sun className="h-4 w-4" /> Claro
            </button>
          </nav>
        </header>

        <section className="mx-auto w-full max-w-[1080px] px-5 pb-7 pt-14 text-center sm:pt-16 lg:pt-[56px]">
          <div className="mx-auto inline-flex h-10 items-center gap-2 rounded-full bg-[#f6f2cf] px-5 text-[12px] font-extrabold uppercase tracking-[0.2em] text-[#a19a00]">
            <Sparkles className="h-4 w-4" /> Entenda agora
          </div>

          <h1 className="mx-auto mt-5 max-w-[900px] text-balance text-[3.2rem] font-semibold leading-[0.96] tracking-[-0.06em] text-[#173526] sm:text-6xl lg:text-[5rem]">
            Entenda <span className="text-[#cfc700]">qualquer</span> gíria.
          </h1>
          <p className="mx-auto mt-6 max-w-[650px] text-[18px] leading-7 text-[#4a4d57] sm:text-[20px] sm:leading-8">
            Cole a palavra, frase ou meme. A gente explica<br className="hidden sm:block" /> o que significa e o que a pessoa quis dizer.
          </p>

          <form onSubmit={(event) => void translate(event)} className="mx-auto mt-9 max-w-[860px] rounded-[20px] border border-[#d9d4bd] bg-white p-2.5 shadow-[0_15px_38px_rgba(78,64,20,0.07)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative flex-1">
                <MessageCircle className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#cfc700]" strokeWidth={1.8} />
                <span className="sr-only">Cole uma gíria, frase ou meme</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value.slice(0, 200))}
                  maxLength={200}
                  placeholder="Cole aqui o que você não entendeu"
                  enterKeyHint="search"
                  autoComplete="off"
                  className="h-16 w-full rounded-2xl border-0 bg-transparent pl-14 pr-20 text-base text-[#173526] outline-none placeholder:text-[#92939a] sm:pr-24"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#70717a]">{query.length}/200</span>
              </label>
              <button type="submit" disabled={loading || !query.trim()} className="inline-flex h-14 min-w-[135px] items-center justify-center gap-3 rounded-[14px] bg-[#d8d100] px-6 text-base font-semibold text-[#111] transition hover:bg-[#c8c100] disabled:opacity-45 sm:h-14">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Explicar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div id="populares" className="mt-7 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="mr-1 text-[#5d5f67]">Tente:</span>
            {popularTerms.map((term) => (
              <button key={term} type="button" onClick={() => void translate(undefined, term)} className="rounded-full border border-[#ddd8c8] bg-white px-4 py-2 text-[15px] font-medium text-[#222] shadow-[0_2px_8px_rgba(0,0,0,.02)] transition hover:border-[#d8d100] hover:text-[#8e8700]">
                {term}
              </button>
            ))}
          </div>

          <div ref={resultRef} aria-live="polite" className="mx-auto max-w-[860px] scroll-mt-4 text-left">
            {error && <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}
            {translation && !loading && (
              <article className="mt-8 overflow-hidden rounded-[24px] border border-[#d9d4bd] bg-white shadow-[0_18px_48px_rgba(78,64,20,0.08)]">
                <div className="flex items-start justify-between gap-4 border-b border-[#173526]/8 px-6 py-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9d9700]">{translation.matchType === "approximate" ? "Pode ser isso" : translation.matchType === "contextual" ? "Nesse contexto" : "Significa"}</p>
                    <h2 className="mt-1 text-2xl font-black sm:text-3xl">“{translation.term || query}”</h2>
                  </div>
                  <button type="button" onClick={() => void copyResult()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#173526]/10 text-[#173526]/65" aria-label="Copiar resposta">
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="rounded-[18px] bg-[#f7f4d7] p-5"><p className="text-lg font-bold leading-7">{translation.contextualMeaning || translation.adultTranslation || translation.meaning}</p></div>
                  {intelligence?.clarificationQuestion ? <div className="mt-4 rounded-2xl border border-[#d7cf00]/35 bg-[#fffbe6] p-4 text-sm font-semibold leading-6 text-[#665f00]">{intelligence.clarificationQuestion}</div> : null}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ResultCard label="Em outras palavras" value={translation.meaning} />
                    <ResultCard label="O que quiseram dizer" value={intelligence?.intent} />
                    <ResultCard label="Exemplo" value={translation.safeExample} />
                    <ResultCard label="Origem" value={translation.origin} />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#173526]/8 pt-5 text-sm">
                    <span className="mr-1 text-[#173526]/48">Fez sentido?</span>
                    <button type="button" onClick={() => void sendFeedback("correct")} disabled={Boolean(feedback)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#173526]/10 px-4 font-semibold text-[#173526]/68"><ThumbsUp className="h-4 w-4" />Sim</button>
                    <button type="button" onClick={() => void sendFeedback("incorrect")} disabled={Boolean(feedback)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#173526]/10 px-4 font-semibold text-[#173526]/68"><ThumbsDown className="h-4 w-4" />Não</button>
                    {feedback ? <span className="ml-1 text-[#173526]/42">Valeu.</span> : null}
                  </div>
                </div>
              </article>
            )}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto mt-5 w-full max-w-[1060px] px-5">
          <div className="grid overflow-hidden rounded-[18px] border border-[#ded9c7] bg-white shadow-[0_12px_34px_rgba(78,64,20,0.035)] sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className={`flex min-h-[128px] items-center gap-5 px-7 py-6 ${index ? "border-t border-[#ece8dd] sm:border-l sm:border-t-0" : ""}`}>
                <Icon className="h-8 w-8 shrink-0 text-[#a69f00]" strokeWidth={1.8} />
                <div className="text-left">
                  <h3 className="text-[15px] font-bold text-[#173526]">{title}</h3>
                  <p className="mt-2 whitespace-pre-line text-[13px] leading-5 text-[#6f7178]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="sobre" className="mx-auto my-11 w-full max-w-[1020px] px-5">
          <div className="grid min-h-[215px] items-center gap-8 rounded-[22px] border border-[#ded9c7] bg-[#fcfaf0] px-8 py-8 shadow-[0_10px_30px_rgba(78,64,20,0.025)] md:grid-cols-[0.8fr_1.2fr] md:px-14">
            <div className="relative mx-auto flex h-[150px] w-[150px] items-center justify-center rounded-full bg-white text-[#b6ae00]">
              <MessageCircle className="h-[76px] w-[76px]" strokeWidth={1.8} />
              <Sparkles className="absolute right-3 top-2 h-5 w-5" />
              <CircleHelp className="absolute -right-1 top-14 h-5 w-5" />
              <Smile className="absolute right-5 bottom-5 h-5 w-5" />
              <Quote className="absolute left-1 bottom-5 h-5 w-5" />
            </div>
            <div className="text-left">
              <h2 className="text-[30px] font-semibold tracking-[-0.04em] text-[#173526]">Fala do seu jeito.</h2>
              <p className="mt-3 max-w-[520px] text-[14px] leading-6 text-[#5f6269]">
                Gírias mudam o tempo todo. O Gíria AI acompanha a cultura, os memes e o jeito que a internet fala pra você sempre entender tudo.
              </p>
              <a href="#como-funciona" className="mt-6 inline-flex items-center gap-3 text-sm font-semibold text-[#aaa300]">Saiba como funciona <ArrowRight className="h-4 w-4" /></a>
            </div>
          </div>
        </section>

        <footer className="mt-auto border-t border-[#173526]/10 bg-white/35 px-6 py-6 md:px-12 lg:px-16">
          <div className="mx-auto grid max-w-[1320px] items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <LogoMark small />
              <div>
                <div className="text-xl font-black tracking-[-0.04em]">Gíria AI</div>
                <div className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#173526]/42">Fala do seu jeito.</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-7 text-[#111]">
              <Instagram className="h-5 w-5" strokeWidth={1.8} />
              <TikTokIcon />
              <XIcon />
            </div>
            <div className="text-center text-[12px] leading-5 text-[#222] md:text-right">
              <div><strong>AIX8C</strong> - Um site do grupo volponi.tech !</div>
              <div>@lorenzavolponi &nbsp;&nbsp; #01 em tecnologia no Brasil</div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function ResultCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <div className="rounded-2xl border border-[#173526]/8 bg-[#fbfaf4] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#999200]">{label}</p><p className="mt-2 text-sm leading-6 text-[#4f5552]">{value}</p></div>;
}

function TikTokIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4v10.3a4.3 4.3 0 1 1-3.4-4.2"/><path d="M14 4c1.1 2.3 2.8 3.6 5 3.8"/></svg>;
}

function XIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 4l14 16"/><path d="M19 4L5 20"/></svg>;
}
