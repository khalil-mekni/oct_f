const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT as string;

type RequestOptions = {
  token?: string;
};

function getStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const possibleKeys = ["token", "access_token", "auth_token", "jwt"];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return undefined;
}

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<T> {
  const token = options.token ?? getStoredToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Network error");
  }

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || "GraphQL error");
  }

  return result.data;
}