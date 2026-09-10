import type { Tenant } from "@/types";

import zonda from "./zonda/tenant.json";

/**
 * Registro de tenants. Es el **único** lugar de la aplicación que sabe cómo se
 * elige el tenant activo: la resolución por subdominio de la Fase 2 cambia este
 * archivo y nada más.
 */
const TENANTS = {
  zonda: zonda as Tenant,
} as const satisfies Record<string, Tenant>;

export type TenantId = keyof typeof TENANTS;

const DEFAULT_TENANT_ID: TenantId = "zonda";

function isTenantId(value: string): value is TenantId {
  return Object.hasOwn(TENANTS, value);
}

/**
 * Tenant activo, según `NEXT_PUBLIC_TENANT`.
 *
 * Si la variable trae un id que no existe se falla ruidosamente en lugar de caer
 * al default: un tenant mal escrito que degrada en silencio se descubre recién
 * en la reunión, cuando la tienda muestra la marca equivocada.
 */
export function getTenant(): Tenant {
  const requested = process.env.NEXT_PUBLIC_TENANT?.trim();
  if (!requested) return TENANTS[DEFAULT_TENANT_ID];

  if (!isTenantId(requested)) {
    throw new Error(
      `NEXT_PUBLIC_TENANT="${requested}" no está registrado. ` +
        `Disponibles: ${Object.keys(TENANTS).join(", ")}.`,
    );
  }
  return TENANTS[requested];
}

/** Todos los tenants registrados. Lo usa el generador de datos mock. */
export function getAllTenants(): Tenant[] {
  return Object.values(TENANTS);
}
