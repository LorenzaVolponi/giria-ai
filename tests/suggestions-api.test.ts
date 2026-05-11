import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "../src/app/api/v1/suggestions/route";
import * as pipeline from "../src/lib/suggestion-pipeline";

vi.mock("../src/lib/rate-limit", () => ({
  isRateLimited: vi.fn(async () => ({ limited: false })),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("suggestions api", () => {
  it("returns items list shape", async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("items");
    expect(Array.isArray(data.items)).toBe(true);
  });

  it("accepts legacy submitterContact and returns promoted flag", async () => {
    vi.spyOn(pipeline, "validateSuggestionPayload").mockReturnValue({
      ok: true,
      normalized: {
        term: "farmar aura",
        meaning: "ganhar moral",
        context: "rede social",
        submitterName: "Ana",
        submitterWhatsapp: "+5511999999999",
        submitterEmail: "ana@email.com",
      },
    });
    vi.spyOn(pipeline, "isSuggestionEligible").mockResolvedValue({ ok: true, term: "farmar aura" });
    vi.spyOn(pipeline, "processSuggestion").mockResolvedValue({
      adjustedMeaning: "ganhar moral",
      totalScore: 0.91,
      status: "approved",
      evidence: ["web:0.90", "llm:0.01"],
    });
    vi.spyOn(pipeline, "saveValidatedSlang").mockResolvedValue({ id: "id_1", createdAt: new Date().toISOString() });
    vi.spyOn(pipeline, "autoPromoteApprovedSlang").mockResolvedValue({ promoted: true });
    vi.spyOn(pipeline, "notifyLeadEmail").mockResolvedValue();

    const req = new NextRequest("http://localhost/api/v1/suggestions", {
      method: "POST",
      body: JSON.stringify({
        term: "farmar aura",
        meaning: "ganhar moral",
        context: "rede social",
        submitterName: "Ana",
        submitterContact: "+5511999999999",
        submitterEmail: "ana@email.com",
      }),
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toHaveProperty("promoted", true);
  });

  it("returns summary when requested and normalizes invalid query params", async () => {
    vi.spyOn(pipeline, "listApprovedSuggestions").mockResolvedValue([]);
    vi.spyOn(pipeline, "getSuggestionStatusCounts").mockResolvedValue({
      pending: 2,
      approved: 5,
      rejected: 1,
      all: 8,
    });

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=invalid&limit=9999&includeSummary=true");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.summary).toEqual({ pending: 2, approved: 5, rejected: 1, all: 8 });
    expect(pipeline.listApprovedSuggestions).toHaveBeenCalledWith(300);
  });
});
