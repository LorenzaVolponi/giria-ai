import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  listSuggestionsByStatusMock,
  listApprovedSuggestionsMock,
  getSuggestionStatusCountsMock,
  getSuggestionWindowCountsMock,
} = vi.hoisted(() => ({
  listSuggestionsByStatusMock: vi.fn(),
  listApprovedSuggestionsMock: vi.fn(),
  getSuggestionStatusCountsMock: vi.fn(),
  getSuggestionWindowCountsMock: vi.fn(),
}));

vi.mock("../src/lib/suggestion-pipeline", () => ({
  autoPromoteApprovedSlang: vi.fn(),
  isSuggestionEligible: vi.fn(),
  notifyLeadEmail: vi.fn(),
  processSuggestion: vi.fn(),
  saveValidatedSlang: vi.fn(),
  trackSuggestionIngress: vi.fn(),
  validateSuggestionPayload: vi.fn(),
  listApprovedSuggestions: listApprovedSuggestionsMock,
  listSuggestionsByStatus: listSuggestionsByStatusMock,
  getSuggestionStatusCounts: getSuggestionStatusCountsMock,
  getSuggestionWindowCounts: getSuggestionWindowCountsMock,
}));

import { GET } from "../src/app/api/v1/suggestions/route";

describe("suggestions API quality decoration", () => {
  it("returns quality recommendations and summary for listed suggestions", async () => {
    listSuggestionsByStatusMock.mockResolvedValueOnce([
      { id: "safe", term: "farmar aura", meaning: "ganhar moral nas redes", context: "comentários do tiktok", submitterName: "Ana", submitterEmail: "ana@email.com", score: 0.9, status: "pending", createdAt: "2026-06-01T00:00:00.000Z" },
      { id: "weak", term: "kkkkkkkk", meaning: "asdf", submitterName: "Bot", submitterEmail: "bot@email.com", score: 0.1, status: "pending", createdAt: "2026-06-01T00:00:00.000Z" },
    ]);

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=pending");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.items[0].quality.recommendation).toBe("approve");
    expect(data.items[1].quality.recommendation).toBe("reject");
    expect(data.qualitySummary).toEqual({ approve: 1, review: 0, reject: 1 });
  });

  it("filters suggestions by quality recommendation while preserving full summary", async () => {
    listSuggestionsByStatusMock.mockResolvedValueOnce([
      { id: "safe", term: "farmar aura", meaning: "ganhar moral nas redes", context: "comentários do tiktok", submitterName: "Ana", submitterEmail: "ana@email.com", score: 0.9, status: "pending", createdAt: "2026-06-01T00:00:00.000Z" },
      { id: "review", term: "trend nova", meaning: "algo que está aparecendo", submitterName: "Bia", submitterEmail: "bia@email.com", score: 0.45, status: "pending", createdAt: "2026-06-01T00:00:00.000Z" },
      { id: "weak", term: "kkkkkkkk", meaning: "asdf", submitterName: "Bot", submitterEmail: "bot@email.com", score: 0.1, status: "pending", createdAt: "2026-06-01T00:00:00.000Z" },
    ]);

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=pending&quality=approve");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].id).toBe("safe");
    expect(data.qualitySummary).toEqual({ approve: 1, review: 1, reject: 1 });
  });

});
