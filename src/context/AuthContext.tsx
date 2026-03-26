"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout, me as apiMe } from "@/lib/auth.api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type LoginInput = {
  email: string;
  password: string;
  remember?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "token";

function getStoredToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
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

  const refreshUser = async () => {
    const savedToken = getStoredToken();

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await apiMe(savedToken);

      if (!currentUser) {
        clearStoredToken();
        setUser(null);
        setToken(null);
      } else {
        setUser(currentUser);
        setToken(savedToken);
      }
    } catch {
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (input: LoginInput) => {
    const data = await apiLogin({
      email: input.email,
      password: input.password,
    });

    clearStoredToken();

    if (input.remember) {
      localStorage.setItem(TOKEN_KEY, data.token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, data.token);
    }

    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const savedToken = getStoredToken();
      if (savedToken) {
        await apiLogout(savedToken);
      }
    } catch {
    } finally {
      clearStoredToken();
      setUser(null);
      setToken(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      login,
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