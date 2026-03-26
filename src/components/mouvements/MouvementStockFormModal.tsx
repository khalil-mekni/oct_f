"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAvailableLotsByEntrepot,
  fetchAvailableEntrepotsByLot,
  fetchLotDisponibleDansEntrepot,
  type EntrepotOption,
  type EmballageOption,
} from "@/lib/mouvement.api";

type Props = {
  entrepots: EntrepotOption[];
  emballages: EmballageOption[];
  onClose: () => void;
  onSave: (input: {
    type_mouvement: "ENT" | "CDD" | "PTE" | "PRD" | "SPL";
    emballage_id: string;
    lot_id?: string | null;
    entrepot_source_id?: string | null;
    entrepot_destination_id?: string | null;
    quantite: number;
    date_mouvement: string;
  }) => Promise<void>;
};

function nowInputValue() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function toGraphqlDateTime(value: string) {
  if (!value) return "";
  return value.includes("T") ? `${value}:00`.replace("T", " ") : value;
}

export default function MouvementStockFormModal({
  entrepots,
  emballages,
  onClose,
  onSave,
}: Props) {
  const [typeMouvement, setTypeMouvement] = useState<"ENT" | "CDD" | "PTE" | "PRD" | "SPL">("ENT");
  const [emballageId, setEmballageId] = useState("");
  const [lotId, setLotId] = useState("");
  const [entrepotSourceId, setEntrepotSourceId] = useState("");
  const [entrepotDestinationId, setEntrepotDestinationId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [dateMouvement, setDateMouvement] = useState(nowInputValue());

  const [availableLots, setAvailableLots] = useState<any[]>([]);
  const [availableEntrepotsForLot, setAvailableEntrepotsForLot] = useState<any[]>([]);
  const [quantiteMax, setQuantiteMax] = useState<number>(0);

  const [loadingLots, setLoadingLots] = useState(false);
  const [loadingEntrepotsForLot, setLoadingEntrepotsForLot] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

const showSource = ["CDD", "PTE", "PRD", "SPL"].includes(typeMouvement);  const showDestination = ["ENT", "CDD", "SPL"].includes(typeMouvement);
  const showLot = ["CDD", "PTE", "PRD", "SPL"].includes(typeMouvement);

  const sourceLabel =
    typeMouvement === "PTE"
      ? "Entrepôt source"
      : typeMouvement === "PRD"
      ? "Entrepôt source"
      : "Entrepôt source";

  const destinationLabel =
    typeMouvement === "ENT"
      ? "Entrepôt destination"
      : typeMouvement === "CDD"
      ? "Entrepôt destination"
      : "Entrepôt cible";

  useEffect(() => {
    setError("");
    setLotId("");
    setEntrepotSourceId("");
    setEntrepotDestinationId("");
    setAvailableLots([]);
    setAvailableEntrepotsForLot([]);
    setQuantiteMax(0);
    setQuantite("");
  }, [typeMouvement]);

  useEffect(() => {
    setLotId("");
    setAvailableLots([]);
    setAvailableEntrepotsForLot([]);
    setQuantiteMax(0);
  }, [emballageId]);

  useEffect(() => {
    setLotId("");
    setAvailableLots([]);
    setAvailableEntrepotsForLot([]);
    setQuantiteMax(0);

    if (!showLot) return;

    if (["CDD", "PTE", "PRD", "SPL"].includes(typeMouvement)) {
      if (!entrepotSourceId || !emballageId) return;

      let active = true;

      async function loadLots() {
        try {
          setLoadingLots(true);
          setError("");

          const res = await fetchAvailableLotsByEntrepot({
            entrepotId: entrepotSourceId,
            emballageId,
          });

          if (!active) return;
          setAvailableLots(res.availableLotsByEntrepot ?? []);
        } catch (e: any) {
          if (!active) return;
          setError(e?.message ?? "Erreur lors du chargement des lots disponibles.");
          setAvailableLots([]);
        } finally {
          if (active) setLoadingLots(false);
        }
      }

      loadLots();

      return () => {
        active = false;
      };
    }
  }, [typeMouvement, entrepotSourceId, emballageId, showLot]);

  useEffect(() => {
    setAvailableEntrepotsForLot([]);
    setQuantiteMax(0);

    if (!lotId) return;

    let active = true;

    async function loadEntrepotsByLot() {
      try {
        setLoadingEntrepotsForLot(true);
        setError("");

        const res = await fetchAvailableEntrepotsByLot(lotId);

        if (!active) return;

        const rows = res.availableEntrepotsByLot ?? [];
        setAvailableEntrepotsForLot(rows);

        if (showSource && !entrepotSourceId && rows.length === 1) {
          setEntrepotSourceId(String(rows[0].entrepot.id));
        }
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Erreur lors du chargement des entrepôts du lot.");
      } finally {
        if (active) setLoadingEntrepotsForLot(false);
      }
    }

    loadEntrepotsByLot();

    return () => {
      active = false;
    };
  }, [lotId, showSource, entrepotSourceId]);

  useEffect(() => {
    setQuantiteMax(0);

    if (!showLot) return;
    if (!lotId || !emballageId) return;

    if (["CDD", "PTE", "PRD", "SPL"].includes(typeMouvement)) {
      if (!entrepotSourceId) return;

      let active = true;

      async function loadDisponible() {
        try {
          setError("");

          const max = await fetchLotDisponibleDansEntrepot({
            entrepotId: entrepotSourceId,
            lotId,
            emballageId,
          });

          if (!active) return;
          setQuantiteMax(Number(max ?? 0));
        } catch (e: any) {
          if (!active) return;
          setError(e?.message ?? "Erreur lors du calcul de la quantité disponible.");
        }
      }

      loadDisponible();

      return () => {
        active = false;
      };
    }
  }, [typeMouvement, lotId, entrepotSourceId, emballageId, showLot]);

  const filteredSourceEntrepots = useMemo(() => {
    if (!lotId || availableEntrepotsForLot.length === 0) {
      return entrepots;
    }

    const ids = new Set(availableEntrepotsForLot.map((row) => String(row.entrepot.id)));
    return entrepots.filter((e) => ids.has(String(e.id)));
  }, [entrepots, lotId, availableEntrepotsForLot]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const qty = Number(quantite);

    if (!emballageId) {
      setError("Veuillez choisir un emballage.");
      return;
    }

    if (showSource && !entrepotSourceId) {
      setError("Veuillez choisir un entrepôt source.");
      return;
    }

    if (showDestination && !entrepotDestinationId) {
      setError("Veuillez choisir un entrepôt destination.");
      return;
    }

    if (showLot && !lotId) {
      setError("Veuillez choisir un lot.");
      return;
    }

    if (!qty || qty <= 0) {
      setError("La quantité doit être supérieure à 0.");
      return;
    }

    if (showLot && quantiteMax > 0 && qty > quantiteMax) {
      setError(`La quantité maximale autorisée est ${quantiteMax}.`);
      return;
    }

    try {
      setSaving(true);

      await onSave({
        type_mouvement: typeMouvement,
        emballage_id: emballageId,
        lot_id: showLot ? lotId : null,
        entrepot_source_id: showSource ? entrepotSourceId : null,
        entrepot_destination_id: showDestination ? entrepotDestinationId : null,
        quantite: qty,
        date_mouvement: toGraphqlDateTime(dateMouvement),
      });
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de l'enregistrement du mouvement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Nouveau mouvement</h2>
            <p className="text-sm text-slate-500">
              Le lot et l’entrepôt source sont filtrés selon le stock disponible.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-base font-medium text-slate-500 hover:text-slate-700"
          >
            Fermer
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Type mouvement
            </label>
            <select
              value={typeMouvement}
              onChange={(e) => setTypeMouvement(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 px-4 py-4"
            >
              <option value="ENT">ENT</option>
              <option value="CDD">CDD</option>
              <option value="PTE">PTE</option>
              <option value="PRD">PRD</option>
              <option value="SPL">SPL</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Emballage
            </label>
            <select
              value={emballageId}
              onChange={(e) => setEmballageId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-4"
            >
              <option value="">Choisir</option>
              {emballages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </select>
          </div>

          {showSource && (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {sourceLabel}
              </label>
              <select
                value={entrepotSourceId}
                onChange={(e) => setEntrepotSourceId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-4"
              >
                <option value="">Choisir</option>
                {filteredSourceEntrepots.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showDestination && (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {destinationLabel}
              </label>
              <select
                value={entrepotDestinationId}
                onChange={(e) => setEntrepotDestinationId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-4"
              >
                <option value="">Choisir</option>
                {entrepots.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showLot && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Lot</label>
              <select
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-4"
              >
                <option value="">
                  {loadingLots ? "Chargement des lots..." : "Choisir"}
                </option>

                {availableLots.map((row) => (
                  <option key={row.id} value={row.lot.id}>
                    {row.lot.code_lot} - dispo {row.quantite}
                  </option>
                ))}
              </select>

              {loadingEntrepotsForLot && (
                <p className="mt-2 text-xs text-slate-500">
                  Chargement des entrepôts du lot...
                </p>
              )}

              {showLot && quantiteMax > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Quantité maximale autorisée : <strong>{quantiteMax}</strong>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Quantité
            </label>
            <input
              type="number"
              min="0"
              step="0.001"
              max={showLot && quantiteMax > 0 ? quantiteMax : undefined}
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-4"
              placeholder={quantiteMax > 0 ? `Maximum ${quantiteMax}` : "Saisir quantité"}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Date mouvement
            </label>
            <input
              type="datetime-local"
              value={dateMouvement}
              onChange={(e) => setDateMouvement(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-4"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#00A09D] px-6 py-3 font-semibold text-white transition hover:bg-[#008784] disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}