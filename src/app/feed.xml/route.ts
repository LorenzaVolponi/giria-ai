import { getRadarItems, getRankingTerms } from "@/lib/growth";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

export function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const now = new Date().toUTCString();
  const terms = getRankingTerms(24).map((term) => ({
    title: `O que significa ${term.term}?`,
    link: `${site}/o-que-significa/${encodeURIComponent(term.term)}`,
    description: `${term.meaning} Contexto: ${term.context}`,
  }));
  const radarItems = getRadarItems().map((item) => ({
    title: item.title,
    link: `${site}/radar`,
    description: item.description,
  }));

  const items = [...radarItems, ...terms]
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid>${escapeXml(item.link)}#${escapeXml(item.title)}</guid>
      <pubDate>${now}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Gíria AI — Radar e significados</title>
    <link>${site}</link>
    <description>Atualizações de gírias brasileiras, radar semanal e páginas de significado.</description>
    <language>pt-BR</language>
    <lastBuildDate>${now}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
