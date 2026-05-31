import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTerm } from "@/lib/slang-data";
import { getRegionalEntryForTerm, regionalExpressionPath } from "@/lib/regional-glossary";
import Link from "next/link";

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
    title: `${term.term}: significado e contexto | Gíria AI`,
    description: `${term.term}: ${term.meaning}. Contexto: ${term.context}`,
    keywords: [term.term, "o que significa", "gíria", "giria", "significado", "gírias brasileiras"],
    alternates: { canonical: url },
    openGraph: {
      title: `${term.term}: o que significa? | Gíria AI`,
      description: `${term.meaning} — ${term.context}`,
      url,
      type: "article",
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
  const regionalLookup = getRegionalEntryForTerm(term.term);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/` },
              { "@type": "ListItem", position: 2, name: "Gírias", item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias` },
              { "@type": "ListItem", position: 3, name: term.term, item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias/${encodeURIComponent(term.term)}` },
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
            name: term.term,
            description: term.meaning,
            inDefinedTermSet: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias`,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias/${encodeURIComponent(term.term)}`,
          }),
        }}
      />
      <h1 className="text-3xl font-bold">{term.term}</h1>
      <p className="mt-4 text-lg">{term.adultTranslation}</p>
      <section className="mt-6 space-y-3 rounded-lg border p-5">
        <p><strong>Significado:</strong> {term.meaning}</p>
        <p><strong>Contexto:</strong> {term.context}</p>
        <p><strong>Intenção social/emocional:</strong> {term.contextNotes}</p>
      </section>
      {regionalLookup ? (
        <section className="mt-6 rounded-lg border bg-emerald-50/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Contexto regional agrupado</p>
          <h2 className="mt-2 text-lg font-semibold">Parte da expressão regional “{regionalLookup.entry.rootTerm}”</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Este verbete é um contexto de uso ligado à expressão principal em {regionalLookup.region}. Veja a página curada para comparar usos parecidos sem repetir cards soltos.
          </p>
          <Link href={regionalExpressionPath(regionalLookup.entry.rootTerm, regionalLookup.region)} className="mt-3 inline-block text-sm font-medium underline">
            Ver expressão regional agrupada
          </Link>
        </section>
      ) : null}
      <p className="mt-4 text-sm text-muted-foreground">
        Quer uma resposta direta? Veja:{" "}
        <Link className="underline" href={`/o-que-significa/${encodeURIComponent(term.term)}`}>
          O que significa {term.term}?
        </Link>
      </p>
    </main>
  );
}
