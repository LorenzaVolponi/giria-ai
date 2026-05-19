#!/usr/bin/env node
/**
 * Robust slang collector pipeline.
 *
 * Usage:
 *   node scripts/slang-scraper.mjs --output data/slang-candidates.json --limit 12000
 *
 * Notes:
 * - This script collects raw candidates only.
 * - Human moderation is still required before promotion to production dictionary.
 */

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_LIMIT = 12_000;
const DEFAULT_UD_PAGES = 120;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_TIMEOUT_MS = 12_000;

const SOURCE_RELIABILITY = {
  "urbandictionary-random": 0.45,
  "urbandictionary-defined": 0.56,
  "datamuse-pt-seed": 0.6,
  "wiktionary-pt-seed": 0.75,
  "fallback-local": 0.4,
};


const FALLBACK_GIRIAS = [
  ["bora", "vamos"],
  ["suave", "tranquilo"],
  ["brabo", "muito bom"],
  ["papo reto", "verdade sem enrolação"],
  ["deu ruim", "não deu certo"],
  ["partiu", "vamos agora"],
  ["resenha", "conversa divertida"],
  ["tá osso", "situação difícil"],
  ["desenrolar", "resolver com conversa"],
  ["tô liso", "sem dinheiro"],
];

const BLOCKED_PATTERNS = [
  /^[a-z]$/i,
  /^https?:\/\//i,
  /\b(?:sexo explicito|porn|xvideos|xnxx)\b/i,
  /\b(?:nazi|hitler)\b/i,
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    output: "data/slang-candidates.json",
    limit: DEFAULT_LIMIT,
    udPages: DEFAULT_UD_PAGES,
    concurrency: DEFAULT_CONCURRENCY,
    minScore: 0.5,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--output") out.output = args[++i];
    else if (args[i] === "--limit") out.limit = Number(args[++i] ?? DEFAULT_LIMIT);
    else if (args[i] === "--ud-pages") out.udPages = Number(args[++i] ?? DEFAULT_UD_PAGES);
    else if (args[i] === "--concurrency") out.concurrency = Number(args[++i] ?? DEFAULT_CONCURRENCY);
    else if (args[i] === "--min-score") out.minScore = Number(args[++i] ?? 0.5);
    else if (args[i] === "--timeout-ms") out.timeoutMs = Number(args[++i] ?? DEFAULT_TIMEOUT_MS);
  }

  out.limit = Number.isFinite(out.limit) ? Math.max(100, Math.floor(out.limit)) : DEFAULT_LIMIT;
  out.udPages = Number.isFinite(out.udPages) ? Math.max(1, Math.floor(out.udPages)) : DEFAULT_UD_PAGES;
  out.concurrency = Number.isFinite(out.concurrency)
    ? Math.min(20, Math.max(1, Math.floor(out.concurrency)))
    : DEFAULT_CONCURRENCY;
  out.minScore = Number.isFinite(out.minScore) ? Math.min(0.99, Math.max(0.1, out.minScore)) : 0.5;
  out.timeoutMs = Number.isFinite(out.timeoutMs) ? Math.min(60_000, Math.max(3_000, Math.floor(out.timeoutMs))) : DEFAULT_TIMEOUT_MS;

  return out;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  let lastError = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, {
        headers: {
          "user-agent": "giria-ai-scraper/2.0 (+https://example.local)",
          accept: "application/json,text/plain,*/*",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      await sleep(250 * 2 ** attempt);
    }
  }
  throw lastError ?? new Error(`fetch failed for ${url}`);
}

async function runPool(items, worker, concurrency) {
  const queue = [...items];
  const outputs = [];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const next = queue.shift();
      if (next === undefined) break;
      try {
        const value = await worker(next);
        if (Array.isArray(value)) outputs.push(...value);
      } catch (error) {
        // keep pool resilient and continue processing remaining jobs
      }
    }
  });
  await Promise.all(workers);
  return outputs;
}

function mapUrbanList(list, source) {
  return list.map((row) => ({
    term: String(row.word ?? "").trim(),
    meaning: String(row.definition ?? "").trim().slice(0, 500),
    source,
    region: "internet/global",
    category: "internet",
  }));
}

async function scrapeUrbanDictionaryRandom(pages, concurrency, timeoutMs) {
  const indexes = Array.from({ length: pages }, (_, i) => i + 1);
  return runPool(
    indexes,
    async () => {
      const json = await fetchJson("https://api.urbandictionary.com/v0/random", timeoutMs);
      const list = Array.isArray(json?.list) ? json.list : [];
      return mapUrbanList(list, "urbandictionary-random");
    },
    concurrency
  );
}

async function scrapeUrbanDictionaryDefined(seedTerms, concurrency, timeoutMs) {
  return runPool(
    seedTerms,
    async (seed) => {
      const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(seed)}`;
      const json = await fetchJson(url, timeoutMs);
      const list = Array.isArray(json?.list) ? json.list : [];
      return mapUrbanList(list, "urbandictionary-defined").map((row) => ({
        ...row,
        category: "meme",
      }));
    },
    concurrency
  );
}

async function scrapePtBrOpenGlossary(timeoutMs) {
  const seeds = ["gíria", "meme", "tiktok", "funk", "regional", "streamer", "internet", "favela"];
  const rows = [];
  for (const seed of seeds) {
    const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(seed)}&max=1000&v=pt`;
    const json = await fetchJson(url, timeoutMs);
    for (const item of json) {
      rows.push({
        term: String(item.word ?? "").trim(),
        meaning: `Termo relacionado a ${seed}.`,
        source: "datamuse-pt-seed",
        region: "Brasil",
        category: seed === "regional" || seed === "favela" ? "regional" : "meme",
      });
    }
  }
  return rows;
}

