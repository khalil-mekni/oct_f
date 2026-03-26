export type Entrepot = {
  id: string;
  adresse: string;
  name?: string;
  capacite_totale?: number | null;
  capacite_disponible?: number | null;
  statut: string;
};