# Roadmap

## Fase 0 — Demo (este repositorio)

**Objetivo:** tener algo que mostrar en la reunión con el ISP ancla, para que la
propuesta se vea en lugar de explicarse.

- Tienda del abonado completa con datos mock: validación de DNI, catálogo,
  producto, carrito, checkout simulado, pedido y seguimiento.
- Panel del ISP con dashboard, catálogo, promociones, pedidos, abonados, editor de
  marca y reportes.
- Todo sobre archivos JSON y `localStorage`. Sin backend, sin base de datos, sin
  pagos reales, sin auth real.
- Arquitectura multi-tenant desde el día uno, aunque haya un solo tenant.

**Se termina cuando** se cumplen los criterios de aceptación de
`01-alcance-fase-0-demo.md`.

## Fase 1 — Piloto con el ISP ancla (60.000 abonados)

**Objetivo:** validar los supuestos de conversión con dinero real y generar el
caso de éxito.

| Frente | Qué se hace |
|---|---|
| Elegibilidad | `src/lib/eligibility.ts` deja de leer `subscribers.json` y pasa a consultar la API o el archivo de abonados elegibles del ISP. Es el primer reemplazo |
| **Facturación** | Alta del concepto en el sistema de facturación del ISP. **Es el segundo reemplazo y el camino crítico**: sin esto no hay servicios |
| Catálogo de servicios | Acuerdos con proveedores de TV, celular, gaming y seguridad. Es lo más difícil del negocio real |
| Upgrades de plan | Integración con el aprovisionamiento del ISP para que un cambio de plan se ejecute solo |
| Órdenes y suscripciones | Persistencia real: dejan de vivir en `localStorage` |
| Pagos | Mercado Pago Checkout Pro, **solo para productos físicos**. Un piloto de servicios puros no lo necesita |
| Catálogo de hardware | ~12 productos con proveedor real, costos y plazos de entrega |
| Dashboard | Los mismos gráficos, alimentados por datos reales |
| Revenue share | Liquidación mensual al ISP, con reparto distinto por tipo de ítem |
| Logística | Acuerdo de fulfillment para el hardware; el ISP no toca stock |

**Se puede arrancar solo con servicios.** No hace falta pasarela de pagos, ni
proveedor de hardware, ni logística: hace falta la elegibilidad, un acuerdo de
servicios y un concepto más en la factura. Es el camino más corto a un piloto que
factura, y conviene proponerlo así en la reunión.

**Se termina cuando** hay 90 días de operación medidos con el funnel de
`07-metricas-y-kpis.md` y una decisión fundamentada de escalar o no.

## Fase 2 — Network (5 a 10 ISPs)

**Objetivo:** convertir el caso de éxito en un producto replicable.

- Resolución de tenant por subdominio (`beneficios.<isp>.com.ar`), reemplazando
  `NEXT_PUBLIC_TENANT`.
- Onboarding self-service: un ISP nuevo se configura sin que intervengamos.
- Roles y permisos en el panel del ISP.
- Facturación del fee SaaS por rango de abonados.
- Catálogo con visibilidad por tenant: no todos los ISPs venden lo mismo.

## Fase 3 — Marketplace

**Objetivo:** pasar de vender software a capturar margen sobre el producto.

- Proveedores múltiples compitiendo dentro del catálogo, con panel propio.
- Promociones patrocinadas: marcas que pagan por posición en la red de tiendas.
- Importación propia de las categorías de mayor rotación.
- Marca propia en esas categorías.

## Qué se decide con qué

| Decisión | Se toma con los datos de |
|---|---|
| ¿Escalamos a más ISPs? | Fase 1: conversión de validados a convertidos y **ARPU incremental** |
| ¿Qué categorías amplío? | Fase 1: ventas por categoría y top de ítems |
| ¿Servicios o hardware? | Fase 1: qué proporción del ingreso del ISP viene de cada uno |
| ¿Negocio directo con proveedores? | Fase 2: volumen agregado de la red |
| ¿Importo? | Fase 3: rotación sostenida por categoría durante al menos dos trimestres |
