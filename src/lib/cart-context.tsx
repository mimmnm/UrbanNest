"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Product, CartItem } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartKey(email?: string | null): string {
  return email ? `urbannest_cart_${email}` : "urbannest_cart_guest";
}

function loadCartFromStorage(key: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;
  const storageKey = getCartKey(userEmail);
  const prevKeyRef = useRef(storageKey);

  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart when session/key changes
  useEffect(() => {
    if (status === "loading") return;
    const loaded = loadCartFromStorage(storageKey);
    setItems(loaded);
    prevKeyRef.current = storageKey;
  }, [storageKey, status]);

  // Persist cart to localStorage on every change (skip during initial load)
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (status === "loading") return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // localStorage full or unavailable
    }
  }, [items, storageKey, status]);

  // Reset initial load flag when key changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [storageKey]);

  const addItem = useCallback(
    (product: Product, quantity = 1, color?: string, size?: string) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity, selectedColor: color, selectedSize: size }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
