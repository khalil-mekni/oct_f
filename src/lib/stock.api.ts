import { graphqlRequest } from "./graphqlClient";

export type StockHistoryItem = {
  id: string;
  date_stock: string;
  quantite: number;
  sens: "E" | "S";
  quantite_init?: number | null;
  quantite_finale?: number | null;

  entrepot?: {
    id: string;
    nom: string;
  } | null;

  emballage?: {
    id: string;
    code: string;
    name: string;
  } | null;

  lot?: {
    id: string;
    code_lot: string;
  } | null;
};

type StockHistoryResponse = {
  stockHistory: StockHistoryItem[];
};

export type ListStockHistoryParams = {
  entrepotId?: string | number | null;
  emballageId?: string | number | null;
  lotId?: string | number | null;
  from?: string | null;
  to?: string | null;
};

export async function listStockHistory(params: ListStockHistoryParams = {}) {
  const query = `
    query StockHistory(
      $entrepot_id: ID
      $emballage_id: ID
      $lot_id: ID
      $from: DateTime
      $to: DateTime
    ) {
      stockHistory(
        entrepot_id: $entrepot_id
        emballage_id: $emballage_id
        lot_id: $lot_id
        from: $from
        to: $to
      ) {
        id
        date_stock
        quantite
        sens
        quantite_init
        quantite_finale

        entrepot {
          id
          nom
        }

        emballage {
          id
          code
          name
        }

        lot {
          id
          code_lot
        }
      }
    }
  `;

  const variables: Record<string, string> = {};

  if (params.entrepotId !== undefined && params.entrepotId !== null && String(params.entrepotId).trim() !== "") {
    variables.entrepot_id = String(params.entrepotId);
  }

  if (params.emballageId !== undefined && params.emballageId !== null && String(params.emballageId).trim() !== "") {
    variables.emballage_id = String(params.emballageId);
  }

  if (params.lotId !== undefined && params.lotId !== null && String(params.lotId).trim() !== "") {
    variables.lot_id = String(params.lotId);
  }

  if (params.from && String(params.from).trim() !== "") {
    variables.from = params.from;
  }

  if (params.to && String(params.to).trim() !== "") {
    variables.to = params.to;
  }

  const data = await graphqlRequest<StockHistoryResponse>(query, variables);

  return data.stockHistory;
}