"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Copy,
  Loader2,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

type RelatedTerm = {
  term: string;
};

type Translation = {
  term?: string;
  meaning?: string;
  adultTranslation?: string;
  context?: string;
  category?: string;
  riskLabel?: string;
  safeExample?: string;
  origin?: string;
  region?: string;
  popularityStatus?: string;
  relatedTerms?: RelatedTerm[];
  matchType?: "exact" | "approximate" | "fallback";
};

const popularTerms = ["six seven", "farmar aura", "brainrot", "delulu", "cooked"];

const paths = [
  {
    title: "Em alta agora",
    description: "Expressões que estão circulando em vídeos, comentários e grupos.",
    href: "/guias/girias-do-tiktok",
    icon: TrendingUp,
    links: ["six seven", "aura farming", "cooked"],
  },
  {
    title: "Por região",
    description: "Descubra como cada parte do Brasil fala e interpreta suas expressões.",
    href: "/girias/regionais",
    icon: MapPinned,
    links: ["Paraná", "Minas Gerais", "Nordeste"],
  },
  {
    title: "Para pais e educadores",
    description: "Leitura clara para entender contexto, tom e nível de atenção.",
    href: "/guias",
    icon: ShieldCheck,
    links: ["linguagem adolescente", "memes", "internet"],
  },
];

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

    setQuery(value);
    setLoading(true);
    setError(null);
    setTranslation(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slang: value }),
      });
      const data = (await response.json()) as Translation & { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível traduzir agora.");
      setTranslation(data);
      window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível traduzir agora.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!translation) return;
    const text = [translation.term, translation.adultTranslation || translation.meaning, translation.context]
      .filter(Boolean)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="bg-[#f7f7f5] text-[#111111] dark:bg-slate-950 dark:text-white">
      <section className="relative isolate overflow-hidden border-b border-black/5 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 -z-20 hidden bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)] sm:block dark:opacity-20" />
        <div className="pointer-events-none absolute left-[18%] top-12 -z-10 hidden h-72 w-72 rounded-full bg-emerald-200/50 blur-[110px] sm:block" />

        <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-8 sm:pb-16 sm:pt-14 lg:px-10 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-400/20 dark:bg-slate-900/80 dark:text-emerald-300 sm:px-4 sm:text-[11px]">
              <Sparkles className="h-3.5 w-3.5" /> O Brasil fala. O Gíria AI explica.
            </div>

            <h1 className="mt-5 text-balance text-[2.55rem] font-semibold leading-[0.96] tracking-[-0.055em] sm:mt-8 sm:text-6xl lg:text-[5rem]">
              Entenda o que realmente quiseram dizer.
              <span className="mt-2 block bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                Sem pagar de perdido.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-black/60 dark:text-white/60 sm:mt-7 sm:text-lg sm:leading-8">
              Digite uma gíria, frase ou meme. A gente explica significado, intenção, contexto e nível de atenção em segundos.
            </p>
          </div>

          <form
            onSubmit={(event) => void translate(event)}
            className="mx-auto mt-7 max-w-3xl rounded-[1.35rem] border border-black/10 bg-white/95 p-2 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur transition focus-within:border-emerald-300 dark:border-white/10 dark:bg-slate-900/95 sm:mt-9 sm:rounded-[1.6rem] sm:p-2.5"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/30 dark:text-white/35" />
                <span className="sr-only">Pesquisar gíria</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder='Ex.: “farmar aura”, “six seven”...'
                  enterKeyHint="search"
                  autoComplete="off"
                  className="h-14 w-full rounded-xl border-0 bg-[#f5f6f4] pl-12 pr-4 text-base outline-none placeholder:text-black/35 focus:bg-white focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950 dark:placeholder:text-white/35 sm:h-16 sm:rounded-2xl"
                />
              </label>
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex h-14 min-w-36 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 font-semibold text-white transition motion-safe:hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 sm:h-16 sm:rounded-2xl"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Entender
              </button>
            </div>
          </form>

          <div className="mx-auto mt-4 flex max-w-3xl gap-2 overflow-x-auto pb-2 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible">
            {popularTerms.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => void translate(undefined, term)}
                className="min-h-11 shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 font-medium text-black/65 transition motion-safe:hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-slate-900 dark:text-white/70"
              >
                {term}
              </button>
            ))}
          </div>

          <div ref={resultRef} aria-live="polite" className="mx-auto max-w-4xl">
            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {translation && !loading && (
              <article className="mt-7 overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900 sm:mt-10 sm:rounded-[2rem]">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-8 sm:py-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600 sm:text-xs">
                      {translation.matchType === "approximate" ? "Melhor aproximação" : "Resultado"}
                    </p>
                    <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">“{translation.term || query}”</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyResult()}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    aria-label="Copiar resultado"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="p-5 sm:p-8">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30 sm:rounded-3xl sm:p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300 sm:text-xs">Em português claro</p>
                    <p className="mt-3 text-base font-bold leading-7 text-slate-800 dark:text-slate-100 sm:text-lg sm:leading-8">
                      {translation.adultTranslation || translation.meaning}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
                    <ResultCard label="Significado" value={translation.meaning} />
                    <ResultCard label="Contexto" value={translation.context} />
                    <ResultCard label="Exemplo" value={translation.safeExample} />
                    <ResultCard label="Origem" value={translation.origin} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                    {[translation.category, translation.region, translation.riskLabel, translation.popularityStatus]
                      .filter(Boolean)
                      .map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {tag}
                        </span>
                      ))}
                  </div>

                  {translation.relatedTerms && translation.relatedTerms.length > 0 && (
                    <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-xs">Veja também</p>
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
                        {translation.relatedTerms.slice(0, 6).map((item) => (
                          <button
                            key={item.term}
                            type="button"
                            onClick={() => void translate(undefined, item.term)}
                            className="min-h-11 shrink-0 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300"
                          >
                            {item.term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-black/40 dark:text-white/40 sm:text-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" /> Conteúdo educativo. Em situações de risco, confirme o contexto real.
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-black/10 pb-7 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">Explore a cultura digital</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Fácil para quem só quer entender.</h2>
          </div>
          <Link href="/girias" className="inline-flex min-h-11 items-center gap-2 font-semibold text-black/65 transition hover:text-[#007f5d] dark:text-white/65">
            Ver dicionário completo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10 lg:grid-cols-3">
          {paths.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="group bg-white p-6 transition hover:bg-[#fbfbf9] dark:bg-slate-900 dark:hover:bg-slate-900/80 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f1ef] text-black/70 dark:bg-slate-800 dark:text-white/70">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-black/25 transition group-hover:translate-x-1 group-hover:text-[#007f5d] dark:text-white/25" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight sm:mt-7">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-black/55 dark:text-white/55 sm:min-h-20">{item.description}</p>
                <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                  {item.links.map((link) => (
                    <span key={link} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-black/50 dark:border-white/10 dark:text-white/50">
                      {link}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-3 text-sm text-black/50 dark:text-white/50">
          <BookOpen className="h-4 w-4" /> Conteúdo organizado para consulta rápida, pesquisa e aprofundamento.
        </div>
      </section>
    </main>
  );
}

function ResultCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-xs">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  );
}
