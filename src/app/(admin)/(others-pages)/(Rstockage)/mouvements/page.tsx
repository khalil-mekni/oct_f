"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import MouvementStockFormModal from "@/components/mouvements/MouvementStockFormModal";
import MouvementsFilter from "@/components/mouvements/MouvementsFilter";
import {
  fetchMouvements,
  createMouvementDraft,
  validateMouvement,
  deleteMouvementDraft,
  type MouvementStockRow,
} from "@/lib/mouvement.api";
import { fetchEntrepots, type Entrepot } from "@/lib/entrepot.api";
import { listEmballages } from "@/lib/emballages.api";
import {
  Plus,
  History,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Warehouse,
  AlertTriangle,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTypeStyle(type: string) {
  switch (type) {
    case "ENT": return "bg-blue-50 text-blue-700 border-blue-200";
    case "CDD": return "bg-violet-50 text-violet-700 border-violet-200";
    case "PTE": return "bg-red-50 text-red-700 border-red-200";
    case "PRD": return "bg-amber-50 text-amber-700 border-amber-200";
    case "SPL": return "bg-cyan-50 text-cyan-700 border-cyan-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    ENT: "Entrée",
    CDD: "Transfert",
    PTE: "Perte",
    PRD: "Production",
    SPL: "Surplus",
  };
  return map[type] ?? type;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MouvementsPage() {
  const [items, setItems] = useState<MouvementStockRow[]>([]);
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [emballages, setEmballages] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Filters
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entrepotFilter, setEntrepotFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");

  // Sort: most recent first by default
  const [sortAsc, setSortAsc] = useState(false);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, dateFrom, dateTo, entrepotFilter, statutFilter]);

  // ─── Data loading ────────────────────────────────────────────────────────────

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [mouvs, deps, embs] = await Promise.all([
        fetchMouvements(1, 1000), // Fetch 1000 items for better client-side filtering
        fetchEntrepots(),
        listEmballages(1, 100),
      ]);

      setItems(Array.isArray(mouvs?.data) ? mouvs.data : []);
      setEntrepots(Array.isArray(deps) ? deps : []);
      setEmballages(
        Array.isArray(embs?.emballages?.data) ? embs.emballages.data : []
      );
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors du chargement.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function handleCreate(input: Parameters<typeof createMouvementDraft>[0]) {
    try {
      setError("");
      setCreatingDraft(true);
      await createMouvementDraft(input);
      setOpenForm(false);
      setPage(1);
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la création du brouillon.");
    } finally {
      setCreatingDraft(false);
    }
  }

  async function handleValidate(id: string) {
    const ok = window.confirm("Confirmer la validation ? Le stock sera modifié.");
    if (!ok) return;
    try {
      setError("");
      setValidatingId(id);
      await validateMouvement(id);
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la validation.");
    } finally {
      setValidatingId(null);
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Supprimer ce brouillon définitivement ?");
    if (!ok) return;
    try {
      setError("");
      setDeletingId(id);
      await deleteMouvementDraft(id);
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Client-side filter + sort ────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => {
        const hay = [
          item.code_mouvement,
          item.type_mouvement,
          item.statut,
          item.emballage?.code,
          item.emballage?.name,
          item.lot?.code_lot,
          item.entrepotSource?.nom,
          item.entrepotDestination?.nom,
          String(item.quantite ?? ""),
          formatDate(item.date_mouvement),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    // Statut filter
    if (statutFilter) {
      result = result.filter((item) => item.statut === statutFilter);
    }

    // Entrepôt filter (source OR destination)
    if (entrepotFilter) {
      result = result.filter(
        (item) =>
          String(item.entrepotSource?.id) === entrepotFilter ||
          String(item.entrepotDestination?.id) === entrepotFilter
      );
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter((item) => {
        const t = new Date(item.date_mouvement ?? 0).getTime();
        return t >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59").getTime();
      result = result.filter((item) => {
        const t = new Date(item.date_mouvement ?? 0).getTime();
        return t <= to;
      });
    }

    // Sort
    result.sort((a, b) => {
      const ta = new Date(a.date_mouvement ?? 0).getTime();
      const tb = new Date(b.date_mouvement ?? 0).getTime();
      let cmp = tb - ta;
      if (cmp === 0) {
        const ca = new Date(a.created_at ?? 0).getTime();
        const cb = new Date(b.created_at ?? 0).getTime();
        cmp = cb - ca;
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [items, search, statutFilter, entrepotFilter, dateFrom, dateTo, sortAsc]);

  // ─── Pagination ───────────────────────────────────────────────────────────────

  const lastPage = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredItems.slice(start, start + perPage);
  }, [filteredItems, page, perPage]);

  const pageNumbers = useMemo(() => {
    if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(lastPage - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < lastPage - 2) pages.push("...");
    pages.push(lastPage);
    return pages;
  }, [page, lastPage]);

  // ─── Stats ────────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const brouillons = items.filter((i) => i.statut === "BROUILLON").length;
    const valides = items.filter((i) => i.statut === "VALIDE").length;
    return { brouillons, valides };
  }, [items]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-gray-950">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 lg:p-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#00A09D]">
              Gestion des Flux
            </p>
            <h1 className="text-4xl font-[1000] uppercase leading-none tracking-tighter text-[#1C2434] dark:text-white lg:text-5xl">
              Mouvements<span className="text-[#00A09D]">.</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-gray-500">
              Création des brouillons et validation des mouvements de stock.
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setError(""); setOpenForm(true); }}
            className="flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border-2 border-[#1C2434] bg-[#1C2434] px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[4px_4px_0px_rgba(0,160,157,0.4)] transition-all hover:bg-[#00A09D] hover:border-[#00A09D] active:translate-y-0.5 active:shadow-none dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#1C2434]"
          >
            <Plus size={16} strokeWidth={3} />
            Nouveau brouillon
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "Total mouvements",
              value: items.length,
              icon: <History size={18} className="text-[#00A09D]" />,
              bg: "bg-white dark:bg-gray-900",
            },
            {
              label: "Brouillons en attente",
              value: stats.brouillons,
              icon: <Clock3 size={18} className="text-amber-500" />,
              bg: "bg-white dark:bg-gray-900",
            },
            {
              label: "Validés",
              value: stats.valides,
              icon: <CheckCircle2 size={18} className="text-[#00A09D]" />,
              bg: "bg-white dark:bg-gray-900",
            },
            {
              label: "Entrepôts actifs",
              value: entrepots.length,
              icon: <Warehouse size={18} className="text-violet-500" />,
              bg: "bg-white dark:bg-gray-900",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`flex items-center gap-4 rounded-2xl border border-gray-100 ${stat.bg} px-5 py-4 shadow-sm dark:border-gray-800`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
                {stat.icon}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-[1000] tracking-tighter text-[#1C2434] dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {/* ── Filter Bar ── */}
        <MouvementsFilter
          search={search}
          setSearch={setSearch}
          total={filteredItems.length}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          entrepotFilter={entrepotFilter}
          setEntrepotFilter={setEntrepotFilter}
          entrepots={entrepots.map((e: any) => ({ id: e.id, nom: e.nom }))}
          statutFilter={statutFilter}
          setStatutFilter={setStatutFilter}
        />

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <History size={18} className="text-[#00A09D]" />
              <h3 className="text-base font-[1000] uppercase tracking-tighter text-[#1C2434] dark:text-white">
                Journal des Flux<span className="text-[#00A09D]">.</span>
              </h3>
              <span className="ml-2 rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {filteredItems.length}
              </span>
            </div>

            {/* Sort toggle */}
            <button
              type="button"
              onClick={() => setSortAsc((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:border-[#00A09D]/30 hover:bg-[#00A09D]/5 hover:text-[#00A09D] dark:border-gray-700 dark:bg-gray-800"
            >
              <ArrowUpDown size={12} />
              {sortAsc ? "Plus anciens" : "Plus récents"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-6 py-4">Code & Date</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Produit</th>
                  <th className="px-4 py-4">Lot</th>
                  <th className="px-4 py-4">Source → Destination</th>
                  <th className="px-4 py-4 text-center">Qté</th>
                  <th className="px-4 py-4">Statut</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#00A09D] border-t-transparent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Chargement...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-20 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <TrendingUp size={32} className="text-gray-200" />
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                          Aucun mouvement trouvé
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const isValidating = validatingId === item.id;
                    const isDeleting = deletingId === item.id;
                    const busy = isValidating || isDeleting;

                    return (
                      <tr
                        key={item.id}
                        className="group transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/30"
                      >
                        {/* Code & Date */}
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-black text-[#1C2434] dark:text-white">
                            {item.code_mouvement || `#${item.id}`}
                          </div>

                          {item.bonLivraison && (
                            <div className="mt-1">
                              <Link
                                href={`/bon-livraisons`}
                                className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tight text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                              >
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                                {item.bonLivraison.numero_bl}
                              </Link>
                            </div>
                          )}

                          <div className="mt-0.5 text-[10px] font-bold text-gray-400">
                            {formatDate(item.date_mouvement)}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex w-fit items-center rounded-lg border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${getTypeStyle(item.type_mouvement)}`}
                            >
                              {item.type_mouvement}
                            </span>


                            <span className="text-[10px] font-bold text-gray-400">
                              {getTypeLabel(item.type_mouvement)}
                            </span>
                          </div>
                        </td>

                        {/* Produit */}
                        
<td className="px-4 py-4 min-w-[180px]">
  <div className="text-sm font-black leading-snug text-[#1C2434] dark:text-white">
    {item.emballage?.name || "—"}
  </div>
</td>

                        {/* Lot */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {item.lot?.code_lot || "—"}
                          </span>
                        </td>

                        {/* Source → Destination */}
                        {/* Source → Destination */}
{/* Source → Destination */}
<td className="px-4 py-4 min-w-[260px]">
  <div className="flex flex-col gap-1.5 text-[11px] font-bold leading-tight">
    <div className="flex items-start gap-2">
      <span className="w-10 shrink-0 text-gray-400">De :</span>
      <span className="text-gray-600 dark:text-gray-300">
        {item.entrepotSource?.nom?.replace("OCT ", "") || "—"}
      </span>
    </div>

    <div className="flex items-start gap-2">
      <span className="w-10 shrink-0 text-gray-400">Vers :</span>
      <span className="font-black text-[#1C2434] dark:text-white">
        {item.entrepotDestination?.nom?.replace("OCT ", "") || "—"}
      </span>
    </div>
  </div>
</td>

                        {/* Quantité */}
                        <td className="px-4 py-4 text-center">
                          <span className="text-base font-[1000] tracking-tighter text-[#1C2434] dark:text-white">
                            {item.quantite ?? "—"}
                          </span>
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-[1000] uppercase tracking-widest ${
                              item.statut === "VALIDE"
                                ? "border-[#00A09D]/20 bg-[#00A09D]/10 text-[#00A09D]"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.statut === "VALIDE" ? "bg-[#00A09D]" : "bg-amber-500"
                              }`}
                            />
                            {item.statut}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {item.statut === "BROUILLON" ? (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => handleValidate(item.id)}
                                  className="rounded-full border border-[#00A09D]/20 bg-[#00A09D]/5 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#00A09D] transition-all hover:bg-[#00A09D] hover:text-white disabled:opacity-40"
                                >
                                  {isValidating ? (
                                    <span className="flex items-center gap-1">
                                      <span className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent" />
                                      ...
                                    </span>
                                  ) : (
                                    "Valider"
                                  )}
                                </button>

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => handleDelete(item.id)}
                                  className="rounded-full border border-red-100 bg-red-50 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:opacity-40"
                                >
                                  {isDeleting ? (
                                    <span className="flex items-center gap-1">
                                      <span className="h-2.5 w-2.5 animate-spin rounded-full border border-current border-t-transparent" />
                                      ...
                                    </span>
                                  ) : (
                                    "Supprimer"
                                  )}
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#00A09D]">
                                <CheckCircle2 size={13} />
                                Validé
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!loading && filteredItems.length > 10 && (
            <div className="flex items-center justify-between border-t border-gray-50 px-6 py-4 dark:border-gray-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Page {page} / {lastPage} — {filteredItems.length} mouvement(s)
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700"
                >
                  <ChevronLeft size={15} />
                </button>

                {pageNumbers.map((pageNum, idx) =>
                  pageNum === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex h-8 w-8 items-center justify-center text-xs text-gray-400"
                    >
                      ···
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={pageNum}
                      onClick={() => setPage(pageNum as number)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        page === pageNum
                          ? "bg-[#00A09D] text-white shadow-sm"
                          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-30 dark:border-gray-700"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {openForm && (
        <MouvementStockFormModal
          entrepots={entrepots.map((e: any) => ({
            id: e.id,
            nom: e.nom,
            capacite_totale: e.capacite_totale,
            stock_existant: e.stock_existant,
            capacite_disponible: e.capacite_disponible,
          }))}
          emballages={emballages.map((e: any) => ({
            id: e.id,
            code: e.code,
            name: e.name,
          }))}
          onClose={() => !creatingDraft && setOpenForm(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}