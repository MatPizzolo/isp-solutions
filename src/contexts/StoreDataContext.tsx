"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Promotion } from "@/types";

/**
 * Datos del servidor que la tienda necesita en el cliente.
 *
 * Las promociones llegan **ya filtradas por vigencia desde el servidor**, con la
 * fecha del servidor. El cliente no vuelve a filtrarlas: si lo hiciera, una promo
 * que vence entre el render y la hidratación cambiaría el precio y produciría un
 * mismatch. Es la misma razón por la que `computePrice` es pura.
 */
interface StoreDataContextValue {
  activePromotions: Promotion[];
}

const StoreDataContext = createContext<StoreDataContextValue | null>(null);

export function StoreDataProvider({
  activePromotions,
  children,
}: {
  activePromotions: Promotion[];
  children: ReactNode;
}) {
  // El valor no se memoiza porque `activePromotions` ya es estable: viene de un
  // Server Component y solo cambia si cambia la ruta.
  return <StoreDataContext value={{ activePromotions }}>{children}</StoreDataContext>;
}

export function useStoreData(): StoreDataContextValue {
  const value = useContext(StoreDataContext);
  if (!value) throw new Error("useStoreData tiene que usarse dentro de StoreDataProvider");
  return value;
}
