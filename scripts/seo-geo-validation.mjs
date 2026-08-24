const base = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const checks = [
  { path: "/", type: "text", contains: ["Gíria AI"] },
  { path: "/sitemap.xml", type: "text", contains: ["<urlset", "/o-que-significa"] },
  { path: "/llms.txt", type: "text", contains: ["Gíria AI", "/knowledge.json", "/api/graph", "/answers.json", "/answer/{termo}", "/authority.json", "/provenance/{termo}", "/provenance.json"] },
  { path: "/ai-index.json", type: "json", validate: (body) => body?.preferredSurfaces?.directAnswer && body?.preferredSurfaces?.bulkAnswers && body?.preferredSurfaces?.topicalAuthority && body?.preferredSurfaces?.provenanceRecord && body?.preferredSurfaces?.bulkProvenance && body?.retrievalPolicy?.provenanceCheck },
  { path: "/provenance.json", type: "json", validate: (body) => body?.["@type"] === "DataFeed" && Array.isArray(body.dataFeedElement) && body.dataFeedElement.length > 0 && body.dataFeedElement.every((item) => item.canonical && item.provenance && item.sourceDiversity && item.freshness) },
  { path: "/authority.json", type: "json", validate: (body) => body?.["@type"] === "Dataset" && body.authorityClusters > 0 && Array.isArray(body.strongestClusters) && Array.isArray(body.editorialOpportunities) },
  { path: "/answers.json", type: "json", validate: (body) => Array.isArray(body.dataFeedElement) && body.dataFeedElement.length > 0 && body.dataFeedElement.every((item) => item?.["@type"] === "Question" && item.acceptedAnswer?.text && item.authority?.canonicalUrl && item.responsePolicy) },
  { path: "/knowledge.json", type: "json", validate: (body) => Array.isArray(body.terms) && body.terms.every((item) => item.term && item.canonical && item.graph) },
  { path: "/distribution.json", type: "json", validate: (body) => Array.isArray(body.items) && body.items.every((item) => item.canonical && item.attribution === "Gíria AI") },
  { path: "/api/graph", type: "json", validate: (body) => Array.isArray(body.nodes) && body.nodes.every((node) => node.id && node.term) },
];

let failed = 0;
for (const check of checks) {
  try {
    const response = await fetch(`${base}${check.path}`, { redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (check.type === "json") {
      const body = await response.json();
      if (!check.validate(body)) throw new Error("payload contract failed");
    } else {
      const body = await response.text();
      for (const expected of check.contains || []) if (!body.includes(expected)) throw new Error(`missing ${expected}`);
    }
    console.log(`PASS ${check.path}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${check.path}: ${error.message}`);
  }
}

if (failed) {
  console.error(`SEO/GEO validation failed: ${failed} check(s)`);
  process.exit(1);
}
console.log("SEO/GEO operational surface validated.");
