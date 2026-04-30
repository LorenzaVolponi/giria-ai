import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "Gíria AI — Tradutor de Gírias Brasileiras",
  description:
    "Entenda o que adolescentes estão falando. Traduza gírias de forma rápida e objetiva com explicações contextuais para pais e educadores.",
  keywords: [
    "gírias brasileiras",
    "tradutor de gírias",
    "linguagem adolescente",
    "gírias internet",
    "slang brasileiro",
    "entender adolescentes",
    "gírias funk",
    "gírias TikTok",
  ],
  authors: [{ name: "AIX8C", url: "https://twitter.com/lorenzavolponi" }],
  openGraph: {
    title: "Gíria AI — Tradutor de Gírias Brasileiras",
    description:
      "Entenda o que adolescentes estão falando. Traduza gírias de forma rápida e objetiva.",
    type: "website",
    locale: "pt_BR",
    siteName: "Gíria AI",
  },
  twitter: {
    card: "summary",
    title: "Gíria AI — Tradutor de Gírias Brasileiras",
    description:
      "Entenda o que adolescentes estão falando. Traduza gírias de forma rápida e objetiva.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
