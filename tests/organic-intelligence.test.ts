import { describe, expect, it } from "vitest";
import { SLANG_DATA } from "@/lib/slang-data";
import { getFreshnessSignal, getIndexabilitySignal, getUnknownQuerySnapshot, recordUnknownQuery } from "@/lib/organic-intelligence";

describe("organic intelligence", () => {
  it("scores indexability between zero and one hundred", () => {
    const signal = getIndexabilitySignal(SLANG_DATA[0]);
    expect(signal.score).toBeGreaterThanOrEqual(0);
    expect(signal.score).toBeLessThanOrEqual(100);
    expect(typeof signal.indexable).toBe("boolean");
  });

  it("does not invent editorial freshness for catalog-only terms", () => {
    const withoutEvidence = SLANG_DATA.find((term) => getFreshnessSignal(term.term).status === "catalog_only");
    if (!withoutEvidence) return;
    const freshness = getFreshnessSignal(withoutEvidence.term);
    expect(freshness.reviewedAt).toBeNull();
    expect(freshness.latestEvidenceAt).toBeNull();
  });

  it("aggregates unknown queries without personal identifiers", () => {
    recordUnknownQuery("expressao totalmente desconhecida xyz", "baixa", null);
    recordUnknownQuery("expressao totalmente desconhecida xyz", "baixa", null);
    const item = getUnknownQuerySnapshot(100).find((entry) => entry.query.includes("totalmente desconhecida"));
    expect(item?.count).toBeGreaterThanOrEqual(2);
    expect(item).not.toHaveProperty("ip");
    expect(item).not.toHaveProperty("userId");
  });
});
