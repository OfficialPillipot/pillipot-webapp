"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Product, fetchCart, addToCartApi, updateCartQuantityApi, clearCartApi } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface CartItem extends Product {
  cartQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
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
  const { user, token } = useAuth();
  const { success } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingItems, setSyncingItems] = useState<Record<string, boolean>>({});
  const syncTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Load cart: from API if logged in, else localStorage
  useEffect(() => {
    const initCart = async () => {
      if (user && token) {
        setLoading(true);
        try {
          const apiItems = await fetchCart(token);
          const formattedItems = apiItems.map(item => ({
            ...item.product,
            cartQuantity: item.quantity
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
        }
      }
    };
    initCart();
  }, [user, token]);

  // Save to localStorage ONLY for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem("pillipot_cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  // Sync item to server with debouncing
  const debouncedSync = (productId: string, quantity: number) => {
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
  };

  const addToCart = async (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = existing.cartQuantity + 1;
        debouncedSync(product.id, newQty);
        return prev.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: newQty } : item
        );
      }
      if (user && token) addToCartApi(token, product.id, 1);
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    success("Added to cart");
  };

  const removeFromCart = async (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    if (user && token) {
      try {
        await updateCartQuantityApi(token, productId, 0); 
      } catch (error) {
        console.error("Cart sync failed", error);
      }
    }
    success("Removed from cart");
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    const newQuantity = Math.max(1, Math.min(quantity, item.stockQuantity || 99));
    if (newQuantity === item.cartQuantity) return;

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, cartQuantity: newQuantity } : item
      )
    );

    debouncedSync(productId, newQuantity);
  };

  const clearCart = async () => {
    setCart([]);
    if (user && token) {
      try {
        await clearCartApi(token);
      } catch (error) {
        console.error("Cart clear failed", error);
      }
    }
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.cartQuantity,
    0
  );

  const cartMrpTotal = cart.reduce(
    (total, item) => total + (item.originalPrice || item.price) * item.cartQuantity,
    0
  );

  const cartCount = cart.reduce((count, item) => count + item.cartQuantity, 0);

  return (
    <CartContext.Provider
      value={{
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
      }}
    >
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
