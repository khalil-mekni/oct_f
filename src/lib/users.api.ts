import { graphqlRequest } from "@/lib/graphqlClient";
import type { User } from "@/lib/auth.api";

const USER_FIELDS = `
  id
  name
  first_name
  last_name
  email
  email_verified_at
  role
  phone
  birth_date
  address
  is_active
  last_login_at
`;

const USERS_QUERY = `
query Users {
  users {
    ${USER_FIELDS}
  }
}`;

const UPDATE_USER_ROLE_MUTATION = `
mutation UpdateUserRole($id: ID!, $role: String!) {
  updateUserRole(id: $id, role: $role) {
    ${USER_FIELDS}
  }
}`;

const UPDATE_USER_STATUS_MUTATION = `
mutation UpdateUserStatus($id: ID!, $is_active: Boolean!) {
  updateUserStatus(id: $id, is_active: $is_active) {
    ${USER_FIELDS}
  }
}`;

export async function getUsers(token?: string): Promise<User[]> {
  return graphqlRequest<{ users: User[] }>(USERS_QUERY, {}, { token }).then(
    (d) => d.users
  );
}

export async function updateUserRole(
  id: string,
  role: string,
  token?: string
): Promise<User> {
  return graphqlRequest<{ updateUserRole: User }>(
    UPDATE_USER_ROLE_MUTATION,
    { id, role },
    { token }
  ).then((d) => d.updateUserRole);
}

export async function updateUserStatus(
  id: string,
  is_active: boolean,
  token?: string
): Promise<User> {
  return graphqlRequest<{ updateUserStatus: User }>(
    UPDATE_USER_STATUS_MUTATION,
    { id, is_active },
    { token }
  ).then((d) => d.updateUserStatus);
}