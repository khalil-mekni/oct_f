"use client";

import { Search, Plus, RefreshCcw, Warehouse, Filter } from "lucide-react";

interface Props {
  count: number;
  query: string;
  setQuery: (q: string) => void;
  onOpenNew: () => void;
  onRefresh?: () => void;
}

export const EntrepotR = ({
  count,
  query,
  setQuery,
  onOpenNew,
  onRefresh,
}: Props) => {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Titre et sous-titre */}
          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-[#00A09D]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#00A09D]">
              <Warehouse size={12} />
              Smart Packaging Logistics
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00A09D] to-[#008784] shadow-lg">
                <Warehouse size={24} className="text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  Entrepôts
                </h1>
                <p className="text-sm text-slate-500">
                  Gestion des dépôts et de leur capacité
                </p>
              </div>
            </div>
          </div>

          {/* Bouton principal */}
          
        </div>

        {/* Barre de recherche et compteur */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, adresse, lot, emballage..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-[#00A09D] focus:ring-4 focus:ring-[#00A09D]/20"
            />
          </div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-[#00A09D]/30"
              >
                <RefreshCcw size={16} />
                Actualiser
              </button>
            )}

            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00A09D]/10 to-[#008784]/10 px-4 py-2">
              <span className="text-2xl font-black text-[#00A09D]">{count}</span>
              <span className="text-sm font-medium text-slate-600">entrepôt(s)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};