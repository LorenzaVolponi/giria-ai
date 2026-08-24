import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as translatePost } from "../src/app/api/v1/translate/route";
import { GET as metricsGet } from "../src/app/api/v1/metrics/route";
import { isRateLimited, resetRateLimitStoreForTests } from "../src/lib/rate-limit";
import { parseMetricsWindow, MAX_METRICS_WINDOW_MINUTES } from "../src/lib/metrics";

function makeRequest(url: string, method: string, body?: unknown, headers?: Record<string, string>) { return new NextRequest(url, { method, headers: { "content-type": "application/json", ...(headers || {}) }, body: body ? JSON.stringify(body) : undefined }); }

describe("API v1 rate-limit and metrics", () => {
  beforeEach(() => { resetRateLimitStoreForTests(); delete process.env.ADMIN_API_TOKEN; delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN; vi.restoreAllMocks(); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("returns rate-limit headers and 429 after burst", async () => {
    let lastStatus = 200; let lastHeaders: Headers | null = null;
    for (let i = 0; i < 27; i++) { const req = makeRequest("http://localhost/api/v1/translate", "POST", { text: `slay ${i}` }, { "x-forwarded-for": "9.9.9.9" }); const res = await translatePost(req); lastStatus = res.status; lastHeaders = res.headers; }
    expect(lastStatus).toBe(429); expect(lastHeaders?.get("Retry-After")).toBe("60"); expect(lastHeaders?.get("X-RateLimit-Remaining")).not.toBeNull();
  }, 15000);

  it("uses a single Redis EVAL call for atomic fixed-window limiting", async () => { vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com/"); vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "redis-token"); const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ result: 3 }), { status: 200 })); const rate = await isRateLimited("atomic-user", 5, 60); expect(rate).toEqual({ limited: false, remaining: 2 }); expect(fetchSpy).toHaveBeenCalledTimes(1); const [url, init] = fetchSpy.mock.calls[0]; expect(String(url)).toContain("/eval/"); expect(String(url)).toContain(encodeURIComponent("rl:atomic-user:")); expect(init).toMatchObject({ method: "POST", cache: "no-store" }); });
  it("fails closed in production when ADMIN_API_TOKEN is missing", async () => { vi.stubEnv("NODE_ENV", "production"); delete process.env.ADMIN_API_TOKEN; const res = await metricsGet(makeRequest("http://localhost/api/v1/metrics", "GET")); expect(res.status).toBe(503); });
  it("blocks metrics endpoint when ADMIN_API_TOKEN is enabled", async () => { vi.stubEnv("ADMIN_API_TOKEN", "secret-token"); const res = await metricsGet(makeRequest("http://localhost/api/v1/metrics", "GET")); expect(res.status).toBe(401); });
  it("normalizes metrics window query values", () => { expect(parseMetricsWindow(null)).toBe(60); expect(parseMetricsWindow("0")).toBe(1); expect(parseMetricsWindow("999999")).toBe(MAX_METRICS_WINDOW_MINUTES); expect(parseMetricsWindow("banana")).toBe(60); });
  it("accepts invalid and oversized metrics windows without changing response shape", async () => { vi.stubEnv("ADMIN_API_TOKEN", "secret-token"); for (const value of ["banana", "999999"]) { const res = await metricsGet(makeRequest(`http://localhost/api/v1/metrics?windowMinutes=${value}`, "GET", undefined, { authorization: "Bearer secret-token" })); expect(res.status).toBe(200); const body = await res.json(); expect(body).toHaveProperty("windowMinutes"); expect(body).toHaveProperty("totals"); } });
  it("returns metrics when admin token is provided", async () => { vi.stubEnv("ADMIN_API_TOKEN", "secret-token"); const res = await metricsGet(makeRequest("http://localhost/api/v1/metrics", "GET", undefined, { authorization: "Bearer secret-token" })); expect(res.status).toBe(200); const body = await res.json(); expect(body).toHaveProperty("totals"); });
});
