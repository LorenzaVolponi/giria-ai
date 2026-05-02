import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTerm } from "@/lib/slang-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) return { title: "Gíria não encontrada | Gíria AI" };

  const keywords = [
    term.term,
    ...(term.variations ?? []),
    `o que é ${term.term}`,
    `significado de ${term.term}`,
    "gíria adolescente",
    "gíria internet",
  ];

  return {
    title: `${term.term}: significado, contexto e exemplos | Gíria AI`,
    description: term.context,
    keywords,
    alternates: { canonical: `/girias/${encodeURIComponent(term.term)}` },
  };
}

export default async function GiriaDetalhePage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `O que significa ${term.term}?`,
        acceptedAnswer: { "@type": "Answer", text: term.meaning },
      },
      {
        "@type": "Question",
        name: `Como usar ${term.term} em contexto?`,
        acceptedAnswer: { "@type": "Answer", text: term.context },
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <h1 className="text-3xl font-bold">{term.term}</h1>
      <p className="mt-4 text-lg">{term.adultTranslation}</p>
      <section className="mt-6 space-y-3 rounded-lg border p-5">
        <p><strong>Significado:</strong> {term.meaning}</p>
        <p><strong>Contexto:</strong> {term.context}</p>
        <p><strong>Intenção social/emocional:</strong> {term.contextNotes}</p>
      </section>
    </main>
  );
}
