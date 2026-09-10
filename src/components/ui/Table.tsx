import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

/**
 * Tabla del panel. Filas de 44px, no de 32: densidad alta pero legible.
 *
 * El contenedor tiene su propio scroll horizontal, que es la única excepción a
 * la regla de que nada scrollea de costado a 375px.
 */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("border-line rounded-base overflow-x-auto border", className)}>
      <table className="w-full border-collapse text-[15px]">{children}</table>
    </div>
  );
}

export function Th({
  children,
  numeric = false,
  className,
}: {
  children: ReactNode;
  numeric?: boolean;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cx(
        "bg-background text-muted border-line border-b px-4 py-2.5 text-[13px] font-medium",
        numeric ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  numeric = false,
  className,
}: {
  children: ReactNode;
  numeric?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cx(
        "border-line h-11 border-b px-4 align-middle",
        // Las cifras siempre a la derecha y con ancho de dígito fijo: es lo que
        // permite comparar una columna de un vistazo.
        numeric && "tabular text-right",
        className,
      )}
    >
      {children}
    </td>
  );
}
