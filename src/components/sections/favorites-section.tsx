"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Heart,
  Trash2,
  Search,
  X,
  BookOpen,
  Star,
  AlertTriangle,
  MapPin,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getTerm,
  CATEGORIES,
  RISK_CONFIG,
  type SlangTerm,
  type RiskLevel,
} from "@/lib/slang-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FavoritesSectionProps {
  onSearchTerm: (term: string) => void;
  onExplore: () => void;
}

type SortMode = "recent" | "az" | "category";

// ---------------------------------------------------------------------------
// Local Storage helpers
// ---------------------------------------------------------------------------
const FAVORITES_KEY = "giria-ai-favorites";

function loadFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

// ---------------------------------------------------------------------------
// Sub-component: Stats bar
// ---------------------------------------------------------------------------
function StatsBar({
  total,
  terms,
}: {
  total: number;
  terms: SlangTerm[];
}) {
  // Category breakdown — top 3 categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of terms) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [terms]);

  // Average risk level — map to numeric then back
  const riskNumeric: Record<RiskLevel, number> = {
    green: 0,
    yellow: 1,
    orange: 2,
    red: 3,
  };
  const numericToRisk = (n: number): RiskLevel => {
    if (n <= 0.5) return "green";
    if (n <= 1.5) return "yellow";
    if (n <= 2.5) return "orange";
    return "red";
  };

  const avgRiskLevel = useMemo(() => {
    if (terms.length === 0) return null;
    const sum = terms.reduce((acc, t) => acc + riskNumeric[t.riskLevel], 0);
    const avg = sum / terms.length;
    return numericToRisk(avg);
  }, [terms]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 px-4 py-3">
      {/* Total count */}
      <div className="flex items-center gap-1.5">
        <Heart className="h-4 w-4 text-rose-500" />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {total}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {total === 1 ? "favorito" : "favoritos"}
        </span>
      </div>

      <div className="hidden sm:block h-4 w-px bg-emerald-300 dark:bg-emerald-700" />

      {/* Top 3 categories */}
      {categoryCounts.map(([cat, count]) => {
        const catMeta = CATEGORIES.find((c) => c.name === cat);
        return (
          <Badge
            key={cat}
            variant="secondary"
            className="text-xs font-medium bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            {catMeta?.icon ?? "💬"} {catMeta?.label ?? cat} ({count})
          </Badge>
        );
      })}

      {/* Average risk indicator */}
      {avgRiskLevel && (
        <>
          <div className="hidden sm:block h-4 w-px bg-emerald-300 dark:bg-emerald-700" />
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Risco médio:
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${RISK_CONFIG[avgRiskLevel].bgColor} ${RISK_CONFIG[avgRiskLevel].textColor}`}
            >
              {RISK_CONFIG[avgRiskLevel].label}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Single favorite card
// ---------------------------------------------------------------------------
function FavoriteCard({
  term,
  onSearch,
  onUnfavorite,
}: {
  term: SlangTerm;
  onSearch: (term: string) => void;
  onUnfavorite: (term: string) => void;
}) {
  const catMeta = CATEGORIES.find((c) => c.name === term.category);
  const riskCfg = RISK_CONFIG[term.riskLevel];

  return (
    <Card
      className="group relative cursor-pointer transition-all duration-200 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 border border-gray-200 dark:border-gray-700 overflow-hidden"
      onClick={() => onSearch(term.term)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Top row: term name + heart */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
            {term.term}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnfavorite(term.term);
            }}
            className="shrink-0 rounded-full p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200 active:scale-90"
            aria-label={`Remover ${term.term} dos favoritos`}
          >
            <Heart className="h-5 w-5 fill-red-500 transition-transform duration-200 group-hover:scale-110" />
          </button>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Category badge */}
          <Badge
            variant="secondary"
            className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
          >
            {catMeta?.icon ?? "💬"} {catMeta?.label ?? term.category}
          </Badge>

          {/* Risk badge */}
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${riskCfg.bgColor} ${riskCfg.textColor} border-current/10`}
          >
            {riskCfg.label}
          </span>

          {/* Region badge */}
          {term.region && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
              <MapPin className="h-3 w-3" />
              {term.region}
            </span>
          )}
        </div>

        {/* Meaning preview */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
          {term.meaning}
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function FavoritesSection({
  onSearchTerm,
  onExplore,
}: FavoritesSectionProps) {
  // --- State ---
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { const raw = localStorage.getItem(FAVORITES_KEY); return raw ? (JSON.parse(raw) as string[]) : []; } catch { return []; }
  });
  const [searchFilter, setSearchFilter] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  // --- Toggle favorite (remove only in this context) ---
  const removeFavorite = useCallback((term: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f !== term);
      saveFavorites(next);
      return next;
    });
  }, []);

  // --- Clear all favorites ---
  const clearAll = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, []);

  // --- Resolve favorites to full SlangTerm objects ---
  const favoriteTerms = useMemo(
    () =>
      favorites
        .map((f) => getTerm(f))
        .filter((t): t is SlangTerm => !!t),
    [favorites]
  );

  // --- Apply search filter ---
  const filteredTerms = useMemo(() => {
    if (!searchFilter.trim()) return favoriteTerms;
    const q = searchFilter.toLowerCase();
    return favoriteTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.meaning.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [favoriteTerms, searchFilter]);

  // --- Sort terms ---
  const sortedTerms = useMemo(() => {
    const copy = [...filteredTerms];
    switch (sortMode) {
      case "recent":
        // "recent" = order added (reverse of favorites array, which is append-only)
        return copy.reverse();
      case "az":
        return copy.sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));
      case "category":
        return copy.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category, "pt-BR");
          if (catCompare !== 0) return catCompare;
          return a.term.localeCompare(b.term, "pt-BR");
        });
      default:
        return copy;
    }
  }, [filteredTerms, sortMode]);

  // --- Don't render empty state until client-side is ready ---
  if (typeof window === "undefined") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  // =========================================================================
  // Empty State
  // =========================================================================
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-6">
          <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Nenhum favorito ainda
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          Toque no coração ao traduzir uma gíria para salvá-la aqui
        </p>
        <Button
          onClick={onExplore}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Explorar Gírias
        </Button>
      </div>
    );
  }

  // =========================================================================
  // Favorites View
  // =========================================================================
  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <StatsBar total={favorites.length} terms={favoriteTerms} />

      {/* Controls row: search, sort, clear all */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar nos favoritos..."
            className="pl-9 pr-9 h-10"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
          {([
            { value: "recent" as SortMode, label: "Recentes" },
            { value: "az" as SortMode, label: "A-Z" },
            { value: "category" as SortMode, label: "Categoria" },
          ] as const).map((option) => (
            <button
              key={option.value}
              onClick={() => setSortMode(option.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                sortMode === option.value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {option.label}
            </button>
          ))}
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 ml-1" />
        </div>

        {/* Clear all button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-700 dark:hover:text-red-300 shrink-0"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Limpar tudo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar todos os favoritos?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá remover todos os {favorites.length}{" "}
                {favorites.length === 1 ? "favorito salvo" : "favoritos salvos"}.
                Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={clearAll}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sim, limpar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Results count when filtering */}
      {searchFilter && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {sortedTerms.length}{" "}
          {sortedTerms.length === 1 ? "resultado encontrado" : "resultados encontrados"}{" "}
          para &ldquo;{searchFilter}&rdquo;
        </p>
      )}

      {/* Favorites Grid */}
      {sortedTerms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sortedTerms.map((term) => (
            <FavoriteCard
              key={term.term}
              term={term}
              onSearch={onSearchTerm}
              onUnfavorite={removeFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum favorito encontrado para &ldquo;{searchFilter}&rdquo;
          </p>
          <button
            onClick={() => setSearchFilter("")}
            className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Limpar busca
          </button>
        </div>
      )}
    </div>
  );
}
