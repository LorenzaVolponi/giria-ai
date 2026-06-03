import type { Metadata } from "next";
import Link from "next/link";
import { ORGANIC_SEO_KEYWORDS, SEO_KEYWORD_CLUSTERS } from "@/lib/seo-keyword-layer";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Guias de gírias, memes e linguagem da internet | Gíria AI",
  description:
    "Guias temáticos de gírias brasileiras, influencer, nave espacial, ET, alienígena, Paraná e cultura digital.",
  keywords: [...ORGANIC_SEO_KEYWORDS],
  alternates: { canonical: `${site}/guias` },
  openGraph: {
    title: "Guias de gírias, memes e linguagem da internet | Gíria AI",
    description:
      "Camadas editoriais para entender linguagem de influencer, memes espaciais, ET, alienígena, Paraná e expressões brasileiras.",
    url: `${site}/guias`,
    type: "website",
  },
};

export default function GuiasSeoPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Guias de gírias e cultura digital",
            description: metadata.description,
            url: `${site}/guias`,
            hasPart: SEO_KEYWORD_CLUSTERS.map((cluster) => ({
              "@type": "Article",
              name: cluster.title,
              url: `${site}/guias/${cluster.slug}`,
              keywords: cluster.keywords.join(", "),
            })),
          }),
        }}
      />
      <h1 className="text-3xl font-bold">Guias de gírias, memes e cultura digital</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Camada editorial do Gíria AI para organizar buscas orgânicas por temas específicos: linguagem de influencer,
        memes com nave espacial, ET e alienígena, além de gírias do Paraná e regionalismos brasileiros.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {SEO_KEYWORD_CLUSTERS.map((cluster) => (
          <article key={cluster.slug} className="rounded-xl border p-5 hover:bg-muted/50">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Guia SEO</p>
            <h2 className="mt-2 text-xl font-semibold">{cluster.shortTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{cluster.description}</p>
            <Link href={`/guias/${cluster.slug}`} className="mt-4 inline-block text-sm font-medium underline underline-offset-4">
              Abrir guia
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
