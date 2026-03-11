export type Entrepot = {
  id: string;
  nom: string,
  adresse: string;
  capacite_totale?: number | null;
  capacite_disponible?: number | null;
  statut: string;
};