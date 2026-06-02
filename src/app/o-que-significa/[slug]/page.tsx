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
  if (!term) return { title: "Termo não encontrado | Gíria AI" };

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonical = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;

  return {
    title: `O que significa ${term.term}? Significado, exemplo e contexto | Gíria AI`,
    description: `O que significa ${term.term}: ${term.meaning} Veja tradução adulta, exemplo, risco, contexto, região e gírias relacionadas.`,
    keywords: [
      `o que significa ${term.term}`,
      `${term.term} significado`,
      `${term.term} gíria`,
      `${term.term} no WhatsApp`,
      "gírias brasileiras",
      "linguagem jovem",
    ],
    alternates: { canonical },
    openGraph: {
      title: `O que significa ${term.term}?`,
      description: term.meaning,
      url: canonical,
      type: "article",
      locale: "pt_BR",
      siteName: "Gíria AI",
    },
    twitter: {
      card: "summary",
      title: `O que significa ${term.term}?`,
      description: term.meaning,
    },
    robots: { index: true, follow: true },
  };
}

export default async function SignificadoTermoPage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) notFound();

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const url = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;
  const related = getRelatedTerms(term, 8);
  const faq = [
    {
      question: `O que significa ${term.term}?`,
      answer: term.meaning,
    },
    {
      question: `${term.term} é palavrão ou perigoso?`,
      answer: `O nível de risco cadastrado é ${getRiskLabel(term.riskLevel)}. ${term.contextNotes || "O contexto da conversa é essencial para interpretar corretamente."}`,
    },
    {
      question: `Como usar ${term.term} em uma frase?`,
      answer: term.safeExample || `${term.term} é usado no contexto: ${term.context}`,
    },
    {
      question: `${term.term} aparece em qual contexto?`,
      answer: term.context,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `O que significa ${term.term}?`,
    description: term.meaning,
    inLanguage: "pt-BR",
    mainEntityOfPage: url,
    about: [term.term, getCategoryLabel(term.category), term.region || "Brasil"],
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
              { "@type": "ListItem", position: 2, name: "O que significa", item: `${site}/o-que-significa` },
              { "@type": "ListItem", position: 3, name: term.term, item: url },
            ],
          }),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
          ← Voltar ao Gíria AI
        </Link>

        <section className="rounded-[2rem] border border-emerald-200 bg-white/90 p-6 shadow-xl dark:border-emerald-900 dark:bg-gray-900 sm:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Dicionário Gíria AI</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">O que significa {term.term}?</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">{term.meaning}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <Link href={`/categorias/${encodeURIComponent(term.category)}`} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950">{getCategoryLabel(term.category)}</Link>
            <span className="rounded-full bg-yellow-50 px-3 py-1 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">{getRiskLabel(term.riskLevel)}</span>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">{term.region || "Brasil"}</span>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-black">Tradução adulta</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{term.adultTranslation}</p>
          </article>
          <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-black">Contexto de uso</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{term.context}</p>
          </article>
          <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-black">Exemplo</h2>
            <p className="mt-2 text-sm italic leading-relaxed text-gray-600 dark:text-gray-400">“{term.safeExample || `Exemplo de uso com ${term.term}`}”</p>
          </article>
          <article className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-black">Orientação</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{term.contextNotes || "Interprete pelo contexto e evite concluir sem perguntar como a expressão foi usada."}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-black">Perguntas frequentes sobre {term.term}</h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
              <article key={item.question} className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="font-bold">{item.question}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-black">Gírias relacionadas</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link key={item.term} href={`/o-que-significa/${encodeURIComponent(item.term)}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-emerald-950/30">
                  <p className="font-black">{item.term}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.meaning}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
