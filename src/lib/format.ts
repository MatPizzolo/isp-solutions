/**
 * Formateo de valores para la UI. Todo puro: sin `window`, sin leer el reloj.
 */

/**
 * El locale se fija explícitamente en lugar de usar el default del entorno.
 * Server y browser pueden tener locales distintos, y una diferencia de formato
 * entre el HTML del servidor y el primer render del cliente sería un mismatch
 * de hidratación justo en los precios.
 */
const ARS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Moneda argentina, sin decimales: `$ 189.000`.
 *
 * El separador entre el símbolo y la cifra es un espacio duro (U+00A0), que es
 * lo que emite el locale `es-AR`. Se deja tal cual: evita que el `$` quede
 * colgado al final de una línea, separado de su número.
 */
export function formatARS(amount: number): string {
  return ARS.format(Math.round(amount));
}

/**
 * Importe mensual: `$ 9.900 por mes`.
 *
 * Se escribe "por mes" y no "/mes" a propósito: la barra se lee mal en voz alta
 * y en una demo el precio se dice en voz alta.
 */
export function formatMonthly(amount: number): string {
  return `${formatARS(amount)} por mes`;
}

/** Importe según el período de la cotización. */
export function formatPrice(amount: number, period: "once" | "monthly"): string {
  return period === "monthly" ? formatMonthly(amount) : formatARS(amount);
}

/**
 * Cifras grandes del panel: `$ 18,1 M`. Un dashboard con `$ 18.062.400` obliga a
 * contar dígitos para saber el orden de magnitud.
 */
export function formatCompactARS(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `$ ${(amount / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (abs >= 1_000) return `$ ${(amount / 1_000).toFixed(0)} K`;
  return formatARS(amount);
}

const PERCENT = new Intl.NumberFormat("es-AR", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/** Recibe una fracción, no un porcentaje: `0.12` → `12%`. */
export function formatPercent(fraction: number): string {
  return PERCENT.format(fraction);
}

const NUMBER = new Intl.NumberFormat("es-AR");

export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

const DATE = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const LONG_DATE = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long" });

const MONTH = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });

/**
 * Las fechas del proyecto son cadenas ISO. Se parsean como fecha local y no como
 * UTC: `new Date("2026-09-09")` da el 8 de septiembre en Argentina, que es
 * exactamente el tipo de error que después nadie encuentra.
 */
export function parseISODate(iso: string): Date {
  const [datePart = ""] = iso.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) return new Date(iso);
  return new Date(year, month - 1, day);
}

export function formatDate(iso: string): string {
  return DATE.format(parseISODate(iso));
}

/** `9 de septiembre`, para el copy de activación y facturación. */
export function formatLongDate(iso: string): string {
  return LONG_DATE.format(parseISODate(iso));
}

/** `septiembre de 2026`, para los ejes del dashboard. */
export function formatMonthLabel(iso: string): string {
  return MONTH.format(parseISODate(`${iso}-01`));
}
