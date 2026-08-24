import { NextResponse } from "next/server";
import { buildEntityAuthority } from "@/lib/entity-authority";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const authority = buildEntityAuthority(site);
  return NextResponse.json({
    "@context": "https://schema.org",
    schema: "giria-ai/entity-authority/v1",
    canonical: `${site}/entity.json`,
    "@graph": authority.graph,
    ids: authority.ids,
    policy: "Este grafo declara relações editoriais e de publicação mantidas pelo Gíria AI; não implica certificação externa, ranking ou endosso de terceiros.",
  }, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "Content-Language": "pt-BR",
      "X-Robots-Tag": "index, follow",
      Link: `<${site}/entity.json>; rel=\"canonical\", <${site}/.well-known/giria-ai.json>; rel=\"describedby\"`,
    },
  });
}
