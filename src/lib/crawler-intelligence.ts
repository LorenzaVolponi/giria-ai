type CrawlerName = "googlebot" | "bingbot" | "oai-searchbot" | "gptbot" | "claudebot" | "perplexitybot" | "other";

type CrawlerBucket = { hits: number; firstSeenAt: string; lastSeenAt: string; routes: Record<string, number> };
const crawlers = new Map<CrawlerName, CrawlerBucket>();

export function detectCrawler(userAgent: string | null): CrawlerName {
  const ua = (userAgent || "").toLowerCase();
  if (/oai-searchbot/.test(ua)) return "oai-searchbot";
  if (/gptbot/.test(ua)) return "gptbot";
  if (/claudebot|anthropic-ai/.test(ua)) return "claudebot";
  if (/perplexitybot/.test(ua)) return "perplexitybot";
  if (/googlebot/.test(ua)) return "googlebot";
  if (/bingbot/.test(ua)) return "bingbot";
  return "other";
}

export function recordCrawlerHit(userAgent: string | null, route: string) {
  const crawler = detectCrawler(userAgent);
  if (crawler === "other") return crawler;
  const now = new Date().toISOString();
  const current = crawlers.get(crawler) ?? { hits: 0, firstSeenAt: now, lastSeenAt: now, routes: {} };
  current.hits += 1;
  current.lastSeenAt = now;
  current.routes[route] = (current.routes[route] ?? 0) + 1;
  crawlers.set(crawler, current);
  console.log(JSON.stringify({ event: "organic_crawler_hit", crawler, route, timestamp: now }));
  return crawler;
}

export function getCrawlerSnapshot() {
  return [...crawlers.entries()]
    .map(([crawler, data]) => ({ crawler, ...data }))
    .sort((a, b) => b.hits - a.hits);
}
