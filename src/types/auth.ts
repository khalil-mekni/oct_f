export type User = {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string | null;
  birth_date?: string | null;
  address?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
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