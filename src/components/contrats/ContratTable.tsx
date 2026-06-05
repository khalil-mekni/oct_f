"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ContratHeader } from "./ContratHeader";
import { ContratListView } from "./ContratListView";
import { ContratForm } from "./ContratForm";
import {
  createContrat,
  updateContrat,
  deleteContrat,
} from "@/lib/contrats.api";
import { listFournisseurs } from "@/lib/fournisseurs.api";
import { listEmballages } from "@/lib/emballages.api";
import { normalizeContrat, TableContrat } from "@/types/contrat";
import { TableEmballages } from "@/types/emballage";
import { TableFournisseur } from "@/types/fournisseur";
import OcrUploadModal from "@/components/common/OcrUploadModal";
import { OcrContratMappedData } from "@/types/ocr";

type NumericInput = number | "";
type ContratStatus = "ACTIF" | "EXPIRE" | "SUSPENDU";

type ContratFormState = {
  id?: string | number;
  numero_contrat: string;
  objet: string;
  date_signature: string;
  date_debut: string;
  date_fin: string;
  quantite_contractuelle: NumericInput;
  quantite_realisee: NumericInput;
  taux_depassement_autorise: NumericInput;
  montant_ht: NumericInput;
  montant_tva: NumericInput;
  taux_cautionnement: NumericInput;
  taux_penalite_retard: NumericInput;
  plafond_penalite: NumericInput;
  prix_unitaire: NumericInput;
  statut: ContratStatus;
  fournisseur_id: string;
  emballage_id: string;
  fournisseur?: TableFournisseur;
  emballage?: TableEmballages;
};

const LocalPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
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

function toNumberOrDefault(value: NumericInput, fallback: number) {
  return value === "" || value === null || value === undefined
    ? fallback
    : Number(value);
}

function toNumberOrNull(value: NumericInput) {
  return value === "" || value === null || value === undefined
    ? null
    : Number(value);
}

function mapContratToForm(c: TableContrat): ContratFormState {
  return {
    id: c.id,
    numero_contrat: String(c.numero_contrat ?? ""),
    objet: String(c.objet ?? ""),
    date_signature: normalizeDateForInput(
      c.date_signature ? String(c.date_signature) : ""
    ),
    date_debut: normalizeDateForInput(c.date_debut ? String(c.date_debut) : ""),
    date_fin: normalizeDateForInput(c.date_fin ? String(c.date_fin) : ""),
    quantite_contractuelle: c.quantite_contractuelle ?? 0,
    quantite_realisee: c.quantite_realisee ?? 0,
    taux_depassement_autorise: c.taux_depassement_autorise ?? 0.2,
    montant_ht: c.montant_ht ?? 0,
    montant_tva: c.montant_tva ?? 0,
    taux_cautionnement: c.taux_cautionnement ?? 3,
    taux_penalite_retard: c.taux_penalite_retard ?? 0.002,
    plafond_penalite: c.plafond_penalite ?? 5,
    prix_unitaire: c.prix_unitaire ?? 0,
    statut: (c.statut ?? "ACTIF") as ContratStatus,
    fournisseur_id: String(c.fournisseur_id ?? ""),
    emballage_id: String(c.emballage_id ?? ""),
    fournisseur: c.fournisseur,
    emballage: c.emballage,
  };
}

