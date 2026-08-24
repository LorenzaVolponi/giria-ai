import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, sanitizeUserInput, withSecurityHeaders } from "@/lib/security";
import { isRateLimited } from "@/lib/rate-limit";
import { getRequestId, logApiEvent } from "@/lib/observability";
import { buildFeedbackDatasetRecord } from "@/lib/feedback-dataset";

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
  if (rate.limited) return withSecurityHeaders(NextResponse.json({ error: "Muitos feedbacks em sequência." }, { status: 429 }));

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return withSecurityHeaders(NextResponse.json({ error: "Feedback inválido." }, { status: 400 }));

  const record = buildFeedbackDatasetRecord({
    event: "translation_feedback",
    verdict: parsed.data.verdict,
    term: sanitizeUserInput(parsed.data.term || "", 120),
    query: sanitizeUserInput(parsed.data.query || "", 220),
    matchType: parsed.data.matchType || "fallback",
    confidence: parsed.data.confidence || "baixa",
  });

  console.log(JSON.stringify({ requestId, dataset: "feedback-v1", ...record }));
  logApiEvent({ requestId, route: "/api/feedback", status: 202, durationMs: Date.now() - startedAt, message: `feedback:${record.verdict}:${record.editorialQueueReason}:p${record.editorialPriority}` });

  const response = NextResponse.json({ accepted: true, queuedForEditorialReview: record.editorialQueueReason !== "none" }, { status: 202 });
  response.headers.set("x-request-id", requestId);
  return withSecurityHeaders(response);
}
