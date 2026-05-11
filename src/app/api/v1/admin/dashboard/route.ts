import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";
import { getSuggestionStatusCounts, listSuggestionsByStatus, listIngressIpMetrics } from "@/lib/suggestion-pipeline";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const [summary, recent] = await Promise.all([
    getSuggestionStatusCounts(),
    listSuggestionsByStatus("all", 10),
  ]);

  return withSecurityHeaders(
    NextResponse.json({
      summary,
      topIps: listIngressIpMetrics(12),
      recent: recent.map((x) => ({
        id: x.id,
        term: x.term,
        status: x.status,
        score: x.score,
        submitterName: x.submitterName,
        createdAt: x.createdAt,
      })),
    }),
  );
}
