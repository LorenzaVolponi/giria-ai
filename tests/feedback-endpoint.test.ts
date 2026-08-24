import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/rate-limit", () => ({ isRateLimited: vi.fn(async () => ({ limited: false, remaining: 29 })) }));
vi.mock("@/lib/observability", () => ({ getRequestId: () => "test-request", logApiEvent: vi.fn() }));
vi.mock("@/lib/security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/security")>("@/lib/security");
  return { ...actual, getClientIp: () => "127.0.0.1" };
});

import { POST } from "@/app/api/feedback/route";

describe("POST /api/feedback", () => {
  it("accepts a compact valid feedback payload", async () => {
    const request = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ verdict: "correct", term: "cooked", query: "to cooked?", matchType: "contextual", confidence: "alta" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({ accepted: true });
  });

  it("rejects unsupported verdicts", async () => {
    const request = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ verdict: "maybe" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
