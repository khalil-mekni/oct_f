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

function extractGraphQLErrorMessage(errors: any[]): string {
  if (!Array.isArray(errors) || errors.length === 0) {
    return "Erreur GraphQL inconnue.";
  }

  return errors
    .map((error) => {
      if (error?.extensions?.validation) {
        return Object.values(error.extensions.validation).flat().join("\n");
      }

      if (error?.extensions?.debugMessage) {
        return error.extensions.debugMessage;
      }

      if (typeof error?.message === "string" && error.message.trim()) {
        return error.message;
      }

      if (typeof error === "string") {
        return error;
      }

      return "Erreur GraphQL inconnue.";
    })
    .join("\n");
}

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<T> {
  if (!GRAPHQL_ENDPOINT) {
    throw new Error("NEXT_PUBLIC_GRAPHQL_ENDPOINT est manquant.");
  }

  const token = options.token ?? getStoredToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Impossible de contacter le serveur GraphQL.");
  }

  let result: any;

  try {
    result = await response.json();
  } catch {
    throw new Error("Réponse serveur invalide.");
  }

  if (!response.ok) {
    const message =
      result?.errors?.length
        ? extractGraphQLErrorMessage(result.errors)
        : result?.message || `Erreur réseau (${response.status}).`;

    throw new Error(message);
  }

  if (result.errors?.length) {
    console.warn("GraphQL ERROR:", result.errors);

    const message = extractGraphQLErrorMessage(result.errors);

    throw new Error(message);
  }

  if (!result || !("data" in result)) {
    throw new Error("Réponse GraphQL sans champ data.");
  }

  return result.data as T;
}