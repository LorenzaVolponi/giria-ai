import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

const globalJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Gíria AI",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
    sameAs: ["https://twitter.com/lorenzavolponi"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gíria AI",
    alternateName: ["Tradutor de Gírias", "Dicionário de Gírias Brasileiras"],
    url: siteUrl,
    inLanguage: "pt-BR",
    publisher: { "@type": "Organization", name: "Gíria AI", url: siteUrl },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/o-que-significa/{search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
] as const;

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
  authors: [{ name: "Gíria AI" }],
  creator: "Gíria AI",
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
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="search" type="application/opensearchdescription+xml" title="Gíria AI" href="/opensearch.xml" />
        <link rel="alternate" type="application/rss+xml" title="Guias de gírias e cultura digital | Gíria AI" href="/guias/feed.xml" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {globalJsonLd.map((item) => (
          <script
            key={item["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          />
        ))}
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
