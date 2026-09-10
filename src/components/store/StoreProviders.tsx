"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { StoreDataProvider } from "@/contexts/StoreDataContext";
import type { Promotion } from "@/types";

/**
 * Providers de la tienda.
 *
 * Van acá y **no en el layout raíz**, por dos razones: el panel del ISP no tiene
 * que compartir la sesión del abonado, y el preview de `/admin/marca` renderiza
 * componentes de tienda que si no revelarían precios adentro del panel.
 *
 * `(store)/layout.tsx` es un Server Component y monta esto. Poner `"use client"`
 * en el layout mismo convertiría todo el subárbol en cliente y perdería el
 * renderizado del catálogo en el servidor.
 *
 * Al vivir por encima de las páginas, el provider no se desmonta al navegar: por
 * eso la revelación disparada en `/ingresar` sobrevive el cambio de ruta.
 */
export function StoreProviders({
  tenantId,
  activePromotions,
  children,
}: {
  tenantId: string;
  activePromotions: Promotion[];
  children: ReactNode;
}) {
  return (
    <SessionProvider tenantId={tenantId}>
      <CartProvider tenantId={tenantId}>
        <StoreDataProvider activePromotions={activePromotions}>
          <ToastProvider>{children}</ToastProvider>
        </StoreDataProvider>
      </CartProvider>
    </SessionProvider>
  );
}
