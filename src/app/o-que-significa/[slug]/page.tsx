import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";
import { evaluateIndexQuality } from "@/lib/index-quality";
import { getLanguageGraphNode } from "@/lib/language-graph";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) return { title: "Termo não encontrado", robots: { index: false, follow: false } };
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const evidence = getEditorialEvidence(term.term);
  const definition = evidence?.definition ?? term.meaning;
  const quality = evaluateIndexQuality(term);
  const url = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
  return {
    title: `O que significa ${term.term}? | Gíria AI`,
    description: `${definition} Entenda o uso e o contexto da expressão ${term.term}.`,
    alternates: { canonical: url },
    openGraph: { title: `O que significa ${term.term}?`, description: definition, url, type: "article" },
    twitter: { card: "summary", title: `O que significa ${term.term}?`, description: definition },
    robots: { index: quality.indexable, follow: true },
  };
}

export default async function SignificadoTermoPage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) notFound();
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonical = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
  const answerUrl = `${site}/answer/${encodeURIComponent(term.term)}`;
  const citationUrl = `${site}/citation/${encodeURIComponent(term.term)}`;
  const graphUrl = `${site}/api/graph/${encodeURIComponent(term.term)}`;
  const evidence = getEditorialEvidence(term.term);
  const definition = evidence?.definition ?? term.meaning;
  const graph = getLanguageGraphNode(term.term);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        "@id": `${canonical}#term`,
        identifier: `${canonical}#term`,
        name: term.term,
        alternateName: term.variations || [],
        description: definition,
        url: canonical,
        inDefinedTermSet: { "@id": `${site}/#dictionary` },
        subjectOf: [
          { "@type": "Dataset", url: answerUrl, name: `Resposta estruturada: ${term.term}` },
          { "@type": "Dataset", url: citationUrl, name: `Registro de citação: ${term.term}` },
          { "@type": "Dataset", url: graphUrl, name: `Relações semânticas: ${term.term}` },
        ],
      },
      {
        "@type": "Question",
        "@id": `${canonical}#question`,
        name: `O que significa ${term.term}?`,
        text: `O que significa ${term.term}?`,
        url: canonical,
        about: { "@id": `${canonical}#term` },
        acceptedAnswer: {
          "@type": "Answer",
          "@id": `${canonical}#answer`,
          text: definition,
          url: canonical,
          inLanguage: "pt-BR",
          author: { "@id": `${site}/#organization` },
          ...(evidence ? { citation: evidence.sources.map((source) => source.url) } : {}),
        },
      },
      {
        "@type": "DefinedTermSet",
        "@id": `${site}/#dictionary`,
        name: "Gíria AI — Linguagem informal brasileira",
        url: `${site}/o-que-significa`,
        inLanguage: "pt-BR",
        publisher: { "@id": `${site}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        name: `O que significa ${term.term}?`,
        description: definition,
        url: canonical,
        inLanguage: "pt-BR",
        mainEntity: { "@id": `${canonical}#question` },
        about: { "@id": `${canonical}#term` },
        isPartOf: { "@id": `${site}/#website` },
        publisher: { "@id": `${site}/#organization` },
        subjectOf: [
          { "@type": "Dataset", url: answerUrl },
          { "@type": "Dataset", url: citationUrl },
        ],
        ...(evidence ? {
          dateModified: evidence.reviewedAt,
          citation: evidence.sources.map((source) => source.url),
          isBasedOn: evidence.sources.map((source) => source.url),
        } : {}),
      },
      { "@type": "WebSite", "@id": `${site}/#website`, name: "Gíria AI", url: site, inLanguage: "pt-BR", publisher: { "@id": `${site}/#organization` } },
      { "@type": "Organization", "@id": `${site}/#organization`, name: "Gíria AI", url: site, knowsAbout: ["gírias brasileiras", "memes", "linguagem informal brasileira", "cultura digital"] },
    ],
  };

  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <Link className="text-sm text-muted-foreground underline" href="/">← Perguntar outra expressão</Link>
    <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Gíria AI explica</p><h1 className="mt-2 text-4xl font-bold tracking-tight">O que significa {term.term}?</h1><p className="mt-4 text-xl leading-8 text-muted-foreground">{definition}</p></header>
    <section className="rounded-xl border p-5"><h2 className="font-semibold">Contexto</h2><p className="mt-2 leading-7">{term.context}</p><p className="mt-3 text-sm text-muted-foreground"><strong>Exemplo:</strong> {term.safeExample || "Sem exemplo registrado."}</p></section>
    <section className="rounded-xl border p-5"><h2 className="font-semibold">Origem e variações</h2><p className="mt-2 text-sm leading-7"><strong>Origem:</strong> {term.origin || "Não informada"}</p><p className="mt-2 text-sm"><strong>Variações:</strong> {term.variations?.join(", ") || "Não registradas"}</p></section>
    {graph?.edges?.length ? <section className="rounded-xl border p-5"><h2 className="font-semibold">Expressões relacionadas</h2><div className="mt-3 flex flex-wrap gap-2">{graph.edges.slice(0, 8).map((edge) => <Link key={`${edge.type}-${edge.target}`} href={`/o-que-significa/${encodeURIComponent(edge.target)}`} className="rounded-full border px-3 py-1.5 text-sm hover:border-emerald-400">{edge.target}</Link>)}</div></section> : null}
    {evidence ? <section className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Verificação editorial</p><p className="mt-2 text-sm leading-6">{evidence.context}</p><ul className="mt-3 space-y-2 text-sm">{evidence.sources.map((source) => <li key={source.url}><a className="underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher}: {source.title}</a></li>)}</ul></section> : null}
  </main>;
}
