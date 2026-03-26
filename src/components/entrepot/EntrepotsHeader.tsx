"use client";

import { Search, Plus, RefreshCcw, Warehouse } from "lucide-react";

interface Props {
  count: number;
  query: string;
  setQuery: (q: string) => void;
  onOpenNew: () => void;
  onRefresh?: () => void;
}

export const EntrepotsHeader = ({
  count,
  query,
  setQuery,
  onOpenNew,
  onRefresh,
}: Props) => {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00A09D]">
              Smart Packaging Logistics
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00A09D]/10 text-[#00A09D]">
                <Warehouse size={20} />
              </div>

              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">
                  Entrepôts
                </h1>
                <p className="text-sm text-slate-500">
                  Gestion des capacités, stocks et lots par entrepôt
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[560px]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher nom, adresse, lot, emballage..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#00A09D] focus:ring-4 focus:ring-[#00A09D]/10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <RefreshCcw size={16} />
                    Actualiser
                  </button>
                )}

                <button
                  type="button"
                  onClick={onOpenNew}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00A09D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#008784]"
                >
                  <Plus size={16} />
                  Nouvel entrepôt
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                <span className="font-bold text-slate-900">{count}</span>
                <span>entrepôt(s) au total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};