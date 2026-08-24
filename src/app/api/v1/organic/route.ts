import { NextRequest, NextResponse } from "next/server";
import { getOrganicDataset, getVerifiedTrendReport, getUnknownQuerySnapshot } from "@/lib/organic-intelligence";
import { getCrawlerSnapshot } from "@/lib/crawler-intelligence";
import { requireAdminToken } from "@/lib/admin-guard";
import { getEvidenceFlywheelSnapshot } from "@/lib/evidence-flywheel";

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const dataset = getOrganicDataset();
  const citationReady = dataset.filter((item) => item.indexability.citationReady);
  const avgScore = dataset.length ? Number((dataset.reduce((sum, item) => sum + item.indexability.score, 0) / dataset.length).toFixed(1)) : 0;
  const flywheel = getEvidenceFlywheelSnapshot();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    coverage: {
      indexableTerms: dataset.length,
      citationReadyTerms: citationReady.length,
      averageIndexabilityScore: avgScore,
      verifiedTrends: getVerifiedTrendReport().length,
    },
    unknownQueries: getUnknownQuerySnapshot(50),
    evidenceFlywheel: {
      counts: flywheel.counts,
      topPriorities: flywheel.queue.slice(0, 10),
      policy: flywheel.policy,
    },
    crawlers: getCrawlerSnapshot(),
  }, { headers: { "cache-control": "no-store" } });
}
