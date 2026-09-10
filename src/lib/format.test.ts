import { describe, expect, it } from "vitest";

import { formatARS } from "@/lib/format";

const NBSP = " ";

describe("formatARS", () => {
  it("formatea con el separador de miles argentino y sin decimales", () => {
    expect(formatARS(189000)).toBe(`$${NBSP}189.000`);
  });

  it("usa un espacio duro entre el símbolo y la cifra", () => {
    // Aserción explícita sobre el codepoint: si una versión de Node o de ICU
    // cambiara el separador, el precio se rompería en toda la app y este test
    // es el único lugar donde se nota antes de que pase.
    expect([...formatARS(1000)][1]).toBe(NBSP);
  });

  it("redondea al peso", () => {
    expect(formatARS(76266.67)).toBe(`$${NBSP}76.267`);
    expect(formatARS(76266.4)).toBe(`$${NBSP}76.266`);
  });

  it("maneja el cero y los negativos", () => {
    expect(formatARS(0)).toBe(`$${NBSP}0`);
    expect(formatARS(-5000)).toBe(`-$${NBSP}5.000`);
  });
});
