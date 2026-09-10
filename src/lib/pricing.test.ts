import { describe, expect, it } from "vitest";

import { getItemById } from "@/lib/catalog";
import { computePrice, validateExclusivePrice } from "@/lib/pricing";
import tenantData from "@/tenants/zonda/tenant.json";
import type { CatalogItem, Promotion, ServiceItem, Session, Tenant } from "@/types";

const tenant = tenantData as Tenant;
const benefits = tenant.benefits;

function item(id: string): CatalogItem {
  const found = getItemById(id);
  if (!found) throw new Error(`Falta el ítem ${id} en el catálogo`);
  return found;
}

function session(tier: Session["tier"], planId: string): Session {
  return { subscriberId: "sub-test", name: "Test", planId, tier, validatedAt: Date.now() };
}

const base = session("base", "fibra-300");
const baseFibra100 = session("base", "fibra-100");
const premium = session("premium", "fibra-600-tv");

const NO_PROMOS: Promotion[] = [];

// El ejemplo numérico de docs/03-modelo-de-datos.md.
const SMART_TV = "ent-001"; // 520.000 · 468.000 · costo 421.200
const STREAMING = "tv-001"; // 12.000 · 9.900 · costo 7.200 · incluido en premium
const GAMING = "gam-001"; // 7.500 · 6.900 · costo 5.500
const UPGRADE_300 = "pln-001"; // 9.000 · 7.500 · costo 0

describe("computePrice — sin sesión", () => {
  it("nunca expone el precio exclusivo", () => {
    const quote = computePrice(item(SMART_TV), null, NO_PROMOS, benefits);
    expect(quote.finalPrice).toBe(520000);
    expect(quote.publicPrice).toBe(520000);
    expect(quote.savings).toBe(0);
    expect(quote.isExclusive).toBe(false);
  });

  it("tampoco en un servicio incluido en un plan", () => {
    const quote = computePrice(item(STREAMING), null, NO_PROMOS, benefits);
    expect(quote.finalPrice).toBe(12000);
    expect(quote.isIncludedInPlan).toBe(false);
  });

  it("no ofrece cuotas sin saber quién mira", () => {
    expect(computePrice(item(SMART_TV), null, NO_PROMOS, benefits).installments).toBeNull();
  });
});

describe("computePrice — producto físico, los tres planes", () => {
  it("plan base: gana el precio de cliente", () => {
    const quote = computePrice(item(SMART_TV), base, NO_PROMOS, benefits);
    expect(quote.finalPrice).toBe(468000);
    expect(quote.savings).toBe(52000);
    expect(quote.savingsPercent).toBeCloseTo(0.1, 4);
    expect(quote.appliedLabel).toBe("Precio cliente");
    expect(quote.period).toBe("once");
  });

  it("los dos planes base dan el mismo precio", () => {
    expect(computePrice(item(SMART_TV), base, NO_PROMOS, benefits).finalPrice).toBe(
      computePrice(item(SMART_TV), baseFibra100, NO_PROMOS, benefits).finalPrice,
    );
  });

  it("plan premium: gana el 12% sobre el precio de lista", () => {
    const quote = computePrice(item(SMART_TV), premium, NO_PROMOS, benefits);
    expect(quote.finalPrice).toBe(457600);
    expect(quote.savings).toBe(62400);
    expect(quote.savingsPercent).toBeCloseTo(0.12, 4);
    expect(quote.appliedLabel).toBe("Plan premium");
  });

  it("calcula las cuotas sobre el precio final", () => {
    const quote = computePrice(item(SMART_TV), premium, NO_PROMOS, benefits);
    expect(quote.installments).toEqual({ count: 6, amount: 76267 });
  });
});

describe("computePrice — promociones", () => {
  const combo: Promotion = {
    id: "promo-test",
    name: "Combo pantalla grande",
    type: "tier_discount",
    discount: 0.15,
    category: "entretenimiento",
    tier: "premium",
    startsAt: "2026-09-05",
    endsAt: "2026-09-30",
    active: true,
  };

  it("una promo mejor que el descuento premium gana", () => {
    const quote = computePrice(item(SMART_TV), premium, [combo], benefits);
    expect(quote.finalPrice).toBe(442000);
    expect(quote.savings).toBe(78000);
    expect(quote.appliedLabel).toBe("Combo pantalla grande");
  });

  it("los descuentos NO se acumulan: 15%, no 12% + 15%", () => {
    const quote = computePrice(item(SMART_TV), premium, [combo], benefits);
    // Acumulados darían 520000 × 0,88 × 0,85 = 388.960.
    expect(quote.finalPrice).toBe(442000);
    expect(quote.savingsPercent).toBeCloseTo(0.15, 4);
  });

  it("una promo acotada a premium no aplica a un abonado base", () => {
    const quote = computePrice(item(SMART_TV), base, [combo], benefits);
    expect(quote.finalPrice).toBe(468000);
    expect(quote.appliedLabel).toBe("Precio cliente");
  });

  it("una promo de otra categoría no aplica", () => {
    const otraCategoria: Promotion = { ...combo, category: "hogar", tier: undefined };
    expect(computePrice(item(SMART_TV), base, [otraCategoria], benefits).finalPrice).toBe(468000);
  });

  it("un banner no descuenta nada", () => {
    const banner: Promotion = {
      id: "promo-banner",
      name: "Semana de la conectividad",
      type: "banner",
      startsAt: "2026-09-01",
      endsAt: "2026-09-14",
      active: true,
    };
    expect(computePrice(item(SMART_TV), base, [banner], benefits).finalPrice).toBe(468000);
  });
});

