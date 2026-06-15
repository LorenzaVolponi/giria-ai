import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ORGANIC_SEO_KEYWORDS } from "@/lib/seo-keyword-layer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"),
  title: "Gíria AI — Tradutor de Gírias Brasileiras",
  description:
    "Entenda gírias brasileiras, linguagem de influencer, memes com nave espacial, ET, alienígena e expressões regionais do Paraná com explicações contextuais.",
  keywords: [
    "gírias brasileiras",
    "tradutor de gírias",
    "linguagem adolescente",
    "gírias internet",
    "slang brasileiro",
    "entender adolescentes",
    "gírias funk",
    "gírias TikTok",
    ...ORGANIC_SEO_KEYWORDS,
  ],
  authors: [{ name: "AIX8C", url: "https://twitter.com/lorenzavolponi" }],
  openGraph: {
    title: "Gíria AI — Tradutor de Gírias Brasileiras",
    description:
      "Entenda gírias brasileiras, linguagem de influencer, memes com nave espacial, ET, alienígena e expressões regionais do Paraná.",
    url: "/",
    type: "website",
    locale: "pt_BR",
    siteName: "Gíria AI",
  },
  twitter: {
    card: "summary",
    title: "Gíria AI — Tradutor de Gírias Brasileiras",
    description:
      "Entenda gírias brasileiras, linguagem de influencer, memes com nave espacial, ET, alienígena e expressões regionais do Paraná.",
  },
  robots: {
    index: true,
    follow: true,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Gíria AI",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app"}/girias/{search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
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
