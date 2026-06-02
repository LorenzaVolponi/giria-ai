import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTerm } from "@/lib/slang-data";
import { getCategoryLabel, getRelatedTerms, getRiskLabel } from "@/lib/growth";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) return { title: "Gíria não encontrada | Gíria AI" };
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const url = `${site}/girias/${encodeURIComponent(term.term)}`;

  return {
    title: `${term.term}: significado, contexto e risco | Gíria AI`,
    description: `${term.term}: ${term.meaning} Tradução adulta: ${term.adultTranslation}`,
    keywords: [term.term, `significado de ${term.term}`, `gíria ${term.term}`, "gírias brasileiras", "linguagem jovem"],
    alternates: { canonical: url },
    openGraph: {
      title: `${term.term}: o que significa? | Gíria AI`,
      description: `${term.meaning} — ${term.context}`,
      url,
      type: "article",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary",
      title: `${term.term}: o que significa?`,
      description: `${term.meaning} — ${term.context}`,
    },
  };
}

export default async function GiriaDetalhePage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) notFound();

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const url = `${site}/girias/${encodeURIComponent(term.term)}`;
  const related = getRelatedTerms(term, 8);

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.meaning,
    inDefinedTermSet: `${site}/girias`,
    url,
    termCode: term.category,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 dark:text-gray-50 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: `${site}/` },
              { "@type": "ListItem", position: 2, name: "Gírias", item: `${site}/girias` },
              { "@type": "ListItem", position: 3, name: term.term, item: url },
            ],
          }),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }} />

      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/girias" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao glossário
        </Link>

        <section className="rounded-[2rem] border border-emerald-200 bg-white/90 p-6 shadow-xl dark:border-emerald-900 dark:bg-gray-900 sm:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Ficha completa da gíria</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{term.term}</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">{term.adultTranslation}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <Link href={`/categorias/${encodeURIComponent(term.category)}`} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950">{getCategoryLabel(term.category)}</Link>
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">{getRiskLabel(term.riskLevel)}</span>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">{term.region || "Brasil"}</span>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-black">Significado</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{term.meaning}</p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-black">Contexto</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{term.context}</p>
          </article>
          <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-black">Orientação social/emocional</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{term.contextNotes || "Interprete pelo contexto e evite julgamento imediato."}</p>
          </article>
          <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-black">Exemplo seguro</h2>
            <p className="mt-2 text-sm italic leading-relaxed text-gray-600 dark:text-gray-400">“{term.safeExample || `Exemplo com ${term.term}`}”</p>
          </article>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-black">Detalhes para SEO e contexto</h2>
          <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <li className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800"><strong>Variações:</strong> {term.variations?.join(", ") || "Não informado"}</li>
            <li className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800"><strong>Popularidade:</strong> {term.popularityStatus || "Não informado"}</li>
            <li className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800"><strong>Origem:</strong> {term.origin || "Não informado"}</li>
            <li className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800"><strong>Região:</strong> {term.region || "Brasil"}</li>
          </ul>
        </section>

        {related.length > 0 && (
          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-black">Continue explorando</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link key={item.term} href={`/girias/${encodeURIComponent(item.term)}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-emerald-950/30">
                  <p className="font-black">{item.term}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.meaning}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Quer uma resposta direta? Veja: <Link className="font-semibold text-emerald-700 underline dark:text-emerald-300" href={`/o-que-significa/${encodeURIComponent(term.term)}`}>O que significa {term.term}?</Link>
        </p>
      </div>
    </main>
  );
}
