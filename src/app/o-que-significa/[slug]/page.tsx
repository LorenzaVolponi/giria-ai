import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTerm } from "@/lib/slang-data";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) return { title: "Termo não encontrado | Gíria AI" };

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const url = `${site}/o-que-significa/${encodeURIComponent(term.term)}`;

  return {
    title: `O que significa ${term.term}? | Gíria AI`,
    description: `Descubra o que significa ${term.term}, como usar e em quais contextos adolescentes usam essa gíria.`,
    alternates: { canonical: `${site}/girias/${encodeURIComponent(term.term)}` },
    openGraph: {
      title: `O que significa ${term.term}?`,
      description: term.meaning,
      url,
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function SignificadoTermoPage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(decodeURIComponent(slug));
  if (!term) notFound();

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonical = `${site}/girias/${encodeURIComponent(term.term)}`;

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
        name: `Como usar ${term.term} em uma frase?`,
        acceptedAnswer: { "@type": "Answer", text: term.safeExample || `${term.term} é usado no contexto: ${term.context}` },
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Início", item: `${site}/` },
              { "@type": "ListItem", position: 2, name: "O que significa", item: `${site}/o-que-significa` },
              { "@type": "ListItem", position: 3, name: term.term, item: `${site}/o-que-significa/${encodeURIComponent(term.term)}` },
            ],
          }),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <h1 className="text-3xl font-bold">O que significa {term.term}?</h1>
      <p className="text-lg text-muted-foreground">{term.meaning}</p>

      <section className="rounded-lg border p-5 space-y-2">
        <h2 className="font-semibold">Como adolescentes usam essa gíria</h2>
        <p>{term.context}</p>
        <p className="text-sm text-muted-foreground"><strong>Exemplo:</strong> {term.safeExample || "Sem exemplo registrado."}</p>
      </section>

      <section className="rounded-lg border p-5 space-y-2">
        <h2 className="font-semibold">Entenda melhor</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Variações:</strong> {term.variations?.join(", ") || "Não informado"}</li>
          <li><strong>Popularidade:</strong> {term.popularityStatus || "Não informado"}</li>
          <li><strong>Região:</strong> {term.region || "Brasil"}</li>
        </ul>
      </section>

      <p className="text-sm text-muted-foreground">
        Página canônica: <Link className="underline" href={canonical}>{canonical}</Link>
      </p>
    </main>
  );
}
