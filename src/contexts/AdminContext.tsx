"use client";

/* eslint-disable react-hooks/set-state-in-effect --
 * Este archivo existe para hacer de puente entre `localStorage` y React, y esa
 * es exactamente la excepción que la regla contempla: leer un sistema externo
 * después del montaje. Hacerlo en el cuerpo del render o en un inicializador
 * perezoso de `useState` produciría un mismatch de hidratación.
 *
 * La alternativa que sugiere la regla, `useSyncExternalStore`, es peor acá: su
 * ciclo de getServerSnapshot y getSnapshot no deja expresar el estado "todavía
 * no sé", que es el que muestra el skeleton y evita el flash de precio.
 * Ver docs/02-arquitectura.md, "Regla de hidratación".
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CatalogOverride } from "@/lib/catalog";
import { clearTenantStorage, storageKeys } from "@/lib/storage-keys";
import type { Theme } from "@/types";

/** Cambios del panel sobre los datos base. Parciales: solo lo que se tocó. */
export interface AdminOverrides {
  catalog: Record<string, CatalogOverride>;
  /** Marca. `logo` es una data URL si pesaba menos de 200 KB. */
  brand: Partial<Theme> & {
    logo?: string;
    tagline?: string;
    heroTitle?: string;
    heroSubtitle?: string;
  };
}

const EMPTY: AdminOverrides = { catalog: {}, brand: {} };

interface AdminContextValue {
  status: "loading" | "ready";
  isAuthenticated: boolean;
  overrides: AdminOverrides;
  signIn: () => void;
  signOut: () => void;
  setCatalogOverride: (itemId: string, patch: CatalogOverride) => void;
  setBrandOverride: (patch: AdminOverrides["brand"]) => void;
  resetBrand: () => void;
  /** Borra todas las claves `nexo:*` del tenant y recarga. */
  resetDemo: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function parseOverrides(raw: string): AdminOverrides {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const candidate = parsed as Partial<AdminOverrides>;
    return {
      catalog: typeof candidate.catalog === "object" && candidate.catalog ? candidate.catalog : {},
      brand: typeof candidate.brand === "object" && candidate.brand ? candidate.brand : {},
    };
  } catch {
    return EMPTY;
  }
}

export function AdminProvider({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  const keys = useMemo(() => storageKeys(tenantId), [tenantId]);

  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [overrides, setOverrides] = useState<AdminOverrides>(EMPTY);

  useEffect(() => {
    setIsAuthenticated(window.localStorage.getItem(keys.adminSession) === "1");
    const raw = window.localStorage.getItem(keys.adminOverrides);
    if (raw) setOverrides(parseOverrides(raw));
    setStatus("ready");
  }, [keys.adminSession, keys.adminOverrides]);

  useEffect(() => {
    if (status !== "ready") return;
    window.localStorage.setItem(keys.adminOverrides, JSON.stringify(overrides));
  }, [overrides, status, keys.adminOverrides]);

  const signIn = useCallback(() => {
    window.localStorage.setItem(keys.adminSession, "1");
    setIsAuthenticated(true);
  }, [keys.adminSession]);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(keys.adminSession);
    setIsAuthenticated(false);
  }, [keys.adminSession]);

  const setCatalogOverride = useCallback((itemId: string, patch: CatalogOverride) => {
    setOverrides((current) => ({
      ...current,
      catalog: { ...current.catalog, [itemId]: { ...current.catalog[itemId], ...patch } },
    }));
  }, []);

  const setBrandOverride = useCallback((patch: AdminOverrides["brand"]) => {
    setOverrides((current) => ({ ...current, brand: { ...current.brand, ...patch } }));
  }, []);

  const resetBrand = useCallback(() => {
    setOverrides((current) => ({ ...current, brand: {} }));
  }, []);

  const resetDemo = useCallback(() => {
    clearTenantStorage(tenantId);
    window.location.reload();
  }, [tenantId]);

  const value = useMemo<AdminContextValue>(
    () => ({
      status,
      isAuthenticated,
      overrides,
      signIn,
      signOut,
      setCatalogOverride,
      setBrandOverride,
      resetBrand,
      resetDemo,
    }),
    [
      status,
      isAuthenticated,
      overrides,
      signIn,
      signOut,
      setCatalogOverride,
      setBrandOverride,
      resetBrand,
      resetDemo,
    ],
  );

  return <AdminContext value={value}>{children}</AdminContext>;
}

export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin tiene que usarse dentro de AdminProvider");
  return value;
}
