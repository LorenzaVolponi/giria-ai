import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";

  return {
    name: "Gíria AI — Tradutor de Gírias Brasileiras",
    short_name: "Gíria AI",
    description: "Traduza gírias brasileiras, memes e linguagem jovem com contexto para pais, educadores e jovens.",
    start_url: "/?utm_source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#ecfdf5",
    theme_color: "#059669",
    orientation: "portrait-primary",
    categories: ["education", "utilities", "lifestyle"],
    lang: "pt-BR",
    icons: [
      {
        src: `${site}/favicon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
      {
        src: `${site}/logo.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Traduzir gíria",
        short_name: "Traduzir",
        description: "Abrir a busca do Gíria AI.",
        url: "/?utm_source=pwa_shortcut_search",
        icons: [{ src: `${site}/favicon.svg`, sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "Radar de gírias",
        short_name: "Radar",
        description: "Ver gírias em destaque.",
        url: "/radar?utm_source=pwa_shortcut_radar",
        icons: [{ src: `${site}/favicon.svg`, sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "Ranking",
        short_name: "Ranking",
        description: "Abrir ranking de gírias brasileiras.",
        url: "/ranking?utm_source=pwa_shortcut_ranking",
        icons: [{ src: `${site}/favicon.svg`, sizes: "any", type: "image/svg+xml" }],
      },
    ],
  };
}
