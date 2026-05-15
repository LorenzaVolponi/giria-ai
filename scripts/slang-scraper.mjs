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
const SOURCE_RELIABILITY = {
  "urbandictionary-random": 0.45,
  "datamuse-pt-seed": 0.6,
  "wiktionary-pt-seed": 0.75,
};

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
  const out = { output: "data/slang-candidates.json", limit: DEFAULT_LIMIT };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--output") out.output = args[++i];
    else if (args[i] === "--limit") out.limit = Number(args[++i] ?? DEFAULT_LIMIT);
  }
  return out;
}

async function fetchJson(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": "giria-ai-scraper/1.0 (+https://example.local)",
          accept: "application/json,text/plain,*/*",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.json();
    } catch (error) {
      lastError = error;
      await new Promise((r) => setTimeout(r, attempt * 400));
    }
  }
  throw lastError ?? new Error(`fetch failed for ${url}`);
}

async function scrapeUrbanDictionaryPtLike() {
  // Public endpoint compatible with dictionary-like payloads.
  const url = "https://api.urbandictionary.com/v0/random";
  const chunks = [];
  for (let i = 0; i < 20; i++) {
    const json = await fetchJson(url);
    const list = Array.isArray(json?.list) ? json.list : [];
    chunks.push(...list.map((row) => ({
      term: String(row.word ?? "").trim(),
      meaning: String(row.definition ?? "").trim().slice(0, 500),
      source: "urbandictionary-random",
      region: "internet/global",
      category: "internet",
    })));
  }
  return chunks;
}

async function scrapePtBrOpenGlossary() {
  const seeds = ["gíria", "meme", "tiktok", "funk", "regional"];
  const rows = [];
  for (const seed of seeds) {
    const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(seed)}&max=1000&v=pt`;
    const json = await fetchJson(url);
    for (const item of json) {
      rows.push({
        term: String(item.word ?? "").trim(),
        meaning: `Termo relacionado a ${seed}.`,
        source: "datamuse-pt-seed",
        region: "Brasil",
        category: seed === "regional" ? "regional" : "meme",
      });
    }
  }
  return rows;
}

async function scrapeWiktionaryPtSeed() {
  const seeds = ["gíria", "regionalismo", "internet"];
  const rows = [];
  for (const seed of seeds) {
    const url = `https://pt.wiktionary.org/w/api.php?action=opensearch&search=${encodeURIComponent(seed)}&limit=200&namespace=0&format=json&origin=*`;
    const json = await fetchJson(url);
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

function sanitizeCandidates(rows) {
  const map = new Map();
  for (const row of rows) {
    const term = String(row.term ?? "").trim();
    const key = normalize(term);
    if (!key || key.length < 2 || key.length > 60) continue;
    if (/^\d+$/.test(key)) continue;
    if (!map.has(key)) {
      const reliability = SOURCE_RELIABILITY[row.source] ?? 0.3;
      const meaningSize = String(row.meaning ?? "").trim().length;
      const qualityScore = Number(
        Math.max(
          0.1,
          Math.min(0.99, reliability + (meaningSize >= 18 ? 0.15 : 0.05))
        ).toFixed(2)
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
  return [...map.values()];
}

async function main() {
  const { output, limit } = parseArgs();
  const collectors = [scrapeUrbanDictionaryPtLike, scrapePtBrOpenGlossary, scrapeWiktionaryPtSeed];
  const chunks = await Promise.allSettled(collectors.map((fn) => fn()));
  const all = [];
  for (const item of chunks) {
    if (item.status === "fulfilled") all.push(...item.value);
    else console.warn("[scraper] collector failed:", item.reason?.message ?? item.reason);
  }
  const sanitized = sanitizeCandidates(all).slice(0, limit);
  const payload = {
    generatedAt: new Date().toISOString(),
    count: sanitized.length,
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
  await fs.writeFile(path.join(triageDir, "high.json"), JSON.stringify(sanitized.filter((r) => r.moderationPriority === "high"), null, 2), "utf-8");
  await fs.writeFile(path.join(triageDir, "medium.json"), JSON.stringify(sanitized.filter((r) => r.moderationPriority === "medium"), null, 2), "utf-8");
  await fs.writeFile(path.join(triageDir, "low.json"), JSON.stringify(sanitized.filter((r) => r.moderationPriority === "low"), null, 2), "utf-8");
  console.log(`[scraper] wrote ${sanitized.length} candidates to ${abs}`);
}

main().catch((err) => {
  console.error("[scraper] fatal:", err);
  process.exit(1);
});
