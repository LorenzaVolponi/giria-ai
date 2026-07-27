"use client";

import Link from "next/link";
import { Menu, Search, Sparkles } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/girias", label: "Dicionário" },
  { href: "/guias", label: "Guias" },
  { href: "/girias/regionais", label: "Regionais" },
  { href: "#tradutor", label: "Pergunte à IA" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg">Gíria AI</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-600 transition hover:text-emerald-600 dark:text-slate-300">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/girias" aria-label="Pesquisar gírias" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-300">
            <Search className="h-4 w-4" />
          </Link>
          <Link href="#tradutor" className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-600 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-400">
            Traduzir uma gíria
          </Link>
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Abrir menu" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 md:hidden dark:border-slate-800">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
