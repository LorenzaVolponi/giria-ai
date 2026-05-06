# Backlog de execução — 2026-05-06

## P0

### 1) Remover warning `http-proxy` no npm (local/CI)
**Tipo:** Chore/DevEx  
**Esforço:** P

**Critérios de aceite**
- `npm run lint`, `npm test` e `npm run build` sem warning de `http-proxy`.
- Ajuste documentado para ambiente local e CI.

---

### 2) Deprecar `/api/translate` e adaptar para `/api/v1/translate`
**Tipo:** Feature/Refactor  
**Esforço:** M

**Critérios de aceite**
- `/api/translate` passa a usar a lógica oficial da v1.
- Header de depreciação presente (`Deprecation` e `Sunset`).
- README com prazo de remoção.

---

### 3) Cobrir `/api/translate` com testes mínimos de contrato
**Tipo:** Test  
**Esforço:** P

**Critérios de aceite**
- Cenário 200 (payload válido).
- Cenário 400 (payload inválido).
- Cenário 500 (erro interno simulado).
- Execução estável no CI.

## P1

### 4) Endurecer CSP e reduzir `unsafe-inline`
**Tipo:** Security  
**Esforço:** G

**Critérios de aceite**
- Mapeamento de scripts/estilos inline concluído.
- Migração inicial para nonce/hash em staging.
- Plano de rollout com fallback definido.

---

### 5) Publicar OpenAPI inicial para `/api/v1`
**Tipo:** Feature/Docs  
**Esforço:** M

**Critérios de aceite**
- Contrato OpenAPI versionado no repositório.
- Cobertura mínima: health, translate, visits, metrics.
- Instruções de consumo documentadas.

---

### 6) Adicionar gate de contrato no CI
**Tipo:** CI/CD  
**Esforço:** M

**Critérios de aceite**
- Pipeline falha quando contrato divergir da implementação.
- Execução em PR e push.

## P2

### 7) Definir SLOs iniciais
**Tipo:** Observability  
**Esforço:** M

**Critérios de aceite**
- Documento de SLOs publicado (latência p95, taxa de erro, rate-limit hit rate).
- Métricas vinculadas aos endpoints operacionais existentes.
