import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";

export const metadata: Metadata = {
  title: "Gírias Populares | Gíria AI",
  description: "Navegue por gírias populares e entenda os significados de forma clara e contextualizada.",
};

export default function GiriasPage() {
  const topTerms = SLANG_DATA.slice(0, 50);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Glossário de gírias populares</h1>
      <p className="mt-3 text-muted-foreground">Clique em uma gíria para abrir a explicação detalhada.</p>
      <p className="mt-2 text-sm"><a className="underline" href="/girias/enviadas-por-usuarios">Ver aba: Enviadas por usuários</a></p>
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
