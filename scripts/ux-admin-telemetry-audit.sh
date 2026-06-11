#!/usr/bin/env bash
set -u -o pipefail

# Gíria AI — UX/Admin/Telemetry/Product Audit
# ------------------------------------------------------------
# Objetivo: gerar uma varredura automática, repetível e legível para GitHub
# cobrindo UX, UI, acessibilidade, admin, telemetria, privacidade, segurança
# operacional, SEO, performance e qualidade de produto.
#
# Uso local:
#   bash scripts/ux-admin-telemetry-audit.sh
#   STRICT=true bash scripts/ux-admin-telemetry-audit.sh
#   REPORT=reports/minha-auditoria.md bash scripts/ux-admin-telemetry-audit.sh
#
# Em CI, o workflow publica o relatório como artifact. Por padrão o script não
# falha o job para que você sempre receba o relatório completo; use STRICT=true
# para falhar quando houver achados critical/high.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR" || exit 1

mkdir -p reports
STAMP="$(date -u +%Y%m%d-%H%M%S)"
REPORT="${REPORT:-reports/ux-admin-telemetry-audit-${STAMP}.md}"
SUMMARY_JSON="${SUMMARY_JSON:-reports/ux-admin-telemetry-audit-${STAMP}.json}"
STRICT="${STRICT:-false}"
RUN_OPTIONAL_CHECKS="${RUN_OPTIONAL_CHECKS:-true}"
RUN_RUNTIME_SMOKE="${RUN_RUNTIME_SMOKE:-false}"
AUDIT_PORT="${AUDIT_PORT:-3025}"

TOTAL=0
CRITICAL=0
HIGH=0
MEDIUM=0
LOW=0
INFO=0
PASS=0
WARN=0
FAIL=0
ISSUES_JSON_ITEMS=()

now_iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }

append() { printf '%b\n' "$*" >> "$REPORT"; }
section() { append "\n## $*"; }
subsection() { append "\n### $*"; }
codeblock() {
  local lang="${1:-text}"
  append "\n\`\`\`${lang}"
  cat >> "$REPORT"
  append "\`\`\`"
}

json_escape() {
  python -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || sed 's/"/\\"/g'
}

inc_severity() {
  case "$1" in
    critical) CRITICAL=$((CRITICAL + 1));;
    high) HIGH=$((HIGH + 1));;
    medium) MEDIUM=$((MEDIUM + 1));;
    low) LOW=$((LOW + 1));;
    info) INFO=$((INFO + 1));;
  esac
}

severity_icon() {
  case "$1" in
    critical) printf '🚨';;
    high) printf '🔴';;
    medium) printf '🟠';;
    low) printf '🟡';;
    info) printf '🔵';;
    pass) printf '✅';;
    warn) printf '⚠️';;
    *) printf '•';;
  esac
}

add_issue() {
  local severity="$1"
  local area="$2"
  local title="$3"
  local evidence="$4"
  local recommendation="$5"
  local files="$6"

  TOTAL=$((TOTAL + 1))
  inc_severity "$severity"

  local icon
  icon="$(severity_icon "$severity")"
  append "\n<a id=\"issue-${TOTAL}\"></a>"
  append "### ${icon} ${TOTAL}. [${severity^^}] ${area} — ${title}"
  append ""
  append "**Evidência**"
  append ""
  append "${evidence}"
  append ""
  append "**Arquivos/linhas relacionados**"
  append ""
  if [[ -n "$files" ]]; then
    append "${files}"
  else
    append "- Não identificado automaticamente."
  fi
  append ""
  append "**Recomendação automática**"
  append ""
  append "${recommendation}"

  local item
  item=$(python - "$severity" "$area" "$title" "$evidence" "$recommendation" "$files" <<'PY'
import json, sys
keys = ["severity", "area", "title", "evidence", "recommendation", "files"]
print(json.dumps(dict(zip(keys, sys.argv[1:])), ensure_ascii=False))
PY
)
  ISSUES_JSON_ITEMS+=("$item")
}

add_pass() {
  PASS=$((PASS + 1))
  append "- ✅ $*"
}

add_warn() {
  WARN=$((WARN + 1))
  append "- ⚠️ $*"
}

add_fail() {
  FAIL=$((FAIL + 1))
  append "- ❌ $*"
}

