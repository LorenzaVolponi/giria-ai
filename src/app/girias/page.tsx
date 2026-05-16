import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

export const metadata: Metadata = {
  title: "Gírias Populares | Gíria AI",
  description: "Navegue por gírias populares e entenda os significados de forma clara e contextualizada.",
  keywords: ["gírias", "o que significa", "dicionário de gírias", "gíria brasileira", "tradutor de gírias"],
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias` },
};

const REGION_SECTIONS = ["Nordeste", "Sudeste", "Sul", "Norte", "Centro-Oeste"] as const;

export default function GiriasPage() {
  const topTerms = SLANG_DATA.slice(0, 50);

  const regionalHighlights = REGION_SECTIONS.map((region) => ({
    region,
    terms: SLANG_DATA.filter((term) => term.region === region).slice(0, 4),
  })).filter(({ terms }) => terms.length > 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Glossário de gírias populares</h1>
      <p className="mt-3 text-muted-foreground">Clique em uma gíria para abrir a explicação detalhada.</p>

      <section aria-labelledby="blocos-regionais" className="mt-6 rounded-xl border bg-muted/20 p-4">
        <h2 id="blocos-regionais" className="text-lg font-semibold">
          Blocos regionais
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore primeiro alguns recortes locais nesta página e, se quiser, aprofunde depois.
        </p>

        <nav aria-label="Navegação de gírias por região" className="mt-4 flex flex-wrap gap-2">
          {regionalHighlights.map(({ region }) => (
            <a
              key={region}
              href={`#regiao-${region.toLowerCase()}`}
              className="rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              {region}
            </a>
          ))}
        </nav>

        <p className="mt-4 text-sm">
          <Link href="/girias/regionais" className="underline font-medium">
            Ver catálogo completo regional
          </Link>
          <span className="text-muted-foreground"> (opcional)</span>
        </p>
      </section>

      <section className="mt-6 space-y-4" aria-label="Prévia regional">
        {regionalHighlights.map(({ region, terms }) => (
          <article id={`regiao-${region.toLowerCase()}`} key={region} className="rounded-lg border p-4 scroll-mt-24">
            <h3 className="text-base font-semibold">{region}</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {terms.map((term) => (
                <li key={`${region}-${term.term}`} className="rounded-md border p-3 hover:bg-muted/50">
                  <Link href={`/girias/${encodeURIComponent(term.term)}`} className="font-medium">
                    {term.term}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{term.meaning}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {topTerms.map((term) => (
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
