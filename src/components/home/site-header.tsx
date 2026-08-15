"use client";

import Link from "next/link";
import { Search, Sparkles } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-black tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg">Gíria AI</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 dark:text-slate-300 lg:flex" aria-label="Navegação principal">
          <Link href="/girias" className="transition hover:text-emerald-600">Dicionário</Link>
          <Link href="/guias" className="transition hover:text-emerald-600">Guias</Link>
          <Link href="/observatorio" className="transition hover:text-emerald-600">Observatório</Link>
          <Link href="/sobre" className="transition hover:text-emerald-600">Sobre</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/girias"
            aria-label="Explorar dicionário de gírias"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-300 lg:hidden"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Dicionário</span>
          </Link>

          <Link
            href="/o-que-significa"
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-600 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-400"
          >
            Entender uma gíria
          </Link>
        </div>
      </div>
    </header>
  );
}
