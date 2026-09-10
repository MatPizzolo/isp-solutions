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

import { storageKeys } from "@/lib/storage-keys";

/** Lo único que se persiste. **Nunca precios**: se recalculan en cada render. */
export interface CartLineRef {
  itemId: string;
  quantity: number;
}

interface CartContextValue {
  status: "loading" | "ready";
  lines: CartLineRef[];
  count: number;
  isOpen: boolean;
  add: (itemId: string, quantity?: number, maxQuantity?: number) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
  has: (itemId: string) => boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function parseLines(raw: string): CartLineRef[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is CartLineRef => {
      if (typeof entry !== "object" || entry === null) return false;
      const candidate = entry as Partial<CartLineRef>;
      return typeof candidate.itemId === "string" && typeof candidate.quantity === "number";
    });
  } catch {
    return [];
  }
}

export function CartProvider({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  const keys = useMemo(() => storageKeys(tenantId), [tenantId]);

  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [lines, setLines] = useState<CartLineRef[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(keys.cart);
    setLines(raw ? parseLines(raw) : []);
    setStatus("ready");
  }, [keys.cart]);

  // Solo se persiste después de la hidratación, para no pisar el carrito
  // guardado con el array vacío del primer render.
  useEffect(() => {
    if (status !== "ready") return;
    window.localStorage.setItem(keys.cart, JSON.stringify(lines));
  }, [lines, status, keys.cart]);

  const add = useCallback((itemId: string, quantity = 1, maxQuantity?: number) => {
    setLines((current) => {
      const existing = current.find((line) => line.itemId === itemId);
      const desired = (existing?.quantity ?? 0) + quantity;
      const capped = maxQuantity !== undefined ? Math.min(desired, maxQuantity) : desired;
      if (!existing) return [...current, { itemId, quantity: capped }];
      return current.map((line) => (line.itemId === itemId ? { ...line, quantity: capped } : line));
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.itemId !== itemId)
        : current.map((line) => (line.itemId === itemId ? { ...line, quantity } : line)),
    );
  }, []);

  const remove = useCallback((itemId: string) => {
    setLines((current) => current.filter((line) => line.itemId !== itemId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      status,
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      isOpen,
      add,
      setQuantity,
      remove,
      clear,
      has: (itemId: string) => lines.some((line) => line.itemId === itemId),
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [status, lines, isOpen, add, setQuantity, remove, clear],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart tiene que usarse dentro de CartProvider");
  return value;
}
