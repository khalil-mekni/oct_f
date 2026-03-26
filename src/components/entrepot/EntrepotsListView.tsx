"use client";

import { useState } from "react";
import {
  Pencil,
  ChevronDown,
  ChevronRight,
  MapPin,
  Package2,
  Warehouse,
} from "lucide-react";
import type { Entrepot } from "@/lib/entrepot.api";

type Props = {
  rows: Entrepot[];
  onEdit?: (item: Entrepot) => void;
};

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("fr-FR").format(Number(value ?? 0));
}

function normalizeStatus(statut?: string) {
  const value = (statut ?? "").toUpperCase();

  if (value === "ACTIF") return "ACTIVE";
  if (value === "INACTIF") return "INACTIVE";

  return value;
}

function getStatusClass(statut?: string) {
  switch (normalizeStatus(statut)) {
    case "ACTIVE":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "INACTIVE":
      return "border border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border border-amber-200 bg-amber-50 text-amber-700";
  }
}

export function EntrepotsListView({ rows, onEdit }: Props) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  if (!rows.length) {
    return (
      <div className="flex min-h-[260px] items-center justify-center p-10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Warehouse size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Aucun entrepôt trouvé
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Aucun résultat ne correspond à votre recherche.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="w-14 px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Lots
              </th>

              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Entrepôt
              </th>

              <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                Adresse
              </th>

              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Capacité totale
              </th>

              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Stock existant
              </th>

              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Capacité disponible
              </th>

              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                Nb lots
              </th>

              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                Statut
              </th>

              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item) => {
              const isExpanded = expandedRows.includes(item.id);
              const lots = item.entrepotLots ?? [];

              return (
                <tr key={item.id}>
                  <td colSpan={9} className="p-0">
                    <div className="border-b border-slate-100">
                      <div className="grid grid-cols-9 items-center">
                        <div className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#00A09D] hover:text-[#00A09D]"
                            aria-label="Afficher les lots"
                          >
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </button>
                        </div>

                        <div className="px-4 py-4">
                          <div className="font-semibold text-slate-900">
                            {item.nom}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            ID: {item.id}
                          </div>
                        </div>

                        <div className="px-4 py-4">
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin size={15} className="mt-0.5 text-slate-400" />
                            <span>{item.adresse || "-"}</span>
                          </div>
                        </div>

                        <div className="px-4 py-4 text-right font-semibold text-slate-800">
                          {formatNumber(item.capacite_totale)}
                        </div>

                        <div className="px-4 py-4 text-right font-bold text-emerald-700">
                          {formatNumber(item.stock_existant)}
                        </div>

                        <div className="px-4 py-4 text-right font-semibold text-[#00A09D]">
                          {formatNumber(item.capacite_disponible)}
                        </div>

                        <div className="px-4 py-4 text-center">
                          <span className="inline-flex min-w-[42px] justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {lots.length}
                          </span>
                        </div>

                        <div className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                              item.statut
                            )}`}
                          >
                            {normalizeStatus(item.statut)}
                          </span>
                        </div>

                        <div className="px-4 py-4 text-right">
                          <button
                            onClick={() => onEdit?.(item)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-[#00A09D]/30"
                          >
                            <Pencil size={16} />
                            Modifier
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-slate-50/70 px-4 pb-5 pt-2">
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                  Lots présents dans {item.nom}
                                </h3>
                                <p className="text-xs text-slate-500">
                                  Détail du stock existant par lot
                                </p>
                              </div>

                              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#00A09D]/10 px-3 py-1 text-xs font-bold text-[#00A09D]">
                                <Package2 size={14} />
                                {lots.length} lot(s)
                              </div>
                            </div>

                            {lots.length === 0 ? (
                              <div className="p-5 text-sm text-slate-500">
                                Aucun lot présent dans cet entrepôt.
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead className="bg-slate-50">
                                    <tr className="border-b border-slate-200">
                                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Code lot
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Code emballage
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Désignation
                                      </th>
                                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Quantité
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {lots.map((lotRow) => (
                                      <tr
                                        key={lotRow.id}
                                        className="border-b border-slate-100 last:border-b-0"
                                      >
                                        <td className="px-4 py-3 font-semibold text-slate-900">
                                          {lotRow.lot?.code_lot ?? "-"}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-slate-700">
                                          {lotRow.emballage?.code ?? "-"}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-slate-600">
                                          {lotRow.emballage?.name ?? "-"}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                          <span className="inline-flex rounded-full bg-[#00A09D]/10 px-3 py-1 text-sm font-bold text-[#00A09D]">
                                            {formatNumber(lotRow.quantite)}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}