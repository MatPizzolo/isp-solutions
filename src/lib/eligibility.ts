import type { EligibilityResult, Plan, Subscriber, Tenant } from "@/types";

/**
 * Deja solo los dígitos. El abonado escribe el DNI como se le ocurre —con
 * puntos, con espacios, con guiones— y todo eso tiene que validar igual.
 */
export function normalizeIdentifier(input: string): string {
  return input.replace(/\D/g, "");
}

/** Mínimo de dígitos para que valga la pena consultar. */
const MIN_DIGITS = 5;

export function isWellFormed(input: string): boolean {
  return normalizeIdentifier(input).length >= MIN_DIGITS;
}

/**
 * Elegibilidad del abonado.
 *
 * PUNTO DE CORTE FASE 1 — hoy busca en el JSON del tenant; en producción
 * consulta la API o el archivo de abonados elegibles del ISP. Cuando eso pase,
 * la función se vuelve asíncrona y el formulario gana un estado de carga: nada
 * más de la aplicación cambia, porque nadie fuera de acá conoce el formato de
 * origen. Ver ADR-033 y docs/08-integracion-con-isps.md.
 *
 * Función pura: recibe el padrón por parámetro y no toca `window` ni el reloj.
 */
export function checkSubscriber(
  identifier: string,
  subscribers: readonly Subscriber[],
  tenant: Tenant,
): EligibilityResult {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) return { result: "not_found" };

  const subscriber = subscribers.find(
    (candidate) => candidate.dni === normalized || candidate.customerNumber === normalized,
  );
  if (!subscriber) return { result: "not_found" };

  if (subscriber.status === "suspended") return { result: "suspended", subscriber };
  if (subscriber.status === "inactive") return { result: "inactive", subscriber };

  const plan = tenant.plans.find((candidate) => candidate.id === subscriber.planId);
  if (!plan) {
    // Un abonado activo con un plan que el tenant no declara es un error de
    // datos, no un caso de negocio: se trata como no encontrado en vez de
    // inventarle un tier.
    return { result: "not_found" };
  }

  return { result: "active", subscriber, plan, tier: plan.tier };
}

/** Plan del abonado, o `undefined` si el id no existe en el tenant. */
export function findPlan(tenant: Tenant, planId: string): Plan | undefined {
  return tenant.plans.find((plan) => plan.id === planId);
}
