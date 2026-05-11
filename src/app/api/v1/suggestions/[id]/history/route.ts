import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";
import { getSuggestionById, parseModerationEvidence } from "@/lib/suggestion-pipeline";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const item = await getSuggestionById(id);
  if (!item) {
    return withSecurityHeaders(NextResponse.json({ error: "Sugestão não encontrada." }, { status: 404 }));
  }

  const evidence = Array.isArray((item as { evidence?: unknown[] }).evidence) ? ((item as { evidence?: string[] }).evidence || []) : [];
  const history = parseModerationEvidence(evidence).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return withSecurityHeaders(NextResponse.json({ id, history }));
}
