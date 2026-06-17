import { describe, expect, it, vi, afterEach } from "vitest";
import { GET as healthGet } from "../src/app/api/v1/health/route";
import { buildHealthPayload } from "../src/lib/health";

describe("health API", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns operational metadata and safe configuration checks", async () => {
    vi.stubEnv("ADMIN_API_TOKEN", "secret-token");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "redis-token");
    vi.stubEnv("DATABASE_URL", "postgres://example");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "1234567890abcdef");

    const res = await healthGet();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toMatchObject({
      status: "ok",
      service: "giria-ai",
      commit: "1234567890ab",
      checks: {
        adminToken: { status: "ok" },
        redis: { status: "ok" },
        database: { status: "ok" },
      },
    });
    expect(data.runtime).toMatch(/^node-v/);
    expect(typeof data.uptimeSeconds).toBe("number");
    expect(JSON.stringify(data)).not.toContain("secret-token");
    expect(JSON.stringify(data)).not.toContain("redis-token");
  });

  it("warns about missing optional backing services without failing health", () => {
    vi.stubEnv("ADMIN_API_TOKEN", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("DATABASE_URL", "");

    const payload = buildHealthPayload(new Date("2026-06-17T00:00:00.000Z"));

    expect(payload.status).toBe("ok");
    expect(payload.timestamp).toBe("2026-06-17T00:00:00.000Z");
    expect(payload.checks.adminToken.status).toBe("warn");
    expect(payload.checks.redis.status).toBe("warn");
    expect(payload.checks.database.status).toBe("warn");
  });
});
