"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Search,
  Send,
  X,
  BookOpen,
  Users,
  GraduationCap,
  ArrowRight,
  Copy,
  Check,
  Heart,
  Trash2,
  Shield,
  Eye,
  MessageCircle,
  BookMarked,
  Sparkles,
  Zap,
  ChevronRight,
  Bot,
  RotateCcw,
  Share2,
  Shuffle,
  Globe,
  Star,
  Lock,
  HelpCircle,
  ChevronDown,
  HeartHandshake,
  Sun,
  Moon,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import {
  getTerm,
  searchTerms,
  SLANG_DATA,
  CATEGORIES,
  RISK_CONFIG,
  type SlangTerm,
  type RiskLevel,
} from "@/lib/slang-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabId = "busca" | "glossario" | "favoritos" | "comunidade" | "sobre" | "sugestoes" | "apoie";
type AudienceMode = "pais" | "educadores" | "jovens";

interface TranslationResult {
  term: string;
  meaning: string;
  adultTranslation: string;
  context: string;
  riskLevel: RiskLevel;
  riskLabel: string;
  riskColor: string;
  category: string;
  safeExample: string;
  contextNotes: string;
  origin: string;
  variations: string[];
  popularityStatus: string;
  region: string;
  isPhrase: boolean;
  phraseTranslation: string | null;
  phraseMatches: SlangTerm[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FAVORITES_KEY = "giria-ai-favorites";
const SEARCH_HISTORY_KEY = "giria-ai-history";
const PIX_KEY = "007aibr@gmail.com";
const PIX_RECEIVER_NAME = "Lorenza Volponi";
const SUPPORT_AMOUNTS = [5, 10, 25];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTermOfDay(): SlangTerm | null {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % SLANG_DATA.length;
  return SLANG_DATA[index] ?? null;
}

function loadSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

function addToSearchHistory(term: string) {
  const history = loadSearchHistory();
  const filtered = history.filter((h) => h.toLowerCase() !== term.toLowerCase());
  filtered.unshift(term);
  const trimmed = filtered.slice(0, 10);
  saveSearchHistory(trimmed);
}

const POPULAR_TERMS = [
  "cria",
  "slay",
  "calabreso",
  "casca de bala",
  "pdp",
  "rizz",
  "aura",
  "gag",
  "delulu",
  "cringe",
  "tankar",
  "parça",
  "tmj",
  "oxente",
  "tchê",
  "eita",
  "moio",
  "biscoiteiro",
  "btf",
  "pprt",
  "gata",
  "cabuloso",
  "faraônico",
  "farmar aura",
  "mewing",
  "sigma",
  "shippar",
  "bizu",
  "bruh",
  "gg",
  "zoar",
  "gyatt",
  "nerfar",
  "looksmaxxing",
  "mogging",
  "no cap",
  "ghost",
  "top",
  "pookie",
  "bestie",
  "lit",
  "savage",
  "vrum",
  "brutal",
  "crack",
  "cook",
  "love bombing",
  "plim plim",
  "crisp",
  "seloko",
  "pode crer",
  "rage quit",
  "tiltar",
  "main character",
  "skibidi",
  "vibe",
  "tá osso",
  "sigma grindset",
  "nmrl",
  "mlk",
  "fds",
  "cq",
  "mds",
  "obg",
  "goat",
  "glow up",
  "toptier",
  "brabo",
  "miga",
];

const POPULAR_GROUPS = [
  {
    label: "Bombando agora",
    description: "Termos que aparecem em redes, memes e conversas rápidas.",
    emoji: "🔥",
    gradient: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20",
    terms: ["calabreso", "casca de bala", "aura", "rizz", "slay", "delulu"],
  },
  {
    label: "TikTok e Reels",
    description: "Gírias de trend, comentários, creators e cultura pop.",
    emoji: "📱",
    gradient: "from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/30 dark:to-purple-950/20",
    terms: ["cringe", "viralizou", "main character", "glow up", "mewing", "pookie"],
  },
  {
    label: "Escola e resenha",
    description: "Jeito de falar entre amigos, grupos e sala de aula.",
    emoji: "🎒",
    gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20",
    terms: ["pprt", "tmj", "parça", "brabo", "miga", "tá osso"],
  },
  {
    label: "Games e internet",
    description: "Expressões de gameplay, chat, Discord e memes.",
    emoji: "🎮",
    gradient: "from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/20",
    terms: ["tankar", "rage quit", "tiltar", "nerfar", "gg", "goat"],
  },
];

const HERO_CHIPS = ["pprt", "cria", "slay", "tankei", "rizz", "brabo", "miga"];

const SCENARIO_GUIDES: Array<{
  title: string;
  description: string;
  emoji: string;
  query: string;
  mode: AudienceMode;
  accent: string;
}> = [
  {
    title: "Ouvi em casa",
    description: "Roteiro calmo para conversar sem parecer interrogatório.",
    emoji: "🏠",
    query: "pprt esse cria é brabo",
    mode: "pais",
    accent: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20",
  },
  {
    title: "Apareceu na escola",
    description: "Leitura pedagógica para entender uso, tom e convivência.",
    emoji: "🎒",
    query: "cringe e slay na sala",
    mode: "educadores",
    accent: "from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/20",
  },
  {
    title: "Vi num comentário",
    description: "Explicação leve para TikTok, Reels, meme e grupo de amigos.",
    emoji: "📱",
    query: "rizz e delulu",
    mode: "jovens",
    accent: "from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/30 dark:to-purple-950/20",
  },
  {
    title: "Frase com várias gírias",
    description: "Detecta termos conhecidos e separa a tradução por partes.",
    emoji: "🧩",
    query: "rage quit e tiltar no game",
    mode: "pais",
    accent: "from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/20",
  },
];

const AUDIENCE_MODES: Array<{ id: AudienceMode; label: string; emoji: string; description: string }> = [
  {
    id: "pais",
    label: "Pais",
    emoji: "👨‍👩‍👧‍👦",
    description: "tom calmo para conversar em casa",
  },
  {
    id: "educadores",
    label: "Educadores",
    emoji: "🎓",
    description: "leitura pedagógica e de contexto",
  },
  {
    id: "jovens",
    label: "Jovens",
    emoji: "⚡",
    description: "explicação direta, leve e sem julgamento",
  },
];

const RISK_ORDER: Record<RiskLevel, number> = {
  green: 0,
  yellow: 1,
  orange: 2,
  red: 3,
};

function extractTermsFromPhrase(input: string): SlangTerm[] {
  const normalizedInput = input.toLowerCase();
  if (!normalizedInput.includes(" ")) return [];

  return SLANG_DATA
    .filter((item) => item.term.length >= 3 && normalizedInput.includes(item.term.toLowerCase()))
    .sort((a, b) => b.term.length - a.term.length)
    .slice(0, 6);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getCategoryLabel(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.label ?? name;
}

function getCategoryIcon(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.icon ?? "💬";
}

function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "O que significa 'six' e 'seven' no funk?",
  "Meu filho disse 'farmar aura', o que é isso?",
  "O que é 'delulu' e 'rizz'?",
  "Explique 'mewing' e 'looksmaxxing'",
  "O que significa 'sigma grindset'?",
  "Meu filho disse 'gag', é preocupante?",
  "O que é 'situationship'?",
  "Explique 'love bombing' e 'red flag'",
];

export default function GiriaApp() {
  // Theme
  const { theme, setTheme } = useTheme();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>("busca");
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("pais");

  // Busca state
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixFeedback, setPixFeedback] = useState<string | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());

