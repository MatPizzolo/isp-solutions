import type { CSSProperties } from "react";

import { resolveFontVars } from "@/lib/fonts";
import { getTenant } from "@/tenants";
import type { Tenant, Theme } from "@/types";

export { getTenant };

/**
 * Theme → variables de marca.
 *
 * Ojo con los dos juegos de nombres: acá se emiten las variables **`--brand-*`**
 * y **`--font-heading` / `--font-body`**. Las claves del tema (`--color-*`,
 * `--radius-*`, `--font-*`) las declara `globals.css` en `@theme inline`
 * apuntando a estas. Si se llamaran igual, el mapeo quedaría circular y moriría
 * en silencio. Ver ADR-011.
 *
 * Función pura: la misma entrada da siempre la misma salida, así que inyectarla
 * en el HTML del servidor no puede producir un mismatch de hidratación.
 */
export function resolveThemeVars(theme: Theme): Record<string, string> {
  const c = theme.colors;
  return {
    "--brand-primary": c.primary,
    "--brand-primary-hover": c.primaryHover,
    "--brand-accent": c.accent,
    "--brand-accent-hover": c.accentHover,
    "--brand-background": c.background,
    "--brand-surface": c.surface,
    "--brand-text": c.text,
    "--brand-text-muted": c.textMuted,
    "--brand-border": c.border,
    "--brand-success": c.success,
    "--brand-danger": c.danger,
    "--brand-radius": theme.radius,
    "--brand-radius-sm": theme.radiusSm,
    ...resolveFontVars(theme.fontPreset),
  };
}

/**
 * Las custom properties como `style` de React.
 *
 * React acepta custom properties en `style` pero `CSSProperties` no las tipa,
 * así que el cast es inevitable. Queda acotado a esta función en lugar de
 * repetirse en cada componente que arme un ámbito de marca.
 */
export function asStyle(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}

/** Atajo para el layout raíz y para el preview scoped de `/admin/marca`. */
export function themeStyle(theme: Theme): CSSProperties {
  return asStyle(resolveThemeVars(theme));
}

/**
 * Usuario del panel del ISP, derivado del dominio del tenant.
 *
 * El kickoff lo da como texto literal, pero también exige que no haya texto de
 * marca fuera de `tenant.json`. Derivarlo cumple las dos cosas y hace que un
 * tenant nuevo lo herede sin configurar nada. Ver ADR-019.
 */
export function getAdminEmail(tenant: Tenant): string {
  return `admin@${tenant.website}`;
}

/** Plan del abonado dentro del tenant. `undefined` si el id no existe. */
export function getPlan(tenant: Tenant, planId: string) {
  return tenant.plans.find((plan) => plan.id === planId);
}
