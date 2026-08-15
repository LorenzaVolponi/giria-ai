import type { Metadata } from "next";
import Link from "next/link";
import { ACTIVE_GUIDE_CLUSTERS } from "@/lib/guide-policy";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Guias de gírias, memes e cultura digital",
  description:
    "Guias do Gíria AI para entender gírias brasileiras, memes, linguagem adolescente, redes sociais e regionalismos com contexto e exemplos claros.",
  alternates: { canonical: `${site}/guias` },
  openGraph: {
    title: "Guias de gírias, memes e cultura digital | Gíria AI",
    description:
      "Entenda a linguagem da internet brasileira com guias sobre gírias, memes, redes sociais, gerações e regionalismos.",
    url: `${site}/guias`,
    type: "website",
  },
};

export default function GuiasSeoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f6f7fb_100%)] px-4 py-10 text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Guias de gírias e cultura digital",
            description:
              "Guias do Gíria AI para entender gírias brasileiras, memes, linguagem adolescente, redes sociais e regionalismos com contexto e exemplos claros.",
            url: `${site}/guias`,
            isPartOf: { "@type": "WebSite", name: "Gíria AI", url: site },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: ACTIVE_GUIDE_CLUSTERS.map((cluster, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${site}/guias/${cluster.slug}`,
                name: cluster.title,
              })),
            },
            hasPart: ACTIVE_GUIDE_CLUSTERS.map((cluster) => ({
              "@type": "Article",
              name: cluster.title,
              url: `${site}/guias/${cluster.slug}`,
              dateModified: cluster.updatedAt,
            })),
          }),
        }}
      />
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur md:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Biblioteca Gíria AI
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Entenda a internet brasileira sem precisar adivinhar.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
              Guias para decodificar gírias, memes, redes sociais, regionalismos e mudanças de linguagem com significado,
              contexto cultural, exemplos e cuidado de interpretação.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <Link href="/o-que-significa" className="rounded-full bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700">
                Buscar uma gíria
              </Link>
              <Link href="/girias" className="rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
                Abrir dicionário
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3" aria-label="Guias disponíveis">
          {ACTIVE_GUIDE_CLUSTERS.map((cluster, index) => (
            <article
              key={cluster.slug}
              className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.13)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-violet-400" />
              <div className="flex items-center justify-between gap-3">
                <p className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  Guia {String(index + 1).padStart(2, "0")}
                </p>
                <span className="text-xs text-slate-400">Revisado {new Date(cluster.updatedAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{cluster.shortTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{cluster.description}</p>
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">Você vai entender</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {cluster.semanticEntities.slice(0, 4).map((entity) => (
                  <span key={entity} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800">
                    {entity}
                  </span>
                ))}
              </div>
              <Link
                href={`/guias/${cluster.slug}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-emerald-700"
              >
                Ler guia <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
