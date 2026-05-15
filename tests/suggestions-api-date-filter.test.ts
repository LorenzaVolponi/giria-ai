import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  listApprovedSuggestionsMock,
  listSuggestionsByStatusMock,
  getSuggestionStatusCountsMock,
  getSuggestionWindowCountsMock,
} = vi.hoisted(() => ({
  listApprovedSuggestionsMock: vi.fn(),
  listSuggestionsByStatusMock: vi.fn(),
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

describe("suggestions GET API date filters", () => {
  it("filters items by from/to date range", async () => {
    listApprovedSuggestionsMock.mockResolvedValueOnce([
      { id: "old", term: "a", meaning: "a", createdAt: "2026-05-01T00:00:00.000Z", status: "approved" },
      { id: "mid", term: "b", meaning: "b", createdAt: "2026-05-10T00:00:00.000Z", status: "approved" },
      { id: "new", term: "c", meaning: "c", createdAt: "2026-05-20T00:00:00.000Z", status: "approved" },
    ]);

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=approved&from=2026-05-05T00:00:00.000Z&to=2026-05-15T23:59:59.999Z");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].id).toBe("mid");
  });
});
