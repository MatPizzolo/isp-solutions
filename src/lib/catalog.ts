import catalogData from "@/data/catalog.json";
import type {
  CatalogItem,
  CategoryId,
  PhysicalProduct,
  ServiceItem,
  Subscriber,
  Tenant,
} from "@/types";

const CATALOG = catalogData as CatalogItem[];

export interface Category {
  id: CategoryId;
  name: string;
  /** Aparece en `/tienda/[category]`. */
  description: string;
  kind: CatalogItem["kind"];
}

/**
 * Categorías de la plataforma, no del tenant: el catálogo es compartido. Las de
 * servicio van primero porque son las que abren la tienda (ADR-025).
 */
export const CATEGORIES: Category[] = [
  {
    id: "tv",
    name: "TV y streaming",
    description: "Series, películas, deportes y contenido infantil, en la factura de siempre.",
    kind: "service",
  },
  {
    id: "celular",
    name: "Celular",
    description: "Líneas, datos y roaming, sin abrir una cuenta en otra compañía.",
    kind: "service",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Juegos en la nube y mejoras de red pensadas para jugar en serio.",
    kind: "service",
  },
  {
    id: "seguridad-digital",
    name: "Seguridad digital",
    description: "Protección para los dispositivos de la casa y para lo que hacen los chicos.",
    kind: "service",
  },
  {
    id: "plan",
    name: "Tu plan de Internet",
    description: "Más velocidad y mejoras sobre la conexión que ya tenés.",
    kind: "service",
  },
  {
    id: "conectividad",
    name: "Conectividad",
    description: "Equipos para que la señal llegue bien a toda la casa.",
    kind: "product",
  },
  {
    id: "seguridad",
    name: "Seguridad del hogar",
    description: "Cámaras y videoporteros que mirás desde el celular.",
    kind: "product",
  },
  {
    id: "entretenimiento",
    name: "Entretenimiento",
    description: "Televisores y audio para aprovechar lo que ya mirás.",
    kind: "product",
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    description: "Celulares y tablets con precio de cliente.",
    kind: "product",
  },
  {
    id: "hogar",
    name: "Hogar conectado",
    description: "Electrodomésticos que hacen más liviano el día a día.",
    kind: "product",
  },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

/** Catálogo base, sin overrides del admin. Solo ítems activos. */
export function getCatalog(): CatalogItem[] {
  return CATALOG.filter((item) => item.active);
}

/** Incluye los inactivos. Lo usa `/admin/catalogo`, que tiene que poder verlos. */
export function getFullCatalog(): CatalogItem[] {
  return CATALOG;
}

export function getItemBySlug(slug: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.slug === slug);
}

export function getItemById(id: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === id);
}

export function getFeatured(items: readonly CatalogItem[] = getCatalog()): CatalogItem[] {
  return items.filter((item) => item.featured);
}

export function getByCategory(
  category: CategoryId,
  items: readonly CatalogItem[] = getCatalog(),
): CatalogItem[] {
  return items.filter((item) => item.category === category);
}

export function isService(item: CatalogItem): item is ServiceItem {
  return item.kind === "service";
}

export function isProduct(item: CatalogItem): item is PhysicalProduct {
  return item.kind === "product";
}

/** Un upgrade de plan es un servicio de categoría `plan` con origen y destino. */
export function isPlanUpgrade(item: CatalogItem): item is ServiceItem {
  return isService(item) && item.category === "plan" && item.fromPlanId !== undefined;
}

/**
 * El upgrade que le corresponde a un abonado según su plan actual.
 *
 * Es el módulo "Tu plan" de la tienda (ADR-027): cada abonado ve **solo** el
 * salto que puede dar, y quien ya está en el plan más alto no ve nada. Cuando
 * hay más de un salto posible se elige el más barato, que es el que más
 * probablemente convierte.
 */
