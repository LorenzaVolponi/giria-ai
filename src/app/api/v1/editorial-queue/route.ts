import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-guard";
import { getEvidenceFlywheelSnapshot } from "@/lib/evidence-flywheel";

export async function GET(request: NextRequest) {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  return NextResponse.json(getEvidenceFlywheelSnapshot(), {
    headers: { "cache-control": "no-store" },
  });
}
