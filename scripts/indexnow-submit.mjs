import { execFileSync } from "node:child_process";

const DEFAULT_SITE_URL = "https://giria-ai.vercel.app";
const DEFAULT_INDEXNOW_KEY = "7d9e3b6a2f414c88a5d791e6b4c2f3a8";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const siteUrl = new URL(process.env.SITE_URL || process.env.PRODUCTION_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL);
siteUrl.pathname = "/"; siteUrl.search = ""; siteUrl.hash = "";
const origin = siteUrl.origin;
const key = process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
const keyLocation = `${origin}/${key}.txt`;

function readChangedFiles() {
  if (process.env.INDEXNOW_ALL_CORE === "1") return ["__all_core__"];
  const after = process.env.GITHUB_SHA || "HEAD";
  let before = process.env.BEFORE_SHA || "";
  if (!before || /^0+$/.test(before)) before = `${after}^`;
  try { return execFileSync("git", ["diff", "--name-only", before, after], { encoding: "utf8" }).split("\n").map((line) => line.trim()).filter(Boolean); }
  catch (error) { console.warn(`[indexnow] Não foi possível calcular o diff (${error instanceof Error ? error.message : String(error)}). Enviando somente páginas centrais.`); return ["__all_core__"]; }
}

const changedFiles = readChangedFiles();
const routes = new Set();
const add = (...paths) => paths.forEach((path) => routes.add(path));
const matches = (predicate) => changedFiles.some(predicate);
const allCore = matches((file) => file === "__all_core__" || file === `public/${key}.txt`);

if (allCore) add(
  "/", "/.well-known/giria-ai.json", "/o-que-significa", "/girias", "/girias/regionais", "/guias", "/observatorio", "/imprensa", "/sobre",
  "/editorial-index.json", "/ai-index.json", "/authority.json", "/answers.json", "/knowledge.json", "/distribution.json", "/provenance.json",
  "/data/methodology.json", "/api/graph", "/llms.txt",
);

if (matches((file) => file.startsWith("src/app/.well-known/giria-ai.json/"))) add("/.well-known/giria-ai.json", "/ai-index.json", "/llms.txt");
if (matches((file) => file.startsWith("src/app/bundle/"))) add("/.well-known/giria-ai.json", "/ai-index.json", "/llms.txt");
if (matches((file) => file === "src/app/page.tsx" || file.startsWith("src/components/home/") || file === "src/app/layout.tsx")) add("/");
if (matches((file) => file.startsWith("src/app/o-que-significa/"))) add("/o-que-significa", "/answers.json", "/knowledge.json", "/ai-index.json", "/provenance.json");
if (matches((file) => file.startsWith("src/app/answer/") || file === "src/lib/geo-answer-surface.ts")) add("/answers.json", "/ai-index.json", "/llms.txt");
if (matches((file) => file.startsWith("src/app/answers.json/"))) add("/answers.json", "/ai-index.json", "/llms.txt");
if (matches((file) => file.startsWith("src/app/authority.json/") || file === "src/lib/topical-authority.ts")) add("/authority.json", "/ai-index.json", "/llms.txt");
if (matches((file) => file.startsWith("src/app/citation/") || file.startsWith("src/app/provenance/") || file.startsWith("src/app/provenance.json/") || file === "src/lib/provenance.ts")) add("/provenance.json", "/knowledge.json", "/answers.json", "/ai-index.json", "/llms.txt");
if (matches((file) => file.startsWith("src/app/api/graph/") || file === "src/lib/language-graph.ts")) add("/api/graph", "/ai-index.json");
if (matches((file) => file.startsWith("src/app/ai-index.json/"))) add("/ai-index.json", "/.well-known/giria-ai.json");
if (matches((file) => file.startsWith("src/app/knowledge.json/"))) add("/knowledge.json");
if (matches((file) => file.startsWith("src/app/distribution.json/"))) add("/distribution.json");
if (matches((file) => file.startsWith("src/app/data/methodology.json/"))) add("/data/methodology.json");
if (matches((file) => file.startsWith("src/app/llms.txt/") || file === "public/llms.txt")) add("/llms.txt", "/.well-known/giria-ai.json", "/ai-index.json", "/answers.json", "/authority.json", "/provenance.json");
if (matches((file) => file.startsWith("src/app/editorial-index.json/") || file === "src/app/seo-index.json/route.ts")) add("/editorial-index.json");

if (matches((file) => file === "src/lib/editorial-evidence.ts")) {
  add("/editorial-index.json", "/authority.json", "/answers.json", "/knowledge.json", "/distribution.json", "/ai-index.json", "/provenance.json", "/o-que-significa");
  for (const term of ["farmar aura", "six seven", "delulu", "brainrot"]) {
    const encoded = encodeURIComponent(term);
    add(`/o-que-significa/${encoded}`, `/answer/${encoded}`, `/citation/${encoded}`, `/provenance/${encoded}`, `/bundle/${encoded}`);
  }
}

if (matches((file) => file.startsWith("src/app/girias/"))) { add("/girias"); if (matches((file) => file.startsWith("src/app/girias/regionais"))) add("/girias/regionais"); }
if (matches((file) => file.startsWith("src/app/guias/") || file === "src/lib/seo-keyword-layer.ts")) add("/guias");
if (matches((file) => file.startsWith("src/app/observatorio/"))) add("/observatorio");
if (matches((file) => file.startsWith("src/app/imprensa/"))) add("/imprensa");
if (matches((file) => file.startsWith("src/app/sobre/"))) add("/sobre");
if (matches((file) => /^src\/lib\/slang-(data|extra|regional|real|generated)/.test(file))) add("/o-que-significa", "/girias", "/girias/regionais", "/observatorio", "/authority.json", "/answers.json", "/knowledge.json", "/distribution.json", "/provenance.json", "/api/graph", "/ai-index.json");

const urlList = [...routes].map((path) => new URL(path, origin).toString());
console.log(`[indexnow] Arquivos alterados: ${changedFiles.length}`);
console.log(`[indexnow] URLs relevantes: ${urlList.length}`);
urlList.forEach((url) => console.log(`  - ${url}`));
if (urlList.length === 0) { console.log("[indexnow] Nenhuma mudança editorial relevante; nenhum crawl desperdiçado."); process.exit(0); }
const payload = { host: siteUrl.host, key, keyLocation, urlList };
if (process.env.INDEXNOW_DRY_RUN === "1") { console.log("[indexnow] Dry run concluído."); process.exit(0); }
const response = await fetch(INDEXNOW_ENDPOINT, { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(payload) });
if (response.status === 200 || response.status === 202) { console.log(`[indexnow] Submission aceita (${response.status}).`); process.exit(0); }
const body = await response.text();
console.error(`[indexnow] Submission recusada (${response.status}): ${body.slice(0, 500)}`);
process.exit(1);
