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
import { fetchEmballages } from "@/lib/emballages.api";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR");
}

function getTypeClass(type: string) {
  switch (type) {
    case "ENT":
      return "bg-blue-100 text-blue-700";
    case "CDD":
      return "bg-violet-100 text-violet-700";
    case "PTE":
      return "bg-red-100 text-red-700";
    case "PRD":
      return "bg-amber-100 text-amber-700";
    case "SPL":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStatutClass(statut: string) {
  switch (statut) {
    case "VALIDE":
      return "bg-emerald-100 text-emerald-700";
    case "BROUILLON":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
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

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [mouvs, deps, embs] = await Promise.all([
        fetchMouvements(),
        fetchEntrepots(),
        fetchEmballages(),
      ]);

      setItems(Array.isArray(mouvs?.data) ? mouvs.data : []);
      setEntrepots(Array.isArray(deps) ? deps : []);
      setEmballages(Array.isArray(embs) ? embs : []);
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors du chargement des mouvements.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

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
    await loadAll();
  }

  async function handleValidate(id: string) {
    try {
      await validateMouvement(id);
      await loadAll();
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

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Mouvements de stock
              </h1>
              <p className="text-sm text-slate-500">
                Création et validation des mouvements de stock.
              </p>
            </div>

            <Button variant="primary" onClick={() => setOpenForm(true)}>
              Nouveau mouvement
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher code, lot, entrepôt, emballage..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#00A09D] sm:w-96"
          />

          <div className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
            Total : {filteredItems.length}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Code
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Emballage
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Lot
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Source
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Destination
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold uppercase text-slate-500">
                    Quantité
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Statut
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold uppercase text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center">
                      Aucun mouvement.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold text-[#00A09D]">
                        {item.code_mouvement}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getTypeClass(
                            item.type_mouvement
                          )}`}
                        >
                          {item.type_mouvement}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {item.emballage?.code || item.emballage?.name || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {item.lot?.code_lot || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {item.entrepotSource?.nom || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {item.entrepotDestination?.nom || "-"}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-slate-900">
                        {item.quantite}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatDate(item.date_mouvement)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatutClass(
                            item.statut
                          )}`}
                        >
                          {item.statut}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        {item.statut === "BROUILLON" ? (
                          <Button
                            variant="primary"
                            onClick={() => handleValidate(item.id)}
                          >
                            Valider
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">Validé</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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