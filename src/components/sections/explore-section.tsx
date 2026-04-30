"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Grid3X3,
  MapPin,
  BookOpen,
  Search,
  X,
  Filter,
  ChevronRight,
  Hash,
  ArrowUpDown,
  Globe,
  TrendingUp,
  TrendingDown,
  Crosshair,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  SLANG_DATA,
  CATEGORIES,
  RISK_CONFIG,
  type SlangTerm,
  type RiskLevel,
  type PopularityStatus,
} from "@/lib/slang-data";

// =============================================================================
// Types
// =============================================================================
interface ExploreSectionProps {
  onSearchTerm: (term: string) => void;
}

type SubTab = "categorias" | "regioes" | "glossario";
type GlossarySort = "az" | "za";

// =============================================================================
// Constants
// =============================================================================
const REGIONS = [
  "Brasil",
  "SP",
  "RJ",
  "MG",
  "BA",
  "RS",
  "PE",
  "CE",
  "AM",
  "internacional",
] as const;

const REGION_META: Record<string, { label: string; gradient: string; darkGradient: string; icon: string }> = {
  Brasil: { label: "Brasil", gradient: "from-emerald-500 to-teal-600", darkGradient: "from-emerald-700 to-teal-800", icon: "🇧🇷" },
  SP: { label: "São Paulo", gradient: "from-blue-500 to-indigo-600", darkGradient: "from-blue-700 to-indigo-800", icon: "🌆" },
  RJ: { label: "Rio de Janeiro", gradient: "from-amber-500 to-orange-600", darkGradient: "from-amber-700 to-orange-800", icon: "🏖️" },
  MG: { label: "Minas Gerais", gradient: "from-stone-500 to-stone-700", darkGradient: "from-stone-600 to-stone-800", icon: "⛰️" },
  BA: { label: "Bahia", gradient: "from-red-500 to-rose-600", darkGradient: "from-red-700 to-rose-800", icon: "🥁" },
  RS: { label: "Rio Grande do Sul", gradient: "from-sky-500 to-cyan-600", darkGradient: "from-sky-700 to-cyan-800", icon: " rode" },
  PE: { label: "Pernambuco", gradient: "from-yellow-500 to-amber-600", darkGradient: "from-yellow-700 to-amber-800", icon: " andar" },
  CE: { label: "Ceará", gradient: "from-teal-500 to-emerald-600", darkGradient: "from-teal-700 to-emerald-800", icon: "🌂" },
  AM: { label: "Amazonas", gradient: "from-green-500 to-emerald-700", darkGradient: "from-green-700 to-emerald-900", icon: "🌴" },
  internacional: { label: "Internacional", gradient: "from-violet-500 to-purple-600", darkGradient: "from-violet-700 to-purple-800", icon: "🌍" },
};

// Fix RS/PE icons
REGION_META["RS"] = { label: "Rio Grande do Sul", gradient: "from-sky-500 to-cyan-600", darkGradient: "from-sky-700 to-cyan-800", icon: "🧉" };
REGION_META["PE"] = { label: "Pernambuco", gradient: "from-yellow-500 to-amber-600", darkGradient: "from-yellow-700 to-amber-800", icon: "🎪" };

const POPULARITY_MAP: Record<PopularityStatus, { label: string; icon: React.ReactNode }> = {
  ativo: { label: "Ativo", icon: <TrendingUp className="h-3 w-3" /> },
  em_queda: { label: "Em Queda", icon: <TrendingDown className="h-3 w-3" /> },
  regional: { label: "Regional", icon: <Crosshair className="h-3 w-3" /> },
  internacional: { label: "Internacional", icon: <Languages className="h-3 w-3" /> },
};

const POPULARITY_FILTERS: { value: PopularityStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "ativo", label: "🔥 Ativo" },
  { value: "em_queda", label: "📉 Em Queda" },
  { value: "regional", label: "📍 Regional" },
  { value: "internacional", label: "🌍 Internacional" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const GLOSSARY_PAGE_SIZE = 30;

// =============================================================================
// Helper: truncate
// =============================================================================
function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}

