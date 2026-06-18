export type HealthCheckStatus = "ok" | "warn";

export type HealthCheck = {
  status: HealthCheckStatus;
  message: string;
};

export type HealthPayload = {
  status: "ok";
  service: "giria-ai";
  timestamp: string;
  uptimeSeconds: number;
  runtime: string;
  commit: string | null;
  checks: {
    adminToken: HealthCheck;
    redis: HealthCheck;
    database: HealthCheck;
  };
};

function booleanEnv(name: string) {
  return Boolean(process.env[name]);
}

export function buildHealthPayload(now = new Date()): HealthPayload {
  const adminTokenConfigured = booleanEnv("ADMIN_API_TOKEN");
  const redisConfigured = booleanEnv("UPSTASH_REDIS_REST_URL") && booleanEnv("UPSTASH_REDIS_REST_TOKEN");
  const databaseConfigured = booleanEnv("DATABASE_URL");

  return {
    status: "ok",
    service: "giria-ai",
    timestamp: now.toISOString(),
    uptimeSeconds: Math.max(0, Math.floor(process.uptime())),
    runtime: `node-${process.version}`,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || null,
    checks: {
      adminToken: adminTokenConfigured
        ? { status: "ok", message: "Admin API protegida por token." }
        : { status: "warn", message: "ADMIN_API_TOKEN ausente; endpoints admin ficam em modo aberto fora de produção." },
      redis: redisConfigured
        ? { status: "ok", message: "Redis externo configurado para rate limit distribuído." }
        : { status: "warn", message: "Redis externo ausente; rate limit usa armazenamento em memória." },
      database: databaseConfigured
        ? { status: "ok", message: "DATABASE_URL configurada." }
        : { status: "warn", message: "DATABASE_URL ausente; recursos persistentes podem ficar limitados." },
    },
  };
}
