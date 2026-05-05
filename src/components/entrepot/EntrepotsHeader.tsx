"use client";

import { Search, Plus, RefreshCcw, Warehouse } from "lucide-react";

interface Props {
  count: number;
  query: string;
  setQuery: (q: string) => void;
  onOpenNew: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const EntrepotsHeader = ({
  count,
  query,
  setQuery,
  onOpenNew,
  onRefresh,
  loading,
}: Props) => {
  return (
    <div className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto max-w-[1600px] px-6 py-5">
        {/* Top row: title + actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: page identity */}
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#00A09D]">
              <Warehouse size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#00A09D]">
                Multigestion
              </p>
              <h1 className="text-2xl font-[1000] uppercase leading-none tracking-tighter text-[#1C2434] dark:text-white">
                Entrepôts<span className="text-[#00A09D]">.</span>
              </h1>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2.5">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="group flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 shadow-sm transition-all hover:border-[#00A09D]/20 hover:bg-[#00A09D]/5 hover:text-[#00A09D] disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                <RefreshCcw
                  size={13}
                  className={`transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
                />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNew}
              className="flex items-center gap-2 rounded-xl border-2 border-[#1C2434] bg-[#1C2434] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_rgba(0,160,157,0.4)] transition-all hover:bg-[#00A09D] hover:border-[#00A09D] active:translate-y-0.5 active:shadow-none dark:border-white dark:bg-transparent dark:text-white"
            >
              <Plus size={14} strokeWidth={3} />
              Nouvel entrepôt
            </button>
          </div>
        </div>

        {/* Bottom row: search + count */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-lg group">
            <Search
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#00A09D]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, adresse, lot, emballage..."
              className="w-full rounded-2xl border-2 border-transparent bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-medium text-[#1C2434] outline-none transition-all placeholder:text-gray-400 focus:border-[#00A09D]/20 focus:bg-white focus:ring-2 focus:ring-[#00A09D]/10 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Count badge */}
          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
            <span className="text-xl font-[1000] tracking-tighter text-[#1C2434] dark:text-white">
              {count}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              entrepôt{count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};