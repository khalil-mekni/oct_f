"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import MouvementStockFormModal from "@/components/mouvements/MouvementStockFormModal";
import {
  fetchMouvements,
  createMouvementDraft,
  validateMouvement,
  type MouvementStockRow,
} from "@/lib/mouvement.api";
import { fetchEntrepots, type Entrepot } from "@/lib/entrepot.api";
import { listEmballages } from "@/lib/emballages.api";
import { Plus, Search, History, ChevronLeft, ChevronRight } from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR");
}

function getTypeClass(type: string) {
  switch (type) {
    case "ENT":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "CDD":
      return "bg-violet-50 text-violet-700 border-violet-100";
    case "PTE":
      return "bg-red-50 text-red-700 border-red-100";
    case "PRD":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "SPL":
      return "bg-cyan-50 text-cyan-700 border-cyan-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

function getStatutClass(statut: string) {
  switch (statut) {
    case "VALIDE":
      return "bg-[#00A09D]/10 text-[#00A09D] border-[#00A09D]/20";
    case "BROUILLON":
      return "bg-amber-50 text-amber-700 border-amber-100";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

export default function MouvementsPage() {
  const [items, setItems] = useState<MouvementStockRow[]>([]);
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [emballages, setEmballages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [first] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadAll(targetPage = page) {
    try {
      setLoading(true);
      setError("");

      const [mouvs, deps, embs] = await Promise.all([
        fetchMouvements(targetPage, first),
        fetchEntrepots(),
        listEmballages(),
      ]);

      setItems(Array.isArray(mouvs?.data) ? mouvs.data : []);
      setEntrepots(Array.isArray(deps) ? deps : []);
      setEmballages(Array.isArray(embs) ? embs : []);
      setPage(mouvs?.paginatorInfo?.currentPage ?? 1);
      setLastPage(mouvs?.paginatorInfo?.lastPage ?? 1);
      setTotal(mouvs?.paginatorInfo?.total ?? 0);
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors du chargement des mouvements.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll(page);
  }, [page]);

  async function handleCreate(input: {
    type_mouvement: "ENT" | "CDD" | "PTE" | "PRD" | "SPL";
    emballage_id: string;
    lot_id?: string | null;
    entrepot_source_id?: string | null;
    entrepot_destination_id?: string | null;
    quantite: number;
    date_mouvement: string;
  }) {
    await createMouvementDraft(input);
    setOpenForm(false);
    setPage(1);
    await loadAll(1);
  }

  async function handleValidate(id: string) {
    try {
      await validateMouvement(id);
      await loadAll(page);
    } catch (e: any) {
      alert(e?.message ?? "Erreur lors de la validation.");
    }
  }

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      const haystack = [
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

      return haystack.includes(q);
    });
  }, [items, search]);

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#F7F8FC] p-4 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* Header style amie */}
        <div className="mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#00A09D]">
                Gestion des Flux
              </p>

              <h1 className="text-5xl font-[1000] uppercase leading-tight tracking-tighter text-[#1C2434]">
                Mouvements
                <span className="text-[#00A09D]">.</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
                Création et validation des mouvements de stock.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpenForm(true)}
              className="flex items-center justify-center gap-3 whitespace-nowrap rounded-full border-2 border-[#1C2434] bg-white px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#1C2434] shadow-[6px_6px_0px_rgba(0,160,157,0.3)] transition-all hover:bg-[#1C2434] hover:text-white active:translate-y-1 active:shadow-none"
            >
              <Plus size={18} strokeWidth={3} />
              Nouveau mouvement
            </button>
          </div>

          <div className="mt-8 h-[1px] w-full bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        {/* Barre de recherche */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#00A09D]"
              size={20}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher code, lot, entrepôt, emballage..."
              className="w-full rounded-[22px] border-2 border-transparent bg-white px-14 py-4 shadow-sm outline-none transition-all focus:border-[#00A09D]/20 focus:ring-4 focus:ring-[#00A09D]/5"
            />
          </div>

          <div className="rounded-[22px] border border-gray-100 bg-white px-6 py-4 shadow-sm">
            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Total
            </span>
            <span className="mt-1 block text-lg font-[1000] tracking-tighter text-[#1C2434]">
              {total}
            </span>
          </div>
        </div>

        {/* Message erreur */}
        {error && (
          <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 font-bold text-red-700">
            Attention : {error}
          </div>
        )}

        {/* Tableau style amie */}
        <div className="overflow-hidden rounded-[35px] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between border-b border-gray-50 bg-white px-8 py-6">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-[1000] uppercase tracking-tighter text-[#1C2434]">
                <History className="text-[#00A09D]" size={22} />
                Journal des Flux
                <span className="text-[#00A09D]">.</span>
              </h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                {total} mouvement(s) trouvé(s)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/30 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#1C2434]/60">
                  <th className="px-8 py-5">Code & Date_Mvt</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Emballage</th>
                  <th className="px-6 py-5">Lot</th>
                  <th className="px-6 py-5">Source</th>
                  <th className="px-6 py-5">Destination</th>
                  <th className="px-6 py-5 text-center">Quantité</th>
                  <th className="px-6 py-5">Statut</th>
                  <th className="px-6 py-5 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A09D] border-t-transparent"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Chargement...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-20 text-center text-sm font-bold uppercase tracking-widest text-gray-400"
                    >
                      Aucun mouvement.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="group transition-all hover:bg-gray-50/50"
                    >
                      <td className="px-8 py-6">
                        <div className="font-mono text-sm font-black text-[#1C2434]">
                          {item.code_mouvement || "-"}
                        </div>
                        <div className="mt-1 text-[10px] font-bold uppercase text-gray-400">
                          {formatDate(item.date_mouvement)}
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${getTypeClass(
                            item.type_mouvement
                          )}`}
                        >
                          {item.type_mouvement}
                        </span>
                      </td>

                      <td className="px-6 py-6 text-sm font-black leading-tight text-[#1C2434]">
                        {item.emballage?.code || item.emballage?.name || "-"}
                      </td>

                      <td className="px-6 py-6">
                        <div className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-gray-500">
                          {item.lot?.code_lot || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-6 text-sm font-black leading-tight text-[#1C2434]">
                        {item.entrepotSource?.nom || "-"}
                      </td>

                      <td className="px-6 py-6 text-sm font-black leading-tight text-[#1C2434]">
                        {item.entrepotDestination?.nom || "-"}
                      </td>

                      <td className="px-6 py-6 text-center">
                        <div className="text-lg font-[1000] tracking-tighter text-[#1C2434]">
                          {item.quantite}
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-[1000] uppercase tracking-widest ${getStatutClass(
                            item.statut
                          )}`}
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                              item.statut === "VALIDE"
                                ? "bg-[#00A09D]"
                                : "bg-amber-500"
                            }`}
                          />
                          {item.statut}
                        </span>
                      </td>

                      <td className="px-6 py-6 text-center">
                        {item.statut === "BROUILLON" ? (
                          <Button
                            variant="primary"
                            onClick={() => handleValidate(item.id)}
                            className="rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest"
                          >
                            Valider
                          </Button>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Validé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination style amie */}
        {!loading && lastPage > 1 && (
          <div className="flex items-center justify-center gap-6 rounded-[2rem] border border-gray-100 bg-white py-6 shadow-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Page {page} sur {lastPage}
              </span>
              <div className="mt-1 text-xs font-bold text-[#1C2434]">
                Total : {total} mouvement(s)
              </div>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {openForm && (
        <MouvementStockFormModal
          entrepots={entrepots.map((e) => ({
            id: e.id,
            nom: e.nom,
          }))}
          emballages={emballages.map((e: any) => ({
            id: e.id,
            code: e.code,
            name: e.name,
          }))}
          onClose={() => setOpenForm(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}