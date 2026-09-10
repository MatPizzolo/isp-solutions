import ordersData from "@/tenants/zonda/orders.json";
import subscriptionsData from "@/tenants/zonda/subscriptions.json";
import type {
  Address,
  CatalogItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PriceQuote,
  ServiceItem,
  Session,
  Subscription,
  SubscriptionStatus,
  Tenant,
} from "@/types";

const MOCK_ORDERS = ordersData as Order[];
const MOCK_SUBSCRIPTIONS = subscriptionsData as Subscription[];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente de pago",
  paid: "Confirmado",
  processing: "Preparando",
  shipped: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

/**
 * La timeline de entrega. `pending` no aparece —el checkout de la demo crea
 * `paid`— y `cancelled` se muestra fuera de la línea, no dentro.
 */
export const DELIVERY_TIMELINE: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  pending_activation: "Se activa con tu próxima factura",
  scheduled_visit: "Coordinamos la visita técnica",
  active: "Activo",
  cancelled: "Dado de baja",
};

export function getMockOrders(): Order[] {
  return MOCK_ORDERS;
}

export function getMockSubscriptions(): Subscription[] {
  return MOCK_SUBSCRIPTIONS;
}

/** Solo las suscripciones que facturan. Son las que suman al MRR. */
export function getBillingSubscriptions(subs: readonly Subscription[]): Subscription[] {
  return subs.filter((sub) => sub.status === "active");
}

/**
 * Próximo número de pedido: `{prefijo}-{año}-{4 dígitos}`.
 *
 * La secuencia sale del máximo existente para ese año, no de un contador
 * separado, así una orden creada en la demo nunca pisa el id de una mock.
 */
export function nextOrderId(tenant: Tenant, existing: readonly Order[], now: Date): string {
  const year = now.getFullYear();
  const prefix = `${tenant.orderPrefix}-${year}-`;
  let max = 0;
  for (const order of existing) {
    if (!order.id.startsWith(prefix)) continue;
    const sequence = Number(order.id.slice(prefix.length));
    if (Number.isFinite(sequence) && sequence > max) max = sequence;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export interface CartLine {
  item: CatalogItem;
  quantity: number;
  quote: PriceQuote;
}

/**
 * Arma la orden. Pura: recibe el id, la fecha y las cotizaciones ya calculadas.
 *
 * PUNTO DE CORTE FASE 1 — en producción esto persiste contra la base de datos, y
 * solo si hay ítems físicos hace falta la pasarela de pagos.
 */
export function buildOrder(params: {
  id: string;
  session: Session;
  lines: readonly CartLine[];
  address: Address | null;
  paymentMethod: PaymentMethod;
  tenant: Tenant;
  now: Date;
}): Order {
  const { id, session, lines, address, paymentMethod, tenant, now } = params;

  const items: OrderItem[] = lines.map((line) => ({
    itemId: line.item.id,
    itemName: line.item.name,
    kind: line.item.kind,
    period: line.quote.period,
    quantity: line.item.kind === "service" ? 1 : line.quantity,
    publicPrice: line.quote.publicPrice,
    finalPrice: line.quote.finalPrice,
    appliedLabel: line.quote.appliedLabel,
  }));

  const hasPhysicalItems = items.some((item) => item.kind === "product");

  const sumOnce = (fn: (item: OrderItem) => number) =>
    items.filter((item) => item.period === "once").reduce((sum, item) => sum + fn(item), 0);
  const sumMonthly = (fn: (item: OrderItem) => number) =>
    items.filter((item) => item.period === "monthly").reduce((sum, item) => sum + fn(item), 0);

  const oneOffSubtotal = sumOnce((item) => item.finalPrice * item.quantity);
  const shipping =
    hasPhysicalItems && oneOffSubtotal < tenant.benefits.freeShippingFrom ? SHIPPING_COST : 0;

  return {
    id,
    subscriberId: session.subscriberId,
    subscriberName: session.name,
    createdAt: now.toISOString(),
    status: "paid",
    items,
    hasPhysicalItems,
    oneOffSubtotal,
    // Nunca se suma al de arriba: son magnitudes distintas.
    monthlySubtotal: sumMonthly((item) => item.finalPrice),
    shipping,
    oneOffTotal: oneOffSubtotal + shipping,
    oneOffSavings: sumOnce((item) => (item.publicPrice - item.finalPrice) * item.quantity),
    monthlySavings: sumMonthly((item) => item.publicPrice - item.finalPrice),
    address: hasPhysicalItems ? address : null,
    paymentMethod,
  };
}

export const SHIPPING_COST = 12000;

function statusForActivation(item: ServiceItem): SubscriptionStatus {
  if (item.activation === "instant") return "active";
  if (item.activation === "next_invoice") return "pending_activation";
  return "scheduled_visit";
}

const isoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Primer día del mes siguiente: desde cuándo se cobra el servicio. */
export function nextInvoiceDate(from: Date): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1);
}

/**
 * Suscripciones que genera una orden, una por ítem de servicio.
 *
 * PUNTO DE CORTE FASE 1 — acá es donde se da de alta el concepto en el sistema
 * de facturación del ISP. Es el corte más importante del encuadre de servicios y
 * es más simple que integrar una pasarela: se agrega un ítem a una factura que
 * el operador ya emite. Ver docs/08-integracion-con-isps.md.
 */
export function buildSubscriptions(params: {
  order: Order;
  lines: readonly CartLine[];
  now: Date;
  startIndex: number;
}): Subscription[] {
  const { order, lines, now, startIndex } = params;

  return lines
    .filter((line): line is CartLine & { item: ServiceItem } => line.item.kind === "service")
    .map((line, index) => {
      const item = line.item;
      return {
        id: `sus-demo-${String(startIndex + index + 1).padStart(5, "0")}`,
        subscriberId: order.subscriberId,
        itemId: item.id,
        itemName: item.name,
        orderId: order.id,
        status: statusForActivation(item),
        monthlyPrice: line.quote.finalPrice,
        publicMonthlyPrice: line.quote.publicPrice,
        appliedLabel: line.quote.appliedLabel,
        startedAt: isoDate(now),
        billedFrom: isoDate(nextInvoiceDate(now)),
        commitmentUntil:
          item.commitmentMonths > 0
            ? isoDate(
                new Date(now.getFullYear(), now.getMonth() + item.commitmentMonths, now.getDate()),
              )
            : null,
        cancelledAt: null,
      };
    });
}

/** Siguiente estado de la timeline. Lo usa el botón "Avanzar estado" del modo demo. */
export function advanceStatus(status: OrderStatus): OrderStatus {
  const index = DELIVERY_TIMELINE.indexOf(status);
  if (index === -1 || index === DELIVERY_TIMELINE.length - 1) return status;
  return DELIVERY_TIMELINE[index + 1]!;
}

export function ordersOf(orders: readonly Order[], subscriberId: string): Order[] {
  return orders
    .filter((order) => order.subscriberId === subscriberId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function subscriptionsOf(
  subscriptions: readonly Subscription[],
  subscriberId: string,
): Subscription[] {
  return subscriptions
    .filter((sub) => sub.subscriberId === subscriberId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** Lo que el abonado suma por mes a su factura. Los incluidos en el plan van en cero. */
export function monthlyTotalOf(subscriptions: readonly Subscription[]): number {
  return subscriptions
    .filter((sub) => sub.status !== "cancelled")
    .reduce((sum, sub) => sum + sub.monthlyPrice, 0);
}
