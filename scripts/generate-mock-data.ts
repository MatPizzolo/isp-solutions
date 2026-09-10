/**
 * Genera los datos mock del tenant: órdenes, suscripciones y métricas.
 *
 *   pnpm mock:generate
 *
 * Con seed fija, así que el resultado es determinístico: dos corridas producen
 * archivos idénticos y el diff de git no se llena de ruido.
 *
 * Al final valida los invariantes de docs/07-metricas-y-kpis.md y falla
 * ruidosamente si alguno no se cumple. Un dashboard con cifras que no cierran
 * entre sí es peor que un dashboard vacío: se nota en la reunión.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import catalogData from "../src/data/catalog.json" with { type: "json" };
import subscribersData from "../src/tenants/zonda/subscribers.json" with { type: "json" };
import tenantData from "../src/tenants/zonda/tenant.json" with { type: "json" };
import type {
  CatalogItem,
  Metrics,
  MetricsPeriod,
  MetricsPeriodDays,
  MonthlyPoint,
  Order,
  OrderItem,
  OrderStatus,
  PhysicalProduct,
  ServiceItem,
  Subscriber,
  Subscription,
  SubscriptionStatus,
  Tenant,
  Tier,
} from "../src/types/index.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const TENANT_DIR = resolve(HERE, "../src/tenants/zonda");

const tenant = tenantData as Tenant;
const catalog = (catalogData as CatalogItem[]).filter((item) => item.active);
const testSubscribers = subscribersData as Subscriber[];

// El "hoy" del dataset. Fijo, para que el resultado no cambie según el día en
// que se corra el script.
const TODAY = new Date(2026, 8, 9); // 9 de septiembre de 2026
const WINDOW_DAYS = 90;

// ── Aleatoriedad determinística ─────────────────────────────────────────────

/** mulberry32: cinco líneas, sin dependencias, y suficientemente uniforme. */
function makeRng(seed: number) {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(20260909);

const pick = <T>(items: readonly T[]): T => items[Math.floor(rng() * items.length)]!;

function weightedPick<T>(entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1]![0];
}

// ── Población sintética ─────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Sofía",
  "Mateo",
  "Valentina",
  "Joaquín",
  "Malena",
  "Tomás",
  "Julieta",
  "Facundo",
  "Agustina",
  "Bruno",
  "Renata",
  "Ignacio",
  "Delfina",
  "Santiago",
  "Catalina",
  "Emilio",
  "Paula",
  "Nicolás",
  "Rocío",
  "Gonzalo",
  "Micaela",
  "Lautaro",
  "Antonella",
  "Ramiro",
  "Florencia",
  "Gastón",
  "Abril",
  "Federico",
  "Guadalupe",
  "Damián",
];

const LAST_NAMES = [
  "Peralta",
  "Quiroga",
  "Bustos",
  "Aguirre",
  "Maidana",
  "Ocampo",
  "Villalba",
  "Cabrera",
  "Ledesma",
  "Sosa",
  "Miranda",
  "Arce",
  "Zalazar",
  "Coronel",
  "Barrios",
  "Vera",
  "Godoy",
  "Cardozo",
  "Rearte",
  "Tapia",
  "Núñez",
  "Ibarra",
  "Fuentes",
  "Roldán",
];

const PLAN_WEIGHTS = [
  ["fibra-100", 40],
  ["fibra-300", 45],
  ["fibra-600-tv", 15],
] as const;

interface Person {
  id: string;
  name: string;
  planId: string;
  tier: Tier;
  address: Subscriber["address"];
}

const tierOf = (planId: string): Tier =>
  tenant.plans.find((plan) => plan.id === planId)?.tier ?? "base";

const STREETS = [
  "Los Álamos",
  "Rivadavia",
  "Belgrano",
  "San Martín",
  "Mitre",
  "Sarmiento",
  "Las Heras",
  "Alberdi",
];
const CITIES = [
  { city: "San Andrés del Río", postalCode: "B2740" },
  { city: "Villa Sarmiento", postalCode: "B2741" },
  { city: "Colonia El Alto", postalCode: "B2742" },
];

