import { createHash } from "crypto";
import type { SlangTerm } from "@/lib/slang-data";
import { getEditorialEvidence } from "@/lib/editorial-evidence";

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  return JSON.stringify(value);
}

export function getRevisionIntegrity(entry: SlangTerm, site: string) {
  const slug = entry.term.toLowerCase().trim().replace(/\s+/g, "-");
  const evidence = getEditorialEvidence(entry.term);
  const payload = { term: entry.term, meaning: entry.meaning, adultTranslation: entry.adultTranslation, context: entry.context, safeExample: entry.safeExample, contextNotes: entry.contextNotes, origin: entry.origin, variations: entry.variations, category: entry.category, region: entry.region, popularityStatus: entry.popularityStatus, evidenceReviewedAt: evidence?.reviewedAt || null };
  const contentHash = createHash("sha256").update(stable(payload)).digest("hex");
  return { knowledgeId: `${site}/id/term/${encodeURIComponent(slug)}`, revisionId: `sha256:${contentHash}`, algorithm: "sha256", contentHash, observedRevisionAt: evidence?.reviewedAt || null, canonical: `${site}/o-que-significa/${encodeURIComponent(entry.term)}`, policy: "O hash identifica a revisão do conteúdo canônico; mudança no conteúdo produz um novo revisionId. Não é assinatura criptográfica nem prova externa de veracidade." };
}
