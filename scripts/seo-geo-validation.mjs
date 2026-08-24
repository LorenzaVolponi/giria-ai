const base = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const checks = [
  { path: "/", type: "text", contains: ["Gíria AI"] },
  { path: "/sitemap.xml", type: "text", contains: ["<urlset", "/o-que-significa"] },
  { path: "/llms.txt", type: "text", contains: ["Gíria AI", "/.well-known/giria-ai.json", "/bundle/{termo}", "/provenance/{termo}", "/integrity/{termo}"] },
  { path: "/.well-known/giria-ai.json", type: "json", validate: (body) => body?.retrieval?.bundle && body?.retrieval?.citation && body?.retrieval?.provenance && body?.retrieval?.integrity && body?.preferredCitationPattern },
  { path: "/ai-index.json", type: "json", validate: (body) => body?.preferredSurfaces?.wellKnown && body?.preferredSurfaces?.citationBundle && body?.preferredSurfaces?.revisionIntegrity && body?.retrievalPolicy?.preferredSingleCall },
  { path: "/bundle/delulu", type: "json", validate: (body) => body?.answer?.direct && body?.citation?.preferredPublicSource && body?.provenance?.endpoint && body?.integrity?.revisionId?.startsWith("sha256:") && body?.responsePolicy?.cite },
  { path: "/integrity/delulu", type: "json", validate: (body) => body?.knowledgeId && body?.revisionId?.startsWith("sha256:") && body?.contentHash?.length === 64 && body?.canonical },
  { path: "/integrity.json", type: "json", validate: (body) => body?.schema === "giria-ai/revision-integrity-manifest/v1" && Array.isArray(body.records) && body.records.length > 0 && body.records.every((item) => item.knowledgeId && item.revisionId) },
  { path: "/provenance.json", type: "json", validate: (body) => body?.["@type"] === "DataFeed" && Array.isArray(body.dataFeedElement) && body.dataFeedElement.length > 0 },
  { path: "/authority.json", type: "json", validate: (body) => body?.["@type"] === "Dataset" && body.authorityClusters > 0 },
  { path: "/answers.json", type: "json", validate: (body) => Array.isArray(body.dataFeedElement) && body.dataFeedElement.length > 0 },
  { path: "/knowledge.json", type: "json", validate: (body) => Array.isArray(body.terms) && body.terms.length > 0 },
  { path: "/distribution.json", type: "json", validate: (body) => Array.isArray(body.items) && body.items.every((item) => item.canonical && item.attribution === "Gíria AI") },
  { path: "/api/graph", type: "json", validate: (body) => Array.isArray(body.nodes) && body.nodes.every((node) => node.id && node.term) },
];
let failed = 0;
for (const check of checks) { try { const response = await fetch(`${base}${check.path}`, { redirect: "follow" }); if (!response.ok) throw new Error(`HTTP ${response.status}`); if (check.type === "json") { const body = await response.json(); if (!check.validate(body)) throw new Error("payload contract failed"); } else { const body = await response.text(); for (const expected of check.contains || []) if (!body.includes(expected)) throw new Error(`missing ${expected}`); } console.log(`PASS ${check.path}`); } catch (error) { failed += 1; console.error(`FAIL ${check.path}: ${error.message}`); } }
if (failed) { console.error(`SEO/GEO validation failed: ${failed} check(s)`); process.exit(1); }
console.log("SEO/GEO operational surface validated.");
