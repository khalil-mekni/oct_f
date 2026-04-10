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
export type OcrCommandeMappedData = {
  numero_commande_source?: string;
  date_livraison_prevue?: string;
  quantite?: number;
  fournisseur_nom?: string;
  emballage_nom?: string;
  entrepot_nom?: string;
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