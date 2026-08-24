import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { buildEntityAuthority } from "@/lib/entity-authority";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
const entityAuthority = buildEntityAuthority(siteUrl);

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    ...entityAuthority.graph,
    {
      "@type": "DefinedTermSet",
      "@id": entityAuthority.ids.dictionary,
      name: "Gíria AI — Linguagem informal brasileira",
      url: `${siteUrl}/o-que-significa`,
      inLanguage: "pt-BR",
      publisher: { "@id": entityAuthority.ids.product },
      creator: { "@id": entityAuthority.ids.aix8c },
    },
    {
      "@type": "SearchAction",
      target: `${siteUrl}/o-que-significa/{search_term_string}`,
      "query-input": "required name=search_term_string",
      potentialActionStatus: "https://schema.org/ActiveActionStatus",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gíria AI — Dicionário e tradutor de gírias brasileiras",
    template: "%s | Gíria AI",
  },
  applicationName: "Gíria AI",
  category: "education",
  description:
    "Entenda gírias brasileiras, memes e expressões da internet com significado, contexto, exemplos de uso, origem e variações regionais.",
  authors: [{ name: "Gíria AI", url: siteUrl }, { name: "AIX8C", url: "https://volponi.tech" }],
  creator: "AIX8C",
  publisher: "Gíria AI",
  openGraph: {
    title: "Gíria AI — Dicionário e tradutor de gírias brasileiras",
    description:
      "Entenda gírias brasileiras, memes e expressões da internet com significado, contexto, exemplos e variações regionais.",
    images: [{ url: "/logo.svg", width: 512, height: 512, alt: "Logo do Gíria AI" }],
    url: "/",
    type: "website",
    locale: "pt_BR",
    siteName: "Gíria AI",
  },
  twitter: {
    card: "summary",
    title: "Gíria AI — Dicionário e tradutor de gírias brasileiras",
    description:
      "Entenda gírias brasileiras, memes e expressões da internet com significado, contexto e exemplos.",
    images: [{ url: "/logo.svg", width: 512, height: 512, alt: "Logo do Gíria AI" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/", languages: { "pt-BR": "/" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="search" type="application/opensearchdescription+xml" title="Gíria AI" href="/opensearch.xml" />
        <link rel="alternate" type="application/rss+xml" title="Guias de gírias e cultura digital | Gíria AI" href="/guias/feed.xml" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Analytics />
          <SpeedInsights />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
