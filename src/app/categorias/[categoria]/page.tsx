import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers3, Sparkles } from "lucide-react";
import { CATEGORIES, SLANG_DATA } from "@/lib/slang-data";
import { getCategoryLabel, getRelatedTerms, getRiskLabel } from "@/lib/growth";

interface Props {
  params: Promise<{ categoria: string }>;
}

function normalize(value: string) {
  return decodeURIComponent(value).toLowerCase();
}

function getCategory(slug: string) {
  const normalized = normalize(slug);
  return CATEGORIES.find((category) => category.name.toLowerCase() === normalized || category.label.toLowerCase() === normalized);
}

function getCategoryTerms(categoryName: string) {
  return SLANG_DATA.filter((term) => term.category === categoryName).slice(0, 120);
}

export function generateStaticParams() {
  return CATEGORIES.filter((category) => SLANG_DATA.some((term) => term.category === category.name)).map((category) => ({ categoria: category.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) return { title: "Categoria não encontrada | Gíria AI" };
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const label = getCategoryLabel(category.name);
  return {
    title: `Gírias de ${label}: significados e exemplos | Gíria AI`,
    description: `Explore gírias brasileiras da categoria ${label}, com significado, risco, contexto de uso e links para páginas de explicação completa.`,
    alternates: { canonical: `${site}/categorias/${encodeURIComponent(category.name)}` },
    openGraph: {
      title: `Gírias de ${label} | Gíria AI`,
      description: `Termos de ${label} com contexto e tradução adulta.`,
      url: `${site}/categorias/${encodeURIComponent(category.name)}`,
      type: "website",
      locale: "pt_BR",
    },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params;
  const category = getCategory(categoria);
  if (!category) notFound();
  const terms = getCategoryTerms(category.name);
  if (terms.length === 0) notFound();

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const label = getCategoryLabel(category.name);
  const featured = terms[0];
  const related = featured ? getRelatedTerms(featured, 8) : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-indigo-50 px-4 py-8 text-gray-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 dark:text-gray-50 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Gírias de ${label}`,
            description: `Coleção de gírias brasileiras da categoria ${label}.`,
            url: `${site}/categorias/${encodeURIComponent(category.name)}`,
            hasPart: terms.slice(0, 20).map((term) => ({
              "@type": "DefinedTerm",
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

        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-white/90 p-6 shadow-xl dark:border-emerald-900 dark:bg-gray-900 sm:p-10">
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-300/25 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Categoria do glossário</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Gírias de {label}</h1>
            <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
              Página temática para encontrar significados, exemplos, risco e contexto de expressões ligadas a {label.toLowerCase()}.
            </p>
            <div className="mt-5 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              {terms.length} termos nesta categoria
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map((term) => (
            <Link key={term.term} href={`/o-que-significa/${encodeURIComponent(term.term)}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-emerald-950/30">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-black">{term.term}</h2>
                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">{getRiskLabel(term.riskLevel)}</span>
              </div>
              <p className="line-clamp-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{term.meaning}</p>
            </Link>
          ))}
        </section>

        {related.length > 0 ? (
          <section className="rounded-[1.5rem] border border-emerald-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-black">Pontes para continuar navegando</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((term) => (
                <Link key={term.term} href={`/girias/${encodeURIComponent(term.term)}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-800">
                  <p className="font-black">{term.term}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{term.meaning}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-[1.5rem] border border-indigo-100 bg-indigo-950 p-6 text-white shadow-xl dark:border-indigo-900">
          <Layers3 className="mb-3 h-6 w-6 text-yellow-200" />
          <h2 className="text-xl font-black">Quer outra porta de entrada?</h2>
          <p className="mt-2 text-sm text-indigo-50/90">Veja também o ranking geral, o radar da semana e o mapa regional para encontrar termos por intenção.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/ranking" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-indigo-900 hover:bg-indigo-50">Ranking</Link>
            <Link href="/radar" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/20">Radar</Link>
            <Link href="/mapa" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20 hover:bg-white/20">Mapa</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
