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

export type ResetPasswordInput = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
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

const VERIFY_EMAIL_MUTATION = `
mutation VerifyEmail($token: String!) {
  verifyEmail(token: $token)
}`;

const RESEND_VERIFICATION_MUTATION = `
mutation ResendVerificationEmail {
  resendVerificationEmail
}`;

const FORGOT_PASSWORD_MUTATION = `
mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}`;

const RESET_PASSWORD_MUTATION = `
mutation ResetPassword(
  $email: String!,
  $token: String!,
  $password: String!,
  $password_confirmation: String!
) {
  resetPassword(
    email: $email,
    token: $token,
    password: $password,
    password_confirmation: $password_confirmation
  )
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
  return graphqlRequest<{ login: AuthPayload }>(LOGIN_MUTATION, {
    email: input.email,
    password: input.password,
  }).then((d) => d.login);
}

export async function register(input: RegisterInput): Promise<AuthPayload> {
  return graphqlRequest<{ register: AuthPayload }>(REGISTER_MUTATION, {
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    password: input.password,
    phone: input.phone,
    birth_date: input.birth_date,
    address: input.address,
  }).then((d) => d.register);
}

export async function verifyEmail(token: string): Promise<string> {
  return graphqlRequest<{ verifyEmail: string }>(VERIFY_EMAIL_MUTATION, {
    token,
  }).then((d) => d.verifyEmail);
}

export async function resendVerificationEmail(
  token?: string
): Promise<string> {
  return graphqlRequest<{ resendVerificationEmail: string }>(
    RESEND_VERIFICATION_MUTATION,
    {},
    { token }
  ).then((d) => d.resendVerificationEmail);
}

export async function forgotPassword(email: string): Promise<string> {
  return graphqlRequest<{ forgotPassword: string }>(FORGOT_PASSWORD_MUTATION, {
    email,
  }).then((d) => d.forgotPassword);
}

export async function resetPassword(
  input: ResetPasswordInput
): Promise<string> {
  return graphqlRequest<{ resetPassword: string }>(RESET_PASSWORD_MUTATION, {
    email: input.email,
    token: input.token,
    password: input.password,
    password_confirmation: input.password_confirmation,
  }).then((d) => d.resetPassword);
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