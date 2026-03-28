const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT as string;

type RequestOptions = {
  token?: string;
};

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
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

  if (result.errors?.length) {
    throw new Error(result.errors[0].message || "GraphQL error");
  }

  return result.data;
}