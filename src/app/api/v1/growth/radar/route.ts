import { NextResponse } from "next/server";
import { getRadarItems } from "@/lib/growth";
import { withSecurityHeaders } from "@/lib/security";

export function GET() {
  const payload = getRadarItems().map((section) => ({
    title: section.title,
    description: section.description,
    emoji: section.emoji,
    terms: section.terms.map((term) => ({
      term: term.term,
      meaning: term.meaning,
      category: term.category,
      riskLevel: term.riskLevel,
      url: `/o-que-significa/${encodeURIComponent(term.term)}`,
    })),
  }));

  return withSecurityHeaders(NextResponse.json({ updatedAt: new Date().toISOString(), sections: payload }));
}
