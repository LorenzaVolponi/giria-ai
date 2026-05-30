import { RISK_CONFIG, SLANG_DATA, type RiskLevel, type SlangTerm } from "@/lib/slang-data";

export type RegionKey = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul" | "Brasil";

export const REGION_ORDER: RegionKey[] = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul", "Brasil"];

export const REGION_CONTENT: Record<RegionKey, { title: string; description: string; highlights: string[] }> = {
  Norte: {
    title: "Norte amazônico",
    description: "Expressões de identidade amazônica, fala paraense/acreana e referências a rio, açaí, tacacá e cotidiano local.",
    highlights: ["açaí", "Amazônia", "tacacá", "igarapé"],
  },
  Nordeste: {
    title: "Nordeste popular",
    description: "Interjeições, vocativos e usos de festa/interior conectados a São João, sertão, praia e conversa familiar.",
    highlights: ["São João", "sertão", "forró", "mainha"],
  },
  "Centro-Oeste": {
    title: "Centro-Oeste e cerrado",
    description: "Falas do cerrado, interior e cotidiano com pequi, roça, cidade pequena, Brasília/Goiás e expressões de aproximação.",
    highlights: ["cerrado", "pequi", "roça", "uai sô"],
  },
  Sudeste: {
    title: "Sudeste urbano/interior",
    description: "Mistura de fala urbana e interiorana, com Minas, Rio, São Paulo, padoca, praia, serra e comida local.",
    highlights: ["pão de queijo", "padoca", "praia", "serra"],
  },
  Sul: {
    title: "Sul gaúcho e fronteira",
    description: "Termos ligados a chimarrão, fronteira, serra, churrasco e vocativos clássicos do Sul brasileiro.",
    highlights: ["chimarrão", "fronteira", "tchê", "bergamota"],
  },
  Brasil: {
    title: "Brasil geral",
    description: "Expressões regionais amplas ou cruzadas entre mais de uma macro-região, úteis quando o uso não pertence a um único território.",
    highlights: ["Brasil", "uso amplo", "múltiplas regiões"],
  },
};

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


export type RegionalContextGroupKey = "digital" | "comida" | "festa" | "territorio" | "cotidiano";

export interface RegionalVariationGroup {
  key: RegionalContextGroupKey;
  label: string;
  variations: SlangTerm[];
}

export interface RegionalGlossaryEntry {
  key: string;
  rootTerm: string;
  summary: string;
  primary: SlangTerm;
  variations: SlangTerm[];
  featuredVariations: SlangTerm[];
  variationGroups: RegionalVariationGroup[];
  totalVariants: number;
}

export interface RegionalEntryLookup {
  region: RegionKey;
  entry: RegionalGlossaryEntry;
}

export interface RegionalExpressionRoute {
  region: RegionKey;
  rootTerm: string;
  path: string;
  priority: number;
}

const FEATURED_ROOTS_BY_REGION: Record<RegionKey, string[]> = {
  Norte: ["égua", "pai d'égua", "de rocha", "cunhantã", "curumim", "arre diacho", "tacacá mood", "açaí raiz"],
  Nordeste: ["oxente", "oxe", "arre égua", "arretado", "avexado", "brocado", "carioquinha", "macaxeira"],
  "Centro-Oeste": ["uai sô", "arreda", "camelo", "trem bão", "pequiado", "cerrado raiz", "dá conta"],
  Sudeste: ["pão de sal", "pão de queijo", "trem", "uai", "mano", "pocar", "biscoito de polvilho"],
  Sul: ["bah", "tchê", "guri", "bergamota", "cacetinho", "baita", "chimarrão", "tri massa"],
  Brasil: [],
};

const REGION_PREFERRED_CONTEXTS: Record<RegionKey, string[]> = {
  Norte: ["açaí", "amazônia", "tacacá", "maniçoba", "igarapé", "rio", "zap"],
  Nordeste: ["são joão", "sertão", "forró", "carnaval", "praia", "interior", "zap"],
  "Centro-Oeste": ["cerrado", "pequi", "roça", "cidade pequena", "sertão", "interior", "zap"],
  Sudeste: ["pão de queijo", "praia carioca", "serra", "padoca", "cidade", "zap"],
  Sul: ["chimarrão", "fronteira", "serra", "churrasco", "cidade pequena", "zap"],
  Brasil: ["zap", "rua", "turma", "família"],
};

