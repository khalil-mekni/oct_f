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
  type AuthPayload,
  type User,
  type LoginInput as ApiLoginInput,
  type RegisterInput,
} from "@/lib/auth.api";

export type LoginInput = ApiLoginInput & {
  remember?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthPayload>;
  register: (input: RegisterInput) => Promise<AuthPayload>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "access_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  const localToken = localStorage.getItem(TOKEN_KEY);
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  const token = localToken || sessionToken;

  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  return token;
}

function setStoredToken(token: string, remember = true) {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  if (!token || token === "undefined" || token === "null") {
    return;
  }

  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

function clearStoredToken() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
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

  const login = async (input: LoginInput): Promise<AuthPayload> => {
    const data = await apiLogin({
      email: input.email,
      password: input.password,
    });

    const authToken = data?.token;

    if (!authToken) {
      throw new Error("Token manquant dans la réponse login.");
    }

    setStoredToken(authToken, input.remember ?? true);
    setToken(authToken);
    setUser(data.user);

    return data;
  };

  const register = async (input: RegisterInput): Promise<AuthPayload> => {
    const data = await apiRegister(input);

    const authToken = data?.token;

    if (!authToken) {
      throw new Error("Token manquant dans la réponse register.");
    }

    setStoredToken(authToken, true);
    setToken(authToken);
    setUser(data.user);

    return data;
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