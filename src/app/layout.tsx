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
  title: {
    default: "Gíria AI — Tradutor de Gírias Brasileiras",
    template: "%s | Gíria AI",
  },
  applicationName: "Gíria AI",
  category: "education",
  description:
    "Tradutor de gírias brasileiras para entender linguagem adolescente, memes, TikTok, regionalismos e expressões da internet com contexto e exemplos seguros.",
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
  creator: "AIX8C",
  publisher: "Gíria AI",
  openGraph: {
    title: "Gíria AI — Tradutor de Gírias Brasileiras",
    description:
      "Tradutor de gírias brasileiras com contexto para pais, educadores e curiosos entenderem memes, TikTok e linguagem adolescente.",
    images: [{ url: "/logo.svg", width: 512, height: 512, alt: "Logo do Gíria AI" }],
    url: "/",
    type: "website",
    locale: "pt_BR",
    siteName: "Gíria AI",
  },
  twitter: {
    card: "summary",
    title: "Gíria AI — Tradutor de Gírias Brasileiras",
    description:
      "Tradutor de gírias brasileiras com contexto para pais, educadores e curiosos entenderem memes, TikTok e linguagem adolescente.",
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
