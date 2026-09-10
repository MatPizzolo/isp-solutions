# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Una entrada por paso completado de la sección 15 de `KICKOFF.md`.

## [No publicado]

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
