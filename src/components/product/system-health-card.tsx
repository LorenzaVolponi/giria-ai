"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HealthCheck = { status: "ok" | "warn"; message: string };
type HealthResponse = {
  status: string;
  service: string;
  timestamp: string;
  uptimeSeconds?: number;
  runtime?: string;
  commit?: string | null;
  checks?: Record<string, HealthCheck>;
};
type VisitStats = { totalVisits: number; uniqueVisitors: number; byCountry: Record<string, number> };

export function SystemHealthCard() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [data, setData] = useState<HealthResponse | null>(null);
  const [visits, setVisits] = useState<VisitStats | null>(null);

  useEffect(() => {
    fetch("/api/v1/health")
      .then((r) => r.json())
      .then((d: HealthResponse) => {
        setData(d);
        setStatus(d.status === "ok" ? "ok" : "error");
      })
      .catch(() => setStatus("error"));

    fetch("/api/v1/visits")
      .then((r) => r.json())
      .then((v: VisitStats) => setVisits(v))
      .catch(() => null);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong>Estado:</strong> {status === "loading" ? "Carregando..." : status === "ok" ? "Operacional" : "Instável"}</p>
        {data && (
          <>
            <p><strong>Serviço:</strong> {data.service}</p>
            <p><strong>Último ping:</strong> {new Date(data.timestamp).toLocaleString("pt-BR")}</p>
            {typeof data.uptimeSeconds === "number" && <p><strong>Uptime:</strong> {Math.floor(data.uptimeSeconds / 60)} min</p>}
            {data.runtime && <p><strong>Runtime:</strong> {data.runtime}</p>}
            {data.commit && <p><strong>Commit:</strong> {data.commit}</p>}
            {data.checks && (
              <div className="space-y-1 rounded-md border bg-muted/30 p-3">
                <p className="font-medium">Checks operacionais</p>
                {Object.entries(data.checks).map(([name, check]) => (
                  <p key={name} className={check.status === "ok" ? "text-emerald-700" : "text-amber-700"}>
                    <strong>{name}:</strong> {check.message}
                  </p>
                ))}
              </div>
            )}
            {visits && (
              <>
                <p><strong>Visitas totais:</strong> {visits.totalVisits}</p>
                <p><strong>Visitantes únicos:</strong> {visits.uniqueVisitors}</p>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
