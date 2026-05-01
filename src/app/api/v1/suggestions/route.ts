import { NextRequest, NextResponse } from "next/server";
import { withSecurityHeaders, getClientIp } from "@/lib/security";
import { isRateLimited } from "@/lib/rate-limit";
import { logApiEvent, getRequestId } from "@/lib/observability";
import { isSuggestionEligible, listApprovedSuggestions, notifyLeadEmail, saveApprovedSuggestion, validateSuggestionPayload, webSignalScore } from "@/lib/suggestion-pipeline";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);

  try {
    const ip = getClientIp(request);
    const rate = await isRateLimited(`suggestion:${ip}`, 10, 60);
    if (rate.limited) {
      return withSecurityHeaders(NextResponse.json({ error: "Muitas sugestões em pouco tempo." }, { status: 429 }));
    }

    const payload = (await request.json().catch(() => ({}))) as Record<string, string>;
    const parsed = validateSuggestionPayload({
      term: payload.term || "",
      meaning: payload.meaning || "",
      context: payload.context || "",
      name: payload.name || "",
      contact: payload.contact || "",
    });

    if (!parsed.ok) {
      return withSecurityHeaders(NextResponse.json({ error: parsed.reason }, { status: 400 }));
    }

    const eligibility = await isSuggestionEligible(parsed.normalized.term);
    if (!eligibility.ok) {
      return withSecurityHeaders(NextResponse.json({ error: eligibility.reason }, { status: 422 }));
    }

    const score = await webSignalScore(parsed.normalized.term);
    const safeScore = score < 0.3 ? 0.3 : score;

    const saved = await saveApprovedSuggestion({ ...parsed.normalized, score: safeScore });
    await notifyLeadEmail({ ...parsed.normalized, score: safeScore }).catch(() => null);

    logApiEvent({ requestId, route: "/api/v1/suggestions", status: 201, durationMs: Date.now() - startedAt, message: "auto_approved" });
    return withSecurityHeaders(NextResponse.json({ ok: true, id: saved.id, score: safeScore, createdAt: saved.createdAt }, { status: 201 }));
  } catch {
    logApiEvent({ requestId, route: "/api/v1/suggestions", status: 500, durationMs: Date.now() - startedAt, message: "internal_error" });
    return withSecurityHeaders(NextResponse.json({ error: "Falha ao processar sugestão." }, { status: 500 }));
  }
}


export async function GET() {
  const data = await listApprovedSuggestions(200);
  return withSecurityHeaders(NextResponse.json({ items: data }));
}
