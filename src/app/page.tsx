import type { Metadata } from "next";
import EliteHomeLanding from "@/components/home/elite-home-landing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Gíria AI — entenda qualquer gíria",
  description:
    "Digite uma gíria, frase ou meme e receba significado, intenção e contexto em segundos.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gíria AI — entenda qualquer gíria",
    description: "Pergunte. O Gíria AI explica significado, intenção e contexto.",
    url: siteUrl,
    type: "website",
    locale: "pt_BR",
    siteName: "Gíria AI",
  },
};

export default function Home() {
  return <EliteHomeLanding />;
}
