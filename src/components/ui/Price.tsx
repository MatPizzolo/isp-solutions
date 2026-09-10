"use client";

import { useMemo, type CSSProperties } from "react";

import { REVEAL, useSession } from "@/contexts/SessionContext";
import { useStoreData } from "@/contexts/StoreDataContext";
import { formatARS, formatPrice } from "@/lib/format";
import { computePrice } from "@/lib/pricing";
import { getTenant } from "@/lib/tenant";
import type { CatalogItem } from "@/types";

const tenant = getTenant();

type PriceState = "loading" | "locked" | "revealing" | "exclusive";

/**
 * Los tres renglones llevan **altura fija**, no altura natural.
 *
 * No alcanza con que los tres existan siempre: el chip de ahorro tiene padding
 * vertical y el texto bloqueado no, así que el renglón C crecía 4px al
 * revelarse y toda la grilla se corría. Medido con Playwright, no supuesto.
 *
 * El renglón B se dimensiona por tamaño; el A y el C son constantes.
 */
const SIZE = {
  sm: {
    was: "text-[13px] h-5",
    final: "text-[17px] h-6",
    note: "text-[13px] h-6",
    lockedLabel: "Precio de cliente",
  },
  md: {
    was: "text-[13px] h-5",
    final: "text-[22px] h-8",
    note: "text-[13px] h-6",
    lockedLabel: "Ingresá tu DNI para ver tu precio",
  },
  lg: {
    was: "text-[15px] h-6",
    final: "text-[28px] h-9",
    note: "text-[15px] h-7",
    lockedLabel: "Ingresá tu DNI para ver tu precio",
  },
} as const;

export interface PriceProps {
  item: CatalogItem;
  /** Posición en la lista. Define el retraso de la cascada. */
  revealIndex?: number;
  size?: keyof typeof SIZE;
}

/**
 * El bloque de precio. Es el componente más importante del proyecto.
 *
 * **Tres renglones, siempre, en los cuatro estados.** El renglón de arriba queda
 * reservado y vacío mientras no hay sesión, así el precio tachado aparece en un
 * espacio que ya existía y nada se corre de lugar. Sin eso, la revelación
 * empujaría media pantalla hacia abajo. Ver docs/04-diseno-y-ui.md §4.
 */
export function Price({ item, revealIndex = 0, size = "md" }: PriceProps) {
  const { status, session, revealPhase } = useSession();
  const { activePromotions } = useStoreData();
  const sizes = SIZE[size];

  const quote = useMemo(
    () => computePrice(item, session, activePromotions, tenant.benefits),
    [item, session, activePromotions],
  );

  // Cotización sin sesión: es la que se muestra bloqueada y la que fija el ancho
  // del bloque, para que el número final no ensanche la tarjeta al aparecer.
  const listQuote = useMemo(
    () => computePrice(item, null, activePromotions, tenant.benefits),
    [item, activePromotions],
  );

  const state: PriceState =
    status === "loading"
      ? "loading"
      : !session
        ? "locked"
        : revealPhase === "running"
          ? "revealing"
          : "exclusive";

  const revealed = state === "revealing" || state === "exclusive";
  const listPrice = formatPrice(listQuote.publicPrice, listQuote.period);

  return (
    <div
      className="nx-price tabular"
      data-state={state}
      style={{ "--nx-reveal-index": Math.min(revealIndex, REVEAL.maxIndex) } as CSSProperties}
    >
      {/* Renglón A — reservado. Vacío sin sesión, precio tachado al revelarse. */}
      <div className={`${sizes.was} text-muted flex items-center`}>
        {state === "loading" ? (
          <span aria-hidden className="nx-skeleton bg-muted/20 block h-3 w-16 rounded-sm" />
        ) : revealed && quote.isExclusive ? (
          <span className="nx-price-was relative inline-block">
            {listPrice}
            {/* El tachado es un elemento propio para poder dibujarlo de
                izquierda a derecha con scaleX; `line-through` no se anima. */}
            <span
              aria-hidden
              className="nx-price-strike bg-muted absolute inset-x-0 top-1/2 h-px"
            />
            <span className="sr-only"> precio de lista</span>
          </span>
        ) : (
          // Reserva el alto del renglón sin ocupar espacio visible.
          <span aria-hidden className="invisible">
            &nbsp;
          </span>
        )}
      </div>

      {/* Renglón B — el número. */}
      <div className={`${sizes.final} text-ink flex items-center font-semibold`}>
        {state === "loading" ? (
          <span aria-hidden className="nx-skeleton bg-muted/25 block h-6 w-28 rounded-sm" />
        ) : quote.isIncludedInPlan ? (
          <span className="nx-price-final bg-success/15 text-success rounded-sm px-2 py-0.5 text-[15px] font-semibold">
            Incluido en tu plan
          </span>
        ) : (
          <span className="nx-price-final inline-block">
            {formatPrice(quote.finalPrice, quote.period)}
          </span>
        )}
      </div>

      {/* Renglón C — candado o ahorro. */}
      <div className={`${sizes.note} flex items-center`}>
        {state === "loading" ? (
          <span aria-hidden className="nx-skeleton bg-muted/20 block h-3 w-24 rounded-sm" />
        ) : !session ? (
          <span className="text-muted truncate">{sizes.lockedLabel}</span>
        ) : quote.savings > 0 && !quote.isIncludedInPlan ? (
          // "por mes" ya está en el renglón B: repetirlo acá no agrega nada y
          // hacía que el chip se partiera en dos líneas y se saliera de la
          // tarjeta en el tamaño chico.
          <span className="nx-price-savings bg-accent/15 text-ink inline-block rounded-sm px-1.5 py-0.5 font-medium whitespace-nowrap">
            Ahorrás {formatARS(quote.savings)}
          </span>
        ) : (
          <span aria-hidden className="invisible">
            &nbsp;
          </span>
        )}
      </div>

      {/* Un solo anuncio para lectores de pantalla, en vez de tres renglones
          sueltos que se leerían como fragmentos inconexos. */}
      <span className="sr-only" aria-live="polite">
        {revealed
          ? quote.isIncludedInPlan
            ? `${item.name}: incluido en tu plan, sin cargo.`
            : `${item.name}: tu precio es ${formatPrice(quote.finalPrice, quote.period)}. Ahorrás ${formatARS(quote.savings)}.`
          : ""}
      </span>
    </div>
  );
}
