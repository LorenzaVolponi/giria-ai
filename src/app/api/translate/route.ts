import { NextRequest } from "next/server";
import { handleTranslatePost } from "@/lib/translate-endpoint";

export async function POST(request: NextRequest) {
  return handleTranslatePost(request);
}
