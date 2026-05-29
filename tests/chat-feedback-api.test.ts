import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/chat/feedback/route";

function makeRequest(body: unknown, ip = "198.51.100.10") {
  return new NextRequest("http://localhost/api/chat/feedback", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("chat feedback API", () => {
  it("accepts valid helpful feedback", async () => {
    const res = await POST(makeRequest({ helpful: true, reason: "resposta_clara" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ ok: true });
  });

  it("rejects invalid feedback payloads", async () => {
    const res = await POST(makeRequest({ helpful: "yes", reason: "qualquer" }, "198.51.100.11"));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(String(data.error)).toContain("Feedback inválido");
  });
});
