"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Product, fetchCart, addToCartApi, updateCartQuantityApi, clearCartApi } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

export interface CartItem extends Product {
  cartQuantity: number;
  deliveryDate?: string;
  customText?: string;
  customPhotoUrl?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    deliveryDate?: string,
    customText?: string,
    customPhotoUrl?: string
  ) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartMrpTotal: number;
  cartCount: number;
  loading: boolean;
  syncingItems: Record<string, boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, token, loading: authLoading } = useAuth();
  const { success } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingItems, setSyncingItems] = useState<Record<string, boolean>>({});
  const syncTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const initCart = async () => {
      if (authLoading) return;

      if (user && token) {
        setLoading(true);
        try {
          // PRODUCTION BEST PRACTICE: Merge guest cart into user cart on login
          const savedCart = localStorage.getItem("pillipot_cart");
          if (savedCart) {
            try {
              const localItems = JSON.parse(savedCart);
              if (Array.isArray(localItems) && localItems.length > 0) {
                // Sync local items to server
                await Promise.all(localItems.map(item => addToCartApi(token, item.id, item.cartQuantity)));
                localStorage.removeItem("pillipot_cart"); // Clear after merge
              }
            } catch (e) {
              console.error("Failed to merge guest cart", e);
            }
          }

          const apiItems = await fetchCart(token);
          const formattedItems = apiItems.map(item => ({
            ...item.product,
            cartQuantity: item.quantity,
            deliveryDate: (item as any).deliveryDate || undefined,
            customText: (item as any).customText || undefined,
            customPhotoUrl: (item as any).customPhotoUrl || undefined,
          }));
          setCart(formattedItems);
        } catch (error) {
          console.error("Failed to fetch cart from server", error);
        } finally {
          setLoading(false);
        }
      } else {
        const savedCart = localStorage.getItem("pillipot_cart");
        if (savedCart) {
          try { setCart(JSON.parse(savedCart)); } catch {}
        } else {
          setCart([]);
        }
      }
    };
    initCart();
  }, [authLoading, user, token]);

  // Save to localStorage ONLY for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem("pillipot_cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  // Sync item to server with debouncing
  const debouncedSync = useCallback((productId: string, quantity: number) => {
    if (!user || !token) return;

    if (syncTimers.current[productId]) {
      clearTimeout(syncTimers.current[productId]);
    }

    setSyncingItems(prev => ({ ...prev, [productId]: true }));

    syncTimers.current[productId] = setTimeout(async () => {
      try {
        await updateCartQuantityApi(token, productId, quantity);
      } catch (error) {
        console.error("Cart sync failed, refreshing from server", error);
        const apiItems = await fetchCart(token);
        setCart(apiItems.map(item => ({ ...item.product, cartQuantity: item.quantity })));
      } finally {
        setSyncingItems(prev => ({ ...prev, [productId]: false }));
        delete syncTimers.current[productId];
      }
    }, 500);
  }, [token, user]);

  const addToCart = useCallback(async (
    product: Product,
    quantity: number = 1,
    deliveryDate?: string,
    customText?: string,
    customPhotoUrl?: string
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.customText === customText && item.customPhotoUrl === customPhotoUrl
      );
      if (existing) {
        const newQty = existing.cartQuantity + quantity;
        debouncedSync(product.id, newQty);
        return prev.map((item) =>
          item === existing ? { ...item, cartQuantity: newQty, deliveryDate: deliveryDate || item.deliveryDate } : item
        );
      }
      if (user && token) addToCartApi(token, product.id, quantity, deliveryDate, customText, customPhotoUrl);
      return [...prev, { ...product, cartQuantity: quantity, deliveryDate, customText, customPhotoUrl }];
    });
  }, [debouncedSync, success, token, user]);

  const removeFromCart = useCallback(async (productId: string) => {
    let exists = false;
    setCart((prev) => {
      exists = prev.some(item => item.id === productId);
      if (!exists) return prev;
      return prev.filter((item) => item.id !== productId);
    });

    // Only sync with server if the item was actually in the global cart
    // prevents 404 when removing "Buy Now" items from URL
    if (exists && user && token) {
      try {
        await updateCartQuantityApi(token, productId, 0);
      } catch (error) {
        console.error("Cart sync failed", error);
      }
    }
  }, [token, user]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const item = cart.find((entry) => entry.id === productId);
    if (!item) return;

    const newQuantity = Math.max(1, Math.min(quantity, item.stockQuantity || 99));
    if (newQuantity === item.cartQuantity) return;

    setCart((prev) =>
      prev.map((entry) =>
        entry.id === productId ? { ...entry, cartQuantity: newQuantity } : entry
      )
    );

    debouncedSync(productId, newQuantity);
  }, [cart, debouncedSync]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (user && token) {
      try {
        await clearCartApi(token);
      } catch (error) {
        console.error("Cart clear failed", error);
      }
    }
  }, [token, user]);

  const cartTotal = useMemo(() => cart.reduce(
    (total, item) => total + item.price * item.cartQuantity,
    0
  ), [cart]);

  const cartMrpTotal = useMemo(() => cart.reduce(
    (total, item) => {
      const orig = Number(item.originalPrice);
      const price = Number(item.price);
      const mrp = orig > price ? orig : price;
      return total + mrp * item.cartQuantity;
    },
    0
  ), [cart]);

  const cartCount = useMemo(() => cart.length, [cart]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartMrpTotal,
      cartCount,
      loading,
      syncingItems,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartMrpTotal,
      cartCount,
      loading,
      syncingItems,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
