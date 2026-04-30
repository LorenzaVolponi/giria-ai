"use client";

import { useState, useCallback, useRef } from "react";
import { Search, Send, X, BookOpen, Users, GraduationCap, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TranslationResult {
  slang: string;
  meaning: string;
  context: string;
  example: string;
  category: string;
  synonyms: string[];
}

export default function SlangSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const translate = useCallback(async (slang: string) => {
    const term = slang.trim();
    if (!term) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setQuery(term);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slang: term }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro na tradução");
      }
      const data = await res.json();
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    translate(query);
  };

  const copyResult = async () => {
    if (!result) return;
    const text = `Gíria: ${result.slang}\nSignificado: ${result.meaning}\nContexto: ${result.context}\nExemplo: "${result.example}"`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative max-w-xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center bg-background rounded-xl border-2 border-emerald-500/30 focus-within:border-emerald-500 shadow-lg shadow-emerald-500/5">
          <Search className="w-5 h-5 text-muted-foreground ml-3.5 shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Digite uma gíria... (ex: "de boa", "crashou")'
            className="flex-1 h-12 sm:h-13 text-sm px-3 border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
            disabled={loading}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResult(null); setError(null); }}
              className="p-1.5 mr-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-10 sm:h-11 mr-1.5 px-4 sm:px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-sm">
              {loading ? "Traduzindo..." : "Traduzir"}
            </span>
          </Button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-3">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3 flex items-center gap-2">
              <X className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-3">
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-sm font-medium">Traduzindo &quot;{query}&quot;...</p>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 rounded-full bg-muted animate-pulse w-4/5" />
                <div className="h-2 rounded-full bg-muted animate-pulse w-3/5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div ref={resultRef} className="mt-3">
          <Card className="border-2 border-emerald-500/20 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{result.slang}</h3>
                    {result.category && (
                      <Badge className="text-[10px] bg-white/20 text-white border-0">
                        {result.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyResult}
                  className="text-white/80 hover:text-white hover:bg-white/20 h-7 w-7"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Significado</span>
                </div>
                <p className="text-sm sm:text-base font-medium leading-relaxed">{result.meaning}</p>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Contexto</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{result.context}</p>
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Exemplo</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <p className="text-xs sm:text-sm italic leading-relaxed">&quot;{result.example}&quot;</p>
                </div>
              </div>
              {result.synonyms && result.synonyms.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sinônimos</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.synonyms.map((syn) => (
                        <button
                          key={syn}
                          onClick={() => { setQuery(syn); translate(syn); }}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors cursor-pointer"
                        >
                          {syn}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
