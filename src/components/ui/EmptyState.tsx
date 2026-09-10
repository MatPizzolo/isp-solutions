import type { ReactNode } from "react";

/**
 * Estado vacío. Enseña la interfaz en vez de decir "no hay nada": siempre tiene
 * un título que explica por qué está vacío y una acción concreta para salir.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-line rounded-base border border-dashed px-6 py-12 text-center">
      <p className="text-ink text-[17px] font-medium">{title}</p>
      {description && (
        <p className="text-muted mx-auto mt-2 max-w-[46ch] text-[15px]">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
