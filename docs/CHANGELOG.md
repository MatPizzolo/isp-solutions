# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Una entrada por paso completado de la sección 15 de `KICKOFF.md`.

## [No publicado]

### Reencuadre — de tienda de productos a tienda de servicios — 2026-09-09

Cambio de eje del proyecto, entre el paso 2 y el paso 3. Llega antes de que
existiera una sola línea de catálogo, modelo de datos o UI, así que cuesta
ediciones de documentación y no reescrituras de código.

Cambiado:

- **Posicionamiento** (`ADR-024`): de "tienda de beneficios para abonados" a
  **"Mi Cuenta / Mi Movistar como servicio"**. El catálogo pasa a ser
  mayoritariamente de servicios cobrados en la factura del ISP, con los productos
  físicos como góndola secundaria.
- **Catálogo** (`ADR-025`): `products.json` pasa a `catalog.json`, con 18
  servicios y 12 productos. Categorías nuevas: `tv`, `celular`, `gaming`,
  `seguridad-digital`, `plan`.
- **Modelo de datos**: `Product` pasa a ser la unión `CatalogItem =
  PhysicalProduct | ServiceItem`. Entidad nueva `Subscription`. `Order` distingue
  importes de un solo tiro de mensuales y **nunca los suma entre sí**.
- **Precio**: `computePrice` maneja los dos tipos y resuelve el caso "incluido en
  tu plan", que devuelve cero y corta la cadena de descuentos.
- **Pago** (`ADR-026`): el débito en la factura del ISP pasa de "próximamente,
  deshabilitado" a método **principal y preseleccionado**. Es la única capacidad
  que ningún competidor puede copiar.
- **Métricas** (`ADR-028`): el funnel desemboca en dos resultados, GMV del período
  y MRR al cierre. Se suman servicios activos, MRR, ARPU incremental e ingreso
  recurrente del ISP. "Compradores" pasa a "convertidos".
- **Revenue share** (`ADR-029`): deja de ser un porcentaje único y pasa a tener
  una entrada por tipo de ítem, porque las tres economías son distintas.
- **Rutas** (`ADR-030`): `/producto/[slug]` pasa a `/beneficio/[slug]`, una sola
  ruta para los dos tipos. Pantalla nueva `/mis-servicios`.

Agregado:

- Los upgrades del plan propio del ISP entran al catálogo como ítems destacados y
  personalizados según el plan del abonado (`ADR-027`). Es el ítem de mayor margen
  posible: no tiene costo de mercadería.

Sin cambios:

- `KICKOFF.md`, que queda como registro de la especificación original. Los tres
  ADR que se apartan de él lo declaran en su encabezado.
- Todo el trabajo de los pasos 1 y 2: theming, regla de hidratación, mecanismo de
  revelación del precio, elegibilidad y toolchain.

### Paso 1 — Documentación base — 2026-09-09

Agregado:

- `docs/` con los diez documentos fuente del proyecto: visión y modelo de negocio,
  alcance de la Fase 0, arquitectura, modelo de datos, esqueleto del plan de diseño,
  flujos de usuario, roadmap, métricas y KPIs, log de decisiones y este changelog.
- `CLAUDE.md` con las reglas duras, comandos, DNIs de prueba, guion de demo
  y definition of done.
- `README.md`, `.env.example` y `.gitignore`.

Decidido:

- Tailwind v4 con theming CSS-first (`ADR-011`).
- Playwright solo como dependencia de desarrollo, para las capturas del guion (`ADR-012`).
- Prettier junto a la config de ESLint de Next (`ADR-013`).
- Los tres presets tipográficos quedan fijos en `sora-plex`, `manrope-inter`
  y `outfit-source` (`ADR-014`).

- `ADR-015`: el volumen de órdenes mock y el funnel de `metrics.json` no pueden
  cumplirse a la vez tal como están enunciados en `KICKOFF.md`. Resuelto a favor
  del funnel: se generan ~1.700 órdenes en lugar de 60, y `/admin/pedidos` lleva
  paginación desde el principio.
- `ADR-018`: el camino de la reunión es `/ingresar` → `/tienda`, no el hero. La
  revelación tiene que sobrevivir la navegación de cliente y escalonarse sobre la
  grilla completa.
- `ADR-019`: el usuario del admin se deriva de `admin@${tenant.website}`, porque
  el kickoff lo da como texto literal de marca pero exige que no exista texto de
  marca fuera de `tenant.json`.
- `ADR-020`: prefijos de id de producto para las cuatro categorías que el kickoff
  no define.

Eliminado:

- `PROMPT.md`, reemplazado por `KICKOFF.md`.

### Paso 2 — Proyecto Next.js — 2026-09-09

Agregado:

- Next.js 16.3.4 con App Router, React 19.2.8, TypeScript estricto, Tailwind 4.3.3
  y ESLint 9, instalado en este directorio sin subcarpeta.
- Dependencias de runtime: `lucide-react`, `recharts`.
- Toolchain de desarrollo: Vitest 5 (con `vite` explícito, que Vitest 5 ya no
  incluye), `tsx`, Prettier con `eslint-config-prettier`, y Playwright para las
  capturas del guion.
- Scripts `typecheck`, `test`, `test:watch`, `format`, `format:check` y
  `mock:generate`.
- `vitest.config.mts` con el alias `@/` espejando `tsconfig.json`.
- `src/lib/format.ts` con `formatARS()` y sus tests (`ADR-023`).

Decidido:

- `noUncheckedIndexedAccess` activado (`ADR-021`).
- Prettier no toca Markdown (`ADR-022`).
- `formatARS()` adelantado como prueba de humo del toolchain (`ADR-023`).

Notas de instalación:

- `create-next-app` rechaza directorios no vacíos: `KICKOFF.md`, `README.md`,
  `CLAUDE.md` y `.env.example` se movieron temporalmente y se restauraron después.
- La plantilla pisó `.gitignore`, y su regla `.env*` habría dejado `.env.example`
  fuera del repositorio. Se fusionó a mano.
- `esbuild` se agregó a `onlyBuiltDependencies` en `pnpm-workspace.yaml`; sin su
  script de instalación, Vitest no arranca.

Verificado:

- `pnpm typecheck`, `pnpm lint`, `pnpm test` (4 tests), `pnpm format:check` y
  `pnpm build` pasan limpios.
- Playwright levanta el servidor de desarrollo, carga la página y reporta cero
  errores de consola.
