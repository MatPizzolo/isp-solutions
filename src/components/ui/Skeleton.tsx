import { cx } from "@/lib/cx";

/**
 * Bloque de carga. Pulso de opacidad, sin barrido diagonal: el barrido es
 * decoración y además llama la atención sobre la espera.
 *
 * Siempre se le da un tamaño explícito que coincida con el del contenido final.
 * Un skeleton que no reserva el espacio correcto empeora el problema que
 * pretende resolver.
 */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx("nx-skeleton bg-muted/20 block rounded-sm", className)} />;
}
