# Alcance — Fase 0 (demo)

## Objetivo

Construir una demo navegable y deployable de la tienda white-label y del panel del
ISP, con un cliente ficticio y datos mock, para mostrarla en la reunión con el
dueño del ISP ancla antes de invertir en integraciones.

La demo existe para que esta frase se vea en lugar de explicarse:

> *"Quiero desarrollar para ustedes una plataforma de beneficios y tienda exclusiva
> para sus abonados. Yo asumo el desarrollo y la operación inicial. Ustedes aportan
> acceso a la base de clientes para validar que sean abonados y promocionan la
> plataforma. Durante el piloto medimos ventas, conversión y beneficios. Si
> funciona, lo escalamos."*

## Las tres preguntas que tiene que responder

| # | Pregunta del dueño del ISP | Dónde se responde |
|---|---|---|
| 1 | ¿Cómo lo ve mi abonado? | Tienda con su marca; precio exclusivo al validar el DNI |
| 2 | ¿Qué controlo yo? | Panel con catálogo, promociones, pedidos, reportes y marca |
| 3 | ¿Qué gano? | Dashboard con el funnel, el MRR y el ingreso recurrente |
| 4 | ¿Y esto qué me cuesta? | Nada del piloto: sin stock, sin logística, y cero comisión sobre sus propios planes |

La cuarta no está en el kickoff y apareció con el reencuadre. Es la objeción real
de un operador chico —"¿en qué me estoy metiendo?"— y la demo la responde
mostrando que el flujo de servicios no tiene envío, ni tarjeta, ni depósito.

## Guion de la demo y prioridades

Este es el recorrido exacto de la reunión. Define el orden de implementación, el
orden de QA y qué se recorta si falta tiempo.

| # | Momento | Ruta | Prioridad |
|---|---|---|---|
| 1 | "Así lo ve tu abonado": landing con la marca del ISP y el gate de DNI | `/` | **P1** |
| 2 | Validar DNI `30111222` → revelación del precio exclusivo | `/ingresar` → `/tienda` | **P1** |
| 3 | "Y esto te vende lo tuyo": el módulo de upgrade de plan, personalizado según el abonado | `/tienda` | **P1** |
| 4 | El mismo servicio con dos abonados: $9.900 para Lucía, "Incluido en tu plan" para Martín | `/beneficio/[slug]` | **P1** |
| 5 | "Esto es tu marca, no la nuestra": cambiar dos colores y ver la landing cambiar en vivo | `/admin/marca` | **P1** |
| 6 | Contratar un servicio en dos pasos, sin tarjeta ni dirección | `/beneficio` → `/checkout` → `/pedido/[id]` | P2 |
| 7 | "Esto es lo que ganás": funnel, MRR e ingreso del ISP | `/admin/dashboard` | P2 |
| 8 | Reporte del piloto imprimible | `/admin/reportes` | P2 |
| 9 | Comprar un producto físico: carrito → checkout → envío | `/carrito` → `/checkout` → `/pedido/[id]` | P3 |
| 10 | Resto: mis servicios, mis pedidos, cómo funciona, catálogo, promos, pedidos, abonados | varias | P3 |

**Regla:** P1 completo y pulido antes de tocar P2; P2 antes de P3. Una P1 impecable
vale más que las dieciséis pantallas a medias.

Los cinco momentos P1 viven sobre cinco pantallas: el momento 3 es un módulo
dentro de `/tienda`, no una vista aparte. Si falta tiempo, lo primero que se
recorta es la compra de producto físico, que bajó a P3 porque es el flujo que
cualquier tienda tiene (`ADR-032`).

## Incluido

- Tienda del abonado con flujos simulados de punta a punta, sobre un catálogo de
  **18 servicios y 12 productos físicos** (`ADR-025`).
- Alta de servicios cobrados en la factura del ISP, con suscripciones, estados de
  activación y "Mis servicios".
- Módulo de upgrade del plan propio del ISP, personalizado según el plan del
  abonado (`ADR-027`).
- Panel admin del ISP con las siete secciones, incluido el dashboard con métricas
  recurrentes (MRR, ARPU incremental).
- Datos en archivos JSON y estado en memoria y `localStorage`.
- Theming completo desde la configuración del tenant, incluidas las ilustraciones
  de producto.
- Modo demo con badge, DNIs de prueba a mano y "Restablecer demo".
- Tests unitarios de `pricing.ts` y `eligibility.ts` (42 casos).

## Excluido

Ver también la sección 14 de `KICKOFF.md`.

