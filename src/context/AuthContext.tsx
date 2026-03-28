"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  register as apiRegister,
} from "@/lib/auth.api";

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

export type LoginInput = {
  email: string;
  password: string;
  remember?: boolean;
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

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "access_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);

  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  return token;
}

function setStoredToken(token: string) {
  if (typeof window === "undefined") return;

  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    const savedToken = getStoredToken();

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setToken(savedToken);

      const currentUser = await apiMe(savedToken);

      if (!currentUser) {
        clearAuth();
      } else {
        setUser(currentUser);
        setToken(savedToken);
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    const onStorage = async (event: StorageEvent) => {
      if (event.key === TOKEN_KEY) {
        await refreshUser();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (input: LoginInput) => {
    const data = await apiLogin({
      email: input.email,
      password: input.password,
    });

    const authToken = data?.token;

    if (!authToken) {
      throw new Error("Token manquant dans la réponse login.");
    }

    setStoredToken(authToken);
    setToken(authToken);

    if (data.user) {
      setUser(data.user);
    } else {
      await refreshUser();
    }
  };

  const register = async (input: RegisterInput) => {
    const data = await apiRegister(input);

    const authToken = data?.token;

    if (!authToken) {
      throw new Error("Token manquant dans la réponse register.");
    }

    setStoredToken(authToken);
    setToken(authToken);

    if (data.user) {
      setUser(data.user);
    } else {
      await refreshUser();
    }
  };

  const logout = async () => {
    try {
      const savedToken = getStoredToken();

      if (savedToken) {
        await apiLogout(savedToken);
      }
    } catch {
      // ignore erreur backend logout
    } finally {
      clearAuth();
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}