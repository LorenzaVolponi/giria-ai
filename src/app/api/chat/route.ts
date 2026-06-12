import { NextRequest, NextResponse } from "next/server";
import {
  SLANG_DATA,
  RISK_CONFIG,
  CATEGORIES,
  type SlangTerm,
  type RiskLevel,
} from "@/lib/slang-data";
import { getClientIp, sanitizeUserInput, withSecurityHeaders } from "@/lib/security";
import { recordGroundingMetric } from "@/lib/metrics";

// ---------------------------------------------------------------------------
// Rate limiting — simple in-memory (best-effort for serverless)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const RATE_LIMIT_CLEANUP_SAMPLE_EVERY = 100;
let rateLimitChecks = 0;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitMap.set(ip, recent);

  rateLimitChecks += 1;
  if (rateLimitChecks % RATE_LIMIT_CLEANUP_SAMPLE_EVERY === 0) {
    for (const [entryIp, entryTimestamps] of rateLimitMap.entries()) {
      const valid = entryTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) rateLimitMap.delete(entryIp);
      else rateLimitMap.set(entryIp, valid);
    }
  }

  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES_TO_SEND = 8;
const SUGGESTION_PAGE_LINK = "/girias/enviadas-por-usuarios";
const LEGACY_FLAGS_SUNSET_HTTP_DATE = "Mon, 31 Aug 2026 23:59:59 GMT";
const LEGACY_FLAGS_DEPRECATION_DOC = "/#contrato-post-api-chat";
const INTENT_CONFIDENCE_THRESHOLD: Record<Intent, number> = {
  single_term_lookup: 0.65,
  phrase_translation: 0.55,
  category_explore: 0.5,
  random_terms: 0.5,
  how_many_terms: 0.5,
  what_is_giria_ai: 0.5,
  greeting: 0.5,
  thanks: 0.5,
  help: 0.5,
  out_of_scope: 0.5,
  general_question: 0.5,
};
const PROMPT_BACKEND_RULES = [
  "Priorize segurança e clareza para pais, educadores e responsáveis.",
  "Sempre explique gíria com significado, contexto social e exemplo seguro.",
  "Quando houver ambiguidade, ofereça hipóteses e peça confirmação de região.",
  "Para termos regionais, indique região provável e variações de escrita.",
  "Se houver risco yellow/orange/red, traga orientação de conversa não-confrontativa.",
  "Responda estritamente com base no conteúdo do nosso banco/local (SLANG_DATA e metadados).",
  "Não invente significado para termo ausente; ofereça fluxo de sugestão de gíria.",
  "Priorize utilidade para o usuário final: resposta curta no topo e detalhes opcionais abaixo.",
  "Sempre que possível, inclua orientação prática de conversa entre responsável e adolescente.",
] as const;

