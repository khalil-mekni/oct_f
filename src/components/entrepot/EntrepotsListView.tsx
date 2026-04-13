"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  ChevronDown,
  ChevronRight,
  MapPin,
  Package2,
  Warehouse,
  TrendingUp,
} from "lucide-react";
import type { Entrepot } from "@/lib/entrepot.api";

type Props = {
  rows: Entrepot[];
  onEdit?: (item: Entrepot) => void;
  highlightedId?: string | number | null;
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

// Calcul du taux d'occupation
function getOccupationRate(capaciteTotale: number, stockExistant: number): number {
  if (!capaciteTotale || capaciteTotale === 0) return 0;
  return (stockExistant / capaciteTotale) * 100;
}

// Badge statut amélioré
function StatusBadge({ statut }: { statut?: string }) {
  const normalized = normalizeStatus(statut);
  
  const config = {
    ACTIVE: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "ACTIF",
    },
    INACTIVE: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
      label: "INACTIF",
    },
  };
  
  const style = config[normalized as keyof typeof config] || config.INACTIVE;
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${style.bg} ${style.text} ${style.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

// Barre de progression pour le taux d'occupation
function OccupationBar({ rate }: { rate: number }) {
  let bgColor = "bg-emerald-500";
  let bgLight = "bg-emerald-100";
  
  if (rate >= 90) {
    bgColor = "bg-red-500";
    bgLight = "bg-red-100";
  } else if (rate >= 70) {
    bgColor = "bg-amber-500";
    bgLight = "bg-amber-100";
  }
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-500">Occupation</span>
        <span className={`font-bold ${rate >= 90 ? "text-red-600" : rate >= 70 ? "text-amber-600" : "text-emerald-600"}`}>
          {Math.round(rate)}%
        </span>
      </div>
      <div className={`mt-1 h-1.5 w-full overflow-hidden rounded-full ${bgLight}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${bgColor}`}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function EntrepotsListView({
  rows,
  onEdit,
  highlightedId,
}: Props) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleExpanded = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!highlightedId) return;
    const id = String(highlightedId);
    setExpandedRows((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, [highlightedId]);

  if (!rows.length) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
          <Warehouse size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Aucun entrepôt trouvé</h3>
        <p className="mt-1 text-sm text-slate-500">
          Aucun résultat ne correspond à votre recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-white">
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
                Capacité
              </th>
              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Stock
              </th>
              <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                Occupation
              </th>
              <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                Lots
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
              const rowId = String(item.id);
              const isExpanded = expandedRows.includes(rowId);
              const lots = item.entrepotLots ?? [];
              const isHighlighted =
                highlightedId !== null &&
                highlightedId !== undefined &&
                String(item.id) === String(highlightedId);
              const occupationRate = getOccupationRate(
                item.capacite_totale || 0,
                item.stock_existant || 0
              );

              return (
                <tr
                  key={item.id}
                  id={`entrepot-row-${item.id}`}
                  className={`transition-all duration-200 hover:bg-slate-50/80 ${
                    isHighlighted ? "bg-amber-50/50" : ""
                  }`}
                >
                  <td colSpan={9} className="p-0">
                    <div className={`border-b border-slate-100 ${isHighlighted ? "ring-2 ring-inset ring-amber-300" : ""}`}>
                      <div className="grid grid-cols-9 items-center">
                        {/* Bouton expand */}
                        <div className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(rowId)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#00A09D] hover:bg-[#00A09D]/5 hover:text-[#00A09D] hover:shadow-sm"
                            aria-label="Afficher les lots"
                          >
                            {isExpanded ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronRight size={18} />
                            )}
                          </button>
                        </div>

                        {/* Nom entrepôt */}
                        <div className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {isHighlighted && (
                              <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                                Mis en évidence
                              </span>
                            )}
                            <div className="font-semibold text-slate-900">
                              {item.nom}
                            </div>
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            ID: {item.id}
                          </div>
                        </div>

                        {/* Adresse */}
                        <div className="px-4 py-4">
                          <div className="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin size={15} className="mt-0.5 flex-shrink-0 text-slate-400" />
                            <span className="line-clamp-2">{item.adresse || "-"}</span>
                          </div>
                        </div>

                        {/* Capacité totale */}
                        <div className="px-4 py-4 text-right">
                          <span className="font-semibold text-slate-800">
                            {formatNumber(item.capacite_totale)}
                          </span>
                        </div>

                        {/* Stock existant */}
                        <div className="px-4 py-4 text-right">
                          <span className="font-bold text-emerald-700">
                            {formatNumber(item.stock_existant)}
                          </span>
                        </div>

                        {/* Barre d'occupation */}
                        <div className="px-4 py-4">
                          <OccupationBar rate={occupationRate} />
                        </div>

                        {/* Nombre de lots */}
                        <div className="px-4 py-4 text-center">
                          <span className="inline-flex min-w-[42px] items-center justify-center gap-1 rounded-full bg-[#00A09D]/10 px-3 py-1 text-xs font-bold text-[#00A09D]">
                            <Package2 size={12} />
                            {lots.length}
                          </span>
                        </div>

                        {/* Statut */}
                        <div className="px-4 py-4 text-center">
                          <StatusBadge statut={item.statut} />
                        </div>

                        {/* Actions */}
                        <div className="px-4 py-4 text-right">
                          <button
                            onClick={() => onEdit?.(item)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-[#00A09D]/30 hover:bg-[#00A09D]/5 hover:text-[#00A09D]"
                          >
                            <Pencil size={16} />
                            Modifier
                          </button>
                        </div>
                      </div>

                      {/* Section lots expansible */}
                      {isExpanded && (
                        <div className="bg-gradient-to-b from-slate-50/70 to-white px-4 pb-5 pt-2">
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                  <Package2 size={16} className="text-[#00A09D]" />
                                  Lots présents dans {item.nom}
                                </h3>
                                <p className="text-xs text-slate-500">
                                  Détail du stock existant par lot
                                </p>
                              </div>

                              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#00A09D]/10 to-[#008784]/10 px-3 py-1 text-xs font-bold text-[#00A09D]">
                                <Package2 size={14} />
                                {lots.length} lot(s)
                              </div>
                            </div>

                            {lots.length === 0 ? (
                              <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                  <Package2 size={20} className="text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500">
                                  Aucun lot présent dans cet entrepôt.
                                </p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead className="bg-slate-50">
                                    <tr className="border-b border-slate-200">
                                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Code lot
                                      </th>
                                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Code emballage
                                      </th>
                                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Désignation
                                      </th>
                                      <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Quantité
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {lots.map((lotRow, idx) => (
                                      <tr
                                        key={lotRow.id}
                                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${
                                          idx === lots.length - 1 ? "border-b-0" : ""
                                        }`}
                                      >
                                        <td className="px-5 py-3 font-mono text-sm font-semibold text-slate-900">
                                          {lotRow.lot?.code_lot ?? "-"}
                                        </td>
                                        <td className="px-5 py-3 font-mono text-sm text-slate-700">
                                          {lotRow.emballage?.code ?? "-"}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-600">
                                          {lotRow.emballage?.name ?? "-"}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                          <span className="inline-flex items-center gap-1 rounded-full bg-[#00A09D]/10 px-3 py-1 text-sm font-bold text-[#00A09D]">
                                            <TrendingUp size={12} />
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