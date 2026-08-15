import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Observatório de gírias e cultura digital",
  description:
    "Veja um retrato transparente do acervo do Gíria AI: termos catalogados, categorias, regiões, variações e sinais de popularidade registrados na base.",
  alternates: { canonical: `${site}/observatorio` },
  openGraph: {
    title: "Observatório de gírias e cultura digital | Gíria AI",
    description:
      "Dados agregados do próprio acervo do Gíria AI para acompanhar a diversidade de gírias, contextos e regionalismos catalogados.",
    url: `${site}/observatorio`,
    type: "website",
  },
};

function rank(values: string[], limit = 8) {
  const counts = new Map<string, number>();
  for (const rawValue of values) {
    const value = rawValue?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export default function ObservatorioPage() {
  const totalTerms = SLANG_DATA.length;
  const totalVariations = SLANG_DATA.reduce((sum, term) => sum + (term.variations?.length || 0), 0);
  const categories = new Set(SLANG_DATA.map((term) => term.category).filter(Boolean)).size;
  const regions = new Set(SLANG_DATA.map((term) => term.region).filter(Boolean)).size;
  const trending = SLANG_DATA.filter((term) => term.popularityStatus === "trending").length;
  const regional = SLANG_DATA.filter((term) => term.popularityStatus === "regional").length;
  const topCategories = rank(SLANG_DATA.map((term) => term.category));
  const topRegions = rank(SLANG_DATA.map((term) => term.region));

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Observatório Gíria AI — retrato do acervo",
    description:
      "Dados agregados do acervo do Gíria AI, incluindo volume de termos catalogados, categorias, regiões, variações e sinais editoriais de popularidade.",
    url: `${site}/observatorio`,
    inLanguage: "pt-BR",
    creator: { "@type": "Organization", name: "Gíria AI", url: site },
    isPartOf: { "@type": "WebSite", name: "Gíria AI", url: site },
    variableMeasured: [
      { "@type": "PropertyValue", name: "Termos catalogados", value: totalTerms },
      { "@type": "PropertyValue", name: "Variações registradas", value: totalVariations },
      { "@type": "PropertyValue", name: "Categorias presentes", value: categories },
      { "@type": "PropertyValue", name: "Rótulos regionais presentes", value: regions },
    ],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${site}/observatorio/dados.json`,
    },
  };

  const cards = [
    ["Termos catalogados", totalTerms.toLocaleString("pt-BR")],
    ["Variações registradas", totalVariations.toLocaleString("pt-BR")],
    ["Categorias presentes", categories.toLocaleString("pt-BR")],
    ["Rótulos regionais", regions.toLocaleString("pt-BR")],
    ["Marcados como trending", trending.toLocaleString("pt-BR")],
    ["Marcados como regionais", regional.toLocaleString("pt-BR")],
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f7f8fb_100%)] px-4 py-10 text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />

      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur md:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="relative max-w-4xl">
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Observatório Gíria AI
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
              Um retrato mensurável do que existe no nosso acervo.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              Esta página transforma a base do Gíria AI em indicadores agregados e auditáveis. Os números abaixo descrevem
              o acervo catalogado pelo projeto — não representam uma pesquisa estatística sobre toda a população brasileira.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/observatorio/dados.json" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                Abrir dados em JSON
              </Link>
              <Link href="/sobre" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
                Ver metodologia
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Indicadores do acervo">
          {cards.map(([label, value]) => (
            <article key={label} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-semibold tracking-tight">Categorias mais presentes no acervo</h2>
            <ol className="mt-5 space-y-3">
              {topCategories.map((item, index) => (
                <li key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                  <span className="font-medium"><span className="mr-2 text-slate-400">{index + 1}.</span>{item.label}</span>
                  <span className="font-semibold text-emerald-700">{item.count.toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h2 className="text-2xl font-semibold tracking-tight">Rótulos regionais mais presentes</h2>
            <ol className="mt-5 space-y-3">
              {topRegions.map((item, index) => (
                <li key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                  <span className="font-medium"><span className="mr-2 text-slate-400">{index + 1}.</span>{item.label}</span>
                  <span className="font-semibold text-emerald-700">{item.count.toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-semibold">Como citar esses números</h2>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">
            Use a formulação “dados do acervo do Gíria AI” e preserve o escopo. Os indicadores são calculados diretamente
            da base publicada pelo projeto e podem mudar quando novos termos, regiões ou classificações forem incorporados.
          </p>
        </section>
      </div>
    </main>
  );
}
