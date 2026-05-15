export type PredictionPoint = {
  periode: string;
  quantite_predite: number;
  unite: string;
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
    $entrepot_id: ID!
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