file_exists() { [[ -f "$1" ]]; }
contains() { local file="$1" pattern="$2"; [[ -f "$file" ]] && rg -q --pcre2 "$pattern" "$file"; }
first_matches() {
  local pattern="$1"; shift
  rg -n --pcre2 "$pattern" "$@" 2>/dev/null | sed -n '1,12p'
}
line_refs() {
  local pattern="$1"; shift
  first_matches "$pattern" "$@" | sed 's/^/- /'
}
count_matches() {
  local pattern="$1"; shift
  rg -n --pcre2 "$pattern" "$@" 2>/dev/null | wc -l | tr -d ' '
}

run_cmd_capture() {
  local label="$1"; shift
  local tmp
  tmp="$(mktemp)"
  if "$@" >"$tmp" 2>&1; then
    add_pass "${label}"
    sed -n '1,120p' "$tmp" | codeblock text
    rm -f "$tmp"
    return 0
  else
    add_fail "${label}"
    sed -n '1,160p' "$tmp" | codeblock text
    rm -f "$tmp"
    return 1
  fi
}

write_header() {
  cat > "$REPORT" <<EOF_HEADER
# Auditoria automática — UX, Admin, Telemetria, Segurança e Produto

- **Projeto:** Gíria AI
- **Gerado em:** $(now_iso)
- **Modo estrito:** ${STRICT}
- **Runtime smoke:** ${RUN_RUNTIME_SMOKE}
- **Relatório:** ${REPORT}

> Este relatório combina checks estáticos por padrões de código, validação de estrutura e checks opcionais de qualidade. Ele não substitui pentest, auditoria LGPD formal nem teste manual de UX, mas cria uma esteira automática para detectar regressões e priorizar melhorias.

EOF_HEADER
}

inventory() {
  section "Inventário rápido"
  append ""
  append "### Stack detectada"
  append ""
  if file_exists package.json; then
    append "- package.json encontrado. Scripts principais:"
    node -e 'const p=require("./package.json"); for (const [k,v] of Object.entries(p.scripts||{})) console.log(`  - ${k}: ${v}`)' >> "$REPORT" 2>/dev/null || true
  else
    add_warn "package.json não encontrado."
  fi

  append "\n### Rotas e áreas principais"
  append ""
  find src/app -maxdepth 4 -type f \( -name 'page.tsx' -o -name 'route.ts' -o -name 'layout.tsx' \) 2>/dev/null | sort | sed 's/^/- /' >> "$REPORT" || true

  append "\n### Componentes de produto/admin detectados"
  append ""
  find src/components/product src/components/sections -maxdepth 2 -type f 2>/dev/null | sort | sed 's/^/- /' >> "$REPORT" || true
}

check_security_admin() {
  section "Achados — Admin e segurança operacional"

  if contains src/app/api/v1/admin/login/route.ts 'process\.env\.ADMIN_LOGIN \|\||process\.env\.ADMIN_PASSWORD \|\||process\.env\.ADMIN_CODES \|\|'; then
    add_issue "critical" "Admin" "Credenciais admin padrão ou fallback inseguro" \
      "O login admin contém fallback para credenciais/códigos quando variáveis de ambiente não estão definidas. Em deploy mal configurado, isso pode abrir o painel com credenciais previsíveis." \
      "Remover fallbacks; exigir ADMIN_LOGIN, ADMIN_PASSWORD, ADMIN_CODES e idealmente ADMIN_SESSION_SECRET em produção; retornar erro seguro quando ausentes; adicionar teste de configuração ausente." \
      "$(line_refs 'process\.env\.ADMIN_LOGIN \|\||process\.env\.ADMIN_PASSWORD \|\||process\.env\.ADMIN_CODES \|\|' src/app/api/v1/admin/login/route.ts)"
  else
    add_pass "Admin login sem fallback óbvio de credenciais."
  fi

  if contains src/lib/admin-guard.ts 'res\.cookies\.set\(ADMIN_COOKIE, expected|return process\.env\.ADMIN_API_TOKEN \|\|'; then
    add_issue "critical" "Admin" "Sessão admin baseada no mesmo segredo do token operacional" \
      "O cookie de sessão aparenta reutilizar o token esperado/API token como valor de sessão. Sessões devem ser opacas, assinadas e expiráveis." \
      "Criar sessão opaca assinada por HMAC/JWT com ADMIN_SESSION_SECRET; nunca gravar ADMIN_API_TOKEN como cookie; validar expiração e assinatura." \
      "$(line_refs 'res\.cookies\.set\(ADMIN_COOKIE, expected|return process\.env\.ADMIN_API_TOKEN \|\|' src/lib/admin-guard.ts)"
  else
    add_pass "Cookie admin não aparenta gravar o segredo operacional diretamente."
  fi

  if contains src/lib/admin-guard.ts 'sameSite: "lax"' && contains src/lib/admin-guard.ts 'httpOnly: true'; then
    add_pass "Cookies admin usam httpOnly e SameSite em pelo menos parte da sessão."
  else
    add_warn "Cookies admin podem não estar usando httpOnly/SameSite de forma consistente."
  fi

  if contains src/proxy.ts "unsafe-inline"; then
    add_issue "medium" "Segurança" "CSP permite unsafe-inline" \
      "A política CSP inclui unsafe-inline para scripts/estilos, reduzindo proteção contra XSS." \
      "Migrar scripts inline para nonce/hash; adicionar base-uri, frame-ancestors e form-action; manter allowlist mínima para Vercel." \
      "$(line_refs 'unsafe-inline|Content-Security-Policy' src/proxy.ts)"
  else
    add_pass "CSP não contém unsafe-inline."
  fi

  if contains src/proxy.ts 'Strict-Transport-Security' && contains src/lib/security.ts 'X-Frame-Options'; then
    add_pass "Headers básicos de segurança detectados: HSTS/X-Frame-Options."
  else
    add_warn "Headers básicos de segurança incompletos."
  fi
}

