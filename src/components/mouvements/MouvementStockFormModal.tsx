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
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
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
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-[#1C2434]/50">
      {children}
      {required && <span className="ml-1 text-[#00A09D]">*</span>}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span
        className={`text-right text-sm font-bold ${highlight ? "text-[#00A09D]" : "text-[#1C2434]"}`}
      >
        {value}
      </span>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-[#1C2434] outline-none transition-all placeholder:text-gray-300 focus:border-[#00A09D]/40 focus:bg-white focus:ring-2 focus:ring-[#00A09D]/10";

const selectCls = `${inputCls} cursor-pointer`;

const typeCards = [
  {
    value: "ENT" as const,
    label: "Entrée",
    description: "Réception de stock vers un entrepôt",
    icon: "📥",
    color: "blue",
  },
  {
    value: "CDD" as const,
    label: "Transfert",
    description: "Déplacement entre deux entrepôts",
    icon: "🔄",
    color: "violet",
  },
  {
    value: "PTE" as const,
    label: "Perte",
    description: "Écart ou perte constatée",
    icon: "⚠️",
    color: "red",
  },
  {
    value: "PRD" as const,
    label: "Production",
    description: "Sortie liée à la production",
    icon: "📦",
    color: "amber",
  },
  {
    value: "SPL" as const,
    label: "Surplus",
    description: "Ajustement positif de stock",
    icon: "➕",
    color: "cyan",
  },
];

const typeColorMap: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50/60 ring-blue-100",
  violet: "border-violet-200 bg-violet-50/60 ring-violet-100",
  red: "border-red-200 bg-red-50/60 ring-red-100",
  amber: "border-amber-200 bg-amber-50/60 ring-amber-100",
  cyan: "border-cyan-200 bg-cyan-50/60 ring-cyan-100",
};

const typeIconBg: Record<string, string> = {
  blue: "bg-blue-100",
  violet: "bg-violet-100",
  red: "bg-red-100",
  amber: "bg-amber-100",
  cyan: "bg-cyan-100",
};

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
  const [availableEntrepotsForLot, setAvailableEntrepotsForLot] = useState<
    any[]
  >([]);
  const [quantiteMax, setQuantiteMax] = useState<number>(0);
  const [capaciteTotale, setCapaciteTotale] = useState(0);
  const [stockExistant, setStockExistant] = useState(0);
  const [capaciteDisponible, setCapaciteDisponible] = useState(0);

  const [loadingLots, setLoadingLots] = useState(false);
  const [loadingEntrepotsForLot, setLoadingEntrepotsForLot] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

const showSource = ["CDD", "PTE", "PRD"].includes(typeMouvement);
const showDestination = ["ENT", "CDD", "SPL"].includes(typeMouvement);
const showLot = ["CDD", "PTE", "PRD"].includes(typeMouvement);

  useEffect(() => {
    setError("");
    setLotId("");
    setEntrepotSourceId("");
    setEntrepotDestinationId("");
    setAvailableLots([]);
    setAvailableEntrepotsForLot([]);
    setQuantiteMax(0);
    setQuantite("");
    setCapaciteTotale(0);
    setStockExistant(0);
    setCapaciteDisponible(0);
  }, [typeMouvement]);

  useEffect(() => {
    setLotId("");
    setAvailableLots([]);
    setAvailableEntrepotsForLot([]);
    setQuantiteMax(0);
  }, [emballageId]);

  useEffect(() => {
    const targetId = showDestination ? entrepotDestinationId : "";
    if (!targetId) {
      setCapaciteTotale(0);
      setStockExistant(0);
      setCapaciteDisponible(0);
      return;
    }
    const entrepot = entrepots.find((e) => String(e.id) === String(targetId));
    if (!entrepot) {
      setCapaciteTotale(0);
      setStockExistant(0);
      setCapaciteDisponible(0);
      return;
    }
    const total = Number(entrepot.capacite_totale ?? 0);
    const stock = Number(entrepot.stock_existant ?? 0);
    setCapaciteTotale(total);
    setStockExistant(stock);
    setCapaciteDisponible(Math.max(total - stock, 0));
  }, [showDestination, entrepotDestinationId, entrepots]);

  useEffect(() => {
    setLotId("");
    setAvailableLots([]);
    setAvailableEntrepotsForLot([]);
    setQuantiteMax(0);
    if (!showLot || !entrepotSourceId || !emballageId) return;
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
        setAvailableLots(
          Array.isArray(res) ? res : res?.availableLotsByEntrepot ?? []
        );
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Erreur chargement lots.");
      } finally {
        if (active) setLoadingLots(false);
      }
    }
    loadLots();
    return () => {
      active = false;
    };
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
        const rows = Array.isArray(res)
          ? res
          : res?.availableEntrepotsByLot ?? [];
        setAvailableEntrepotsForLot(rows);
        if (showSource && !entrepotSourceId && rows.length === 1) {
          setEntrepotSourceId(String(rows[0].entrepot.id));
        }
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "Erreur chargement entrepôts du lot.");
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
    if (!showLot || !lotId || !emballageId || !entrepotSourceId) return;
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
        setError(e?.message ?? "Erreur calcul quantité disponible.");
      }
    }
    loadDisponible();
    return () => {
      active = false;
    };
  }, [typeMouvement, lotId, entrepotSourceId, emballageId, showLot]);

  const filteredSourceEntrepots = useMemo(() => {
    if (!lotId || availableEntrepotsForLot.length === 0) return entrepots;
    const ids = new Set(
      availableEntrepotsForLot.map((row) => String(row.entrepot.id))
    );
    return entrepots.filter((e) => ids.has(String(e.id)));
  }, [entrepots, lotId, availableEntrepotsForLot]);

  const selectedEmballage = emballages.find(
    (e) => String(e.id) === String(emballageId)
  );
  const selectedLot = availableLots.find(
    (row) => String(row.lot.id) === String(lotId)
  );
  const selectedSource = entrepots.find(
    (e) => String(e.id) === String(entrepotSourceId)
  );
  const selectedDestination = entrepots.find(
    (e) => String(e.id) === String(entrepotDestinationId)
  );
  const selectedType = typeCards.find((t) => t.value === typeMouvement);

  const qty = Number(quantite);
  const capacityExceeded =
    showDestination &&
    capaciteTotale > 0 &&
    quantite !== "" &&
    qty > capaciteDisponible;

  function canGoNext() {
    if (step === 1) return !!typeMouvement;
    if (step === 2) return !!emballageId;
    if (step === 3) {
      const sourceOk = showSource ? !!entrepotSourceId : true;
      const destOk = showDestination ? !!entrepotDestinationId : true;
      const lotOk = showLot ? !!lotId : true;
      const qtyOk = !!quantite && Number(quantite) > 0;
      const stockOk =
        showLot && quantiteMax > 0 ? Number(quantite) <= quantiteMax : true;
      return sourceOk && destOk && lotOk && qtyOk && stockOk && !capacityExceeded;
    }
    return true;
  }

  function goNext() {
    if (!canGoNext()) return;
    setError("");
    setStep((prev) => Math.min(prev + 1, 4));
  }

  async function handleCreateDraft() {
    if (step !== 4) return;
    setError("");
    if (!emballageId) { setError("Veuillez choisir un emballage."); setStep(2); return; }
    if (showSource && !entrepotSourceId) { setError("Veuillez choisir un entrepôt source."); setStep(3); return; }
    if (showDestination && !entrepotDestinationId) { setError("Veuillez choisir un entrepôt destination."); setStep(3); return; }
    if (typeMouvement === "CDD" && String(entrepotSourceId) === String(entrepotDestinationId)) {
      setError("La source et la destination doivent être différentes."); setStep(3); return;
    }
    if (showLot && !lotId) { setError("Veuillez choisir un lot."); setStep(3); return; }
    if (!qty || qty <= 0 || Number.isNaN(qty)) { setError("La quantité doit être supérieure à 0."); setStep(3); return; }
    if (showLot && quantiteMax > 0 && qty > quantiteMax) { setError(`Quantité max : ${quantiteMax}.`); setStep(3); return; }
    if (capacityExceeded) { setError(`Capacité dépassée. Disponible : ${capaciteDisponible}.`); setStep(3); return; }
    if (!dateMouvement) { setError("Veuillez choisir la date."); setStep(3); return; }
    try {
      setSaving(true);
      await onSave({
  type_mouvement: typeMouvement,
  emballage_id: emballageId,

  // SPL crée un nouveau lot automatiquement côté backend
  lot_id: showLot ? lotId : null,

  // SPL n'a pas de source
  entrepot_source_id: showSource ? entrepotSourceId : null,

  // SPL utilise seulement destination = entrepôt où ajouter le surplus
  entrepot_destination_id: showDestination ? entrepotDestinationId : null,

  quantite: qty,
  date_mouvement: toGraphqlDateTime(dateMouvement),
});
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la création du brouillon.");
    } finally {
      setSaving(false);
    }
  }

  const steps = [
    { s: 1, icon: <ArrowRightLeft size={15} />, label: "Type" },
    { s: 2, icon: <Package size={15} />, label: "Article" },
    { s: 3, icon: <Truck size={15} />, label: "Logistique" },
    { s: 4, icon: <ClipboardCheck size={15} />, label: "Révision" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#1C2434]/70 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
      />

      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-6 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h2 className="text-2xl font-[1000] uppercase tracking-tighter text-[#1C2434] dark:text-white">
              Nouveau Brouillon<span className="text-[#00A09D]">.</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Étape {step} / 4
            </p>
          </div>

          {/* Stepper */}
          <div className="hidden items-center gap-1 sm:flex">
            {steps.map((item, index) => (
              <div key={item.s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black transition-all ${
                    step > item.s
                      ? "bg-[#00A09D] text-white"
                      : step === item.s
                        ? "bg-[#1C2434] text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > item.s ? "✓" : item.icon}
                </div>
                <span
                  className={`ml-1.5 hidden text-[9px] font-black uppercase tracking-widest lg:block ${
                    step >= item.s ? "text-[#1C2434] dark:text-white" : "text-gray-400"
                  }`}
                >
                  {item.label}
                </span>
                {index < 3 && (
                  <div
                    className={`mx-2 h-px w-8 rounded-full ${step > item.s ? "bg-[#00A09D]" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto px-8 py-7">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          {/* STEP 1 — Type */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
              {typeCards.map((type) => {
                const active = typeMouvement === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => { setTypeMouvement(type.value); setStep(2); }}
                    className={`group relative rounded-2xl border-2 p-5 text-left transition-all ${
                      active
                        ? `${typeColorMap[type.color]} ring-4`
                        : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                        active ? typeIconBg[type.color] : "bg-gray-100"
                      }`}
                    >
                      {type.icon}
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black uppercase tracking-tight text-[#1C2434]">
                        {type.label}
                      </h4>
                      <span className="rounded-md border border-gray-100 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-gray-500">
                        {type.value}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2 — Emballage */}
          {step === 2 && (
            <div className="mx-auto max-w-lg animate-in fade-in slide-in-from-right-3 duration-200">
              <Label required>Sélectionner l&apos;Emballage / Produit</Label>
              <select
                value={emballageId}
                onChange={(e) => setEmballageId(e.target.value)}
                className={`${selectCls} mt-1 text-base`}
                size={Math.min(emballages.length + 1, 8)}
              >
                <option value="">-- Choisir un produit --</option>
                {emballages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} · {item.name}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {emballages.length} produit(s) disponible(s)
              </p>
            </div>
          )}

          {/* STEP 3 — Logistique */}
          {step === 3 && (
            <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
              {/* Source / Destination */}
              <div className="grid gap-4 sm:grid-cols-2">
                {showSource && (
                  <div>
                    <Label required>Entrepôt source</Label>
                    <select
                      value={entrepotSourceId}
                      onChange={(e) => setEntrepotSourceId(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Source...</option>
                      {filteredSourceEntrepots.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nom}
                        </option>
                      ))}
                    </select>
                    {loadingEntrepotsForLot && (
                      <p className="mt-1 text-[10px] font-bold text-gray-400">
                        Chargement...
                      </p>
                    )}
                  </div>
                )}
                {showDestination && (
                  <div>
                    <Label required>
                      {typeMouvement === "SPL" ? "Entrepôt cible" : "Entrepôt destination"}
                    </Label>
                    <select
                      value={entrepotDestinationId}
                      onChange={(e) => setEntrepotDestinationId(e.target.value)}
                      className={selectCls}
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

              {/* Lot */}
              {showLot && (
                <div>
                  <Label required>Lot</Label>
                  <select
                    value={lotId}
                    onChange={(e) => setLotId(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">
                      {loadingLots ? "Chargement des lots..." : "Sélectionner un lot"}
                    </option>
                    {availableLots.map((row) => (
                      <option key={row.id} value={row.lot.id}>
                        {row.lot.code_lot} — dispo {row.quantite}
                      </option>
                    ))}
                  </select>
                  {showLot && quantiteMax > 0 && (
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
                      <AlertTriangle size={14} className="text-amber-500" />
                      <span className="text-sm font-bold text-amber-700">
                        Stock disponible : <strong>{quantiteMax}</strong> unités
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Capacité destination */}
              {showDestination && capaciteTotale > 0 && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    capacityExceeded
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-[#00A09D]/20 bg-[#00A09D]/5 text-[#00A09D]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Capacité entrepôt</span>
                    <div className="flex gap-4 text-[11px] font-black">
                      <span>Total: {capaciteTotale}</span>
                      <span>Occupé: {stockExistant}</span>
                      <span className="font-black">Dispo: {capaciteDisponible}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                    <div
                      className={`h-full rounded-full transition-all ${capacityExceeded ? "bg-red-500" : "bg-[#00A09D]"}`}
                      style={{ width: `${Math.min((stockExistant / capaciteTotale) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quantité */}
              <div>
                <Label required>Quantité à mouvementer</Label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  max={
                    showLot && quantiteMax > 0
                      ? quantiteMax
                      : showDestination && capaciteDisponible > 0
                        ? capaciteDisponible
                        : undefined
                  }
                  value={quantite}
                  onChange={(e) => {
                    setQuantite(e.target.value);
                    const nextQty = Number(e.target.value);
                    if (showDestination && capaciteDisponible > 0 && nextQty > capaciteDisponible) {
                      setError(`Capacité dépassée ! Maximum : ${capaciteDisponible}`);
                    } else {
                      setError("");
                    }
                  }}
                  className={`${inputCls} mt-1 text-xl font-[1000] ${capacityExceeded ? "border-red-300 bg-red-50" : ""}`}
                  placeholder={
                    showLot && quantiteMax > 0
                      ? `Max ${quantiteMax}`
                      : showDestination && capaciteDisponible > 0
                        ? `Max ${capaciteDisponible}`
                        : "0.000"
                  }
                />
              </div>

              {/* Date */}
              <div>
                <Label required>Date du mouvement</Label>
                <input
                  type="datetime-local"
                  value={dateMouvement}
                  onChange={(e) => setDateMouvement(e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              </div>
            </div>
          )}

          {/* STEP 4 — Récapitulatif */}
          {step === 4 && (
            <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in zoom-in-95 duration-200">
              {/* Left: Summary */}
              <div>
                <h5 className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#00A09D]">
                  Récapitulatif du mouvement
                </h5>
                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-5 dark:border-gray-800 dark:bg-gray-900">
                  <SummaryRow label="Type" value={`${selectedType?.icon ?? ""} ${typeMouvement} — ${selectedType?.label ?? ""}`} />
                  <SummaryRow
                    label="Produit"
                    value={selectedEmballage ? `${selectedEmballage.code} · ${selectedEmballage.name}` : "—"}
                  />
                  <SummaryRow
                    label="Source"
                    value={selectedSource?.nom || (showSource ? "—" : "N/A")}
                  />
                  <SummaryRow
                    label="Destination"
                    value={selectedDestination?.nom || (showDestination ? "—" : "N/A")}
                  />
                  <SummaryRow label="Volume" value={quantite ? `${quantite} unités` : "—"} highlight />
                  <SummaryRow label="Date" value={dateMouvement || "—"} />
                </div>
              </div>

              {/* Right: Stock control */}
              <div>
                <h5 className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#00A09D]">
                  Contrôle stock
                </h5>
                <div className="rounded-2xl bg-[#1C2434] p-5 text-white">
                  <div className="mb-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Lot sélectionné
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-sm font-black">
                      {typeMouvement === "SPL"
  ? "Nouveau lot automatique"
  : showLot
    ? selectedLot?.lot?.code_lot ?? "Aucun lot sélectionné"
    : "Non applicable"}
                    </p>
                    {showLot && quantiteMax > 0 && (
                      <p className="mt-2 text-xs font-bold text-[#00A09D]">
                        Stock source disponible : {quantiteMax}
                      </p>
                    )}
                    {showDestination && capaciteTotale > 0 && (
                      <p className="mt-1 text-xs font-bold text-[#00A09D]">
                        Capacité destination : {capaciteDisponible}
                      </p>
                    )}
                  </div>

                  {!error && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#00A09D]/20 px-4 py-3">
                      <CheckCircle2 size={16} className="text-[#00A09D]" />
                      <span className="text-sm font-bold text-[#00A09D]">
                        Prêt à créer le brouillon
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-5 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            disabled={saving}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-[#1C2434] disabled:opacity-40 dark:hover:text-white"
          >
            <ChevronLeft size={14} />
            {step === 1 ? "Annuler" : "Retour"}
          </button>

          {step < 4 ? (
            <button
              type="button"
              disabled={!canGoNext() || saving}
              onClick={goNext}
              className="flex items-center gap-2 rounded-full bg-[#1C2434] px-7 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#00A09D] disabled:opacity-30"
            >
              Continuer
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || capacityExceeded || !!error}
              onClick={handleCreateDraft}
              className="flex items-center gap-2 rounded-full bg-[#00A09D] px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#1C2434] disabled:opacity-40"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Création...
                </>
              ) : (
                <>
                  <ClipboardCheck size={14} />
                  {typeMouvement === "SPL" ? "Créer et valider" : "Créer le brouillon"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}