  // Search history state
  const [searchHistory, setSearchHistory] = useState<string[]>(() => loadSearchHistory());

  // Glossário state
  const [glossarySearch, setGlossarySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [communityItems, setCommunityItems] = useState<Array<{ id: string; term: string; meaning: string; context?: string; score: number; submitterName: string }>>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const loadCommunity = useCallback(async () => {
    setCommunityLoading(true);
    const res = await fetch("/api/v1/suggestions?status=approved&limit=60", { cache: "no-store" }).catch(() => null);
    setCommunityLoading(false);
    if (!res?.ok) return;
    const data = (await res.json().catch(() => ({}))) as { items?: Array<{ id: string; term: string; meaning: string; context?: string; score: number; submitterName: string }> };
    if (Array.isArray(data.items)) setCommunityItems(data.items);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCommunity();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadCommunity]);

  useEffect(() => {
    if (activeTab !== "comunidade") return;
    const id = setInterval(() => {
      void loadCommunity();
    }, 60000);
    return () => clearInterval(id);
  }, [activeTab, loadCommunity]);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Term of the day (deterministic)
  const termOfDay = getTermOfDay();

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Auto-scroll chat to bottom when chat is open
  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading, chatOpen]);

  // Focus chat input when popup opens
  useEffect(() => {
    if (chatOpen && chatInputRef.current) {
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  }, [chatOpen]);

  // Keyboard shortcut: "/" to focus search (when not typing in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        activeTab === "busca" &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // ---- Chat send handler ----
  const handleChatSend = useCallback(
    async (message?: string) => {
      const content = (message ?? chatInput).trim();
      if (!content || chatLoading) return;

      const userMsg: ChatMessage = { role: "user", content };
      const updatedMessages = [...chatMessages, userMsg];
      setChatMessages(updatedMessages);
      setChatInput("");
      setChatLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });
        const data = await res.json();
        if (data.response) {
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response },
          ]);
        } else {
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." },
          ]);
        }
      } catch {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Erro de conexão. Verifique sua internet e tente novamente." },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [chatInput, chatMessages, chatLoading]
  );

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  // ---- Favorites helpers ----
  const toggleFavorite = useCallback((term: string) => {
    setFavorites((prev) => {
      const next = prev.includes(term)
        ? prev.filter((f) => f !== term)
        : [...prev, term];
      saveFavorites(next);
      return next;
    });
  }, []);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory([]);
  }, []);

  const isFavorited = useCallback(
    (term: string) => favorites.includes(term),
    [favorites]
  );

  // ---- Translate handler ----
  const handleTranslate = useCallback(
    async (query?: string) => {
      const q = (query ?? searchQuery).trim();
      if (!q) return;
      setIsLoading(true);
      setTranslationResult(null);

      try {
        // Try local lookup first for full data
        const local = getTerm(q.toLowerCase());
        if (local) {
          const rc = RISK_CONFIG[local.riskLevel];
          setTranslationResult({
            term: local.term,
            meaning: local.meaning,
            adultTranslation: local.adultTranslation,
            context: local.context,
            riskLevel: local.riskLevel,
            riskLabel: rc.label,
            riskColor: local.riskLevel,
            category: local.category,
            safeExample: local.safeExample,
            contextNotes: local.contextNotes,
            origin: local.origin,
            variations: Array.isArray(local.variations) ? local.variations : [],
            popularityStatus: local.popularityStatus,
            region: local.region,
            isPhrase: local.term.includes(" "),
            phraseTranslation: local.term.includes(" ")
              ? local.adultTranslation
              : null,
            phraseMatches: [],
          });
          addToSearchHistory(local.term);
          setSearchHistory(loadSearchHistory());
          setIsLoading(false);
          return;
        }

        const phraseMatches = extractTermsFromPhrase(q);
        if (phraseMatches.length > 0) {
          const highestRisk = phraseMatches.reduce<RiskLevel>((highest, term) =>
            RISK_ORDER[term.riskLevel] > RISK_ORDER[highest] ? term.riskLevel : highest,
          phraseMatches[0].riskLevel);
          const rc = RISK_CONFIG[highestRisk];
          const summary = phraseMatches.map((term) => `"${term.term}" = ${term.adultTranslation}`).join("; ");

          setTranslationResult({
            term: q,
            meaning: `Detectei ${phraseMatches.length} gíria${phraseMatches.length > 1 ? "s" : ""} na frase: ${phraseMatches.map((term) => term.term).join(", ")}.`,
            adultTranslation: summary,
            context: "Esta frase mistura termos do glossário. Veja abaixo a leitura individual de cada expressão antes de tirar conclusões.",
            riskLevel: highestRisk,
            riskLabel: rc.label,
            riskColor: highestRisk,
            category: "frase",
            safeExample: q,
            contextNotes: "Quando a frase tem várias gírias, o sentido depende do tom, da relação entre as pessoas e do ambiente onde foi dita.",
            origin: "Frase analisada a partir de termos conhecidos no glossário Gíria AI.",
            variations: phraseMatches.flatMap((term) => Array.isArray(term.variations) ? term.variations.slice(0, 2) : []).slice(0, 8),
            popularityStatus: "contextual",
            region: "Brasil",
            isPhrase: true,
            phraseTranslation: summary,
            phraseMatches,
          });
          addToSearchHistory(q);
          setSearchHistory(loadSearchHistory());
          setIsLoading(false);
          return;
        }

        // Fallback to search
        const fuzzyResults = searchTerms(q.toLowerCase());
        if (fuzzyResults.length > 0) {
          const local = fuzzyResults[0];
          const rc = RISK_CONFIG[local.riskLevel];
          setTranslationResult({
            term: local.term,
            meaning: local.meaning,
            adultTranslation: local.adultTranslation,
            context: local.context,
            riskLevel: local.riskLevel,
            riskLabel: rc.label,
            riskColor: local.riskLevel,
            category: local.category,
            safeExample: local.safeExample,
            contextNotes: local.contextNotes,
            origin: local.origin,
            variations: Array.isArray(local.variations) ? local.variations : [],
            popularityStatus: local.popularityStatus,
            region: local.region,
            isPhrase: local.term.includes(" "),
            phraseTranslation: local.term.includes(" ")
              ? local.adultTranslation
              : null,
            phraseMatches: [],
          });
          addToSearchHistory(local.term);
          setSearchHistory(loadSearchHistory());
          setIsLoading(false);
          return;
        }

        // Not found in local dictionary — show not-found result with AI suggestion
        setTranslationResult({
          term: q,
          meaning: `Gíria "${q}" não encontrada no nosso dicionário.`,
          adultTranslation: `Não temos tradução para "${q}" ainda.`,
          context: "Tente verificar a grafia ou busque uma gíria similar.",
          riskLevel: "yellow" as RiskLevel,
          riskLabel: RISK_CONFIG.yellow.label,
          riskColor: "yellow",
          category: "outros",
          safeExample: "",
          contextNotes: `Nosso dicionário é atualizado regularmente. Em breve esta gíria pode estar disponível!\n\n💡 Dica: Pergunte ao Chat IA — ele pode conhecer essa gíria!`,
          origin: "",
          variations: [],
          popularityStatus: "desconhecido",
          region: "Brasil",
          isPhrase: q.includes(" "),
          phraseTranslation: null,
          phraseMatches: [],
        });
      } catch (err) {
        console.error("Translate error:", err);
        setTranslationResult({
          term: q,
          meaning: `Erro ao buscar "${q}".`,
          adultTranslation: "Ocorreu um erro inesperado.",
          context: "Tente novamente ou use o Chat IA.",
          riskLevel: "yellow" as RiskLevel,
          riskLabel: RISK_CONFIG.yellow.label,
          riskColor: "yellow",
          category: "outros",
          safeExample: "",
          contextNotes: "Se o erro persistir, tente recarregar a página.",
          origin: "",
          variations: [],
          popularityStatus: "desconhecido",
          region: "Brasil",
          isPhrase: q.includes(" "),
          phraseTranslation: null,
          phraseMatches: [],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery]
  );

  // ---- Search from chip / glossário / favorito ----
  const searchAndGo = useCallback(
    (term: string) => {
      setSearchQuery(term);
      setActiveTab("busca");
      // Use setTimeout to let the tab switch render, then translate
      setTimeout(() => handleTranslate(term), 50);
    },
    [handleTranslate]
  );

  // ---- Copy to clipboard ----
  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
      }
    },
    []
  );

  const handleCopyPix = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setPixCopied(true);
      setPixFeedback("Chave PIX copiada com sucesso.");
      void fetch("/api/v1/visits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: "/sponsor/pix-copy" }),
      }).catch(() => null);
      setTimeout(() => setPixCopied(false), 1800);
      setTimeout(() => setPixFeedback(null), 2400);
    } catch {
      setPixCopied(false);
      setPixFeedback("Não foi possível copiar automaticamente.");
      setTimeout(() => setPixFeedback(null), 2400);
    }
  }, []);

  const handleSponsorClick = useCallback(() => {
    void fetch("/api/v1/visits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: "/sponsor/pix-card" }),
    }).catch(() => null);
  }, []);

  // ---- Reset search ----
  const handleResetSearch = useCallback(() => {
    setSearchQuery("");
    setTranslationResult(null);
    searchInputRef.current?.focus();
  }, []);

  // ---- Random term discovery ----
  const handleRandomTerm = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * SLANG_DATA.length);
    const term = SLANG_DATA[randomIdx];
    if (term) searchAndGo(term.term);
  }, [searchAndGo]);

  const handleScenarioGuide = useCallback(
    (scenario: (typeof SCENARIO_GUIDES)[number]) => {
      setAudienceMode(scenario.mode);
      setSearchQuery(scenario.query);
      void handleTranslate(scenario.query);
    },
    [handleTranslate]
  );

  // ---- Glossário filtered data ----
  const filteredGlossary = (() => {
    let terms = SLANG_DATA;

    if (glossarySearch.trim()) {
      const q = glossarySearch.toLowerCase();
      terms = searchTerms(q);
    }

    if (selectedCategory) {
      terms = terms.filter((t) => t.category === selectedCategory);
    }

    if (selectedRisk) {
      terms = terms.filter((t) => t.riskLevel === selectedRisk);
    }

    return terms;
  })();

  // ---- Favorites data ----
  const favoriteTerms = favorites
    .map((f) => getTerm(f))
    .filter((t): t is SlangTerm => !!t);

  // =========================================================================
  // Tab navigation config
  // =========================================================================
  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode; href?: string }> = [
    { id: "busca", label: "Busca", icon: <Search className="h-4 w-4" /> },
    {
      id: "glossario",
      label: "Glossário",
      icon: <BookMarked className="h-4 w-4" />,
    },
    {
      id: "favoritos",
      label: "Favoritos",
      icon: <Heart className="h-4 w-4" />,
    },
    {
      id: "comunidade",
      label: "Comunidade",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "sugestoes",
      label: "Sugestões",
      icon: <MessageCircle className="h-4 w-4" />,
      href: "/girias/enviadas-por-usuarios",
    },
    {
      id: "apoie",
      label: "Apoiar",
      icon: <HeartHandshake className="h-4 w-4" />,
      href: "/apoie",
    },
    { id: "sobre", label: "Sobre", icon: <Shield className="h-4 w-4" /> },
  ];

  // =========================================================================
  // Render helpers
  // =========================================================================
  const renderRiskBadge = (level: RiskLevel) => {
    const rc = RISK_CONFIG[level];
    const borderMap: Record<RiskLevel, string> = {
      green: "border-green-200",
      yellow: "border-yellow-200",
      orange: "border-orange-200",
      red: "border-red-200",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${rc.bgColor} ${rc.textColor} ${borderMap[level]}`}
      >
        {rc.label}
      </span>
    );
  };

  const renderCategoryBadge = (category: string) => {
    const cat = CATEGORIES.find((c) => c.name === category);
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
        {cat?.icon ?? "💬"} {cat?.label ?? category}
      </span>
    );
  };

  // =========================================================================
  // TAB 4 — COMUNIDADE
  // =========================================================================
  const renderComunidade = () => {
    const topCommunity = [...communityItems]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    const averageScore = communityItems.length
      ? communityItems.reduce((sum, item) => sum + item.score, 0) / communityItems.length
      : 0;

    return (
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-5 shadow-sm dark:border-emerald-900 dark:from-emerald-950/30 dark:via-gray-950 dark:to-cyan-950/20 sm:p-6">
          <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit border-0 bg-emerald-600 text-white hover:bg-emerald-700">
                <Users className="mr-1 h-3 w-3" /> Comunidade viva
              </Badge>
              <div>
                <h2 className="text-2xl font-black text-gray-950 dark:text-gray-50">
                  Gírias enviadas por quem usa de verdade.
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Sugestões aprovadas entram no radar do Gíria AI com score de confiança,
                  contexto e autoria da comunidade.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:min-w-[170px]">
              <Button
                asChild
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
              >
                <Link href="/girias/enviadas-por-usuarios">
                  <MessageCircle className="h-4 w-4" /> Enviar gíria
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadCommunity()}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                <RotateCcw className={`h-4 w-4 ${communityLoading ? "animate-spin" : ""}`} />
                {communityLoading ? "Atualizando" : "Atualizar feed"}
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-emerald-100 bg-white dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{communityItems.length}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">aprovadas no feed</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-100 bg-white dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-yellow-700 dark:text-yellow-300">{averageScore.toFixed(2)}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">score médio</p>
            </CardContent>
          </Card>
          <Card className="border-cyan-100 bg-white dark:border-gray-800 dark:bg-gray-900">
            <CardContent className="p-4">
              <p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">Top 3</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">mais confiáveis</p>
            </CardContent>
          </Card>
        </div>

        {topCommunity.length > 0 && (
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">Ranking da comunidade</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">As sugestões com melhor score de validação.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {topCommunity.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => searchAndGo(item.term)}
                  className="rounded-2xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-yellow-300 hover:shadow-md dark:border-yellow-900/60 dark:from-yellow-950/20 dark:to-gray-900"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge className="border-0 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-950/60 dark:text-yellow-200">
                      #{index + 1}
                    </Badge>
                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">{item.score.toFixed(2)}</span>
                  </div>
                  <p className="font-black text-gray-950 dark:text-gray-50">{item.term}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{item.meaning}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">Feed de gírias aprovadas</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Clique em qualquer card para traduzir com contexto completo.</p>
            </div>
            <Link href="/girias/enviadas-por-usuarios" className="text-xs font-bold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300">
              Ver página completa →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {communityItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => searchAndGo(item.term)}
                className="group rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-gray-950 group-hover:text-emerald-700 dark:text-gray-50 dark:group-hover:text-emerald-300">{item.term}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{item.meaning}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {item.score.toFixed(2)}
                  </Badge>
                </div>
                {item.context ? <p className="mt-3 line-clamp-2 rounded-xl bg-gray-50 p-2 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">Contexto: {item.context}</p> : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                  <span>Enviado por {item.submitterName}</span>
                  <span>•</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Traduzir agora</span>
                </div>
              </button>
            ))}
          </div>
          {communityItems.length === 0 ? (
            <Card className="border-dashed border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
              <CardContent className="p-5 text-center">
                <Sparkles className="mx-auto mb-2 h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                <p className="font-bold text-gray-900 dark:text-gray-100">Ainda sem sugestões aprovadas.</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Envie a primeira gíria da comunidade e ajude o glossário crescer.</p>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </div>
    );
  };

  // =========================================================================
  // TAB 1 — BUSCA
  // =========================================================================
  const getAudienceGuidance = (result: TranslationResult) => {
    const riskDescription = RISK_CONFIG[result.riskLevel].description.toLowerCase();

    if (audienceMode === "educadores") {
      return {
        title: "Leitura para educadores",
        subtitle: "Use como contexto cultural, não como rótulo do aluno.",
        bullets: [
          `Explique "${result.term}" como linguagem informal e peça exemplos de uso sem exposição individual.`,
          `Observe o contexto: ${riskDescription}.`,
          "Se aparecer em conflito, trabalhe intenção, respeito e combinados de convivência.",
        ],
      };
    }

    if (audienceMode === "jovens") {
      return {
        title: "Leitura direta para jovens",
        subtitle: "Sem palestra: só o sentido e o cuidado de contexto.",
        bullets: [
          `"${result.term}" pode mudar de tom dependendo da intimidade e da ironia.`,
          "Se a pessoa não entendeu, explicar na moral evita ruído e julgamento.",
          `Fica ligado: ${riskDescription}.`,
        ],
      };
    }

    return {
      title: "Como conversar em casa",
      subtitle: "Um roteiro calmo para entender sem soar investigativo.",
      bullets: [
        `Comece com curiosidade: “Vi/escutei "${result.term}". Como vocês usam isso?”`,
        "Pergunte pelo contexto antes de concluir que é problema.",
        `Se necessário, combine limite com cuidado: ${riskDescription}.`,
      ],
    };
  };

  const renderAudienceSelector = (compact = false) => (
    <div className={`${compact ? "" : "mx-auto mt-5 max-w-2xl"} rounded-2xl border border-emerald-100 bg-white/75 p-2 shadow-sm backdrop-blur dark:border-emerald-900 dark:bg-gray-900/75`}>
      {!compact && (
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Escolha o modo de leitura
        </p>
      )}
      <div className={`grid gap-2 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
        {AUDIENCE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setAudienceMode(mode.id)}
            className={`rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 ${
              audienceMode === mode.id
                ? "border-emerald-400 bg-emerald-50 text-emerald-900 shadow-sm dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-100"
                : "border-gray-100 bg-white/70 text-gray-600 hover:border-emerald-200 dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300"
            }`}
          >
            <span className="block text-sm font-black">{mode.emoji} {mode.label}</span>
            <span className="mt-0.5 block text-[11px] leading-snug opacity-75">{mode.description}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderAudienceGuidance = (result: TranslationResult) => {
    const guidance = getAudienceGuidance(result);

    return (
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-900 dark:from-emerald-950/30 dark:to-gray-900">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">{guidance.title}</p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">{guidance.subtitle}</p>
          </div>
          <div className="shrink-0 sm:w-52">{renderAudienceSelector(true)}</div>
        </div>
        <ul className="space-y-2">
          {guidance.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSupportCard = (compact = false) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="relative overflow-hidden border-emerald-200/80 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 text-white shadow-xl dark:border-emerald-700/60">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-yellow-300/20 blur-2xl" />
        <div className="absolute -left-12 bottom-0 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />
        <CardContent className={`relative ${compact ? "p-4" : "p-5 sm:p-6"}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Badge className="w-fit border-0 bg-white/15 text-white hover:bg-white/20">
                <HeartHandshake className="mr-1 h-3 w-3" /> Projeto gratuito
              </Badge>
              <div>
                <h3 className="text-lg font-bold sm:text-xl">
                  Essa tradução te ajudou? Fortaleça o Gíria AI.
                </h3>
                <p className="mt-1 max-w-xl text-sm text-emerald-50/90">
                  Sua contribuição mantém o tradutor online, atualiza o glossário vivo e ajuda pais,
                  professores e jovens a entenderem a linguagem da internet brasileira.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUPPORT_AMOUNTS.map((amount) => (
                  <span
                    key={amount}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold"
                  >
                    R$ {amount}
                  </span>
                ))}
                <span className="rounded-full border border-yellow-200/40 bg-yellow-300/20 px-3 py-1 text-xs font-semibold text-yellow-50">
                  PIX rápido
                </span>
              </div>
            </div>
            <div className="flex min-w-[170px] flex-col gap-2">
              <Button
                asChild
                onClick={handleSponsorClick}
                className="bg-white text-emerald-800 shadow-lg hover:bg-emerald-50"
              >
                <Link href="/apoie">
                  <HeartHandshake className="h-4 w-4" /> Apoiar via PIX
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleSponsorClick();
                  void handleCopyPix();
                }}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                {pixCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {pixCopied ? "Chave copiada" : "Copiar chave PIX"}
              </Button>
              <p className="text-center text-[11px] text-emerald-50/80">
                {PIX_KEY} · {PIX_RECEIVER_NAME}
              </p>
            </div>
          </div>
          {pixFeedback ? <p className="mt-3 text-xs font-medium text-yellow-100">{pixFeedback}</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderBusca = () => (
    <div className="space-y-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-yellow-50 px-4 py-6 shadow-sm dark:border-emerald-900/70 dark:from-emerald-950/40 dark:via-gray-950 dark:to-teal-950/30 sm:px-6 sm:py-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute -bottom-20 left-8 h-36 w-36 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <Badge className="border-0 bg-emerald-600 text-white hover:bg-emerald-700">
              <Sparkles className="mr-1 h-3 w-3" /> Brasil digital
            </Badge>
            <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
              Gírias, memes e contexto
            </Badge>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-gray-50 sm:text-4xl">
            Traduza o idioma da internet brasileira.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
            Entenda gírias do TikTok, escola, WhatsApp, games e cultura jovem com explicações rápidas,
            seguras e em linguagem adulta.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {HERO_CHIPS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => searchAndGo(term)}
                className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-gray-900/80 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
              >
                #{term}
              </button>
            ))}
          </div>

          {renderAudienceSelector()}

          {/* Search bar */}
          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTranslate()}
                placeholder='Digite uma gíria ou frase... (pressione "/")'
                className="h-12 rounded-2xl border-emerald-200 bg-white/90 pl-9 pr-10 shadow-sm focus-visible:ring-emerald-500 dark:border-emerald-900 dark:bg-gray-900/90"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={() => handleTranslate()}
              disabled={isLoading || !searchQuery.trim()}
              className="h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 font-bold text-white shadow-lg shadow-emerald-900/10 hover:from-emerald-700 hover:to-teal-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Traduzindo...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" /> Traduzir
                </span>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Gíria do Dia */}
      {termOfDay && !translationResult && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-2xl"
        >
          <button
            type="button"
            className="group relative w-full overflow-hidden rounded-2xl border border-emerald-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-emerald-900 dark:bg-gray-900"
            onClick={() => searchAndGo(termOfDay.term)}
          >
            <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-yellow-400 via-emerald-500 to-teal-600" />
            <div className="flex flex-col gap-3 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge className="border-0 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-950/50 dark:text-yellow-200">
                      Hoje
                    </Badge>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Gíria do dia
                    </span>
                  </div>
                  <p className="text-lg font-black text-gray-950 dark:text-gray-50">{termOfDay.term}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{termOfDay.meaning}</p>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-emerald-700 transition group-hover:translate-x-1 dark:text-emerald-300">
                Ver explicação <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Search history */}
      {searchHistory.length > 0 && !translationResult && !isLoading && (
        <div className="mx-auto max-w-2xl space-y-2 rounded-2xl border border-gray-100 bg-white/80 p-3 dark:border-gray-800 dark:bg-gray-900/70">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Buscas recentes</p>
            <button
              type="button"
              onClick={clearSearchHistory}
              className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {searchHistory.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => searchAndGo(term)}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scenario guides */}
      {!translationResult && !isLoading && (
        <section className="mx-auto max-w-2xl space-y-3">
          <div>
            <p className="text-sm font-black text-gray-900 dark:text-gray-100">
              <Sparkles className="mr-1 inline h-4 w-4 text-emerald-500" /> Comece por uma situação real
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              O Gíria AI ajusta o modo de leitura e já testa uma frase com contexto.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCENARIO_GUIDES.map((scenario, index) => (
              <motion.button
                key={scenario.title}
                type="button"
                onClick={() => handleScenarioGuide(scenario)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className={`rounded-2xl border border-gray-100 bg-gradient-to-br ${scenario.accent} p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-gray-800`}
              >
                <div className="mb-2 flex items-start gap-2">
                  <span className="text-2xl" aria-hidden="true">{scenario.emoji}</span>
                  <div>
                    <h3 className="font-black text-gray-950 dark:text-gray-50">{scenario.title}</h3>
                    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{scenario.description}</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/70 bg-white/75 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-900/75 dark:text-gray-300">
                  Testar: “{scenario.query}”
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Popular slang clusters */}
      {!translationResult && !isLoading && (
        <section className="mx-auto max-w-2xl space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-gray-100">
                <Zap className="mr-1 inline h-4 w-4 text-amber-500" /> Gírias por contexto
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Escolha uma bolha e descubra o significado em segundos.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRandomTerm}
              className="flex items-center gap-1 text-sm font-bold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <Shuffle className="h-3.5 w-3.5" /> Descobrir gíria
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {POPULAR_GROUPS.map((group, i) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className={`rounded-2xl border border-gray-100 bg-gradient-to-br ${group.gradient} p-4 shadow-sm dark:border-gray-800`}
              >
                <div className="mb-3 flex items-start gap-2">
                  <span className="text-2xl" aria-hidden="true">{group.emoji}</span>
                  <div>
                    <h3 className="font-bold text-gray-950 dark:text-gray-50">{group.label}</h3>
                    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{group.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.terms.map((term) => (
                    <button
                      key={`${group.label}-${term}`}
                      type="button"
                      onClick={() => searchAndGo(term)}
                      className="rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {!translationResult && !isLoading && renderSupportCard(true)}

      {/* Loading skeleton */}
      {isLoading && (
        <Card className="mx-auto max-w-2xl overflow-hidden bg-white dark:bg-gray-900">
          <div className="h-24 animate-pulse bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40" />
          <CardContent className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-gray-100 dark:bg-gray-800" style={{ width: `${70 + i * 10}%` }} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Translation result */}
      <AnimatePresence>
        {translationResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <Card className="mx-auto max-w-2xl overflow-hidden border-0 bg-white shadow-xl dark:bg-gray-900">
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 px-4 py-5 text-white sm:px-6">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-yellow-300/20 blur-2xl" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Badge className="w-fit border-0 bg-white/15 text-white hover:bg-white/20">Ficha da gíria</Badge>
                    <h3 className="text-2xl font-black sm:text-3xl">&ldquo;{translationResult.term}&rdquo;</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {renderRiskBadge(translationResult.riskLevel)}
                      {renderCategoryBadge(translationResult.category)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${translationResult.term}: ${translationResult.meaning}`)}
                    className="shrink-0 rounded-full bg-white/20 p-2 transition-colors hover:bg-white/30"
                    title="Copiar tradução"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-200" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                      <BookOpen className="h-4 w-4" /> Significado rápido
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{translationResult.meaning}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-teal-50/80 p-4 dark:border-teal-900 dark:bg-teal-950/30">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-teal-800 dark:text-teal-200">
                      <MessageCircle className="h-4 w-4" /> Tradução adulta
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{translationResult.adultTranslation}</p>
                  </div>
                </div>

                {translationResult.phraseTranslation && (
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/30">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-800 dark:text-cyan-200">
                      <Sparkles className="h-4 w-4" /> Tradução da frase
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{translationResult.phraseTranslation}</p>
                  </div>
                )}

                {translationResult.phraseMatches.length > 0 && (
                  <div className="rounded-2xl border border-cyan-100 bg-white p-4 dark:border-cyan-900/60 dark:bg-gray-900">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-800 dark:text-cyan-200">
                      <Search className="h-4 w-4" /> Termos detectados na frase
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {translationResult.phraseMatches.map((term) => (
                        <button
                          key={term.term}
                          type="button"
                          onClick={() => searchAndGo(term.term)}
                          className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="font-black text-gray-950 dark:text-gray-50">{term.term}</span>
                            {renderRiskBadge(term.riskLevel)}
                          </div>
                          <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{term.adultTranslation}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {renderAudienceGuidance(translationResult)}

                <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Onde e quando aparece
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{translationResult.context}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {translationResult.region ? (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        Região: {translationResult.region}
                      </span>
                    ) : null}
                    {translationResult.popularityStatus ? (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        Status: {translationResult.popularityStatus}
                      </span>
                    ) : null}
                    {translationResult.isPhrase ? (
                      <span className="rounded-full bg-purple-50 px-2.5 py-1 font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                        Frase detectada
                      </span>
                    ) : null}
                  </div>
                </div>

                {translationResult.safeExample && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
                      <GraduationCap className="h-4 w-4" /> Exemplo seguro
                    </div>
                    <p className="text-sm italic leading-relaxed text-gray-700 dark:text-gray-300">&ldquo;{translationResult.safeExample}&rdquo;</p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                      <Shield className="h-4 w-4 text-gray-500" /> Leitura de risco
                    </div>
                    <div className="flex flex-col gap-2">
                      {renderRiskBadge(translationResult.riskLevel)}
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                        {RISK_CONFIG[translationResult.riskLevel].description}
                      </p>
                    </div>
                  </div>
                  {translationResult.contextNotes && (
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 dark:border-purple-900 dark:bg-purple-950/20">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-purple-800 dark:text-purple-200">
                        <Eye className="h-4 w-4" /> Orientação
                      </div>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{translationResult.contextNotes}</p>
                    </div>
                  )}
                </div>

                {translationResult.origin && (
                  <div className="flex gap-3 rounded-2xl border border-orange-100 p-4 dark:border-orange-900/60">
                    <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-orange-500 dark:text-orange-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Origem</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{translationResult.origin}</p>
                    </div>
                  </div>
                )}

                {translationResult.variations.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                      <Zap className="h-4 w-4 text-yellow-500 dark:text-yellow-400" /> Variações e termos parecidos
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {translationResult.variations.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => searchAndGo(v)}
                          className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                  <Button
                    onClick={() => toggleFavorite(translationResult.term)}
                    variant={isFavorited(translationResult.term) ? "outline" : "default"}
                    className={
                      isFavorited(translationResult.term)
                        ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50"
                        : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
                    }
                  >
                    <Heart className={`h-4 w-4 ${isFavorited(translationResult.term) ? "fill-red-500" : ""}`} />
                    {isFavorited(translationResult.term) ? "Salvo" : "Salvar"}
                  </Button>
                  <Button
                    onClick={async () => {
                      const shareText = [
                        `🔍 ${translationResult.term}: ${translationResult.meaning}`,
                        `📋 ${translationResult.adultTranslation}`,
                        `⚠️ Risco: ${translationResult.riskLabel}`,
                        "— Gíria AI",
                      ].join("\n");

                      if (typeof navigator !== "undefined" && navigator.share) {
                        try {
                          await navigator.share({
                            title: `Gíria AI — ${translationResult.term}`,
                            text: shareText,
                          });
                          return;
                        } catch {
                          // User cancelled or not supported, fall through to copy
                        }
                      }
                      handleCopy(shareText);
                    }}
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                    Compartilhar
                  </Button>
                  <Button
                    onClick={() => {
                      const shareText = [
                        `🔍 ${translationResult.term}: ${translationResult.meaning}`,
                        `📋 ${translationResult.adultTranslation}`,
                        `⚠️ Risco: ${translationResult.riskLabel}`,
                        "— Gíria AI",
                      ].join("\n");
                      const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                      window.open(url, "_blank");
                    }}
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    💬 WhatsApp
                  </Button>
                  <Button asChild variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
                    <Link href="/girias/enviadas-por-usuarios">Enviar correção</Link>
                  </Button>
                  <Button
                    onClick={handleResetSearch}
                    variant="outline"
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <Search className="h-4 w-4" /> Traduzir outra
                  </Button>
                </div>
              </CardContent>
            </Card>
            {renderSupportCard(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // =========================================================================
  // TAB 2 — GLOSSÁRIO
  // =========================================================================
  const renderGlossario = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Glossário Vivo
        </h2>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={glossarySearch}
          onChange={(e) => setGlossarySearch(e.target.value)}
          placeholder="Buscar no glossário..."
          className="pl-9"
        />
        {glossarySearch && (
          <button
            onClick={() => setGlossarySearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !selectedCategory
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat.name ? null : cat.name)
            }
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === cat.name
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Risk level filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedRisk(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            !selectedRisk
              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
              : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          Todos os níveis
        </button>
        {(Object.keys(RISK_CONFIG) as RiskLevel[]).map((level) => {
          const rc = RISK_CONFIG[level];
          const borderMap: Record<RiskLevel, string> = {
            green: "border-green-200",
            yellow: "border-yellow-200",
            orange: "border-orange-200",
            red: "border-red-200",
          };
          const activeText: Record<RiskLevel, string> = {
            green: "text-green-100",
            yellow: "text-yellow-100",
            orange: "text-orange-100",
            red: "text-red-100",
          };
          const bgMap: Record<RiskLevel, string> = {
            green: "bg-green-600",
            yellow: "bg-yellow-500",
            orange: "bg-orange-500",
            red: "bg-red-600",
          };
          return (
            <button
              key={level}
              onClick={() =>
                setSelectedRisk(selectedRisk === level ? null : level)
              }
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                selectedRisk === level
                  ? `${bgMap[level]} ${activeText[level]} ${borderMap[level]}`
                  : `${rc.bgColor} ${rc.textColor} ${borderMap[level]} hover:opacity-80`
              }`}
            >
              {rc.label}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 dark:text-gray-500">
        {filteredGlossary.length} resultado{filteredGlossary.length !== 1 ? "s" : ""}
        {selectedCategory && ` em "${getCategoryLabel(selectedCategory)}"`}
        {selectedRisk && ` com nível ${RISK_CONFIG[selectedRisk].label}`}
      </p>

      {/* Glossary list */}
      <div className="space-y-2 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1">
        {filteredGlossary.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <BookMarked className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nenhuma gíria encontrada com esses filtros.</p>
          </div>
        ) : (
          filteredGlossary.map((term) => (
            <Card
              key={term.term}
              className="cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              onClick={() => searchAndGo(term.term)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {term.term}
                      </span>
                      {renderRiskBadge(term.riskLevel)}
                      {renderCategoryBadge(term.category)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {term.meaning}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  // =========================================================================
  // TAB 3 — FAVORITOS
  // =========================================================================
  const renderFavoritos = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Meus Favoritos
          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-2">
            ({favoriteTerms.length})
          </span>
        </h2>
        {favoriteTerms.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFavorites}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Limpar todos
          </Button>
        )}
      </div>

      {/* Empty state */}
      {favoriteTerms.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Heart className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-400 dark:text-gray-500 font-medium">Nenhum favorito salvo</p>
          <p className="text-gray-300 dark:text-gray-600 text-sm">
            Busque uma gíria e clique no coração para salvar aqui.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("busca")}
            className="mt-2"
          >
            <Search className="h-4 w-4 mr-2" />
            Ir para Busca
          </Button>
        </div>
      )}

      {/* Favorites list */}
      {favoriteTerms.length > 0 && (
        <div className="space-y-2 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1">
          {favoriteTerms.map((term) => (
            <Card
              key={term.term}
              className="hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => searchAndGo(term.term)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {term.term}
                      </span>
                      {renderRiskBadge(term.riskLevel)}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {term.meaning}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        searchAndGo(term.term);
                      }}
                      className="rounded-full p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                      title="Traduzir"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(term.term);
                      }}
                      className="rounded-full p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Remover dos favoritos"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // =========================================================================
  // TAB 4 — SOBRE
  // =========================================================================
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const toggleFaq = useCallback((i: number) => setFaqOpen(faqOpen === i ? null : i), [faqOpen]);

  const faqItems = [
    {
      q: "O Gíria AI monitora conversas do meu filho?",
      a: "Não! O Gíria AI é uma ferramenta de consulta. Você digita uma gíria e recebe a explicação. Não acessamos, monitoramos ou armazenamos nenhuma conversa privada.",
    },
    {
      q: "As gírias são de qual região do Brasil?",
      a: "Nosso dicionário cobre gírias de todo o Brasil: São Paulo, Rio de Janeiro, Minas Gerais, Bahia, Nordeste, Sul (Rio Grande do Sul, Santa Catarina, Paraná) e muitas gírias da internet que são usadas nacionalmente.",
    },
    {
      q: "O que significa o nível de risco?",
      a: "Classificamos cada gíria em 4 níveis: Inofensivo (sem problemas), Atenção (contexto importa), Cautela (pode ser inadequado dependendo da situação) e Sensível (conteúdo explícito ou ofensivo). Isso ajuda pais e educadores a entenderem o contexto.",
    },
    {
      q: "Com que frequência o dicionário é atualizado?",
      a: "Adicionamos novas gírias regularmente. A linguagem jovem muda rapidamente — especialmente na internet e redes sociais — e nosso objetivo é acompanhar essas mudanças.",
    },
    {
      q: "O Chat IA substitui a busca no dicionário?",
      a: "Complementa! O Chat IA é ideal para perguntas mais complexas, comparações entre gírias, ou quando você quer entender o contexto cultural. A busca é mais rápida para traduções diretas.",
    },
    {
      q: "Este app é gratuito?",
      a: "Sim! O Gíria AI é totalmente gratuito e não requer cadastro. Basta acessar e começar a usar.",
    },
  ];

  const renderSobre = () => (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="text-center space-y-2 pt-2 pb-1">
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-2">
          <MessageCircle className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sobre o Gíria AI</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Uma ponte cultural entre gerações — compreendendo a linguagem jovem com respeito e educação.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-center">
          <CardContent className="p-3 sm:p-4">
            <Sparkles className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-emerald-600 font-medium">Dicionário Vivo</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 text-center">
          <CardContent className="p-3 sm:p-4">
            <Globe className="h-6 w-6 text-teal-600 mx-auto mb-1" />
            <p className="text-xs text-teal-600 font-medium">Todo o Brasil</p>
          </CardContent>
        </Card>
      </div>

      {/* Missão */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nossa Missão</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            O <strong>Gíria AI</strong> ajuda pais, educadores e responsáveis a
            compreenderem a linguagem dos adolescentes e jovens — de forma
            respeitosa, educativa e contextualizada.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Este <strong>não é uma ferramenta de vigilância</strong>. É um recurso
            educativo para promover diálogo e compreensão mútua entre gerações.
          </p>
        </CardContent>
      </Card>

      {/* Princípios */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nossos Princípios</h3>
          </div>
          <ul className="space-y-2.5">
            {[
              "Privacidade por padrão — nenhum dado pessoal é coletado ou armazenado.",
              "Linguagem educativa, não punitiva — explicamos, não julgamos.",
              "Explicação contextual — toda gíria vem com seu contexto de uso.",
              "Diversidade regional — reconhecemos variações de todo o Brasil.",
              "Atualização constante — novas gírias são adicionadas regularmente.",
              "Segurança para menores — conteúdo apropriado e responsável.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Níveis de Risco */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Níveis de Risco</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(RISK_CONFIG) as RiskLevel[]).map((level) => {
              const rc = RISK_CONFIG[level];
              const borderMap: Record<RiskLevel, string> = {
                green: "border-green-200",
                yellow: "border-yellow-200",
                orange: "border-orange-200",
                red: "border-red-200",
              };
              return (
                <div
                  key={level}
                  className={`rounded-lg border ${borderMap[level]} ${rc.bgColor} p-3 space-y-1`}
                >
                  <span className={`text-sm font-semibold ${rc.textColor}`}>
                    {rc.label}
                  </span>
                  <p className={`text-xs ${rc.textColor} opacity-80`}>
                    {rc.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Classificação de Contexto */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Categorias
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className={`rounded-lg ${cat.color} px-3 py-2 text-center`}
              >
                <span className="text-lg">{cat.icon}</span>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                  {cat.label}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segurança e Privacidade */}
      <Card className="border-red-200 dark:border-red-900 bg-white dark:bg-gray-900">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Segurança e Privacidade
            </h3>
          </div>
          <div className="space-y-2">
            {[
              "Este app NÃO monitora conversas privadas.",
              "NÃO incentivamos espionagem de nenhum tipo.",
              "NÃO armazenamos conversas ou mensagens de terceiros.",
              "NÃO criamos diagnósticos psicológicos ou comportamentais.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 border border-red-100 dark:border-red-900"
              >
                <Shield className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Para Quem é */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Para Quem é</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Badge
                variant="outline"
                className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 mb-1.5"
              >
                Público Primário
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pais, mães e responsáveis que desejam compreender melhor a
                linguagem dos filhos adolescentes.
              </p>
            </div>
            <div>
              <Badge
                variant="outline"
                className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 mb-1.5"
              >
                Público Secundário
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professores, psicólogos, orientadores educacionais e
                profissionais que trabalham com adolescentes.
              </p>
            </div>
            <div>
              <Badge
                variant="outline"
                className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 mb-1.5"
              >
                Público Terciário
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adolescentes e jovens que desejam entender as nuances e riscos
                das gírias que usam.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Perguntas Frequentes
            </h3>
          </div>
          <div className="space-y-2">
            {faqItems.map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 pr-2">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${faqOpen === i ? "rotate-180" : ""}`}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-3 pb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diferencial */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4 sm:p-5 space-y-3 text-center">
          <HeartHandshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Nosso Diferencial</h3>
          <blockquote className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed max-w-md mx-auto">
            &ldquo;Interpretar contexto social, emocional e cultural com
            responsabilidade.&rdquo;
          </blockquote>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mais do que traduzir palavras, explicamos o mundo por trás delas.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Feito com <Heart className="inline h-3 w-3 text-red-400 fill-red-400" /> no Brasil
          </p>
          <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1.5">
            AIX8C — @lorenzavolponi #01 em tecnologia e IA do Brasil !
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // =========================================================================
  // Main render
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Gíria AI
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-none hidden sm:block">
                Tradutor de Gírias Brasileiras
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <Badge
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              onClick={handleRandomTerm}
              title="Descobrir gíria aleatória"
            >
              <Shuffle className="h-2.5 w-2.5 mr-1" />
              Aleatório
            </Badge>
          </div>
        </div>

        {/* Tab navigation — desktop only */}
        <div className="max-w-3xl mx-auto px-4 hidden sm:block">
          <nav className="flex gap-1 -mb-px" aria-label="Navegação principal">
            {tabs.map((tab) => (
              tab.href ? (
              <Link
                key={tab.label}
                href={tab.href}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
              ) : (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
              )
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-5 pb-24 sm:pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "busca" && renderBusca()}
            {activeTab === "glossario" && renderGlossario()}
            {activeTab === "favoritos" && renderFavoritos()}
            {activeTab === "comunidade" && renderComunidade()}
            {activeTab === "sobre" && renderSobre()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-gray-900 dark:to-gray-950 pb-20 sm:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-3 text-center space-y-0.5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mx-auto mb-3 max-w-xl rounded-xl border border-emerald-200/80 bg-white/80 p-3 shadow-sm dark:border-emerald-900 dark:bg-gray-900/70"
          >
            <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">Seja um patrocinador do projeto 💚</p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              <span><strong>PIX:</strong> 🔑 <strong>{PIX_KEY}</strong> · {PIX_RECEIVER_NAME}</span>
              <button
                type="button"
                onClick={() => {
                  handleSponsorClick();
                  void handleCopyPix();
                }}
                className="rounded-md border border-emerald-300 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                aria-label="Copiar chave PIX"
              >
                {pixCopied ? "Copiado!" : "Copiar chave"}
              </button>
            </div>
            {pixFeedback ? <p className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-300">{pixFeedback}</p> : null}
            <div className="mx-auto mt-2 rounded-lg border border-emerald-200 bg-white p-1.5 shadow-sm dark:border-emerald-900">
              <Image
                src="/pix-qr.svg"
                alt="QR Code PIX para apoiar o Gíria AI"
                width={92}
                height={92}
                className="h-20 w-20 sm:h-24 sm:w-24"
              />
            </div>
          </motion.div>
          <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            AIX8C - @lorenzavolponi #01 em tecnologia e IA do Brasil !
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
            Gíria AI — Ferramenta educativa para compreensão da linguagem jovem.
          </p>
        </div>
      </footer>

      {/* Bottom mobile navigation bar — mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
        aria-label="Navegação mobile"
      >
        <div className="flex items-center justify-around px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => (
            tab.href ? (
            <Link
              key={tab.label}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-1 py-1 rounded-lg transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span>{tab.icon}</span>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </Link>
            ) : (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-1 py-1 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              <span className={`transition-transform ${activeTab === tab.id ? "scale-110" : ""}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <span className="absolute -top-1.5 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
            )
          ))}
        </div>
      </nav>

      {/* Floating Chat IA Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-20 sm:bottom-6 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
          chatMessages.length > 0 && !chatOpen ? "ring-2 ring-emerald-300 dark:ring-emerald-700" : ""
        }`}
        aria-label="Chat IA"
      >
        {chatMessages.length === 0 && !chatOpen && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-ping opacity-30" />
        )}
        {chatMessages.length > 0 && !chatOpen && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-gray-950" />
        )}
        {chatOpen ? (
          <X className="h-6 w-6 relative z-10" />
        ) : (
          <Bot className="h-6 w-6 relative z-10" />
        )}
      </button>

      {/* Chat IA Popup */}
      <AnimatePresence>
        {chatOpen && (
          <>
            {/* Backdrop — mobile only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-50 sm:hidden"
              onClick={() => setChatOpen(false)}
            />

            {/* Chat panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed z-[60] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col bottom-[6.5rem] sm:bottom-20 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-[400px] h-[70vh] sm:h-[500px]"
            >
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">Chat IA</h3>
                    <p className="text-[10px] text-emerald-100">Pergunte sobre qualquer gíria</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {chatMessages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
                      title="Limpar conversa"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setChatOpen(false)}
                    className="rounded-full p-1.5 hover:bg-white/20 transition-colors sm:hidden"
                    title="Fechar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-4 space-y-4">
                    <div className="space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Olá! Eu sou o Gíria AI</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] mx-auto">
                        Pergunte sobre qualquer gíria, expressão ou termo da internet brasileira.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Tente perguntar</p>
                      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                        {SUGGESTED_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => handleChatSend(prompt)}
                            disabled={chatLoading}
                            className="shrink-0 rounded-full border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mt-0.5">
                            <Bot className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <p>{msg.content}</p>
                          ) : (
                            <div className="prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_h3]:font-bold [&_h3]:text-sm [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_code]:bg-gray-200 dark:[&_code]:bg-gray-700 [&_code]:rounded [&_code]:px-1 [&_code]:text-xs">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                        {msg.role === "user" && (
                          <div className="shrink-0 w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mt-0.5">
                            <Users className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {chatLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div className="flex gap-2 p-3 pt-2 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <Input
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                  placeholder="Pergunte sobre uma gíria..."
                  disabled={chatLoading}
                  className="flex-1 h-9 text-sm"
                />
                <Button
                  onClick={() => handleChatSend()}
                  disabled={chatLoading || !chatInput.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-9 px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