check_pii_privacy() {
  section "Achados — Privacidade, LGPD e exposição de dados"

  if contains src/app/api/v1/suggestions/route.ts 'rawStatus.*pending|rawStatus.*rejected|rawStatus.*all' && ! contains src/app/api/v1/suggestions/route.ts 'requireAdmin'; then
    add_issue "critical" "Privacidade" "Listagem de sugestões privadas não exige autenticação" \
      "O endpoint de sugestões aceita status privados e não há chamada de requireAdmin no arquivo. Isso pode expor nome, WhatsApp e e-mail de usuários." \
      "Exigir admin para pending/rejected/all/includeSummary; manter público apenas approved com DTO sanitizado; adicionar testes de acesso anônimo." \
      "$(line_refs 'rawStatus|listSuggestionsByStatus|return withSecurityHeaders\(NextResponse\.json\(\{ items' src/app/api/v1/suggestions/route.ts)\n$(line_refs 'submitterName|submitterWhatsapp|submitterEmail|listSuggestionsByStatus' src/lib/suggestion-pipeline.ts)"
  else
    add_pass "Endpoint de sugestões aparenta ter proteção/admin para status sensíveis."
  fi

  if contains src/app/api/v1/visits/route.ts 'if \(process\.env\.ADMIN_API_TOKEN\)'; then
    add_issue "high" "Telemetria" "GET de visitas só é protegido se ADMIN_API_TOKEN existir" \
      "A proteção de telemetria depende da presença de env. Sem ADMIN_API_TOKEN, dados agregados/recentes de visita podem ficar públicos." \
      "Exigir admin sempre para GET /api/v1/visits ou criar endpoint público separado com métrica mínima e sem recent/userAgent/referer." \
      "$(line_refs 'process\.env\.ADMIN_API_TOKEN|return withSecurityHeaders\(NextResponse\.json\(await getVisitorStats' src/app/api/v1/visits/route.ts)"
  else
    add_pass "GET de visitas não tem proteção condicional por env detectada."
  fi

  if contains src/lib/visitors.ts 'recentRows|userAgent|referer|city|region'; then
    add_issue "medium" "Telemetria" "Stats de visitantes incluem campos detalhados" \
      "A função de estatísticas monta registros recentes com userAgent/referer/localização detalhada. Mesmo com IP hash, isso pode ser sensível." \
      "Retornar recent apenas no admin; mascarar/remover userAgent e referer por padrão; documentar retenção e finalidade." \
      "$(line_refs 'recentRows|userAgent|referer|city|region' src/lib/visitors.ts)"
  else
    add_pass "Stats de visitantes não expõem campos detalhados aparentes."
  fi

  if contains src/components/product/user-suggestion-form.tsx 'submitterWhatsapp|submitterEmail' && ! contains src/components/product/user-suggestion-form.tsx 'consent|Consent|privacidade|Privacidade|termos'; then
    add_issue "medium" "Privacidade" "Formulário coleta contato sem consentimento/texto de finalidade visível" \
      "O formulário pede WhatsApp/e-mail, mas não há consentimento ou link de privacidade detectado no componente." \
      "Adicionar texto de finalidade, link para privacidade, consentimento/ciência e opção de contato mínimo; validar retenção." \
      "$(line_refs 'submitterWhatsapp|submitterEmail|WhatsApp|email' src/components/product/user-suggestion-form.tsx)"
  else
    add_pass "Formulário de sugestão contém contato com possível texto de consentimento/privacidade."
  fi

  local privacy_lines=0
  if file_exists src/app/privacidade/page.tsx; then
    privacy_lines=$(wc -l < src/app/privacidade/page.tsx | tr -d ' ')
  fi
  if [[ "$privacy_lines" -lt 60 ]]; then
    add_issue "medium" "Privacidade" "Política de privacidade muito curta para a coleta real" \
      "A página de privacidade tem ${privacy_lines} linhas; o produto usa analytics, speed insights, visitas, localStorage e coleta de sugestões com contato." \
      "Expandir política com dados coletados, finalidade, retenção, compartilhamento, direitos do usuário e contato." \
      "$(line_refs 'Política|histórico|privacidade' src/app/privacidade/page.tsx 2>/dev/null || true)"
  else
    add_pass "Política de privacidade tem volume mínimo de conteúdo."
  fi

  if contains src/app/layout.tsx '@vercel/analytics|@vercel/speed-insights' && ! rg -q 'consent|Consent|cookie banner|AnalyticsConsent' src 2>/dev/null; then
    add_issue "medium" "Privacidade" "Analytics global sem controle de consentimento detectado" \
      "O layout carrega Vercel Analytics/Speed Insights globalmente, mas não foi encontrado componente de consentimento/opt-out." \
      "Adicionar preferências de privacidade, explicar base legal e renderizar analytics conforme decisão do usuário/produto." \
      "$(line_refs '@vercel/analytics|@vercel/speed-insights|<Analytics|<SpeedInsights' src/app/layout.tsx)"
  else
    add_pass "Analytics global tem algum indício de consentimento/controle ou não foi detectado."
  fi
}

