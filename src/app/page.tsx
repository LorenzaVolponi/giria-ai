import type { Metadata } from "next";
import AiChatPopup from "@/components/home/ai-chat-popup";
import EliteHomeLanding from "@/components/home/elite-home-landing";
import PremiumExperience from "@/components/home/premium-experience";
import SiteHeader from "@/components/home/site-header";
import { ORGANIC_SEO_KEYWORDS } from "@/lib/seo-keyword-layer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Dicionário inteligente de gírias brasileiras | Gíria AI",
  description:
    "Descubra o significado de gírias brasileiras, memes, expressões do TikTok, linguagem adolescente e termos regionais com contexto, origem e exemplos claros.",
  keywords: [
    "tradutor de gírias brasileiras",
    "o que significa gíria",
    "dicionário de gírias brasileiras",
    "gírias adolescentes",
    "gírias do TikTok",
    "linguagem adolescente para pais",
    ...ORGANIC_SEO_KEYWORDS,
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gíria AI — Dicionário inteligente de gírias brasileiras",
    description:
      "Entenda gírias, memes e expressões da internet brasileira com significado, contexto, origem e exemplos.",
    url: siteUrl,
    type: "website",
    locale: "pt_BR",
    siteName: "Gíria AI",
  },
  twitter: {
    card: "summary",
    title: "Gíria AI — Dicionário inteligente de gírias brasileiras",
    description:
      "Descubra o significado de gírias brasileiras e entenda o contexto cultural por trás de cada expressão.",
  },
};

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gíria AI",
    url: siteUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "pt-BR",
    description:
      "Dicionário inteligente de gírias brasileiras com contexto para pais, educadores e curiosos entenderem linguagem adolescente, memes e expressões regionais.",
    audience: [
      { "@type": "Audience", audienceType: "pais" },
      { "@type": "Audience", audienceType: "educadores" },
      { "@type": "Audience", audienceType: "curiosos sobre cultura digital brasileira" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "O que é o Gíria AI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "O Gíria AI é um dicionário inteligente de gírias brasileiras que explica significado, contexto, origem, exemplos e nível de atenção para pais, educadores e usuários curiosos.",
        },
      },
      {
        "@type": "Question",
        name: "O Gíria AI explica gírias do TikTok e memes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. A ferramenta organiza expressões de TikTok, redes sociais, memes, conversas de grupo, regionalismos e linguagem adolescente em português do Brasil.",
        },
      },
      {
        "@type": "Question",
        name: "Como pesquisar o significado de uma gíria?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Digite a gíria na busca da página inicial ou navegue pelas páginas de glossário, guias e termos individuais para encontrar explicações detalhadas.",
        },
      },
    ],
  },
];

export default function Home() {
  return (
    <>
      {homeJsonLd.map((item) => (
        <script
          key={item["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <SiteHeader />
      <EliteHomeLanding />
      <PremiumExperience />
      <AiChatPopup />
    </>
  );
}
