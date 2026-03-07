export type Entrepot = { id: string; adresse: string };
export type Lot = { id: string; numero_lot: string };
export type Emballage = { id: string; code?: string | null; name?: string | null };

export type Stock = {
  id: string;
  entrepot_id: string;
  emballage_id: string;
  lot_id?: string | null;

  date_stock: string;

  quantite_init: number;
  quantite_entree: number;
  quantite_sortie: number;
  quantite_finale: number;

  user_id?: string | null;

  entrepot?: Entrepot | null;
  lot?: Lot | null;
  emballage?: Emballage | null;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql";

async function gql<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await res.json()) as GraphQLResponse<T>;

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(" | "));
  if (!json.data) throw new Error("No data returned from GraphQL");

  return json.data;
}

/** ---------------- Stocks ---------------- */

export async function fetchStocks(page = 1, first = 10) {
  const query = /* GraphQL */ `
    query Stocks($first: Int!, $page: Int!) {
      stocks(first: $first, page: $page) {
        paginatorInfo {
          currentPage
          lastPage
          total
          perPage
          hasMorePages
        }
        data {
          id
          entrepot_id
          emballage_id
          lot_id
          date_stock
          quantite_init
          quantite_entree
          quantite_sortie
          quantite_finale
          user_id

          entrepot { id adresse }
          lot { id numero_lot }
          emballage { id code name }
        }
      }
    }
  `;

  return gql<{
    stocks: {
      paginatorInfo: {
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
        hasMorePages: boolean;
      };
      data: Stock[];
    };
  }>(query, { first, page });
}

export async function createStock(input: {
  entrepot_id: string;
  emballage_id: string;
  lot_id?: string | null;
  date_stock: string; // "YYYY-MM-DD HH:mm:ss" ou ISO, selon Lighthouse
  quantite_init?: number;
  quantite_entree?: number;
  quantite_sortie?: number;
  user_id?: string | null;
}) {
  const mutation = /* GraphQL */ `
    mutation CreateStock($input: CreateStockInput!) {
      createStock(input: $input) {
        id
        entrepot_id
        emballage_id
        lot_id
        date_stock
        quantite_init
        quantite_entree
        quantite_sortie
        quantite_finale
        user_id
        entrepot { id adresse }
        lot { id numero_lot }
        emballage { id code name }
      }
    }
  `;
  return gql<{ createStock: Stock }>(mutation, { input });
}

export async function updateStock(input: {
  id: string;
  lot_id?: string | null;
  date_stock?: string;
  quantite_init?: number;
  quantite_entree?: number;
  quantite_sortie?: number;
  user_id?: string | null;
}) {
  const mutation = /* GraphQL */ `
    mutation UpdateStock($input: UpdateStockInput!) {
      updateStock(input: $input) {
        id
        entrepot_id
        emballage_id
        lot_id
        date_stock
        quantite_init
        quantite_entree
        quantite_sortie
        quantite_finale
        user_id
        entrepot { id adresse }
        lot { id numero_lot }
        emballage { id code name }
      }
    }
  `;
  return gql<{ updateStock: Stock }>(mutation, { input });
}

export async function deleteStock(id: string) {
  const mutation = /* GraphQL */ `
    mutation DeleteStock($id: ID!) {
      deleteStock(id: $id)
    }
  `;
  return gql<{ deleteStock: boolean }>(mutation, { id });
}

/** ---------------- Lookups (Entrepots / Lots / Emballages) ---------------- */

export async function fetchEntrepots() {
  const query = /* GraphQL */ `
    query {
      entrepots {
        id
        adresse
      }
    }
  `;
  return gql<{ entrepots: Entrepot[] }>(query);
}

export async function fetchLots() {
  const query = /* GraphQL */ `
    query {
      lots {
        id
        numero_lot
      }
    }
  `;
  return gql<{ lots: Lot[] }>(query);
}




export async function createStockWithAutoLot(input: {
  entrepot_id: string;
  emballage_id: string;
  date_stock: string;
  quantite_init?: number;
  quantite_entree?: number;
  quantite_sortie?: number;
  user_id?: string | null;
}) {
  const mutation = /* GraphQL */ `
    mutation CreateStockWithAutoLot($input: CreateStockWithAutoLotInput!) {
      createStockWithAutoLot(input: $input) {
        id
        entrepot_id
        emballage_id
        lot_id
        date_stock
        quantite_init
        quantite_entree
        quantite_sortie
        quantite_finale
        lot { id numero_lot }
        entrepot { id adresse }
        emballage { id code name }
      }
    }
  `;
  return gql<{ createStockWithAutoLot: Stock }>(mutation, { input });
}

/**
 * Emballages : si ton backend a @paginate (comme tu as montré),
 * on récupère page 1, first 100.
 * Si chez toi c’est une liste simple, dis-moi et je l’adapte.
 */
export async function fetchEmballages(page = 1, first = 100) {
  const query = /* GraphQL */ `
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
  return gql<{ emballages: { data: Emballage[] } }>(query, { first, page });
}