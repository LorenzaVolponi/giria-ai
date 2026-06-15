import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as translatePost } from "../src/app/api/v1/translate/route";
import { GET as metricsGet } from "../src/app/api/v1/metrics/route";
import { resetRateLimitStoreForTests } from "../src/lib/rate-limit";
import { parseMetricsWindow } from "../src/lib/metrics";

function makeRequest(url: string, method: string, body?: unknown, headers?: Record<string, string>) {
  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("API v1 rate-limit and metrics", () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
    delete process.env.ADMIN_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns rate-limit headers and 429 after burst", async () => {
    let lastStatus = 200;
    let lastHeaders: Headers | null = null;

    for (let i = 0; i < 27; i++) {
      const req = makeRequest("http://localhost/api/v1/translate", "POST", { text: `slay ${i}` }, { "x-forwarded-for": "9.9.9.9" });
      const res = await translatePost(req);
      lastStatus = res.status;
      lastHeaders = res.headers;
    }

    expect(lastStatus).toBe(429);
    expect(lastHeaders?.get("Retry-After")).toBe("60");
    expect(lastHeaders?.get("X-RateLimit-Remaining")).not.toBeNull();
  });

  it("fails closed in production when ADMIN_API_TOKEN is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.ADMIN_API_TOKEN;

    const req = makeRequest("http://localhost/api/v1/metrics", "GET");
    const res = await metricsGet(req);

    expect(res.status).toBe(503);
  });

  it("blocks metrics endpoint when ADMIN_API_TOKEN is enabled", async () => {
    process.env.ADMIN_API_TOKEN = "secret-token";
    const req = makeRequest("http://localhost/api/v1/metrics", "GET");
    const res = await metricsGet(req);

    expect(res.status).toBe(401);
  });

  it("normalizes metrics window query values", () => {
    expect(parseMetricsWindow(null)).toBeUndefined();
    expect(parseMetricsWindow("abc")).toBeUndefined();
    expect(parseMetricsWindow("0")).toBeUndefined();
    expect(parseMetricsWindow("15.9")).toBe(15);
    expect(parseMetricsWindow("999999")).toBe(10080);
  });

  it("accepts invalid and oversized metrics windows without changing response shape", async () => {
    process.env.ADMIN_API_TOKEN = "secret-token";

    for (const windowValue of ["abc", "999999"]) {
      const req = makeRequest(`http://localhost/api/v1/metrics?window=${windowValue}`, "GET", undefined, { "x-admin-token": "secret-token" });
      const res = await metricsGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("totalRequests");
      expect(data.windowMinutes).toBeUndefined();
    }
  });

  it("returns metrics when admin token is provided", async () => {
    process.env.ADMIN_API_TOKEN = "secret-token";
    const req = makeRequest("http://localhost/api/v1/metrics", "GET", undefined, { "x-admin-token": "secret-token" });
    const res = await metricsGet(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty("totalRequests");
    expect(data).toHaveProperty("errorRate");
  });
});