describe("computePrice — piso de costo", () => {
  it("descarta el candidato que perfora el costo y gana el siguiente", () => {
    // 20% sobre 520.000 da 416.000, por debajo del costo de 421.200.
    const agresiva: Promotion = {
      id: "promo-agresiva",
      name: "Liquidación",
      type: "category_discount",
      discount: 0.2,
      category: "entretenimiento",
      startsAt: "2026-09-01",
      endsAt: "2026-09-30",
      active: true,
    };
    const quote = computePrice(item(SMART_TV), premium, [agresiva], benefits);
    expect(quote.finalPrice).toBe(457600);
    expect(quote.appliedLabel).toBe("Plan premium");
  });

  it("si todos los candidatos perforan el costo, queda el precio de lista", () => {
    const carisimo = { ...item(GAMING), providerMonthlyCost: 999999 } as ServiceItem;
    const quote = computePrice(carisimo, base, NO_PROMOS, benefits);
    expect(quote.finalPrice).toBe(7500);
    expect(quote.appliedLabel).toBe("Precio de lista");
    expect(quote.isExclusive).toBe(false);
  });
});

describe("computePrice — servicios", () => {
  it("devuelve un precio mensual, sin cuotas", () => {
    const quote = computePrice(item(STREAMING), base, NO_PROMOS, benefits);
    expect(quote.period).toBe("monthly");
    expect(quote.finalPrice).toBe(9900);
    expect(quote.savings).toBe(2100);
    expect(quote.installments).toBeNull();
  });

  it("incluido en el plan premium: cuesta cero y corta la cadena", () => {
    const quote = computePrice(item(STREAMING), premium, NO_PROMOS, benefits);
    expect(quote.finalPrice).toBe(0);
    expect(quote.isIncludedInPlan).toBe(true);
    expect(quote.appliedLabel).toBe("Incluido en tu plan");
    expect(quote.savings).toBe(12000);
    expect(quote.savingsPercent).toBe(1);
  });

  it("el mismo servicio, dos abonados: es el par de la demo", () => {
    const lucia = computePrice(item(STREAMING), base, NO_PROMOS, benefits);
    const martin = computePrice(item(STREAMING), premium, NO_PROMOS, benefits);
    expect(lucia.finalPrice).toBe(9900);
    expect(martin.finalPrice).toBe(0);
    expect(martin.appliedLabel).toBe("Incluido en tu plan");
  });

  it("un servicio no incluido sí toma el descuento premium", () => {
    const quote = computePrice(item(GAMING), premium, NO_PROMOS, benefits);
    expect(quote.finalPrice).toBe(6600);
    expect(quote.appliedLabel).toBe("Plan premium");
    expect(computePrice(item(GAMING), base, NO_PROMOS, benefits).finalPrice).toBe(6900);
  });
});

describe("computePrice — upgrade de plan", () => {
  it("el precio es la diferencia mensual y no tiene piso de costo", () => {
    const quote = computePrice(item(UPGRADE_300), baseFibra100, NO_PROMOS, benefits);
    expect(quote.period).toBe("monthly");
    expect(quote.finalPrice).toBe(7500);
    expect(quote.savings).toBe(1500);
    expect(quote.installments).toBeNull();
  });
});

describe("validateExclusivePrice", () => {
  it("acepta un precio entre el costo y el de lista", () => {
    expect(validateExclusivePrice(item(SMART_TV), 460000)).toEqual({ ok: true });
  });

  it("rechaza por encima del precio de lista", () => {
    const result = validateExclusivePrice(item(SMART_TV), 530000);
    expect(result.ok).toBe(false);
  });

  it("rechaza por debajo del costo", () => {
    const result = validateExclusivePrice(item(SMART_TV), 400000);
    expect(result.ok).toBe(false);
  });

  it("rechaza valores inválidos", () => {
    expect(validateExclusivePrice(item(SMART_TV), 0).ok).toBe(false);
    expect(validateExclusivePrice(item(SMART_TV), Number.NaN).ok).toBe(false);
  });

  it("usa los precios mensuales cuando el ítem es un servicio", () => {
    expect(validateExclusivePrice(item(STREAMING), 8000)).toEqual({ ok: true });
    expect(validateExclusivePrice(item(STREAMING), 13000).ok).toBe(false);
    expect(validateExclusivePrice(item(STREAMING), 7000).ok).toBe(false);
  });
});
