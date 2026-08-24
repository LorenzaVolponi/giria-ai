import { createHash } from "crypto";
import type { SlangEntry } from "@/lib/slang-data";

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function getRevisionIntegrity(entry: SlangEntry, site: string) {
  const slug = entry.term.toLowerCase().trim().replace(/\s+/g, "-");
  const payload = {
    term: entry.term,
    meaning: entry.meaning,
    context: entry.context,
    example: entry.example,
    category: entry.category,
    tags: entry.tags,
    updatedAt: entry.updatedAt || null,
  };
  const contentHash = createHash("sha256").update(stable(payload)).digest("hex");
  return {
    knowledgeId: `${site}/id/term/${encodeURIComponent(slug)}`,
    revisionId: `sha256:${contentHash}`,
    algorithm: "sha256",
    contentHash,
    observedRevisionAt: entry.updatedAt || null,
    canonical: `${site}/o-que-significa/${encodeURIComponent(slug)}`,
    policy: "O hash identifica a revisão do conteúdo canônico; mudança no conteúdo produz um novo revisionId. Não é assinatura criptográfica nem prova externa de veracidade.",
  };
}
