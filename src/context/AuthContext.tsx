"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, getMe } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const LoginModal = dynamic(() => import("@/components/auth/LoginModal"), { ssr: false });

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
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

  // REMOVED: Auto-redirect to login for guest browsing support
  /*
  useEffect(() => {
    if (!loading && !user && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);
  */

  const loginAction = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("pillipot_token", newToken);
    // Set cookie for middleware (expires in 7 days)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `pillipot_token=${newToken}; path=/; expires=${expires}; SameSite=Lax`;
    
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    router.refresh(); // Force re-render of server components
  };

  const logoutAction = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("pillipot_token");
    // Remove cookie
    document.cookie = "pillipot_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh(); // Ensure state is cleared globally
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      isLoginModalOpen,
      setIsLoginModalOpen,
      isRegisterModalOpen,
      setIsRegisterModalOpen,
      login: loginAction, 
      logout: logoutAction 
    }}>
      {children}
      <LoginModal />
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
