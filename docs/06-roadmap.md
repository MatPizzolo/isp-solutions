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
| Pagos | Mercado Pago Checkout Pro reemplaza el checkout simulado |
| Órdenes | Persistencia real: las órdenes dejan de vivir en `localStorage` |
| Catálogo | ~30 productos con proveedor real, costos y plazos de entrega reales |
| Dashboard | Los mismos gráficos, alimentados por datos reales |
| Revenue share | Liquidación mensual al ISP sobre el GMV de su tienda |
| Logística | Acuerdo de fulfillment con el proveedor; el ISP no toca stock |

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
| ¿Escalamos a más ISPs? | Fase 1: conversión de validados a compradores y GMV por cada 1.000 abonados |
| ¿Qué categorías amplío? | Fase 1: ventas por categoría y top de productos |
| ¿Negocio directo con proveedores? | Fase 2: volumen agregado de la red |
| ¿Importo? | Fase 3: rotación sostenida por categoría durante al menos dos trimestres |
