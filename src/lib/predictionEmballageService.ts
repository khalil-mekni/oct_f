// src/lib/predictionEmballageService.ts

export type RecommandationAction = {
  date_suggeree: string;
  date_livraison?: string;
  quantite: number;
  description: string;
};

export type PredictionPoint = {
  periode: string;
  quantite_predite: number;
  unite: string;
  prix_unitaire: number;
  cout_predite: number;
  stock_actuel: number;
  stock_securite: number;
  stock_restant_prevu: number;
  quantite_recommandee: number;
  cout_recommande: number;
  alerte_rupture: boolean;
  
  // Nouveaux champs
  consommation_restante_mois: number;
  receptions_futures_mois: number;
  recommandations_plan: RecommandationAction[];
};

export type PredictionParams = {
  emballageId: number;
  entrepotId: number;
  granularity: "day" | "month" | "year";
  periods: number;
  startDate: string;
};

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://127.0.0.1:8000/graphql";

export async function getPredictionEmballage(
  params: PredictionParams
): Promise<PredictionPoint[]> {
  const query = `
    query PredictionEmballage(
      $emballage_id: ID!
      $entrepot_id: ID
      $granularity: String
      $periods: Int
      $start_date: String
    ) {
      predictionEmballage(
        emballage_id: $emballage_id
        entrepot_id: $entrepot_id
        granularity: $granularity
        periods: $periods
        start_date: $start_date
      ) {
        periode
        quantite_predite
        unite
        prix_unitaire
        cout_predite
        stock_actuel
        stock_securite
        stock_restant_prevu
        quantite_recommandee
        cout_recommande
        alerte_rupture
        consommation_restante_mois
        receptions_futures_mois
        recommandations_plan {
          date_suggeree
          date_livraison
          quantite
          description
        }
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        emballage_id: params.emballageId,
        entrepot_id: params.entrepotId,
        granularity: params.granularity,
        periods: params.periods,
        start_date: params.startDate,
      },
    }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message || "Erreur GraphQL");
  }

  return json.data.predictionEmballage;
}

export type AlerteType = "besoin_eleve" | "risque_rupture" | "surstock";

export type DashboardFilters = {
  annee: number;
  mois: number;
  emballage_id: string | null;
  entrepot_id: string | null;
};

export type PredictionRequest = {
  annee: number;
  mois: number;
  emballage_id: number;
  entrepot_id: number;
  consommation_mois: number;
};

export type PredictionResponse = {
  quantite_predite?: number;
  unite?: string;
  prix_unitaire?: number;
  cout_predite?: number;

  prediction?: {
    quantite_predite: number;
    unite: string;
    prix_unitaire?: number;
    cout_predite?: number;
  };

  consommation_actuelle?: number;
};

export type PredictionResult = {
  emballage_id: number;
  emballage_name: string;
  emballage_code: string;
  entrepot_id: number;
  entrepot_nom: string;
  annee: number;
  mois: number;
  consommation_actuelle: number;
  quantite_predite: number;
  prix_unitaire?: number;
  cout_predite?: number;
  ecart: number;
  pourcentage_evolution: number;
  statut: "hausse" | "stable" | "baisse";
  alerte: AlerteType | null;
};

export type ConsommationMensuelle = {
  periode: string;
  mois_label: string;
  total_sorties: number;
  total_entrees: number;
};