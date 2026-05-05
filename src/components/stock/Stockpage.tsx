"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listStockHistory } from "@/lib/stock.api";
import { StockFilters, StockHistoryItem } from "@/types/stock";
import { toDateTimeLocalInputValue, toGraphqlDateTime } from "./stock.util";
import StockStatCards from "./Stockstatcards";
import StockFiltersPanel from "./Stockfilterspanel";
import StockTable from "./Stocktable ";
import StockPagination from "./Stockpagination";
import { BarChart2, Download, RefreshCcw } from "lucide-react";

type SortKey = "date_stock" | "quantite";
type SortDir = "asc" | "desc";

const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

function defaultFilters(): StockFilters {
  return {
    entrepotId: "",
    emballageId: "",
    lotId: "",
    from: toDateTimeLocalInputValue(firstDay),
    to: toDateTimeLocalInputValue(today, true),
  };
}

export default function StockPage() {
  const [allItems, setAllItems] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Two-phase filters: draft (in panel) vs applied (sent to API)
  const [draftFilters, setDraftFilters] = useState<StockFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<StockFilters>(defaultFilters);
  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("date_stock");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const load = useCallback(async (f: StockFilters) => {
    try {
      setLoading(true);
      setError("");
      const data = await listStockHistory({
        entrepotId: f.entrepotId || null,
        emballageId: f.emballageId || null,
        lotId: f.lotId || null,
        from: toGraphqlDateTime(f.from),
        to: toGraphqlDateTime(f.to, true),
      });
      setAllItems(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement.");
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(appliedFilters); }, []);

  function handleApply() {
    setAppliedFilters(draftFilters);
    load(draftFilters);
  }

  function handleReset() {
    const f = defaultFilters();
    setDraftFilters(f);
    setAppliedFilters(f);
    setSearch("");
    setPage(1);
    load(f);
  }

  function handleSort(key: SortKey) {
    setSortDir((d) => (sortKey === key ? (d === "asc" ? "desc" : "asc") : "desc"));
    setSortKey(key);
    setPage(1);
  }

  // Client-side search (across already-loaded items)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) => {
      const hay = [
        item.entrepot?.nom,
        item.emballage?.code,
        item.lot?.code_lot,
        item.sens === "E" ? "entrée" : "sortie",
        String(item.quantite ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allItems, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date_stock")
        cmp = new Date(a.date_stock).getTime() - new Date(b.date_stock).getTime();
      else if (sortKey === "quantite")
        cmp = Number(a.quantite) - Number(b.quantite);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  // CSV export
  function exportCsv() {
    const header = ["ID", "Date", "Dépôt", "Code Lot", "Code Emballage", "Sens", "Quantité"];
    const rows = sorted.map((i) => [
      i.id,
      i.date_stock,
      i.entrepot?.nom ?? "",
      i.lot?.code_lot ?? "",
      i.emballage?.code ?? "",
      i.sens === "E" ? "Entrée" : "Sortie",
      Number(i.quantite),
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <BarChart2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900">
                Historique du Stock
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Journal des mouvements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={sorted.length === 0}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => load(appliedFilters)}
              className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <RefreshCcw size={13} className="transition-transform duration-500 group-hover:rotate-180" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl space-y-4 px-4 py-5 md:px-5">
        {/* Stats */}
        <StockStatCards items={filtered} />

        {/* Filters — pass allItems so selects can be populated */}
        <StockFiltersPanel
          filters={draftFilters}
          search={search}
          items={allItems}
          onFiltersChange={setDraftFilters}
          onSearchChange={(s) => { setSearch(s); setPage(1); }}
          onApply={handleApply}
          onReset={handleReset}
          loading={loading}
          resultCount={filtered.length}
        />

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
            ⚠️ {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Table header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-black text-slate-800">Journal des flux</h2>
              <p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-400">
                Page {page} sur {Math.max(1, Math.ceil(sorted.length / perPage))} &middot;{" "}
                {sorted.length} mouvement{sorted.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <StockTable
            items={paginated}
            loading={loading}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />

          <StockPagination
            page={page}
            perPage={perPage}
            total={sorted.length}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </div>
      </main>
    </div>
  );
}