"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Metrics = { totalRequests: number; totalErrors: number; errorRate: number };

export function OperationalMetricsCard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/v1/metrics")
      .then((r) => r.json())
      .then((d: Metrics) => setMetrics(d))
      .catch(() => null);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas operacionais API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {!metrics ? (
          <p className="text-muted-foreground">Carregando métricas...</p>
        ) : (
          <>
            <p><strong>Requisições:</strong> {metrics.totalRequests}</p>
            <p><strong>Erros (5xx):</strong> {metrics.totalErrors}</p>
            <p><strong>Taxa de erro:</strong> {metrics.errorRate}%</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
