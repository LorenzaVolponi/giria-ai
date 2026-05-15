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

describe("suggestions GET API filters/summary flags", () => {
  it("does not include summary fields when includeSummary is false", async () => {
    listApprovedSuggestionsMock.mockResolvedValueOnce([
      { id: "1", term: "x", meaning: "y", createdAt: new Date().toISOString(), status: "approved" },
    ]);

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=approved");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.summary).toBeUndefined();
    expect(data.windowSummary).toBeUndefined();
    expect(Array.isArray(data.items)).toBe(true);
    expect(getSuggestionStatusCountsMock).not.toHaveBeenCalled();
    expect(getSuggestionWindowCountsMock).not.toHaveBeenCalled();
  });

  it("falls back to approved status when invalid status is provided", async () => {
    listApprovedSuggestionsMock.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=invalid-status");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(listApprovedSuggestionsMock).toHaveBeenCalled();
    expect(listSuggestionsByStatusMock).not.toHaveBeenCalled();
  });
});
