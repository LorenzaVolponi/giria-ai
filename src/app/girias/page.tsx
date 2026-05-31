import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";
import { REGIONAL_DEEP_EXPANSION_COUNT } from "@/lib/slang-regional-deep-expansion";

export const metadata: Metadata = {
  title: "Gírias Populares | Gíria AI",
  description: "Navegue por gírias populares e entenda os significados de forma clara e contextualizada.",
  keywords: ["gírias", "o que significa", "dicionário de gírias", "gíria brasileira", "tradutor de gírias"],
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias` },
};

export default function GiriasPage() {
  const regionalTerms = SLANG_DATA.filter((term) => term.category === "regional");
  const regionalHighlights = [
    "arre diacho no zap",
    "oxente do São João",
    "uai sô do pão de queijo",
    "baita do chimarrão",
    "camelo no rolê",
    "pocar no story",
    "cacetinho na padaria",
    "bergamota no lanche",
  ]
    .map((term) => SLANG_DATA.find((item) => item.term === term))
    .filter((term): term is (typeof SLANG_DATA)[number] => Boolean(term));
  const topTerms = [
    ...regionalHighlights,
    ...SLANG_DATA.filter((term) => !regionalHighlights.some((item) => item.term === term.term)).slice(0, 50),
  ].slice(0, 60);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Glossário de gírias populares</h1>
      <p className="mt-3 text-muted-foreground">Clique em uma gíria para abrir a explicação detalhada.</p>
      <section className="mt-5 rounded-xl border bg-emerald-50/60 p-4">
        <h2 className="font-semibold">Novas gírias regionais no glossário</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          O glossário agora inclui {regionalTerms.length.toLocaleString("pt-BR")} entradas regionais, incluindo {REGIONAL_DEEP_EXPANSION_COUNT.toLocaleString("pt-BR")} variações contextuais novas.
        </p>
      </section>
      <p className="mt-4 text-sm">
        Quer focar por localização?{" "}
        <Link href="/girias/regionais" className="underline font-medium">
          Ver página de gírias regionais
        </Link>
      </p>
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