function syntheticPerson(index: number): Person {
  const planId = weightedPick(PLAN_WEIGHTS);
  const location = pick(CITIES);
  return {
    id: `sub-x${String(index).padStart(5, "0")}`,
    name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    planId,
    tier: tierOf(planId),
    address: {
      street: pick(STREETS),
      number: String(100 + Math.floor(rng() * 2900)),
      city: location.city,
      postalCode: location.postalCode,
    },
  };
}

const CONVERTED = 1450;

// Los abonados de prueba activos van primero, así sus pedidos y servicios
// aparecen de verdad en /mis-pedidos y /mis-servicios durante la demo.
const people: Person[] = [
  ...testSubscribers
    .filter((subscriber) => subscriber.status === "active")
    .map((subscriber) => ({
      id: subscriber.id,
      name: subscriber.name,
      planId: subscriber.planId,
      tier: tierOf(subscriber.planId),
      address: subscriber.address,
    })),
];
for (let i = people.length; i < CONVERTED; i += 1) people.push(syntheticPerson(i));

// ── Fechas ──────────────────────────────────────────────────────────────────

const dayMs = 24 * 60 * 60 * 1000;
const windowStart = new Date(TODAY.getTime() - WINDOW_DAYS * dayMs);

/**
 * Fecha dentro de la ventana, con más peso en fines de semana y a principio de
 * mes. Una distribución plana se ve sintética en el gráfico.
 */
function randomDate(): Date {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const offset = Math.floor(rng() * WINDOW_DAYS);
    const date = new Date(windowStart.getTime() + offset * dayMs);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const startOfMonth = date.getDate() <= 10;
    const weight = (weekend ? 1.55 : 1) * (startOfMonth ? 1.35 : 1);
    if (rng() < weight / 2.1) {
      date.setHours(9 + Math.floor(rng() * 13), Math.floor(rng() * 60), 0, 0);
      return date;
    }
  }
  return new Date(windowStart.getTime() + Math.floor(rng() * WINDOW_DAYS) * dayMs);
}

const isoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** Primer día del mes siguiente: cuándo empieza a facturarse un servicio. */
function nextInvoiceDate(from: Date): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1);
}

// ── Precio, replicado sin depender del bundle de Next ────────────────────────

const services = catalog.filter((item): item is ServiceItem => item.kind === "service");
const products = catalog.filter(
  (item): item is PhysicalProduct => item.kind === "product" && item.stock > 0,
);
const upgrades = services.filter((item) => item.category === "plan" && item.fromPlanId);
const plainServices = services.filter((item) => !(item.category === "plan" && item.fromPlanId));

interface Priced {
  publicPrice: number;
  finalPrice: number;
  label: string;
}

/**
 * Misma regla que `src/lib/pricing.ts`, sin promociones: los datos históricos no
 * arrastran promos vencidas. Se replica en vez de importarse porque el script
 * corre fuera del bundle de Next.
 */
function priceFor(item: CatalogItem, tier: Tier): Priced {
  const isProduct = item.kind === "product";
  const publicPrice = isProduct ? item.publicPrice : item.publicMonthlyPrice;
  const exclusive = isProduct ? item.exclusivePrice : item.exclusiveMonthlyPrice;
  const floor = isProduct ? item.supplierCost : item.providerMonthlyCost;

  if (!isProduct && item.includedInTiers.includes(tier)) {
    return { publicPrice, finalPrice: 0, label: "Incluido en tu plan" };
  }

  const candidates: Priced[] = [{ publicPrice, finalPrice: exclusive, label: "Precio cliente" }];
  if (tier === "premium") {
    candidates.push({
      publicPrice,
      finalPrice: Math.round(publicPrice * (1 - tenant.benefits.premiumDiscount)),
      label: "Plan premium",
    });
  }
  const viable = candidates.filter((candidate) => candidate.finalPrice >= floor);
  const pool =
    viable.length > 0
      ? viable
      : [{ publicPrice, finalPrice: publicPrice, label: "Precio de lista" }];
  return pool.reduce((best, candidate) =>
    candidate.finalPrice < best.finalPrice ? candidate : best,
  );
}

