import type { Metadata } from "next";
import EliteHomeLanding from "@/components/home/elite-home-landing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

export const metadata: Metadata = {
  title: "Gíria AI — entenda gírias brasileiras",
  description:
    "Digite uma gíria, frase ou meme e entenda gírias brasileiras com significado, intenção e contexto em segundos.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gíria AI — entenda gírias brasileiras",
    description: "Pergunte. O Gíria AI explica gírias brasileiras, significado, intenção e contexto.",
    url: siteUrl,
    type: "website",
    locale: "pt_BR",
    siteName: "Gíria AI",
  },
};

export default function Home() {
  return <EliteHomeLanding />;
}
