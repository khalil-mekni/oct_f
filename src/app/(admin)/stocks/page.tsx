"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

import {
  deleteStock,
  fetchEntrepots,
  fetchEmballages,
  fetchStocks,
  updateStock,
  createStockWithAutoLot,
  type Entrepot,
  type Emballage,
  type Stock,
} from "@/lib/stock.api";

function formatDateTimeForInput(value: string) {
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function formatInputToDateTime(value: string) {
  if (!value) return "";
  return value.replace("T", " ") + ":00";
}

export default function StocksPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [emballages, setEmballages] = useState<Emballage[]>([]);

  const [page, setPage] = useState(1);
  const [first] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Stock | null>(null);

  // Form (BL = entrée)
  const [entrepotId, setEntrepotId] = useState("");
  const [emballageId, setEmballageId] = useState("");
  const [dateStock, setDateStock] = useState(""); // datetime-local

  // Quantités snapshot
  const [qInit, setQInit] = useState("0");
  const [qEntree, setQEntree] = useState("0");
  const [qSortie, setQSortie] = useState("0");

  // Lot auto affichage
  const [generatedLot, setGeneratedLot] = useState<string>("Auto (L001...)");

  const [search, setSearch] = useState("");

  const computedFinale = useMemo(() => {
    const init = Number(qInit) || 0;
    const en = Number(qEntree) || 0;
    const so = Number(qSortie) || 0;
    return init + en - so;
  }, [qInit, qEntree, qSortie]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, e, embs] = await Promise.all([
        fetchStocks(page, first),
        fetchEntrepots(),
        fetchEmballages(1, 200),
      ]);

      setStocks(s.stocks.data);
      setLastPage(s.stocks.paginatorInfo.lastPage);
      setTotal(s.stocks.paginatorInfo.total);

      setEntrepots(e.entrepots);
      setEmballages(embs.emballages.data);
    } catch (err: any) {
      setError(err?.message ?? "Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return stocks;

    return stocks.filter((x) => {
      const e = x.entrepot?.adresse?.toLowerCase() ?? "";
      const lot = x.lot?.numero_lot?.toLowerCase() ?? "";
      const embCode = x.emballage?.code?.toLowerCase() ?? "";
      const embName = x.emballage?.name?.toLowerCase() ?? "";
      const dt = (x.date_stock ?? "").toLowerCase();
      return (
        e.includes(s) ||
        lot.includes(s) ||
        embCode.includes(s) ||
        embName.includes(s) ||
        dt.includes(s)
      );
    });
  }, [stocks, search]);

  function openCreate() {
    setMode("create");
    setSelected(null);

    setEntrepotId("");
    setEmballageId("");

    // BL: par défaut maintenant
    setDateStock(formatDateTimeForInput(new Date().toISOString()));

    // BL: entrée uniquement (tu peux garder init=0)
    setQInit("0");
    setQEntree("0");
    setQSortie("0");

    setGeneratedLot("Auto (L001...)");
    setError(null);
    setIsOpen(true);
  }

  function openEdit(s: Stock) {
    setMode("edit");
    setSelected(s);

    setEntrepotId(s.entrepot_id);
    setEmballageId(s.emballage_id);
    setDateStock(formatDateTimeForInput(s.date_stock));

    setQInit(String(s.quantite_init ?? 0));
    setQEntree(String(s.quantite_entree ?? 0));
    setQSortie(String(s.quantite_sortie ?? 0));

    setGeneratedLot(s.lot?.numero_lot ?? "—");
    setError(null);
    setIsOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const init = Number(qInit);
      const en = Number(qEntree);
      const so = Number(qSortie);

      if ([init, en, so].some((n) => Number.isNaN(n) || n < 0)) {
        throw new Error("Les quantités doivent être des nombres >= 0");
      }
      if (computedFinale < 0) {
        throw new Error("Stock final ne peut pas être négatif (init + entrée - sortie).");
      }

      const dateValue = formatInputToDateTime(dateStock);
      if (!dateValue) throw new Error("date_stock est requis");

      if (mode === "create") {
        if (!entrepotId || !emballageId) {
          throw new Error("Entrepôt et Emballage sont requis");
        }

        // ✅ BL: on crée le stock + lot automatique (L001...)
        // Règle BL simple: sortie = 0
        const res = await createStockWithAutoLot({
          entrepot_id: entrepotId,
          emballage_id: emballageId,
          date_stock: dateValue,
          quantite_init: init,
          quantite_entree: en,
          quantite_sortie: 0,
          // user_id: optionnel
        });

        const lotNum = res.createStockWithAutoLot.lot?.numero_lot ?? "Auto";
        setGeneratedLot(lotNum);

        alert(`Bon de livraison enregistré ✅ Lot généré: ${lotNum}`);
      } else {
        if (!selected?.id) throw new Error("Stock non sélectionné");

        // Edit: on modifie snapshot (finale recalculée backend)
        await updateStock({
          id: selected.id,
          date_stock: dateValue,
          quantite_init: init,
          quantite_entree: en,
          quantite_sortie: so,
        });
      }

      setIsOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(s: Stock) {
    if (!confirm("Supprimer ce snapshot de stock ?")) return;
    setSaving(true);
    setError(null);

    try {
      await deleteStock(s.id);
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md font-semibold text-gray-900 dark:text-white/90">
            Stocks (Bon de livraison)
          </h1>
          <p className="text-theme-sm text-gray-600 dark:text-gray-400">
            Création BL = entrée + lot automatique (L001, L002...)
          </p>
        </div>

        <Button variant="primary" onClick={openCreate}>
          + Ajouter BL
        </Button>
      </div>

      {/* Search + total */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-[460px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (emballage, lot, entrepôt, date...)"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-4 focus:ring-[var(--shadow-focus-ring)] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-theme-sm text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          Total: <span className="font-semibold text-gray-900 dark:text-white/90">{total}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-950/40 dark:text-error-200">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-theme-sm">
            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <tr>
                <th className="px-5 py-4 font-medium">Entrepôt</th>
                <th className="px-5 py-4 font-medium">Emballage</th>
                <th className="px-5 py-4 font-medium">Lot</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Init</th>
                <th className="px-5 py-4 font-medium">Entrée</th>
                <th className="px-5 py-4 font-medium">Sortie</th>
                <th className="px-5 py-4 font-medium">Finale</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-600 dark:text-gray-400">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-600 dark:text-gray-400">
                    Aucun enregistrement.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="text-gray-900 dark:text-gray-100">
                    <td className="px-5 py-4">{s.entrepot?.adresse ?? `#${s.entrepot_id}`}</td>
                    <td className="px-5 py-4 font-medium">
                      {s.emballage?.code
                        ? `${s.emballage.code}${s.emballage.name ? " — " + s.emballage.name : ""}`
                        : `#${s.emballage_id}`}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/[0.12] dark:text-brand-400">
                        {s.lot?.numero_lot ?? (s.lot_id ? `#${s.lot_id}` : "—")}
                      </span>
                    </td>
                    <td className="px-5 py-4">{s.date_stock}</td>
                    <td className="px-5 py-4">{s.quantite_init}</td>
                    <td className="px-5 py-4">{s.quantite_entree}</td>
                    <td className="px-5 py-4">{s.quantite_sortie}</td>
                    <td className="px-5 py-4 font-semibold">{s.quantite_finale}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="!ring-error-300 !text-error-700 hover:!bg-error-50 dark:!ring-error-900/50 dark:!text-error-200 dark:hover:!bg-error-950/40"
                          onClick={() => onDelete(s)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-theme-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>

          <div className="rounded-lg bg-gray-50 px-4 py-2 dark:bg-gray-800">
            Page <span className="font-semibold text-gray-900 dark:text-white/90">{page}</span> /{" "}
            <span className="font-semibold text-gray-900 dark:text-white/90">{lastPage}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage || loading}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          >
            Suivant
          </Button>
        </div>
      </div>

      {/* Modal Create/Edit */}
      <Modal isOpen={isOpen} onClose={() => !saving && setIsOpen(false)} className="max-w-xl p-6">
        <div className="space-y-5">
          <div>
            <h2 className="text-theme-xl font-semibold text-gray-900 dark:text-white/90">
              {mode === "create" ? "Ajouter Bon de livraison" : "Modifier Snapshot"}
            </h2>
            <p className="text-theme-sm text-gray-600 dark:text-gray-400">
              Lot auto : L001, L002... — Finale = init + entrée - sortie
            </p>
          </div>

          {/* Lot info */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="text-gray-600 dark:text-gray-400">Lot</div>
            <div className="font-semibold text-gray-900 dark:text-white/90">{generatedLot}</div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "create" && (
              <>
                <div className="space-y-2">
                  <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                    Entrepôt
                  </label>
                  <select
                    value={entrepotId}
                    onChange={(e) => setEntrepotId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">-- choisir --</option>
                    {entrepots.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.adresse}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                    Emballage
                  </label>
                  <select
                    value={emballageId}
                    onChange={(e) => setEmballageId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">-- choisir --</option>
                    {emballages.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.code ? `${x.code}${x.name ? " — " + x.name : ""}` : `#${x.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                Date BL
              </label>
              <input
                type="datetime-local"
                value={dateStock}
                onChange={(e) => setDateStock(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantité init
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={qInit}
                  onChange={(e) => setQInit(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantité entrée (BL)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={qEntree}
                  onChange={(e) => setQEntree(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantité sortie
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={qSortie}
                  onChange={(e) => setQSortie(e.target.value)}
                  disabled={mode === "create"} // BL: sortie forcée à 0
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none disabled:opacity-60 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-800">
              <div className="text-gray-600 dark:text-gray-400">Finale (prévisualisation)</div>
              <div className="font-semibold text-gray-900 dark:text-white/90">{computedFinale}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>
                Annuler
              </Button>
              <Button variant="primary" disabled={saving}>
                {saving ? "En cours..." : "Enregistrer"}
              </Button>
            </div>
          </form>

          {error && (
            <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-950/40 dark:text-error-200">
              {error}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}