import { describe, expect, it } from "vitest";
import { getEditorialResearchQueue, getEvidenceFlywheelSnapshot, getFeedbackSignalSnapshot, recordEditorialFeedbackSignal } from "@/lib/evidence-flywheel";

describe("GEO evidence flywheel", () => {
  it("turns negative low-confidence feedback into an editorial priority", () => {
    recordEditorialFeedbackSignal({ verdict: "incorrect", term: "teste-flywheel", query: "teste flywheel contexto", confidence: "baixa", matchType: "fallback" });
    const feedback = getFeedbackSignalSnapshot(100).find((item) => item.key === "teste-flywheel");
    expect(feedback).toBeTruthy();
    expect(feedback?.incorrect).toBeGreaterThan(0);
    expect(feedback?.feedbackPriority).toBeGreaterThan(40);
  });

  it("combines user signals with topical authority gaps without auto-promoting evidence", () => {
    const queue = getEditorialResearchQueue(100);
    expect(queue.length).toBeGreaterThan(0);
    expect(queue.some((item) => item.type === "topical_gap" || item.type === "feedback_gap" || item.type === "unknown_query")).toBe(true);

    const snapshot = getEvidenceFlywheelSnapshot();
    expect(snapshot.policy.purpose).toContain("nunca promover automaticamente");
    expect(snapshot.policy.promotionRule).toContain("evidência editorial");
    expect(snapshot.policy.persistence).toContain("logs estruturados");
  });
});
