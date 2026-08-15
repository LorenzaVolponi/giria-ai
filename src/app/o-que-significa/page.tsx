import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

export const metadata: Metadata = {
  title: "O que significa? Gírias brasileiras explicadas",
  description:
    "Descubra o significado de gírias brasileiras, memes e expressões da internet com contexto, exemplos de uso e explicações diretas em português claro.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/o-que-significa` },
};

export default function OQueSignificaIndexPage() {
  const terms = SLANG_DATA.slice(0, 120);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">O que significa? Gírias brasileiras explicadas</h1>
      <p className="mt-2 text-muted-foreground">
        Encontre respostas diretas para expressões usadas em conversas, memes, escola, games, redes sociais e diferentes regiões do Brasil.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {terms.map((term) => (
          <li key={term.term} className="rounded-lg border p-3">
            <Link className="font-semibold underline" href={`/o-que-significa/${encodeURIComponent(term.term)}`}>
              O que significa {term.term}?
            </Link>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{term.meaning}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
