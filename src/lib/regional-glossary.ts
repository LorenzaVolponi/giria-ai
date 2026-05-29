import { RISK_CONFIG, SLANG_DATA, type RiskLevel, type SlangTerm } from "@/lib/slang-data";

export type RegionKey = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul" | "Brasil";

export const REGION_ORDER: RegionKey[] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul", "Brasil"];

const STATE_TO_REGION: Record<string, RegionKey> = {
  AC: "Norte",
  AP: "Norte",
  AM: "Norte",
  PA: "Norte",
  RO: "Norte",
  RR: "Norte",
  TO: "Norte",
  AL: "Nordeste",
  BA: "Nordeste",
  CE: "Nordeste",
  MA: "Nordeste",
  PB: "Nordeste",
  PE: "Nordeste",
  PI: "Nordeste",
  RN: "Nordeste",
  SE: "Nordeste",
  DF: "Centro-Oeste",
  GO: "Centro-Oeste",
  MT: "Centro-Oeste",
  MS: "Centro-Oeste",
  ES: "Sudeste",
  MG: "Sudeste",
  RJ: "Sudeste",
  SP: "Sudeste",
  PR: "Sul",
  RS: "Sul",
  SC: "Sul",
};

const REGION_ALIASES: Array<{ matcher: RegExp; region: RegionKey }> = [
  { matcher: /nordeste|bahia|cear[áa]|pernambuco|para[íi]ba|alagoas|sergipe|piau[íi]|maranh[ãa]o|rio grande do norte/, region: "Nordeste" },
  { matcher: /centro[-\s]?oeste|bras[íi]lia|goi[áa]s|mato grosso|cerrado/, region: "Centro-Oeste" },
  { matcher: /sudeste|minas|s[ãa]o paulo|rio de janeiro|esp[íi]rito santo|rio\/s[ãa]o paulo/, region: "Sudeste" },
  { matcher: /\bsul\b|paran[áa]|rio grande do sul|santa catarina|ga[úu]cho|ga[úu]cha/, region: "Sul" },
  { matcher: /\bnorte\b|amazonas|par[áa]|acre|rond[ôo]nia|roraima|amap[áa]|tocantins|amaz[ôo]nia/, region: "Norte" },
];

export function extractRegionStates(region: string): string[] {
  const states = new Set<string>();
  const matches = region.matchAll(/\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MG|MS|MT|PA|PB|PE|PI|PR|RJ|RN|RO|RR|RS|SC|SE|SP|TO)\b/g);
  for (const match of matches) states.add(match[1]);
  return Array.from(states).sort();
}

export function normalizeRegionLabel(region: string): RegionKey {
  const states = extractRegionStates(region);
  const stateRegions = new Set(states.map((state) => STATE_TO_REGION[state]).filter(Boolean));
  if (stateRegions.size === 1) return Array.from(stateRegions)[0];

  const normalized = region.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const aliasMatches = REGION_ALIASES.filter((alias) => alias.matcher.test(normalized));
  if (aliasMatches.length === 1) return aliasMatches[0].region;
  return "Brasil";
}

export function parseRiskFilter(value?: string): RiskLevel | null {
  if (!value) return null;
  return value in RISK_CONFIG ? (value as RiskLevel) : null;
}

interface RegionalFilters {
  uf?: string;
  q?: string;
  risk?: RiskLevel | null;
}

export function getRegionalTerms({ uf = "", q = "", risk = null }: RegionalFilters = {}): SlangTerm[] {
  const ufFilter = uf.toUpperCase().trim();
  const query = q.trim().toLowerCase();

  return SLANG_DATA.filter((term) => term.category === "regional")
    .filter((term) => !risk || term.riskLevel === risk)
    .filter((term) => !ufFilter || extractRegionStates(term.region).includes(ufFilter))
    .filter((term) => {
      if (!query) return true;
      return `${term.term} ${term.meaning} ${term.context} ${term.region} ${term.origin}`.toLowerCase().includes(query);
    });
}

export function groupRegionalTerms(terms: SlangTerm[]): Map<RegionKey, SlangTerm[]> {
  const grouped = new Map<RegionKey, SlangTerm[]>();
  for (const key of REGION_ORDER) grouped.set(key, []);

  for (const term of terms) {
    grouped.get(normalizeRegionLabel(term.region))!.push(term);
  }

  return grouped;
}

export function getAvailableRegionalStates(terms: SlangTerm[] = getRegionalTerms()): string[] {
  return Array.from(new Set(terms.flatMap((term) => extractRegionStates(term.region)))).sort();
}

export function getRegionalRiskCounts(terms: SlangTerm[]): Record<RiskLevel, number> {
  const counts = { green: 0, yellow: 0, orange: 0, red: 0 } satisfies Record<RiskLevel, number>;
  for (const term of terms) counts[term.riskLevel] += 1;
  return counts;
}

export function getRegionalCoverageStats(terms: SlangTerm[]) {
  const grouped = groupRegionalTerms(terms);
  const total = terms.length;
  const byRegion = REGION_ORDER.map((region) => ({ region, count: grouped.get(region)?.length ?? 0 }));
  const byRisk = getRegionalRiskCounts(terms);
  const trending = terms.filter((term) => term.popularityStatus === "trending").length;
  const states = getAvailableRegionalStates(terms);

  return { total, byRegion, byRisk, trending, states };
}
