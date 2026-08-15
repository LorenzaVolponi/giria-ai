import { ACTIVE_GUIDE_CLUSTERS } from "@/lib/guide-policy";

function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const updatedAt = new Date(
    Math.max(...ACTIVE_GUIDE_CLUSTERS.map((cluster) => new Date(cluster.updatedAt).getTime())),
  ).toUTCString();
  const items = ACTIVE_GUIDE_CLUSTERS.map((cluster) => {
    const url = `${site}/guias/${cluster.slug}`;
    return `    <item>\n      <title>${xmlEscape(cluster.title)}</title>\n      <link>${xmlEscape(url)}</link>\n      <guid isPermaLink="true">${xmlEscape(url)}</guid>\n      <description>${xmlEscape(cluster.description)}</description>\n      <pubDate>${new Date(cluster.updatedAt).toUTCString()}</pubDate>\n      <category>${xmlEscape(cluster.shortTitle)}</category>\n    </item>`;
  }).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Guias de gírias e cultura digital | Gíria AI</title>\n    <link>${xmlEscape(`${site}/guias`)}</link>\n    <description>Atualizações editoriais do Gíria AI sobre gírias brasileiras, memes, linguagem jovem, redes sociais e regionalismos.</description>\n    <language>pt-BR</language>\n    <lastBuildDate>${updatedAt}</lastBuildDate>\n${items}\n  </channel>\n</rss>\n`;

  return new Response(body, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
