import { graphqlRequest } from "@/lib/graphqlClient";

export type User = {
  id: string;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  role: string;
  phone?: string | null;
  birth_date?: string | null;
  address?: string | null;
  is_active?: boolean | null;
  last_login_at?: string | null;
};

export type AuthPayload = {
  access_token: any;
  token: string;
  user: User;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  birth_date?: string;
  address?: string;
};

const USER_FIELDS = `
  id
  name
  first_name
  last_name
  email
  role
  phone
  birth_date
  address
  is_active
  last_login_at
`;

const LOGIN_MUTATION = `
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      ${USER_FIELDS}
    }
  }
}`;

const REGISTER_MUTATION = `
mutation Register(
  $first_name: String!,
  $last_name: String!,
  $email: String!,
  $password: String!,
  $phone: String,
  $birth_date: String,
  $address: String
) {
  register(
    first_name: $first_name,
    last_name: $last_name,
    email: $email,
    password: $password,
    phone: $phone,
    birth_date: $birth_date,
    address: $address
  ) {
    token
    user {
      ${USER_FIELDS}
    }
  }
}`;

const ME_QUERY = `
query Me {
  me {
    ${USER_FIELDS}
  }
}`;

const LOGOUT_MUTATION = `
mutation Logout {
  logout
}`;

export async function login(input: LoginInput): Promise<AuthPayload> {
  return graphqlRequest<{ login: AuthPayload }>(LOGIN_MUTATION, input).then(
    (d) => d.login
  );
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  return graphqlRequest<{ register: AuthPayload }>(
    REGISTER_MUTATION,
    input
  ).then((d) => d.register);
}

export async function me(token?: string): Promise<User | null> {
  return graphqlRequest<{ me: User }>(ME_QUERY, {}, { token })
    .then((d) => d.me)
    .catch(() => null);
}

export async function logout(token?: string): Promise<boolean> {
  return graphqlRequest<{ logout: boolean }>(LOGOUT_MUTATION, {}, { token }).then(
    (d) => d.logout
  );
}