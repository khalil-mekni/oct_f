export type BonLivraisonStatut = "EN_ATTENTE" | "VALIDE";

export type BonLivraison = {
  id: string;
  numero_bl: string;
  date_reception: string;
  statut: BonLivraisonStatut;
  emballage_id: string | number;
  quantite_recue: number;
  numero_commande: string;
  commande_id: string | number;
  entrepot_id: string | number;
  receptionne_par?: string | number | null;
  document_bl?: string | null;
  date_validation?: string | null;
  validated_by?: string | number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TableBonLivraison = Omit<BonLivraison, "statut"> & {
  id: string | number;
  statut: BonLivraisonStatut;
};
export type BonLivraisonOption = {
  id: string | number;
  numero_bl: string;
  quantite_recue: number;
  date_reception?: string | null;
  numero_commande?: string;

  commande?: {
    id: string | number;
    numero_commande: string;
    date_livraison_prevue?: string | null;
    fournisseur_id?: string | number | null;
    contrat?: {
      id: string | number;
      prix_unitaire?: number | null;
      taux_penalite_retard?: number | null;
    } | null;
  } | null;
};
export type CreateBonLivraisonInput = {
  date_reception: string;
  emballage_id: string | number;
  quantite_recue: number;
  numero_commande: string;
  entrepot_id: string | number;
};

export type UpdateBonLivraisonInput = {
  date_reception?: string;
  emballage_id?: string | number;
  quantite_recue?: number;
  numero_commande?: string;
  entrepot_id?: string | number;
  statut?: BonLivraisonStatut;
};

export type BonLivraisonsPaginatorInfo = {
  count: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type EmballageOption = {
  id: string | number;
  label: string;
};

export type CommandeOption = {
  id: string | number;
  numero_commande: string;
  quantite: number;
  emballage_id?: string | number;
  entrepot_id?: string | number;
};

export type EntrepotOption = {
  id: string | number;
  label: string;
};