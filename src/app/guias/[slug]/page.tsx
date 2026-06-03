import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSeoKeywordCluster,
  getSeoKeywordClusterSlugs,
  SEO_KEYWORD_CLUSTERS,
} from "@/lib/seo-keyword-layer";

interface Props {
  params: Promise<{ slug: string }>;
}

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export function generateStaticParams() {
  return getSeoKeywordClusterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cluster = getSeoKeywordCluster(slug);
  if (!cluster) return { title: "Guia não encontrado | Gíria AI" };
  const url = `${site}/guias/${cluster.slug}`;
  const uniqueKeywords = Array.from(new Set([cluster.primaryKeyword, ...cluster.keywords]));

  return {
    title: `${cluster.title} | Gíria AI`,
    description: cluster.description,
    keywords: uniqueKeywords,
    alternates: { canonical: url },
    openGraph: {
      title: cluster.title,
      description: cluster.description,
      url,
      type: "article",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary",
      title: cluster.title,
      description: cluster.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function GuiaSeoDetalhePage({ params }: Props) {
  const { slug } = await params;
  const cluster = getSeoKeywordCluster(slug);
  if (!cluster) notFound();

  const url = `${site}/guias/${cluster.slug}`;
  const uniqueKeywords = Array.from(new Set([cluster.primaryKeyword, ...cluster.keywords]));
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cluster.title,
    description: cluster.description,
    url,
    inLanguage: "pt-BR",
    keywords: uniqueKeywords.join(", "),
    dateModified: cluster.updatedAt,
    datePublished: cluster.updatedAt,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Gíria AI" },
    publisher: { "@type": "Organization", name: "Gíria AI" },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cluster.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: `${site}/` },
              { "@type": "ListItem", position: 2, name: "Guias", item: `${site}/guias` },
              { "@type": "ListItem", position: 3, name: cluster.shortTitle, item: url },
            ],
          }),
        }}
      />

      <Link href="/guias" className="text-sm underline underline-offset-4">
        ← Voltar aos guias
      </Link>
      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-emerald-700">Camada SEO temática</p>
      <h1 className="mt-2 text-3xl font-bold">{cluster.title}</h1>
      <p className="mt-3 text-xs text-muted-foreground">Atualizado em {new Date(cluster.updatedAt).toLocaleDateString("pt-BR")}</p>
      <p className="mt-4 text-lg text-muted-foreground">{cluster.intro}</p>

      <section className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
        <h2 className="text-xl font-semibold">Resposta rápida sobre {cluster.primaryKeyword}</h2>
        <p className="mt-2 text-muted-foreground">{cluster.quickAnswer}</p>
      </section>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Intenção de busca</h2>
        <p className="mt-2 text-muted-foreground">{cluster.intent}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {cluster.queryVariants.map((query) => (
            <span key={query} className="rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              {query}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Mini glossário do tema</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {cluster.glossary.map((item) => (
            <div key={item.term} className="rounded-lg border p-3">
              <dt className="font-semibold">{item.term}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{item.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Exemplos de uso e interpretação</h2>
        <div className="mt-4 space-y-3">
          {cluster.examples.map((example) => (
            <article key={example.phrase} className="rounded-lg border p-3">
              <p className="font-medium">“{example.phrase}”</p>
              <p className="mt-1 text-sm text-muted-foreground">{example.interpretation}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8 space-y-6">
        {cluster.sections.map((section) => (
          <section key={section.title} className="rounded-xl border p-5">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
        <div className="mt-4 space-y-4">
          {cluster.faqs.map((faq) => (
            <article key={faq.question}>
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Próximos passos no Gíria AI</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li><Link href="/o-que-significa" className="underline underline-offset-4">Buscar significado direto de uma gíria</Link></li>
          <li><Link href="/girias" className="underline underline-offset-4">Explorar o glossário completo</Link></li>
          <li><Link href="/girias/regionais" className="underline underline-offset-4">Ver gírias regionais do Brasil</Link></li>
        </ul>
      </section>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">Outros guias relacionados</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {SEO_KEYWORD_CLUSTERS.filter((item) => item.slug !== cluster.slug).map((item) => (
            <li key={item.slug}>
              <Link href={`/guias/${item.slug}`} className="underline underline-offset-4">
                {item.shortTitle}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
