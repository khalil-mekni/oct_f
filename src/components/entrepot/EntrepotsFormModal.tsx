"use client";

import { useState } from "react";
import { Building2, MapPin, Layers3, Activity, X, CheckCircle } from "lucide-react";
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header avec gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#00A09D] to-[#008784] px-6 py-5">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-white/10" />
          
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                Smart Packaging Logistics
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                {editing ? "Modifier l'entrepôt" : "Nouvel entrepôt"}
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Renseignez les informations principales de l'entrepôt.
              </p>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 hover:scale-105"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#F8FAFC] to-white p-6">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
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
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Activity size={12} />
                  Statut
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Activity size={16} />
                  </div>

                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-[#00A09D] focus:ring-4 focus:ring-[#00A09D]/20 cursor-pointer"
                    value={form.statut ?? "ACTIVE"}
                    onChange={(e) =>
                      setForm({ ...form, statut: e.target.value })
                    }
                  >
                    <option value="ACTIVE">✅ ACTIVE</option>
                    <option value="INACTIVE">⭕ INACTIVE</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() => onSave(form)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00A09D] to-[#008784] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
          >
            <CheckCircle size={16} />
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
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {icon && <span className="text-[#00A09D]">{icon}</span>}
      {label}
    </label>

    <div className="relative group">
      {icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#00A09D]">
          {icon}
        </div>
      )}

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-sm text-slate-700 outline-none transition-all focus:border-[#00A09D] focus:ring-4 focus:ring-[#00A09D]/20 placeholder:text-slate-400 ${
          icon ? "pl-10" : "pl-4"
        } pr-4`}
      />
    </div>
  </div>
);