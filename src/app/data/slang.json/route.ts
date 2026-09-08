import { NextRequest, NextResponse } from "next/server";
import { getCachedOrganicDataset } from "@/lib/organic-cache";
import { recordCrawlerHit } from "@/lib/crawler-intelligence";

export async function GET(request: NextRequest) {
  recordCrawlerHit(request.headers.get("user-agent"), "/data/slang.json");
  const dataset = await getCachedOrganicDataset();
  const data = dataset.filter((item) => item.indexability.citationReady || item.indexability.score >= 70);
  return NextResponse.json({
    publisher: "Gíria AI",
    attribution: "AIX8C / volponi.tech",
    generatedAt: new Date().toISOString(),
    count: data.length,
    terms: data,
  }, {
    headers: {
      "cache-control": "public, max-age=900, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
