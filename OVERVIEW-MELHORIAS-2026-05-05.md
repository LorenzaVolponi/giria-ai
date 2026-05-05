# Overview da versão atual e melhorias recomendadas

Data de referência: **2026-05-05**.

## 1) Estado atual (resumo executivo)

O sistema está funcional para o objetivo MVP de tradução de gírias, com boa base de segurança e operação:

- Frontend em Next.js App Router com páginas estáticas e rotas dinâmicas.
- APIs versionadas em `/api/v1/*` para saúde, tradução, métricas, sugestões e visitas.
- Pipeline local estável (`lint`, `test`, `build` passando).
- Camadas de proteção já presentes: sanitização, validação de payload, rate limit e headers de segurança.

## 2) Pontos fortes

- **Contrato v1 consistente no endpoint principal de tradução** com validação por schema e observabilidade (`x-request-id`).
- **Métricas operacionais e diagnóstico** já disponíveis para inspeção rápida de saúde.
- **Estrutura de automação** (scripts/workflows) madura para manutenção contínua.

## 3) O que melhorar agora (prioridade alta)

### A. Unificar o comportamento das rotas de tradução
Hoje coexistem duas rotas com comportamentos diferentes:
- `/api/v1/translate` (oficial, com validação/rate-limit/observabilidade)
- `/api/translate` (compatibilidade, resposta simplificada)

**Melhoria recomendada:**
1. Transformar `/api/translate` em adaptador para `/api/v1/translate`.
2. Adicionar header de depreciação na rota legacy (`Deprecation`, `Sunset`).
3. Definir data de remoção e comunicar no README.

**Ganho:** reduz ambiguidade de integração e evita regressões por contratos distintos.

---

### B. Endurecer CSP gradualmente
A política atual ainda permite `unsafe-inline` para script/style.

**Melhoria recomendada:**
1. Mapear scripts/estilos inline existentes.
2. Migrar para nonce/hash no que for possível.
3. Travar CSP em fases para não quebrar produção.

**Ganho:** menor superfície para XSS.

---

### C. Fechar lacuna de testes na rota legacy
A API v1 está coberta, mas a rota legacy pode quebrar sem alerta imediato.

**Melhoria recomendada:**
- Adicionar testes mínimos de contrato para `/api/translate` (200, 400 e 500).

**Ganho:** segurança de mudança enquanto a depreciação não conclui.

---

### D. Remover ruído de ambiente no npm (`http-proxy`)
Comandos de rotina exibem warning de configuração legada.

**Melhoria recomendada:**
- Revisar `.npmrc` e variáveis de CI/local; substituir/remover chave inválida.

**Ganho:** pipeline mais limpo e redução de risco em upgrades do npm.

## 4) Próxima onda (médio prazo)

1. **OpenAPI para `/api/v1`** + validação em CI (evita drift de contrato).
2. **SLOs operacionais** (latência p95, taxa de erro, rate-limit hit rate).
3. **Política formal de versionamento/depreciação** para todos endpoints públicos.
4. **Padronização de erros** (código, mensagem, correlação via request-id).

## 5) Plano prático de 2 semanas

### Semana 1 (alto impacto / baixo risco)
- [ ] Adaptar `/api/translate` para chamar a lógica de `/api/v1/translate`.
- [ ] Adicionar headers de depreciação na rota legacy.
- [ ] Criar testes da rota legacy.
- [ ] Corrigir warning `http-proxy` em local + CI.

### Semana 2 (hardening)
- [ ] Iniciar migração CSP (`unsafe-inline` -> nonce/hash) com rollout por ambiente.
- [ ] Publicar OpenAPI inicial da API v1.
- [ ] Adicionar gate de contrato no CI.

## 6) Comandos validados nesta revisão

- `npm run lint`
- `npm test`
- `npm run build`
