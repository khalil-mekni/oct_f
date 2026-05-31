export type OcrEntityType =
    | "generic"
    | "commande"
    | "bon_livraison"
    | "facture"
    | "contrat";

export type OcrAnalyzeResponse<T = Record<string, unknown>> = {
    success: boolean;
    entity_type: OcrEntityType;
    file_name?: string;
    raw_text: string;
    mapped_data: Partial<T>;
};

export type OcrContratMappedData = {
  numero_contrat?: string;
  objet?: string;
  date_signature?: string;
  date_debut?: string;
  date_fin?: string;
  quantite_contractuelle?: number;
  montant_ht?: number;
  montant_tva?: number;
  prix_unitaire?: number;
  fournisseur_nom?: string;
  emballage_nom?: string;
};
export type OcrBonLivraisonMappedData = {
  numero_bl?: string;

  date_livraison?: string;

  quantite_recue?: number;

  fournisseur_nom?: string;

  emballage_nom?: string;

  commande_numero?: string;
};
