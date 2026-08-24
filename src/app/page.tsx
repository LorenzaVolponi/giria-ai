import type { Metadata } from "next";
import EliteHomeLanding from "@/components/home/elite-home-landing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Gíria AI — entenda gírias brasileiras, memes e expressões",
  description: "Cole uma gíria brasileira, frase ou meme e entenda o significado, a intenção e o contexto em português claro.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Gíria AI — entenda gírias brasileiras",
    description: "Entenda gírias brasileiras, memes e expressões pelo significado e pelo contexto.",
    url: siteUrl,
    type: "website",
    locale: "pt_BR",
    siteName: "Gíria AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gíria AI — entenda gírias brasileiras",
    description: "Cole uma gíria, frase ou meme. A gente explica o que significa e o que quiseram dizer.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Gíria AI",
      url: siteUrl,
      inLanguage: "pt-BR",
      description: "Sistema de interpretação de gírias, memes e expressões da linguagem informal brasileira.",
      publisher: { "@id": `${siteUrl}/#organization` },
      mainEntity: { "@id": `${siteUrl}/#dictionary` },
      subjectOf: [
        { "@type": "DataFeed", url: `${siteUrl}/knowledge.json`, name: "Gíria AI Knowledge Manifest" },
        { "@type": "DataFeed", url: `${siteUrl}/ai-index.json`, name: "Gíria AI AI Discovery Manifest" },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Gíria AI",
      url: siteUrl,
      parentOrganization: {
        "@type": "Organization",
        name: "volponi.tech",
        url: "https://volponi.tech",
      },
      sameAs: ["https://www.instagram.com/lorenzavolponi"],
    },
    {
      "@type": "DefinedTermSet",
      "@id": `${siteUrl}/#dictionary`,
      name: "Gíria AI — Linguagem informal brasileira",
      url: `${siteUrl}/o-que-significa`,
      inLanguage: "pt-BR",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#app`,
      name: "Gíria AI",
      url: siteUrl,
      applicationCategory: "ReferenceApplication",
      operatingSystem: "Web",
      inLanguage: "pt-BR",
      isAccessibleForFree: true,
      description: "Interpreta gírias, frases e memes considerando significado, intenção e contexto.",
      featureList: [
        "Interpretação contextual de gírias",
        "Explicação de memes e expressões",
        "Leitura de intenção e contexto",
        "Busca por linguagem informal brasileira",
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EliteHomeLanding />
    </>
  );
}
