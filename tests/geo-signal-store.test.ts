import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDurableGeoSignals, persistGeoSignal, resetGeoSignalStoreForTests } from "@/lib/geo-signal-store";
import { getEditorialWorkflowSnapshot, setEditorialWorkflowState } from "@/lib/editorial-lifecycle";

describe("GEO durable signal store", () => {
  beforeEach(() => {
    resetGeoSignalStoreForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.restoreAllMocks();
  });

  it("falls back to bounded runtime memory when Redis is not configured", async () => {
    const result = await persistGeoSignal({ type: "unknown_query", key: "teste", query: "teste", payload: { confidence: "baixa" } });
    expect(result).toEqual({ durable: false, backend: "memory" });
    const snapshot = await getDurableGeoSignals(10);
    expect(snapshot.durable).toBe(false);
    expect(snapshot.events[0]?.key).toBe("teste");
  });

  it("writes an atomic bounded event append through Upstash pipeline when configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.com");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{ result: 1 }, { result: "OK" }]), { status: 200 }));
    const result = await persistGeoSignal({ type: "feedback_gap", key: "delulu", term: "delulu", payload: { verdict: "incorrect" } });
    expect(result).toEqual({ durable: true, backend: "upstash" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/pipeline");
    expect(String(init?.body)).toContain("LPUSH");
    expect(String(init?.body)).toContain("LTRIM");
  });

  it("tracks human workflow state without changing citation readiness", async () => {
    await setEditorialWorkflowState({ key: "brainrot", status: "researching", note: "revisar fontes" });
    const snapshot = await getEditorialWorkflowSnapshot();
    expect(snapshot.states[0]?.status).toBe("researching");
    expect(snapshot.policy.citationReadinessUnaffected).toBe(true);
  });
});
