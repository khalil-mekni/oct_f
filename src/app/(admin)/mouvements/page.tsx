"use client";

import React, { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";

import {
  createMouvementDraft,
  deleteMouvementDraft,
  fetchEntrepots,
  fetchLots,
  fetchMouvements,
  fetchEmballages,
  validateMouvement,
  type Entrepot,
  type Lot,
  type Emballage,
  type MouvementStock,
  type MouvementType,
} from "@/lib/mouvement.api";

const TYPES: { value: MouvementType; label: string; hint: string }[] = [
  { value: "ENT", label: "ENT (Entrée)", hint: "Ajoute stock (destination)" },
  { value: "PRD", label: "PRD (Sortie prod)", hint: "Diminue stock (source)" },
  { value: "CDD", label: "CDD (Transfert)", hint: "Source → Destination" },
  { value: "PTE", label: "PTE (Perte)", hint: "Diminue stock (source)" },
  { value: "SPL", label: "SPL (Surplus)", hint: "Ajoute stock" },
];

function needsSource(t: MouvementType) {
  return t === "PRD" || t === "CDD" || t === "PTE" || t === "SPL";
}

function needsDestination(t: MouvementType) {
  return t === "ENT" || t === "CDD" || t === "SPL";
}

function needsLot(t: MouvementType) {
  return t !== "ENT";
}

function formatEmballageLabel(
  emballage?: Emballage | null,
  fallbackId?: string | null
) {
  if (!emballage) return fallbackId ? `#${fallbackId}` : "-";
  if (emballage.code && emballage.name) return `${emballage.code} — ${emballage.name}`;
  if (emballage.code) return emballage.code;
  if (emballage.name) return emballage.name;
  return emballage.id ? `#${emballage.id}` : "-";
}

export default function MouvementsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<MouvementStock[]>([]);
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [emballages, setEmballages] = useState<Emballage[]>([]);

  const [page, setPage] = useState(1);
  const [first] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [type, setType] = useState<MouvementType>("ENT");
  const [emballageId, setEmballageId] = useState("");
  const [lotId, setLotId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [destId, setDestId] = useState("");
  const [quantite, setQuantite] = useState("0");

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [m, e, l, embs] = await Promise.all([
        fetchMouvements(page, first),
        fetchEntrepots(),
        fetchLots(),
        fetchEmballages(1, 200),
      ]);

      setItems(m.mouvementStocks.data);
      setLastPage(m.mouvementStocks.paginatorInfo.lastPage);
      setTotal(m.mouvementStocks.paginatorInfo.total);

      setEntrepots(e);
      setLots(l);
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
    if (!s) return items;

    return items.filter((x) => {
      const lot = x.lot?.numero_lot?.toLowerCase() ?? "";
      const src = x.entrepotSource?.adresse?.toLowerCase() ?? "";
      const dst = x.entrepotDestination?.adresse?.toLowerCase() ?? "";
      const embCode = x.emballage?.code?.toLowerCase() ?? "";
      const embName = x.emballage?.name?.toLowerCase() ?? "";

      return (
        embCode.includes(s) ||
        embName.includes(s) ||
        lot.includes(s) ||
        src.includes(s) ||
        dst.includes(s) ||
        (x.code_mouvement ?? "").toLowerCase().includes(s) ||
        x.type_mouvement.toLowerCase().includes(s) ||
        x.statut.toLowerCase().includes(s)
      );
    });
  }, [items, search]);

  function openCreate() {
    setError(null);
    setType("ENT");
    setEmballageId("");
    setLotId("");
    setSourceId("");
    setDestId("");
    setQuantite("0");
    setIsOpen(true);
  }

  async function onCreateDraft(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const q = Number(quantite);

      if (Number.isNaN(q) || q <= 0) {
        throw new Error("Quantité doit être > 0");
      }

      if (!emballageId) {
        throw new Error("Emballage requis");
      }

      if (needsLot(type) && !lotId) {
        throw new Error("Lot requis pour ce type");
      }

      if (needsSource(type) && !sourceId) {
        throw new Error("Entrepôt source requis");
      }

      if (needsDestination(type) && !destId) {
        throw new Error("Entrepôt destination requis");
      }

      if (type === "CDD" && sourceId === destId) {
        throw new Error("Source et destination doivent être différents");
      }

      await createMouvementDraft({
        type_mouvement: type,
        emballage_id: emballageId,
        lot_id: lotId || null,
        entrepot_source_id: sourceId || null,
        entrepot_destination_id: destId || null,
        quantite: q,
      });

      setIsOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function onValidate(item: MouvementStock) {
    if (item.statut === "VALIDE") return;
    if (!confirm("Valider ce mouvement ? (impacte le stock)")) return;

    setSaving(true);
    setError(null);

    try {
      await validateMouvement(item.id);
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteDraft(item: MouvementStock) {
    if (item.statut === "VALIDE") {
      alert("Impossible de supprimer un mouvement validé.");
      return;
    }

    if (!confirm("Supprimer ce brouillon ?")) return;

    setSaving(true);
    setError(null);

    try {
      await deleteMouvementDraft(item.id);
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md font-semibold text-gray-900 dark:text-white/90">
            Mouvements de stock
          </h1>
          <p className="text-theme-sm text-gray-600 dark:text-gray-400">
            Créer en <b>BROUILLON</b>, puis <b>VALIDER</b> pour impacter le stock.
          </p>
        </div>

        <Button variant="primary" onClick={openCreate}>
          + Nouveau mouvement
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-[520px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (code, type, statut, lot, entrepôt, emballage...)"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-4 focus:ring-[var(--shadow-focus-ring)] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="text-theme-sm text-gray-600 dark:text-gray-400">
          Total:{" "}
          <span className="font-semibold text-gray-900 dark:text-white/90">
            {total}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-950/40 dark:text-error-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-theme-sm">
            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <tr>
                <th className="px-5 py-4 font-medium">Code</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Statut</th>
                <th className="px-5 py-4 font-medium">Emballage</th>
                <th className="px-5 py-4 font-medium">Lot</th>
                <th className="px-5 py-4 font-medium">Source</th>
                <th className="px-5 py-4 font-medium">Destination</th>
                <th className="px-5 py-4 font-medium">Quantité</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-6 text-center text-gray-600 dark:text-gray-400">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-6 text-center text-gray-600 dark:text-gray-400">
                    Aucun mouvement.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="text-gray-900 dark:text-gray-100">
                    <td className="px-5 py-4">{m.code_mouvement ?? `#${m.id}`}</td>
                    <td className="px-5 py-4">{m.type_mouvement}</td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          m.statut === "VALIDE"
                            ? "bg-success-50 text-success-700 dark:bg-success-950/40 dark:text-success-200"
                            : "bg-warning-50 text-warning-700 dark:bg-warning-950/40 dark:text-warning-200",
                        ].join(" ")}
                      >
                        {m.statut}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {formatEmballageLabel(m.emballage, m.emballage_id)}
                    </td>
                    <td className="px-5 py-4">
                      {m.lot?.numero_lot ?? (m.lot_id ? `#${m.lot_id}` : "-")}
                    </td>
                    <td className="px-5 py-4">
                      {m.entrepotSource?.adresse ?? (m.entrepot_source_id ? `#${m.entrepot_source_id}` : "-")}
                    </td>
                    <td className="px-5 py-4">
                      {m.entrepotDestination?.adresse ?? (m.entrepot_destination_id ? `#${m.entrepot_destination_id}` : "-")}
                    </td>
                    <td className="px-5 py-4">{m.quantite}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={saving || m.statut === "VALIDE"}
                          onClick={() => onValidate(m)}
                        >
                          Valider
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="!ring-error-300 !text-error-700 hover:!bg-error-50 dark:!ring-error-900/50 dark:!text-error-200 dark:hover:!bg-error-950/40"
                          disabled={saving || m.statut === "VALIDE"}
                          onClick={() => onDeleteDraft(m)}
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

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-theme-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>

          <div>
            Page{" "}
            <span className="font-semibold text-gray-900 dark:text-white/90">
              {page}
            </span>{" "}
            /{" "}
            <span className="font-semibold text-gray-900 dark:text-white/90">
              {lastPage}
            </span>
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

      <Modal isOpen={isOpen} onClose={() => !saving && setIsOpen(false)} className="max-w-2xl p-6">
        <div className="space-y-5">
          <div>
            <h2 className="text-theme-xl font-semibold text-gray-900 dark:text-white/90">
              Nouveau mouvement (Brouillon)
            </h2>
            <p className="text-theme-sm text-gray-600 dark:text-gray-400">
              Crée un mouvement <b>BROUILLON</b>. Tu peux le valider après.
            </p>
          </div>

          <form onSubmit={onCreateDraft} className="space-y-4">
            <div className="space-y-2">
              <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                Type mouvement
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MouvementType)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {TYPES.find((x) => x.value === type)?.hint}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                Emballage
              </label>
              <select
                value={emballageId}
                onChange={(e) => setEmballageId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">-- choisir --</option>
                {emballages.map((emb) => (
                  <option key={emb.id} value={emb.id}>
                    {formatEmballageLabel(emb)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                Lot {needsLot(type) ? "(requis)" : "(optionnel)"}
              </label>
              <select
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                disabled={!needsLot(type)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">
                  {needsLot(type) ? "-- choisir --" : "-- auto / optionnel --"}
                </option>
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.numero_lot}
                  </option>
                ))}
              </select>
              {!needsLot(type) && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Pour ENT, tu peux laisser vide si le backend crée le lot automatiquement.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                  Entrepôt source {needsSource(type) ? "(requis)" : "(optionnel)"}
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  disabled={!needsSource(type)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">
                    {needsSource(type) ? "-- choisir --" : "-- non --"}
                  </option>
                  {entrepots.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.adresse}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                  Entrepôt destination {needsDestination(type) ? "(requis)" : "(optionnel)"}
                </label>
                <select
                  value={destId}
                  onChange={(e) => setDestId(e.target.value)}
                  disabled={!needsDestination(type)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">
                    {needsDestination(type) ? "-- choisir --" : "-- non --"}
                  </option>
                  {entrepots.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.adresse}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                Quantité
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={saving}>
                Annuler
              </Button>
              <Button variant="primary" disabled={saving}>
                {saving ? "En cours..." : "Créer brouillon"}
              </Button>
            </div>
          </form>

          {error && (
            <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-950/40 dark:text-error-200">
              {error}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}