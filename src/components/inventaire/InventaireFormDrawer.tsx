"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Save,
  Package,
  Warehouse,
  ClipboardList,
  Calendar,
  AlertCircle,
  Layers,
} from "lucide-react";
import { CreateInventaireInput, TableInventaire } from "@/types/inventaire";

interface Option {
  id: string;
  label: string;
}

interface EntrepotLotRaw {
  id: string;
  quantite: number;
  lot: {
    id: string;
    code_lot: string;
  };
  emballage: {
    id: string;
    code: string;
    name: string;
  };
}

interface EntrepotRaw {
  id: string;
  nom: string;
  entrepotLots: EntrepotLotRaw[];
}

type LotDisponibleOption = {
  id: string;
  code_lot: string;
  quantite: number;
  emballage_name: string;
};

interface Props {
  open: boolean;
  item?: TableInventaire | null;
  entrepots: Option[];
  emballages: Option[];
  entrepotsRaw?: EntrepotRaw[];
  onClose: () => void;
  onSubmit: (payload: CreateInventaireInput) => Promise<void>;
}

type FormState = Omit<CreateInventaireInput, "stock_physique"> & {
  stock_physique: number | "";
};

function buildInitialForm(item?: TableInventaire | null): FormState {
  if (item) {
    return {
      entrepot_id: item.entrepot_id,
      emballage_id: item.emballage_id,
      stock_physique: item.stock_physique,
      date_inventaire: item.date_inventaire?.slice(0, 16) ?? "",
      periode_debut: item.periode_debut?.slice(0, 16) ?? "",
      periode_fin: item.periode_fin?.slice(0, 16) ?? "",
      user_id: item.user_id ?? "1",
    };
  }

  return {
    entrepot_id: "",
    emballage_id: "",
    stock_physique: "",
    date_inventaire: new Date().toISOString().slice(0, 16),
    periode_debut: "",
    periode_fin: "",
    user_id: "1",
  };
}

