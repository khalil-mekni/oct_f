"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Pagination from "@/components/tables/Pagination";
import {
  createFacture,
  deleteFacture,
  normalizeFacture,
  updateFacture,
} from "@/lib/factures.api";
import {
  FactureStatut,
  FacturesPaginatorInfo,
  TableFacture,
  UpdateFactureInput,
} from "@/types/facture";
import { BonLivraisonOption } from "@/types/bon-livraison";
import { usePathname, useRouter } from "next/navigation";
import {
  X,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  ChevronDown,
  Banknote,
  TrendingUp,
  Save,
  Truck,
  Check,
} from "lucide-react";

type Id = string | number;

type FactureForm = {
  numero_facture: string;
  date_facture: string;
  montant_ht: string;
  montant_penalites: string;
  jours_retard_total: string;
  bon_livraison_ids: string[];
  statut: FactureStatut;
};

const emptyForm: FactureForm = {
  numero_facture: "",
  date_facture: new Date().toISOString().split("T")[0],
  montant_ht: "0",
  montant_penalites: "0",
  jours_retard_total: "0",
  bon_livraison_ids: [],
  statut: "BROUILLON",
};

const STATUT_STYLES: Record<string, string> = {
  BROUILLON: "bg-amber-50 text-amber-700 border-amber-200",
  VALIDE: "bg-blue-50 text-blue-700 border-blue-200",
  PAYE: "bg-green-50 text-green-700 border-green-200",
};
const FACTURE_STATUTS: FactureStatut[] = [
  "BROUILLON",
  "VALIDE",
  "PAYE",
];

const formatDate = (v?: string | null) =>
  v ? (v.includes("T") ? v.split("T")[0] : v) : "-";

const formatMoney = (v?: number | null) =>
  v?.toLocaleString("fr-TN", { minimumFractionDigits: 3 }) || "0,000";

