"use client";

import React from "react";
import { SWRConfig } from "swr";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import ScrollToTop from "@/components/common/ScrollToTop";
import TrafficTracker from "@/components/common/TrafficTracker";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        // Defaults tuned to reduce duplicate requests during re-renders/nav.
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        keepPreviousData: true,
        dedupingInterval: 4000,
        errorRetryCount: 1,
        shouldRetryOnError: false,
      }}
    >
      <ToastProvider>
        <AuthProvider>
          <TrafficTracker />
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SWRConfig>
  );
}

