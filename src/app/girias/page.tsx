import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

export const metadata: Metadata = {
  title: "Dicionário de gírias brasileiras",
  description:
    "Explore gírias brasileiras por significado, contexto, uso e região. Encontre expressões de internet, escola, games, memes e redes sociais em linguagem clara.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias` },
};

export default function GiriasPage() {
  const topTerms = SLANG_DATA.slice(0, 50);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Dicionário de gírias brasileiras</h1>
      <p className="mt-3 text-muted-foreground">
        Consulte significado, contexto e exemplos para entender como cada expressão é usada de verdade.
      </p>
      <p className="mt-2 text-sm">
        Quer explorar por localização?{" "}
        <Link href="/girias/regionais" className="underline font-medium">
          Veja gírias regionais
        </Link>
        {" "}ou aprofunde temas e tendências nos{" "}
        <Link href="/guias" className="underline font-medium">
          guias de cultura digital
        </Link>
        .
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {topTerms.map((term) => (
          <li key={term.term} className="rounded-lg border p-4 hover:bg-muted/50">
            <Link href={`/o-que-significa/${encodeURIComponent(term.term)}`} className="font-semibold">
              {term.term}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{term.meaning}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
