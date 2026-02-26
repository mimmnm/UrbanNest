"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Category } from "@/lib/data";

export interface StoreSettings {
  storeName: string;
  logo: string;
  storeEmail: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
  twitter: string;
  currency: string;
  shippingFee: number;
  freeShippingMin: number;
}

interface StoreDataContextType {
  settings: StoreSettings;
  categories: Category[];
}

const defaultSettings: StoreSettings = {
  storeName: "UrbanNest",
  logo: "",
  storeEmail: "",
  phone: "",
  address: "",
  instagram: "",
  facebook: "",
  twitter: "",
  currency: "BDT",
  shippingFee: 120,
  freeShippingMin: 1490,
};

const StoreDataContext = createContext<StoreDataContextType>({
  settings: defaultSettings,
  categories: [],
});

export function StoreDataProvider({
  children,
  settings,
  categories,
}: {
  children: ReactNode;
  settings: StoreSettings;
  categories: Category[];
}) {
  return (
    <StoreDataContext.Provider value={{ settings, categories }}>
      {children}
    </StoreDataContext.Provider>
  );
}

export function useStoreData() {
  return useContext(StoreDataContext);
}