function extractFromRawText(rawText: string): Partial<OcrContratMappedData> {
  const text = rawText || "";
  const result: Partial<OcrContratMappedData> = {};

  const contratMatch = text.match(
    /(?:contrat\s*n[°o]?\s*|num[eé]ro contrat\s*:?\s*|r[eé]f[eé]rence\s*:?\s*)([A-Z0-9/_-]+)/i
  );
  if (contratMatch?.[1]) {
    result.numero_contrat = contratMatch[1].trim();
  }

  const dateSignatureMatch = text.match(/date\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (dateSignatureMatch?.[1]) {
    result.date_signature = dateSignatureMatch[1];
  }

  const dateDebutMatch = text.match(
    /date\s+de\s+d[eé]but\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i
  );
  if (dateDebutMatch?.[1]) {
    result.date_debut = dateDebutMatch[1];
  }

  const dateFinMatch = text.match(
    /date\s+de\s+fin\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i
  );
  if (dateFinMatch?.[1]) {
    result.date_fin = dateFinMatch[1];
  }

  const qteMatch = text.match(
    /(?:quantit[eé]\s+totale|quantit[eé]\s+contractuelle|quantit[eé])\s*:?\s*([0-9]+(?:[.,][0-9]+)?)/i
  );
  if (qteMatch?.[1]) {
    result.quantite_contractuelle = Number(
      qteMatch[1].replace(",", ".").trim()
    );
  }

  const puMatch = text.match(
    /prix\s+unitaire\s*:?\s*([0-9]+(?:[.,][0-9]+)?)/i
  );
  if (puMatch?.[1]) {
    result.prix_unitaire = Number(puMatch[1].replace(",", ".").trim());
  }

  const montantHtMatch = text.match(
    /(?:montant\s+ht|total\s+ht|ht)\s*:?\s*([0-9\s]+(?:[.,][0-9]+)?)/i
  );
  if (montantHtMatch?.[1]) {
    result.montant_ht = Number(
      montantHtMatch[1].replace(/\s+/g, "").replace(",", ".")
    );
  }

  const montantTvaMatch = text.match(
    /(?:montant\s+tva|tva)\s*:?\s*([0-9\s]+(?:[.,][0-9]+)?)/i
  );
  if (montantTvaMatch?.[1]) {
    result.montant_tva = Number(
      montantTvaMatch[1].replace(/\s+/g, "").replace(",", ".")
    );
  }

  const fournisseurMatch =
    text.match(/fournisseur\s*:?\s*([^\n]+)/i) ||
    text.match(/fournisseur\s*\n([^\n]+)/i);
  if (fournisseurMatch?.[1]) {
    result.fournisseur_nom = fournisseurMatch[1].trim();
  }

  const emballageMatch =
    text.match(/emballage\s*:?\s*([^\n]+)/i) ||
    text.match(/emballage\s*&\s*([^\n]+)/i);
  if (emballageMatch?.[1]) {
    result.emballage_nom = emballageMatch[1].trim();
  }

  if (/contrat d[' ]achat/i.test(text)) {
    result.objet = "Contrat d'achat";
  }

  return result;
}

export default function ContratTable({ data }: { data?: TableContrat[] }) {
  const [rows, setRows] = useState<TableContrat[]>(
    data ? data.map(normalizeContrat) : []
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<TableContrat | null>(null);
  const [query, setQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [fournisseurs, setFournisseurs] = useState<TableFournisseur[]>([]);
  const [emballages, setEmballages] = useState<TableEmballages[]>([]);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrRawText, setOcrRawText] = useState("");

  const emptyForm: ContratFormState = {
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

  const [form, setForm] = useState<ContratFormState>(emptyForm);

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [resF, resE] = await Promise.all([
          listFournisseurs(),
          listEmballages(1, 100),
        ]);

        setFournisseurs(resF.fournisseurs || []);
        setEmballages(resE.emballages.data || []);
      } catch (err) {
        console.error("Erreur de chargement des références", err);
      }
    };

    loadRefs();
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.toLowerCase();

    return rows.filter((r) => {
      const numeroContrat = String(r.numero_contrat ?? "").toLowerCase();
      const raisonSociale = String(
        r.fournisseur?.raison_sociale ?? ""
      ).toLowerCase();

      return numeroContrat.includes(q) || raisonSociale.includes(q);
    });
  }, [rows, query]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const stats = useMemo(() => {
    const total = rows.length;
    const totalV = rows.reduce(
      (acc, c) => acc + (c.quantite_contractuelle || 0),
      0
    );
    const totalR = rows.reduce(
      (acc, c) => acc + (c.quantite_realisee || 0),
      0
    );

    return {
      total,
      actifs: rows.filter((r) => r.statut === "ACTIF").length,
      realisation: totalV > 0 ? Math.round((totalR / totalV) * 100) : 0,
    };
  }, [rows]);

  function findFournisseurIdByName(
    fournisseursList: Array<{ id: string | number; raison_sociale?: string }>,
    target?: string
  ) {
    if (!target) return "";

    const normalizedTarget = normalizeText(target);

    const exact = fournisseursList.find(
      (item) => normalizeText(item.raison_sociale) === normalizedTarget
    );
    if (exact) return String(exact.id);

    const includes = fournisseursList.find((item) =>
      normalizeText(item.raison_sociale).includes(normalizedTarget)
    );
    if (includes) return String(includes.id);

    const reverseIncludes = fournisseursList.find((item) =>
      normalizedTarget.includes(normalizeText(item.raison_sociale))
    );
    if (reverseIncludes) return String(reverseIncludes.id);

    return "";
  }

  function findEmballageIdByName(
    emballagesList: Array<{ id: string | number; name?: string }>,
    target?: string
  ) {
    if (!target) return "";

    const normalizedTarget = normalizeText(target);

    const exact = emballagesList.find(
      (item) => normalizeText(item.name) === normalizedTarget
    );
    if (exact) return String(exact.id);

    const includes = emballagesList.find((item) =>
      normalizeText(item.name).includes(normalizedTarget)
    );
    if (includes) return String(includes.id);

    const reverseIncludes = emballagesList.find((item) =>
      normalizedTarget.includes(normalizeText(item.name))
    );
    if (reverseIncludes) return String(reverseIncludes.id);

    return "";
  }

  function applyOcrToContratForm(
    data: Partial<OcrContratMappedData>,
    rawText?: string
  ) {
    const fallbackData = rawText ? extractFromRawText(rawText) : {};
    const mergedData: Partial<OcrContratMappedData> = {
      ...fallbackData,
      ...data,
    };

    setEditing(null);
    setErrorMessage("");

    setForm((prev) => {
      const updated: ContratFormState = { ...prev };

      if (
        mergedData.numero_contrat !== undefined &&
        mergedData.numero_contrat !== null
      ) {
        updated.numero_contrat = String(mergedData.numero_contrat);
      }

      if (mergedData.objet !== undefined && mergedData.objet !== null) {
        updated.objet = String(mergedData.objet);
      }

      if (mergedData.date_signature) {
        updated.date_signature = normalizeDateForInput(
          mergedData.date_signature
        );
      }

      if (mergedData.date_debut) {
        updated.date_debut = normalizeDateForInput(mergedData.date_debut);
      }

      if (mergedData.date_fin) {
        updated.date_fin = normalizeDateForInput(mergedData.date_fin);
      }

      if (
        mergedData.quantite_contractuelle !== undefined &&
        mergedData.quantite_contractuelle !== null
      ) {
        updated.quantite_contractuelle = Number(
          mergedData.quantite_contractuelle
        );
      }

      if (mergedData.montant_ht !== undefined && mergedData.montant_ht !== null) {
        updated.montant_ht = Number(mergedData.montant_ht);
      }

      if (
        mergedData.montant_tva !== undefined &&
        mergedData.montant_tva !== null
      ) {
        updated.montant_tva = Number(mergedData.montant_tva);
      }

      if (
        mergedData.prix_unitaire !== undefined &&
        mergedData.prix_unitaire !== null
      ) {
        updated.prix_unitaire = Number(mergedData.prix_unitaire);
      }

      if (mergedData.fournisseur_nom) {
        const fournisseurId = findFournisseurIdByName(
          fournisseurs,
          mergedData.fournisseur_nom
        );
        if (fournisseurId) {
          updated.fournisseur_id = fournisseurId;
        }
      }

      if (mergedData.emballage_nom) {
        const emballageId = findEmballageIdByName(
          emballages,
          mergedData.emballage_nom
        );
        if (emballageId) {
          updated.emballage_id = emballageId;
        }
      }

      return updated;
    });

    setIsOpen(true);
  }

  const handleSubmit = async (
    e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.preventDefault();
    setErrorMessage("");

    const numeroContrat = form.numero_contrat.trim();

    if (
      !numeroContrat ||
      !form.fournisseur_id ||
      !form.emballage_id ||
      !form.objet?.trim() ||
      !form.date_signature ||
      !form.date_debut ||
      !form.date_fin ||
      form.quantite_contractuelle === "" ||
      form.prix_unitaire === "" ||
      form.taux_depassement_autorise === "" ||
      form.taux_cautionnement === "" ||
      form.taux_penalite_retard === "" ||
      form.plafond_penalite === ""
    ) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const qteContractuelle = toNumberOrDefault(form.quantite_contractuelle, 0);
    if (qteContractuelle <= 0) {
      setErrorMessage("La quantité contractuelle doit être supérieure à 0.");
      return;
    }

    const prixUnitaire = toNumberOrNull(form.prix_unitaire);
    if (prixUnitaire !== null && prixUnitaire <= 0) {
      setErrorMessage("Le prix unitaire doit être supérieur à 0.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        numero_contrat: numeroContrat,
        objet: form.objet.trim() || null,
        date_signature: form.date_signature || null,
        date_debut: form.date_debut || "",
        date_fin: form.date_fin || "",
        quantite_contractuelle: toNumberOrDefault(
          form.quantite_contractuelle,
          0
        ),
        quantite_realisee: toNumberOrDefault(form.quantite_realisee, 0),
        taux_depassement_autorise: toNumberOrDefault(
          form.taux_depassement_autorise,
          0.2
        ),
        montant_ht: toNumberOrNull(form.montant_ht),
        montant_tva: toNumberOrDefault(form.montant_tva, 0),
        taux_cautionnement: toNumberOrDefault(form.taux_cautionnement, 3),
        taux_penalite_retard: toNumberOrDefault(
          form.taux_penalite_retard,
          0.002
        ),
        plafond_penalite: toNumberOrDefault(form.plafond_penalite, 5),
        prix_unitaire: toNumberOrNull(form.prix_unitaire),
        statut: form.statut,
        fournisseur_id: form.fournisseur_id,
        emballage_id: form.emballage_id,
      };

      let updated: TableContrat;

      if (editing) {
        const res = await updateContrat(editing.id, payload);
        updated = normalizeContrat(res.updateContrat);
      } else {
        const res = await createContrat(payload);
        updated = normalizeContrat(res.createContrat);
      }

      updated.fournisseur = fournisseurs.find(
        (f) => String(f.id) === String(payload.fournisseur_id)
      );
      updated.emballage = emballages.find(
        (em) => String(em.id) === String(payload.emballage_id)
      );

      setRows((prev) =>
        editing
          ? prev.map((r) => (r.id === updated.id ? updated : r))
          : [updated, ...prev]
      );

      setIsOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setOcrRawText("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Erreur de sauvegarde : vérifiez les champs obligatoires.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 min-h-[700px]">
      <ContratHeader
        query={query}
        setQuery={setQuery}
        onOpenNew={() => {
          setEditing(null);
          setForm(emptyForm);
          setOcrRawText("");
          setIsOpen(true);
        }}
        onOpenOcr={() => setIsOcrOpen(true)}
        stats={stats}
      />

      <div className="flex-1">
        <ContratListView
          rows={paginatedRows}
          onEdit={(c) => {
            setEditing(c);
            setForm(mapContratToForm(c));
            setOcrRawText("");
            setIsOpen(true);
          }}
          onDelete={async (id) => {
            if (confirm("Voulez-vous vraiment supprimer ce contrat ?")) {
              await deleteContrat(id);
              setRows((prev) => prev.filter((x) => x.id !== id));
            }
          }}
        />
      </div>

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
          applyOcrToContratForm(data || {}, rawText || "");
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
        errorMessage={errorMessage}
      />
    </div>
  );
}