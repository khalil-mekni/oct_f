"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Pencil,
  ChevronDown,
  ChevronRight,
  MapPin,
  Package2,
  Warehouse,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { Entrepot } from "@/lib/entrepot.api";

type Props = {
  rows: Entrepot[];
  onEdit?: (item: Entrepot) => void;
  highlightedId?: string | number | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value?: number | null) {
  return new Intl.NumberFormat("fr-FR").format(Number(value ?? 0));
}

function getOccupationRate(cap: number, stock: number): number {
  if (!cap || cap === 0) return 0;
  return Math.min((stock / cap) * 100, 100);
}

function normalizeStatus(statut?: string) {
  const v = (statut ?? "").toUpperCase();

  if (v === "ACTIVE") return "ACTIF";
  if (v === "INACTIVE") return "INACTIF";

  return v;
}
// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ statut }: { statut?: string }) {
  const status = normalizeStatus(statut);
  const isActive = status === "ACTIF";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
        isActive
          ? "border-[#00A09D]/20 bg-[#00A09D]/8 text-[#00A09D]"
          : "border-gray-200 bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#00A09D]" : "bg-gray-400"}`}
      />
      {isActive ? "Actif" : "Inactif"}
    </span>
  );
}

function OccupationBar({ rate }: { rate: number }) {
  const color =
    rate >= 90
      ? { bar: "bg-red-500", text: "text-red-500", track: "bg-red-50" }
      : rate >= 70
        ? { bar: "bg-amber-500", text: "text-amber-600", track: "bg-amber-50" }
        : { bar: "bg-[#00A09D]", text: "text-[#00A09D]", track: "bg-[#00A09D]/10" };

  return (
    <div className="w-full min-w-[100px]">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
          Occupation
        </span>
        <span className={`font-mono text-[10px] font-black ${color.text}`}>
          {Math.round(rate)}%
        </span>
      </div>
      <div className={`h-1.5 w-full overflow-hidden rounded-full ${color.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.bar}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function EntrepotsListView({ rows, onEdit, highlightedId }: Props) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggle = (id: string) =>
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );

  useEffect(() => {
    if (!highlightedId) return;
    const id = String(highlightedId);
    setExpandedRows((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, [highlightedId]);

  if (!rows.length) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <Warehouse size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
          Aucun entrepôt trouvé
        </p>
        <p className="text-xs text-gray-300">
          Modifiez votre recherche ou créez un nouvel entrepôt.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        {/* Head */}
        <thead>
          <tr className="border-b border-gray-50 bg-gray-50/50 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:border-gray-800 dark:bg-gray-800/30">
            <th className="w-14 px-5 py-4" />
            <th className="px-5 py-4">Entrepôt</th>
            <th className="px-5 py-4">Adresse</th>
            <th className="px-5 py-4 text-right">Capacité</th>
            <th className="px-5 py-4 text-right">Stock</th>
            <th className="px-5 py-4">Taux</th>
            <th className="px-5 py-4 text-center">Lots</th>
            <th className="px-5 py-4 text-center">Statut</th>
            {onEdit && <th className="px-5 py-4 text-right">Action</th>}
          </tr>
        </thead>

        <tbody>
          {rows.map((item) => {
            const rowId = String(item.id);
            const isExpanded = expandedRows.includes(rowId);
            const lots = item.entrepotLots ?? [];
            const isHighlighted =
              highlightedId != null && String(item.id) === String(highlightedId);
            const rate = getOccupationRate(
              item.capacite_totale ?? 0,
              item.stock_existant ?? 0
            );
            const isCritical = rate >= 90;

            return (
              <Fragment key={item.id}>
                {/* ── Main row ── */}
               <tr
  id={`entrepot-row-${item.id}`}
                  className={`group transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/30 ${
                    isHighlighted ? "bg-amber-50/60 dark:bg-amber-900/10" : ""
                  }`}
                >
                  <td
                    className={`border-b border-gray-50 px-5 py-4 dark:border-gray-800 ${
                      isExpanded ? "border-b-0" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(rowId)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 transition-all hover:border-[#00A09D]/30 hover:bg-[#00A09D]/5 hover:text-[#00A09D] dark:border-gray-700 dark:bg-gray-800"
                      aria-label="Voir les lots"
                    >
                      {isExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>
                  </td>

                  {/* Nom */}
                  <td
                    className={`border-b border-gray-50 px-5 py-4 dark:border-gray-800 ${
                      isExpanded ? "border-b-0" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isHighlighted && (
                        <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700">
                          En évidence
                        </span>
                      )}
                      {isCritical && (
                        <AlertTriangle size={13} className="text-red-400" />
                      )}
                    </div>
                    <div className="text-sm font-black text-[#1C2434] dark:text-white">
                      {item.nom}
                    </div>
                    <div className="mt-0.5 text-[10px] font-bold text-gray-400">
                      #{item.id}
                    </div>
                  </td>

                  {/* Adresse */}
                  <td
                    className={`border-b border-gray-50 px-5 py-4 dark:border-gray-800 ${
                      isExpanded ? "border-b-0" : ""
                    }`}
                  >
                    <div className="flex items-start gap-1.5 text-sm font-medium text-gray-500">
                      <MapPin
                        size={13}
                        className="mt-0.5 shrink-0 text-gray-300"
                      />
                      <span className="line-clamp-2">
                        {item.adresse || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Capacité */}
                  <td
                    className={`border-b border-gray-50 px-5 py-4 text-right dark:border-gray-800 ${
                      isExpanded ? "border-b-0" : ""
                    }`}
                  >
                    <span className="font-mono text-sm font-black text-[#1C2434] dark:text-white">
                      {fmt(item.capacite_totale)}
                    </span>
                  </td>

                  {/* Stock */}
                  <td
                    className={`border-b border-gray-50 px-5 py-4 text-right dark:border-gray-800 ${
                      isExpanded ? "border-b-0" : ""
                    }`}
                  >
                    <span className="font-mono text-sm font-black text-[#00A09D]">
                      {fmt(item.stock_existant)}
                    </span>
                  </td>

                  {/* Taux */}
                  <td
                    className={`border-b border-gray-50 px-5 py-4 dark:border-gray-800 ${
                      isExpanded ? "border-b-0" : ""
                    }`}
                  >
                    <OccupationBar rate={rate} />
                  </td>

                  {/* Lots count */}
                  <td
                    className={`border-b border-gray-50 px-5 py-4 text-center dark:border-gray-800 ${
                      isExpanded ? "border-b-0" : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 rounded-lg border border-[#00A09D]/15 bg-[#00A09D]/8 px-2.5 py-1 text-[10px] font-black text-[#00A09D]">
                      <Package2 size={11} />
                      {lots.length}
                    </span>
                  </td>

                  {/* Statut */}
                  <td
                    className={`border-b border-gray-50 px-5 py-4 text-center dark:border-gray-800 ${
                      isExpanded ? "border-b-0" : ""
                    }`}
                  >
                    <StatusBadge statut={item.statut} />
                  </td>

                  {/* Action */}
                  {onEdit && (
                    <td
                      className={`border-b border-gray-50 px-5 py-4 text-right dark:border-gray-800 ${
                        isExpanded ? "border-b-0" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onEdit?.(item)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm transition-all hover:border-[#00A09D]/20 hover:bg-[#00A09D]/5 hover:text-[#00A09D] dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Pencil size={12} />
                        Modifier
                      </button>
                    </td>
                  )}
                </tr>

                {/* ── Expanded lots ── */}
                {isExpanded && (
                  <tr key={`${item.id}-lots`}>
                    <td
                      colSpan={onEdit ? 9 : 8}
                      className="border-b border-gray-50 bg-gray-50/40 px-5 pb-5 pt-0 dark:border-gray-800 dark:bg-gray-800/20"
                    >
                      {/* Lot sub-table */}
                      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        {/* Sub header */}
                        <div className="flex items-center justify-between border-b border-gray-50 px-5 py-3.5 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <Package2 size={14} className="text-[#00A09D]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1C2434] dark:text-white">
                              Lots dans {item.nom}
                            </span>
                          </div>
                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-black text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {lots.length} lot{lots.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {lots.length === 0 ? (
                          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                            <Package2 size={22} className="text-gray-200" />
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                              Aucun lot dans cet entrepôt
                            </p>
                          </div>
                        ) : (
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-50 bg-gray-50/50 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:border-gray-800 dark:bg-gray-800/30">
                                <th className="px-5 py-3 text-left">Code lot</th>
                                <th className="px-5 py-3 text-left">
                                  Code emballage
                                </th>
                                <th className="px-5 py-3 text-left">
                                  Désignation
                                </th>
                                <th className="px-5 py-3 text-right">
                                  Quantité
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                              {lots.map((lotRow) => (
                                <tr
                                  key={lotRow.id}
                                  className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                                >
                                  <td className="px-5 py-3">
                                    <span className="font-mono text-[11px] font-black text-[#1C2434] dark:text-white">
                                      {lotRow.lot?.code_lot ?? "—"}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    <span className="inline-flex items-center rounded-lg border border-amber-100 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-black text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400">
                                      {lotRow.emballage?.code ?? "—"}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 text-sm font-medium text-gray-500">
                                    {lotRow.emballage?.name ?? "—"}
                                  </td>
                                  <td className="px-5 py-3 text-right">
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-[#00A09D]/15 bg-[#00A09D]/8 px-2.5 py-1 font-mono text-[11px] font-black text-[#00A09D]">
                                      <TrendingUp size={11} />
                                      {fmt(lotRow.quantite)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
             </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}