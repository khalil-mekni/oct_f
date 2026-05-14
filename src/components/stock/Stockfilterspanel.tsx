"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Calendar,
  Warehouse,
  Package,
  Tag,
} from "lucide-react";
import { StockFilters, StockHistoryItem } from "@/types/stock";

type Props = {
  filters: StockFilters;
  search: string;
  items: StockHistoryItem[];
  onFiltersChange: (f: StockFilters) => void;
  onSearchChange: (s: string) => void;
  onApply: () => void;
  onReset: () => void;
  loading?: boolean;
  resultCount: number;
};

// ─── Style tokens ──────────────────────────────────────────────────────────────

const labelCls =
  "mb-1.5 block text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500";

const inputCls =
  "w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3.5 py-2.5 text-sm font-bold text-[#1C2434] outline-none transition-all placeholder:text-gray-300 focus:border-[#00A09D]/30 focus:bg-white focus:ring-2 focus:ring-[#00A09D]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

const selectCls = `${inputCls} cursor-pointer appearance-none pr-9`;

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function FilterField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[#00A09D]">{icon}</span>
        <label className={labelCls}>{label}</label>
      </div>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockFiltersPanel({
  filters,
  search,
  items,
  onFiltersChange,
  onSearchChange,
  onApply,
  onReset,
  loading,
  resultCount,
}: Props) {
  const [open, setOpen] = useState(true);

  // Deduplicate selects from loaded items
  const entrepots = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => {
      if (i.entrepot) map.set(i.entrepot.id, i.entrepot.nom);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const lots = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => {
      if (i.lot) map.set(i.lot.id, i.lot.code_lot);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const emballages = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((i) => {
      if (i.emballage) map.set(i.emballage.id, i.emballage.code);
    });
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const set =
    (key: keyof StockFilters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onFiltersChange({ ...filters, [key]: e.target.value });

  const hasActiveFilters =
    !!filters.entrepotId ||
    !!filters.lotId ||
    !!filters.emballageId ||
    !!filters.from ||
    !!filters.to;

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00A09D]/10">
            <SlidersHorizontal size={15} className="text-[#00A09D]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-[1000] uppercase tracking-tight text-[#1C2434] dark:text-white">
              Filtres
            </span>
            <span className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {resultCount} résultat{resultCount !== 1 ? "s" : ""}
            </span>
            {hasActiveFilters && (
              <span
                className="h-2 w-2 rounded-full bg-[#00A09D]"
                title="Filtres actifs"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800"
          >
            <RotateCcw size={11} />
            Réinitialiser
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
            {open ? "Masquer" : "Afficher"}
          </button>
        </div>
      </div>

      {/* ── Filter fields (collapsible) ── */}
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-6">

            {/* Entrepôt */}
            <FilterField label="Entrepôt" icon={<Warehouse size={12} />}>
              <SelectWrapper>
                <select
                  value={filters.entrepotId}
                  onChange={set("entrepotId")}
                  className={selectCls}
                >
                  <option value="">Tous</option>
                  {entrepots.map(([id, nom]) => (
                    <option key={id} value={id}>{nom}</option>
                  ))}
                </select>
              </SelectWrapper>
            </FilterField>

            {/* Lot */}
            <FilterField label="Lot" icon={<Tag size={12} />}>
              <SelectWrapper>
                <select
                  value={filters.lotId}
                  onChange={set("lotId")}
                  className={selectCls}
                >
                  <option value="">Tous</option>
                  {lots.map(([id, code]) => (
                    <option key={id} value={id}>{code}</option>
                  ))}
                </select>
              </SelectWrapper>
            </FilterField>

            {/* Emballage */}
            <FilterField label="Emballage" icon={<Package size={12} />}>
              <SelectWrapper>
                <select
                  value={filters.emballageId}
                  onChange={set("emballageId")}
                  className={selectCls}
                >
                  <option value="">Tous</option>
                  {emballages.map(([id, code]) => (
                    <option key={id} value={id}>{code}</option>
                  ))}
                </select>
              </SelectWrapper>
            </FilterField>

            {/* Date from — optionnel */}
            <FilterField label="Du (optionnel)" icon={<Calendar size={12} />}>
              <input
                type="datetime-local"
                value={filters.from}
                onChange={set("from")}
                className={inputCls}
              />
            </FilterField>

            {/* Date to — optionnel */}
            <FilterField label="Au (optionnel)" icon={<Calendar size={12} />}>
              <input
                type="datetime-local"
                value={filters.to}
                onChange={set("to")}
                className={inputCls}
              />
            </FilterField>

            {/* Apply */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={onApply}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1C2434] py-[11px] text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#00A09D] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search size={13} />
                )}
                Rechercher
              </button>
            </div>
          </div>

          {/* Helper note about date filters */}
          {(!filters.from && !filters.to) && (
            <div className="border-t border-gray-50 px-6 pb-4 dark:border-gray-800">
              <p className="text-[10px] font-bold text-amber-500">
                ⚡ Aucune date sélectionnée — tous les mouvements sont affichés.
                Utilisez les filtres date pour restreindre les résultats.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="border-t border-gray-50 px-6 py-3.5 dark:border-gray-800">
        <div className="relative group">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#00A09D]"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Recherche rapide : dépôt, lot, emballage, sens..."
            className="w-full rounded-2xl border-2 border-transparent bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-medium text-[#1C2434] outline-none transition-all placeholder:text-gray-300 focus:border-[#00A09D]/20 focus:bg-white focus:ring-2 focus:ring-[#00A09D]/10 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}