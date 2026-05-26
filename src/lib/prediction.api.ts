// services/prediction.service.ts
// Appels GraphQL vers Laravel + REST fallback direct

import type {
  PredictionRequest,
  PredictionResponse,
  PredictionResult,
} from "@/types/prediction.types";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ─── Helper GraphQL ────────────────────────────────────────────────────────
async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP error: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ─── Mutation : prédiction unitaire ───────────────────────────────────────
const PREDICT_MUTATION = `
  mutation PredictEmballage($input: PredictionInput!) {
    predictEmballage(input: $input) {
      emballage_id
      entrepot_id
      annee
      mois
      quantite_predite
      unite
    }
  }
`;

export async function predictQuantiteEmballage(
  payload: PredictionRequest
): Promise<PredictionResponse> {
  const data = await graphqlRequest<{
    predictEmballage: PredictionResponse;
  }>(PREDICT_MUTATION, { input: payload });
  return data.predictEmballage;
}

// ─── Mutation : prédiction batch ──────────────────────────────────────────
const PREDICT_BATCH_MUTATION = `
  mutation PredictEmballageBatch($input: PredictionBatchInput!) {
    predictEmballageBatch(input: $input) {
      total
      predictions {
        emballage_id
        entrepot_id
        annee
        mois
        quantite_predite
        unite
      }
    }
  }
`;

export type BatchPredictionInput = {
  annee: number;
  mois: number;
  emballage_id?: number | null;
  entrepot_id?: number | null;
};

export type BatchPredictionResponse = {
  total: number;
  predictions: Array<{
    emballage_id: number;
    entrepot_id: number;
    annee: number;
    mois: number;
    quantite_predite: number;
    unite: string;
  }>;
};

export async function predictEmballageBatch(
  input: BatchPredictionInput
): Promise<BatchPredictionResponse> {
  const data = await graphqlRequest<{
    predictEmballageBatch: BatchPredictionResponse;
  }>(PREDICT_BATCH_MUTATION, { input });
  return data.predictEmballageBatch;
}

// ─── REST fallback (utilisé si GraphQL indisponible) ──────────────────────
export async function predictQuantiteEmballageREST(
  payload: PredictionRequest
): Promise<PredictionResponse> {
  const response = await fetch(`${API_URL}/ai/predict-emballage`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `Erreur prédiction IA (${response.status}): ${errorBody || response.statusText}`
    );
  }
  return response.json();
}

// ─── Constantes métier pour les composants ────────────────────────────────
export const EMBALLAGES = [
  { id: 1, code: "EMB-CAR-001", nom: "Carton ondulé double cannelure", type: "CARTON" },
  { id: 2, code: "EMB-PLA-002", nom: "Palette plastique industrielle",  type: "PALETTE" },
  { id: 3, code: "EMB-SAC-003", nom: "Sac kraft alimentaire 5 kg",      type: "SAC" },
  { id: 4, code: "EMB-BID-004", nom: "Bidon métallique alimentaire 20L",type: "BIDON" },
] as const;

export const ENTREPOTS = [
  { id: 1,  nom: "Entrepôt Sousse",        region: "Sousse" },
  { id: 2,  nom: "Entrepôt Gabes",         region: "Gabes" },
  { id: 3,  nom: "Entrepôt Sfax",          region: "Sfax" },
  { id: 4,  nom: "Entrepôt Goulette",      region: "Tunis" },
  { id: 5,  nom: "Entrepôt Rades",         region: "Tunis" },
  { id: 6,  nom: "Entrepôt Zarzis",        region: "Medenine" },
  { id: 7,  nom: "Entrepôt Medenine",      region: "Medenine" },
  { id: 8,  nom: "Entrepôt Beja",          region: "Beja" },
  { id: 9,  nom: "Entrepôt Kairaouan",      region: "Kairouan" },
  { id: 10, nom: "Entrepôt Kef",           region: "Le Kef" },
  { id: 11, nom: "Entrepôt Kasserine",     region: "Kasserine" },
  { id: 12, nom: "Entrepôt Kebili",        region: "Kebili" },
  { id: 13, nom: "Entrepôt Sidi Bouzid",   region: "Sidi Bouzid" },
  { id: 14, nom: "Entrepôt Makther",       region: "Siliana" },
  { id: 15, nom: "Entrepôt Gafsa",         region: "Gafsa" },
  { id: 16, nom: "Entrepôt Tataouine",     region: "Tataouine" },
  { id: 17, nom: "Entrepôt Touzer",        region: "Tozeur" },
] as const;

export const MOIS_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
] as const;