"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button/Button";
import { MouvementStock } from "@/types/mouvement";
import { TYPES, formatEmballageLabel } from "./utils";

interface Props {
  items: MouvementStock[];
  loading: boolean;
  onValidate: (id: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export default function MouvementsTable({
  items,
  loading,
  onValidate,
  onDelete,
}: Props) {
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleValidate(id: string) {
    const ok = window.confirm(
      "Confirmer la validation ? Le stock sera modifié maintenant."
    );

    if (!ok) return;

    try {
      setValidatingId(id);
      await onValidate(id);
    } finally {
      setValidatingId(null);
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Voulez-vous vraiment supprimer ce brouillon ?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-[35px] border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-50 bg-white px-8 py-6 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h3 className="text-xl font-[1000] uppercase tracking-tighter text-[#1C2434] dark:text-white">
              Journal des mouvements
              <span className="text-[#00A09D]">.</span>
            </h3>

            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
              {items.length} mouvement(s)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30 text-left text-[10px] font-black uppercase tracking-[0.2em] text-[#1C2434]/60 dark:border-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
                <th className="px-8 py-5">Mouvement</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Statut</th>
                <th className="px-6 py-5">Produit / Lot</th>
                <th className="px-6 py-5">Flux</th>
                <th className="px-6 py-5 text-center">Quantité</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A09D] border-t-transparent" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Synchronisation des données...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-20 text-center text-sm font-bold uppercase tracking-widest text-gray-400"
                  >
                    Aucun mouvement enregistré
                  </td>
                </tr>
              ) : (
                items.map((m) => {
                  const isValidating = validatingId === m.id;
                  const isDeleting = deletingId === m.id;
                  const disabled = isValidating || isDeleting;

                  return (
                    <tr
                      key={m.id}
                      className="group transition-all hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-8 py-6">
                        <div className="font-mono text-sm font-black text-[#1C2434] dark:text-white">
                          {m.code_mouvement ?? `#${m.id}`}
                        </div>

                        {m.bonLivraison && (
                          <div className="mt-1">
                            <Link
                              href={`/bon-livraisons`}
                              className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tight text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                            >
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              {m.bonLivraison.numero_bl}
                            </Link>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            TYPES.find((t) => t.value === m.type_mouvement)
                              ?.color ?? "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {m.type_mouvement}
                        </span>
                      </td>

                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-[1000] uppercase tracking-widest ${
                            m.statut === "VALIDE"
                              ? "border-[#00A09D]/20 bg-[#00A09D]/10 text-[#00A09D]"
                              : "border-amber-100 bg-amber-50 text-amber-600"
                          }`}
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                              m.statut === "VALIDE"
                                ? "bg-[#00A09D]"
                                : "bg-amber-500"
                            }`}
                          />
                          {m.statut}
                        </span>
                      </td>

                      <td className="px-6 py-6">
                        <div className="text-sm font-black leading-tight text-[#1C2434] dark:text-white">
                          {formatEmballageLabel(m.emballage)}
                        </div>

                        <div className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Lot: {m.lot?.code_lot || "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="text-sm font-black leading-tight text-[#1C2434] dark:text-white">
                          <span className="text-gray-400">De:</span>{" "}
                          {m.entrepotSource?.name ||
                            m.entrepotSource?.adresse ||
                            "-"}
                        </div>

                        <div className="mt-1 text-sm font-black leading-tight text-[#1C2434] dark:text-white">
                          <span className="text-gray-400">Vers:</span>{" "}
                          {m.entrepotDestination?.name ||
                            m.entrepotDestination?.adresse ||
                            "-"}
                        </div>
                      </td>

                      <td className="px-6 py-6 text-center">
                        <div className="text-lg font-[1000] tracking-tighter text-[#1C2434] dark:text-white">
                          {m.quantite}
                        </div>
                      </td>

                      <td className="px-6 py-6">
                        <div className="flex justify-end gap-2">
                          {m.statut !== "VALIDE" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={disabled}
                                onClick={() => handleValidate(m.id)}
                                className="rounded-full border-2 border-[#00A09D]/20 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#00A09D] hover:bg-[#00A09D] hover:text-white disabled:opacity-50"
                              >
                                {isValidating ? "Validation..." : "Valider"}
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                disabled={disabled}
                                onClick={() => handleDelete(m.id)}
                                className="rounded-full border-2 border-red-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
                              >
                                {isDeleting ? "Suppression..." : "Supprimer"}
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                              Validé
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}