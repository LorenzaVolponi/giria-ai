import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

const { listApprovedSuggestionsMock, listSuggestionsByStatusMock, getSuggestionStatusCountsMock, getSuggestionWindowCountsMock } = vi.hoisted(() => ({
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

describe("suggestions GET API windowSummary", () => {
  it("returns summary and windowSummary when includeSummary=true", async () => {
    listApprovedSuggestionsMock.mockResolvedValueOnce([
      { id: "1", term: "x", meaning: "y", createdAt: new Date().toISOString(), status: "approved" },
    ]);
    getSuggestionStatusCountsMock.mockResolvedValueOnce({ pending: 1, approved: 2, rejected: 3, all: 6 });
    getSuggestionWindowCountsMock.mockResolvedValueOnce({ dApproved: 2, dRejected: 1, wApproved: 5, wRejected: 3 });

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=approved&includeSummary=true", { headers: { "x-admin-token": "admin-panel-session" } });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.summary).toEqual({ pending: 1, approved: 2, rejected: 3, all: 6 });
    expect(data.windowSummary).toEqual({ dApproved: 2, dRejected: 1, wApproved: 5, wRejected: 3 });
    expect(Array.isArray(data.items)).toBe(true);
  });
});
