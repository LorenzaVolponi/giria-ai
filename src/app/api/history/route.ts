import { NextResponse } from "next/server";
import { withSecurityHeaders } from "@/lib/security";

export async function GET() {
  return withSecurityHeaders(NextResponse.json([]));
}

export async function DELETE() {
  return withSecurityHeaders(NextResponse.json({ success: true }));
}
