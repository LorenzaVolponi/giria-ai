import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, sanitizeUserInput, withSecurityHeaders } from "@/lib/security";
import { isRateLimited } from "@/lib/rate-limit";
import { getRequestId, logApiEvent } from "@/lib/observability";
import { recordEditorialFeedbackSignal } from "@/lib/evidence-flywheel";
import { persistGeoSignal } from "@/lib/geo-signal-store";

const schema = z.object({
  verdict: z.enum(["correct", "incorrect"]),
  term: z.string().trim().max(120).optional(),
  query: z.string().trim().max(220).optional(),
  matchType: z.enum(["exact", "contextual", "approximate", "fallback", "semantic"]).optional(),
  confidence: z.enum(["alta", "media", "baixa"]).optional(),
});

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const ip = getClientIp(request);
  const rate = await isRateLimited(`feedback:${ip}`, 30, 60);
  if (rate.limited) {
    return withSecurityHeaders(NextResponse.json({ error: "Muitos feedbacks em sequência." }, { status: 429 }));
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return withSecurityHeaders(NextResponse.json({ error: "Feedback inválido." }, { status: 400 }));
  }

  const payload = {
    event: "translation_feedback",
    verdict: parsed.data.verdict,
    term: sanitizeUserInput(parsed.data.term || "", 120),
    query: sanitizeUserInput(parsed.data.query || "", 220),
    matchType: parsed.data.matchType || "fallback",
    confidence: parsed.data.confidence || "baixa",
  } as const;

  recordEditorialFeedbackSignal({
    verdict: payload.verdict,
    term: payload.term,
    query: payload.query,
    matchType: payload.matchType,
    confidence: payload.confidence,
  });

  const persistence = await persistGeoSignal({
    type: "feedback_gap",
    key: payload.term || payload.query,
    term: payload.term || null,
    query: payload.query || null,
    payload: {
      verdict: payload.verdict,
      matchType: payload.matchType,
      confidence: payload.confidence,
    },
  });

  console.log(JSON.stringify({ timestamp: new Date().toISOString(), requestId, ...payload, geoSignalBackend: persistence.backend, durable: persistence.durable }));
  logApiEvent({ requestId, route: "/api/feedback", status: 202, durationMs: Date.now() - startedAt, message: `feedback:${payload.verdict}:${payload.matchType}:${payload.confidence}` });

  const response = NextResponse.json({ accepted: true }, { status: 202 });
  response.headers.set("x-request-id", requestId);
  return withSecurityHeaders(response);
}
