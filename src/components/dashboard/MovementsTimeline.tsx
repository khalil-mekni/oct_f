"use client";

import { useRecentMovements } from "@/hooks/useRecentMovements";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  AlertTriangle,
  Split,
} from "lucide-react";

function getTypeConfig(type: string) {
  switch (type) {
    case "IN":
      return {
        icon: ArrowDownToLine,
        color:
          "bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400",
        dot: "bg-success-500",
      };
    case "OUT":
      return {
        icon: ArrowUpFromLine,
        color:
          "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
        dot: "bg-orange-500",
      };
    case "TRANSFER":
      return {
        icon: ArrowRightLeft,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
        dot: "bg-blue-500",
      };
    case "LOSS":
      return {
        icon: AlertTriangle,
        color: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
        dot: "bg-red-500",
      };
    default:
      return {
        icon: Split,
        color:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        dot: "bg-gray-500",
      };
  }
}

export default function MovementsTimeline() {
  const { data, isLoading, isError } = useRecentMovements(8);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-400">
        Impossible de charger la timeline des mouvements.
      </div>
    );
  }

  const movements = data ?? [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Timeline des mouvements
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Suivi chronologique des dernières opérations logistiques
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {movements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Aucun mouvement récent.
          </div>
        ) : (
          movements.map((movement, index) => {
            const config = getTypeConfig(movement.type);
            const Icon = config.icon;

            return (
              <div key={movement.id} className="relative pl-10">
                {index !== movements.length - 1 && (
                  <div className="absolute left-[18px] top-10 h-[calc(100%+12px)] w-px bg-gray-200 dark:bg-gray-800" />
                )}

                <div
                  className={`absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full ${config.color}`}
                >
                  <Icon className="size-4" />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
                        >
                          {movement.type}
                        </span>
                        <h4 className="font-medium text-gray-800 dark:text-white/90">
                          {movement.code_mouvement ?? `MVT-${movement.id}`}
                        </h4>
                        <span className="text-xs text-gray-400">
                          {movement.statut ?? "N/A"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {movement.sourceWarehouseName || "—"} →{" "}
                        {movement.destinationWarehouseName || "—"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>Quantité: {movement.quantite}</span>
                        <span>•</span>
                        <span>{movement.emballage_name ?? "Emballage inconnu"}</span>
                        <span>•</span>
                        <span>{movement.lot_code ?? "Sans lot"}</span>
                        <span>•</span>
                        <span>{movement.user_name ?? "Utilisateur inconnu"}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 sm:text-right">
                      {movement.created_at
                        ? new Date(movement.created_at).toLocaleString()
                        : "Date inconnue"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}