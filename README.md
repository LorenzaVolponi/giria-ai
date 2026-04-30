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

## Deploy automático

```bash
chmod +x scripts/deploy-all.sh
./scripts/deploy-all.sh
```
