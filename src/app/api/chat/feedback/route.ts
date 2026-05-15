import { NextRequest, NextResponse } from "next/server";
import { recordChatFeedback } from "@/lib/metrics";
import { withSecurityHeaders } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const helpful = Boolean(body?.helpful);
    const reason = typeof body?.reason === "string" ? body.reason.slice(0, 60) : undefined;
    recordChatFeedback(helpful, reason);
    return withSecurityHeaders(NextResponse.json({ ok: true }));
  } catch {
    return withSecurityHeaders(NextResponse.json({ error: "Falha ao registrar feedback." }, { status: 400 }));
  }
}

