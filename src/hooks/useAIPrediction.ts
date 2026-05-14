import { useState, useCallback } from "react";
import { listStockHistory } from "@/lib/stock.api";
import { predictQuantiteEmballage } from "@/lib/prediction.api";
import type {
  DashboardFilters,
  PredictionResult,
  ConsommationMensuelle,
  AlerteType,
} from "@/types/prediction.types";

const MOIS_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

function getMoisLabel(mois: number): string {
  return MOIS_LABELS[mois - 1] ?? String(mois);
}

function computeStatutAlerte(
  consommation: number,
  prediction: number
): { statut: PredictionResult["statut"]; alerte: AlerteType | null } {
  const ratio = consommation > 0 ? prediction / consommation : 1;

  if (ratio > 1.3) return { statut: "hausse", alerte: "besoin_eleve" };
  if (ratio > 1.05) return { statut: "hausse", alerte: null };
  if (ratio < 0.5) return { statut: "baisse", alerte: "surstock" };
  if (ratio < 0.95) return { statut: "baisse", alerte: null };

  return { statut: "stable", alerte: null };
}

function computeConsommation(
  stockHistory: Awaited<ReturnType<typeof listStockHistory>>,
  annee: number,
  mois: number,
  emballageId?: string | null,
  entrepotId?: string | null
): number {
  return stockHistory
    .filter((item) => {
      const d = new Date(item.date_stock);

      return (
        item.sens === "S" &&
        d.getFullYear() === annee &&
        d.getMonth() + 1 === mois &&
        (!emballageId || item.emballage?.id === emballageId) &&
        (!entrepotId || item.entrepot?.id === String(entrepotId))
      );
    })
    .reduce((sum, item) => sum + Number(item.quantite || 0), 0);
}

function getDerniereConsommationConnue(
  stockHistory: Awaited<ReturnType<typeof listStockHistory>>,
  annee: number,
  mois: number,
  emballageId?: string | null,
  entrepotId?: string | null
): { consommation: number; anneeBase: number; moisBase: number } {
  for (let i = 0; i < 36; i++) {
    let m = mois - i;
    let y = annee;

    while (m <= 0) {
      m += 12;
      y -= 1;
    }

    const consommation = computeConsommation(
      stockHistory,
      y,
      m,
      emballageId,
      entrepotId
    );

    if (consommation > 0) {
      return {
        consommation,
        anneeBase: y,
        moisBase: m,
      };
    }
  }

  return {
    consommation: 0,
    anneeBase: annee,
    moisBase: mois,
  };
}

function buildHistoriqueMensuel(
  stockHistory: Awaited<ReturnType<typeof listStockHistory>>,
  annee: number,
  mois: number
): ConsommationMensuelle[] {
  const result: ConsommationMensuelle[] = [];

  for (let i = 11; i >= 0; i--) {
    let m = mois - i;
    let y = annee;

    while (m <= 0) {
      m += 12;
      y -= 1;
    }

    const total_sorties = stockHistory
      .filter((item) => {
        const d = new Date(item.date_stock);
        return (
          item.sens === "S" &&
          d.getFullYear() === y &&
          d.getMonth() + 1 === m
        );
      })
      .reduce((sum, item) => sum + Number(item.quantite || 0), 0);

    const total_entrees = stockHistory
      .filter((item) => {
        const d = new Date(item.date_stock);
        return (
          item.sens === "E" &&
          d.getFullYear() === y &&
          d.getMonth() + 1 === m
        );
      })
      .reduce((sum, item) => sum + Number(item.quantite || 0), 0);

    result.push({
      periode: `${y}-${String(m).padStart(2, "0")}`,
      mois_label: `${getMoisLabel(m)} ${y}`,
      total_sorties,
      total_entrees,
    });
  }

  return result;
}

export function useAIPrediction() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [historique, setHistorique] = useState<ConsommationMensuelle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setHistorique([]);
    setError(null);
  }, []);

  const runPrediction = useCallback(async (filters: DashboardFilters) => {
    if (!filters.emballage_id || !filters.entrepot_id) {
      setError("Veuillez sélectionner un emballage et un entrepôt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const stockHistory = await listStockHistory({
        emballageId: filters.emballage_id,
        entrepotId: filters.entrepot_id,
      });

      const consommationDirecte = computeConsommation(
        stockHistory,
        filters.annee,
        filters.mois,
        filters.emballage_id,
        filters.entrepot_id
      );

      const consommationBase =
        consommationDirecte > 0
          ? {
              consommation: consommationDirecte,
              anneeBase: filters.annee,
              moisBase: filters.mois,
            }
          : getDerniereConsommationConnue(
              stockHistory,
              filters.annee,
              filters.mois,
              filters.emballage_id,
              filters.entrepot_id
            );

      const hist = buildHistoriqueMensuel(
        stockHistory,
        filters.annee,
        filters.mois
      );

      setHistorique(hist);

      if (consommationBase.consommation <= 0) {
        setError(
          "Aucune consommation historique trouvée pour cet emballage et cet entrepôt."
        );
        setResult(null);
        return;
      }

      const predResp = await predictQuantiteEmballage({
        annee: filters.annee,
        mois: filters.mois,
        emballage_id: Number(filters.emballage_id),
        entrepot_id: Number(filters.entrepot_id),
consommation_mois: consommationBase.consommation,      });

const quantitePredite = predResp.prediction?.quantite_predite ?? predResp.quantite_predite ?? 0;

const ecart = quantitePredite - consommationBase.consommation;
      const pourcentage_evolution =
        consommationBase.consommation > 0
          ? Math.round((ecart / consommationBase.consommation) * 100)
          : 0;

      const { statut, alerte } = computeStatutAlerte(
        consommationBase.consommation,
        quantitePredite
      );

      const sampleItem = stockHistory.find(
        (item) =>
          item.emballage?.id === filters.emballage_id &&
          item.entrepot?.id === String(filters.entrepot_id)
      );

      setResult({
        emballage_id: Number(filters.emballage_id),
        emballage_name:
          sampleItem?.emballage?.name ?? `Emballage #${filters.emballage_id}`,
        emballage_code: sampleItem?.emballage?.code ?? "",
        entrepot_id: Number(filters.entrepot_id),
        entrepot_nom:
          sampleItem?.entrepot?.nom ?? `Entrepôt #${filters.entrepot_id}`,
        annee: filters.annee,
        mois: filters.mois,
        consommation_actuelle: consommationBase.consommation,
        quantite_predite: quantitePredite,
        ecart,
        pourcentage_evolution,
        statut,
        alerte,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    result,
    historique,
    isLoading,
    error,
    runPrediction,
    reset,
  };
}