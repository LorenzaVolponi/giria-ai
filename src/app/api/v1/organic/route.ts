import { NextRequest, NextResponse } from "next/server";
import { getOrganicDataset, getVerifiedTrendReport, getUnknownQuerySnapshot } from "@/lib/organic-intelligence";
import { getCrawlerSnapshot } from "@/lib/crawler-intelligence";
import { requireAdminToken } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const dataset = getOrganicDataset();
  const citationReady = dataset.filter((item) => item.indexability.citationReady);
  const avgScore = dataset.length ? Number((dataset.reduce((sum, item) => sum + item.indexability.score, 0) / dataset.length).toFixed(1)) : 0;

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    coverage: {
      indexableTerms: dataset.length,
      citationReadyTerms: citationReady.length,
      averageIndexabilityScore: avgScore,
      verifiedTrends: getVerifiedTrendReport().length,
    },
    unknownQueries: getUnknownQuerySnapshot(50),
    crawlers: getCrawlerSnapshot(),
  }, { headers: { "cache-control": "no-store" } });
}