check_telemetry_reliability() {
  section "Achados — Telemetria, observabilidade e confiabilidade"

  if contains src/lib/metrics.ts 'new Map<|const buckets = new Map|groundingBuckets|feedbackBuckets'; then
    add_issue "high" "Telemetria" "Métricas operacionais em memória" \
      "As métricas usam Map local em memória. Em serverless/múltiplas instâncias, dados reiniciam e ficam inconsistentes." \
      "Persistir buckets em Redis/Upstash ou banco; manter memory só como fallback dev; retornar source no endpoint." \
      "$(line_refs 'new Map|buckets|groundingBuckets|feedbackBuckets' src/lib/metrics.ts)"
  else
    add_pass "Métricas não aparentam depender exclusivamente de Map local."
  fi

  if contains src/lib/suggestion-pipeline.ts 'duckduckgo|bing\.com|search\.brave|google\.com|youtube\.com|tiktok\.com' && ! contains src/lib/suggestion-pipeline.ts 'AbortController|timeout|signal'; then
    add_issue "high" "Confiabilidade" "Scoring web síncrono sem timeout explícito" \
      "A validação de sugestões consulta buscadores/redes durante o POST e não há AbortController/timeout detectado." \
      "Mover scoring para fila assíncrona; adicionar timeout por request e timeout global; registrar fallback no evidence." \
      "$(line_refs 'duckduckgo|bing\.com|search\.brave|google\.com|youtube\.com|tiktok\.com|fetch\(' src/lib/suggestion-pipeline.ts)"
  else
    add_pass "Scoring web tem timeout/AbortController ou não foi detectado."
  fi

  if contains src/lib/suggestion-pipeline.ts 'OLLAMA_URL|api/generate|localLlmEvaluate' && ! contains src/lib/suggestion-pipeline.ts 'AbortController|SUGGESTION_LLM_TIMEOUT|signal'; then
    add_issue "medium" "Confiabilidade" "Avaliação LLM local sem timeout explícito" \
      "O avaliador LLM local pode bloquear o envio de sugestão se o serviço estiver lento." \
      "Adicionar AbortController e timeout configurável; retornar fallback e evidência llm_timeout." \
      "$(line_refs 'localLlmEvaluate|OLLAMA_URL|api/generate|fetch\(' src/lib/suggestion-pipeline.ts)"
  else
    add_pass "LLM local tem timeout/AbortController ou não foi detectado."
  fi

  if contains src/app/api/chat/feedback/route.ts 'recordChatFeedback' && ! contains src/app/api/chat/feedback/route.ts 'isRateLimited|z\.object|safeParse'; then
    add_issue "medium" "Telemetria" "Feedback de chat sem rate limit/validação forte" \
      "Feedback influencia métricas/SLO, mas não há rate limit ou schema robusto detectado." \
      "Validar payload com zod, limitar por IP, restringir motivos a enum e ignorar spam." \
      "$(line_refs 'recordChatFeedback|helpful|reason' src/app/api/chat/feedback/route.ts)"
  else
    add_pass "Feedback de chat possui indício de validação/rate limit."
  fi

  if contains src/app/diagnostico/page.tsx 'TrafficInsightsCard|OperationalMetricsCard'; then
    add_issue "medium" "Produto/Admin" "Diagnóstico público mistura telemetria operacional" \
      "A página de diagnóstico renderiza cards de tráfego/métricas; isso deveria ficar em área admin ou lidar claramente com 401." \
      "Separar diagnóstico público de painel operacional privado; mover telemetria para admin; melhorar estados de erro." \
      "$(line_refs 'TrafficInsightsCard|OperationalMetricsCard|ApiPlayground|SystemHealthCard' src/app/diagnostico/page.tsx)"
  else
    add_pass "Diagnóstico público não inclui cards operacionais sensíveis."
  fi
}

