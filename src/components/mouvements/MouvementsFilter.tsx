"use client";

import React from "react";
import { Search, SlidersHorizontal, Calendar, Warehouse } from "lucide-react";

interface EntrepotOption {
  id: string;
  nom: string;
}

interface Props {
  search: string;
  setSearch: (s: string) => void;
  total: number;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  entrepotFilter: string;
  setEntrepotFilter: (id: string) => void;
  entrepots: EntrepotOption[];
  statutFilter: string;
  setStatutFilter: (s: string) => void;
}

export default function MouvementsFilter({
  search,
  setSearch,
  total,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  entrepotFilter,
  setEntrepotFilter,
  entrepots,
  statutFilter,
  setStatutFilter,
}: Props) {
  const hasActiveFilters =
    !!dateFrom || !!dateTo || !!entrepotFilter || !!statutFilter;

  function clearAll() {
    setDateFrom("");
    setDateTo("");
    setEntrepotFilter("");
    setStatutFilter("");
    setSearch("");
  }

  return (
    <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Top row: search + total */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#00A09D]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Code, lot, entrepôt, emballage..."
            className="w-full rounded-2xl border-2 border-transparent bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium text-[#1C2434] outline-none transition-all placeholder:text-gray-400 focus:border-[#00A09D]/30 focus:bg-white focus:ring-4 focus:ring-[#00A09D]/5 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Statut */}
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="rounded-2xl border-2 border-transparent bg-gray-50 px-4 py-3 text-sm font-bold text-[#1C2434] outline-none transition-all focus:border-[#00A09D]/30 focus:bg-white dark:bg-gray-800 dark:text-white"
        >
          <option value="">Tous les statuts</option>
          <option value="BROUILLON">Brouillon</option>
          <option value="VALIDE">Validé</option>
        </select>

        {/* Total badge */}
        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
              Total
            </span>
            <span className="block text-lg font-[1000] leading-none tracking-tighter text-[#1C2434] dark:text-white">
              {total}
            </span>
          </div>
        </div>
      </div>

      {/* Second row: date + entrepôt filters */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
          <Calendar size={15} className="shrink-0 text-[#00A09D]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Du
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent text-sm font-bold text-[#1C2434] outline-none dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
          <Calendar size={15} className="shrink-0 text-[#00A09D]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Au
          </span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent text-sm font-bold text-[#1C2434] outline-none dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
          <Warehouse size={15} className="shrink-0 text-[#00A09D]" />
          <select
            value={entrepotFilter}
            onChange={(e) => setEntrepotFilter(e.target.value)}
            className="bg-transparent text-sm font-bold text-[#1C2434] outline-none dark:text-white"
          >
            <option value="">Tous les entrepôts</option>
            {entrepots.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-2xl bg-red-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 transition-colors hover:bg-red-100"
          >
            <SlidersHorizontal size={13} />
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}