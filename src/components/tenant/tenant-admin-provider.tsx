"use client";

import { createContext, useContext } from "react";

export interface TenantAdminContextValue {
  slug: string;
  retreatId: number;
  retreatName: string;
  /** The current user's role in this retreat (null until loaded). */
  role: string | null;
  /** owner/manager (or global admin) — may manage team members. */
  isManager: boolean;
}

const TenantAdminContext = createContext<TenantAdminContextValue | null>(null);

export function TenantAdminProvider({
  value,
  children,
}: {
  value: TenantAdminContextValue;
  children: React.ReactNode;
}) {
  return (
    <TenantAdminContext.Provider value={value}>
      {children}
    </TenantAdminContext.Provider>
  );
}

export function useTenantAdmin(): TenantAdminContextValue {
  const value = useContext(TenantAdminContext);
  if (!value) {
    throw new Error("useTenantAdmin must be used within TenantAdminProvider");
  }
  return value;
}