check_ux_accessibility() {
  section "Achados — UX, UI, layout e acessibilidade"

  if contains src/components/giria-app.tsx '<Input[\s\S]{0,300}placeholder=.Digite uma gíria' && ! contains src/components/giria-app.tsx 'aria-label=.Digite uma gíria|<label[^>]+htmlFor=.*search'; then
    add_issue "medium" "Acessibilidade" "Busca principal sem label acessível explícito" \
      "A busca usa placeholder como orientação principal. Placeholders não substituem label para acessibilidade." \
      "Adicionar label visível ou aria-label; adicionar aria-label ao botão limpar e ao botão traduzir em mobile." \
      "$(line_refs 'placeholder=.Digite uma gíria|handleResetSearch|<Search' src/components/giria-app.tsx)"
  else
    add_pass "Busca principal aparenta ter label/aria-label."
  fi

  if contains src/components/giria-app.tsx 'Chat IA|chatOpen|fixed z-\[60\]' && ! contains src/components/giria-app.tsx 'role="dialog"|aria-modal|aria-labelledby'; then
    add_issue "medium" "Acessibilidade" "Chat flutuante sem semântica de diálogo" \
      "O chat abre painel flutuante, mas não há role dialog/aria-modal/labelledby detectados." \
      "Adicionar role=dialog, foco inicial/retorno, Escape, aria-live nas mensagens e aria-label nos botões." \
      "$(line_refs 'Chat IA|chatOpen|fixed z-\[60\]|title=.Fechar|title=.Limpar conversa' src/components/giria-app.tsx)"
  else
    add_pass "Chat flutuante tem semântica básica de diálogo."
  fi

  if contains src/components/giria-app.tsx 'Card[\s\S]{0,160}onClick=\{\(\) => searchAndGo'; then
    add_issue "medium" "Acessibilidade" "Cards clicáveis sem semântica nativa" \
      "Cards com onClick não são botões/links nativos e podem falhar para teclado/leitores de tela." \
      "Trocar por button/link estilizado ou adicionar role, tabIndex e handlers Enter/Espaço." \
      "$(line_refs 'Card|onClick=\{\(\) => searchAndGo|cursor-pointer' src/components/giria-app.tsx)"
  else
    add_pass "Não foram detectados cards principais clicáveis sem semântica."
  fi

  if contains src/app/admin/page.tsx '<input className=.*placeholder=' && ! contains src/app/admin/page.tsx '<label'; then
    add_issue "medium" "Admin UX" "Login admin usa placeholders sem labels" \
      "Inputs do login admin parecem depender só de placeholder." \
      "Adicionar labels, id/name/autocomplete, aria-live para mensagens e loading no botão." \
      "$(line_refs '<input|placeholder=.Login|placeholder=.Senha|placeholder=.Código' src/app/admin/page.tsx)"
  else
    add_pass "Login admin tem labels ou não usa placeholders puros."
  fi

  if contains src/components/giria-app.tsx 'searchTerms\(' && contains src/components/giria-app.tsx 'fuzzyResults\[0\]'; then
    add_issue "medium" "UX de busca" "Resultado fuzzy seleciona primeira sugestão sem confirmação" \
      "Quando não há match exato, a UI usa o primeiro resultado aproximado como resposta final." \
      "Mostrar aviso de resultado aproximado e alternativas 'Você quis dizer?' antes de fixar a tradução." \
      "$(line_refs 'searchTerms\(|fuzzyResults\[0\]|Resultado aproximado|Você quis dizer' src/components/giria-app.tsx)"
  else
    add_pass "Busca fuzzy não seleciona automaticamente o primeiro resultado ou já confirma."
  fi

  if contains src/components/giria-app.tsx 'Pergunte ao Chat IA.*pode conhecer|ele pode conhecer essa gíria'; then
    add_issue "low" "UX de conteúdo" "Mensagem de termo ausente cria expectativa de IA aberta" \
      "A UI sugere que o chat pode conhecer gíria ausente, mas o backend prioriza banco local." \
      "Trocar para CTA de termos parecidos/sugerir gíria e explicar que o chat usa base local." \
      "$(line_refs 'Pergunte ao Chat IA|pode conhecer essa gíria|Não temos tradução' src/components/giria-app.tsx)"
  else
    add_pass "Mensagem de termo ausente não promete conhecimento fora da base."
  fi

  if contains src/components/giria-app.tsx 'bottom-20|Navegação mobile|fixed bottom-0'; then
    add_issue "low" "Layout mobile" "Possível competição entre bottom nav e botão flutuante" \
      "A navegação mobile e o botão de chat são fixos no rodapé; em telas pequenas podem competir por espaço." \
      "Testar alturas pequenas, usar safe-area consistente e considerar chat como item da nav mobile." \
      "$(line_refs 'Navegação mobile|fixed bottom-0|bottom-20|Floating Chat' src/components/giria-app.tsx)"
  else
    add_pass "Não foi detectada competição óbvia de elementos fixos no rodapé."
  fi
}