// ── Generación ──────────────────────────────────────────────────────────────

const orders: Order[] = [];
const subscriptions: Subscription[] = [];

const sequenceByYear = new Map<number, number>();
function nextOrderId(date: Date): string {
  const year = date.getFullYear();
  const next = (sequenceByYear.get(year) ?? 0) + 1;
  sequenceByYear.set(year, next);
  return `${tenant.orderPrefix}-${year}-${String(next).padStart(4, "0")}`;
}

const PHYSICAL_STATUS = [
  ["delivered", 70],
  ["shipped", 12],
  ["processing", 8],
  ["paid", 6],
  ["cancelled", 4],
] as const satisfies readonly (readonly [OrderStatus, number])[];

function subscriptionStatus(item: ServiceItem, startedAt: Date): SubscriptionStatus {
  if (rng() < 0.05) return "cancelled";
  const ageDays = (TODAY.getTime() - startedAt.getTime()) / dayMs;
  if (item.activation === "instant") return "active";
  if (item.activation === "next_invoice") return ageDays > 32 ? "active" : "pending_activation";
  return ageDays > 12 ? "active" : "scheduled_visit";
}

for (const person of people) {
  const orderCount = weightedPick([
    [1, 68],
    [2, 24],
    [3, 8],
  ] as const);

  // Como máximo un upgrade de plan por persona: no tiene sentido subir dos veces.
  const availableUpgrades = upgrades.filter((item) => item.fromPlanId === person.planId);
  let upgradeToPlace =
    availableUpgrades.length > 0 && rng() < 0.34 ? pick(availableUpgrades) : undefined;
  const upgradeOrderIndex = Math.floor(rng() * orderCount);

  for (let index = 0; index < orderCount; index += 1) {
    const createdAt = randomDate();
    const items: OrderItem[] = [];
    const serviceItems: ServiceItem[] = [];

    if (upgradeToPlace && index === upgradeOrderIndex) {
      serviceItems.push(upgradeToPlace);
      upgradeToPlace = undefined;
    }

    // El hardware es góndola secundaria: son 12 de 30 ítems y están más abajo en
    // la página. Que el 39% de los convertidos gaste $226.000 de una vez en 90
    // días no es creíble; que lo haga alrededor del 13% sí, y sigue siendo
    // generoso.
    const wantsPhysical = rng() < 0.12;
    if (wantsPhysical) {
      const product = pick(products);
      const quantity = rng() < 0.85 ? 1 : 2;
      const priced = priceFor(product, person.tier);
      items.push({
        itemId: product.id,
        itemName: product.name,
        kind: "product",
        period: "once",
        quantity,
        publicPrice: priced.publicPrice,
        finalPrice: priced.finalPrice,
        appliedLabel: priced.label,
      });
    }

    if (!wantsPhysical || rng() < 0.2) {
      // La hipótesis del piloto es 1,1 a 1,5 servicios por convertido; estos
      // pesos caen dentro de esa banda.
      const howMany = weightedPick([
        [1, 88],
        [2, 12],
      ] as const);
      const chosen = new Set<string>();
      for (let s = 0; s < howMany; s += 1) {
        const service = pick(plainServices);
        if (chosen.has(service.id)) continue;
        chosen.add(service.id);
        serviceItems.push(service);
      }
    }

    if (items.length === 0 && serviceItems.length === 0) continue;

    for (const service of serviceItems) {
      const priced = priceFor(service, person.tier);
      items.push({
        itemId: service.id,
        itemName: service.name,
        kind: "service",
        period: "monthly",
        quantity: 1,
        publicPrice: priced.publicPrice,
        finalPrice: priced.finalPrice,
        appliedLabel: priced.label,
      });
    }

    const hasPhysicalItems = items.some((item) => item.kind === "product");
    const status: OrderStatus = hasPhysicalItems
      ? weightedPick(PHYSICAL_STATUS)
      : rng() < 0.03
        ? "cancelled"
        : "paid";

    const oneOffSubtotal = items
      .filter((item) => item.period === "once")
      .reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    const monthlySubtotal = items
      .filter((item) => item.period === "monthly")
      .reduce((sum, item) => sum + item.finalPrice, 0);
    const shipping =
      hasPhysicalItems && oneOffSubtotal < tenant.benefits.freeShippingFrom ? 12000 : 0;

    const orderId = nextOrderId(createdAt);
    orders.push({
      id: orderId,
      subscriberId: person.id,
      subscriberName: person.name,
      createdAt: createdAt.toISOString(),
      status,
      items,
      hasPhysicalItems,
      oneOffSubtotal,
      monthlySubtotal,
      shipping,
      oneOffTotal: oneOffSubtotal + shipping,
      oneOffSavings: items
        .filter((item) => item.period === "once")
        .reduce((sum, item) => sum + (item.publicPrice - item.finalPrice) * item.quantity, 0),
      monthlySavings: items
        .filter((item) => item.period === "monthly")
        .reduce((sum, item) => sum + (item.publicPrice - item.finalPrice), 0),
      address: hasPhysicalItems ? person.address : null,
      paymentMethod: hasPhysicalItems
        ? weightedPick([
            ["invoice", 62],
            ["mercadopago", 26],
            ["card", 12],
          ] as const)
        : "invoice",
    });

    if (status === "cancelled") continue;

    for (const service of serviceItems) {
      const priced = priceFor(service, person.tier);
      const subStatus = subscriptionStatus(service, createdAt);
      const billedFrom = nextInvoiceDate(createdAt);
      subscriptions.push({
        id: `sus-${String(subscriptions.length + 1).padStart(5, "0")}`,
        subscriberId: person.id,
        itemId: service.id,
        itemName: service.name,
        orderId,
        status: subStatus,
        monthlyPrice: priced.finalPrice,
        publicMonthlyPrice: priced.publicPrice,
        appliedLabel: priced.label,
        startedAt: isoDate(createdAt),
        billedFrom: isoDate(billedFrom),
        commitmentUntil:
          service.commitmentMonths > 0
            ? isoDate(
                new Date(
                  createdAt.getFullYear(),
                  createdAt.getMonth() + service.commitmentMonths,
                  createdAt.getDate(),
                ),
              )
            : null,
        cancelledAt:
          subStatus === "cancelled" ? isoDate(new Date(createdAt.getTime() + 20 * dayMs)) : null,
      });
    }
  }
}

orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

// ── Métricas ────────────────────────────────────────────────────────────────

const itemById = new Map(catalog.map((item) => [item.id, item]));
const isUpgradeId = (id: string) => {
  const item = itemById.get(id);
  return item?.kind === "service" && item.category === "plan" && item.fromPlanId !== undefined;
};

/** Meses completos facturados de una suscripción dentro de una ventana. */
function monthsBilled(sub: Subscription, from: Date, to: Date): number {
  const start = new Date(Math.max(new Date(sub.billedFrom).getTime(), from.getTime()));
  const end = sub.cancelledAt
    ? new Date(Math.min(new Date(sub.cancelledAt).getTime(), to.getTime()))
    : to;
  if (end <= start) return 0;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (30 * dayMs)));
}

function buildPeriod(days: MetricsPeriodDays): MetricsPeriod {
  const from = new Date(TODAY.getTime() - days * dayMs);

  const inWindow = orders.filter(
    (order) => new Date(order.createdAt) >= from && order.status !== "cancelled",
  );
  const converted = new Set(inWindow.map((order) => order.subscriberId));
  const ordersBySubscriber = new Map<string, number>();
  for (const order of inWindow) {
    ordersBySubscriber.set(
      order.subscriberId,
      (ordersBySubscriber.get(order.subscriberId) ?? 0) + 1,
    );
  }

  const physicalOrders = inWindow.filter((order) => order.hasPhysicalItems);
  const oneOffGmv = inWindow.reduce((sum, order) => sum + order.oneOffTotal, 0);

  const liveSubs = subscriptions.filter(
    (sub) => sub.status !== "cancelled" && new Date(sub.startedAt) >= from,
  );
  const activeSubs = subscriptions.filter(
    (sub) => sub.status === "active" && new Date(sub.startedAt) >= from,
  );

  let serviceBilled = 0;
  let upgradeBilled = 0;
  for (const sub of subscriptions) {
    if (new Date(sub.startedAt) < from) continue;
    const billed = monthsBilled(sub, from, TODAY) * sub.monthlyPrice;
    if (isUpgradeId(sub.itemId)) upgradeBilled += billed;
    else serviceBilled += billed;
  }

  const gmv = oneOffGmv + serviceBilled + upgradeBilled;

  const serviceMrr = activeSubs
    .filter((sub) => !isUpgradeId(sub.itemId))
    .reduce((sum, sub) => sum + sub.monthlyPrice, 0);
  const upgradeMrr = activeSubs
    .filter((sub) => isUpgradeId(sub.itemId))
    .reduce((sum, sub) => sum + sub.monthlyPrice, 0);
  const mrr = serviceMrr + upgradeMrr;

  const share = tenant.revenueShare;
  const ispRevenue =
    oneOffGmv * share.products.isp +
    serviceBilled * share.services.isp +
    upgradeBilled * share.planUpgrades.isp;
  const platformRevenue =
    oneOffGmv * share.products.platform +
    serviceBilled * share.services.platform +
    upgradeBilled * share.planUpgrades.platform;

  const convertedCount = converted.size;
  // Visitas y validados no salen de las órdenes: son la parte del funnel que en
  // la Fase 0 no se mide. Se derivan de los convertidos con las tasas de la
  // hipótesis del piloto, para que las proporciones cierren en los tres períodos.
  const validated = Math.round(convertedCount * 2.4);
  const visits = Math.round(validated * 2);

  const repeatBuyers = [...ordersBySubscriber.values()].filter((count) => count >= 2).length;

  return {
    funnel: {
      subscribers: tenant.subscribers,
      visits,
      validated,
      converted: convertedCount,
      transactions: inWindow.length,
      gmv: Math.round(gmv),
      ispRevenue: Math.round(ispRevenue),
    },
    recurring: {
      activeSubscriptions: activeSubs.length,
      mrr: Math.round(mrr),
      ispRecurringRevenue: Math.round(
        serviceMrr * share.services.isp + upgradeMrr * share.planUpgrades.isp,
      ),
      incrementalArpu: Math.round(mrr / tenant.subscribers),
      planUpgrades: activeSubs.filter((sub) => isUpgradeId(sub.itemId)).length,
    },
    averageTicket:
      physicalOrders.length > 0
        ? Math.round(
            physicalOrders.reduce((sum, o) => sum + o.oneOffTotal, 0) / physicalOrders.length,
          )
        : 0,
    repeatRate: convertedCount > 0 ? repeatBuyers / convertedCount : 0,
    savingsGenerated: {
      oneOff: Math.round(inWindow.reduce((sum, order) => sum + order.oneOffSavings, 0)),
      monthly: Math.round(
        liveSubs.reduce((sum, sub) => sum + (sub.publicMonthlyPrice - sub.monthlyPrice), 0),
      ),
    },
    platformRevenue: Math.round(platformRevenue),
    gmvPerThousandSubscribers: Math.round((gmv / tenant.subscribers) * 1000),
  };
}

