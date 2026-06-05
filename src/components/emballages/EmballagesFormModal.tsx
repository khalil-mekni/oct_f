"use client";
import React, { useState } from "react";
import { X, Save, Settings2 } from "lucide-react";
import { updateEmballages, createEmballages } from "@/lib/emballages.api";
import { normalizeEmballages } from "@/types/emballage";

export default function EmballagesFormModal({ editing, setRows, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState(editing || {
    code: "", name: "", type: "", material: "", status: "ACTIVE", description: "", min_stock: 0,
    poids: 0, largeur: 0, epaisseur_pp: 0, epaisseur_ppc: 0,
    capacity_value: 0, capacity_unit: "KG"
  });

  const handleSubmit = async () => {
    setErrorMessage("");

    // Validation de tous les champs
    if (
      !form.name?.trim() ||
      !form.code?.trim() ||
      !form.type?.trim() ||
      !form.material?.trim() ||
      !form.description?.trim() ||
      form.min_stock === undefined || form.min_stock === "" ||
      form.poids === undefined || form.poids === "" ||
      form.largeur === undefined || form.largeur === "" ||
      form.epaisseur_pp === undefined || form.epaisseur_pp === "" ||
      form.epaisseur_ppc === undefined || form.epaisseur_ppc === "" ||
      form.capacity_value === undefined || form.capacity_value === "" ||
      !form.capacity_unit
    ) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (Number(form.min_stock) < 0) {
      setErrorMessage("Le stock minimum ne peut pas être négatif.");
      return;
    }

    if (Number(form.capacity_value) <= 0) {
      setErrorMessage("La capacité doit être supérieure à 0.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        type: form.type.trim(),
        material: form.material || null,
        status: form.status || "ACTIVE",
        description: form.description?.trim() || null,
        min_stock: Number(form.min_stock) || null,
        poids: Number(form.poids) || null,
        largeur: Number(form.largeur) || null,
        epaisseur_pp: Number(form.epaisseur_pp) || null,
        epaisseur_ppc: Number(form.epaisseur_ppc) || null,
        capacity_value: Number(form.capacity_value) || null,
        capacity_unit: form.capacity_unit || null,
      };

      if (editing) {
        const res = await updateEmballages(editing.id, payload);
        const updated = normalizeEmballages((res as any).updateEmballage);
        setRows((prev: any) =>
          prev.map((r: any) => String(r.id) === String(updated.id) ? updated : r)
        );
      } else {
        const res = await createEmballages(payload as any);
        const created = normalizeEmballages((res as any).createEmballage);
        setRows((prev: any) => [created, ...prev]);
      }

      onClose();
    } catch (err: any) {
      alert(err?.message || "Erreur de sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[101] w-full max-w-2xl bg-white shadow-[-30px_0_60px_rgba(0,0,0,0.1)] rounded-l-[3rem] flex flex-col">

        {/* HEADER */}
        <div className="p-12 pb-6 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] block mb-2">Configuration</span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">
              {editing ? "Modifier Fiche" : "Nouveau Modèle"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-12 bg-gray-50 hover:bg-gray-100 rounded-[1.2rem] flex items-center justify-center text-gray-400 transition-colors"
          >
            <X />
          </button>
        </div>

        {/* BODY SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-12 py-6 space-y-10">
          {errorMessage && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-red-100 bg-red-50 p-5 text-[11px] font-black text-red-600 uppercase tracking-wider animate-shake">
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errorMessage}
            </div>
          )}

          {/* NOM */}
          <div className="border-b-4 border-gray-50 focus-within:border-indigo-500 pb-4 transition-all">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">
              Désignation Commerciale
            </label>
            <input
              className="w-full text-4xl font-black text-gray-900 placeholder:text-gray-100 bg-transparent outline-none tracking-tighter uppercase"
              placeholder="NOM DE L'EMBALLAGE..."
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <InputField label="Code Interne" value={form.code} onChange={(v: any) => setForm({ ...form, code: v })} required disabled={!!editing} />
            <InputField label="Type (Ex: Sac, Film)" value={form.type} onChange={(v: any) => setForm({ ...form, type: v })} required />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <InputField label="Matériau" value={form.material} onChange={(v: any) => setForm({ ...form, material: v })} />
            <div className="space-y-3 text-xs font-black">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Statut</label>
              <select
                className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 p-4 outline-none focus:bg-white"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <InputField
              label="Stock minimum"
              type="number"
              value={form.min_stock}
              onChange={(v: any) => setForm({ ...form, min_stock: v })}
            />
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description</label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 p-4 text-xs font-black text-gray-900 outline-none focus:border-indigo-500/20 focus:bg-white transition-all resize-none"
                placeholder="Description de l'emballage..."
              />
            </div>
          </div>

          {/* SECTION TECHNIQUE */}
          <div className="bg-gray-50/80 p-10 rounded-[2.5rem] space-y-8 border border-gray-100">
            <div className="flex items-center gap-3 text-indigo-600">
              <Settings2 size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Fiche Technique Appliquée</span>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <TechnicalInput label="Poids (kg)" value={form.poids} onChange={(v: any) => setForm({ ...form, poids: v })} />
              <TechnicalInput label="Largeur (cm)" value={form.largeur} onChange={(v: any) => setForm({ ...form, largeur: v })} />
              <TechnicalInput label="Épais. PP (μ)" value={form.epaisseur_pp} onChange={(v: any) => setForm({ ...form, epaisseur_pp: v })} />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <TechnicalInput label="Épais. PPC (μ)" value={form.epaisseur_ppc} onChange={(v: any) => setForm({ ...form, epaisseur_ppc: v })} />
              <TechnicalInput label="Capacité" value={form.capacity_value} onChange={(v: any) => setForm({ ...form, capacity_value: v })} />
              <UnitSelect value={form.capacity_unit} onChange={(v: any) => setForm({ ...form, capacity_unit: v })} />
            </div>
          </div>
        </div>

        {/* FOOTER — boutons DANS le composant, pas dans un form */}
        <div className="p-12 border-t border-gray-50 bg-white flex items-center gap-6">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-900"
          >
            Annuler
          </button>
          {/* ✅ onClick={handleSubmit} direct — pas de form, pas de submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gray-900 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.25em] shadow-2xl transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Sauvegarde...
              </span>
            ) : (
              <><Save size={18} /> Valider la fiche technique</>
            )}
          </button>
        </div>

      </div>
    </>
  );
}

const InputField = ({ label, value, onChange, required, disabled, type = "text" }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">{label}</label>
    <input
      type={type}
      required={required}
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50 p-4 text-xs font-black text-gray-900 outline-none focus:border-indigo-500/20 focus:bg-white transition-all disabled:opacity-50"
    />
  </div>
);

const UnitSelect = ({ value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Unité</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b-2 border-gray-200 py-2 text-xl font-black outline-none focus:border-indigo-500 transition-all"
    >
      <option value="KG">KG</option>
      <option value="L">L</option>
      <option value="M3">M³</option>
      <option value="TONNE">Tonne</option>
      <option value="UNITE">UNITÉ</option>
    </select>
  </div>
);

const TechnicalInput = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{label}</label>
    <input
      type="number"
      step="0.01"
      className="w-full bg-transparent border-b-2 border-gray-200 py-2 text-xl font-black outline-none focus:border-indigo-500 transition-all"
      value={value ?? 0}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);