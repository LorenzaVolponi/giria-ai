import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

const topTerms = SLANG_DATA.slice(0, 100);
const keywordPool = Array.from(new Set(topTerms.flatMap((item) => [item.term, ...(item.variations ?? [])]).map((w) => w.toLowerCase()))).slice(0, 150);

export const metadata: Metadata = {
  title: "Gírias Populares e Significados | Gíria AI",
  description: "Dicionário completo de gírias adolescentes, TikTok, funk, games e internet. Descubra o que é farmar aura e centenas de variações.",
  keywords: [
    "gírias",
    "gírias adolescentes",
    "o que é farmar aura",
    "significado de gírias",
    "dicionário de gírias",
    ...keywordPool,
  ],
  alternates: { canonical: "/girias" },
};

export default function GiriasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Glossário de gírias populares",
    description: metadata.description,
    keywords: metadata.keywords,
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-bold">Glossário de gírias populares</h1>
      <p className="mt-3 text-muted-foreground">Clique em uma gíria para abrir a explicação detalhada.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {topTerms.slice(0,50).map((term) => (
          <li key={term.term} className="rounded-lg border p-4 hover:bg-muted/50">
            <Link href={`/girias/${encodeURIComponent(term.term)}`} className="font-semibold">
              {term.term}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{term.meaning}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
