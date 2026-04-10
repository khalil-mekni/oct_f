"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchAvailableLotsByEntrepot,
  fetchAvailableEntrepotsByLot,
  fetchLotDisponibleDansEntrepot,
  type EntrepotOption,
  type EmballageOption,
} from "@/lib/mouvement.api";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Package,
  Truck,
  X,
} from "lucide-react";

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

function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#1C2434]/60 ${className}`}
    >
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border-2 border-gray-50 bg-gray-50/30 px-5 py-3.5 text-sm font-bold text-[#1C2434] outline-none transition-all placeholder:text-gray-300 focus:border-[#00A09D]/30 focus:bg-white focus:ring-4 focus:ring-[#00A09D]/5";

const selectClass = `${inputClass} cursor-pointer`;

export default function MouvementStockFormModal({
  entrepots,
  emballages,
  onClose,
  onSave,
}: Props) {
  const [step, setStep] = useState(1);

  const [typeMouvement, setTypeMouvement] = useState<
    "ENT" | "CDD" | "PTE" | "PRD" | "SPL"
  >("ENT");
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

  const showSource = ["CDD", "PTE", "PRD", "SPL"].includes(typeMouvement);
  const showDestination = ["ENT", "CDD", "SPL"].includes(typeMouvement);
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

  const typeCards: {
    value: "ENT" | "CDD" | "PTE" | "PRD" | "SPL";
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      value: "ENT",
      label: "Entrée",
      description: "Entrée de stock vers un entrepôt destination.",
      icon: "📥",
    },
    {
      value: "CDD",
      label: "Transfert",
      description: "Déplacement de stock entre deux entrepôts.",
      icon: "🔄",
    },
    {
      value: "PTE",
      label: "Perte",
      description: "Sortie liée à une perte ou un écart de stock.",
      icon: "⚠️",
    },
    {
      value: "PRD",
      label: "Production",
      description: "Sortie de stock liée au flux de production.",
      icon: "📦",
    },
    {
      value: "SPL",
      label: "Surplus",
      description: "Ajustement positif ou surplus détecté en stock.",
      icon: "➕",
    },
  ];

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

  const selectedEmballage = emballages.find((e) => String(e.id) === String(emballageId));
  const selectedLot = availableLots.find((row) => String(row.lot.id) === String(lotId));
  const selectedSource = entrepots.find((e) => String(e.id) === String(entrepotSourceId));
  const selectedDestination = entrepots.find(
    (e) => String(e.id) === String(entrepotDestinationId)
  );

  function canGoNext() {
    if (step === 1) return !!typeMouvement;
    if (step === 2) return !!emballageId;
    if (step === 3) {
      const sourceOk = showSource ? !!entrepotSourceId : true;
      const destOk = showDestination ? !!entrepotDestinationId : true;
      const qtyOk = !!quantite && Number(quantite) > 0;
      return sourceOk && destOk && qtyOk;
    }
    return true;
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1C2434]/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-[40px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-100 bg-gray-50/50 px-10 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-[1000] uppercase tracking-tighter text-[#1C2434]">
                Nouveau Mouvement<span className="text-[#00A09D]">.</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Étape {step} sur 4
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-200"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {[
              { s: 1, icon: <Package size={18} />, label: "Type" },
              { s: 2, icon: <Package size={18} />, label: "Article" },
              { s: 3, icon: <Truck size={18} />, label: "Logistique" },
              { s: 4, icon: <ClipboardCheck size={18} />, label: "Validation" },
            ].map((item, index) => (
              <div key={item.s} className="flex flex-1 items-center">
                <div
                  className={`flex items-center gap-3 transition-all ${
                    step >= item.s ? "text-[#00A09D]" : "text-gray-300"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-black ${
                      step >= item.s
                        ? "bg-[#00A09D] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step > item.s ? "✓" : item.icon}
                  </div>
                  <span className="hidden text-[10px] font-black uppercase tracking-widest md:block">
                    {item.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`mx-4 h-[2px] flex-1 rounded-full ${
                      step > item.s ? "bg-[#00A09D]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto px-10 py-10">
            {error && (
              <div className="mb-6 rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 font-bold text-red-700">
                Attention : {error}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-bottom-4">
                {typeCards.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setTypeMouvement(type.value);
                      setStep(2);
                    }}
                    className={`group relative rounded-3xl border-2 p-6 text-left transition-all ${
                      typeMouvement === type.value
                        ? "border-[#00A09D] bg-[#00A09D]/5 ring-4 ring-[#00A09D]/10"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{type.icon}</span>
                      <span className="inline-flex items-center rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#1C2434]">
                        {type.value}
                      </span>
                    </div>

                    <h4 className="mt-4 font-black uppercase tracking-tight text-[#1C2434]">
                      {type.label}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {type.description}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-xl space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="rounded-[30px] border-2 border-gray-100 p-8">
                  <Label>Sélectionner l&apos;Emballage</Label>
                  <select
                    value={emballageId}
                    onChange={(e) => setEmballageId(e.target.value)}
                    className={`${selectClass} mt-4 !rounded-2xl !py-5`}
                  >
                    <option value="">Choisir un produit...</option>
                    {emballages.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} · {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4">
                <div className="grid gap-6 sm:grid-cols-2">
                  {showSource && (
                    <div className="space-y-2">
                      <Label>{sourceLabel}</Label>
                      <select
                        value={entrepotSourceId}
                        onChange={(e) => setEntrepotSourceId(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Source...</option>
                        {filteredSourceEntrepots.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {showDestination && (
                    <div className="space-y-2">
                      <Label>{destinationLabel}</Label>
                      <select
                        value={entrepotDestinationId}
                        onChange={(e) => setEntrepotDestinationId(e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Destination...</option>
                        {entrepots.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {showLot && (
                  <div className="space-y-2">
                    <Label>Lot</Label>
                    <select
                      value={lotId}
                      onChange={(e) => setLotId(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">
                        {loadingLots ? "Chargement des lots..." : "Sélectionner un lot"}
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

                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
                  <Label>Quantité à mouvementer</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    max={showLot && quantiteMax > 0 ? quantiteMax : undefined}
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    className={`${inputClass} mt-3 text-2xl font-[1000]`}
                    placeholder={
                      quantiteMax > 0 ? `Maximum ${quantiteMax}` : "0.00"
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date mouvement</Label>
                  <input
                    type="datetime-local"
                    value={dateMouvement}
                    onChange={(e) => setDateMouvement(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-8 lg:grid-cols-2 animate-in fade-in zoom-in-95">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-[#00A09D]">
                    Récapitulatif
                  </h5>

                  <div className="divide-y divide-gray-100 rounded-3xl border border-gray-100 bg-white px-6">
                    <SummaryRow label="Flux" value={typeMouvement} />
                    <SummaryRow
                      label="Article"
                      value={
                        selectedEmballage
                          ? `${selectedEmballage.code} - ${selectedEmballage.name}`
                          : "-"
                      }
                    />
                    <SummaryRow
                      label="Volume"
                      value={quantite ? String(quantite) : "-"}
                    />
                    <SummaryRow
                      label="Trajet"
                      value={`${selectedSource?.nom || "-"} → ${
                        selectedDestination?.nom || "-"
                      }`}
                    />
                    <SummaryRow
                      label="Date"
                      value={dateMouvement || "-"}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-[#00A09D]">
                    Contrôle Stock
                  </h5>

                  <div className="rounded-3xl bg-[#1C2434] p-6 text-white shadow-xl">
                    <Label className="!text-gray-400">Lot sélectionné</Label>
                    <div className="mt-3 rounded-xl bg-white/10 p-4">
                      <div className="text-sm font-bold">
                        {showLot
                          ? selectedLot?.lot?.code_lot || "Aucun lot sélectionné"
                          : "Ce type ne nécessite pas de lot"}
                      </div>
                      {showLot && quantiteMax > 0 && (
                        <p className="mt-3 text-xs font-bold text-[#00A09D]">
                          Stock disponible : {quantiteMax}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-10 py-8">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-[#1C2434]"
            >
              <ChevronLeft size={16} />
              {step === 1 ? "Abandonner" : "Retour"}
            </button>

            <div className="flex gap-4">
              {step < 4 ? (
                <button
                  type="button"
                  disabled={!canGoNext()}
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-3 rounded-full bg-[#1C2434] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#1C2434]/20 transition-all hover:bg-[#00A09D] disabled:grayscale disabled:opacity-20"
                >
                  Étape suivante
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#00A09D] px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-[8px_8px_0px_rgba(28,36,52,0.2)] transition-all hover:bg-[#1C2434] active:translate-y-1 active:shadow-none"
                >
                  {saving ? "Enregistrement..." : "Confirmer le mouvement"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className="text-sm font-bold text-[#1C2434]">{value}</span>
    </div>
  );
}