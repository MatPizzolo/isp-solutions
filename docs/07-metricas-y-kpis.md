# Métricas y KPIs

Este documento es la **única definición** del funnel y de las métricas del
proyecto. Lo usan el guion de la demo, `/admin/dashboard`, `/admin/reportes` y el
generador de `metrics.json`. Si una cifra aparece en dos lugares, sale de acá.

## Funnel oficial

```
abonados ──▶ visitas ──▶ validados ──▶ convertidos ──▶ transacciones ──┬──▶ GMV del período
                                                                       │
                                                                       └──▶ MRR al cierre
```

Se dice **validados**, no "registrados": el abonado no crea una cuenta, valida su
DNI o número de cliente. La diferencia no es cosmética — es el argumento de por
qué la fricción es tan baja.

Se dice **convertidos**, no "compradores", porque la mayoría de las conversiones
no son compras: son altas de servicio recurrente (`ADR-024`).

| Etapa | Definición exacta |
|---|---|
| **Abonados** | Total de abonados del ISP en el período. Es la base del funnel y el denominador de todo lo demás |
| **Visitas** | Abonados únicos que abrieron la tienda al menos una vez en el período |
| **Validados** | Visitantes que ingresaron un DNI o número de cliente con resultado `active`. Un intento fallido o una cuenta suspendida no cuentan como validado |
| **Convertidos** | Validados con al menos una orden no cancelada **o** un alta de servicio en el período |
| **Transacciones** | Órdenes no canceladas más altas de servicio del período |
| **GMV** | Lo facturado en el período: total de las órdenes de un solo tiro más lo cobrado de los servicios recurrentes durante esos días |
| **Ingreso ISP** | Suma de los tres tramos de `revenueShare`, no un porcentaje único del GMV |

**El funnel desemboca en dos resultados, no en uno.** El GMV mide lo que pasó en
el período; el MRR mide lo que va a seguir pasando todos los meses. Para un
negocio de servicios el segundo es el que importa, y es la diferencia entre
"vendimos" y "tenemos".

Entre etapa y etapa se muestra el porcentaje de conversión respecto de la etapa
anterior, no respecto del total.

### Invariantes

El generador de datos mock los valida y el dashboard no puede contradecirlos:

```
convertidos   ≤ validados ≤ visitas ≤ abonados
transacciones ≥ convertidos
GMV           = Σ órdenes no canceladas + Σ facturado de servicios en el período
MRR           = Σ monthlyPrice de las suscripciones 'active' al cierre
suscripciones activas ≥ 0  y  toda suscripción activa pertenece a un convertido
```

## Métricas recurrentes

Son las que definen el negocio bajo el encuadre de servicios (`ADR-028`).

| Métrica | Fórmula | Dónde aparece |
|---|---|---|
| **Servicios activos** | Suscripciones en estado `active` al cierre del período | Funnel, tile del dashboard |
| **MRR** | `Σ monthlyPrice` de las suscripciones activas | Tile del dashboard, reporte |
| **Ingreso recurrente del ISP** | Σ por tramo: `MRR de servicios × revenueShare.services.isp` + `MRR de upgrades × revenueShare.planUpgrades.isp` | Tile del dashboard, reporte |
| **ARPU incremental** | `MRR / abonados` | Reporte — **métrica guía** |
| **Upgrades de plan** | Suscripciones activas de categoría `plan` | Tile del dashboard |
| **Servicios por convertido** | Suscripciones activas / convertidos | Reporte |

El **ARPU incremental** se calcula sobre **toda la base de abonados**, no sobre los
que contrataron. Es a propósito: la pregunta del dueño del ISP no es "cuánto gasta
el que compra", es "cuánto sube mi facturación por abonado". Un número chico sobre
toda la base vale más que un número grande sobre unos pocos.

## Métricas transaccionales

| Métrica | Fórmula | Dónde aparece |
|---|---|---|
| **Ticket promedio** | GMV de un solo tiro / órdenes con ítems físicos | Tile del dashboard, reporte |
| **Tasa de recompra** | Convertidos con 2 o más transacciones / convertidos | Tile del dashboard |
| **Ahorro generado, único** | `Σ (público − final) × cantidad` sobre los ítems `once` | Tile, reporte, carrito |
| **Ahorro generado, mensual** | `Σ (público − final)` sobre las suscripciones activas | Tile, reporte, carrito |
| **Ingreso ISP del período** | Suma de los tres tramos de `revenueShare` | Funnel, tile, reporte |
| **Ingreso plataforma** | Ídem con la porción `platform` | Reporte |
| **GMV por cada 1.000 abonados** | `GMV / abonados × 1.000` | Reporte |

