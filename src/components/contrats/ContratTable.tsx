"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ContratHeader } from "./ContratHeader";
import { ContratListView } from "./ContratListView";
import { ContratForm } from "./ContratForm";
import { listContrats, createContrat, updateContrat, deleteContrat } from "@/lib/contrats.api";
import { listFournisseurs } from "@/lib/fournisseurs.api";
import { listEmballages } from "@/lib/emballages.api";
import { normalizeContrat, TableContrat } from "@/types/contrat";
import { TableEmballages } from "@/types/emballage";
import { TableFournisseur } from "@/types/fournisseur";
import OcrUploadModal from "@/components/common/OcrUploadModal";
import { OcrContratMappedData } from "@/types/ocr";
// Sous-composant interne pour la pagination en français
const LocalPagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void
}) => (
  <div className="flex items-center gap-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
    >
      Précédent
    </button>
    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-x px-6 border-gray-100">
      Page {currentPage} sur {totalPages}
    </div>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all shadow-sm"
    >
      Suivant
    </button>
  </div>
);

export default function ContratTable({ data }: { data?: TableContrat[] }) {
  const [rows, setRows] = useState<TableContrat[]>(data ? data.map(normalizeContrat) : []);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<TableContrat | null>(null);
  const [query, setQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [fournisseurs, setFournisseurs] = useState<TableFournisseur[]>([]);
  const [emballages, setEmballages] = useState<TableEmballages[]>([]);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrRawText, setOcrRawText] = useState("");
  const emptyForm: Partial<TableContrat> = {
    numero_contrat: "",
    objet: "",
    date_signature: "",
    date_debut: "",
    date_fin: "",
    quantite_contractuelle: 0,
    quantite_realisee: 0,
    taux_depassement_autorise: 0.2,
    montant_ht: 0,
    montant_tva: 0,
    taux_cautionnement: 3,
    taux_penalite_retard: 0.002,
    plafond_penalite: 5,
    prix_unitaire: 0,
    statut: "ACTIF",
    fournisseur_id: "",
    emballage_id: "",
  };
  const [form, setForm] = useState<Partial<TableContrat>>(emptyForm);

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [resF, resE] = await Promise.all([
          listFournisseurs(),
          listEmballages(1, 100)
        ]);
        setFournisseurs(resF.fournisseurs || []);
        setEmballages(resE.emballages.data || []);
      } catch (err) {
        console.error("Erreur de chargement des références", err);
      }
    };
    loadRefs();
  }, []);

  // Filtrage et Pagination combinés
  const filteredRows = useMemo(() => {
    return rows.filter(r =>
      r.numero_contrat.toLowerCase().includes(query.toLowerCase()) ||
      r.fournisseur?.raison_sociale?.toLowerCase().includes(query.toLowerCase())
    );
  }, [rows, query]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  // Reset la page si on recherche
  useEffect(() => { setCurrentPage(1); }, [query]);

  const stats = useMemo(() => {
    const total = rows.length;
    const totalV = rows.reduce((acc, c) => acc + (c.quantite_contractuelle || 0), 0);
    const totalR = rows.reduce((acc, c) => acc + (c.quantite_realisee || 0), 0);
    return {
      total,
      actifs: rows.filter(r => r.statut === "ACTIF").length,
      realisation: totalV > 0 ? Math.round((totalR / totalV) * 100) : 0
    };
  }, [rows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        numero_contrat: form.numero_contrat || "",
        objet: form.objet || null,
        date_signature: form.date_signature || null,
        date_debut: form.date_debut || "",
        date_fin: form.date_fin || "",
        quantite_contractuelle: Number(form.quantite_contractuelle) || 0,
        quantite_realisee:
          form.quantite_realisee !== "" && form.quantite_realisee !== null && form.quantite_realisee !== undefined
            ? Number(form.quantite_realisee)
            : 0,
        taux_depassement_autorise:
          form.taux_depassement_autorise !== "" && form.taux_depassement_autorise !== null && form.taux_depassement_autorise !== undefined
            ? Number(form.taux_depassement_autorise)
            : 0.2,
        montant_ht:
          form.montant_ht !== "" && form.montant_ht !== null && form.montant_ht !== undefined
            ? Number(form.montant_ht)
            : null,
        montant_tva:
          form.montant_tva !== "" && form.montant_tva !== null && form.montant_tva !== undefined
            ? Number(form.montant_tva)
            : 0,
        taux_cautionnement:
          form.taux_cautionnement !== "" && form.taux_cautionnement !== null && form.taux_cautionnement !== undefined
            ? Number(form.taux_cautionnement)
            : 3,
        taux_penalite_retard:
          form.taux_penalite_retard !== "" && form.taux_penalite_retard !== null && form.taux_penalite_retard !== undefined
            ? Number(form.taux_penalite_retard)
            : 0.002,
        plafond_penalite:
          form.plafond_penalite !== "" && form.plafond_penalite !== null && form.plafond_penalite !== undefined
            ? Number(form.plafond_penalite)
            : 5,
        prix_unitaire:
          form.prix_unitaire !== "" && form.prix_unitaire !== null && form.prix_unitaire !== undefined
            ? Number(form.prix_unitaire)
            : null,
        statut: form.statut || "ACTIF",
        fournisseur_id: form.fournisseur_id || "",
        emballage_id: form.emballage_id || "",
      } as any;

      let updated: TableContrat;
      if (editing) {
        const res = await updateContrat(editing.id, payload);
        updated = normalizeContrat(res.updateContrat);
      } else {
        const res = await createContrat(payload);
        updated = normalizeContrat(res.createContrat);
      }

      updated.fournisseur = fournisseurs.find(f => String(f.id) === String(payload.fournisseur_id));
      updated.emballage = emballages.find(em => String(em.id) === String(payload.emballage_id));

      setRows(prev => editing ? prev.map(r => r.id === updated.id ? updated : r) : [updated, ...prev]);
      setIsOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      alert("Erreur de sauvegarde : Vérifiez les champs obligatoires.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[700px]">
      <ContratHeader
        query={query}
        setQuery={setQuery}
        onOpenNew={() => { setEditing(null); setForm(emptyForm); setIsOpen(true); }}
        onOpenOcr={() => setIsOcrOpen(true)}
        stats={stats}
      />

      <div className="flex-1">
        <ContratListView
          rows={paginatedRows}
          onEdit={(c) => { setEditing(c); setForm(c); setIsOpen(true); }}
          onDelete={async (id) => {
            if (confirm("Voulez-vous vraiment supprimer ce contrat ?")) {
              await deleteContrat(id);
              setRows(r => r.filter(x => x.id !== id));
            }
          }}
        />
      </div>

      {/* FOOTER : Pagination en français */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center py-6 bg-white rounded-[2rem] border border-gray-50 shadow-sm animate-in fade-in zoom-in-95 duration-300">
          <LocalPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      <OcrUploadModal<OcrContratMappedData>
        open={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        entityType="contrat"
        onUseData={(data, rawText) => {
          setOcrRawText(rawText || "");
          applyOcrToContratForm(data);
        }}
      />

      <ContratForm
        isOpen={isOpen}
        editing={!!editing}
        form={form}
        setForm={setForm}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        loading={loading}
        fournisseurs={fournisseurs}
        emballages={emballages}
        ocrRawText={ocrRawText}
      />
    </div>
  );
  function normalizeText(value?: string | null) {
    return (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function normalizeDateForInput(value?: string | null) {
    if (!value) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const fr = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (fr) {
      return `${fr[3]}-${fr[2]}-${fr[1]}`;
    }

    return "";
  }

  function findFournisseurIdByName(
    fournisseurs: Array<{ id: string | number; raison_sociale?: string }>,
    target?: string
  ) {
    if (!target) return "";

    const normalizedTarget = normalizeText(target);

    const exact = fournisseurs.find(
      (item) => normalizeText(item.raison_sociale) === normalizedTarget
    );
    if (exact) return String(exact.id);

    const includes = fournisseurs.find((item) =>
      normalizeText(item.raison_sociale).includes(normalizedTarget)
    );
    if (includes) return String(includes.id);

    const reverseIncludes = fournisseurs.find((item) =>
      normalizedTarget.includes(normalizeText(item.raison_sociale))
    );
    if (reverseIncludes) return String(reverseIncludes.id);

    return "";
  }

  function findEmballageIdByName(
    emballages: Array<{ id: string | number; name?: string }>,
    target?: string
  ) {
    if (!target) return "";

    const normalizedTarget = normalizeText(target);

    const exact = emballages.find(
      (item) => normalizeText(item.name) === normalizedTarget
    );
    if (exact) return String(exact.id);

    const includes = emballages.find((item) =>
      normalizeText(item.name).includes(normalizedTarget)
    );
    if (includes) return String(includes.id);

    const reverseIncludes = emballages.find((item) =>
      normalizedTarget.includes(normalizeText(item.name))
    );
    if (reverseIncludes) return String(reverseIncludes.id);

    return "";
  }
  function applyOcrToContratForm(data: OcrContratMappedData) {
    setEditing(null);

    setForm((prev) => {
      const updated = { ...prev };

      if (data.numero_contrat) {
        updated.numero_contrat = data.numero_contrat;
      }

      if (data.objet) {
        updated.objet = data.objet;
      }

      if (data.date_signature) {
        updated.date_signature = normalizeDateForInput(data.date_signature);
      }

      if (data.date_debut) {
        updated.date_debut = normalizeDateForInput(data.date_debut);
      }

      if (data.date_fin) {
        updated.date_fin = normalizeDateForInput(data.date_fin);
      }

      if (data.quantite_contractuelle !== undefined && data.quantite_contractuelle !== null) {
        updated.quantite_contractuelle = Number(data.quantite_contractuelle);
      }

      if (data.montant_ht !== undefined && data.montant_ht !== null) {
        updated.montant_ht = Number(data.montant_ht);
      }

      if (data.montant_tva !== undefined && data.montant_tva !== null) {
        updated.montant_tva = Number(data.montant_tva);
      }

      if (data.prix_unitaire !== undefined && data.prix_unitaire !== null) {
        updated.prix_unitaire = Number(data.prix_unitaire);
      }

      if (data.fournisseur_nom) {
        const fournisseurId = findFournisseurIdByName(fournisseurs, data.fournisseur_nom);
        if (fournisseurId) {
          updated.fournisseur_id = fournisseurId;
        }
      }

      if (data.emballage_nom) {
        const emballageId = findEmballageIdByName(emballages, data.emballage_nom);
        if (emballageId) {
          updated.emballage_id = emballageId;
        }
      }

      return updated;
    });

    setIsOpen(true);
  }
}