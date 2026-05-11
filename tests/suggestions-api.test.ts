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

  it("replays idempotent POST with same response payload", async () => {
    vi.spyOn(pipeline, "validateSuggestionPayload").mockReturnValue({
      ok: true,
      normalized: {
        term: "chave",
        meaning: "muito bom",
        context: "funk",
        submitterName: "Ana",
        submitterWhatsapp: "+5511999999999",
        submitterEmail: "ana@email.com",
      },
    });
    vi.spyOn(pipeline, "isSuggestionEligible").mockResolvedValue({ ok: true, term: "chave" });
    vi.spyOn(pipeline, "processSuggestion").mockResolvedValue({
      adjustedMeaning: "muito bom",
      totalScore: 0.9,
      status: "approved",
      evidence: ["web:0.90", "llm:0.00"],
    });
    const saveSpy = vi.spyOn(pipeline, "saveValidatedSlang").mockResolvedValue({ id: "idem_1", createdAt: "2026-05-11T00:00:00.000Z" });
    vi.spyOn(pipeline, "autoPromoteApprovedSlang").mockResolvedValue({ promoted: true });
    vi.spyOn(pipeline, "notifyLeadEmail").mockResolvedValue();

    const body = JSON.stringify({
      term: "chave",
      meaning: "muito bom",
      context: "funk",
      submitterName: "Ana",
      submitterContact: "+5511999999999",
      submitterEmail: "ana@email.com",
    });

    const req1 = new NextRequest("http://localhost/api/v1/suggestions", {
      method: "POST",
      body,
      headers: { "content-type": "application/json", "idempotency-key": "abc-123" },
    });
    const res1 = await POST(req1);
    const data1 = await res1.json();

    const req2 = new NextRequest("http://localhost/api/v1/suggestions", {
      method: "POST",
      body,
      headers: { "content-type": "application/json", "idempotency-key": "abc-123" },
    });
    const res2 = await POST(req2);
    const data2 = await res2.json();

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(200);
    expect(data2).toHaveProperty("idempotentReplay", true);
    expect(data2.id).toBe(data1.id);
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it("rejects idempotency-key reuse with different payload", async () => {
    vi.spyOn(pipeline, "validateSuggestionPayload").mockReturnValue({
      ok: true,
      normalized: {
        term: "chave",
        meaning: "muito bom",
        context: "funk",
        submitterName: "Ana",
        submitterWhatsapp: "+5511999999999",
        submitterEmail: "ana@email.com",
      },
    });
    vi.spyOn(pipeline, "isSuggestionEligible").mockResolvedValue({ ok: true, term: "chave" });
    vi.spyOn(pipeline, "processSuggestion").mockResolvedValue({
      adjustedMeaning: "muito bom",
      totalScore: 0.9,
      status: "approved",
      evidence: ["web:0.90", "llm:0.00"],
    });
    vi.spyOn(pipeline, "saveValidatedSlang").mockResolvedValue({ id: "idem_2", createdAt: "2026-05-11T00:00:00.000Z" });
    vi.spyOn(pipeline, "autoPromoteApprovedSlang").mockResolvedValue({ promoted: true });
    vi.spyOn(pipeline, "notifyLeadEmail").mockResolvedValue();

    const req1 = new NextRequest("http://localhost/api/v1/suggestions", {
      method: "POST",
      body: JSON.stringify({ term: "chave", meaning: "muito bom", context: "funk", submitterName: "Ana", submitterContact: "+5511999999999", submitterEmail: "ana@email.com" }),
      headers: { "content-type": "application/json", "idempotency-key": "dup-key" },
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(201);

    vi.spyOn(pipeline, "validateSuggestionPayload").mockReturnValue({
      ok: true,
      normalized: {
        term: "diferente",
        meaning: "outro",
        context: "internet",
        submitterName: "Ana",
        submitterWhatsapp: "+5511999999999",
        submitterEmail: "ana@email.com",
      },
    });

    const req2 = new NextRequest("http://localhost/api/v1/suggestions", {
      method: "POST",
      body: JSON.stringify({ term: "diferente", meaning: "outro", context: "internet", submitterName: "Ana", submitterContact: "+5511999999999", submitterEmail: "ana@email.com" }),
      headers: { "content-type": "application/json", "idempotency-key": "dup-key" },
    });
    const res2 = await POST(req2);
    const data2 = await res2.json();

    expect(res2.status).toBe(409);
    expect(data2.error).toContain("Idempotency-Key");
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

  it("filters by date range when from/to are provided", async () => {
    vi.spyOn(pipeline, "listApprovedSuggestions").mockResolvedValue([
      { id: "a", term: "x", meaning: "y", submitterName: "n", score: 0.8, status: "approved", createdAt: "2026-05-01T12:00:00.000Z" } as never,
      { id: "b", term: "x2", meaning: "y2", submitterName: "n2", score: 0.8, status: "approved", createdAt: "2026-05-10T12:00:00.000Z" } as never,
    ]);
    const req = new NextRequest("http://localhost/api/v1/suggestions?status=approved&from=2026-05-05&to=2026-05-11");
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].id).toBe("b");
  });
});
