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

  return {
    title: `${term.term}: significado e contexto | Gíria AI`,
    description: term.context,
  };
}

export default async function GiriaDetalhePage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
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
