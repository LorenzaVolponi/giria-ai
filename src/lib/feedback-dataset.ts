export type EditorialQueueReason = "unknown_term" | "low_confidence" | "negative_feedback" | "none";

export interface FeedbackDatasetRecord {
  event: "translation_feedback";
  verdict: "correct" | "incorrect";
  term: string;
  query: string;
  matchType: string;
  confidence: "alta" | "media" | "baixa";
  timestamp: string;
  editorialQueueReason: EditorialQueueReason;
  editorialPriority: number;
}

export function buildFeedbackDatasetRecord(input: Omit<FeedbackDatasetRecord, "timestamp" | "editorialQueueReason" | "editorialPriority">): FeedbackDatasetRecord {
  const unknown = !input.term || input.matchType === "fallback";
  const lowConfidence = input.confidence === "baixa";
  const negative = input.verdict === "incorrect";

  let editorialQueueReason: EditorialQueueReason = "none";
  if (unknown) editorialQueueReason = "unknown_term";
  else if (negative) editorialQueueReason = "negative_feedback";
  else if (lowConfidence) editorialQueueReason = "low_confidence";

  const editorialPriority = Math.min(100,
    (unknown ? 45 : 0) +
    (negative ? 35 : 0) +
    (lowConfidence ? 20 : 0)
  );

  return { ...input, timestamp: new Date().toISOString(), editorialQueueReason, editorialPriority };
}
