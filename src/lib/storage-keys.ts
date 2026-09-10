/**
 * Todas las claves de almacenamiento del navegador, en un solo lugar.
 *
 * Ningún componente arma una clave a mano. El prefijo común es lo que permite
 * que "Restablecer demo" borre todo el estado de un tenant sin conocer cada
 * clave por separado.
 */

const PREFIX = "nexo";

export function storageKeys(tenantId: string) {
  return {
    /** localStorage. Abonado validado. Vence a las 24 h. */
    session: `${PREFIX}:session:${tenantId}`,
    /** localStorage. `{ itemId, quantity }[]` — nunca precios. */
    cart: `${PREFIX}:cart:${tenantId}`,
    /** localStorage. Órdenes creadas durante la demo. */
    orders: `${PREFIX}:orders:${tenantId}`,
    /** localStorage. Servicios dados de alta durante la demo. */
    subscriptions: `${PREFIX}:subscriptions:${tenantId}`,
    /** localStorage. Sesión del admin mock. */
    adminSession: `${PREFIX}:admin-session:${tenantId}`,
    /** localStorage. Overrides de catálogo, promociones y marca. */
    adminOverrides: `${PREFIX}:admin-overrides:${tenantId}`,
    /**
     * **sessionStorage**, no localStorage: es un flag de un solo uso que dispara
     * la revelación del precio y se consume en la primera pantalla con precios
     * que se renderiza después de validar.
     */
    reveal: `${PREFIX}:reveal:${tenantId}`,
  } as const;
}

export type StorageKeys = ReturnType<typeof storageKeys>;

/** Duración de la sesión del abonado, en milisegundos. */
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Borra todo el estado de la demo para un tenant. Recorre las claves por prefijo
 * en vez de usar la lista de arriba, así una clave nueva que alguien agregue sin
 * actualizar esto igual se limpia.
 */
export function clearTenantStorage(tenantId: string): void {
  const prefix = `${PREFIX}:`;
  const suffix = `:${tenantId}`;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    const doomed: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key?.startsWith(prefix) && key.endsWith(suffix)) doomed.push(key);
    }
    for (const key of doomed) storage.removeItem(key);
  }
}
