import type { Metadata } from "next";
import Link from "next/link";
import { SLANG_DATA } from "@/lib/slang-data";
import { ORGANIC_SEO_KEYWORDS } from "@/lib/seo-keyword-layer";

export const metadata: Metadata = {
  title: "O que significa cada gíria? | Gíria AI",
  description: "Descubra o que significa cada gíria usada por adolescentes, influencers e comunidades da internet, com contexto para memes, ET, alienígena, nave espacial e Paraná.",
  keywords: ["o que significa", "significado de gírias", "gírias adolescentes", ...ORGANIC_SEO_KEYWORDS],
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/o-que-significa` },
};

export default function OQueSignificaIndexPage() {
  const terms = SLANG_DATA.slice(0, 120);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">O que significa cada gíria?</h1>
      <p className="mt-2 text-muted-foreground">
        Guia rápido para pais, educadores e curiosos entenderem linguagem adolescente, termos de influencer, memes de
        nave espacial, ET, alienígena e expressões regionais do Paraná.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {terms.map((t) => (
          <li key={t.term} className="rounded-lg border p-3">
            <Link className="font-semibold underline" href={`/o-que-significa/${encodeURIComponent(t.term)}`}>O que significa {t.term}?</Link>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.meaning}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
