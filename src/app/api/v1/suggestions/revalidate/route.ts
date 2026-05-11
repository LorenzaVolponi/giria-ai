import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-guard";
import { withSecurityHeaders } from "@/lib/security";
import { revalidatePendingSuggestions } from "@/lib/suggestion-pipeline";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const data = await revalidatePendingSuggestions(40).catch(() => null);
  if (!data) return withSecurityHeaders(NextResponse.json({ error: "Falha ao revalidar sugestões." }, { status: 500 }));
  return withSecurityHeaders(NextResponse.json({ ok: true, ...data }));
}