export default function FacturesTable({
  data,
  pagination,
  bonsLivraison,
}: {
  data: TableFacture[];
  pagination: FacturesPaginatorInfo;
  bonsLivraison: BonLivraisonOption[];
}) {
  const [rows, setRows] = useState<TableFacture[]>(data);
  const [expandedId, setExpandedId] = useState<Id | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TableFacture | null>(null);
  const [form, setForm] = useState<FactureForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [blSearch, setBlSearch] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<Id | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [blDropdownOpen, setBlDropdownOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRows(data);
  }, [data]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((item) => {
      const matchFacture = item.numero_facture?.toLowerCase().includes(q);
      const matchStatus = item.statut?.toLowerCase().includes(q);
      const matchBL = item.bon_livraisons?.some((bl) =>
        bl.numero_bl?.toLowerCase().includes(q)
      );

      return matchFacture || matchStatus || matchBL;
    });
  }, [rows, query]);

  const selectedBLObjects = useMemo(() => {
    return bonsLivraison.filter((bl) =>
      form.bon_livraison_ids.includes(String(bl.id))
    );
  }, [bonsLivraison, form.bon_livraison_ids]);

  const selectedFournisseurId = useMemo(() => {
    if (selectedBLObjects.length === 0) return null;
    return selectedBLObjects[0]?.commande?.fournisseur_id ?? null;
  }, [selectedBLObjects]);

  useEffect(() => {
    if (editing) return;

    const selectedBLs = bonsLivraison.filter((bl) =>
      form.bon_livraison_ids.includes(String(bl.id))
    );

    if (selectedBLs.length === 0) {
      setForm((prev) => ({
        ...prev,
        montant_ht: "0",
        montant_penalites: "0",
        jours_retard_total: "0",
      }));
      return;
    }

    let totalHT = 0;
    let totalJoursRetard = 0;
    let totalPenalites = 0;

    selectedBLs.forEach((bl) => {
      const quantite = Number(bl.quantite_recue || 0);
      const prixUnitaire = Number(bl.commande?.contrat?.prix_unitaire || 0);
      const tauxPenalite = Number(bl.commande?.contrat?.taux_penalite_retard || 0);
      const dateReception = bl.date_reception ? new Date(bl.date_reception) : null;
      const dateLivraisonPrevue = bl.commande?.date_livraison_prevue
        ? new Date(bl.commande.date_livraison_prevue)
        : null;

      totalHT += quantite * prixUnitaire;

      if (
        dateReception &&
        dateLivraisonPrevue &&
        dateReception > dateLivraisonPrevue
      ) {
        const diffMs =
          dateReception.getTime() - dateLivraisonPrevue.getTime();
        const joursRetard = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        totalJoursRetard += joursRetard;
        totalPenalites += quantite * prixUnitaire * tauxPenalite * joursRetard;
      }
    });

    setForm((prev) => ({
      ...prev,
      montant_ht: totalHT.toFixed(3),
      montant_penalites: totalPenalites.toFixed(3),
      jours_retard_total: String(totalJoursRetard),
    }));
  }, [form.bon_livraison_ids, bonsLivraison, editing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setBlDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBL = useMemo(() => {
    const s = blSearch.trim().toLowerCase();

    return bonsLivraison.filter((bl) => {
      const matchesSearch = bl.numero_bl.toLowerCase().includes(s);

      const sameSupplier =
        !selectedFournisseurId ||
        String(bl.commande?.fournisseur_id) === String(selectedFournisseurId);

      return matchesSearch && sameSupplier;
    });
  }, [bonsLivraison, blSearch, selectedFournisseurId]);

  const toggleBL = (id: string) => {
    setForm((prev) => ({
      ...prev,
      bon_livraison_ids: prev.bon_livraison_ids.includes(id)
        ? prev.bon_livraison_ids.filter((i) => i !== id)
        : [...prev.bon_livraison_ids, id],
    }));
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setBlSearch("");
    setErrorMessage("");
    setIsDrawerOpen(true);
  };

  const openEdit = (item: TableFacture) => {
    setEditing(item);
    setForm({
      numero_facture: item.numero_facture || "",
      date_facture: formatDate(item.date_facture),
      montant_ht: String(item.montant_ht || 0),
      montant_penalites: String(item.montant_penalites || 0),
      jours_retard_total: String(item.jours_retard_total || 0),
      bon_livraison_ids: item.bon_livraisons?.map((bl) => String(bl.id)) || [],
      statut: item.statut,
    });
    setErrorMessage("");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (!submitLoading) {
      setIsDrawerOpen(false);
      setErrorMessage("");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.bon_livraison_ids.length === 0) {
      setErrorMessage("Sélectionnez au moins un Bon de Livraison");
      return;
    }

    setSubmitLoading(true);

    try {
      if (editing) {
        const updatePayload: UpdateFactureInput = {
          numero_facture: form.numero_facture,
          date_facture: form.date_facture,
          montant_ht: Number(form.montant_ht || 0),
          statut: form.statut,
        };

        const res = await updateFacture(editing.id, updatePayload);

        setRows((prev) =>
          prev.map((r) =>
            String(r.id) === String(editing.id)
              ? normalizeFacture(res.updateFacture)
              : r
          )
        );
      } else {
        const payload = {
          numero_facture: form.numero_facture,
          date_facture: form.date_facture,
          bon_livraison_ids: form.bon_livraison_ids,
          statut: form.statut,
          montant_ht: Number(form.montant_ht || 0),
          montant_penalites: Number(form.montant_penalites || 0),
          jours_retard_total: Number(form.jours_retard_total || 0),
        };

        const res = await createFacture(payload as any);
        setRows((prev) => [normalizeFacture(res.createFacture), ...prev]);
      }

      closeDrawer();
    } catch (err: any) {
      setErrorMessage(err.graphQLErrors?.[0]?.message || err.message);
    } finally {
      setSubmitLoading(false);
    }
  }
  async function handleStatusChange(
    factureId: Id,
    statut: FactureStatut
  ) {
    try {
      setStatusLoadingId(factureId);

      const res = await updateFacture(factureId, {
        statut,
      });

      setRows((prev) =>
        prev.map((row) =>
          String(row.id) === String(factureId)
            ? normalizeFacture(res.updateFacture)
            : row
        )
      );
    } catch (err: any) {
      alert(
        err?.graphQLErrors?.[0]?.message ||
        "Erreur lors du changement de statut"
      );
    } finally {
      setStatusLoadingId(null);
    }
  }

  async function handleDelete(id: Id) {
    if (
      !confirm(
        "Voulez-vous vraiment supprimer cette facture ? Cette action est irréversible."
      )
    )
      return;

    try {
      await deleteFacture(id);
      setRows((prev) => prev.filter((r) => String(r.id) !== String(id)));
    } catch (err: any) {
      alert(
        "Erreur lors de la suppression : " +
        (err.message || "Serveur injoignable")
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8 font-sans">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#00A09D]">
            <div className="w-8 h-[2px] bg-[#00A09D]"></div>
            Gestion Facturation
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
            Automatisation des pénalités et groupement de BL{" "}
            <span className="text-[#00A09D]">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filtrer..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none shadow-sm"
            />
          </div>
          <button
            onClick={openNew}
            className="rounded-2xl bg-gray-900 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-indigo-600"
          >
            Nouvelle Facture
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50/30 text-[10px] font-black uppercase text-gray-400">
                <th className="w-10 px-8 py-6"></th>
                <th className="px-6 py-6">Facture</th>
                <th className="px-6 py-6">BL Liés</th>
                <th className="px-6 py-6 text-center">Montant TTC</th>
                <th className="px-6 py-6">Statut</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRows.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                    className="cursor-pointer transition-all hover:bg-gray-50/50"
                  >
                    <td className="px-8 py-5">
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${expandedId === item.id
                          ? "rotate-180 text-indigo-600"
                          : ""
                          }`}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-gray-900">
                        {item.numero_facture}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400">
                        {formatDate(item.date_facture)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex -space-x-2">
                        {item.bon_livraisons?.map((bl) => (
                          <div
                            key={bl.id}
                            title={bl.numero_bl}
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-100 text-[10px] font-black text-indigo-600"
                          >
                            {bl.numero_bl.slice(-2)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="rounded-lg bg-gray-900 px-3 py-1 text-xs font-black text-white">
                        {formatMoney(item.montant_ttc)} DT
                      </span>
                    </td>
                    <td
                      className="px-6 py-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-block">
                        <select
                          value={item.statut}
                          disabled={statusLoadingId === item.id}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as FactureStatut
                            )
                          }
                          className={`
        cursor-pointer
        appearance-none
        rounded-full
        border
        px-4
        py-2
        pr-8
        text-[10px]
        font-black
        uppercase
        outline-none
        transition-all
        ${STATUT_STYLES[item.statut]}
        ${statusLoadingId === item.id ? "opacity-50" : ""}
      `}
                        >
                          {FACTURE_STATUTS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2" />
                      </div>
                    </td>
                    <td
                      className="px-8 py-5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 hover:text-indigo-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>

                  {expandedId === item.id && (
                    <tr className="animate-in fade-in bg-gray-50/50 duration-300">
                      <td colSpan={6} className="p-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          <div className="col-span-2 rounded-[2rem] border bg-white p-6 shadow-sm">
                            <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                              <Truck className="h-3 w-3" /> Détails des réceptions
                            </h4>
                            <div className="space-y-3">
                              {item.bon_livraisons?.map((bl) => (
                                <div
                                  key={bl.id}
                                  className="flex justify-between border-b border-gray-50 pb-2 text-sm"
                                >
                                  <span className="font-bold">
                                    {bl.numero_bl}{" "}
                                    <span className="font-medium text-gray-400">
                                      ({formatDate(bl.date_reception)})
                                    </span>
                                  </span>
                                  <span className="font-black text-indigo-600">
                                    {bl.quantite_recue} Unités
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[2rem] bg-indigo-600 p-6 text-white">
                            <div>
                              <p className="text-[10px] font-bold uppercase opacity-70">
                                Pénalités appliquées
                              </p>
                              <p className="text-2xl font-black">
                                -{formatMoney(item.montant_penalites)} DT
                              </p>
                            </div>
                            <div className="mt-4 border-t border-white/20 pt-4">
                              <p className="text-[10px] font-bold uppercase opacity-70">
                                Net à payer (TTC)
                              </p>
                              <p className="text-2xl font-black">
                                {formatMoney(item.montant_ttc)} DT
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination?.lastPage > 1 && (
        <div className="border-t bg-white py-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.lastPage}
            onPageChange={(newPage) => {
              router.push(`${pathname}?page=${newPage}`);
            }}
          />
        </div>
      )}

      {isDrawerOpen && (
        <div className="fixed inset-0 z-[999] flex justify-end">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            onClick={closeDrawer}
          />
          <div className="relative flex w-full max-w-lg flex-col bg-white p-10 shadow-2xl animate-in slide-in-from-right duration-500">
            <h2 className="mb-8 text-3xl font-black italic uppercase tracking-tighter text-gray-900">
              {editing ? "Modifier Facture" : "Nouvelle Facture Groupée"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="custom-scrollbar flex-1 space-y-6 overflow-y-auto pr-2"
            >
              {errorMessage && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-[10px] font-black uppercase text-red-600">
                  {errorMessage}
                </div>
              )}

              <div className="relative space-y-2" ref={dropdownRef}>
                <label className="text-[10px] font-black uppercase text-gray-400">
                  Sélectionner un ou plusieurs BL
                </label>

                <div className="mb-2 flex flex-wrap gap-2">
                  {form.bon_livraison_ids.map((id) => {
                    const bl = bonsLivraison.find((b) => String(b.id) === id);
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1.5 text-[10px] font-black text-white"
                      >
                        {bl?.numero_bl}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleBL(id)}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="relative">
                  <Truck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 pl-12 text-sm font-bold outline-none transition-all focus:border-indigo-600"
                    placeholder="Ajouter un Bon de livraison..."
                    value={blSearch}
                    onFocus={() => setBlDropdownOpen(true)}
                    onChange={(e) => setBlSearch(e.target.value)}
                  />
                </div>

                {blDropdownOpen && (
                  <div className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl">
                    {filteredBL.length > 0 ? (
                      filteredBL.map((bl) => (
                        <button
                          key={bl.id}
                          type="button"
                          onClick={() => toggleBL(String(bl.id))}
                          className={`mb-1 flex w-full items-center justify-between rounded-xl p-3 text-left text-xs font-black transition-colors ${form.bon_livraison_ids.includes(String(bl.id))
                            ? "bg-indigo-50 text-indigo-600"
                            : "hover:bg-gray-50"
                            }`}
                        >
                          <span>
                            {bl.numero_bl}{" "}
                            <span className="ml-2 text-gray-400">
                              ({bl.quantite_recue} reçus)
                            </span>
                          </span>
                          {form.bon_livraison_ids.includes(String(bl.id)) && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs font-black uppercase text-gray-400">
                        Aucun BL disponible
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">
                  N° Facture Fournisseur
                </label>
                <input
                  className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 text-sm font-bold outline-none focus:border-indigo-600"
                  required
                  value={form.numero_facture}
                  onChange={(e) =>
                    setForm({ ...form, numero_facture: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Date Facture
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-2xl bg-gray-50 p-4 text-sm font-bold"
                    value={form.date_facture}
                    onChange={(e) =>
                      setForm({ ...form, date_facture: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-indigo-600 text-gray-400">
                    Montant HT (Auto)
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
                    <input
                      type="number"
                      step="0.001"
                      className="w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 p-4 pl-12 text-sm font-black text-indigo-700"
                      value={form.montant_ht}
                      onChange={(e) =>
                        setForm({ ...form, montant_ht: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Jours de retard
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 text-sm font-black outline-none focus:border-indigo-600"
                    value={form.jours_retard_total}
                    onChange={(e) =>
                      setForm({ ...form, jours_retard_total: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">
                    Montant pénalités
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 text-sm font-black outline-none focus:border-indigo-600"
                    value={form.montant_penalites}
                    onChange={(e) =>
                      setForm({ ...form, montant_penalites: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[2rem] bg-gray-900 p-8 text-white shadow-xl">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-gray-400">
                      Total Final Estimé (TVA 19%)
                    </p>
                    <p className="text-3xl font-black">
                      {(Math.max(
                        0,
                        Number(form.montant_ht || 0) -
                        Number(form.montant_penalites || 0)
                      ) * 1.19).toFixed(3)}{" "}
                      <span className="text-sm font-medium">DT</span>
                    </p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-indigo-500 opacity-50 transition-transform group-hover:scale-110" />
                </div>
              </div>

              <button
                disabled={submitLoading}
                className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-indigo-600 p-6 text-[10px] font-black tracking-widest text-white shadow-lg transition-all hover:bg-indigo-700"
              >
                {submitLoading ? (
                  "SYNCHRONISATION..."
                ) : (
                  <>
                    <Save className="h-5 w-5" /> VALIDER LA FACTURE GROUPÉE
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}