import { NextRequest, NextResponse } from "next/server";
import { getClientIp, withSecurityHeaders } from "@/lib/security";
import { isRateLimited } from "@/lib/rate-limit";
import { getRequestId, logApiEvent } from "@/lib/observability";
import {
  autoPromoteApprovedSlang,
  getSuggestionStatusCounts,
  isSuggestionEligible,
  listApprovedSuggestions,
  listSuggestionsByStatus,
  notifyLeadEmail,
  processSuggestion,
  saveValidatedSlang,
  validateSuggestionPayload,
} from "@/lib/suggestion-pipeline";

const idempotencyCache = new Map<string, { expiresAt: number; fingerprint: string; payload: { id: string; score: number; status: string; promoted: boolean; createdAt: string } }>();

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);

  try {
    const ip = getClientIp(request);
    const rate = await isRateLimited(`suggestion:${ip}`, 10, 60);
    if (rate.limited) {
      return withSecurityHeaders(NextResponse.json({ error: "Muitas sugestões em pouco tempo." }, { status: 429 }));
    }
    const idemKey = request.headers.get("idempotency-key")?.trim();
    if (idempotencyCache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of idempotencyCache.entries()) {
        if (value.expiresAt <= now) idempotencyCache.delete(key);
      }
    }

    const payload = (await request.json().catch(() => ({}))) as Record<string, string>;
    const parsed = validateSuggestionPayload({
      term: payload.term || "",
      meaning: payload.meaning || "",
      context: payload.context || "",
      submitterName: payload.submitterName || payload.name || "",
      submitterWhatsapp: payload.submitterWhatsapp || payload.submitterContact || payload.contact || "",
      submitterEmail: payload.submitterEmail || (payload.contact?.includes("@") ? payload.contact : "") || "",
    });

    if (!parsed.ok) {
      return withSecurityHeaders(NextResponse.json({ error: parsed.reason }, { status: 400 }));
    }
    const fingerprint = JSON.stringify(parsed.normalized);
    if (idemKey) {
      const cacheKey = `${ip}:${idemKey}`;
      const hit = idempotencyCache.get(cacheKey);
      if (hit && hit.expiresAt > Date.now()) {
        if (hit.fingerprint !== fingerprint) {
          return withSecurityHeaders(NextResponse.json({ error: "Idempotency-Key já usado com payload diferente." }, { status: 409 }));
        }
        return withSecurityHeaders(NextResponse.json({ ok: true, ...hit.payload, idempotentReplay: true }, { status: 200 }));
      }
    }

    const eligibility = await isSuggestionEligible(parsed.normalized.term);
    if (!eligibility.ok) {
      return withSecurityHeaders(NextResponse.json({ error: eligibility.reason }, { status: 422 }));
    }

    const processed = await processSuggestion(parsed.normalized);

    const saved = await saveValidatedSlang({ ...parsed.normalized, meaning: processed.adjustedMeaning, score: processed.totalScore, status: processed.status, evidence: processed.evidence });
    const promoted = await autoPromoteApprovedSlang({ ...parsed.normalized, meaning: processed.adjustedMeaning, status: processed.status });
    await notifyLeadEmail({ ...parsed.normalized, meaning: processed.adjustedMeaning, score: processed.totalScore, status: processed.status, contextCategory: parsed.normalized.context || "geral" }).catch(() => null);

    logApiEvent({ requestId, route: "/api/v1/suggestions", status: 201, durationMs: Date.now() - startedAt, message: `status_${processed.status}` });
    const responsePayload = { id: saved.id, score: processed.totalScore, status: processed.status, promoted: promoted.promoted, createdAt: saved.createdAt };
    if (idemKey) {
      idempotencyCache.set(`${ip}:${idemKey}`, { expiresAt: Date.now() + 10 * 60_000, fingerprint, payload: responsePayload });
    }
    return withSecurityHeaders(NextResponse.json({ ok: true, ...responsePayload }, { status: 201 }));
  } catch {
    logApiEvent({ requestId, route: "/api/v1/suggestions", status: 500, durationMs: Date.now() - startedAt, message: "internal_error" });
    return withSecurityHeaders(NextResponse.json({ error: "Falha ao processar sugestão." }, { status: 500 }));
  }
}

export async function GET(request?: NextRequest) {
  const rawStatus = request?.nextUrl.searchParams.get("status") || "approved";
  const status = rawStatus === "approved" || rawStatus === "pending" || rawStatus === "rejected" || rawStatus === "all" ? rawStatus : "approved";
  const rawLimit = Number(request?.nextUrl.searchParams.get("limit") || 200);
  const limit = Number.isFinite(rawLimit) ? Math.min(300, Math.max(1, Math.floor(rawLimit))) : 200;
  const includeSummary = request?.nextUrl.searchParams.get("includeSummary") === "true";
  const from = request?.nextUrl.searchParams.get("from");
  const to = request?.nextUrl.searchParams.get("to");

  const base = status === "approved" ? await listApprovedSuggestions(limit) : await listSuggestionsByStatus(status, limit);
  const fromTs = from ? Date.parse(from) : NaN;
  const toTs = to ? Date.parse(to) : NaN;
  const hasFrom = Number.isFinite(fromTs);
  const hasTo = Number.isFinite(toTs);
  const data = (hasFrom || hasTo)
    ? base.filter((item) => {
        const ts = Date.parse(String(item.createdAt || ""));
        if (!Number.isFinite(ts)) return false;
        if (hasFrom && ts < fromTs) return false;
        if (hasTo && ts > toTs) return false;
        return true;
      })
    : base;
  const summary = includeSummary ? await getSuggestionStatusCounts() : undefined;
  return withSecurityHeaders(NextResponse.json({ items: data, ...(summary ? { summary } : {}) }));
}
