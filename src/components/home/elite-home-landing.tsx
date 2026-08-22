"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Loader2, Search, Sparkles } from "lucide-react";

type Translation = { term?: string; meaning?: string; adultTranslation?: string; context?: string; safeExample?: string; origin?: string; matchType?: "exact" | "approximate" | "fallback" };
const popularTerms = ["six seven", "farmar aura", "brainrot", "delulu", "cooked"];

export default function EliteHomeLanding() {
  const [query, setQuery] = useState("");
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function translate(event?: FormEvent, preset?: string) {
    event?.preventDefault();
    const value = (preset ?? query).trim();
    if (!value || loading) return;
    setQuery(value); setLoading(true); setError(null); setTranslation(null);
    try {
      const response = await fetch("/api/translate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slang: value }) });
      const data = (await response.json()) as Translation & { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível traduzir agora.");
      setTranslation(data);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível traduzir agora."); }
    finally { setLoading(false); }
  }

  async function copyResult() {
    if (!translation) return;
    await navigator.clipboard.writeText([translation.term, translation.adultTranslation || translation.meaning, translation.context].filter(Boolean).join("\n\n"));
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  return <main className="min-h-screen bg-white text-[#111] dark:bg-slate-950 dark:text-white">
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-16 pt-6 sm:px-8 sm:pt-10 lg:px-10">
      <div className="flex items-center gap-2 text-sm font-black tracking-tight"><span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950"><Sparkles className="h-4 w-4" /></span>Gíria AI</div>
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Fala do seu jeito.</p>
        <h1 className="mt-5 text-balance text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-[5rem]">Que porra isso quer dizer?</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-black/55 dark:text-white/55 sm:text-lg">Manda a gíria, frase, meme ou contexto exatamente como chegou em você. O Gíria AI entende e explica sem te obrigar a escolher categoria, região ou público.</p>
        <form onSubmit={(event) => void translate(event)} className="mt-8 rounded-[1.6rem] border border-black/10 bg-white p-2.5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-900">
          <div className="flex flex-col gap-2 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/30 dark:text-white/35" /><span className="sr-only">Digite uma expressão ou contexto</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Ex.: “me mandaram cooked, que significa?”' enterKeyHint="search" autoComplete="off" autoFocus className="h-16 w-full rounded-2xl border-0 bg-[#f5f6f4] pl-12 pr-4 text-base outline-none placeholder:text-black/35 focus:bg-white focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950 dark:placeholder:text-white/35" /></label><button type="submit" disabled={loading || !query.trim()} className="inline-flex h-16 min-w-36 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40 dark:bg-white dark:text-slate-950">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}Entender</button></div>
        </form>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 text-sm sm:flex-wrap sm:justify-center sm:overflow-visible">{popularTerms.map((term) => <button key={term} type="button" onClick={() => void translate(undefined, term)} className="min-h-11 shrink-0 rounded-full border border-black/10 px-4 py-2 font-medium text-black/60 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:text-white/65">{term}</button>)}</div>
        <div ref={resultRef} aria-live="polite" className="text-left">{error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</div>}{translation && !loading && <article className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-8"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">{translation.matchType === "approximate" ? "Melhor aproximação" : "Entendi"}</p><h2 className="mt-1 text-3xl font-black">“{translation.term || query}”</h2></div><button type="button" onClick={() => void copyResult()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700" aria-label="Copiar resposta">{copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}</button></div><div className="p-5 sm:p-8"><div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30"><p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Direto ao ponto</p><p className="mt-3 text-lg font-bold leading-8">{translation.adultTranslation || translation.meaning}</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><ResultCard label="O que significa" value={translation.meaning} /><ResultCard label="Nesse contexto" value={translation.context} /><ResultCard label="Como aparece" value={translation.safeExample} /><ResultCard label="De onde vem" value={translation.origin} /></div></div></article>}</div>
      </section>
    </div>
  </main>;
}

function ResultCard({ label, value }: { label: string; value?: string }) { if (!value) return null; return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{value}</p></div>; }