const LOW_VALUE_CONTEXTS = [" do x", "do chat", "do discord", "de domingo", "da turma", "de cria"];

const CONTEXT_GROUPS: Array<{ key: RegionalContextGroupKey; label: string; matcher: RegExp }> = [
  { key: "digital", label: "Digital", matcher: /zap|tiktok|instagram|discord|chat|live|meme|rede social|online|story/i },
  { key: "comida", label: "Comida e costumes", matcher: /açaí|chimarrão|pequi|pão de queijo|padoca|mercado|churrasco|comida|alimentar/i },
  { key: "festa", label: "Festa e cultura", matcher: /são joão|carnaval|festa|forró|encontro social/i },
  { key: "territorio", label: "Território", matcher: /amazônia|cerrado|sertão|serra|fronteira|roça|cidade pequena|bairro|rua|interior|local/i },
  { key: "cotidiano", label: "Cotidiano", matcher: /família|turma|noite|cedinho|susto|moral|boa|cotidiana|conversa/i },
];

let regionalTermsCache: SlangTerm[] | null = null;
let regionalEntriesCache: Map<RegionKey, RegionalGlossaryEntry[]> | null = null;
let regionalRootLookupCache: Map<string, RegionalEntryLookup> | null = null;
let regionalTermLookupCache: Map<string, RegionalEntryLookup> | null = null;

function getAllRegionalTerms(): SlangTerm[] {
  if (!regionalTermsCache) {
    regionalTermsCache = SLANG_DATA.filter((term) => term.category === "regional");
  }
  return regionalTermsCache;
}

function resetRegionalLookupCaches() {
  regionalRootLookupCache = null;
  regionalTermLookupCache = null;
}

function normalizeForMatch(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function extractRegionalRootTerm(term: SlangTerm): string {
  const originRoot = term.origin.match(/expressão regional "(.+?)"/i)?.[1];
  if (originRoot) return originRoot.trim();

  const firstVariation = term.variations.find((variation) => {
    const normalizedVariation = variation.toLowerCase().trim();
    const normalizedTerm = term.term.toLowerCase().trim();
    return normalizedVariation && normalizedVariation !== normalizedTerm && normalizedTerm.startsWith(normalizedVariation);
  });

  return firstVariation?.trim() || term.term.trim();
}

function summarizeRegionalMeaning(term: SlangTerm): string {
  return term.meaning
    .replace(/^Variação contextual de "[^"]+" — /, "")
    .replace(/ — usada .+$/, "")
    .trim();
}

function variationContextText(term: SlangTerm): string {
  return `${term.term} ${term.context} ${term.contextNotes} ${term.origin}`;
}

function scoreRegionalVariation(term: SlangTerm, region: RegionKey): number {
  const normalized = normalizeForMatch(variationContextText(term));
  let score = 0;

  REGION_PREFERRED_CONTEXTS[region].forEach((preferred, index) => {
    if (normalized.includes(normalizeForMatch(preferred))) score += 110 - index * 8;
  });

  if (term.popularityStatus === "trending") score += 20;
  if (term.term.length <= 32) score += 10;

  const matchedGroup = CONTEXT_GROUPS.find((group) => group.matcher.test(variationContextText(term)));
  if (matchedGroup?.key === "territorio" || matchedGroup?.key === "comida" || matchedGroup?.key === "festa") score += 25;
  if (matchedGroup?.key === "digital") score += 15;

  for (const lowValue of LOW_VALUE_CONTEXTS) {
    if (normalized.includes(normalizeForMatch(lowValue))) score -= 120;
  }

  return score;
}

function sortVariationsByQuality(variations: SlangTerm[], region: RegionKey): SlangTerm[] {
  return [...variations].sort((a, b) => {
    const byScore = scoreRegionalVariation(b, region) - scoreRegionalVariation(a, region);
    if (byScore !== 0) return byScore;
    return a.term.localeCompare(b.term, "pt-BR");
  });
}

function groupVariationsByContext(variations: SlangTerm[], region: RegionKey): RegionalVariationGroup[] {
  const grouped = new Map<RegionalContextGroupKey, SlangTerm[]>();
  for (const group of CONTEXT_GROUPS) grouped.set(group.key, []);

  for (const variation of sortVariationsByQuality(variations, region)) {
    const text = variationContextText(variation);
    const group = CONTEXT_GROUPS.find((item) => item.matcher.test(text)) ?? CONTEXT_GROUPS[CONTEXT_GROUPS.length - 1];
    grouped.set(group.key, [...(grouped.get(group.key) ?? []), variation]);
  }

  return CONTEXT_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    variations: grouped.get(group.key) ?? [],
  })).filter((group) => group.variations.length > 0);
}

