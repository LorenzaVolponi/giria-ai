import { getEditorialEvidence } from "@/lib/editorial-evidence";

const HIGH_AUTHORITY = new Set(["merriam-webster.com", "dictionary.com", "cambridge.org", "folha.uol.com.br", "band.com.br", "abril.com.br"]);

function domainOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "unknown"; }
}

export function buildSourceAuthority(term: string) {
  const evidence = getEditorialEvidence(term);
  const sources = evidence?.sources || [];
  const domains = [...new Set(sources.map((s) => domainOf(s.url)))];
  const publishers = [...new Set(sources.map((s) => s.publisher))];
  const authorityDomains = domains.filter((d) => HIGH_AUTHORITY.has(d) || [...HIGH_AUTHORITY].some((known) => d.endsWith(`.${known}`)));
  const sourceCount = sources.length;
  const diversity = domains.length;
  const authorityCoverage = sourceCount ? authorityDomains.length / Math.max(1, diversity) : 0;
  const score = Math.min(100, Math.round(sourceCount * 15 + diversity * 12 + authorityCoverage * 25));
  return {
    score,
    sourceCount,
    publisherCount: publishers.length,
    domainCount: domains.length,
    authorityDomainCount: authorityDomains.length,
    publishers,
    domains,
    authorityDomains,
    interpretation: sourceCount === 0 ? "catalog_only" : diversity >= 2 && authorityDomains.length >= 1 ? "diverse_editorial_support" : "limited_editorial_support",
    policy: "Score interno de qualidade/diversidade das fontes registradas. Não representa PageRank, Domain Authority de terceiros, consenso linguístico ou garantia de ranking/citação.",
  };
}
