import { NextResponse } from "next/server";
import { getCanonicalRecord } from "@/lib/canonical-intelligence";
import { publicReadCache } from "@/lib/resilience";

export async function GET(_request: Request, { params }: { params: Promise<{ term: string }> }) {
  const { term } = await params;
  const record = getCanonicalRecord(decodeURIComponent(term));
  if (!record) return NextResponse.json({ error: "Termo não encontrado." }, { status: 404 });
  return NextResponse.json(record, { headers: { "cache-control": publicReadCache(3600) } });
}
