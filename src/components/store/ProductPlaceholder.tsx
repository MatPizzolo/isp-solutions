import { cx } from "@/lib/cx";
import type { CategoryId } from "@/types";

/**
 * Ilustraciones de producto.
 *
 * No son íconos de stock: son cinco composiciones geométricas, una por familia
 * de categoría. Usan `currentColor` sobre `text-primary` en vez de
 * `var(--color-primary)`, porque con `@theme inline` esa variable no existe en
 * `:root` (ADR-016). El efecto secundario es mejor que la intención original:
 * `currentColor` hereda del ámbito, así que dentro del preview de `/admin/marca`
 * se retematizan solas.
 */

type Family = "tv" | "celular" | "gaming" | "seguridad" | "conectividad";

const FAMILY_BY_CATEGORY: Record<CategoryId, Family> = {
  tv: "tv",
  celular: "celular",
  gaming: "gaming",
  "seguridad-digital": "seguridad",
  plan: "conectividad",
  conectividad: "conectividad",
  seguridad: "seguridad",
  entretenimiento: "tv",
  tecnologia: "celular",
  hogar: "conectividad",
};

/**
 * Variación por ítem, derivada del id. Suficiente para que la grilla no se vea
 * repetida, no tanta como para que parezca aleatoria.
 */
function variantOf(id: string): { rotation: number; shiftX: number; shiftY: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return {
    rotation: (hash % 13) - 6,
    shiftX: ((hash >> 4) % 9) - 4,
    shiftY: ((hash >> 8) % 9) - 4,
  };
}

function Shapes({ family }: { family: Family }) {
  switch (family) {
    // Pantallas apiladas y desplazadas.
    case "tv":
      return (
        <>
          <rect x="26" y="30" width="88" height="58" rx="4" opacity=".18" />
          <rect x="34" y="38" width="88" height="58" rx="4" opacity=".38" />
          <rect x="42" y="46" width="88" height="58" rx="4" fill="none" strokeWidth="3" />
        </>
      );
    // Arcos de señal, de grosor decreciente.
    case "celular":
      return (
        <>
          <circle cx="78" cy="104" r="6" />
          <path d="M56 90a30 30 0 0 1 44 0" fill="none" strokeWidth="7" opacity=".7" />
          <path d="M42 74a52 52 0 0 1 72 0" fill="none" strokeWidth="5" opacity=".45" />
          <path d="M28 58a74 74 0 0 1 100 0" fill="none" strokeWidth="3" opacity=".22" />
        </>
      );
    // Retícula de rombos, con uno fuera del eje.
    case "gaming":
      return (
        <>
          <path d="M78 26 96 52 78 78 60 52Z" opacity=".2" />
          <path d="M46 62 64 88 46 114 28 88Z" opacity=".38" />
          <path d="M112 58 130 84 112 110 94 84Z" fill="none" strokeWidth="3" />
        </>
      );
    // Escudo con dos trapecios y una diagonal.
    case "seguridad":
      return (
        <>
          <path d="M78 24 124 42v34c0 26-20 44-46 52-26-8-46-26-46-52V42Z" opacity=".16" />
          <path
            d="M78 24 124 42v34c0 26-20 44-46 52-26-8-46-26-46-52V42Z"
            fill="none"
            strokeWidth="3"
          />
          <path d="M78 24v104" strokeWidth="3" opacity=".45" />
        </>
      );
    // Nodos enlazados. Deliberadamente distinto de los arcos de `celular`: dos
    // familias con la misma forma hacen que la grilla se vea repetida.
    default:
      return (
        <>
          <path
            d="M46 52 110 44M46 52 78 106M110 44 78 106M110 44 118 100M78 106 118 100"
            fill="none"
            strokeWidth="3"
            opacity=".45"
          />
          <circle cx="46" cy="52" r="11" opacity=".25" />
          <circle cx="110" cy="44" r="14" />
          <circle cx="78" cy="106" r="9" opacity=".55" />
          <circle cx="118" cy="100" r="7" opacity=".3" />
        </>
      );
  }
}

export function ProductPlaceholder({
  itemId,
  category,
  className,
}: {
  itemId: string;
  category: CategoryId;
  className?: string;
}) {
  const family = FAMILY_BY_CATEGORY[category];
  const { rotation, shiftX, shiftY } = variantOf(itemId);

  return (
    <div className={cx("bg-primary/6 text-primary flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 156 156"
        // Decorativa: el nombre del producto está al lado, en texto.
        aria-hidden
        focusable="false"
        className="h-full w-full"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform={`translate(${shiftX} ${shiftY}) rotate(${rotation} 78 78)`}>
          <Shapes family={family} />
        </g>
      </svg>
    </div>
  );
}
