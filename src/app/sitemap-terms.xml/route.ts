import { getIndexableCanonicalRecords } from "@/lib/canonical-intelligence";

export async function GET() {
  const urls = getIndexableCanonicalRecords().map((record) => `<url><loc>${escapeXml(record.canonical)}</loc>${record.reviewedAt ? `<lastmod>${record.reviewedAt}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.9</priority></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300, s-maxage=3600" } });
}

function escapeXml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;"); }