// Serie mensual de los últimos seis meses. El MRR es acumulado: mide lo que
// factura la base al cierre de cada mes, no lo que se dio de alta ese mes.
const monthlySeries: MonthlyPoint[] = [];
for (let back = 5; back >= 0; back -= 1) {
  const monthDate = new Date(TODAY.getFullYear(), TODAY.getMonth() - back, 1);
  const key = monthKey(monthDate);
  const monthEnd = new Date(TODAY.getFullYear(), TODAY.getMonth() - back + 1, 1);

  const monthOrders = orders.filter(
    (order) => monthKey(new Date(order.createdAt)) === key && order.status !== "cancelled",
  );
  const liveAtMonthEnd = subscriptions.filter(
    (sub) => sub.status === "active" && new Date(sub.startedAt) < monthEnd,
  );

  monthlySeries.push({
    month: key,
    gmv: Math.round(monthOrders.reduce((sum, order) => sum + order.oneOffTotal, 0)),
    mrr: Math.round(liveAtMonthEnd.reduce((sum, sub) => sum + sub.monthlyPrice, 0)),
    transactions: monthOrders.length,
  });
}

// Top de ítems y ventas por categoría, sobre la ventana completa.
const gmvByItem = new Map<string, { units: number; gmv: number }>();
for (const order of orders) {
  if (order.status === "cancelled") continue;
  for (const item of order.items) {
    const acc = gmvByItem.get(item.itemId) ?? { units: 0, gmv: 0 };
    acc.units += item.quantity;
    acc.gmv += item.finalPrice * item.quantity;
    gmvByItem.set(item.itemId, acc);
  }
}

