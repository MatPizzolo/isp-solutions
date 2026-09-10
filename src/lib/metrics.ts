import metricsData from "@/tenants/zonda/metrics.json";
import type { Funnel, Metrics, MetricsPeriod, MetricsPeriodDays } from "@/types";

const METRICS = metricsData as Metrics;

export const PERIOD_OPTIONS: MetricsPeriodDays[] = [30, 60, 90];

export function getMetrics(): Metrics {
  return METRICS;
}

export function getPeriod(days: MetricsPeriodDays): MetricsPeriod {
  return METRICS.periods[days];
}

export interface FunnelStage {
  key: keyof Pick<Funnel, "subscribers" | "visits" | "validated" | "converted" | "transactions">;
  label: string;
  value: number;
  /** Conversión respecto de la etapa anterior, no del total. */
  conversionFromPrevious: number | null;
  /** Proporción respecto de la base de abonados, para el ancho de la barra. */
  shareOfBase: number;
  hint: string;
}

/**
 * El funnel como lista de etapas, listo para dibujar.
 *
 * Se dice "validados" y no "registrados" porque el abonado no crea una cuenta, y
 * "convertidos" y no "compradores" porque la mayoría de las conversiones son
 * altas de servicio recurrente. Las dos distinciones son el argumento, no
 * vocabulario.
 */
export function toFunnelStages(funnel: Funnel): FunnelStage[] {
  const raw: { key: FunnelStage["key"]; label: string; value: number; hint: string }[] = [
    {
      key: "subscribers",
      label: "Abonados",
      value: funnel.subscribers,
      hint: "La base del ISP en el período.",
    },
    {
      key: "visits",
      label: "Visitas",
      value: funnel.visits,
      hint: "Abonados únicos que abrieron la tienda.",
    },
    {
      key: "validated",
      label: "Validados",
      value: funnel.validated,
      hint: "Ingresaron su DNI y la cuenta estaba activa. No crean una cuenta: validan.",
    },
    {
      key: "converted",
      label: "Convertidos",
      value: funnel.converted,
      hint: "Sumaron al menos un servicio o hicieron una compra.",
    },
    {
      key: "transactions",
      label: "Transacciones",
      value: funnel.transactions,
      hint: "Órdenes y altas de servicio del período.",
    },
  ];

  return raw.map((stage, index) => {
    const previous = index > 0 ? raw[index - 1] : undefined;
    return {
      ...stage,
      conversionFromPrevious: previous && previous.value > 0 ? stage.value / previous.value : null,
      shareOfBase: funnel.subscribers > 0 ? stage.value / funnel.subscribers : 0,
    };
  });
}

/**
 * El ingreso del ISP es la suma de tres tramos con repartos distintos, no un
 * porcentaje del GMV. Ver ADR-029. Esta función existe para que nadie caiga en
 * la tentación de multiplicar.
 */
export function ispRevenueOf(period: MetricsPeriod): {
  inPeriod: number;
  recurringMonthly: number;
  annualisedRecurring: number;
} {
  return {
    inPeriod: period.funnel.ispRevenue,
    recurringMonthly: period.recurring.ispRecurringRevenue,
    annualisedRecurring: period.recurring.ispRecurringRevenue * 12,
  };
}

/** Categorías ordenadas por ingreso recurrente, que es la vista del negocio. */
export function categoriesByMrr(metrics: Metrics = METRICS) {
  return [...metrics.categorySales].sort((a, b) => b.mrr - a.mrr);
}

/** Categorías ordenadas por GMV. El hardware domina esta vista por construcción. */
export function categoriesByGmv(metrics: Metrics = METRICS) {
  return [...metrics.categorySales].sort((a, b) => b.gmv - a.gmv);
}
