"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type VisitsStats = {
  totalVisits: number;
  uniqueVisitors: number;
  byCountry: Record<string, number>;
  byRegion: Record<string, number>;
  source: "database" | "memory";
};

export function TrafficInsightsCard() {
  const [stats, setStats] = useState<VisitsStats | null>(null);

  useEffect(() => {
    fetch("/api/v1/visits")
      .then((r) => r.json())
      .then((data: VisitsStats) => setStats(data))
      .catch(() => null);
  }, []);

  const topRegions = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byRegion)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stats]);

  const topCountries = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [stats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights de tráfego</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {!stats ? (
          <p className="text-muted-foreground">Carregando dados de tráfego...</p>
        ) : (
          <>
            <p><strong>Fonte:</strong> {stats.source === "database" ? "Banco" : "Memória"}</p>
            <p><strong>Total:</strong> {stats.totalVisits} visitas / {stats.uniqueVisitors} únicos</p>

            <div>
              <p className="font-semibold mb-1">Top países</p>
              <ul className="space-y-1">
                {topCountries.map(([country, count]) => (
                  <li key={country} className="flex justify-between">
                    <span>{country}</span>
                    <span>{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1">Top regiões</p>
              <ul className="space-y-1">
                {topRegions.map(([region, count]) => (
                  <li key={region} className="flex justify-between">
                    <span>{region}</span>
                    <span>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