- Backend, API routes con lógica real, base de datos, ORM.
- Pasarela de pagos. No se piden datos de tarjeta.
- Auth real. El login del admin es decorativo.
- Integración con sistemas del ISP. La elegibilidad se resuelve contra JSON.
- Panel de proveedor, stock real, logística.
- App móvil, PWA, i18n.
- Marcas, logos, fotos o nombres de empresas reales.
- Más de 30 ítems de catálogo. Más de un tenant, aunque la arquitectura lo permita.
- Bajas o cambios de servicios contratados: en la demo solo se dan de alta.
- Integración con el sistema de facturación del ISP. El cobro en factura se
  confirma en pantalla y no se concilia con nada.
- Tests E2E.

## Estado de las pantallas

Leyenda: ⬜ pendiente · 🟡 en curso · ✅ listo

### Tienda

| Ruta | Prioridad | Estado |
|---|---|---|
| `/` | P1 | ⬜ |
| `/ingresar` | P1 | ⬜ |
| `/tienda` (con el módulo "Tu plan") | P1 | ⬜ |
| `/tienda/[category]` | P1 | ⬜ |
| `/beneficio/[slug]` (servicio y producto) | P1 | ⬜ |
| `/checkout` (camino de servicio, dos pasos) | P2 | ⬜ |
| `/pedido/[id]` | P2 | ⬜ |
| `/carrito` | P3 | ⬜ |
| `/checkout` (camino con producto físico, tres pasos) | P3 | ⬜ |
| `/mis-servicios` | P3 | ⬜ |
| `/mis-pedidos` | P3 | ⬜ |
| `/como-funciona` | P3 | ⬜ |

### Admin

| Ruta | Prioridad | Estado |
|---|---|---|
| `/admin` (login mock) | P1 | ⬜ |
| `/admin/marca` | P1 | ⬜ |
| `/admin/dashboard` | P2 | ⬜ |
| `/admin/reportes` | P2 | ⬜ |
| `/admin/catalogo` | P3 | ⬜ |
| `/admin/promociones` | P3 | ⬜ |
| `/admin/pedidos` | P3 | ⬜ |
| `/admin/abonados` | P3 | ⬜ |

### Desarrollo

| Ruta | Estado |
|---|---|
| `/dev/tokens` | ✅ |
| `/dev/componentes` | ✅ |

## Criterios de aceptación

- [ ] `pnpm build` pasa sin errores ni warnings de tipos; `lint`, `typecheck` y `test` limpios.
- [ ] El guion de la demo se recorre de punta a punta sin errores en consola y sin flash de precio al cargar páginas con sesión.
- [ ] Con `NEXT_PUBLIC_TENANT=zonda`, toda la tienda y el admin muestran la marca del tenant; cambiar dos colores y el `fontPreset` en `tenant.json` retematiza todo, incluidas las imágenes de producto, sin tocar código.
- [ ] Los 6 casos de DNI de prueba producen exactamente los 4 estados esperados con sus mensajes.
- [ ] Sin sesión, ningún precio exclusivo es visible. Con sesión, el precio y el ahorro se muestran; premium muestra descuento mayor.
- [ ] El mismo servicio muestra un precio mensual para un abonado base y "Incluido en tu plan" para uno premium.
- [ ] Cada abonado ve **solo** el upgrade de plan que le corresponde; quien ya tiene el plan más alto no ve el módulo.
- [ ] Un abonado puede contratar un servicio en dos pasos, sin dirección ni datos de pago, y verlo en "Mis servicios" con su fecha de activación.
- [ ] Un abonado puede completar el flujo entero: validar → elegir un producto y un servicio → carrito → checkout → pedido confirmado → verlo en "Mis pedidos" y "Mis servicios" → verlo en `/admin/pedidos`.
- [ ] En un carrito mixto, el importe de un solo tiro y el mensual se muestran separados y nunca sumados.
- [ ] En el admin: desactivar un ítem lo oculta de la tienda; cambiar un precio exclusivo se refleja en la tienda; cambiar colores en `/admin/marca` cambia el preview en vivo.
- [ ] El dashboard muestra el funnel completo con cifras coherentes con `metrics.json`, más MRR, ARPU incremental e ingreso recurrente del ISP.
- [ ] `/admin/reportes` se imprime a PDF de forma legible.
- [ ] Todas las pantallas funcionan a 375px sin scroll horizontal.
- [ ] "Restablecer demo" vuelve todo al estado inicial.
- [ ] `docs/` completo, `CLAUDE.md` actualizado, `CHANGELOG.md` con una entrada por paso, `DECISIONES.md` con las decisiones tomadas.
- [ ] Ningún color, texto de marca, prefijo de orden ni fuente hardcodeado fuera de `tenant.json` (`grep -ri "zonda" src/components src/app` → 0 resultados).
- [ ] Ninguna marca, logo o foto real en el proyecto.
