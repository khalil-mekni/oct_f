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

  prediction?: {
    quantite_predite: number;
    unite: string;
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