"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, getMe } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function init() {
      const savedToken = localStorage.getItem("pillipot_token");
      if (savedToken) {
        setToken(savedToken);
        const userData = await getMe(savedToken);
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem("pillipot_token");
          setToken(null);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  const loginAction = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("pillipot_token", newToken);
    router.push("/");
  };

  const logoutAction = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("pillipot_token");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginAction, logout: logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
