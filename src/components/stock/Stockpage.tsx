"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listStockHistory } from "@/lib/stock.api";
import { StockFilters, StockHistoryItem } from "@/types/stock";
import { toDateTimeLocalInputValue, toGraphqlDateTime } from "./stock.util";
import StockStatCards from "./Stockstatcards";
import StockFiltersPanel from "./Stockfilterspanel";
import StockTable from "./Stocktable ";
import StockPagination from "./Stockpagination";
import {
  BarChart2,
  Download,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";

type SortKey = "date_stock" | "quantite";
type SortDir = "asc" | "desc";

// ── Default date range: current month ─────────────────────────────────────────
function defaultFilters(): StockFilters {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    entrepotId: "",
    emballageId: "",
    lotId: "",
    // No date filter by default → fetch everything
    from: "",
    to: "",
  };
}

export default function StockPage() {
  const [allItems, setAllItems] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [draftFilters, setDraftFilters] = useState<StockFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<StockFilters>(defaultFilters);
  const [search, setSearch] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("date_stock");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // ── Data ──────────────────────────────────────────────────────────────────────

  const load = useCallback(async (f: StockFilters) => {
    try {
      setLoading(true);
      setError("");

      // Only send non-empty values so Laravel does not filter unnecessarily
      const params = {
        entrepotId: f.entrepotId || null,
        emballageId: f.emballageId || null,
        lotId: f.lotId || null,
        from: f.from ? toGraphqlDateTime(f.from) : null,
        to: f.to ? toGraphqlDateTime(f.to, true) : null,
      };

      const data = await listStockHistory(params);
      setAllItems(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement.");
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount with no date filter to get ALL stocks
  useEffect(() => {
    load(defaultFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────

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
    setSortDir((d) =>
      sortKey === key ? (d === "asc" ? "desc" : "asc") : "desc"
    );
    setSortKey(key);
    setPage(1);
  }

  // ── Client-side filter ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) => {
      const hay = [
        item.entrepot?.nom,
        item.emballage?.code,
        item.emballage?.name,
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

  // ── Sort ──────────────────────────────────────────────────────────────────────

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date_stock")
        cmp =
          new Date(a.date_stock).getTime() - new Date(b.date_stock).getTime();
      else if (sortKey === "quantite")
        cmp = Number(a.quantite) - Number(b.quantite);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Paginate ──────────────────────────────────────────────────────────────────

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page, perPage]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));

  // ── CSV export ────────────────────────────────────────────────────────────────

  function exportCsv() {
    const header = [
      "ID", "Date", "Dépôt", "Code Lot", "Code Emballage",
      "Sens", "Qté Init", "Quantité", "Qté Finale",
    ];
    const rows = sorted.map((i) => [
      i.id,
      i.date_stock,
      i.entrepot?.nom ?? "",
      i.lot?.code_lot ?? "",
      i.emballage?.code ?? "",
      i.sens === "E" ? "Entrée" : "Sortie",
      Number(i.quantite_init ?? 0),
      Number(i.quantite),
      Number(i.quantite_finale ?? 0),
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

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-gray-950">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00A09D]">
              <BarChart2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-[1000] uppercase tracking-tighter text-[#1C2434] dark:text-white">
                Historique du Stock<span className="text-[#00A09D]">.</span>
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                Journal des mouvements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={sorted.length === 0}
              className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 shadow-sm transition-all hover:border-[#00A09D]/20 hover:bg-[#00A09D]/5 hover:text-[#00A09D] disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => load(appliedFilters)}
              disabled={loading}
              className="group flex items-center gap-2 rounded-xl bg-[#1C2434] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#00A09D] disabled:opacity-60"
            >
              <RefreshCcw
                size={13}
                className={`transition-transform duration-500 ${
                  loading ? "animate-spin" : "group-hover:rotate-180"
                }`}
              />
              <span className="hidden sm:inline">
                {loading ? "Chargement..." : "Actualiser"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 md:px-6">

        {/* KPI Cards */}
        <StockStatCards items={filtered} />

        {/* Filters */}
        <StockFiltersPanel
          filters={draftFilters}
          search={search}
          items={allItems}
          onFiltersChange={setDraftFilters}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          onApply={handleApply}
          onReset={handleReset}
          loading={loading}
          resultCount={filtered.length}
        />

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {/* Table card */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* Sub-header */}
          <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-gray-800">
            <div>
              <h2 className="text-sm font-[1000] uppercase tracking-tight text-[#1C2434] dark:text-white">
                Journal des flux<span className="text-[#00A09D]">.</span>
              </h2>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Page {page} / {totalPages} &middot;{" "}
                {sorted.length} mouvement{sorted.length !== 1 ? "s" : ""}
                {allItems.length !== sorted.length && (
                  <span className="ml-1 text-gray-300">
                    ({allItems.length} au total)
                  </span>
                )}
              </p>
            </div>

            {loading && (
              <div className="flex items-center gap-2 rounded-xl border border-[#00A09D]/20 bg-[#00A09D]/5 px-3 py-1.5">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#00A09D] border-t-transparent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00A09D]">
                  Actualisation...
                </span>
              </div>
            )}
          </div>

          {/* Table */}
          <StockTable
            items={paginated}
            loading={loading}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
          />

          {/* Pagination */}
          <StockPagination
            page={page}
            perPage={perPage}
            total={sorted.length}
            onPageChange={setPage}
            onPerPageChange={(n) => {
              setPerPage(n);
              setPage(1);
            }}
          />
        </div>
      </main>
    </div>
  );
}