/**
 * Tipos del proyecto. Ver docs/03-modelo-de-datos.md.
 *
 * Este archivo no importa nada: lo consumen tanto la app como los scripts que
 * corren fuera de Next (`scripts/generate-mock-data.ts`).
 */

// ── Tenant ──────────────────────────────────────────────────────────────────

/** Los tres presets de src/lib/fonts.ts. Se declara acá para que este archivo
 *  no dependa de `next/font`, que no existe fuera del bundle de Next. */
export type FontPresetId = "sora-plex" | "manrope-inter" | "outfit-source";

export type Tier = "base" | "premium";

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  accent: string;
  accentHover: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  danger: string;
}

export interface Theme {
  colors: ThemeColors;
  fontPreset: FontPresetId;
  /** Radio base, con unidad. Ej.: "10px". */
  radius: string;
  radiusSm: string;
}

export interface Plan {
  id: string;
  name: string;
  speedMbps: number;
  tier: Tier;
}

export interface Benefits {
  /** Fracción, no porcentaje. 0.12 = 12%. */
  premiumDiscount: number;
  /** Envío gratis desde este subtotal de ítems físicos. */
  freeShippingFrom: number;
  installmentsWithoutInterest: number;
}

export interface RevenueSplit {
  isp: number;
  platform: number;
}

/**
 * Un porcentaje único no sirve: las tres economías son distintas. En
 * `planUpgrades` la plataforma va en cero porque el proveedor es el propio ISP.
 * Ver ADR-029.
 */
export interface RevenueShare {
  products: RevenueSplit;
  services: RevenueSplit;
  planUpgrades: RevenueSplit;
}

export interface Identification {
  primaryField: "dni";
  alternativeField: "customerNumber";
  label: string;
}

export interface StoreCopy {
  heroTitle: string;
  heroSubtitle: string;
  /** Exactamente tres pasos. */
  howItWorks: string[];
}

export interface Tenant {
  id: string;
  /** Nombre de la plataforma, no del ISP. Va una vez, en chico, en el footer. */
  platformName: string;
  name: string;
  /** Prefijo del número de pedido. Nunca hardcodeado en un componente. */
  orderPrefix: string;
  legalName: string;
  tagline: string;
  city: string;
  province: string;
  subscribers: number;
  /** Sin protocolo. De acá sale también el usuario del admin (ADR-019). */
  website: string;
  supportWhatsapp: string;
  supportEmail: string;
  logo: string;
  logoDark: string;
  theme: Theme;
  identification: Identification;
  plans: Plan[];
  benefits: Benefits;
  revenueShare: RevenueShare;
  storeCopy: StoreCopy;
}

// ── Catálogo ────────────────────────────────────────────────────────────────

export type ServiceCategoryId = "tv" | "celular" | "gaming" | "seguridad-digital" | "plan";

export type ProductCategoryId =
  "conectividad" | "seguridad" | "entretenimiento" | "tecnologia" | "hogar";

export type CategoryId = ServiceCategoryId | ProductCategoryId;

export interface Spec {
  label: string;
  value: string;
}

interface CatalogItemBase {
  id: string;
  slug: string;
  sku: string;
  name: string;
  /** Ficticia. Ninguna marca real. */
  brand: string;
  shortDescription: string;
  description: string;
  featured: boolean;
  active: boolean;
  /** `null` en Fase 0: se usa ProductPlaceholder. */
  image: string | null;
  specs: Spec[];
  tags: string[];
}

export interface PhysicalProduct extends CatalogItemBase {
  kind: "product";
  category: ProductCategoryId;
  publicPrice: number;
  exclusivePrice: number;
  /** Piso duro de precio. */
  supplierCost: number;
  /** 0 = sin stock. */
  stock: number;
  installmentsEligible: boolean;
}

/** Cuándo empieza a funcionar un servicio recién contratado. */
export type ServiceActivation = "instant" | "next_invoice" | "technician";

export interface ServiceItem extends CatalogItemBase {
  kind: "service";
  category: ServiceCategoryId;
  publicMonthlyPrice: number;
  exclusiveMonthlyPrice: number;
  /** Piso duro de precio. Cero en los upgrades de plan: no hay mercadería. */
  providerMonthlyCost: number;
  /** Tiers que ya lo tienen sin cargo. */
  includedInTiers: Tier[];
  /** 0 = sin permanencia. */
  commitmentMonths: number;
  activation: ServiceActivation;
  /** Solo categoría `plan`: desde y hacia qué plan lleva el upgrade. */
  fromPlanId?: string;
  toPlanId?: string;
}

export type CatalogItem = PhysicalProduct | ServiceItem;

// ── Abonados ────────────────────────────────────────────────────────────────

/** Estado del abonado en el sistema del ISP. No incluye `not_found`. */
export type SubscriberStatus = "active" | "suspended" | "inactive";

export interface Address {
  street: string;
  number: string;
  city: string;
  postalCode: string;
}

/**
 * Modelo **normalizado**. En producción, el trabajo de un conector es producir
 * exactamente esta forma a partir del export de cada ISP. Ver ADR-033.
 */
export interface Subscriber {
  id: string;
  /** Solo dígitos. */
  dni: string;
  /** Solo dígitos. */
  customerNumber: string;
  name: string;
  planId: string;
  status: SubscriberStatus;
  email: string;
  phone: string;
  /** ISO date. */
  customerSince: string;
  address: Address;
}

