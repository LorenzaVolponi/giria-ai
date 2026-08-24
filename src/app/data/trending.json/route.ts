import { NextRequest, NextResponse } from "next/server";
import { getVerifiedTrendReport } from "@/lib/organic-intelligence";
import { recordCrawlerHit } from "@/lib/crawler-intelligence";

export async function GET(request: NextRequest) {
  recordCrawlerHit(request.headers.get("user-agent"), "/data/trending.json");
  const trends = getVerifiedTrendReport();
  return NextResponse.json({
    publisher: "Gíria AI",
    methodology: "Um termo só aparece como tendência quando combina sinal de catálogo, evidência editorial recente e freshness mínima. Ausência de evidência suficiente não vira tendência.",
    generatedAt: new Date().toISOString(),
    count: trends.length,
    trends,
  }, { headers: { "cache-control": "public, max-age=300, s-maxage=1800, stale-while-revalidate=21600" } });
}
