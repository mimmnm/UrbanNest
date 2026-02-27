"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { Product } from "@/lib/data";

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearAll: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getWishlistKey(email?: string | null): string {
  return email ? `urbannest_wishlist_${email}` : "urbannest_wishlist_guest";
}

function loadWishlistFromStorage(key: string): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email;
  const storageKey = getWishlistKey(userEmail);

  const [items, setItems] = useState<Product[]>([]);

  // Load wishlist when session/key changes
  useEffect(() => {
    if (status === "loading") return;
    const loaded = loadWishlistFromStorage(storageKey);
    setItems(loaded);
  }, [storageKey, status]);

  // Persist wishlist to localStorage on every change
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

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const clearAll = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, toggleItem, isInWishlist, clearAll, totalItems: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
