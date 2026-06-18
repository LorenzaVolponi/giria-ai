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

describe("suggestions GET API summary invocation", () => {
  it("calls summary helpers when includeSummary=true", async () => {
    listApprovedSuggestionsMock.mockResolvedValueOnce([]);
    getSuggestionStatusCountsMock.mockResolvedValueOnce({ pending: 0, approved: 0, rejected: 0, all: 0 });
    getSuggestionWindowCountsMock.mockResolvedValueOnce({ dApproved: 0, dRejected: 0, wApproved: 0, wRejected: 0 });

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=approved&includeSummary=true", { headers: { "x-admin-token": "admin-panel-session" } });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(getSuggestionStatusCountsMock).toHaveBeenCalledTimes(1);
    expect(getSuggestionWindowCountsMock).toHaveBeenCalledTimes(1);
  });
});
