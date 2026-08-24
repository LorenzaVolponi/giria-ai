import { NextResponse } from "next/server";
import { getOrganicDataset } from "@/lib/organic-intelligence";

const esc = (v: string) => v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;");

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://giria-ai.vercel.app";
  const urls = getOrganicDataset().filter((item) => item.indexability.citationReady && item.evidence).flatMap((item) => {
    const slug = encodeURIComponent(item.term.toLowerCase().trim().replace(/\s+/g,"-"));
    const lastmod = item.evidence?.reviewedAt ? `<lastmod>${esc(item.evidence.reviewedAt)}</lastmod>` : "";
    return [
      `${site}/o-que-significa/${slug}`,
      `${site}/citation/${slug}`,
      `${site}/provenance/${slug}`,
      `${site}/source-authority/${slug}`,
    ].map((loc) => `<url><loc>${esc(loc)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>0.9</priority></url>`);
  }).join("");
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300, s-maxage=3600", "x-robots-tag": "index, follow" } });
}