/** Normalizes a string for matching: lowercase, no diacritics, no extra spaces. */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''""]/g, "")
    .replace(/[.,;:!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build an index of normalized term → SlangTerm for fast lookup. */
function buildTermIndex(): Map<string, SlangTerm[]> {
  const index = new Map<string, SlangTerm[]>();
  for (const term of SLANG_DATA) {
    const key = normalize(term.term);
    const existing = index.get(key);
    if (existing) existing.push(term);
    else index.set(key, [term]);

    // Also index variations
    if (Array.isArray(term.variations)) {
      for (const v of term.variations) {
        const vKey = normalize(v);
        if (vKey && vKey !== key) {
          const vExisting = index.get(vKey);
          if (vExisting) vExisting.push(term);
          else index.set(vKey, [term]);
        }
      }
    }
  }
  return index;
}

let _termIndex: Map<string, SlangTerm[]> | null = null;
let _normalizedTermsCache: Array<{ normalized: string; term: SlangTerm }> | null = null;
const fuzzyCache = new Map<string, { ts: number; items: Array<{ term: SlangTerm; score: number }> }>();
const FUZZY_CACHE_TTL_MS = 5 * 60 * 1000;
function getTermIndex(): Map<string, SlangTerm[]> {
  if (!_termIndex) _termIndex = buildTermIndex();
  return _termIndex;
}

function getNormalizedTermsCache(): Array<{ normalized: string; term: SlangTerm }> {
  if (_normalizedTermsCache) return _normalizedTermsCache;
  _normalizedTermsCache = SLANG_DATA.map((term) => ({
    normalized: normalize(term.term),
    term,
  }));
  return _normalizedTermsCache;
}

/** Look up a term in the index (exact or fuzzy). */
function lookupTerm(query: string): SlangTerm[] {
  const index = getTermIndex();
  const normalized = normalize(query);

  // Exact match
  const exact = index.get(normalized);
  if (exact && exact.length > 0) return exact;

  // Contains match: term contains query (avoid reverse match to reduce false positives)
  const contains: SlangTerm[] = [];
  if (normalized.length < 3) return [];
  for (const [key, terms] of index.entries()) {
    if (key.includes(normalized)) {
      contains.push(...terms);
    }
  }
  if (contains.length > 0) return contains.slice(0, 5);

  return [];
}

/** Look up multiple terms from a phrase. */
function lookupMultipleTerms(phrase: string): Map<string, SlangTerm> {
  const index = getTermIndex();
  const words = normalize(phrase).split(" ");
  const found = new Map<string, SlangTerm>();

  // Try multi-word phrases first (up to 4 words)
  for (let len = 4; len >= 2; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const chunk = words.slice(i, i + len).join(" ");
      const match = index.get(chunk);
      if (match && match.length > 0 && !found.has(normalize(match[0].term))) {
        found.set(normalize(match[0].term), match[0]);
      }
    }
  }

  // Then single words
  for (const word of words) {
    if (word.length < 2) continue;
    if (found.has(word)) continue;
    const match = index.get(word);
    if (match && match.length > 0) {
      found.set(word, match[0]);
    }
  }

  return found;
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

function findClosestTermsWithScore(query: string, limit = 5): Array<{ term: SlangTerm; score: number }> {
  const normalizedQuery = normalize(query);
  const cacheKey = `${normalizedQuery}:${limit}`;
  const cached = fuzzyCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < FUZZY_CACHE_TTL_MS) {
    return cached.items;
  }

  const pool = getNormalizedTermsCache();
  const firstChar = normalizedQuery[0];
  const candidates = pool.filter((entry) => entry.normalized[0] === firstChar || Math.abs(entry.normalized.length - normalizedQuery.length) <= 3);
  const ranked = (candidates.length > 0 ? candidates : pool).map((entry) => ({
    term: entry.term,
    score: levenshtein(normalizedQuery, entry.normalized),
  }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  fuzzyCache.set(cacheKey, { ts: Date.now(), items: ranked });
  if (fuzzyCache.size > 500) {
    const entries = Array.from(fuzzyCache.entries()).sort((a, b) => a[1].ts - b[1].ts);
    for (const [key] of entries.slice(0, entries.length - 500)) fuzzyCache.delete(key);
  }
  return ranked;
}

function findClosestTerms(query: string, limit = 5): SlangTerm[] {
  return findClosestTermsWithScore(query, limit).map((x) => x.term);
}

function confidenceLabel(term: SlangTerm): string {
  if (term.popularityStatus === "ativo" || term.popularityStatus === "regional") return "alta";
  if (term.popularityStatus === "em_queda") return "média";
  return "média";
}

// ---------------------------------------------------------------------------
// Response formatters
// ---------------------------------------------------------------------------
function formatTermCard(t: SlangTerm): string {
  const rc = RISK_CONFIG[t.riskLevel];
  const cat = CATEGORIES.find((c) => c.name === t.category);
  const variations = Array.isArray(t.variations) && t.variations.length > 0
    ? `\n- **Variações**: ${t.variations.join(", ")}`
    : "";
  const conversationTip = t.riskLevel === "green"
    ? "Pode tratar como linguagem cotidiana; valide contexto sem alarmismo."
    : t.riskLevel === "yellow"
      ? "Pergunte em tom aberto onde/como foi usada para evitar mal-entendido."
      : t.riskLevel === "orange"
        ? "Converse com calma e peça exemplos reais de uso antes de concluir."
        : "Aborde com acolhimento e combine limites claros de respeito.";

  return `### **"${t.term}"**

- **Resumo rápido**: ${t.adultTranslation}

- **Significado**: ${t.meaning}
- **Tradução para Adultos**: ${t.adultTranslation}
- **Contexto**: ${t.context}
- **Confiança da Base**: ${confidenceLabel(t)}
- **Nível de Risco**: ${rc.label} — ${rc.description}
${t.region ? `- **Região mais comum**: ${t.region}` : ""}
${t.safeExample ? `- **Exemplo**: _"${t.safeExample}"_` : ""}
${cat ? `- **Categoria**: ${cat.icon} ${cat.label}` : ""}
${t.origin ? `- **Origem**: ${t.origin}` : ""}
${variations}
${t.contextNotes ? `\n> 💡 **Orientação**: ${t.contextNotes}` : ""}
\n> 🧭 **Dica para o responsável**: ${conversationTip}`;
}

function formatMultiTermResponse(terms: SlangTerm[]): string {
  if (terms.length === 1) {
    return formatTermCard(terms[0]);
  }

  let response = `Encontrei **${terms.length} gírias** na sua mensagem!\n\n`;
  for (const t of terms) {
    const rc = RISK_CONFIG[t.riskLevel];
    response += `---\n#### **"${t.term}"** ${rc.label === "Sensível" ? "⚠️" : rc.label === "Cautela" ? "🔶" : rc.label === "Atenção" ? "🟡" : "🟢"}\n`;
    response += `- **Significado**: ${t.meaning}\n`;
    response += `- **Tradução**: ${t.adultTranslation}\n`;
    response += `- **Contexto**: ${t.context}\n`;
    response += `- **Risco**: ${rc.label}\n`;
    if (t.safeExample) response += `- **Exemplo**: _"${t.safeExample}"_\n`;
    response += "\n";
  }
  return response;
}

function getCategoryTerms(category: string, limit = 8): SlangTerm[] {
  return SLANG_DATA.filter((t) => t.category === category).slice(0, limit);
}

function getRandomTerms(count: number, category?: string): SlangTerm[] {
  const pool = category
    ? SLANG_DATA.filter((t) => t.category === category)
    : SLANG_DATA;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
function getRegionalHighlights(limit = 10): { region: string; terms: SlangTerm[] }[] {
  const regionalTerms = SLANG_DATA.filter((t) => t.category === "regional");
  const grouped = new Map<string, SlangTerm[]>();

  for (const term of regionalTerms) {
    const regionKey = term.region || "Brasil";
    const current = grouped.get(regionKey) ?? [];
    current.push(term);
    grouped.set(regionKey, current);
  }

  return Array.from(grouped.entries())
    .map(([region, terms]) => ({ region, terms: terms.slice(0, 2) }))
    .sort((a, b) => b.terms.length - a.terms.length)
    .slice(0, limit);
}

function buildPromptBackendHeader(): string {
  return `### Motor de Resposta (versão robusta)\n${PROMPT_BACKEND_RULES.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}`;
}

function groundedOnlyNotice(): string {
  return "🔒 **Resposta ancorada na base local:** uso apenas gírias e metadados já cadastrados no sistema.";
}

function findRegionHint(message: string): string | null {
  const normalized = normalize(message);
  const regionHints: Array<{ pattern: RegExp; region: string }> = [
    { pattern: /\b(norte|para|amazonas|amapa|acre|rondonia|roraima|tocantins)\b/, region: "Norte" },
    { pattern: /\b(nordeste|bahia|ceara|pernambuco|alagoas|sergipe|piaui|maranhao|paraiba|rio grande do norte)\b/, region: "Nordeste" },
    { pattern: /\b(sul|parana|santa catarina|rio grande do sul)\b/, region: "Sul" },
    { pattern: /\b(minas|sudeste|sao paulo|rio de janeiro|espirito santo)\b/, region: "Sudeste" },
    { pattern: /\b(centro oeste|goias|goiania|mato grosso|mato grosso do sul|distrito federal|brasilia)\b/, region: "Centro-Oeste" },
  ];

  const hit = regionHints.find((h) => h.pattern.test(normalized));
  return hit?.region ?? null;
}

function getRegionalTermsByHint(regionHint: string, limit = 6): SlangTerm[] {
  return SLANG_DATA
    .filter((t) => t.category === "regional" && normalize(t.region).includes(normalize(regionHint)))
    .slice(0, limit);
}


// ---------------------------------------------------------------------------
// Intent detection & response generation
// ---------------------------------------------------------------------------
type Intent =
  | "single_term_lookup"
  | "phrase_translation"
  | "category_explore"
  | "random_terms"
  | "how_many_terms"
  | "what_is_giria_ai"
  | "greeting"
  | "thanks"
  | "help"
  | "out_of_scope"
  | "general_question";

type ChatResponseMode = "default" | "single" | "list";
const CHAT_RESPONSE_MODES: ChatResponseMode[] = ["default", "single", "list"];

function detectIntent(message: string): {
  intent: Intent;
  extractedTerms: string[];
  category?: string;
} {
  const normalized = normalize(message);
  const words = normalized.split(" ").filter((w) => w.length > 1);

  // Remove common stop words from term extraction
  const stopWords = new Set([
    "o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da",
    "dos", "das", "em", "no", "na", "nos", "nas", "por", "para", "com",
    "que", "quem", "como", "onde", "quando", "porque", "se", "mas",
    "e", "ou", "nao", "nao", "sim", "tambem", "muito", "pouco",
    "este", "esta", "esse", "essa", "isso", "isto", "aquilo",
    "meu", "minha", "seu", "sua", "nosso", "nossa",
    "ser", "estar", "ter", "fazer", "dizer", "saber", "poder", "querer",
    "significa", "significado", "oq", "q", "eh", "vc", "voce",
    "pai", "mae", "filho", "filha", "crianca", "adolescente",
    "tudo", "bem", "sobre", "tipo", "alguma", "coisa", "fala",
    "disse", "falou", "ouvi", "entendi", "entender",
    "essa", "essa", "esse", "este", "esta", "estas",
    "traduza", "traduz", "explique", "explicar", "conte",
    "quantas", "quantos", "qual", "quais", "quais",
    "ja", "ja", "ainda", "sempre", "nunca",
  ]);

  const meaningfulWords = words.filter((w) => !stopWords.has(w));
  const index = getTermIndex();

  // Greeting
  if (
    /^(oi|ola|hey|eai|eaí|fala|salve|bom dia|boa tarde|boa noite|hello|hi|sup)/.test(
      normalized
    )
  ) {
    return { intent: "greeting", extractedTerms: [] };
  }

  // Thanks
  if (
    /^(obrigad|valeu|thanks|vlw|agradec|muito obrig)/.test(normalized)
  ) {
    return { intent: "thanks", extractedTerms: [] };
  }

  // Help
  if (
    /^(help|ajuda|como usar|o que voce faz|voce faz|funciona|posso)/.test(normalized)
  ) {
    return { intent: "help", extractedTerms: [] };
  }

  // What is Gíria AI
  if (
    normalized.includes("giria ai") ||
    normalized.includes("giriaai") ||
    (normalized.includes("voce") &&
      (normalized.includes("quem") || normalized.includes("o que")) &&
      normalized.includes("ia"))
  ) {
    return { intent: "what_is_giria_ai", extractedTerms: [] };
  }

  // How many terms
  if (
    normalized.includes("quantas gírias") ||
    normalized.includes("quantos termos") ||
    normalized.includes("quantas girias") ||
    normalized.includes("total de termos") ||
    normalized.includes("tamanho do dicionario") ||
    normalized.includes("quantidade")
  ) {
    return { intent: "how_many_terms", extractedTerms: [] };
  }

  // Category exploration
  const categoryKeywords: Record<string, string> = {
    gaming: "gaming|games|jogos|game|esports|e-sports",
    dinheiro: "dinheiro|grana|money|rico|fortuna",
    esporte: "esporte|futebol|basquete|esports",
    redes_sociais: "redes sociais|tiktok|instagram|twitter|social",
    elogio: "elogio|elogios|cumprimento|positivo",
    saudacao: "saudacao|saudacoes|cumprimento|oi|ola",
    zoeira: "zoeira|zoeiras|brincadeira|humor|piada",
    meme: "meme|memes|internet|viral",
    abreviacao: "abreviacao|abreviacoes|sigla|siglas",
    humor: "humor|engracado|comedia",
    regional: "regional|regiao|estado|cidade",
    bullying: "bullying|bullying|maldade",
    alerta_emocional: "emocional|sentimento|depressao|ansiedade|mental",
    flerte: "flerte|flertar|paquera|namoro|crush",
    ironia: "ironia|sarcastico|sarcastica",
    provocacao: "provocacao|treta|briga|conflito",
  };

  for (const [cat, pattern] of Object.entries(categoryKeywords)) {
    if (new RegExp(pattern).test(normalized)) {
      // Check if user just wants category info vs looking for a specific term
      const categoryTerms = meaningfulWords.filter((w) => index.has(w));
      if (categoryTerms.length === 0) {
        return { intent: "category_explore", extractedTerms: [], category: cat };
      }
    }
  }

  // Random terms request
  if (
    normalized.includes("aleatorio") ||
    normalized.includes("random") ||
    normalized.includes("surpreenda") ||
    normalized.includes("surpresa") ||
    normalized.includes("nao sei") ||
    normalized.includes("me ensina") ||
    normalized.includes("aprenda")
  ) {
    return { intent: "random_terms", extractedTerms: [] };
  }

  // Extract quoted terms
  const quotedTerms = message.match(/[''""][^'""]+[''""]/g)?.map((t) =>
    t.replace(/[''""]/g, "").trim()
  );

  // Try to find slang terms in the message
  const foundTerms: string[] = [];

  // Check quoted terms first
  if (quotedTerms) {
    for (const qt of quotedTerms) {
      const results = lookupTerm(qt);
      if (results.length > 0) foundTerms.push(qt);
    }
  }

  // Check meaningful words and multi-word combinations
  if (foundTerms.length === 0) {
    // Try all words and 2-3 word combos against the index
    const checked = new Set<string>();

    for (let len = Math.min(5, words.length); len >= 1; len--) {
      for (let i = 0; i <= words.length - len; i++) {
        const chunk = words.slice(i, i + len).join(" ");
        if (checked.has(chunk)) continue;
        checked.add(chunk);

        if (index.has(chunk)) {
          const existing = index.get(chunk)!;
          if (existing.length > 0) {
            foundTerms.push(existing[0].term);
          }
        }
      }
    }

    // Also try meaningful words for fuzzy match
    for (const word of meaningfulWords) {
      if (word.length < 4) continue;
      if (foundTerms.some((f) => normalize(f) === normalize(word))) continue;
      const results = lookupTerm(word);
      if (results.length > 0) {
        const best = results[0];
        const normalizedWord = normalize(word);
        const normalizedBest = normalize(best.term);
        if (normalizedBest.includes(normalizedWord) || normalizedWord.includes(normalizedBest)) {
          foundTerms.push(best.term);
        }
      }
    }
  }

  // Determine intent based on how many terms found
  if (foundTerms.length > 1) {
    return { intent: "phrase_translation", extractedTerms: foundTerms };
  } else if (foundTerms.length === 1) {
    return { intent: "single_term_lookup", extractedTerms: foundTerms };
  }

  // General question about slang/linguagem
  if (
    normalized.includes("giria") ||
    normalized.includes("linguagem") ||
    normalized.includes("adolescente") ||
    normalized.includes("jovem") ||
    normalized.includes("internet") ||
    normalized.includes("tiktok") ||
    normalized.includes("geracao")
  ) {
    return { intent: "general_question", extractedTerms: [] };
  }

  return { intent: "out_of_scope", extractedTerms: [] };
}

// ---------------------------------------------------------------------------
// Response builder
// ---------------------------------------------------------------------------
function buildResponse(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  const { intent, extractedTerms, category } = detectIntent(message);
  const regionHint = findRegionHint(message);
  const contextHeader = buildPromptBackendHeader();
  const lastUserMessage = [...conversationHistory].reverse().find((m) => m.role === "user")?.content;
  const hasFollowUp = /^(e\s|e se|mas e|continua|aprofunda|detalha|expande)/.test(normalize(message));
  const lastAssistantMessage = [...conversationHistory]
    .reverse()
    .find((m) => m.role === "assistant")?.content;

  const isContextualFollowUp = /^(e\s|e se|mas|isso|esse|essa|ele|ela|dela|dele|desse|dessa|nisso|nela|nele)/.test(
    normalize(message)
  );
  const quotedTerm = message.match(/[''""]([^'""]+)[''""]/)?.[1]?.trim();

  switch (intent) {
    case "greeting":
      return `Oi! 👋 Eu sou o **Gíria AI**, seu assistente especializado em gírias e linguagem da internet brasileira!

Posso te ajudar com:
- 🔍 **Traduzir gírias** — digite qualquer termo ou frase
- 📖 **Explicar o significado** — com contexto e nível de risco
- 🎮 **Explorar categorias** — gaming, funk, TikTok, dinheiro...
- 🎲 **Descobrir gírias novas** — peça termos aleatórios

Tente perguntar algo como: *"O que significa 'farmar aura'?"* ou *"Meu filho disse 'gag', o que é isso?"*`;

    case "thanks":
      return `De nada! 😊 Estou aqui sempre que precisar entender o que os jovens estão falando. Se ouvir alguma gíria estranha, é só perguntar!`;

    case "help":
      return `${contextHeader}
${groundedOnlyNotice()}

## Como posso ajudar? 💡

Você pode me perguntar de várias formas:

1. **"O que significa [gíria]?"** — Explico o termo com contexto e risco
2. **"Traduza: [frase com gírias]"** — Identifico e traduzo cada gíria
3. **"Me ensine gírias de gaming"** — Mostro termos por categoria
4. **"Me surpreenda!"** — Te mostro gírias aleatórias
5. **"Quantas gírias você conhece?"** — Informo o tamanho do dicionário

### Exemplos:
- *"O que é 'delulu'?"*
- *"Meu filho disse 'sigma grindset'"*
- *"Traduza: mano aquele fit tava crack slayou demais"*
- *"Quais gírias de TikTok devo conhecer?"*`;

    case "what_is_giria_ai":
      return `## O que é o Gíria AI? 🤖

Eu sou um **assistente especializado em gírias, expressões e linguagem da internet brasileira**, criado para ajudar **pais, educadores e adultos** a entender o que adolescentes e jovens estão dizendo.

### O que eu faço:
- 🔍 **Traduzo gírias** com explicações claras e objetivas
- ⚠️ **Avalio riscos** — classifico cada termo por nível de preocupação
- 📖 **Forneço contexto** — explico onde, quando e por que cada gíria é usada
- 🌍 **Cubro a cultura brasileira** — funk, gaming, TikTok, regionalismos e mais

### Nosso dicionário:
- **${SLANG_DATA.length.toLocaleString("pt-BR")}+ termos** catalogados
- Atualizado com as gírias mais recentes de 2024/2025
- Cobrimos **${CATEGORIES.length} categorias** diferentes

Diga: "Me surpreenda!" para conhecer algumas gírias! 🚀`;

    case "how_many_terms":
      return `## Nosso Dicionário 📚

Nosso banco de dados possui **${SLANG_DATA.length.toLocaleString("pt-BR")}+ termos** únicos de gírias e expressões!

### Distribuição por nível de risco:
${(
  ["green", "yellow", "orange", "red"] as RiskLevel[]
)
  .map((level) => {
    const count = SLANG_DATA.filter((t) => t.riskLevel === level).length;
    const rc = RISK_CONFIG[level];
    const emoji = level === "green" ? "🟢" : level === "yellow" ? "🟡" : level === "orange" ? "🟠" : "🔴";
    return `- ${emoji} **${rc.label}**: ${count} termos`;
  })
  .join("\n")}

### Categorias principais:
${CATEGORIES.slice(0, 12)
  .map((c) => {
    const count = SLANG_DATA.filter((t) => t.category === c.name).length;
    return count > 0 ? `- ${c.icon} **${c.label}**: ${count}` : null;
  })
  .filter(Boolean)
  .join("\n")}

Quer explorar alguma categoria? É só perguntar! 😊`;

    case "single_term_lookup": {
      const requestedTerm = quotedTerm || extractedTerms[0];
      const results = lookupTerm(requestedTerm);
      if (results.length === 0) {
        // Try fuzzy
        const fuzzyResults = lookupMultipleTerms(message);
        if (fuzzyResults.size > 0) {
          const terms = Array.from(fuzzyResults.values());
          return `Não encontrei "${extractedTerms[0]}" exatamente, mas encontrei algo similar:\n\n${formatMultiTermResponse(terms)}`;
        }
        const ranked = findClosestTermsWithScore(requestedTerm, 4);
        const closest = ranked.map((item) => item.term);
        const bestScore = ranked[0]?.score ?? 999;
        const confidence = Math.max(0.2, Math.min(0.85, 1 - (bestScore / Math.max(4, normalize(requestedTerm).length))));
        if (confidence < 0.65 && closest.length > 0) {
          return `Não tenho confiança suficiente para afirmar com segurança. 🤝

Você quis dizer uma destas opções?
- ${closest.map((t) => `"${t.term}"`).join("\n- ")}

Se nenhuma for correta, envie a nova gíria aqui: ${SUGGESTION_PAGE_LINK}`;
        }
        const strictThreshold = Math.max(2, Math.floor(normalize(requestedTerm).length * 0.35));
        const disambiguationPrompt = bestScore <= strictThreshold
          ? `Antes de concluir, confirma se era uma dessas?\n- ${closest.map((t) => `"${t.term}"`).join("\n- ")}`
          : "";

        return `Hmm, não encontrei a gíria **"${requestedTerm}"** no nosso dicionário de ${SLANG_DATA.length.toLocaleString("pt-BR")}+ termos. 😔

Algumas possibilidades:
1. **Verifique a grafia** — pode ser uma variação diferente
2. **Pode ser muito nova** — gírias surgem todo dia no TikTok
3. **Pode ser regional** — algumas gírias são específicas de certas regiões

${closest.length > 0 ? `Talvez você quis dizer: ${closest.map((t) => `"${t.term}"`).join(", ")}.` : ""}
${disambiguationPrompt}
Se não estiver na base ainda, você pode enviar essa gíria aqui: ${SUGGESTION_PAGE_LINK}
Tente pesquisar uma gíria similar ou me pergunte sobre outra!`;
      }
      return `${groundedOnlyNotice()}\n\n${formatTermCard(results[0])}`;
    }

    case "phrase_translation": {
      const found = lookupMultipleTerms(message);
      if (found.size === 0) {
        return `Não identifiquei gírias conhecidas nessa frase. Tente digitar os termos individualmente, como:

- *"O que significa [gíria]?"*
- *"Explique [termo]"*

Nosso dicionário tem ${SLANG_DATA.length.toLocaleString("pt-BR")}+ termos cadastrados! 📚
Se quiser, você pode sugerir a gíria ausente aqui: ${SUGGESTION_PAGE_LINK}`;
      }
      const terms = Array.from(found.values());
      const response = formatMultiTermResponse(terms);
      return hasFollowUp
        ? `${groundedOnlyNotice()}\n\n${response}\n### Próximo passo\nPosso aprofundar contexto social, risco e alternativa segura de cada termo.`
        : `${groundedOnlyNotice()}\n\n${response}`;
    }

    case "category_explore": {
      const cat = category ?? "saudacao";
      const catInfo = CATEGORIES.find((c) => c.name === cat);
      const terms = getCategoryTerms(cat, 8);
      if (terms.length === 0) {
        // Fallback to random
        const randomTerms = getRandomTerms(6);
        return `Essa categoria ainda não tem muitos termos. Aqui estão algumas gírias populares:\n\n${formatMultiTermResponse(randomTerms)}`;
      }
      if (cat === "regional") {
        const regionFocused = regionHint ? getRegionalTermsByHint(regionHint, 6) : [];
        const highlights = getRegionalHighlights();
        const byRegion = highlights
          .map((group) => `- **${group.region}**: ${group.terms.map((t) => `"${t.term}"`).join(", ")}`)
          .join("\n");

        return `## 🗺️ Gírias Regionais

Perfeito! Já temos uma base regional bem útil e podemos ampliar continuamente com sugestões da comunidade.

### Panorama atual por região:
${byRegion}

### Exemplos para começar:
${formatMultiTermResponse(terms)}

${regionFocused.length > 0 ? `### Recorte detectado: ${regionHint}\n${formatMultiTermResponse(regionFocused)}\n` : ""}
Se quiser, eu também posso montar uma trilha por estado (ex.: "só Nordeste" ou "só Sul").`;
      }
      return `## ${catInfo?.icon ?? "💬"} ${catInfo?.label ?? cat}\n\nAqui estão algumas gírias dessa categoria:\n\n${formatMultiTermResponse(terms)}\n\nQuer saber mais sobre alguma delas? É só perguntar! 🎯`;
    }

    case "random_terms": {
      const terms = getRandomTerms(5);
      return `## 🎲 Gírias Aleatórias\n\nAqui vão 5 gírias para você conhecer:\n\n${formatMultiTermResponse(terms)}\n\nQuer mais? É só pedir! Ou pergunte sobre qualquer uma delas em detalhes. 😊`;
    }

    case "general_question": {
      const trendingTerms = getRandomTerms(4);
      return `## Sobre a Linguagem Jovem Brasileira 🇧🇷

${groundedOnlyNotice()}

A linguagem dos adolescentes brasileiros é **incrivelmente dinâmica**, misturando:
- 🎵 **Influências de música e cultura urbana**
- 🌐 **Termos de internet e plataformas sociais**
- 🎮 **Cultura gamer**
- 📱 **Abreviações e linguagem de conversa**
- 🗺️ **Regionalismos brasileiros**

### Gírias em alta agora:
${trendingTerms
  .map(
    (t) =>
      `- **"${t.term}"** — ${t.meaning} (${RISK_CONFIG[t.riskLevel].label})`
  )
  .join("\n")}

O melhor jeito de entender é **praticando**! Digite qualquer gíria que ouviu e eu explico tudo. 😊`;
    }

    case "out_of_scope":
    default: {
      if (isContextualFollowUp && lastAssistantMessage) {
        const previousTerms = lookupMultipleTerms(lastAssistantMessage);
        const previousCandidates = Array.from(previousTerms.values());

        if (previousCandidates.length > 1) {
          const top = previousCandidates.slice(0, 3).map((t) => `"${t.term}"`).join(", ");
          return `Entendi seu follow-up 👍 Antes de continuar, só quero confirmar a qual termo você se refere.

Detectei mais de uma gíria na resposta anterior: ${top}.
Me diga qual delas você quer aprofundar e eu trago significado, contexto e orientação prática.`;
        }

        const previous = previousCandidates[0];
        if (previous) {
          const rc = RISK_CONFIG[previous.riskLevel];
          return `Boa continuação — pela conversa anterior, você parece estar falando de **"${previous.term}"**.

### Leitura rápida
- **Significado**: ${previous.meaning}
- **Contexto**: ${previous.context}
- **Risco**: ${rc.label} (${rc.description})

### Como responder como adulto (tom calmo)
1. Valide sem confronto: _"Entendi, me explica como vocês usam isso?"_
2. Faça pergunta aberta: _"Quando essa expressão aparece mais?"_
3. Alinhe limite com cuidado, se necessário: _"Aqui em casa a gente usa sem ofender ninguém, combinado?"_

Se quiser, eu monto uma resposta pronta para WhatsApp com linguagem de pai/mãe.`;
        }
      }

      // Try one more time to find terms
      const lastAttempt = lookupMultipleTerms(message);
      if (lastAttempt.size > 0) {
        const terms = Array.from(lastAttempt.values());
        return formatMultiTermResponse(terms);
      }

      return `Hmm, não tenho certeza sobre isso. 😅

${groundedOnlyNotice()}

Sou especialista em **gírias e linguagem da internet brasileira**. Tente me perguntar sobre:

- 🔍 **Uma gíria específica** — *"O que significa 'rizz'?"*
- 💬 **Uma frase** — *"Traduza: aquele cara é muito crack"*
- 📂 **Uma categoria** — *"Me ensina gírias de gaming"*
- 🎲 **Surpresa** — *"Me surpreenda com gírias novas!"*

Nosso dicionário tem **${SLANG_DATA.length.toLocaleString("pt-BR")}+ termos** — posso ajudar com muita coisa! 🚀
Se o termo não estiver na base, você pode sugerir aqui: ${SUGGESTION_PAGE_LINK}
${lastUserMessage ? `\nSe quiser, posso continuar da sua última pergunta: _"${lastUserMessage}"_.` : ""}`;
    }
  }
}

function buildGroundingMetadata(message: string): {
  grounded: boolean;
  candidates: string[];
  suggestionLink?: string;
  intent: Intent;
  confidence: number;
  threshold: number;
} {
  const { intent, extractedTerms } = detectIntent(message);
  const threshold = INTENT_CONFIDENCE_THRESHOLD[intent] ?? 0.5;

  if (intent === "single_term_lookup" && extractedTerms.length > 0) {
    const term = extractedTerms[0];
    const exact = lookupTerm(term);
    if (exact.length > 0) {
      return { grounded: true, candidates: exact.slice(0, 3).map((t) => t.term), intent, confidence: 0.98, threshold };
    }
    const ranked = findClosestTermsWithScore(term, 3);
    const closest = ranked.map((item) => item.term.term);
    const bestScore = ranked[0]?.score ?? 999;
    const confidence = Math.max(0.2, Math.min(0.85, 1 - (bestScore / Math.max(4, normalize(term).length))));
    return { grounded: false, candidates: closest, suggestionLink: SUGGESTION_PAGE_LINK, intent, confidence: Number(confidence.toFixed(2)), threshold };
  }

  if (intent === "phrase_translation") {
    const terms = Array.from(lookupMultipleTerms(message).values());
    if (terms.length > 0) {
      return { grounded: true, candidates: terms.slice(0, 5).map((t) => t.term), intent, confidence: 0.9, threshold };
    }
  }

  return { grounded: false, candidates: [], suggestionLink: SUGGESTION_PAGE_LINK, intent, confidence: 0.45, threshold };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return withSecurityHeaders(NextResponse.json(
        { error: "Muitas requisições. Aguarde um momento." },
        { status: 429 }
      ));
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return withSecurityHeaders(NextResponse.json(
        { error: "JSON inválido no corpo da requisição." },
        { status: 400 }
      ));
    }
    const {
      messages,
      message,
      history,
      onlyChatResponse,
      listChatResponses,
      responseMode,
    } = body as {
      messages?: Array<{ role: string; content: string }>;
      message?: string;
      history?: Array<{ role: string; content: string }>;
      onlyChatResponse?: boolean;
      listChatResponses?: boolean;
      responseMode?: ChatResponseMode;
    };

    if (messages !== undefined && !Array.isArray(messages)) {
      return withSecurityHeaders(NextResponse.json(
        { error: "`messages` deve ser um array de mensagens." },
        { status: 400 }
      ));
    }

    if (history !== undefined && !Array.isArray(history)) {
      return withSecurityHeaders(NextResponse.json(
        { error: "`history` deve ser um array de mensagens." },
        { status: 400 }
      ));
    }

    if (responseMode !== undefined && !CHAT_RESPONSE_MODES.includes(responseMode)) {
      return withSecurityHeaders(NextResponse.json(
        { error: "`responseMode` deve ser: default, single ou list." },
        { status: 400 }
      ));
    }

    const usesLegacyFlags = onlyChatResponse === true || listChatResponses === true;

    if (responseMode !== undefined && usesLegacyFlags) {
      return withSecurityHeaders(NextResponse.json(
        { error: "Use apenas `responseMode` ou as flags legadas (`onlyChatResponse`/`listChatResponses`)." },
        { status: 400 }
      ));
    }

    if (onlyChatResponse === true && listChatResponses === true) {
      return withSecurityHeaders(NextResponse.json(
        { error: "`onlyChatResponse` e `listChatResponses` não podem ser true ao mesmo tempo." },
        { status: 400 }
      ));
    }

    // Support both `messages` (array) and `message` (string) formats
    const allMessages = messages ?? history ?? [];
    const currentMessage = sanitizeUserInput(message ?? allMessages[allMessages.length - 1]?.content ?? "", MAX_MESSAGE_LENGTH);

    if (!currentMessage || typeof currentMessage !== "string") {
      return withSecurityHeaders(NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      ));
    }

    if (currentMessage.length > MAX_MESSAGE_LENGTH) {
      return withSecurityHeaders(NextResponse.json(
        { error: `Mensagem muito longa. Máximo ${MAX_MESSAGE_LENGTH} caracteres.` },
        { status: 400 }
      ));
    }

    // Build conversation context (last N messages for follow-up)
    const recentHistory = allMessages
      .slice(-MAX_MESSAGES_TO_SEND)
      .filter((m) => m.role && m.content);

    // Generate response — no external API needed!
    const response = buildResponse(currentMessage, recentHistory);

    // Try to extract slang data from the response for rich UI
    let slangData: {
      slang?: string;
      category?: string;
      meaning?: string;
      synonyms?: string[];
    } = {};

    const { extractedTerms } = detectIntent(currentMessage);
    if (extractedTerms.length === 1) {
      const results = lookupTerm(extractedTerms[0]);
      if (results.length > 0) {
        const t = results[0];
        slangData = {
          slang: t.term,
          category: t.category,
          meaning: t.meaning,
          synonyms: Array.isArray(t.variations) ? t.variations : [],
        };
      }
    }

    const resolvedMode =
      responseMode ??
      (listChatResponses === true ? "list" : onlyChatResponse === true ? "single" : "default");

    const applyCommonResponseHeaders = (res: NextResponse, mode: ChatResponseMode): NextResponse => {
      res.headers.set("X-Response-Mode", mode);
      return res;
    };

    const applyLegacyDeprecationHeaders = (res: NextResponse): NextResponse => {
      if (usesLegacyFlags) {
        res.headers.set("X-API-Warn", "Legacy chat flags are deprecated. Use responseMode.");
        res.headers.set("Deprecation", "true");
        res.headers.set("Sunset", LEGACY_FLAGS_SUNSET_HTTP_DATE);
        res.headers.set("Link", `<${LEGACY_FLAGS_DEPRECATION_DOC}>; rel="deprecation"`);
      }
      return res;
    };

    if (resolvedMode === "list") {
      const priorAssistantResponses = recentHistory
        .filter((m) => m.role === "assistant")
        .map((m) => m.content);

      const listRes = NextResponse.json({
        mode: resolvedMode,
        responses: [...priorAssistantResponses, response],
      });
      return withSecurityHeaders(applyLegacyDeprecationHeaders(applyCommonResponseHeaders(listRes, resolvedMode)));
    }

    if (resolvedMode === "single") {
      const singleRes = NextResponse.json({ mode: resolvedMode, response });
      return withSecurityHeaders(applyLegacyDeprecationHeaders(applyCommonResponseHeaders(singleRes, resolvedMode)));
    }

    const grounding = buildGroundingMetadata(currentMessage);
    if (grounding.confidence < grounding.threshold && grounding.candidates.length > 0) {
      const confirmResponse = `Não tenho confiança suficiente para responder de forma definitiva ainda. 🤝\n\nVocê quis dizer uma dessas opções?\n- ${grounding.candidates.map((t) => `"${t}"`).join("\n- ")}\n\nSe nenhuma for correta, você pode sugerir nova gíria aqui: ${SUGGESTION_PAGE_LINK}`;
      recordGroundingMetric(false);
      const confirmRes = NextResponse.json({
        mode: resolvedMode,
        response: confirmResponse,
        grounding,
      });
      return withSecurityHeaders(applyLegacyDeprecationHeaders(applyCommonResponseHeaders(confirmRes, resolvedMode)));
    }
    recordGroundingMetric(grounding.grounded);

    const defaultRes = NextResponse.json({
      mode: resolvedMode,
      response,
      grounding,
      ...slangData,
    });
    return withSecurityHeaders(applyLegacyDeprecationHeaders(applyCommonResponseHeaders(defaultRes, resolvedMode)));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor";
    console.error("Chat API error:", message);

    return withSecurityHeaders(NextResponse.json(
      { error: "Ocorreu um erro ao processar sua mensagem. Tente novamente." },
      { status: 500 }
    ));
  }
}
