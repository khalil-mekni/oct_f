"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Layers3,
  Activity,
  X,
  CheckCircle2,
  Warehouse,
} from "lucide-react";
import { Entrepot } from "@/lib/entrepot.api";

interface EntrepotsFormModalProps {
  editing: Entrepot | null;
  onSave: (form: Partial<Entrepot>) => void;
  onClose: () => void;
  saving?: boolean;
}

interface InputFieldProps {
  label: string;
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  type?: "text" | "number";
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

function Label({
  icon,
  children,
  required,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
      {icon && <span className="text-[#00A09D]">{icon}</span>}
      {children}
      {required && <span className="text-[#00A09D]">*</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold text-[#1C2434] outline-none transition-all placeholder:text-gray-300 focus:border-[#00A09D]/40 focus:bg-white focus:ring-2 focus:ring-[#00A09D]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
  required,
}: InputFieldProps) {
  return (
    <div>
      <Label icon={icon} required={required}>
        {label}
      </Label>
      <div className="relative group">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#00A09D]">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputCls} ${icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}

export default function EntrepotsFormModal({
  editing,
  onSave,
  onClose,
  saving,
}: EntrepotsFormModalProps) {
  const [form, setForm] = useState<Partial<Entrepot>>(
    editing ?? {
      nom: "",
      adresse: "",
      capacite_totale: undefined,
      capacite_disponible: undefined,
      statut: "ACTIVE",
    }
  );

  const isEditing = !!editing;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1C2434]/70 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-7 py-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00A09D]">
              <Warehouse size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-[1000] uppercase tracking-tighter text-[#1C2434] dark:text-white">
                {isEditing ? "Modifier" : "Nouvel entrepôt"}
                <span className="text-[#00A09D]">.</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {isEditing
                  ? `Mise à jour de ${editing?.nom ?? "l'entrepôt"}`
                  : "Renseignez les informations"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-7 py-6">
          {/* Nom */}
          <InputField
            label="Nom de l'entrepôt"
            value={form.nom}
            onChange={(v) => setForm({ ...form, nom: v })}
            placeholder="Ex : Entrepôt Principal Nord"
            icon={<Building2 size={15} />}
            required
          />

          {/* Adresse */}
          <InputField
            label="Adresse / Localisation"
            value={form.adresse}
            onChange={(v) => setForm({ ...form, adresse: v })}
            placeholder="Ex : 42 Rue de la Logistique, Tunis"
            icon={<MapPin size={15} />}
          />

          {/* Capacités */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Capacité totale"
              type="number"
              value={form.capacite_totale}
              onChange={(v) =>
                setForm({
                  ...form,
                  capacite_totale: v === "" ? undefined : Number(v),
                })
              }
              placeholder="Ex : 10 000"
              icon={<Layers3 size={15} />}
            />

            <InputField
              label="Capacité disponible"
              type="number"
              value={form.capacite_disponible}
              onChange={(v) =>
                setForm({
                  ...form,
                  capacite_disponible: v === "" ? undefined : Number(v),
                })
              }
              placeholder="Ex : 2 500"
              icon={<Layers3 size={15} />}
            />
          </div>

          {/* Statut */}
          <div>
            <Label icon={<Activity size={12} />}>Statut</Label>
            <div className="flex gap-3">
              {(["ACTIVE", "INACTIVE"] as const).map((status) => {
                const isSelected = (form.statut ?? "ACTIVE") === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setForm({ ...form, statut: status })}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                      isSelected
                        ? status === "ACTIVE"
                          ? "border-[#00A09D]/30 bg-[#00A09D]/8 text-[#00A09D]"
                          : "border-gray-300 bg-gray-100 text-gray-600"
                        : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "ACTIVE" ? "bg-[#00A09D]" : "bg-gray-400"
                      } ${isSelected ? "opacity-100" : "opacity-40"}`}
                    />
                    {status === "ACTIVE" ? "Actif" : "Inactif"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capacity preview bar */}
          {form.capacite_totale && form.capacite_totale > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Aperçu occupation
                </span>
                <span className="text-xs font-black text-[#1C2434] dark:text-white">
                  {form.capacite_disponible
                    ? Math.round(
                        ((form.capacite_totale - form.capacite_disponible) /
                          form.capacite_totale) *
                          100
                      )
                    : 0}
                  % utilisé
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#00A09D] transition-all duration-500"
                  style={{
                    width: `${
                      form.capacite_disponible
                        ? Math.min(
                            ((form.capacite_totale - form.capacite_disponible) /
                              form.capacite_totale) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-7 py-4 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => !saving && onClose()}
            disabled={saving}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors hover:text-[#1C2434] disabled:opacity-40 dark:hover:text-white"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={saving || !form.nom?.trim()}
            onClick={() => onSave(form)}
            className="flex items-center gap-2 rounded-xl bg-[#00A09D] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#1C2434] disabled:opacity-40"
          >
            {saving ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                {isEditing ? "Mettre à jour" : "Créer l'entrepôt"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}