import { notFound } from "next/navigation";

import { ComponentsGallery } from "@/app/dev/componentes/ComponentsGallery";
import { getCatalog } from "@/lib/catalog";
import { getActivePromotions } from "@/lib/promotions";
import { getTenant } from "@/lib/tenant";
import promotionsData from "@/tenants/zonda/promotions.json";
import type { Promotion } from "@/types";

export const metadata = { title: "Componentes" };

/**
 * Galería de desarrollo. No es UI de producto: existe para poder verificar los
 * siete estados de cada componente y, sobre todo, para disparar la revelación
 * del precio con la coreografía real sin tener que construir la tienda entera.
 */
export default function ComponentsPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    notFound();
  }

  const tenant = getTenant();
  const catalog = getCatalog();

  // Se filtra en el servidor, con la fecha del servidor. El cliente no vuelve a
  // filtrar: si lo hiciera, una promo que vence entre el render y la hidratación
  // cambiaría el precio y produciría un mismatch.
  const activePromotions = getActivePromotions(promotionsData as Promotion[], new Date());

  const samples = [
    catalog.find((item) => item.id === "tv-001"),
    catalog.find((item) => item.id === "gam-001"),
    catalog.find((item) => item.id === "ent-001"),
    catalog.find((item) => item.id === "pln-001"),
    catalog.find((item) => item.id === "cel-001"),
    catalog.find((item) => item.id === "sgd-001"),
  ].filter((item) => item !== undefined);

  return (
    <ComponentsGallery tenantId={tenant.id} activePromotions={activePromotions} items={samples} />
  );
}
