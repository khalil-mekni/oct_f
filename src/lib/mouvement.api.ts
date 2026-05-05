import { graphqlRequest } from "./graphqlClient";

export type EntrepotOption = {
  id: string;
  nom: string;
  capacite_totale?: number;
  stock_existant?: number;
  capacite_disponible?: number;
};

export type EmballageOption = {
  id: string;
  code: string;
  name: string;
};

export type EntrepotLotRow = {
  id: string;
  quantite: number;
  entrepot: {
    id: string;
    nom: string;
  };
  lot: {
    id: string;
    code_lot: string;
  };
  emballage: {
    id: string;
    code: string;
    name: string;
  };
};

export type MouvementStockRow = {
  id: string;
  code_mouvement: string;
  type_mouvement: "ENT" | "CDD" | "PTE" | "PRD" | "SPL";
  quantite: number;
  date_mouvement: string;
  statut: "BROUILLON" | "VALIDE";
  entrepotSource?: { id: string; nom: string } | null;
  entrepotDestination?: { id: string; nom: string } | null;
  emballage?: { id: string; code: string; name: string } | null;
  lot?: { id: string; code_lot: string } | null;
};

export async function fetchMouvements(page = 1, first = 20) {
  const query = `
    query ($page: Int!, $first: Int!) {
      mouvementStocks(page: $page, first: $first) {
        data {
          id
          code_mouvement
          type_mouvement
          quantite
          date_mouvement
          statut
          entrepotSource {
            id
            nom
          }
          entrepotDestination {
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
        paginatorInfo {
          currentPage
          lastPage
          total
          hasMorePages
        }
      }
    }
  `;

  const res = await graphqlRequest<{
    mouvementStocks: {
      data: MouvementStockRow[];
      paginatorInfo: {
        currentPage: number;
        lastPage: number;
        total: number;
        hasMorePages: boolean;
      };
    };
  }>(query, { page, first });

  return res.mouvementStocks;
}

export async function createMouvementDraft(input: {
  type_mouvement: "ENT" | "CDD" | "PTE" | "PRD" | "SPL";
  emballage_id: string | number;
  lot_id?: string | number | null;
  entrepot_source_id?: string | number | null;
  entrepot_destination_id?: string | number | null;
  quantite: number;
  date_mouvement?: string;
}) {
  const mutation = `
    mutation ($input: CreateMouvementDraftInput!) {
      createMouvementDraft(input: $input) {
        id
        code_mouvement
        type_mouvement
        quantite
        date_mouvement
        statut
      }
    }
  `;

  return graphqlRequest<{ createMouvementDraft: MouvementStockRow }>(mutation, {
    input,
  });
}

export async function validateMouvement(id: string | number) {
  const mutation = `
    mutation ($input: ValidateMouvementInput!) {
      validateMouvement(input: $input) {
        id
        code_mouvement
        statut
      }
    }
  `;

  return graphqlRequest<{ validateMouvement: MouvementStockRow }>(mutation, {
    input: { id: String(id) },
  });
}

export async function fetchAvailableLotsByEntrepot(params: {
  entrepotId: string | number;
  emballageId?: string | number | null;
}) {
  const query = `
    query ($entrepot_id: ID!, $emballage_id: ID) {
      availableLotsByEntrepot(entrepot_id: $entrepot_id, emballage_id: $emballage_id) {
        id
        quantite
        entrepot {
          id
          nom
        }
        lot {
          id
          code_lot
        }
        emballage {
          id
          code
          name
        }
      }
    }
  `;

  return graphqlRequest<{ availableLotsByEntrepot: EntrepotLotRow[] }>(query, {
    entrepot_id: String(params.entrepotId),
    emballage_id:
      params.emballageId !== undefined &&
      params.emballageId !== null &&
      String(params.emballageId).trim() !== ""
        ? String(params.emballageId)
        : null,
  });
}

export async function fetchAvailableEntrepotsByLot(lotId: string | number) {
  const query = `
    query ($lot_id: ID!) {
      availableEntrepotsByLot(lot_id: $lot_id) {
        id
        quantite
        entrepot {
          id
          nom
        }
        lot {
          id
          code_lot
        }
        emballage {
          id
          code
          name
        }
      }
    }
  `;

  return graphqlRequest<{ availableEntrepotsByLot: EntrepotLotRow[] }>(query, {
    lot_id: String(lotId),
  });
}

export async function fetchLotDisponibleDansEntrepot(params: {
  entrepotId: string | number;
  lotId: string | number;
  emballageId: string | number;
}) {
  const query = `
    query ($entrepot_id: ID!, $lot_id: ID!, $emballage_id: ID!) {
      lotDisponibleDansEntrepot(
        entrepot_id: $entrepot_id
        lot_id: $lot_id
        emballage_id: $emballage_id
      )
    }
  `;

  const res = await graphqlRequest<{ lotDisponibleDansEntrepot: number }>(query, {
    entrepot_id: String(params.entrepotId),
    lot_id: String(params.lotId),
    emballage_id: String(params.emballageId),
  });

  return res.lotDisponibleDansEntrepot;
}

export async function deleteMouvementDraft(id: string | number) {
  const mutation = `
    mutation ($id: ID!) {
      deleteMouvementDraft(id: $id)
    }
  `;

  const res = await graphqlRequest<{ deleteMouvementDraft: boolean }>(mutation, {
    id: String(id),
  });

  return res.deleteMouvementDraft;
}