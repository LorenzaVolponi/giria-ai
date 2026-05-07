import { NextRequest } from "next/server";
import { buildCorsPreflight, handleTranslatePost } from "@/lib/translate-endpoint";

export async function OPTIONS(req: NextRequest) {
  return buildCorsPreflight(req);
}

export async function POST(request: NextRequest) {
  return handleTranslatePost(request);
}