/**
 * Resultado de `checkSubscriber()`. `not_found` es un resultado de la búsqueda,
 * no un estado de abonado: por eso no existe en `SubscriberStatus`.
 */
export type EligibilityResult =
  | { result: "active"; subscriber: Subscriber; plan: Plan; tier: Tier }
  | { result: "suspended"; subscriber: Subscriber }
  | { result: "inactive"; subscriber: Subscriber }
  | { result: "not_found" };

// ── Sesión ──────────────────────────────────────────────────────────────────

export interface Session {
  subscriberId: string;
  name: string;
  planId: string;
  tier: Tier;
  /** Epoch ms. Vence a las 24 h. */
  validatedAt: number;
}

// ── Precio ──────────────────────────────────────────────────────────────────

export type PricePeriod = "once" | "monthly";

export interface PriceQuote {
  period: PricePeriod;
  publicPrice: number;
  finalPrice: number;
  savings: number;
  /** Fracción, no porcentaje. */
  savingsPercent: number;
  installments: { count: number; amount: number } | null;
  appliedLabel: string;
  isExclusive: boolean;
  isIncludedInPlan: boolean;
}

// ── Promociones ─────────────────────────────────────────────────────────────

export type PromotionType = "banner" | "tier_discount" | "category_discount";

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  discount?: number;
  category?: CategoryId;
  tier?: Tier;
  bannerTitle?: string;
  bannerSubtitle?: string;
  /** ISO date. */
  startsAt: string;
  endsAt: string;
  active: boolean;
}

/** Derivado de las fechas y de `active`. No se guarda. */
export type PromotionStatus = "vigente" | "programada" | "vencida";

// ── Órdenes y suscripciones ─────────────────────────────────────────────────

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export type PaymentMethod = "invoice" | "mercadopago" | "card";

export interface OrderItem {
  itemId: string;
  itemName: string;
  kind: CatalogItem["kind"];
  period: PricePeriod;
  /** Siempre 1 en servicios. */
  quantity: number;
  /** Congelado al momento de la compra. */
  publicPrice: number;
  finalPrice: number;
  appliedLabel: string;
}

export interface Order {
  /** `{tenant.orderPrefix}-{año}-{4 dígitos}`. */
  id: string;
  subscriberId: string;
  subscriberName: string;
  /** ISO datetime. */
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  hasPhysicalItems: boolean;
  oneOffSubtotal: number;
  /** NO se suma a `oneOffSubtotal`: son magnitudes distintas. */
  monthlySubtotal: number;
  shipping: number;
  oneOffTotal: number;
  oneOffSavings: number;
  monthlySavings: number;
  /** `null` si la orden es solo de servicios. */
  address: Address | null;
  paymentMethod: PaymentMethod;
}

export type SubscriptionStatus = "pending_activation" | "scheduled_visit" | "active" | "cancelled";

export interface Subscription {
  id: string;
  subscriberId: string;
  itemId: string;
  itemName: string;
  orderId: string;
  status: SubscriptionStatus;
  /** 0 si vino incluida en el plan. */
  monthlyPrice: number;
  publicMonthlyPrice: number;
  appliedLabel: string;
  /** ISO date. */
  startedAt: string;
  /** Desde qué factura se cobra. ISO date. */
  billedFrom: string;
  commitmentUntil: string | null;
  cancelledAt: string | null;
}

// ── Métricas ────────────────────────────────────────────────────────────────

export type MetricsPeriodDays = 30 | 60 | 90;

export interface Funnel {
  subscribers: number;
  visits: number;
  validated: number;
  /** Abonados con al menos un alta o compra. No se dice "compradores". */
  converted: number;
  transactions: number;
  gmv: number;
  ispRevenue: number;
}

export interface RecurringMetrics {
  activeSubscriptions: number;
  /** Al cierre del período. */
  mrr: number;
  ispRecurringRevenue: number;
  /** `mrr / subscribers`. Sobre toda la base, no sobre los convertidos. */
  incrementalArpu: number;
  planUpgrades: number;
}

export interface MetricsPeriod {
  funnel: Funnel;
  recurring: RecurringMetrics;
  /** Solo órdenes con ítems físicos. */
  averageTicket: number;
  repeatRate: number;
  savingsGenerated: { oneOff: number; monthly: number };
  platformRevenue: number;
  gmvPerThousandSubscribers: number;
}

export interface MonthlyPoint {
  /** `YYYY-MM`. */
  month: string;
  gmv: number;
  mrr: number;
  transactions: number;
}

export interface TopItem {
  itemId: string;
  name: string;
  kind: CatalogItem["kind"];
  units: number;
  gmv: number;
}

/**
 * Dos cortes por categoría, porque miden cosas distintas y uno solo engaña.
 *
 * En GMV un televisor de $520.000 pesa como veintiocho meses de un servicio de
 * $9.900, así que el hardware domina el gráfico por construcción. El corte de
 * `mrr` muestra qué categorías dejan ingreso que vuelve todos los meses, que es
 * el negocio. El dashboard lleva el recurrente adelante y el GMV como apoyo.
 */
export interface CategorySales {
  category: CategoryId;
  gmv: number;
  share: number;
  mrr: number;
  mrrShare: number;
}

export interface Metrics {
  generatedAt: string;
  periods: Record<MetricsPeriodDays, MetricsPeriod>;
  monthlySeries: MonthlyPoint[];
  topItems: TopItem[];
  categorySales: CategorySales[];
}
