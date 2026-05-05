# Varredura técnica — versão atual (commit base `2f428f9`)

Data da varredura: **2026-05-05**.

## O que está sólido

- Pipeline local básico saudável: `lint`, `test` e `build` executaram com sucesso.
- API versionada `/api/v1/translate` já aplica validação (`zod`), limite de taxa, `x-request-id` e segurança de headers.
- Projeto já tem scripts e workflows de manutenção contínua.

## Melhorias prioritárias (curto prazo)

1. **Unificar contratos entre `/api/translate` e `/api/v1/translate`**
   - Hoje os dois endpoints retornam formatos diferentes e com semântica diferente (compatibilidade vs. endpoint oficial).
   - Risco: regressões no frontend e confusão para integrações externas.
   - Ação: tornar `/api/translate` um proxy interno para `/api/v1/translate` ou declarar depreciação com prazo.

2. **Eliminar warning de ambiente no npm (`http-proxy`)**
   - Todas as rotinas (`lint`, `test`, `build`) mostram warning de configuração desconhecida.
   - Risco: ruído operacional e futura quebra em major do npm.
   - Ação: revisar `.npmrc`/variáveis de ambiente do CI e remover/renomear chave legada.

3. **Fortalecer CSP para remover dependência de `'unsafe-inline'`**
   - O proxy define CSP com `script-src 'unsafe-inline'` e `style-src 'unsafe-inline'`.
   - Risco: superfície maior para XSS em cenários de injeção.
   - Ação: migrar para nonce/hash quando possível e restringir origens gradualmente.

4. **Cobrir rota legacy `/api/translate` com testes automatizados**
   - Há testes de API v1 no README, mas o endpoint legacy ainda pode quebrar silenciosamente.
   - Ação: adicionar suíte mínima para sucesso/erro de payload da rota legacy até sua descontinuação.

## Melhorias de médio prazo

5. **Observabilidade com métricas exportáveis (Prometheus/OpenTelemetry)**
   - Hoje há endpoint de métricas operacionais, mas vale expor padrão de mercado para alertas externos.
   - Ação: adicionar exportador e dashboard com SLOs (erro, latência p95, rate-limit hit rate).

6. **Endurecer governança de API pública**
   - Ação: adicionar versionamento de schema (OpenAPI) e verificação em CI para evitar drift de contrato.

7. **Definir política de depreciação de endpoint**
   - Ação: documentar lifecycle (`active`, `deprecated`, `sunset`) para rotas como `/api/translate`.

## Checklist objetivo para próximo ciclo

- [ ] Criar issue: “Deprecar `/api/translate` e unificar contrato com `/api/v1/translate`”.
- [ ] Corrigir warning `http-proxy` em ambiente local/CI.
- [ ] Planejar migração CSP sem `unsafe-inline` (faseado).
- [ ] Adicionar testes de compatibilidade da rota legacy.
- [ ] Publicar contrato OpenAPI mínimo da API v1.

## Comandos executados nesta varredura

- `npm run lint`
- `npm test`
- `npm run build`
