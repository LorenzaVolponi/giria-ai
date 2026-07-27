"use client";

import { FormEvent, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type RelatedTerm = {
  term: string;
  meaning?: string;
  category?: string;
};

type Translation = {
  term?: string;
  meaning?: string;
  adultTranslation?: string;
  context?: string;
  contextNotes?: string;
  category?: string;
  riskLabel?: string;
  safeExample?: string;
  origin?: string;
  region?: string;
  popularityStatus?: string;
  variations?: string[];
  relatedTerms?: RelatedTerm[];
  matchType?: "exact" | "approximate" | "fallback";
};

const quickTerms = ["farmar aura", "sigma", "delulu", "cooked", "NPC"];

export default function PremiumExperience() {
  const [query, setQuery] = useState("");
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível traduzir agora.");
      setTranslation(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível traduzir agora.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!translation) return;
    const text = [translation.term, translation.adultTranslation, translation.context]
      .filter(Boolean)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section id="tradutor" className="border-t border-slate-200 bg-white py-20 text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Sparkles className="h-4 w-4" /> Entenda em segundos
          </div>
          <h2 className="mt-6 text-balance text-4xl font-black tracking-[-0.045em] sm:text-6xl">
            Digite. Entenda. Continue sua vida.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Uma única busca para descobrir significado, contexto, origem e exemplo — sem menu, sem cadastro e sem complicação.
          </p>
        </div>

        <form onSubmit={(event) => void translate(event)} className="mx-auto mt-10 max-w-3xl rounded-[1.75rem] border border-slate-200 bg-white p-2.5 shadow-[0_28px_90px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <span className="sr-only">Pesquisar gíria</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Digite uma gíria, frase ou meme..."
                className="h-16 w-full rounded-2xl border-0 bg-slate-50 pl-14 pr-4 text-base font-medium outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-400 dark:bg-slate-950 dark:focus:bg-slate-950"
              />
            </label>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="group inline-flex h-16 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 font-black text-white transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-400"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
              Entender
            </button>
          </div>
        </form>

        {!translation && !loading && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {quickTerms.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => void translate(undefined, term)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {translation && !loading && (
          <article className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-6 dark:border-slate-800 sm:px-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
                  {translation.matchType === "approximate" ? "Melhor aproximação" : "Resultado"}
                </p>
                <h3 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">“{translation.term || query}”</h3>
              </div>
              <button type="button" onClick={() => void copyResult()} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Em português claro</p>
                <p className="mt-3 text-lg font-bold leading-8 text-slate-800 dark:text-slate-100">{translation.adultTranslation || translation.meaning}</p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ResultCard label="Significado" value={translation.meaning} />
                <ResultCard label="Contexto" value={translation.context} />
                <ResultCard label="Exemplo" value={translation.safeExample} />
                <ResultCard label="Origem" value={translation.origin} />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {translation.category && <Tag>{translation.category}</Tag>}
                {translation.region && <Tag>{translation.region}</Tag>}
                {translation.riskLabel && <Tag>{translation.riskLabel}</Tag>}
                {translation.popularityStatus && <Tag>{translation.popularityStatus}</Tag>}
              </div>

              {translation.relatedTerms && translation.relatedTerms.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Veja também</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {translation.relatedTerms.map((item) => (
                      <button
                        key={item.term}
                        type="button"
                        onClick={() => void translate(undefined, item.term)}
                        className="rounded-full border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300"
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

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Conteúdo educativo. O contexto sempre importa.
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{children}</span>;
}
