import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Trophy } from "lucide-react";
import { getCategoryLabel, getRankingTerms, getRiskLabel } from "@/lib/growth";

export const metadata: Metadata = {
  title: "Ranking de Gírias Brasileiras | Gíria AI",
  description: "Ranking público de gírias brasileiras para descobrir significados, contexto, risco e termos populares no Gíria AI.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/ranking` },
};

export default function RankingPage() {
  const terms = getRankingTerms(100);
  const topTen = terms.slice(0, 10);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-emerald-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 dark:text-gray-50 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Ranking de Gírias Brasileiras",
            url: `${site}/ranking`,
            itemListElement: topTen.map((term, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: term.term,
              url: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
            })),
          }),
        }}
      />
      <div className="mx-auto max-w-5xl space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao Gíria AI
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-yellow-200 bg-white/85 p-6 shadow-xl dark:border-yellow-900 dark:bg-gray-900/80 sm:p-10">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-yellow-300/25 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-3 inline-flex items-center rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-yellow-950">
              <Trophy className="mr-1 h-3 w-3" /> Top gírias
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Ranking de gírias brasileiras para busca orgânica.</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              Uma vitrine pública para descobrir termos populares, abrir páginas de significado e fortalecer links internos do glossário.
            </p>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {topTen.map((term, index) => (
            <Link
              key={term.term}
              href={`/o-que-significa/${encodeURIComponent(term.term)}`}
              className="rounded-2xl border border-yellow-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md dark:border-yellow-900/60 dark:bg-gray-900"
            >
              <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-black text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-200">#{index + 1}</span>
              <h2 className="mt-3 text-lg font-black">{term.term}</h2>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{term.meaning}</p>
            </Link>
          ))}
        </section>

        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            <h2 className="text-xl font-black">Lista completa para explorar</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {terms.map((term, index) => (
              <Link
                key={term.term}
                href={`/girias/${encodeURIComponent(term.term)}`}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-gray-400">#{index + 1}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                    {getRiskLabel(term.riskLevel)}
                  </span>
                </div>
                <h3 className="font-black">{term.term}</h3>
                <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{getCategoryLabel(term.category)}</p>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{term.meaning}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
