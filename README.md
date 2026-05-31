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
Copie e ajuste as variáveis com `cp .env.example .env`.
- `ALLOWED_ORIGIN`: origem permitida para CORS no endpoint versionado
- `TRANSLATION_PROVIDER`: reservado para integração futura com IA externa
- `OPENAI_API_KEY`: reservado para integração futura
- `DATABASE_URL`: conexão do Prisma (SQLite/Postgres, conforme ambiente)
- `ADMIN_API_TOKEN`: token de moderação/admin (API e sessão admin)
- `ADMIN_LOGIN`, `ADMIN_PASSWORD`, `ADMIN_CODES`: credenciais do painel privado `/admin` (códigos separados por vírgula). Em produção, configure valores próprios; os padrões existem apenas para desenvolvimento/testes.
- `ADMIN_TOTP_SECRET`, `ADMIN_ROLE`: segredo TOTP opcional do painel admin e papel da sessão (`viewer`, `moderator` ou `owner`).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: envio de e-mail de lead
- `OLLAMA_URL`, `OLLAMA_MODEL`: opcional, avaliação local de gírias por LLM
- `PRODUCTION_BASE_URL` (GitHub Actions Variable): URL usada no smoke automático pós-push na `main`.

## Endpoints de API
- `GET /api/v1/health` → status do serviço
- `GET /api/health` → alias de compatibilidade para healthcheck
- `POST /api/v1/translate` → traduz texto/gíria
- `POST /api/v1/visits` → registra visita (IP/país/região/cidade via headers Vercel)
- `GET /api/v1/visits` → estatísticas agregadas de visitas
- `GET /api/v1/metrics` → métricas operacionais de API (requisições, erros e taxa)
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

### Contrato `POST /api/chat`
Entrada aceita:
- `message` (string) **ou** `messages/history` (array de mensagens com `role` e `content`)
- `responseMode` opcional: `default | single | list`

Modos de resposta:
- `responseMode: "default"` → `{ "mode": "default", "response": "...", ...slangData }`
- `responseMode: "single"` → `{ "mode": "single", "response": "..." }`
- `responseMode: "list"` → `{ "mode": "list", "responses": ["..."] }`
- Em todos os modos a API também retorna header `X-Response-Mode` com o modo efetivo resolvido.

Flags legadas (compatibilidade):
- `onlyChatResponse` e `listChatResponses` ainda funcionam, mas estão **deprecadas**.
- Ao usar flags legadas, a API retorna os headers:
  - `X-API-Warn: Legacy chat flags are deprecated. Use responseMode.`
  - `Deprecation: true`
  - `Sunset: Mon, 31 Aug 2026 23:59:59 GMT`
  - `Link: </#contrato-post-api-chat>; rel="deprecation"`

## Scripts úteis
- `bash scripts/dev.sh`
- `bash scripts/build.sh`
- `bash scripts/security-check.sh`
- `bash scripts/auto-update.sh`
- `bash scripts/bootstrap-audit.sh`
- `bash scripts/release-guard.sh`
- `bash scripts/no-break-update.sh`
- `STRICT_GIT_CLEAN=0 bash scripts/no-break-update.sh` (modo local: ignora alterações não commitadas)
- `bash scripts/full-quality-gate.sh`
- `bash scripts/vercel-safe-deploy.sh` (deploy em produção com validação de rotas públicas)
- `bash scripts/vercel-preflight.sh` (check de env obrigatória + test + build antes do deploy)
- `bash scripts/restore-stable-version.sh` (restaura o commit estável `2f428f9` com backup automático)
- `bash scripts/rollback.sh`
- `bash scripts/api-contract-check.sh [base_url]`
- `bash scripts/auto-pr.sh "mensagem"`
- `bash scripts/full-auto-maintenance.sh`
- `npm run ci:check` (testes críticos + build de produção em um único comando)

## Painel privado de validação (/admin)
- URL: `/admin`
- Fluxo: login + senha + código de validação, depois moderação com sessão por cookie HttpOnly.
- A página pública `/girias/enviadas-por-usuarios` permanece focada no envio/listagem de sugestões aprovadas.

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
- Script `bash scripts/post-deploy-smoke.sh <base_url>` para smoke pós-deploy (health/translate/suggestions/admin).
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


## Rate limit distribuído (etapa 4)
- `/api/v1/translate` usa Redis (Upstash REST) quando `UPSTASH_REDIS_REST_URL/TOKEN` estão definidos.
- Fallback automático para memória local quando Redis não está configurado.


## Diagnóstico operacional (etapa 5)
- Página `/diagnostico` agora inclui insights de tráfego com top países/regiões e fonte dos dados (banco/memória).


## Observabilidade operacional (etapa 6)
- Endpoint `/api/v1/metrics` para taxa de erro e volume de requisições.
- `/diagnostico` agora inclui card de métricas operacionais e série diária de visitas.


## Varredura completa de funcionamento
- Execute `bash scripts/system-sweep.sh` para validar dependências, lint, build, segurança, workflows e endpoints em uma única rotina com relatório em `reports/`.


## Sweep automatizada no GitHub
- Workflow `system-sweep.yml` roda diariamente e manualmente, executa `scripts/system-sweep.sh` e publica relatório como artifact.


## Resolução automática de conflito + deploy
- Script local: `bash scripts/resolve-merge-and-deploy.sh main`
- Com deploy: `DEPLOY=true VERCEL_TOKEN=... VERCEL_ORG_ID=... VERCEL_PROJECT_ID=... bash scripts/resolve-merge-and-deploy.sh main`
- Workflow manual: `merge-conflicts-and-deploy.yml` (resolve rebase + opcional deploy prod).


## Governança de dados
- `scripts/retention-cleanup.sh` remove telemetria antiga (default 90 dias).
- Workflow `retention-cleanup.yml` executa limpeza diária.

## Proteção de endpoints operacionais
- `/api/v1/metrics` e `GET /api/v1/visits` podem ser protegidos por `ADMIN_API_TOKEN` via header `x-admin-token`.


## Testes de integração API v1
- `tests/api-v1.test.ts` valida sucesso/erro de `/api/v1/translate` e `/api/v1/visits`, incluindo cenário de proteção com `ADMIN_API_TOKEN`.


## Testes de rate-limit e métricas
- `tests/api-v1-rate-metrics.test.ts` valida burst -> 429 com headers e controle de acesso no `/api/v1/metrics`.


## Smoke pós-deploy automático
- Workflow `post-deploy-smoke.yml` roda manualmente e também após push na `main`.
- Configure `PRODUCTION_BASE_URL` em **Settings > Variables > Actions**.
- Configure `ADMIN_API_TOKEN` em **Settings > Secrets and variables > Actions > Secrets** (opcional para checks admin).

## Debug de deploy Vercel
- Inspecionar logs de um deploy específico:
  - `npx vercel inspect <deployment_id> --logs`
- Se pedir login, rode primeiro `npx vercel login` no ambiente local autenticado.
- Em CI/automação, configure `VERCEL_TOKEN` + `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID`.
