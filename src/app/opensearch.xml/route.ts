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
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">\n  <ShortName>Gíria AI</ShortName>\n  <Description>Busque significados de gírias brasileiras, memes, linguagem jovem, redes sociais e regionalismos.</Description>\n  <InputEncoding>UTF-8</InputEncoding>\n  <Language>pt-BR</Language>\n  <Url type="text/html" method="get" template="${xmlEscape(`${site}/o-que-significa/{searchTerms}`)}"/>\n</OpenSearchDescription>\n`;

  return new Response(body, {
    headers: {
      "content-type": "application/opensearchdescription+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