check_admin_operations() {
  section "Achados — Operação admin e moderação"

  if contains src/components/product/suggestion-moderation-panel.tsx 'submitterWhatsapp|submitterEmail' && ! contains src/components/product/suggestion-moderation-panel.tsx 'maskEmail|maskWhatsapp|revelar|Revelar'; then
    add_issue "medium" "Admin/PII" "Painel mostra contato pessoal em claro" \
      "O painel de moderação renderiza WhatsApp/e-mail diretamente nos cards." \
      "Mascarar por padrão; revelar sob ação explícita com auditoria e permissão por papel." \
      "$(line_refs 'submitterWhatsapp|submitterEmail|WhatsApp não informado|Email não informado' src/components/product/suggestion-moderation-panel.tsx)"
  else
    add_pass "Painel de moderação aparenta mascarar contatos ou não exibe PII."
  fi

  if contains src/components/product/suggestion-moderation-panel.tsx 'moderate\(item\.id, "rejected"\)|batch|Selecionar filtradas' && ! contains src/components/product/suggestion-moderation-panel.tsx 'confirm\(|AlertDialog|Confirma'; then
    add_issue "low" "Admin UX" "Ações sensíveis de moderação sem confirmação detectada" \
      "Rejeitar/aprovar em lote pode ocorrer por clique acidental se não houver confirmação." \
      "Adicionar confirmação para rejeições e lote; mostrar contagem/amostra; registrar motivo e auditoria." \
      "$(line_refs 'rejected|Selecionar filtradas|batch|Aprovar|Rejeitar' src/components/product/suggestion-moderation-panel.tsx)"
  else
    add_pass "Ações sensíveis têm indício de confirmação."
  fi

  if contains src/app/admin/page.tsx 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4' && ! contains src/app/admin/page.tsx 'Tabs|tablist|Resumo|Moderação|Auditoria'; then
    add_issue "low" "Admin IA" "Dashboard admin denso sem separação clara por fluxo" \
      "A página admin reúne vários blocos e pode ficar difícil de operar em rotina." \
      "Separar em tabs/rotas: Resumo, Moderação, Telemetria, Auditoria e Configurações; priorizar alertas críticos." \
      "$(line_refs 'Dashboard Admin|grid gap-3|Alertas|Auditoria|SuggestionModerationPanel' src/app/admin/page.tsx)"
  else
    add_pass "Admin tem indício de separação por tabs/fluxos."
  fi
}

