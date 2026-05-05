export type StockHistoryItem = {
  id: string;
  date_stock: string;
  quantite: number;
  sens: "E" | "S";
  quantite_init?: number | null;
  quantite_finale?: number | null;
  entrepot?: { id: string; nom: string } | null;
  emballage?: { id: string; code: string; name?: string } | null;
  lot?: { id: string; code_lot: string } | null;
  user?: { id: string; name: string } | null;
};

export type StockFilters = {
  entrepotId: string;
  emballageId: string;
  lotId: string;
  from: string;
  to: string;
};