function compareRegionalTerms(a: SlangTerm, b: SlangTerm) {
  return a.term.localeCompare(b.term, "pt-BR");
}

function compareRegionalEntries(region: RegionKey, a: RegionalGlossaryEntry, b: RegionalGlossaryEntry) {
  const featured = FEATURED_ROOTS_BY_REGION[region].map((term) => normalizeForMatch(term));
  const aFeatured = featured.indexOf(normalizeForMatch(a.rootTerm));
  const bFeatured = featured.indexOf(normalizeForMatch(b.rootTerm));
  if (aFeatured !== -1 || bFeatured !== -1) {
    if (aFeatured === -1) return 1;
    if (bFeatured === -1) return -1;
    return aFeatured - bFeatured;
  }

  const byVariantCount = b.totalVariants - a.totalVariants;
  if (byVariantCount !== 0) return byVariantCount;
  return a.rootTerm.localeCompare(b.rootTerm, "pt-BR");
}

interface RegionalFilters {
  uf?: string;
  q?: string;
  risk?: RiskLevel | null;
}

export function getRegionalTerms({ uf = "", q = "", risk = null }: RegionalFilters = {}): SlangTerm[] {
  const ufFilter = uf.toUpperCase().trim();
  const query = q.trim().toLowerCase();
  const terms = getAllRegionalTerms();

  if (!ufFilter && !query && !risk) return terms;

  return terms
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

export function groupRegionalEntries(terms: SlangTerm[]): Map<RegionKey, RegionalGlossaryEntry[]> {
  if (regionalTermsCache && terms === regionalTermsCache && regionalEntriesCache) return regionalEntriesCache;

  const buckets = new Map<RegionKey, Map<string, SlangTerm[]>>();
  for (const key of REGION_ORDER) buckets.set(key, new Map());

  for (const term of terms) {
    const region = normalizeRegionLabel(term.region);
    const rootTerm = extractRegionalRootTerm(term);
    const groupKey = `${region}:${rootTerm.toLowerCase().trim()}`;
    const regionBucket = buckets.get(region)!;
    regionBucket.set(groupKey, [...(regionBucket.get(groupKey) ?? []), term]);
  }

  const grouped = new Map<RegionKey, RegionalGlossaryEntry[]>();
  for (const region of REGION_ORDER) {
    const entries = Array.from(buckets.get(region)!.entries()).map(([key, list]) => {
      const sorted = [...list].sort(compareRegionalTerms);
      const rootTerm = extractRegionalRootTerm(sorted[0]);
      const exactRoot = sorted.find((term) => term.term.toLowerCase().trim() === rootTerm.toLowerCase().trim());
      const primary = exactRoot ?? sorted.reduce((best, term) => (term.term.length < best.term.length ? term : best), sorted[0]);
      const variations = sorted.filter((term) => term !== primary);
      const rankedVariations = sortVariationsByQuality(variations, region);
      return {
        key,
        rootTerm,
        summary: summarizeRegionalMeaning(primary),
        primary,
        variations: rankedVariations,
        featuredVariations: rankedVariations.slice(0, 3),
        variationGroups: groupVariationsByContext(rankedVariations, region),
        totalVariants: variations.length,
      } satisfies RegionalGlossaryEntry;
    });

    entries.sort((a, b) => compareRegionalEntries(region, a, b));
    grouped.set(region, entries);
  }

  if (regionalTermsCache && terms === regionalTermsCache) {
    regionalEntriesCache = grouped;
    resetRegionalLookupCaches();
  }

  return grouped;
}

function getAllRegionalEntries(): Map<RegionKey, RegionalGlossaryEntry[]> {
  return groupRegionalEntries(getAllRegionalTerms());
}

function regionalRootLookupKey(region: RegionKey, rootTerm: string): string {
  return `${region}:${normalizeForMatch(rootTerm)}`;
}

function getRegionalRootLookupMap(): Map<string, RegionalEntryLookup> {
  if (regionalRootLookupCache) return regionalRootLookupCache;

  const lookup = new Map<string, RegionalEntryLookup>();
  const grouped = getAllRegionalEntries();
  for (const region of REGION_ORDER) {
    for (const entry of grouped.get(region) ?? []) {
      lookup.set(regionalRootLookupKey(region, entry.rootTerm), { region, entry });
    }
  }

  regionalRootLookupCache = lookup;
  return lookup;
}

function getRegionalTermLookupMap(): Map<string, RegionalEntryLookup> {
  if (regionalTermLookupCache) return regionalTermLookupCache;

  const lookup = new Map<string, RegionalEntryLookup>();
  const grouped = getAllRegionalEntries();
  for (const region of REGION_ORDER) {
    for (const entry of grouped.get(region) ?? []) {
      const entryLookup = { region, entry };
      for (const term of [entry.primary, ...entry.variations]) {
        lookup.set(normalizeForMatch(term.term), entryLookup);
      }
    }
  }

  regionalTermLookupCache = lookup;
  return lookup;
}


export function getRegionalEntryByRoot(rootTerm: string, region?: string): RegionalEntryLookup | null {
  const wantedRoot = normalizeForMatch(decodeURIComponent(rootTerm).trim());
  if (!wantedRoot) return null;

  const wantedRegion = region ? normalizeRegionLabel(region) : null;
  if (wantedRegion) return getRegionalRootLookupMap().get(regionalRootLookupKey(wantedRegion, wantedRoot)) ?? null;

  for (const regionKey of REGION_ORDER) {
    const match = getRegionalRootLookupMap().get(regionalRootLookupKey(regionKey, wantedRoot));
    if (match) return match;
  }

  return null;
}

export function getRegionalEntryForTerm(termName: string): RegionalEntryLookup | null {
  const wantedTerm = normalizeForMatch(decodeURIComponent(termName).trim());
  if (!wantedTerm) return null;
  return getRegionalTermLookupMap().get(wantedTerm) ?? null;
}

export function getRelatedRegionalEntries(rootTerm: string, region: RegionKey, limit = 6): RegionalGlossaryEntry[] {
  const grouped = getAllRegionalEntries();
  const normalizedRoot = normalizeForMatch(rootTerm);

  return (grouped.get(region) ?? [])
    .filter((entry) => normalizeForMatch(entry.rootTerm) !== normalizedRoot)
    .slice(0, limit);
}

export function regionalExpressionPath(rootTerm: string, region: RegionKey): string {
  return `/girias/regionais/${encodeURIComponent(rootTerm)}?regiao=${encodeURIComponent(region)}`;
}

export function getRegionalExpressionRoutes(limitPerRegion = 40): RegionalExpressionRoute[] {
  const grouped = getAllRegionalEntries();

  return REGION_ORDER.flatMap((region) =>
    (grouped.get(region) ?? []).slice(0, limitPerRegion).map((entry, index) => ({
      region,
      rootTerm: entry.rootTerm,
      path: regionalExpressionPath(entry.rootTerm, region),
      priority: Math.max(0.55, 0.82 - index * 0.005),
    })),
  );
}


export function getRegionalStateCounts(terms: SlangTerm[] = getRegionalTerms()): Array<{ state: string; count: number }> {
  const counts = new Map<string, number>();

  for (const term of terms) {
    for (const state of extractRegionStates(term.region)) {
      counts.set(state, (counts.get(state) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => a.state.localeCompare(b.state, "pt-BR"));
}

export function getAvailableRegionalStates(terms: SlangTerm[] = getRegionalTerms()): string[] {
  return getRegionalStateCounts(terms).map((item) => item.state);
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
