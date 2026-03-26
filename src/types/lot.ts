// Lot.ts
export type Lot = {
  id: string;
  code_lot: string;

  emballage_id?: string | null;

  date_creation?: string;
  date_expiration?: string;
  quantite?: number;
};

// Entrepot.ts
export type Entrepot = {
  id: string;            // Identifiant unique de l'entrepôt
  name?: string;         // Nom de l'entrepôt
  adresse: string;       // Adresse complète
  capacite_max?: number; // Capacité maximale (optionnelle)
};