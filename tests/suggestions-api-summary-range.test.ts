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

describe("suggestions GET API status/limit handling", () => {
  it("uses listSuggestionsByStatus for pending status and clamps limit", async () => {
    listSuggestionsByStatusMock.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=pending&limit=9999", { headers: { "x-admin-token": "admin-panel-session" } });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(listSuggestionsByStatusMock).toHaveBeenCalledWith("pending", 300);
    expect(listApprovedSuggestionsMock).not.toHaveBeenCalled();
  });

  it("applies minimum limit clamp when invalid/low limit is passed", async () => {
    listSuggestionsByStatusMock.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/v1/suggestions?status=rejected&limit=0", { headers: { "x-admin-token": "admin-panel-session" } });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(listSuggestionsByStatusMock).toHaveBeenCalledWith("rejected", 1);
  });
});
