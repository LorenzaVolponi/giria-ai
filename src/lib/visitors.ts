import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { getClientIp } from "@/lib/security";

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

const visitorStore: VisitorEvent[] = [];
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

export function registerVisit(event: VisitorEvent) {
  visitorStore.unshift(event);
  if (visitorStore.length > MAX_EVENTS) visitorStore.length = MAX_EVENTS;
}

export function getVisitorStats() {
  const uniqueIps = new Set(visitorStore.map((v) => v.ip));
  const byCountry = visitorStore.reduce<Record<string, number>>((acc, v) => {
    acc[v.country] = (acc[v.country] || 0) + 1;
    return acc;
  }, {});
  const byRegion = visitorStore.reduce<Record<string, number>>((acc, v) => {
    const key = `${v.country}-${v.region}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    totalVisits: visitorStore.length,
    uniqueVisitors: uniqueIps.size,
    byCountry,
    byRegion,
    recent: visitorStore.slice(0, 20),
  };
}
