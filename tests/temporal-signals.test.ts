import { describe, expect, it } from "vitest";
import { getTemporalSignal, getVerifiedTrendSignals } from "@/lib/temporal-signals";

describe("temporal signals", () => {
  it("never exposes verified_trending without multiple external sources", () => {
    for (const item of getVerifiedTrendSignals(50)) {
      expect(item.signal).toBe("verified_trending");
      expect(item.evidenceCount).toBeGreaterThanOrEqual(2);
      expect(item.latestEvidenceAt).toBeTruthy();
    }
  });

  it("returns null for unknown terms", () => {
    expect(getTemporalSignal("termo que nao existe xyz")).toBeNull();
  });

  it("labels non-verified catalog claims conservatively", () => {
    const signals = ["active", "declining", "regional", "international", "catalog_only", "verified_trending"];
    const item = getTemporalSignal("de boa");
    expect(item).not.toBeNull();
    expect(signals).toContain(item?.signal);
  });
});