El **ahorro generado** va partido en dos porque los importes de un solo tiro y los
mensuales no son comparables. En el reporte se muestran juntos: *"les ahorramos $X
una vez y $Y todos los meses"*. El segundo es el que retiene al abonado, y por eso
aparece con el mismo tamaño que el ingreso.

### Por qué el ingreso del ISP no es un porcentaje del GMV

Un porcentaje único daría cifras sin sentido, porque los tres tipos de ítem tienen
economías distintas (`ADR-029`): la reventa de hardware deja alrededor del 10% de
margen total, un servicio recurrente deja mucho más, y un upgrade del plan propio
del ISP no tiene costo de mercadería en absoluto. El ingreso del ISP se calcula
sumando los tres tramos por separado.

La consecuencia que importa para la reunión: **el ISP puede ganar más con menos
GMV**. Un dashboard que solo mostrara volumen contaría la historia al revés.

## Series y cortes

- **MRR mensual**, últimos 6 meses. Es la serie principal: una curva que sube y no
  vuelve a bajar es exactamente lo que hay que mostrar en la reunión.
- **GMV mensual**, últimos 6 meses, sobre el mismo eje.
- **Transacciones mensuales**, últimos 6 meses.
- **Top 8 ítems**, marcando cuáles son servicios y cuáles productos.
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
| Convertidos | 2% a 5% | de los abonados, en 90 días |
| Precio mensual promedio de un servicio | $6.000 a $15.000 | por servicio |
| Servicios por convertido | 1,1 a 1,5 | |
| Ticket promedio de producto físico | $180.000 a $260.000 | por orden con ítems físicos |

La banda es ancha a propósito. La conversión de un canal de este tipo depende
sobre todo de cuánto lo promocione el ISP y por qué medio, y eso todavía no se
midió con nadie.

**El reencuadre a servicios vuelve creíble la hipótesis de conversión.** Pedirle a
un abonado que gaste $220.000 de una vez es una decisión de compra que se piensa;
pedirle que sume $6.000 por mes a una factura que ya paga es casi un clic. El 2%
a 5% era optimista para hardware y es razonable para servicios — y esa hipótesis
es la que sostiene todo el dashboard.

## Cifras del período de referencia (90 días, tenant de la demo)

Las que genera `scripts/generate-mock-data.ts` y muestra el dashboard. Coherentes
con las hipótesis de arriba sobre 58.000 abonados, y todas atadas a los
invariantes.

| | |
|---|---|
| Abonados | 58.000 |
| Visitas | 6.960 (12%) |
| Validados | 3.480 (6%) |
| Convertidos | 1.450 (2,5%) |
| Transacciones | ~2.400 |
| Suscripciones activas al cierre | ~1.500 servicios + ~380 upgrades de plan |
| Órdenes con ítems físicos | ~520, ticket promedio $220.000 |
| GMV del período | ~$147M |
| **MRR al cierre** | **~$18,1M por mes** |
| ARPU incremental | ~$311 por abonado por mes |
| Ingreso del ISP en el período | ~$17,7M |
| **Ingreso recurrente del ISP** | **~$7,9M por mes** |
| Del cual, upgrades de plan | ~$4,6M por mes, sin comisión de la plataforma |

Comparado con un modelo de solo productos físicos, el GMV es bastante menor y **el
ingreso del ISP es mayor**, porque el reparto sobre servicios es más favorable que
sobre reventa de hardware y porque los upgrades de su propio plan quedan enteros
para él (`ADR-029`). Esa es la conversación que conviene tener en la reunión:
menos volumen, más margen, y que vuelve todos los meses.

El renglón de upgrades merece decirse en voz alta: **de los $7,9M mensuales que le
quedan al ISP, $4,6M salen de vender su propio plan y no pagan comisión.** El
módulo que los genera es parte de la plataforma.

## Qué NO se mide en la Fase 0

En la demo no hay analítica: no se registran visitas, no hay eventos, no hay
tracking. Las cifras de `metrics.json` están generadas para ser coherentes con
estas definiciones, no medidas. La instrumentación real es parte de la Fase 1.

