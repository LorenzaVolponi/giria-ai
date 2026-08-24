import { NextRequest, NextResponse } from "next/server";
import { getOrganicDataset } from "@/lib/organic-intelligence";
import { recordCrawlerHit } from "@/lib/crawler-intelligence";

function xmlEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET(request: NextRequest) {
  recordCrawlerHit(request.headers.get("user-agent"), "/sitemap-terms.xml");
  const urls = getOrganicDataset()
    .filter((item) => item.indexability.indexable)
    .map((item) => {
      const lastmod = item.evidence?.reviewedAt ? `<lastmod>${xmlEscape(item.evidence.reviewedAt)}</lastmod>` : "";
      return `<url><loc>${xmlEscape(item.canonicalUrl)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>${item.indexability.citationReady ? "0.9" : "0.7"}</priority></url>`;
    })
    .join("");

  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300, s-maxage=3600" },
  });
}
