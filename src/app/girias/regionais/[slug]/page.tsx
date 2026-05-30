import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RISK_CONFIG } from "@/lib/slang-data";
import { getRegionalEntryByRoot, getRegionalExpressionRoutes, getRelatedRegionalEntries, regionalExpressionPath } from "@/lib/regional-glossary";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ regiao?: string }>;
}

export function generateStaticParams() {
  const seen = new Set<string>();

  return getRegionalExpressionRoutes(12)
    .filter((route) => {
      const key = route.rootTerm.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 80)
    .map((route) => ({ slug: encodeURIComponent(route.rootTerm) }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const lookup = getRegionalEntryByRoot(decodeURIComponent(slug), sp?.regiao);
  if (!lookup) return { title: "Expressão regional não encontrada | Gíria AI" };

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const url = `${site}${regionalExpressionPath(lookup.entry.rootTerm, lookup.region)}`;

  return {
    title: `${lookup.entry.rootTerm}: usos regionais e contextos | Gíria AI`,
    description: `${lookup.entry.rootTerm} (${lookup.region}): ${lookup.entry.summary}. Veja contextos de uso e variações regionais agrupadas.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${lookup.entry.rootTerm}: expressão regional | Gíria AI`,
      description: `${lookup.entry.summary} — ${lookup.entry.totalVariants.toLocaleString("pt-BR")} contextos mapeados.`,
      url,
      type: "article",
    },
  };
}

export default async function RegionalExpressionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const lookup = getRegionalEntryByRoot(decodeURIComponent(slug), sp?.regiao);
  if (!lookup) notFound();

  const { region, entry } = lookup;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonicalPath = regionalExpressionPath(entry.rootTerm, region);
  const relatedEntries = getRelatedRegionalEntries(entry.rootTerm, region, 6);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: `${site}/` },
              { "@type": "ListItem", position: 2, name: "Gírias", item: `${site}/girias` },
              { "@type": "ListItem", position: 3, name: "Regionais", item: `${site}/girias/regionais` },
              { "@type": "ListItem", position: 4, name: entry.rootTerm, item: `${site}${canonicalPath}` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            name: entry.rootTerm,
            description: entry.summary,
            inDefinedTermSet: `${site}/girias/regionais`,
            url: `${site}${canonicalPath}`,
            hasDefinedTerm: entry.featuredVariations.map((variation) => ({
              "@type": "DefinedTerm",
              name: variation.term,
              description: variation.meaning,
              url: `${site}/girias/${encodeURIComponent(variation.term)}`,
            })),
          }),
        }}
      />

      <Link href={`/girias/regionais#regiao-${encodeURIComponent(region)}`} className="text-sm underline">
        ← Voltar para gírias regionais
      </Link>

      <header className="mt-5 rounded-2xl border bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Expressão regional · {region}</p>
        <h1 className="mt-2 text-3xl font-bold">{entry.rootTerm}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{entry.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border bg-white/80 px-2 py-1">{entry.totalVariants.toLocaleString("pt-BR")} contextos de uso</span>
          <span className="rounded-full border bg-white/80 px-2 py-1">{RISK_CONFIG[entry.primary.riskLevel].label}</span>
          <span className="rounded-full border bg-white/80 px-2 py-1">{entry.primary.popularityStatus}</span>
        </div>
      </header>

      <section className="mt-6 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Uso principal</h2>
        <p className="mt-2 text-sm text-muted-foreground">{entry.primary.context}</p>
        <p className="mt-3 text-sm"><strong>Exemplo seguro:</strong> {entry.primary.safeExample}</p>
        <Link href={`/girias/${encodeURIComponent(entry.primary.term)}`} className="mt-3 inline-block text-sm underline">
          Abrir verbete base usado como referência
        </Link>
      </section>

      {entry.featuredVariations.length > 0 ? (
        <section className="mt-6 rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Contextos em destaque</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {entry.featuredVariations.map((variation) => (
              <Link key={variation.term} href={`/girias/${encodeURIComponent(variation.term)}`} className="rounded-lg border p-3 hover:bg-muted/50">
                <p className="font-medium">{variation.term}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{variation.context}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedEntries.length > 0 ? (
        <section className="mt-6 rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Outras expressões de {region}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedEntries.map((related) => (
              <Link key={related.key} href={regionalExpressionPath(related.rootTerm, region)} className="rounded-lg border p-3 hover:bg-muted/50">
                <p className="font-medium">{related.rootTerm}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{related.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Todos os contextos agrupados</h2>
        {entry.variationGroups.map((group) => (
          <details key={group.key} open={group.key === "territorio" || group.key === "digital"} className="rounded-xl border p-4">
            <summary className="cursor-pointer font-medium">
              {group.label} · {group.variations.length.toLocaleString("pt-BR")} contexto(s)
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {group.variations.map((variation) => (
                <Link key={variation.term} href={`/girias/${encodeURIComponent(variation.term)}`} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
                  <span className="font-medium">{variation.term}</span>
                  <span className="mt-1 block text-xs text-muted-foreground line-clamp-2">{variation.context}</span>
                </Link>
              ))}
            </div>
          </details>
        ))}
      </section>
    </main>
  );
}
