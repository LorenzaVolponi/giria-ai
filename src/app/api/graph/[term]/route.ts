import { NextResponse } from "next/server";
import { getLanguageGraphNode } from "@/lib/language-graph";

export const dynamic = "force-static";

export async function GET(_request: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const decoded = decodeURIComponent(term);
  const node = getLanguageGraphNode(decoded);
  if (!node) return NextResponse.json({ error: "Termo não encontrado no grafo." }, { status: 404 });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const canonical = `${site}/o-que-significa/${encodeURIComponent(node.term)}`;
  const citation = `${site}/citation/${encodeURIComponent(node.term)}`;
  const graphUrl = `${site}/api/graph/${encodeURIComponent(node.term)}`;

  return NextResponse.json({
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${canonical}#term`,
    ...node,
    publisher: {
      name: "Gíria AI",
      id: `${site}/#organization`,
    },
    canonical,
    citation,
    graphUrl,
    provenanceNotice: "As relações representam inferências internas do acervo Gíria AI e não fatos universais sobre a língua portuguesa.",
  }, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "X-Robots-Tag": "index, follow",
      "Content-Language": "pt-BR",
      "Link": `<${canonical}>; rel=\"canonical\", <${citation}>; rel=\"describedby\"`,
    },
  });
}
