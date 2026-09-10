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
