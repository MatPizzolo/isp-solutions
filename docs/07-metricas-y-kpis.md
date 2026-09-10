# Métricas y KPIs

Este documento es la **única definición** del funnel y de las métricas del
proyecto. Lo usan el guion de la demo, `/admin/dashboard`, `/admin/reportes` y el
generador de `metrics.json`. Si una cifra aparece en dos lugares, sale de acá.

## Funnel oficial

```
abonados  ──▶  visitas  ──▶  validados  ──▶  compradores  ──▶  órdenes  ──▶  GMV  ──▶  ingreso ISP
```

Se dice **validados**, no "registrados": el abonado no crea una cuenta, valida su
DNI o número de cliente. La diferencia no es cosmética — es el argumento de por
qué la fricción es tan baja.

| Etapa | Definición exacta |
|---|---|
| **Abonados** | Total de abonados del ISP en el período. Es la base del funnel y el denominador de todo lo demás |
| **Visitas** | Abonados únicos que abrieron la tienda al menos una vez en el período |
| **Validados** | Visitantes que ingresaron un DNI o número de cliente con resultado `active`. Un intento fallido o una cuenta suspendida no cuentan como validado |
| **Compradores** | Validados con al menos una orden no cancelada en el período |
| **Órdenes** | Órdenes no canceladas creadas en el período |
| **GMV** | Suma del total de las órdenes no canceladas del período, a precio final pagado por el abonado |
| **Ingreso ISP** | `GMV × revenueShare.isp` |

Entre etapa y etapa se muestra el porcentaje de conversión respecto de la etapa
anterior, no respecto del total.

### Invariantes

El generador de datos mock los valida y el dashboard no puede contradecirlos:

```
compradores ≤ validados ≤ visitas ≤ abonados
órdenes     ≥ compradores
GMV         = Σ total de órdenes no canceladas
```

## Métricas derivadas

| Métrica | Fórmula | Dónde aparece |
|---|---|---|
| **Ticket promedio** | GMV / órdenes no canceladas | Tile del dashboard, reporte |
| **Tasa de recompra** | Compradores con 2 o más órdenes / compradores | Tile del dashboard |
| **Ahorro generado** | `Σ (publicPrice − precioFinal) × cantidad` sobre las órdenes no canceladas | Tile del dashboard, reporte, carrito |
| **Ingreso ISP** | `GMV × revenueShare.isp` | Funnel, tile, reporte |
| **Ingreso plataforma** | `GMV × revenueShare.platform` | Reporte |
| **GMV por cada 1.000 abonados** | `GMV / abonados × 1.000` | Reporte — **métrica guía** |
| **Órdenes por comprador** | Órdenes no canceladas / compradores | Reporte |

El **ahorro generado** es la métrica que le sirve al ISP para contarle al abonado
por qué le conviene el servicio. No es una métrica financiera, es un argumento de
retención, y por eso aparece igual de grande que el GMV.

### Por qué la métrica guía es GMV por cada 1.000 abonados

El GMV absoluto premia al ISP grande y no dice nada sobre si la plataforma
funciona. Normalizar por base de abonados permite comparar un ISP de 8.000
abonados con uno de 60.000, y es el número que se usa para proyectar cuánto vale
sumar un ISP nuevo a la red.

## Series y cortes

- **GMV mensual**, últimos 6 meses.
- **Órdenes mensuales**, últimos 6 meses, sobre el mismo eje temporal.
- **Top 8 productos** por GMV, con unidades vendidas.
- **Ventas por categoría**, en GMV y en porcentaje.
- **Selector de período** en el dashboard: 30, 60 o 90 días. Todas las cifras del
  funnel y los tiles responden al período seleccionado.

## Hipótesis del piloto

> **Supuestos a validar, no proyecciones.** Son el punto de partida para calibrar
> el piloto de la Fase 1; el objetivo del piloto es justamente reemplazarlos por
> datos.

| Métrica | Hipótesis | Sobre qué |
|---|---|---|
| Visitas | 10% a 20% | de los abonados, en 90 días |
| Validados | 5% a 10% | de los abonados, en 90 días |
| Compradores | 2% a 5% | de los abonados, en 90 días |
| Ticket promedio | $200.000 a $400.000 | por orden |

La banda es ancha a propósito. La conversión de un canal de este tipo depende
sobre todo de cuánto lo promocione el ISP y por qué medio, y eso todavía no se
midió con nadie.

## Qué NO se mide en la Fase 0

En la demo no hay analítica: no se registran visitas, no hay eventos, no hay
tracking. Las cifras de `metrics.json` están generadas para ser coherentes con
estas definiciones, no medidas. La instrumentación real es parte de la Fase 1.
