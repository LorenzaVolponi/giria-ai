import { NextRequest, NextResponse } from "next/server";
import { recordChatFeedback } from "@/lib/metrics";
import { withSecurityHeaders } from "@/lib/security";
import { z } from "zod";

const feedbackSchema = z.object({
  helpful: z.boolean(),
  reason: z.string().trim().max(60).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return withSecurityHeaders(NextResponse.json({ error: "Feedback inválido. Informe helpful como booleano." }, { status: 400 }));
  }

  try {
    recordChatFeedback(parsed.data.helpful, parsed.data.reason);
    return withSecurityHeaders(NextResponse.json({ ok: true }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Falha ao registrar feedback." }, { status: 500 }));
  }
}
