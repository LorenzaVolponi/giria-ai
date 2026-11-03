import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/metrics", () => ({ recordChatFeedback: vi.fn() }));
import { recordChatFeedback } from "@/lib/metrics";
import { POST } from "@/app/api/chat/feedback/route";

function request(body: unknown) {
  return new NextRequest("http://localhost/api/chat/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat/feedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("records a negative vote without coercing it to true", async () => {
    const res = await POST(request({ helpful: false, reason: "incorrect" }));
    expect(res.status).toBe(200);
    expect(recordChatFeedback).toHaveBeenCalledWith(false, "incorrect");
  });

  it("rejects strings and missing helpful values", async () => {
    expect((await POST(request({ helpful: "false" }))).status).toBe(400);
    expect((await POST(request({ reason: "missing" }))).status).toBe(400);
    expect(recordChatFeedback).not.toHaveBeenCalled();
  });

  it("rejects oversized feedback reasons", async () => {
    const res = await POST(request({ helpful: true, reason: "x".repeat(61) }));
    expect(res.status).toBe(400);
  });
});
