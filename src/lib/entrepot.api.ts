import { graphqlRequest } from "./graphqlClient";

export type EntrepotLot = {
  id: string;
  quantite: number;
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

export type Entrepot = {
  id: string;
  nom: string;
  adresse: string;
  capacite_totale?: number | null;
  stock_existant?: number | null;
  capacite_disponible?: number | null;
  statut: string;
  entrepotLots?: EntrepotLot[];
};

export async function fetchEntrepots() {
  const query = `
    query {
      entrepots {
        id
        nom
        adresse
        capacite_totale
        stock_existant
        capacite_disponible
        statut
        entrepotLots {
          id
          quantite
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
    }
  `;

  const res = await graphqlRequest<{ entrepots: Entrepot[] }>(query);
  return res.entrepots;
}

export async function createEntrepot(input: {
  nom: string;
  adresse: string;
  capacite_totale?: number;
  statut?: string;
}) {
  const mutation = `
    mutation ($input: CreateEntrepotInput!) {
      createEntrepot(input: $input) {
        id
        nom
        adresse
        capacite_totale
        stock_existant
        capacite_disponible
        statut
      }
    }
  `;

  return graphqlRequest<{ createEntrepot: Entrepot }>(mutation, { input });
}

export async function updateEntrepot(input: {
  id: string;
  nom?: string;
  adresse?: string;
  capacite_totale?: number | null;
  statut?: string;
}) {
  const mutation = `
    mutation ($input: UpdateEntrepotInput!) {
      updateEntrepot(input: $input) {
        id
        nom
        adresse
        capacite_totale
        stock_existant
        capacite_disponible
        statut
      }
    }
  `;

  return graphqlRequest<{ updateEntrepot: Entrepot }>(mutation, { input });
}

export async function deleteEntrepot(id: string) {
  const mutation = `
    mutation ($id: ID!) {
      deleteEntrepot(id: $id)
    }
  `;

  return graphqlRequest<{ deleteEntrepot: boolean }>(mutation, { id });
}