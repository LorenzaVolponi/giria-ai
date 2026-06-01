import { NextRequest, NextResponse } from "next/server";
import { getRankingTerms } from "@/lib/growth";
import { withSecurityHeaders } from "@/lib/security";

export function GET(request: NextRequest) {
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit") || 50)));
  const terms = getRankingTerms(limit).map((term, index) => ({
    position: index + 1,
    term: term.term,
    meaning: term.meaning,
    category: term.category,
    riskLevel: term.riskLevel,
    region: term.region,
    url: `/o-que-significa/${encodeURIComponent(term.term)}`,
  }));

  return withSecurityHeaders(NextResponse.json({ updatedAt: new Date().toISOString(), limit, terms }));
}
