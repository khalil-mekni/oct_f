"use client";

import { useState } from "react";
import { Building2, MapPin, Layers3, Activity, X } from "lucide-react";
import { Entrepot } from "@/lib/entrepot.api";

interface EntrepotsFormModalProps {
  editing: Entrepot | null;
  onSave: (form: Partial<Entrepot>) => void;
  onClose: () => void;
}

interface InputProps {
  label: string;
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function EntrepotsFormModal({
  editing,
  onSave,
  onClose,
}: EntrepotsFormModalProps) {
  const [form, setForm] = useState<Partial<Entrepot>>(
    editing || {
      nom: "",
      adresse: "",
      capacite_totale: undefined,
      capacite_disponible: undefined,
      statut: "ACTIVE",
    }
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#00A09D]">
                Smart Packaging Logistics
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                {editing ? "Modifier l'entrepôt" : "Nouvel entrepôt"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Renseignez les informations principales de l’entrepôt.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="bg-[#F8FAFC] p-6">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="Nom de l'entrepôt"
                value={form.nom}
                onChange={(v) => setForm({ ...form, nom: v })}
                placeholder="Ex: Entrepôt Principal"
                icon={<Building2 size={16} />}
              />

              <Input
                label="Adresse / localisation"
                value={form.adresse}
                onChange={(v) => setForm({ ...form, adresse: v })}
                placeholder="Ex: 42 Rue de la Logistique, Tunis"
                icon={<MapPin size={16} />}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Capacité totale"
                type="number"
                value={form.capacite_totale}
                onChange={(v) =>
                  setForm({
                    ...form,
                    capacite_totale: v === "" ? null : Number(v),
                  })
                }
                placeholder="Ex: 10000"
                icon={<Layers3 size={16} />}
              />

              <Input
                label="Capacité disponible"
                type="number"
                value={form.capacite_disponible}
                onChange={(v) =>
                  setForm({
                    ...form,
                    capacite_disponible: v === "" ? null : Number(v),
                  })
                }
                placeholder="Ex: 2500"
                icon={<Layers3 size={16} />}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Statut
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Activity size={16} />
                  </div>

                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#00A09D] focus:ring-4 focus:ring-[#00A09D]/10"
                    value={form.statut ?? "ACTIVE"}
                    onChange={(e) =>
                      setForm({ ...form, statut: e.target.value })
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => onSave(form)}
            className="rounded-xl bg-[#00A09D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#008784]"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
}: InputProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
    </label>

    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#00A09D] focus:ring-4 focus:ring-[#00A09D]/10 ${
          icon ? "pl-10" : "pl-4"
        }`}
      />
    </div>
  </div>
);