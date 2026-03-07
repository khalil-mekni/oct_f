// src/lib/mouvement.api.ts

export type MouvementType = "ENT" | "PRD" | "CDD" | "PTE" | "SPL";
export type MouvementStatut = "BROUILLON" | "VALIDE";

export type Entrepot = { id: string; adresse: string };
export type Lot = { id: string; numero_lot: string };

export type Emballage = {
  id: string;
  code?: string | null;
  name?: string | null;
};

export type MouvementStock = {
  id: string;
  code_mouvement?: string | null;
  type_mouvement: MouvementType;
  emballage_id: string;
  lot_id?: string | null;
  entrepot_source_id?: string | null;
  entrepot_destination_id?: string | null;
  quantite: number;
  date_mouvement?: string | null;
  user_id?: string | null;
  statut: MouvementStatut;

  emballage?: Emballage | null;
  lot?: { id: string; numero_lot: string } | null;
  entrepotSource?: { id: string; adresse: string } | null;
  entrepotDestination?: { id: string; adresse: string } | null;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://127.0.0.1:8000/graphql";

async function gql<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await res.json()) as GraphQLResponse<T>;

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(" | "));
  }

  if (!json.data) {
    throw new Error("No data returned from GraphQL");
  }

  return json.data;
}

// ---------------- Queries ----------------

export async function fetchEntrepots(): Promise<Entrepot[]> {
  const q = /* GraphQL */ `
    query {
      entrepots {
        id
        adresse
      }
    }
  `;
  const data = await gql<{ entrepots: Entrepot[] }>(q);
  return data.entrepots;
}

export async function fetchLots(): Promise<Lot[]> {
  const q = /* GraphQL */ `
    query {
      lots {
        id
        numero_lot
      }
    }
  `;
  const data = await gql<{ lots: Lot[] }>(q);
  return data.lots;
}

export async function fetchEmballages(page = 1, first = 100) {
  const q = /* GraphQL */ `
    query Emballages($first: Int!, $page: Int!) {
      emballages(first: $first, page: $page) {
        data {
          id
          code
          name
        }
      }
    }
  `;

  return gql<{
    emballages: {
      data: Emballage[];
    };
  }>(q, { first, page });
}

export async function fetchMouvements(page = 1, first = 10) {
  const q = /* GraphQL */ `
    query ($first: Int!, $page: Int!) {
      mouvementStocks(first: $first, page: $page) {
        data {
          id
          code_mouvement
          type_mouvement
          statut
          emballage_id
          quantite
          date_mouvement
          user_id
          lot_id
          entrepot_source_id
          entrepot_destination_id

          emballage {
            id
            code
            name
          }

          lot {
            id
            numero_lot
          }

          entrepotSource {
            id
            adresse
          }

          entrepotDestination {
            id
            adresse
          }
        }
        paginatorInfo {
          currentPage
          lastPage
          total
        }
      }
    }
  `;

  return gql<{
    mouvementStocks: {
      data: MouvementStock[];
      paginatorInfo: {
        currentPage: number;
        lastPage: number;
        total: number;
      };
    };
  }>(q, { first, page });
}

// ---------------- Mutations ----------------

export async function createMouvementDraft(input: {
  type_mouvement: MouvementType;
  emballage_id: string;
  lot_id?: string | null;
  entrepot_source_id?: string | null;
  entrepot_destination_id?: string | null;
  quantite: number;
  date_mouvement?: string | null;
}) {
  const m = /* GraphQL */ `
    mutation ($input: CreateMouvementDraftInput!) {
      createMouvementDraft(input: $input) {
        id
        code_mouvement
        type_mouvement
        statut
        emballage_id
        quantite
        date_mouvement
        lot_id
        entrepot_source_id
        entrepot_destination_id

        emballage {
          id
          code
          name
        }

        lot {
          id
          numero_lot
        }

        entrepotSource {
          id
          adresse
        }

        entrepotDestination {
          id
          adresse
        }
      }
    }
  `;

  return gql<{ createMouvementDraft: MouvementStock }>(m, { input });
}

export async function validateMouvement(id: string) {
  const m = /* GraphQL */ `
    mutation ($input: ValidateMouvementInput!) {
      validateMouvement(input: $input) {
        id
        statut
      }
    }
  `;

  return gql<{ validateMouvement: MouvementStock }>(m, {
    input: { id },
  });
}

export async function deleteMouvementDraft(id: string) {
  const m = /* GraphQL */ `
    mutation ($id: ID!) {
      deleteMouvementDraft(id: $id)
    }
  `;

  return gql<{ deleteMouvementDraft: boolean }>(m, { id });
}