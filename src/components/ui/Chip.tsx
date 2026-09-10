import Link from "next/link";

import { cx } from "@/lib/cx";

const BASE =
  "rounded-sm inline-flex h-8 shrink-0 items-center border px-3 text-[15px] transition-colors";

const STATE = {
  on: "bg-primary text-white border-primary font-medium",
  off: "bg-surface text-ink border-line hover:border-primary/40",
} as const;

/**
 * Chip de filtro. Es un enlace y no un botón: cada categoría tiene su propia
 * URL, así que el abonado puede compartirla y el navegador puede volver atrás.
 */
export function ChipLink({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(BASE, active ? STATE.on : STATE.off)}
    >
      {children}
    </Link>
  );
}

/** Variante para filtros que no cambian de ruta, como el orden del catálogo. */
export function ChipButton({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(BASE, active ? STATE.on : STATE.off)}
    >
      {children}
    </button>
  );
}