check_seo_content() {
  section "Achados — SEO, conteúdo e confiança"

  if contains src/app/layout.tsx 'nave espacial|alienígena|ET|Paraná'; then
    add_issue "low" "SEO" "Metadados globais podem estar sobrecarregados com termos repetitivos" \
      "Title/description/keywords globais incluem clusters muito específicos; isso pode soar artificial em páginas genéricas." \
      "Refinar metadados globais para intenção principal e deixar clusters específicos para páginas dedicadas." \
      "$(line_refs 'nave espacial|alienígena|ET|Paraná|keywords' src/app/layout.tsx)"
  else
    add_pass "Metadados globais não apresentam repetição óbvia dos clusters auditados."
  fi

  if contains src/components/giria-app.tsx '#01 em tecnologia|AIX8C'; then
    add_issue "low" "Confiança/Brand" "Rodapé contém claim promocional forte" \
      "Claims promocionais no rodapé podem reduzir confiança em ferramenta educativa para pais/escolas." \
      "Trocar por texto institucional, créditos discretos e links úteis de privacidade/sobre/contato." \
      "$(line_refs '#01 em tecnologia|AIX8C|Ferramenta educativa' src/components/giria-app.tsx)"
  else
    add_pass "Rodapé não contém claim promocional forte detectado."
  fi

  if file_exists src/app/sitemap.ts; then
    add_pass "Sitemap dinâmico detectado."
  else
    add_warn "Sitemap não detectado."
  fi

  if file_exists public/robots.txt || file_exists src/app/robots.ts; then
    add_pass "Robots detectado."
  else
    add_warn "Robots não detectado."
  fi
}