const topItems = [...gmvByItem.entries()]
  .map(([itemId, acc]) => {
    const item = itemById.get(itemId);
    return {
      itemId,
      name: item?.name ?? itemId,
      kind: item?.kind ?? ("product" as const),
      units: acc.units,
      gmv: Math.round(acc.gmv),
    };
  })
  .sort((a, b) => b.gmv - a.gmv)
  .slice(0, 8);

const gmvByCategory = new Map<string, number>();
for (const [itemId, acc] of gmvByItem) {
  const item = itemById.get(itemId);
  if (!item) continue;
  gmvByCategory.set(item.category, (gmvByCategory.get(item.category) ?? 0) + acc.gmv);
}

// Corte recurrente: qué categorías dejan ingreso que vuelve todos los meses. El
// corte de GMV está dominado por el hardware por construcción, porque un
// televisor pesa como veintiocho meses de un servicio.
const mrrByCategory = new Map<string, number>();
for (const sub of subscriptions) {
  if (sub.status !== "active") continue;
  const item = itemById.get(sub.itemId);
  if (!item) continue;
  mrrByCategory.set(item.category, (mrrByCategory.get(item.category) ?? 0) + sub.monthlyPrice);
}

const totalCategoryGmv = [...gmvByCategory.values()].reduce((sum, value) => sum + value, 0);
const totalCategoryMrr = [...mrrByCategory.values()].reduce((sum, value) => sum + value, 0);

const categorySales = [...new Set([...gmvByCategory.keys(), ...mrrByCategory.keys()])]
  .map((category) => {
    const gmv = gmvByCategory.get(category) ?? 0;
    const mrr = mrrByCategory.get(category) ?? 0;
    return {
      category: category as Metrics["categorySales"][number]["category"],
      gmv: Math.round(gmv),
      share: totalCategoryGmv > 0 ? gmv / totalCategoryGmv : 0,
      mrr: Math.round(mrr),
      mrrShare: totalCategoryMrr > 0 ? mrr / totalCategoryMrr : 0,
    };
  })
  .sort((a, b) => b.gmv - a.gmv);

const metrics: Metrics = {
  generatedAt: TODAY.toISOString(),
  periods: { 30: buildPeriod(30), 60: buildPeriod(60), 90: buildPeriod(90) },
  monthlySeries,
  topItems,
  categorySales,
};

// ── Validación de invariantes ───────────────────────────────────────────────

const problems: string[] = [];
const check = (condition: boolean, message: string) => {
  if (!condition) problems.push(message);
};

