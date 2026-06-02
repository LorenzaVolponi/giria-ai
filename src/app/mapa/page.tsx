import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned, Navigation } from "lucide-react";
import { SLANG_DATA } from "@/lib/slang-data";
import { getCategoryLabel, getRiskLabel } from "@/lib/growth";

export const metadata: Metadata = {
  title: "Mapa de Gírias Brasileiras por Região | Gíria AI",
  description: "Explore gírias brasileiras por região, contexto e categoria para entender variações locais e expressões regionais.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/mapa` },
};

function regionKey(region: string) {
  const value = region?.trim() || "Brasil";
  if (/nordeste/i.test(value)) return "Nordeste";
  if (/sul/i.test(value)) return "Sul";
  if (/sudeste|rio|são paulo|sao paulo/i.test(value)) return "Sudeste";
  if (/norte|amaz/i.test(value)) return "Norte";
  if (/centro|goi|brasília|brasilia/i.test(value)) return "Centro-Oeste";
  if (/brasil|nacional|internet|geral/i.test(value)) return "Brasil geral";
  return value;
}

export default function MapaGiriasPage() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const groups = [...SLANG_DATA].reduce<Record<string, typeof SLANG_DATA>>((acc, term) => {
    const key = regionKey(term.region);
    acc[key] = acc[key] || [];
    if (acc[key].length < 18) acc[key].push(term);
    return acc;
  }, {});
  const entries = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-cyan-950 dark:text-gray-50 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Mapa de Gírias Brasileiras",
            description: "Gírias brasileiras agrupadas por região e contexto.",
            url: `${site}/mapa`,
          }),
        }}
      />
      <div className="mx-auto max-w-6xl space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao Gíria AI
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-200 bg-white/90 p-6 shadow-xl dark:border-cyan-900 dark:bg-gray-900 sm:p-10">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="mb-3 inline-flex items-center rounded-full bg-cyan-600 px-3 py-1 text-xs font-bold text-white">
              <MapPinned className="mr-1 h-3 w-3" /> Mapa regional
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Mapa de gírias brasileiras por região.</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              Uma camada de descoberta para entender regionalismos, termos nacionais e expressões que mudam de sentido conforme a bolha.
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {entries.map(([region, terms]) => (
            <article key={region} className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">{region}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{terms.length} termos em destaque</p>
                </div>
                <Navigation className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {terms.map((term) => (
                  <Link key={`${region}-${term.term}`} href={`/o-que-significa/${encodeURIComponent(term.term)}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-cyan-950/30">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="font-black">{term.term}</h3>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-900 dark:text-gray-400">{getRiskLabel(term.riskLevel)}</span>
                    </div>
                    <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">{getCategoryLabel(term.category)}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{term.meaning}</p>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