export function getPlanUpgradeFor(
  planId: string,
  items: readonly CatalogItem[] = getCatalog(),
): ServiceItem | undefined {
  const candidates = items.filter(
    (item): item is ServiceItem => isPlanUpgrade(item) && item.fromPlanId === planId,
  );
  if (candidates.length === 0) return undefined;

  let cheapest = candidates[0]!;
  for (const candidate of candidates) {
    if (candidate.exclusiveMonthlyPrice < cheapest.exclusiveMonthlyPrice) cheapest = candidate;
  }
  return cheapest;
}

/** Todos los saltos posibles desde un plan, del más barato al más caro. */
export function getPlanUpgradesFor(
  planId: string,
  items: readonly CatalogItem[] = getCatalog(),
): ServiceItem[] {
  return items
    .filter((item): item is ServiceItem => isPlanUpgrade(item) && item.fromPlanId === planId)
    .sort((a, b) => a.exclusiveMonthlyPrice - b.exclusiveMonthlyPrice);
}

/**
 * Un upgrade solo tiene sentido si el tenant declara los dos planes. Con esto,
 * un tenant sin `fibra-600-tv` simplemente no lista ese salto, sin tocar código.
 */
export function isUpgradeAvailableFor(item: ServiceItem, tenant: Tenant): boolean {
  if (!isPlanUpgrade(item)) return true;
  const has = (id: string | undefined) => tenant.plans.some((plan) => plan.id === id);
  return has(item.fromPlanId) && has(item.toPlanId);
}

export function getSubscriberPlanUpgrade(
  subscriber: Pick<Subscriber, "planId">,
  tenant: Tenant,
  items: readonly CatalogItem[] = getCatalog(),
): ServiceItem | undefined {
  const upgrade = getPlanUpgradeFor(subscriber.planId, items);
  return upgrade && isUpgradeAvailableFor(upgrade, tenant) ? upgrade : undefined;
}

/** Precio con el que se ordena y se busca, sin importar el tipo de ítem. */
export function listPriceOf(item: CatalogItem): number {
  return item.kind === "product" ? item.publicPrice : item.publicMonthlyPrice;
}

export function exclusivePriceOf(item: CatalogItem): number {
  return item.kind === "product" ? item.exclusivePrice : item.exclusiveMonthlyPrice;
}

export type SortKey = "relevancia" | "precio-asc" | "precio-desc" | "ahorro";

export function sortItems(items: readonly CatalogItem[], sort: SortKey): CatalogItem[] {
  const copy = [...items];
  switch (sort) {
    case "precio-asc":
      return copy.sort((a, b) => listPriceOf(a) - listPriceOf(b));
    case "precio-desc":
      return copy.sort((a, b) => listPriceOf(b) - listPriceOf(a));
    case "ahorro":
      return copy.sort(
        (a, b) =>
          (listPriceOf(b) - exclusivePriceOf(b)) / listPriceOf(b) -
          (listPriceOf(a) - exclusivePriceOf(a)) / listPriceOf(a),
      );
    default:
      // Relevancia: destacados primero, después el orden del catálogo, que ya
      // pone los servicios adelante.
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function searchItems(items: readonly CatalogItem[], query: string): CatalogItem[] {
  const term = query.trim().toLowerCase();
  if (!term) return [...items];
  return items.filter((item) =>
    [item.name, item.brand, item.shortDescription, ...item.tags]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}

/** Cambios que el admin guarda sobre el catálogo base. */
export interface CatalogOverride {
  active?: boolean;
  featured?: boolean;
  exclusivePrice?: number;
}

/**
 * PUNTO DE CORTE FASE 1 — en producción los overrides los aplica la API y este
 * merge desaparece: los datos ya llegan aplicados.
 */
export function applyOverrides(
  items: readonly CatalogItem[],
  overrides: Readonly<Record<string, CatalogOverride>>,
): CatalogItem[] {
  return items.map((item) => {
    const override = overrides[item.id];
    if (!override) return item;

    const merged: CatalogItem = { ...item };
    if (override.active !== undefined) merged.active = override.active;
    if (override.featured !== undefined) merged.featured = override.featured;
    if (override.exclusivePrice !== undefined) {
      if (merged.kind === "product") merged.exclusivePrice = override.exclusivePrice;
      else merged.exclusiveMonthlyPrice = override.exclusivePrice;
    }
    return merged;
  });
}
