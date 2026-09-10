# CLAUDE.md

## Qué es este proyecto

Un **"Mi Cuenta / Mi Movistar" como servicio**, bajo marca blanca, para ISPs
chicos y medianos: el abonado valida su DNI, ve su plan y suma servicios —TV,
celular, gaming, seguridad digital, mejoras de su propio Internet— cobrados en la
factura que ya paga. Hay además una góndola de productos físicos, pero **los
servicios son el eje** (`ADR-024`).
Fase 0 = demo navegable con datos mock del tenant ficticio **Zonda Fibra**.
Sin backend, sin base de datos, sin pagos y sin auth reales.

## Leer antes de tocar código

- `docs/01-alcance-fase-0-demo.md` — qué entra, qué no, y el guion de la demo.
- `docs/02-arquitectura.md` — capas, theming, regla de hidratación, puntos de corte.
- `docs/04-diseno-y-ui.md` — **obligatorio antes de cualquier cambio de diseño.**
- `KICKOFF.md` — la especificación completa.

## Stack y comandos

Next.js (App Router) · TypeScript estricto · Tailwind v4 · pnpm

```bash
pnpm dev             # desarrollo
pnpm build           # build de producción
pnpm lint            # ESLint
pnpm typecheck       # tsc --noEmit
pnpm test            # Vitest
pnpm mock:generate   # regenera orders.json y metrics.json (seed fija)
```

## Variables de entorno

| Variable | Default | Para qué |
|---|---|---|
| `NEXT_PUBLIC_TENANT` | `zonda` | Tenant activo. Tiene que estar en `src/tenants/index.ts` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Badge "Demo" y panel flotante con DNIs de prueba y "Restablecer demo" |

## Reglas duras

1. Sin backend, base de datos, pagos ni auth reales.
2. Ningún color, fuente o texto de marca hardcodeado: todo sale del tenant.
3. Los componentes no importan JSON; usan `src/lib/*`.
4. **Ningún precio se renderiza antes de conocer la sesión en el cliente.**
5. Claves de `localStorage` solo desde `src/lib/storage-keys.ts`.
6. Copy en español rioplatense (voseo); código, archivos y commits en inglés.
7. No usar marcas, logos ni fotos reales.
8. TypeScript estricto, sin `any`.
9. Mobile first; toda pantalla se verifica a 375px y a 1280px.

## Recetas

**Agregar un producto físico.** Sumar la entrada en `src/data/catalog.json` con
`kind: 'product'`, id `{prefijo de categoría}-{3 dígitos}` y SKU `NX-…`. Reglas de
precio: `exclusivePrice` entre 6% y 14% bajo `publicPrice`, y `supplierCost` entre
8% y 12% bajo `exclusivePrice`. Dejar `image: null` para que use
`ProductPlaceholder`.

**Agregar un servicio.** Igual, con `kind: 'service'` y precios mensuales
(`publicMonthlyPrice`, `exclusiveMonthlyPrice`, `providerMonthlyCost`). Definir
`commitmentMonths`, `activation` y, si corresponde, `includedInTiers` para que
venga sin cargo en algún plan. Sin stock ni cuotas: un servicio ya es mensual.

**Agregar un upgrade de plan.** Un servicio de categoría `plan` con `fromPlanId` y
`toPlanId` apuntando a `tenant.plans`, `providerMonthlyCost: 0`, y el precio
expresado como **la diferencia mensual** contra el plan actual — no el precio del
plan nuevo.

**Agregar un tenant.** Crear `src/tenants/<id>/` con `tenant.json`,
`subscribers.json` y `promotions.json`; correr `pnpm mock:generate`; registrar el
id en `src/tenants/index.ts`; poner el logo en `public/tenants/<id>/`. No hace
falta tocar ningún componente.

**Agregar una promoción.** Sumarla a `src/tenants/<id>/promotions.json` con su
`type`, vigencia y `discount`. El estado (vigente / programada / vencida) se
deriva de las fechas: no se guarda.

## DNIs de prueba

| DNI | Nº cliente | Nombre | Plan | Resultado |
|---|---|---|---|---|
| `30111222` | 104588 | Lucía Ferreyra | Fibra 300 | Activo — flujo feliz. Ve el pase a Fibra 600 + TV |
| `27888999` | 98231 | Martín Solari | Fibra 600 + TV | Premium — descuento 12% y servicios "Incluido en tu plan". Sin módulo de upgrade |
| `33444555` | 121904 | Camila Prieto | Fibra 100 | Base — ve el pase a Fibra 300 |
| `20555666` | 77120 | Roberto Ibáñez | Fibra 300 | Suspendido |
| `18999000` | 45012 | Elena Carrizo | Fibra 100 | Inactivo |
| `35000111` | — | — | — | No encontrado |

**Admin:** `admin@zondafibra.com.ar` / `demo`
El usuario se deriva de `admin@${tenant.website}`, no está escrito en ningún
componente (`ADR-019`).

## Guion de la demo

Camino de QA obligatorio antes de cada commit que toque UI.

| # | Momento | Ruta | Prioridad |
|---|---|---|---|
| 1 | Landing con la marca del ISP y el gate de DNI | `/` | **P1** |
| 2 | Validar `30111222` → revelación del precio | `/ingresar` → `/tienda` | **P1** |
| 3 | Detalle: ahorro en $ y %, y el par premium ("Incluido en tu plan") | `/beneficio/[slug]` | **P1** |
| 4 | Cambiar dos colores y ver la landing cambiar en vivo | `/admin/marca` | **P1** |
| 5 | Carrito → checkout simulado → pedido confirmado | `/carrito` → `/checkout` → `/pedido/[id]` | P2 |
| 6 | Funnel e ingreso estimado del ISP | `/admin/dashboard` | P2 |
| 7 | Reporte del piloto imprimible | `/admin/reportes` | P2 |
| 8 | Resto de las pantallas | varias | P3 |

**P1 completo y pulido antes de tocar P2; P2 antes de P3.**

## Definition of done

Una tarea no está terminada hasta que:

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` y `pnpm build` pasan limpios.
- [ ] Se verificó a 375px y a 1280px.
- [ ] No hay colores ni textos de marca hardcodeados.
- [ ] Se recorrió el guion de la demo sin errores en consola y **sin flash de
      precio** al cargar con sesión.
- [ ] Hay entrada en `docs/CHANGELOG.md`.
- [ ] Si se tomó una decisión no prevista, quedó registrada en `docs/DECISIONES.md`.

## Estado actual

- **Hecho:** paso 1 — documentación base. Paso 2 — Next.js 16.3.4 + React 19 +
  Tailwind 4 + TypeScript estricto, con Vitest, Prettier, tsx y Playwright.
  Todo verificado: typecheck, lint, test, format y build limpios.
- **Reencuadre (ADR-024 a ADR-030):** el proyecto pasó de tienda de productos
  físicos a tienda de servicios sobre la factura del ISP. Los docs ya están
  alineados; `KICKOFF.md` queda intacto como especificación original.
- **Sigue:** paso 3 — tenant, theming y `/dev/tokens`.
- **A tener en cuenta:**
  - Importes de un solo tiro y mensuales **nunca se suman entre sí**.
  - El generador produce ~2.400 transacciones (ADR-015), así que `/admin/pedidos`
    lleva paginación desde el principio.
  - El theming usa `@theme inline` (ADR-011): las variables inyectadas son
    `--brand-*` y las claves del tema `--color-*`; no pueden llamarse igual.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
