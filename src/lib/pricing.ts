import type { Benefits, CatalogItem, PriceQuote, Promotion, Session, Tier } from "@/types";

/** Etiquetas del candidato ganador. No son texto de marca: son de la plataforma. */
const LABEL = {
  public: "Precio de lista",
  exclusive: "Precio cliente",
  premium: "Plan premium",
  included: "Incluido en tu plan",
} as const;

interface Candidate {
  price: number;
  label: string;
}

/** Precios base según el tipo de ítem. Es lo único que difiere entre los dos. */
function basePrices(item: CatalogItem) {
  return item.kind === "product"
    ? { public: item.publicPrice, exclusive: item.exclusivePrice, floor: item.supplierCost }
    : {
        public: item.publicMonthlyPrice,
        exclusive: item.exclusiveMonthlyPrice,
        floor: item.providerMonthlyCost,
      };
}

function appliesTo(promo: Promotion, item: CatalogItem, tier: Tier): boolean {
  if (promo.type === "banner") return false;
  if (promo.discount === undefined) return false;
  if (promo.category !== undefined && promo.category !== item.category) return false;
  if (promo.tier !== undefined && promo.tier !== tier) return false;
  return true;
}

/**
 * Precio final de un ítem para un abonado.
 *
 * Función **pura**: recibe las promociones ya filtradas por vigencia y no lee el
 * reloj ni `window`. Eso es lo que la hace testeable y lo que evita que el
 * precio cambie entre el render del servidor y la hidratación.
 *
 * Los descuentos **no se acumulan**: se evalúan como candidatos y gana el mejor.
 */
export function computePrice(
  item: CatalogItem,
  session: Session | null,
  activePromotions: readonly Promotion[],
  benefits: Benefits,
): PriceQuote {
  const period = item.kind === "product" ? "once" : "monthly";
  const base = basePrices(item);

  // Sin sesión el precio exclusivo ni siquiera se calcula. No es que se oculte
  // en la vista: no existe en el objeto que llega al componente.
  if (!session) {
    return {
      period,
      publicPrice: base.public,
      finalPrice: base.public,
      savings: 0,
      savingsPercent: 0,
      installments: null,
      appliedLabel: LABEL.public,
      isExclusive: false,
      isIncludedInPlan: false,
    };
  }

  // Incluido en el plan: corta la cadena. No tiene sentido buscar el mejor
  // descuento sobre algo que no se cobra.
  if (item.kind === "service" && item.includedInTiers.includes(session.tier)) {
    return {
      period,
      publicPrice: base.public,
      finalPrice: 0,
      savings: base.public,
      savingsPercent: 1,
      installments: null,
      appliedLabel: LABEL.included,
      isExclusive: true,
      isIncludedInPlan: true,
    };
  }

  const candidates: Candidate[] = [{ price: base.exclusive, label: LABEL.exclusive }];

  if (session.tier === "premium") {
    candidates.push({
      price: Math.round(base.public * (1 - benefits.premiumDiscount)),
      label: LABEL.premium,
    });
  }

  for (const promo of activePromotions) {
    if (!appliesTo(promo, item, session.tier)) continue;
    candidates.push({
      price: Math.round(base.public * (1 - (promo.discount ?? 0))),
      label: promo.name,
    });
  }

  // Piso duro: nunca por debajo del costo. Un candidato que lo perfore se
  // descarta en lugar de recortarse, para que el label siga diciendo la verdad.
  const viable = candidates.filter((candidate) => candidate.price >= base.floor);
  if (viable.length !== candidates.length && process.env.NODE_ENV !== "production") {
    const dropped = candidates.filter((candidate) => candidate.price < base.floor);
    console.warn(
      `[pricing] ${item.id}: descartados por debajo del costo (${base.floor}): ` +
        dropped.map((d) => `${d.label} ${d.price}`).join(", "),
    );
  }

  // Si todos perforan el piso, el precio de lista es la única salida honesta.
  const pool: Candidate[] =
    viable.length > 0 ? viable : [{ price: base.public, label: LABEL.public }];

  let winner = pool[0]!;
  for (const candidate of pool) {
    if (candidate.price < winner.price) winner = candidate;
  }

  const savings = base.public - winner.price;

  return {
    period,
    publicPrice: base.public,
    finalPrice: winner.price,
    savings,
    savingsPercent: base.public > 0 ? savings / base.public : 0,
    installments:
      item.kind === "product" &&
      item.installmentsEligible &&
      benefits.installmentsWithoutInterest > 0
        ? {
            count: benefits.installmentsWithoutInterest,
            amount: Math.round(winner.price / benefits.installmentsWithoutInterest),
          }
        : null,
    appliedLabel: winner.label,
    isExclusive: winner.price < base.public,
    isIncludedInPlan: false,
  };
}

/**
 * Validación del precio exclusivo editable en `/admin/catalogo`. Es la misma
 * regla que usa la tienda, para que el panel y el abonado nunca discrepen.
 */
export function validateExclusivePrice(
  item: CatalogItem,
  value: number,
): { ok: true } | { ok: false; message: string } {
  const base = basePrices(item);
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, message: "Ingresá un precio válido." };
  }
  if (value > base.public) {
    return { ok: false, message: "El precio exclusivo no puede superar al de lista." };
  }
  if (value < base.floor) {
    return { ok: false, message: "El precio exclusivo no puede quedar por debajo del costo." };
  }
  return { ok: true };
}
