# Gíria AI

Aplicação web para traduzir gírias e expressões adolescentes para linguagem formal, clara e contextualizada.

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind + shadcn/ui

## Rodando localmente
```bash
npm install
npm run dev
```

Build de produção:
```bash
npm run build
npm run start
```

## Variáveis de ambiente
Use `.env.example` como base:
- `ALLOWED_ORIGIN`: origem permitida para CORS no endpoint versionado
- `TRANSLATION_PROVIDER`: reservado para integração futura com IA externa
- `OPENAI_API_KEY`: reservado para integração futura

## Endpoints de API
- `GET /api/v1/health` → status do serviço
- `POST /api/v1/translate` → traduz texto/gíria
- `POST /api/v1/visits` → registra visita (IP/país/região/cidade via headers Vercel)
- `GET /api/v1/visits` → estatísticas agregadas de visitas
- `POST /api/translate` → compatibilidade com frontend atual
- `POST /api/chat` → assistente de gírias

Exemplo payload `POST /api/v1/translate`:
```json
{ "text": "slay" }
```

Resposta:
```json
{
  "input": "slay",
  "normalized": "slay",
  "traducaoFormal": "...",
  "explicacaoContextual": "...",
  "intencaoSocialEmocional": "...",
  "nivelInformalidade": "media",
  "source": "local"
}
```

## Scripts úteis
- `bash scripts/dev.sh`
- `bash scripts/build.sh`
- `bash scripts/security-check.sh`
- `bash scripts/auto-update.sh`
- `bash scripts/bootstrap-audit.sh`
- `bash scripts/release-guard.sh`
- `bash scripts/rollback.sh`
- `bash scripts/api-contract-check.sh [base_url]`
- `bash scripts/auto-pr.sh "mensagem"`
- `bash scripts/full-auto-maintenance.sh`

## Segurança aplicada
- Sanitização e validação de input em API
- Limite de tamanho de payload
- Rate limit por IP
- CORS controlado por variável de ambiente
- Security headers globais
- Checagem simples de secrets no repositório

## GitHub Actions
- `ci.yml`: install, lint, build e testes (se existirem)
- `security.yml`: npm audit + `security-check.sh`

## Deploy na Vercel
1. Conecte o repositório na Vercel
2. Configure variáveis de ambiente
3. Build command: `npm run build`
4. Output: padrão Next.js


## Enxame de agentes (manutenção incremental)
- `bash scripts/agents/run-agent.sh security`
- `bash scripts/agents/run-agent.sh quality`
- `bash scripts/agents/run-agent.sh deps`
- `bash scripts/agents/run-agent.sh autofix`
- `bash scripts/agents/orchestrator.sh`

Os relatórios ficam em `.agent/reports/*.json` e podem ser anexados em PRs/rotinas de manutenção.


## Pós-deploy e rollback
- Workflow manual `Post Deploy Smoke` para validar `/api/v1/health` e `/api/v1/translate`.
- Script `scripts/rollback.sh` para retorno controlado a commit estável (com confirmação explícita).


## Observabilidade
- API v1 retorna `x-request-id` e gera logs JSON por request para auditoria.
- Use `scripts/api-contract-check.sh` para validar contrato dos endpoints versionados.


## Auto commit / Auto PR / Auto merge
- `scripts/auto-pr.sh` cria commit, push e tenta abrir PR com label `automerge`.
- Workflow `automerge.yml` habilita merge automático para PRs com label `automerge` (squash).
- `AUTO_COMMIT=true bash scripts/agents/orchestrator.sh` permite commit automático dos ajustes gerados pelos agentes.


## Telemetria de visitantes (Vercel)
- Coleta baseada em headers `x-vercel-ip-*` e `x-forwarded-for`.
- Dados capturados: IP (mascarável futuramente), país, região, cidade, rota e user-agent.
- Endpoint de leitura atual é in-memory (ideal para MVP); para produção escalável, migrar para banco/KV.


## Observabilidade Vercel
- `@vercel/analytics` ativado no layout global.
- `@vercel/speed-insights` ativado para métricas de performance do frontend.


## Automação total (merge automático)
- Script local: `scripts/full-auto-maintenance.sh` (lint, build, security-check, agentes, commit, push, PR e auto-merge).
- Workflow: `auto-fix-and-merge.yml` executa correções automáticas programadas e abre PR com label `automerge`.


## Persistência de visitantes
- `VisitorEvent` persistido em banco via Prisma (com fallback em memória quando DB indisponível).
- Endpoint `/api/v1/visits` informa fonte de dados (`database` ou `memory`).


## CI de contrato
- O workflow `ci.yml` agora sobe a aplicação localmente e executa `scripts/api-contract-check.sh` para validar o contrato dos endpoints `/api/v1/*` em todo PR/push.


## Hardening aplicado (etapa 3)
- CSP e HSTS adicionados no proxy global.
- Endpoints `/api/v1/translate` e `/api/v1/visits` com validação de payload por schema (`zod`).