// =============================================================================
// Component
// =============================================================================
export default function ExploreSection({ onSearchTerm }: ExploreSectionProps) {
  // Sub-tab
  const [subTab, setSubTab] = useState<SubTab>("categorias");

  // Category search
  const [categorySearch, setCategorySearch] = useState("");
  // Region search
  const [regionSearch, setRegionSearch] = useState("");

  // Glossário state
  const [glossarySearch, setGlossarySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPopularity, setSelectedPopularity] = useState<PopularityStatus | "all">("all");
  const [glossarySort, setGlossarySort] = useState<GlossarySort>("az");
  const [glossaryPage, setGlossaryPage] = useState(1);

  // Sheet state (for category / region detail)
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("");
  const [sheetTerms, setSheetTerms] = useState<SlangTerm[]>([]);

  // Scroll ref for alphabet bar
  const alphabetRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  // Computed data
  // =========================================================================

  // Terms per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const term of SLANG_DATA) {
      if (!term) continue;
      counts[term.category] = (counts[term.category] || 0) + 1;
    }
    return counts;
  }, []);

  // Terms per region
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const term of SLANG_DATA) {
      if (!term) continue;
      counts[term.region] = (counts[term.region] || 0) + 1;
    }
    return counts;
  }, []);

  // Sample terms per region
  const regionSampleTerms = useMemo(() => {
    const samples: Record<string, SlangTerm[]> = {};
    for (const term of SLANG_DATA) {
      if (!term) continue;
      if (!samples[term.region]) samples[term.region] = [];
      if (samples[term.region].length < 5) samples[term.region].push(term);
    }
    return samples;
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return CATEGORIES;
    const q = categorySearch.toLowerCase();
    return CATEGORIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    );
  }, [categorySearch]);

  // Filtered regions
  const filteredRegions = useMemo(() => {
    if (!regionSearch.trim()) return REGIONS;
    const q = regionSearch.toLowerCase();
    return REGIONS.filter((r) => {
      const meta = REGION_META[r];
      return (
        r.toLowerCase().includes(q) ||
        meta.label.toLowerCase().includes(q)
      );
    });
  }, [regionSearch]);

  // Glossário filtered data
  const filteredGlossary = useMemo(() => {
    let terms = SLANG_DATA.filter(Boolean);

    if (glossarySearch.trim()) {
      const q = glossarySearch.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.meaning.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      terms = terms.filter((t) => t.category === selectedCategory);
    }

    if (selectedRisk) {
      terms = terms.filter((t) => t.riskLevel === selectedRisk);
    }

    if (selectedLetter) {
      terms = terms.filter(
        (t) => t.term.charAt(0).toUpperCase() === selectedLetter
      );
    }

    if (selectedRegion) {
      terms = terms.filter(
        (t) => t.region.toLowerCase() === selectedRegion.toLowerCase()
      );
    }

    if (selectedPopularity !== "all") {
      terms = terms.filter((t) => t.popularityStatus === selectedPopularity);
    }

    // Sort
    const sorted = [...terms];
    if (glossarySort === "az") {
      sorted.sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));
    } else {
      sorted.sort((a, b) => b.term.localeCompare(a.term, "pt-BR"));
    }

    return sorted;
  }, [glossarySearch, selectedCategory, selectedRisk, selectedLetter, selectedRegion, selectedPopularity, glossarySort]);

  const pagedGlossary = useMemo(
    () => filteredGlossary.slice(0, glossaryPage * GLOSSARY_PAGE_SIZE),
    [filteredGlossary, glossaryPage]
  );
  const hasMoreGlossary = pagedGlossary.length < filteredGlossary.length;

  // Letters that have terms
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const t of SLANG_DATA) {
      if (t) letters.add(t.term.charAt(0).toUpperCase());
    }
    return letters;
  }, []);

  // =========================================================================
  // Handlers
  // =========================================================================
  const openCategorySheet = useCallback((categoryName: string, categoryLabel: string) => {
    const terms = SLANG_DATA.filter((t) => t && t.category === categoryName);
    terms.sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));
    setSheetTitle(categoryLabel);
    setSheetTerms(terms);
    setSheetOpen(true);
  }, []);

  const openRegionSheet = useCallback((regionKey: string) => {
    const terms = SLANG_DATA.filter(
      (t) => t && t.region.toLowerCase() === regionKey.toLowerCase()
    );
    terms.sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));
    setSheetTitle(REGION_META[regionKey]?.label ?? regionKey);
    setSheetTerms(terms);
    setSheetOpen(true);
  }, []);

  const resetGlossaryPage = useCallback(() => {
    setGlossaryPage(1);
  }, []);

  const clearAllGlossaryFilters = useCallback(() => {
    setGlossarySearch("");
    setSelectedCategory(null);
    setSelectedRisk(null);
    setSelectedLetter(null);
    setSelectedRegion(null);
    setSelectedPopularity("all");
    setGlossarySort("az");
    setGlossaryPage(1);
  }, []);

  const hasActiveGlossaryFilters = selectedCategory || selectedRisk || selectedLetter || selectedRegion || selectedPopularity !== "all" || glossarySearch;

  // =========================================================================
  // Sub-tab navigation config
  // =========================================================================
  const subTabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [
    { id: "categorias", label: "Categorias", icon: <Grid3X3 className="h-4 w-4" /> },
    { id: "regioes", label: "Regiões", icon: <MapPin className="h-4 w-4" /> },
    { id: "glossario", label: "Glossário", icon: <BookOpen className="h-4 w-4" /> },
  ];

  // =========================================================================
  // Render helpers
  // =========================================================================
  const renderRiskBadge = (level: RiskLevel) => {
    const rc = RISK_CONFIG[level];
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${rc.bgColor} ${rc.textColor} dark:opacity-90`}
      >
        {rc.label}
      </span>
    );
  };

  const renderCategoryBadge = (category: string) => {
    const cat = CATEGORIES.find((c) => c.name === category);
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400">
        {cat?.icon ?? "💬"} {cat?.label ?? category}
      </span>
    );
  };

  // =========================================================================
  // TAB: CATEGORIAS
  // =========================================================================
  const renderCategorias = () => (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Categorias
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {SLANG_DATA.filter(Boolean).length} termos em {CATEGORIES.length} categorias
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          placeholder="Buscar categorias..."
          className="pl-9 h-9"
        />
        {categorySearch && (
          <button
            onClick={() => setCategorySearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredCategories.map((cat) => {
          const count = categoryCounts[cat.name] || 0;
          return (
            <button
              key={cat.name}
              onClick={() => openCategorySheet(cat.name, cat.label)}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-left hover:scale-[1.03] hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            >
              {/* Subtle gradient overlay */}
              <div
                className={`absolute inset-0 ${cat.color} opacity-40 dark:opacity-20 group-hover:opacity-60 dark:group-hover:opacity-30 transition-opacity duration-200`}
              />
              <div className="relative z-10">
                <span className="text-2xl sm:text-3xl block mb-2">{cat.icon}</span>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {cat.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {count} {count === 1 ? "termo" : "termos"}
                </p>
              </div>
              <ChevronRight className="absolute top-3 right-3 h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
            </button>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma categoria encontrada</p>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // TAB: REGIÕES
  // =========================================================================
  const renderRegioes = () => (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Regiões
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Explore gírias por região do Brasil e do mundo
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          value={regionSearch}
          onChange={(e) => setRegionSearch(e.target.value)}
          placeholder="Buscar regiões..."
          className="pl-9 h-9"
        />
        {regionSearch && (
          <button
            onClick={() => setRegionSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* "All regions" summary card */}
      <button
        onClick={() => openRegionSheet("Brasil")}
        className="group w-full relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-teal-800 p-5 text-left hover:scale-[1.01] hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-5 w-5 text-white" />
            <h4 className="font-bold text-white text-base">Todas as Regiões</h4>
          </div>
          <p className="text-white/80 text-sm">
            {SLANG_DATA.filter(Boolean).length} termos — Brasil e internacional
          </p>
        </div>
        <ChevronRight className="absolute top-4 right-4 h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
      </button>

      {/* Region Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredRegions.map((regionKey) => {
          const meta = REGION_META[regionKey];
          const count = regionCounts[regionKey] || 0;
          const samples = regionSampleTerms[regionKey] || [];
          return (
            <button
              key={regionKey}
              onClick={() => openRegionSheet(regionKey)}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-left hover:scale-[1.03] hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            >
              {/* Gradient accent strip at top */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${meta.gradient} dark:${meta.darkGradient}`}
              />
              <div className="relative z-10 pt-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{meta.icon}</span>
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <MapPin className="inline h-3 w-3 mr-0.5" />
                  {count} {count === 1 ? "termo" : "termos"}
                </p>
                {/* Sample term chips */}
                {samples.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {samples.slice(0, 3).map((t) => (
                      <span
                        key={t.term}
                        className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-400 max-w-[80px] truncate"
                      >
                        {t.term}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ChevronRight className="absolute bottom-3 right-3 h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
            </button>
          );
        })}
      </div>

      {filteredRegions.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma região encontrada</p>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // TAB: GLOSSÁRIO
  // =========================================================================
  const renderGlossario = () => (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Glossário Completo
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredGlossary.length} {filteredGlossary.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setGlossarySort(glossarySort === "az" ? "za" : "az");
              resetGlossaryPage();
            }}
            className="h-8 text-xs gap-1.5 border-gray-200 dark:border-gray-700"
          >
            <ArrowUpDown className="h-3 w-3" />
            {glossarySort === "az" ? "A-Z" : "Z-A"}
          </Button>
          {hasActiveGlossaryFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllGlossaryFilters}
              className="h-8 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <Input
          value={glossarySearch}
          onChange={(e) => {
            setGlossarySearch(e.target.value);
            resetGlossaryPage();
          }}
          placeholder="Buscar termos, significados..."
          className="pl-9 h-9"
        />
        {glossarySearch && (
          <button
            onClick={() => {
              setGlossarySearch("");
              resetGlossaryPage();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* A-Z Quick Jump Bar */}
      <div ref={alphabetRef}>
        <div className="flex items-center gap-1 mb-1.5">
          <Hash className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Pular para a letra
          </span>
        </div>
        <ScrollArea className="w-full" type="scroll">
          <div className="flex gap-1 pb-2">
            <button
              onClick={() => {
                setSelectedLetter(null);
                resetGlossaryPage();
              }}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
                !selectedLetter
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              #
            </button>
            {ALPHABET.map((letter) => {
              const has = availableLetters.has(letter);
              if (!has) return (
                <span
                  key={letter}
                  className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-300 dark:text-gray-700 cursor-default select-none"
                >
                  {letter}
                </span>
              );
              return (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(selectedLetter === letter ? null : letter);
                    resetGlossaryPage();
                  }}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
                    selectedLetter === letter
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Filter Pills */}
      <div className="space-y-2.5">
        {/* Region filter */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
            <MapPin className="inline h-3 w-3 mr-0.5 -mt-0.5" /> Região
          </p>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => {
                setSelectedRegion(null);
                resetGlossaryPage();
              }}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                !selectedRegion
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Todas
            </button>
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => {
                  setSelectedRegion(selectedRegion === region ? null : region);
                  resetGlossaryPage();
                }}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  selectedRegion === region
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {REGION_META[region]?.icon} {region}
              </button>
            ))}
          </div>
        </div>

        {/* Popularity filter */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
            <TrendingUp className="inline h-3 w-3 mr-0.5 -mt-0.5" /> Popularidade
          </p>
          <div className="flex flex-wrap gap-1">
            {POPULARITY_FILTERS.map((pf) => (
              <button
                key={pf.value}
                onClick={() => {
                  setSelectedPopularity(
                    selectedPopularity === pf.value ? "all" : pf.value
                  );
                  resetGlossaryPage();
                }}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  selectedPopularity === pf.value
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Risk level filter */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
            <Filter className="inline h-3 w-3 mr-0.5 -mt-0.5" /> Risco
          </p>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => {
                setSelectedRisk(null);
                resetGlossaryPage();
              }}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                !selectedRisk
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Todos
            </button>
            {(Object.keys(RISK_CONFIG) as RiskLevel[]).map((level) => {
              const rc = RISK_CONFIG[level];
              return (
                <button
                  key={level}
                  onClick={() => {
                    setSelectedRisk(selectedRisk === level ? null : level);
                    resetGlossaryPage();
                  }}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border ${
                    selectedRisk === level
                      ? `${rc.bgColor} ${rc.textColor} border-current`
                      : `bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700`
                  }`}
                >
                  {rc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category filter (compact) */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
            <Grid3X3 className="inline h-3 w-3 mr-0.5 -mt-0.5" /> Categoria
          </p>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => {
                setSelectedCategory(null);
                resetGlossaryPage();
              }}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                !selectedCategory
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(
                    selectedCategory === cat.name ? null : cat.name
                  );
                  resetGlossaryPage();
                }}
                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat.name
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Glossary term list */}
      {pagedGlossary.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum termo encontrado</p>
          {hasActiveGlossaryFilters && (
            <button
              onClick={clearAllGlossaryFilters}
              className="text-xs text-emerald-500 dark:text-emerald-400 mt-2 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-2">
            {pagedGlossary.map((term) => (
              <button
                key={term.term}
                onClick={() => onSearchTerm(term.term)}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-left hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 dark:focus:ring-offset-gray-950"
              >
                {/* Term name */}
                <span className="shrink-0 font-bold text-sm text-gray-900 dark:text-gray-100 min-w-[80px] max-w-[120px] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {term.term}
                </span>

                {/* Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {renderCategoryBadge(term.category)}
                  {renderRiskBadge(term.riskLevel)}
                </div>

                {/* Meaning (truncated) */}
                <span className="flex-1 text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                  {truncate(term.meaning, 80)}
                </span>

                {/* Arrow */}
                <ChevronRight className="shrink-0 h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>

          {/* Load more */}
          {hasMoreGlossary && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setGlossaryPage((p) => p + 1)}
                className="h-9 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                Carregar mais
                <span className="text-xs text-gray-400 ml-2">
                  ({pagedGlossary.length}/{filteredGlossary.length})
                </span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // =========================================================================
  // Sheet content (category / region detail)
  // =========================================================================
  const renderSheetContent = () => (
    <div className="flex flex-col h-full">
      <SheetHeader className="pb-2">
        <SheetTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          {sheetTitle}
        </SheetTitle>
        <SheetDescription>
          {sheetTerms.length} {sheetTerms.length === 1 ? "termo encontrado" : "termos encontrados"}
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-1.5 pb-4">
          {sheetTerms.map((term) => (
            <button
              key={term.term}
              onClick={() => {
                setSheetOpen(false);
                onSearchTerm(term.term);
              }}
              className="group w-full flex items-start gap-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-2.5 text-left hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-150"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {term.term}
                  </span>
                  {renderRiskBadge(term.riskLevel)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {term.meaning}
                </p>
              </div>
              <ChevronRight className="shrink-0 h-4 w-4 mt-1 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  // =========================================================================
  // Main render
  // =========================================================================
  return (
    <section className="w-full max-w-4xl mx-auto space-y-5">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/50">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              subTab === tab.id
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {subTab === "categorias" && renderCategorias()}
      {subTab === "regioes" && renderRegioes()}
      {subTab === "glossario" && renderGlossario()}

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full">
          {renderSheetContent()}
        </SheetContent>
      </Sheet>
    </section>
  );
}
