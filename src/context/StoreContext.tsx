"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type VenuePlan = "PACKAGE_1" | "PACKAGE_2" | "PACKAGE_3";

type StoreContextType = {
  plan: VenuePlan | null;
  setPlan: (plan: VenuePlan | null) => void;
  venueId: string | null;
  setVenueId: (id: string | null) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<VenuePlan | null>(null);
  const [venueId, setVenueId] = useState<string | null>(null);

  return (
    <StoreContext.Provider value={{ plan, setPlan, venueId, setVenueId }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