export default function InventaireFormDrawer({
  open,
  item,
  entrepots,
  emballages,
  entrepotsRaw = [],
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(buildInitialForm(item));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(item));
    }
  }, [open, item]);

  const lotsDisponibles = useMemo<LotDisponibleOption[]>(() => {
    if (!form.entrepot_id || !form.emballage_id) return [];

    const entrepot = entrepotsRaw.find(
      (e) => String(e.id) === String(form.entrepot_id)
    );

    if (!entrepot) return [];

    return (entrepot.entrepotLots ?? [])
      .filter((el) => el.lot && String(el.emballage.id) === String(form.emballage_id))
      .map((el) => ({
        id: String(el.lot!.id),
        code_lot: el.lot!.code_lot,
        quantite: Number(el.quantite),
        emballage_name: el.emballage.name,
      }));
  }, [form.entrepot_id, form.emballage_id, entrepotsRaw]);

  const totalTheorique = useMemo(() => {
    return lotsDisponibles.reduce((acc, lot) => acc + Number(lot.quantite), 0);
  }, [lotsDisponibles]);

  const showLots = Boolean(form.entrepot_id && form.emballage_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.stock_physique === "") return;

    setSaving(true);

    try {
      await onSubmit({
        ...form,
        stock_physique: Number(form.stock_physique),
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl border-l border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/60">
          <div>
            <p className="text-[10px] uppercase font-extrabold tracking-[0.15em] text-[#00A09D]">
              {item ? "Modifier" : "Nouveau"} inventaire
            </p>

            <h2 className="text-xl font-black text-gray-900 mt-0.5 flex items-center gap-2">
              <ClipboardList size={20} className="text-[#00A09D]" />
              Audit de stock
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form
          id="inventaire-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto divide-y divide-gray-100"
        >
          <section className="px-6 py-5 space-y-3">
            <SectionTitle icon={<Warehouse size={14} />} label="Entrepôt" />

            <div className="relative">
              <select
                value={form.entrepot_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    entrepot_id: e.target.value,
                    emballage_id: "",
                  })
                }
                className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A09D]/40 focus:border-[#00A09D] transition-all appearance-none"
                required
              >
                <option value="">— Sélectionner un entrepôt —</option>
                {entrepots.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </section>

          <section className="px-6 py-5 space-y-3">
            <SectionTitle icon={<Package size={14} />} label="Emballage" />

            <div className="relative">
              <select
                value={form.emballage_id}
                onChange={(e) =>
                  setForm({ ...form, emballage_id: e.target.value })
                }
                className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A09D]/40 focus:border-[#00A09D] transition-all appearance-none"
                required
              >
                <option value="">— Sélectionner un emballage —</option>
                {emballages.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </section>

          {showLots && (
            <section className="px-6 py-5 space-y-3">
              <SectionTitle icon={<Layers size={14} />} label="Lots disponibles" />

              {lotsDisponibles.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  <AlertCircle size={15} className="shrink-0" />
                  Aucun lot disponible pour cet emballage dans cet entrepôt.
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wide">
                          <th className="text-left px-4 py-2 font-semibold">
                            Code lot
                          </th>
                          <th className="text-left px-4 py-2 font-semibold">
                            Emballage
                          </th>
                          <th className="text-right px-4 py-2 font-semibold">
                            Quantité
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {lotsDisponibles.map((lot) => (
                          <tr
                            key={lot.id}
                            className="hover:bg-gray-50/60 transition-colors"
                          >
                            <td className="px-4 py-2.5 font-mono text-gray-800 text-xs">
                              {lot.code_lot}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">
                              {lot.emballage_name}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-800">
                              {lot.quantite.toLocaleString("fr-FR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#00A09D]/10 border border-[#00A09D]/20 px-4 py-3">
                    <span className="text-sm font-semibold text-[#00A09D]">
                      Stock théorique calculé
                    </span>
                    <span className="text-base font-black text-[#00A09D]">
                      {totalTheorique.toLocaleString("fr-FR")}
                    </span>
                  </div>
                </>
              )}
            </section>
          )}

          <section className="px-6 py-5 space-y-3">
            <SectionTitle
              icon={<ClipboardList size={14} />}
              label="Quantité physique"
              required
            />

            <input
              type="number"
              step="any"
              min="0"
              value={form.stock_physique}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock_physique:
                    e.target.value === "" ? "" : parseFloat(e.target.value),
                })
              }
              className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A09D]/40 focus:border-[#00A09D] transition-all"
              placeholder="Saisir la quantité comptée…"
              required
            />

            {showLots && lotsDisponibles.length > 0 && form.stock_physique !== "" && (
              <EcartBadge
                physique={Number(form.stock_physique)}
                theorique={totalTheorique}
              />
            )}
          </section>

          <section className="px-6 py-5 space-y-3">
            <SectionTitle icon={<Calendar size={14} />} label="Dates" />

            <div className="space-y-2">
              <Label text="Date d'inventaire" required />
              <input
                type="datetime-local"
                value={form.date_inventaire}
                onChange={(e) =>
                  setForm({ ...form, date_inventaire: e.target.value })
                }
                className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A09D]/40 focus:border-[#00A09D] transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label text="Période début" />
                <input
                  type="datetime-local"
                  value={form.periode_debut ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, periode_debut: e.target.value })
                  }
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A09D]/40 focus:border-[#00A09D] transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label text="Période fin" />
                <input
                  type="datetime-local"
                  value={form.periode_fin ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, periode_fin: e.target.value })
                  }
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00A09D]/40 focus:border-[#00A09D] transition-all"
                />
              </div>
            </div>
          </section>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>

          <button
            form="inventaire-form"
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00A09D] text-white text-sm font-semibold hover:bg-[#008F8C] disabled:opacity-60 transition-colors"
          >
            <Save size={15} />
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  label,
  required,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#00A09D]">{icon}</span>
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-500">
        {label}
      </h3>
      {required && <span className="text-[#00A09D] text-xs font-bold">*</span>}
    </div>
  );
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <p className="text-xs font-semibold text-gray-500">
      {text}
      {required && <span className="text-[#00A09D] ml-0.5">*</span>}
    </p>
  );
}

function ChevronDown() {
  return (
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 4l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function EcartBadge({
  physique,
  theorique,
}: {
  physique: number;
  theorique: number;
}) {
  const ecart = physique - theorique;
  const isNeg = ecart < 0;
  const isZero = ecart === 0;

  const colorClass = isZero
    ? "bg-gray-50 border-gray-200 text-gray-600"
    : isNeg
      ? "bg-red-50 border-red-200 text-red-700"
      : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${colorClass}`}
    >
      <span className="text-xs font-semibold">Écart prévisionnel</span>
      <span className="text-sm font-black">
        {isNeg ? "" : "+"}
        {ecart.toLocaleString("fr-FR")}
      </span>
    </div>
  );
}