import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { getClientIp } from "@/lib/security";
import { db } from "@/lib/db";

export type VisitorEvent = {
  id: string;
  ip: string;
  region: string;
  country: string;
  city: string;
  userAgent: string;
  path: string;
  referer: string;
  at: string;
};

const memoryVisitorStore: VisitorEvent[] = [];
const MAX_EVENTS = 5000;

function header(req: NextRequest, name: string, fallback = "unknown") {
  return req.headers.get(name) ?? fallback;
}

export function buildVisitorEvent(req: NextRequest, path = "/"): VisitorEvent {
  const now = new Date().toISOString();
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    ip: createHash("sha256").update(getClientIp(req)).digest("hex"),
    region: header(req, "x-vercel-ip-country-region"),
    country: header(req, "x-vercel-ip-country"),
    city: header(req, "x-vercel-ip-city"),
    userAgent: header(req, "user-agent"),
    path,
    referer: header(req, "referer", "direct"),
    at: now,
  };
}

export async function registerVisit(event: VisitorEvent) {
  memoryVisitorStore.unshift(event);
  if (memoryVisitorStore.length > MAX_EVENTS) memoryVisitorStore.length = MAX_EVENTS;

  try {
    await db.visitorEvent.create({
      data: {
        ipHash: event.ip,
        country: event.country,
        region: event.region,
        city: event.city,
        path: event.path,
        referer: event.referer,
        userAgent: event.userAgent,
      },
    });
  } catch {
    // keep in-memory fallback when DB unavailable
  }
}

export async function getVisitorStats() {
  try {
    const [totalVisits, unique] = await Promise.all([
      db.visitorEvent.count(),
      db.visitorEvent.findMany({ distinct: ["ipHash"], select: { ipHash: true } }),
    ]);

    const countryRows = await db.visitorEvent.groupBy({ by: ["country"], _count: { country: true } });
    const regionRows = await db.visitorEvent.groupBy({ by: ["country", "region"], _count: { region: true } });
    const recentRows = await db.visitorEvent.findMany({ orderBy: { createdAt: "desc" }, take: 20 });

    return {
      totalVisits,
      uniqueVisitors: unique.length,
      byCountry: Object.fromEntries(countryRows.map((r) => [r.country, r._count.country])),
      byRegion: Object.fromEntries(regionRows.map((r) => [`${r.country}-${r.region}`, r._count.region])),
      recent: recentRows,
      source: "database",
    };
  } catch {
    const uniqueIps = new Set(memoryVisitorStore.map((v) => v.ip));
    const byCountry = memoryVisitorStore.reduce<Record<string, number>>((acc, v) => {
      acc[v.country] = (acc[v.country] || 0) + 1;
      return acc;
    }, {});
    const byRegion = memoryVisitorStore.reduce<Record<string, number>>((acc, v) => {
      const key = `${v.country}-${v.region}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      totalVisits: memoryVisitorStore.length,
      uniqueVisitors: uniqueIps.size,
      byCountry,
      byRegion,
      recent: memoryVisitorStore.slice(0, 20),
      source: "memory",
    };
  }
}
