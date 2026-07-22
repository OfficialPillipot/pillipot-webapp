"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { User, getMe } from "@/lib/api";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import WelcomePopup from "@/components/auth/WelcomePopup";

const LoginModal = dynamic(() => import("@/components/auth/LoginModal"), { ssr: false });
const ChangePasswordModal = dynamic(() => import("@/components/auth/ChangePasswordModal"), { ssr: false });

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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const savedToken = localStorage.getItem("pillipot_token");
      if (savedToken) {
        const userData = await getMe(savedToken);
        if (userData) {
          setToken(savedToken);
          setUser(userData);
        } else {
          localStorage.removeItem("pillipot_token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!loading && user && !showWelcomePopup && !user.mustChangePassword) {
      const welcomeShown = localStorage.getItem("pillipot_welcome_shown");
      if (!welcomeShown) {
        setShowWelcomePopup(true);
      }
    }
  }, [loading, user, showWelcomePopup]);

  // REMOVED: Auto-redirect to login for guest browsing support
  /*
  useEffect(() => {
    if (!loading && !user && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);
  */

  const loginAction = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("pillipot_token", newToken);
    // Set cookie for middleware (expires in 7 days)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `pillipot_token=${newToken}; path=/; expires=${expires}; SameSite=Lax`;

    const welcomeShown = localStorage.getItem("pillipot_welcome_shown");
    if (!welcomeShown && !newUser.mustChangePassword) {
      setShowWelcomePopup(true);
    }
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    router.refresh(); // Force re-render of server components
  }, [router]);

  const logoutAction = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("pillipot_token");
    // Remove cookie
    document.cookie = "pillipot_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 0);
  }, [router]);

  const closeWelcomePopup = useCallback(() => {
    setShowWelcomePopup(false);
    localStorage.setItem("pillipot_welcome_shown", "true");
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isLoginModalOpen,
      setIsLoginModalOpen,
      isRegisterModalOpen,
      setIsRegisterModalOpen,
      login: loginAction,
      logout: logoutAction,
    }),
    [
      user,
      token,
      loading,
      isLoginModalOpen,
      isRegisterModalOpen,
      loginAction,
      logoutAction,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal />
      <ChangePasswordModal
        open={Boolean(user?.mustChangePassword)}
        token={token}
        onLogout={logoutAction}
        onPasswordChanged={async () => {
          if (!token) return;
          const updated = await getMe(token);
          if (updated) setUser(updated);
        }}
      />
      <WelcomePopup open={showWelcomePopup && !user?.mustChangePassword} onClose={closeWelcomePopup} />
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