for (const days of [30, 60, 90] as MetricsPeriodDays[]) {
  const period = metrics.periods[days];
  const f = period.funnel;
  const label = `[${days}d]`;
  check(
    f.converted <= f.validated,
    `${label} convertidos (${f.converted}) > validados (${f.validated})`,
  );
  check(f.validated <= f.visits, `${label} validados (${f.validated}) > visitas (${f.visits})`);
  check(f.visits <= f.subscribers, `${label} visitas (${f.visits}) > abonados (${f.subscribers})`);
  check(
    f.transactions >= f.converted,
    `${label} transacciones (${f.transactions}) < convertidos (${f.converted})`,
  );
  check(f.gmv > 0, `${label} GMV en cero`);
  check(period.recurring.mrr > 0, `${label} MRR en cero`);
  check(
    period.repeatRate >= 0 && period.repeatRate <= 1,
    `${label} tasa de recompra fuera de rango`,
  );
}

const ticket90 = metrics.periods[90].averageTicket;
check(
  ticket90 >= 150000 && ticket90 <= 300000,
  `ticket promedio de producto físico fuera de rango: ${ticket90}`,
);

const activeSubscriberIds = new Set(subscriptions.map((sub) => sub.subscriberId));
const orderSubscriberIds = new Set(orders.map((order) => order.subscriberId));
for (const id of activeSubscriberIds) {
  check(orderSubscriberIds.has(id), `la suscripción de ${id} no tiene orden que la origine`);
}

const orderIds = new Set(orders.map((order) => order.id));
check(orderIds.size === orders.length, "hay números de pedido repetidos");

if (problems.length > 0) {
  console.error("\n✗ Los datos generados no cumplen los invariantes:\n");
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exit(1);
}

// ── Escritura ───────────────────────────────────────────────────────────────

mkdirSync(TENANT_DIR, { recursive: true });
writeFileSync(resolve(TENANT_DIR, "orders.json"), `${JSON.stringify(orders, null, 2)}\n`);
writeFileSync(
  resolve(TENANT_DIR, "subscriptions.json"),
  `${JSON.stringify(subscriptions, null, 2)}\n`,
);
writeFileSync(resolve(TENANT_DIR, "metrics.json"), `${JSON.stringify(metrics, null, 2)}\n`);

const p90 = metrics.periods[90];
const fmt = (value: number) => value.toLocaleString("es-AR");

console.log(`
✓ Datos generados para ${tenant.name} (seed fija, resultado determinístico)

  Órdenes                    ${fmt(orders.length)}
  Suscripciones              ${fmt(subscriptions.length)}

  Funnel 90 días
    Abonados                 ${fmt(p90.funnel.subscribers)}
    Visitas                  ${fmt(p90.funnel.visits)}  (${((p90.funnel.visits / p90.funnel.subscribers) * 100).toFixed(1)}%)
    Validados                ${fmt(p90.funnel.validated)}  (${((p90.funnel.validated / p90.funnel.subscribers) * 100).toFixed(1)}%)
    Convertidos              ${fmt(p90.funnel.converted)}  (${((p90.funnel.converted / p90.funnel.subscribers) * 100).toFixed(1)}%)
    Transacciones            ${fmt(p90.funnel.transactions)}
    GMV                      $ ${fmt(p90.funnel.gmv)}
    Ingreso ISP              $ ${fmt(p90.funnel.ispRevenue)}
    Ingreso plataforma       $ ${fmt(p90.platformRevenue)}

  Recurrente
    Servicios activos        ${fmt(p90.recurring.activeSubscriptions)}
    Upgrades de plan         ${fmt(p90.recurring.planUpgrades)}
    MRR                      $ ${fmt(p90.recurring.mrr)} por mes
    Ingreso ISP recurrente   $ ${fmt(p90.recurring.ispRecurringRevenue)} por mes
    ARPU incremental         $ ${fmt(p90.recurring.incrementalArpu)} por abonado por mes

  Ticket promedio físico     $ ${fmt(p90.averageTicket)}
  Tasa de recompra           ${(p90.repeatRate * 100).toFixed(1)}%
  Ahorro generado            $ ${fmt(p90.savingsGenerated.oneOff)} único · $ ${fmt(p90.savingsGenerated.monthly)} por mes
`);