async function scrapeWiktionaryPtSeed(timeoutMs) {
  const seeds = ["gíria", "regionalismo", "internet", "Brasil", "juventude"];
  const rows = [];
  for (const seed of seeds) {
    const url = `https://pt.wiktionary.org/w/api.php?action=opensearch&search=${encodeURIComponent(seed)}&limit=500&namespace=0&format=json&origin=*`;
    const json = await fetchJson(url, timeoutMs);
    const titles = Array.isArray(json?.[1]) ? json[1] : [];
    for (const title of titles) {
      rows.push({
        term: String(title ?? "").trim(),
        meaning: `Entrada relacionada a ${seed} (Wiktionary PT).`,
        source: "wiktionary-pt-seed",
        region: "Brasil",
        category: seed === "regionalismo" ? "regional" : "outros",
      });
    }
  }
  return rows;
}

function sanitizeCandidates(rows, minScore = 0.5) {
  const map = new Map();
  for (const row of rows) {
    const term = String(row.term ?? "").trim();
    const key = normalize(term);
    if (!key || key.length < 2 || key.length > 60) continue;
    if (/^\d+$/.test(key)) continue;
    if (BLOCKED_PATTERNS.some((pattern) => pattern.test(key))) continue;

    if (!map.has(key)) {
      const reliability = SOURCE_RELIABILITY[row.source] ?? 0.3;
      const meaningSize = String(row.meaning ?? "").trim().length;
      const qualityScore = Number(
        Math.max(0.1, Math.min(0.99, reliability + (meaningSize >= 18 ? 0.15 : 0.05))).toFixed(2)
      );
      const moderationPriority = qualityScore >= 0.72 ? "high" : qualityScore >= 0.55 ? "medium" : "low";
      map.set(key, {
        term,
        meaning: String(row.meaning ?? "Sem definição").slice(0, 500),
        source: row.source ?? "unknown",
        region: row.region ?? "Brasil",
        category: row.category ?? "outros",
        sourceReliability: reliability,
        qualityScore,
        moderationPriority,
      });
    }
  }
  return [...map.values()]
    .filter((row) => row.qualityScore >= minScore)
    .sort((a, b) => b.qualityScore - a.qualityScore || a.term.localeCompare(b.term, "pt-BR"));
}

async function main() {
  const { output, limit, udPages, concurrency, minScore, timeoutMs } = parseArgs();
  const udSeedTerms = [
    "giria",
    "meme",
    "tiktok",
    "favela",
    "funk",
    "quebrada",
    "viral",
    "streamer",
    "internet",
    "brasil",
  ];

  const collectors = [
    () => scrapeUrbanDictionaryRandom(udPages, concurrency, timeoutMs),
    () => scrapeUrbanDictionaryDefined(udSeedTerms, concurrency, timeoutMs),
    () => scrapePtBrOpenGlossary(timeoutMs),
    () => scrapeWiktionaryPtSeed(timeoutMs),
  ];

  const chunks = await Promise.allSettled(collectors.map((fn) => fn()));
  const all = [];
  const collectorStatus = [];

  for (const item of chunks) {
    if (item.status === "fulfilled") {
      all.push(...item.value);
      collectorStatus.push({ status: "ok", count: item.value.length });
    } else {
      collectorStatus.push({ status: "failed", reason: item.reason?.message ?? String(item.reason) });
      console.warn("[scraper] collector failed:", item.reason?.message ?? item.reason);
    }
  }

  const withFallback = all.length > 0
    ? all
    : FALLBACK_GIRIAS.map(([term, meaning]) => ({
        term,
        meaning,
        source: "fallback-local",
        region: "Brasil",
        category: "outros",
      }));

  const sanitized = sanitizeCandidates(withFallback, minScore).slice(0, limit);
  const payload = {
    generatedAt: new Date().toISOString(),
    requestedLimit: limit,
    minScore,
    timeoutMs,
    count: sanitized.length,
    collectorStatus,
    queueSummary: {
      high: sanitized.filter((r) => r.moderationPriority === "high").length,
      medium: sanitized.filter((r) => r.moderationPriority === "medium").length,
      low: sanitized.filter((r) => r.moderationPriority === "low").length,
    },
    records: sanitized,
  };

  const abs = path.resolve(output);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, JSON.stringify(payload, null, 2), "utf-8");

  const triageDir = path.resolve("data/triage");
  await fs.mkdir(triageDir, { recursive: true });
  await fs.writeFile(
    path.join(triageDir, "high.json"),
    JSON.stringify(sanitized.filter((r) => r.moderationPriority === "high"), null, 2),
    "utf-8"
  );
  await fs.writeFile(
    path.join(triageDir, "medium.json"),
    JSON.stringify(sanitized.filter((r) => r.moderationPriority === "medium"), null, 2),
    "utf-8"
  );
  await fs.writeFile(
    path.join(triageDir, "low.json"),
    JSON.stringify(sanitized.filter((r) => r.moderationPriority === "low"), null, 2),
    "utf-8"
  );

  console.log(`[scraper] wrote ${sanitized.length} candidates to ${abs}`);
}

main().catch((err) => {
  console.error("[scraper] fatal:", err);
  process.exit(1);
});