check_quality_structure() {
  section "Checks estruturais e qualidade"

  if file_exists package.json; then
    if node -e 'const p=require("./package.json"); process.exit(p.scripts && p.scripts.test ? 0 : 1)' 2>/dev/null; then
      add_pass "Script de testes presente no package.json."
    else
      add_warn "package.json sem script test."
    fi
    if node -e 'const p=require("./package.json"); process.exit(p.scripts && p.scripts.lint ? 0 : 1)' 2>/dev/null; then
      add_pass "Script de lint presente no package.json."
    else
      add_warn "package.json sem script lint."
    fi
    if node -e 'const p=require("./package.json"); process.exit(p.scripts && p.scripts.build ? 0 : 1)' 2>/dev/null; then
      add_pass "Script de build presente no package.json."
    else
      add_warn "package.json sem script build."
    fi
  fi

  local test_count
  test_count=$(find tests -type f \( -name '*.test.ts' -o -name '*.test.tsx' \) 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$test_count" -gt 0 ]]; then
    add_pass "${test_count} arquivos de teste detectados."
  else
    add_warn "Nenhum arquivo de teste detectado em tests/."
  fi

  local zone_count
  zone_count=$(find src -name '*:Zone.Identifier' -type f 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$zone_count" -gt 0 ]]; then
    add_issue "low" "Higiene" "Arquivos Zone.Identifier presentes no repositório" \
      "Foram detectados ${zone_count} arquivos :Zone.Identifier, típicos de metadata do Windows/WSL, que não deveriam ir para produção." \
      "Remover arquivos :Zone.Identifier e adicionar regra ao .gitignore." \
      "$(find src -name '*:Zone.Identifier' -type f 2>/dev/null | sed -n '1,20p' | sed 's/^/- /')"
  else
    add_pass "Sem arquivos :Zone.Identifier detectados em src/."
  fi

  if [[ "$RUN_OPTIONAL_CHECKS" == "true" ]]; then
    subsection "Comandos opcionais executados"
    run_cmd_capture "bash -n scripts/ux-admin-telemetry-audit.sh" bash -n scripts/ux-admin-telemetry-audit.sh || true
    if command -v npm >/dev/null 2>&1 && file_exists package.json; then
      run_cmd_capture "npm run lint" npm run lint || true
    else
      add_warn "npm/package.json indisponível; lint não executado."
    fi
  else
    add_warn "RUN_OPTIONAL_CHECKS=false; lint/bash -n não executados."
  fi
}

runtime_smoke() {
  if [[ "$RUN_RUNTIME_SMOKE" != "true" ]]; then
    return 0
  fi

  section "Runtime smoke opcional"
  append "Subindo aplicação em http://127.0.0.1:${AUDIT_PORT} para smoke básico."

  npm run dev -- --port "$AUDIT_PORT" > /tmp/giria-ux-audit-dev.log 2>&1 &
  local dev_pid=$!
  cleanup_runtime() { kill "$dev_pid" >/dev/null 2>&1 || true; }
  trap cleanup_runtime EXIT

  local ready=false
  for _ in $(seq 1 60); do
    if curl -fsS "http://127.0.0.1:${AUDIT_PORT}/api/v1/health" >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 1
  done

  if [[ "$ready" != "true" ]]; then
    add_fail "Runtime smoke: app não iniciou em 60s."
    sed -n '1,180p' /tmp/giria-ux-audit-dev.log | codeblock text
    return 0
  fi

  run_cmd_capture "curl /api/v1/health" curl -fsS "http://127.0.0.1:${AUDIT_PORT}/api/v1/health" || true
  run_cmd_capture "curl /" curl -fsS "http://127.0.0.1:${AUDIT_PORT}/" || true
  run_cmd_capture "curl /diagnostico" curl -fsS "http://127.0.0.1:${AUDIT_PORT}/diagnostico" || true
}

write_summary() {
  section "Resumo executivo"
  append ""
  append "| Severidade | Quantidade |"
  append "|---|---:|"
  append "| 🚨 Critical | ${CRITICAL} |"
  append "| 🔴 High | ${HIGH} |"
  append "| 🟠 Medium | ${MEDIUM} |"
  append "| 🟡 Low | ${LOW} |"
  append "| 🔵 Info | ${INFO} |"
  append "| ✅ Passes/boas práticas | ${PASS} |"
  append "| ⚠️ Avisos estruturais | ${WARN} |"
  append "| ❌ Comandos com falha | ${FAIL} |"
  append ""
  append "### Próximos passos recomendados"
  append ""
  append "1. Corrigir primeiro os itens **critical** e **high**, principalmente exposição de PII e credenciais/sessão admin."
  append "2. Rodar este script em PRs e agendamento diário via GitHub Actions."
  append "3. Usar STRICT=true quando quiser bloquear merge com critical/high."
  append "4. Transformar cada achado recorrente em teste automatizado para evitar regressão."

  python - "$SUMMARY_JSON" "$TOTAL" "$CRITICAL" "$HIGH" "$MEDIUM" "$LOW" "$INFO" "$PASS" "$WARN" "$FAIL" <<PY
import json, sys
path = sys.argv[1]
summary = {
  "generatedAt": "$(now_iso)",
  "totalIssues": int(sys.argv[2]),
  "critical": int(sys.argv[3]),
  "high": int(sys.argv[4]),
  "medium": int(sys.argv[5]),
  "low": int(sys.argv[6]),
  "info": int(sys.argv[7]),
  "passes": int(sys.argv[8]),
  "warnings": int(sys.argv[9]),
  "commandFailures": int(sys.argv[10]),
  "strict": "${STRICT}".lower() == "true",
  "issues": [
$(printf '    %s,
' "${ISSUES_JSON_ITEMS[@]}" | sed '$ s/,$//')
  ],
}
with open(path, "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)
PY
}

main() {
  write_header
  inventory
  check_security_admin
  check_pii_privacy
  check_telemetry_reliability
  check_ux_accessibility
  check_admin_operations
  check_seo_content
  check_quality_structure
  runtime_smoke
  write_summary

  printf 'Relatório gerado: %s\n' "$REPORT"
  printf 'Resumo JSON: %s\n' "$SUMMARY_JSON"
  printf 'Critical=%s High=%s Medium=%s Low=%s Pass=%s Warn=%s Fail=%s\n' "$CRITICAL" "$HIGH" "$MEDIUM" "$LOW" "$PASS" "$WARN" "$FAIL"

  if [[ "$STRICT" == "true" && $((CRITICAL + HIGH)) -gt 0 ]]; then
    printf 'STRICT=true: falhando por haver critical/high.\n' >&2
    exit 1
  fi
}

main "$@"
