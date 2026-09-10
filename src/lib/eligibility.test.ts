import { describe, expect, it } from "vitest";

import { checkSubscriber, isWellFormed, normalizeIdentifier } from "@/lib/eligibility";
import subscribersData from "@/tenants/zonda/subscribers.json";
import tenantData from "@/tenants/zonda/tenant.json";
import type { Subscriber, Tenant } from "@/types";

const subscribers = subscribersData as Subscriber[];
const tenant = tenantData as Tenant;

const check = (identifier: string) => checkSubscriber(identifier, subscribers, tenant);

describe("normalizeIdentifier", () => {
  it("deja solo los dígitos", () => {
    // El abonado escribe el DNI como se le ocurre y todo tiene que validar igual.
    expect(normalizeIdentifier("30.111.222")).toBe("30111222");
    expect(normalizeIdentifier(" 30 111 222 ")).toBe("30111222");
    expect(normalizeIdentifier("30-111-222")).toBe("30111222");
  });

  it("rechaza entradas demasiado cortas", () => {
    expect(isWellFormed("123")).toBe(false);
    expect(isWellFormed("30111222")).toBe(true);
  });
});

describe("checkSubscriber — los seis casos de prueba", () => {
  it("30111222 · Lucía Ferreyra · activa en plan base", () => {
    const result = check("30111222");
    expect(result.result).toBe("active");
    if (result.result !== "active") throw new Error("unreachable");
    expect(result.subscriber.name).toBe("Lucía Ferreyra");
    expect(result.plan.id).toBe("fibra-300");
    expect(result.tier).toBe("base");
  });

  it("27888999 · Martín Solari · activo en plan premium", () => {
    const result = check("27888999");
    expect(result.result).toBe("active");
    if (result.result !== "active") throw new Error("unreachable");
    expect(result.tier).toBe("premium");
    expect(result.plan.id).toBe("fibra-600-tv");
  });

  it("33444555 · Camila Prieto · activa en el plan más bajo", () => {
    const result = check("33444555");
    expect(result.result).toBe("active");
    if (result.result !== "active") throw new Error("unreachable");
    expect(result.plan.id).toBe("fibra-100");
    expect(result.tier).toBe("base");
  });

  it("20555666 · Roberto Ibáñez · suspendido", () => {
    const result = check("20555666");
    expect(result.result).toBe("suspended");
  });

  it("18999000 · Elena Carrizo · dado de baja", () => {
    const result = check("18999000");
    expect(result.result).toBe("inactive");
  });

  it("35000111 · no existe", () => {
    expect(check("35000111").result).toBe("not_found");
  });
});

describe("checkSubscriber — número de cliente", () => {
  it("encuentra por número de cliente además de por DNI", () => {
    const byDni = check("30111222");
    const byCustomerNumber = check("104588");
    expect(byCustomerNumber.result).toBe("active");
    if (byDni.result !== "active" || byCustomerNumber.result !== "active") {
      throw new Error("unreachable");
    }
    expect(byCustomerNumber.subscriber.id).toBe(byDni.subscriber.id);
  });

  it("respeta el estado también cuando se busca por número de cliente", () => {
    expect(check("77120").result).toBe("suspended");
  });
});

describe("checkSubscriber — bordes", () => {
  it("una entrada vacía no encuentra a nadie", () => {
    expect(check("").result).toBe("not_found");
    expect(check("   ").result).toBe("not_found");
  });

  it("una entrada sin dígitos no encuentra a nadie", () => {
    expect(check("no soy un dni").result).toBe("not_found");
  });

  it("solo el estado activo trae plan y tier", () => {
    for (const identifier of ["20555666", "18999000", "35000111"]) {
      const result = check(identifier);
      expect(result).not.toHaveProperty("plan");
      expect(result).not.toHaveProperty("tier");
    }
  });

  it("un abonado activo con un plan que el tenant no declara no crea sesión", () => {
    // Es un error de datos, no un caso de negocio: mejor no encontrarlo que
    // inventarle un tier y darle beneficios que no le corresponden.
    const huerfano: Subscriber[] = [
      { ...subscribers[0]!, planId: "plan-que-no-existe", dni: "11222333" },
    ];
    expect(checkSubscriber("11222333", huerfano, tenant).result).toBe("not_found");
  });
});
