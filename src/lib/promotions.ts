import type { Promotion, PromotionStatus } from "@/types";

/** `YYYY-MM-DD` de una fecha, en hora local. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Estado de una promoción. **Se deriva, no se guarda**: una promo guardada como
 * "vigente" quedaría mintiendo al día siguiente de vencer.
 *
 * La comparación es sobre las cadenas `YYYY-MM-DD`, que ordenan igual que las
 * fechas y evitan sorpresas de zona horaria.
 */
export function getPromotionStatus(promo: Promotion, now: Date): PromotionStatus {
  if (!promo.active) return "vencida";
  const today = toDateKey(now);
  if (today < promo.startsAt) return "programada";
  if (today > promo.endsAt) return "vencida";
  return "vigente";
}

/** Solo las vigentes. Es lo que consume `computePrice`. */
export function getActivePromotions(promos: readonly Promotion[], now: Date): Promotion[] {
  return promos.filter((promo) => getPromotionStatus(promo, now) === "vigente");
}

/** El banner destacado, si hay alguno vigente. */
export function getActiveBanner(promos: readonly Promotion[], now: Date): Promotion | undefined {
  return getActivePromotions(promos, now).find((promo) => promo.type === "banner");
}

export const PROMOTION_STATUS_LABEL: Record<PromotionStatus, string> = {
  vigente: "Vigente",
  programada: "Programada",
  vencida: "Vencida",
};
