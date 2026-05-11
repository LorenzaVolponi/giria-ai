import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

const { moderateSuggestionStatusMock } = vi.hoisted(() => ({
  moderateSuggestionStatusMock: vi.fn(),
}));

vi.mock("../src/lib/suggestion-pipeline", () => ({
  moderateSuggestionStatus: moderateSuggestionStatusMock,
}));

import { PATCH } from "../src/app/api/v1/suggestions/[id]/route";

describe("suggestion moderation API", () => {
  it("allows rejected status without reason for admin moderation", async () => {
    moderateSuggestionStatusMock.mockResolvedValueOnce(undefined);

    const req = new NextRequest("http://localhost/api/v1/suggestions/abc", {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected" }),
      headers: {
        "content-type": "application/json",
        cookie: "giria_admin_session=admin-panel-session; giria_admin_csrf=test-csrf",
        "x-csrf-token": "test-csrf",
      },
      headers: { "content-type": "application/json", cookie: "giria_admin_session=admin-panel-session" },
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.status).toBe("rejected");
    expect(moderateSuggestionStatusMock).toHaveBeenCalledWith("abc", "rejected", { actor: "admin007", reason: undefined });
  });
});
