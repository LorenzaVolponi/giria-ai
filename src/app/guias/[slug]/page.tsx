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
    about: cluster.semanticEntities.map((entity) => ({ "@type": "Thing", name: entity })),
    audience: cluster.audience.map((audience) => ({ "@type": "Audience", audienceType: audience })),
  };
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: cluster.title,
    description: cluster.description,
    url,
    inLanguage: "pt-BR",
    primaryImageOfPage: `${site}/favicon.svg`,
    about: cluster.semanticEntities.map((entity) => ({ "@type": "Thing", name: entity })),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "#resposta-rapida"],
    },
  };
  const definedTermSetJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: `Mini glossário: ${cluster.shortTitle}`,
    url,
    hasDefinedTerm: cluster.glossary.map((item) => ({
      "@type": "DefinedTerm",
      name: item.term,
      description: item.meaning,
      inDefinedTermSet: url,
    })),
  };
  const searchIntentJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Buscas relacionadas: ${cluster.primaryKeyword}`,
    itemListElement: cluster.queryVariants.map((query, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: query,
    })),
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ffffff_44%,#f7f8fb_100%)] px-4 py-8 text-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSetJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(searchIntentJsonLd) }} />
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

      <div className="mx-auto max-w-6xl">
        <Link href="/guias" className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur transition hover:border-emerald-300 hover:text-emerald-700">
          ← Voltar aos guias
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur md:p-10">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Camada SEO temática
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">{cluster.title}</h1>
              <p className="mt-4 text-sm text-slate-500">Atualizado em {new Date(cluster.updatedAt).toLocaleDateString("pt-BR")}</p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{cluster.intro}</p>
            </div>
            <aside className="rounded-[1.5rem] border border-slate-200/80 bg-slate-950 p-5 text-white shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Keyword foco</p>
              <p className="mt-2 text-2xl font-semibold">{cluster.primaryKeyword}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {cluster.semanticEntities.slice(0, 5).map((entity) => (
                  <span key={entity} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-slate-200">
                    {entity}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <nav className="sticky top-3 z-10 mt-5 rounded-full border border-white/70 bg-white/85 px-4 py-3 text-sm shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur" aria-label="Sumário do guia">
          <ul className="flex gap-3 overflow-x-auto whitespace-nowrap text-slate-600">
            <li><a href="#resposta-rapida" className="rounded-full px-3 py-1 transition hover:bg-emerald-50 hover:text-emerald-700">Resposta</a></li>
            <li><a href="#intencao" className="rounded-full px-3 py-1 transition hover:bg-emerald-50 hover:text-emerald-700">Busca</a></li>
            <li><a href="#glossario" className="rounded-full px-3 py-1 transition hover:bg-emerald-50 hover:text-emerald-700">Glossário</a></li>
            <li><a href="#exemplos" className="rounded-full px-3 py-1 transition hover:bg-emerald-50 hover:text-emerald-700">Exemplos</a></li>
            <li><a href="#sinais" className="rounded-full px-3 py-1 transition hover:bg-emerald-50 hover:text-emerald-700">Qualidade</a></li>
            <li><a href="#faq" className="rounded-full px-3 py-1 transition hover:bg-emerald-50 hover:text-emerald-700">FAQ</a></li>
          </ul>
        </nav>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section id="resposta-rapida" className="rounded-[1.75rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[0_18px_60px_rgba(16,185,129,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Resposta rápida</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">O que saber sobre {cluster.primaryKeyword}</h2>
              <p className="mt-3 leading-7 text-slate-700">{cluster.quickAnswer}</p>
            </section>

            <section id="intencao" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-2xl font-semibold tracking-tight">Intenção de busca</h2>
              <p className="mt-3 leading-7 text-slate-600">{cluster.intent}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {cluster.queryVariants.map((query) => (
                  <span key={query} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                    {query}
                  </span>
                ))}
              </div>
            </section>

            <section id="glossario" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-2xl font-semibold tracking-tight">Mini glossário do tema</h2>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {cluster.glossary.map((item) => (
                  <div key={item.term} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <dt className="font-semibold text-slate-950">{item.term}</dt>
                    <dd className="mt-1 text-sm leading-6 text-slate-600">{item.meaning}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="exemplos" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-2xl font-semibold tracking-tight">Exemplos de uso e interpretação</h2>
              <div className="mt-5 space-y-3">
                {cluster.examples.map((example) => (
                  <article key={example.phrase} className="rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-950">“{example.phrase}”</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{example.interpretation}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="sinais" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-2xl font-semibold tracking-tight">Por que este guia responde melhor à busca?</h2>
              <ul className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                {cluster.contentSignals.map((signal) => (
                  <li key={signal} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">{signal}</li>
                ))}
              </ul>
            </section>

            <div className="space-y-6">
              {cluster.sections.map((section) => (
                <section key={section.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                  <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
                  <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
                </section>
              ))}
            </div>

            <section id="faq" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-2xl font-semibold tracking-tight">Perguntas frequentes</h2>
              <div className="mt-5 space-y-4">
                {cluster.faqs.map((faq) => (
                  <article key={faq.question} className="border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-slate-950">{faq.question}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section id="entidades" className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold">Entidades semânticas</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {cluster.semanticEntities.map((entity) => (
                  <span key={entity} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
                    {entity}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">Público principal: {cluster.audience.join(", ")}.</p>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.16)]">
              <h2 className="text-lg font-semibold">Próximos passos</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li><Link href="/o-que-significa" className="underline underline-offset-4">Buscar significado direto</Link></li>
                <li><Link href="/girias" className="underline underline-offset-4">Explorar glossário completo</Link></li>
                <li><Link href="/girias/regionais" className="underline underline-offset-4">Ver gírias regionais</Link></li>
              </ul>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold">Outros guias</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {SEO_KEYWORD_CLUSTERS.filter((item) => item.slug !== cluster.slug).map((item) => (
                  <li key={item.slug}>
                    <Link href={`/guias/${item.slug}`} className="font-medium text-slate-700 underline underline-offset-4 hover:text-emerald-700">
                      {item.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
