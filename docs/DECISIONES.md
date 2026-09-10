# Decisiones

Log tipo ADR. Una entrada por decisión: contexto, decisión, alternativas
descartadas y consecuencias. Las decisiones ADR-001 a ADR-010 vienen de la
sección 3 de `KICKOFF.md`; de ADR-011 en adelante se tomaron durante la
implementación.

---

## ADR-001 — Next.js con App Router y TypeScript estricto
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** La demo tiene que deployarse fácil, renderizar rápido y no
convertirse en un prototipo desechable: la Fase 1 continúa sobre este código.

**Decisión.** Next.js última estable con App Router y TypeScript en modo estricto,
sin `any` y sin `as unknown as`.

**Alternativas descartadas.** Vite + React Router (habría que rehacer el
renderizado del lado del servidor en la Fase 1). Astro (menos natural para una
app con tanto estado de cliente).

**Consecuencias.** Server Components por defecto; `"use client"` solo donde hay
estado o eventos. Deploy en Vercel sin configuración.

---

## ADR-002 — Colores, radios y tipografías siempre por CSS variables del tenant
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El argumento de venta del white-label es que la tienda se ve como
la del ISP. Si algún color queda escrito en un componente, ese argumento se cae en
la demo misma, en vivo.

**Decisión.** Ningún valor de marca se escribe en un componente. Todo sale de
`tenant.json`, se convierte en custom properties y Tailwind las consume.

**Alternativas descartadas.** Clases condicionales por tenant (no escala y no
permite editar en vivo). CSS-in-JS (peso extra y peor integración con RSC).

**Consecuencias.** Verificable con `grep -riE "#[0-9a-fA-F]{6}" src/components src/app`
→ 0 resultados. Habilita el preview en vivo de `/admin/marca`.

---

## ADR-003 — Tres presets tipográficos fijos
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** `next/font/google` resuelve las fuentes en build: no puede cargar
una familia arbitraria en runtime, que es lo que haría falta si la tipografía
fuera un campo libre del tenant.

**Decisión.** Tres presets fijos en `src/lib/fonts.ts`; los tres se cargan en el
layout raíz y el tenant elige uno con `theme.fontPreset`. `/admin/marca` cambia
entre esos mismos tres.

**Alternativas descartadas.** Cargar la fuente por CDN en runtime (peor
rendimiento, FOUT, y pierde el self-hosting). Una sola tipografía (mata el
argumento de personalización).

**Consecuencias.** La demo carga seis familias. Se recortan pesos para que el
costo sea aceptable.

---

## ADR-004 — Componentes propios, sin librería de UI
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Decisión.** UI propia. Se permiten `lucide-react` para íconos y `recharts` para
los gráficos del admin.

**Alternativas descartadas.** MUI, Chakra o shadcn/ui completos: traen su propio
sistema de theming, que pelearía con el del tenant, y su propia estética, que es
justamente el "tell genérico" que hay que evitar.

**Consecuencias.** Más código propio, pero control total sobre el theming y sobre
el momento de la revelación del precio.

---

## ADR-005 — React Context y `localStorage` para todo el estado
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Decisión.** Estado con Context y hooks; persistencia en `localStorage` con las
claves centralizadas en `src/lib/storage-keys.ts`.

**Alternativas descartadas.** Zustand o Redux (innecesarios para este tamaño).
Cookies (implicarían lógica de servidor, prohibida en la Fase 0).

**Consecuencias.** Ningún componente arma una clave de storage a mano. "Restablecer
demo" puede borrar todo con un solo prefijo.

---

## ADR-006 — Regla de hidratación: ningún precio antes de conocer la sesión
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El servidor no conoce la sesión. Si los precios se renderizaran de
entrada, al recargar con sesión se vería el precio público un instante antes de
convertirse en exclusivo. En una demo en vivo eso arruina justamente el momento
que la demo existe para mostrar.

**Decisión.** Cada contexto expone `status: 'loading' | 'ready'`. Los componentes
de precio muestran un skeleton del mismo tamaño hasta que la sesión se conoce.

**Alternativas descartadas.** Renderizar el precio público y reemplazarlo (es
exactamente el flash que se quiere evitar). `suppressHydrationWarning` (esconde el
síntoma).

**Consecuencias.** La revelación ocurre una sola vez y cuando corresponde. Sin
layout shift y sin warnings de hidratación.

---

## ADR-007 — El catálogo es de la plataforma; los datos de negocio son del tenant
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Decisión.** `products.json` vive en `src/data/` y es compartido. Abonados,
promociones, órdenes y métricas viven en `src/tenants/<id>/`.

**Consecuencias.** El SKU lleva prefijo de plataforma (`NX-`) y no del ISP. Sumar
un ISP no implica duplicar el catálogo.

---

## ADR-008 — Tenant activo por variable de entorno
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Decisión.** `NEXT_PUBLIC_TENANT`, con default `zonda`, resuelto en
`src/tenants/index.ts`.

**Alternativas descartadas.** Subdominio (es de la Fase 2; requiere DNS y
middleware). Selector en la UI (confunde en una demo que quiere parecer la tienda
de un ISP).

**Consecuencias.** El único archivo que sabe cómo se eligió el tenant es
`src/tenants/index.ts`. Cambiar a subdominio es tocar ese archivo.

---

## ADR-009 — Sin fotos de producto: ilustraciones SVG tematizadas
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** No se pueden usar fotos ni marcas reales, y las fotos genéricas de
stock hacen que la tienda parezca un template.

**Decisión.** Un componente `ProductPlaceholder` con cinco ilustraciones
geométricas —una por categoría— en SVG inline, tematizadas con el color primario y
con una variación sutil derivada del `id` del producto. `product.image` queda
opcional y en `null`.

**Consecuencias.** Cambiar el color primario en `/admin/marca` también cambia las
"fotos": es el argumento del white-label llevado al extremo visible. En la Fase 1,
cuando haya fotos reales, se usa `product.image` y el placeholder queda de
respaldo.

---

## ADR-010 — pnpm y deploy en Vercel
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Decisión.** pnpm como gestor de paquetes; Vercel como destino de deploy.
`next build` tiene que pasar sin warnings de tipos.

---

## ADR-011 — Tailwind v4 con `@theme inline`
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El kickoff pide Tailwind pero no fija versión, y de la versión
depende cómo se escribe el theming entero.

**Decisión.** Tailwind v4 con theming CSS-first en `globals.css`, sin
`tailwind.config.ts`. El mapeo se hace con **`@theme inline`**, no con `@theme`.

**Por qué `inline` no es una preferencia sino un requisito.** Con `@theme` a
secas, Tailwind emite `--color-primary: var(--brand-primary)` en `:root`. Las
custom properties se computan donde se declaran, así que `--color-primary`
resolvería contra el `--brand-primary` de `:root` y heredaría hacia abajo el valor
ya resuelto: redefinir `--brand-primary` en un contenedor anidado no tendría
ningún efecto. Con `@theme inline`, la utilidad queda como
`.bg-primary { background-color: var(--brand-primary) }` y el `var()` se resuelve
**en el elemento que lo consume**. Eso es exactamente lo que hace posible el
preview en vivo de `/admin/marca` sin prop drilling, sin iframe y sin una maqueta
paralela.

**Alternativas descartadas.** Tailwind v3 con `tailwind.config.ts`: funciona, pero
obliga a guardar los colores como canales separados y a usar
`rgb(var(--x) / <alpha-value>)` en cada definición.

**Consecuencias.**
- Los colores se guardan en `tenant.json` como **hex**. En v4, `bg-primary/60`
  compila a `color-mix(in oklab, var(--brand-primary) 60%, transparent)`, que
  acepta hex sin problema: la separación en canales de v3 ya no hace falta. Además
  el hex es lo que consume `<input type="color">` del editor de marca.
- `color-mix()` se emite sin fallback `@supports`. Requiere Chrome 111+,
  Safari 16.2+ y Firefox 113+. Aceptable para una demo de 2026.
- Se evitan las formas arbitrarias del tipo `*-(--var)/alpha`, que usan sintaxis
  de color relativo (`oklab(from …)`) con soporte más angosto.
- Dos capas de nombres, que **no pueden coincidir** o el mapeo queda circular y
  muere en silencio: las variables inyectadas en runtime son `--brand-*`,
  `--font-heading` y `--font-body`; las claves del tema son `--color-*`,
  `--radius-*` y `--font-*`.

---

## ADR-012 — Playwright solo como dependencia de desarrollo
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El paso 9 pide capturas del guion si el entorno lo permite, y hay un
checkpoint de revisión visual sobre la revelación del precio.

**Decisión.** Playwright como `devDependency`, usado únicamente para generar las
capturas de `docs/capturas/`. No se escriben tests E2E, que están excluidos por la
sección 14 del kickoff.

**Consecuencias.** El build de producción no se ve afectado. Las capturas quedan
versionadas y sirven de referencia visual.

---

## ADR-013 — Prettier junto a la configuración de ESLint de Next
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El kickoff pide "ESLint + Prettier con la config default de Next",
pero Next no incluye Prettier.

**Decisión.** `prettier` más `eslint-config-prettier` al final de la config plana
de ESLint, para que desactive las reglas de estilo que chocan.

**Consecuencias.** `pnpm lint` y `pnpm format:check` no se contradicen. Los JSON
generados (`orders.json`, `metrics.json`) quedan en `.prettierignore`.

---

## ADR-014 — Los tres presets tipográficos concretos
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El kickoff nombra los presets como ejemplo ("ej. `sora-plex`,
`manrope-inter`, `outfit-source`") y fija el criterio: sans geométrica o humanista
para títulos, sans neutra para cuerpo, ninguna serif.

**Decisión.** Se toman esos tres como definitivos: `sora-plex` (Sora / IBM Plex
Sans, el del tenant), `manrope-inter` (Manrope / Inter) y `outfit-source`
(Outfit / Source Sans 3).

**Consecuencias.** Los tres cumplen el criterio y contrastan entre sí lo suficiente
como para que el cambio se note en la demo del editor de marca.

---

## ADR-015 — El volumen de órdenes mock y el funnel no cierran entre sí
**Fecha:** 2026-09-09 · **Estado:** **abierta — a resolver antes del paso 4**

**Contexto.** La sección 8.4 del kickoff pide dos cosas que no pueden cumplirse a
la vez:

1. `orders.json` con **60 órdenes** en los últimos 90 días, ticket promedio entre
   $180.000 y $260.000.
2. `metrics.json` con un funnel coherente con las hipótesis del piloto sobre
   58.000 abonados: visitas ≈ 12%, validados ≈ 6%, **compradores ≈ 2,5%**.

2,5% de 58.000 son 1.450 compradores. Con 60 órdenes eso daría menos de una orden
cada veinticuatro compradores, y rompe además el invariante `órdenes ≥ compradores`
y la validación `GMV = Σ órdenes no canceladas` que el propio kickoff le pide al
generador.

**Opciones.**

- **A — Mandan las 60 órdenes.** El funnel se escala hacia abajo: unos 52
  compradores. Todo cierra, pero el dashboard muestra 3.480 validados cayendo a 52
  compradores, un embudo que se ve roto justo en la pantalla que responde "¿qué
  gano?".
- **B — Manda el funnel.** Se generan las ~1.700 órdenes que las hipótesis
  implican (archivo de aproximadamente 1 MB, tablas paginadas). El dashboard queda
  coherente y vendedor; se desvía del número literal "60".
- **C — Punto medio.** Se usa el extremo bajo de la hipótesis (compradores 2%) y
  se generan ~1.350 órdenes.

**Recomendación.** Opción B. El "60" es un volumen arbitrario de datos de relleno;
las tasas del funnel están atadas a la definición oficial de
`07-metricas-y-kpis.md` y al pitch de la reunión. Un dashboard con un embudo roto
cuesta más que un JSON más grande.

**Consecuencias.** Pendiente de confirmación. Se resuelve antes de escribir
`scripts/generate-mock-data.ts`.

---

## ADR-016 — Las ilustraciones de producto usan `currentColor`, no `var(--color-primary)`
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** Las secciones 3 y 8.2 del kickoff dicen que `ProductPlaceholder`
renderiza SVG usando `var(--color-primary)`. Con `@theme inline` (ADR-011) esa
variable **no se emite en `:root`**: existe solo dentro de la definición de cada
utilidad. Referenciarla desde un atributo `fill` daría un color vacío.

**Decisión.** El SVG usa `fill="currentColor"` y el componente lleva la clase
`text-primary`.

**Alternativas descartadas.** Volver a `@theme` sin `inline` (rompería el preview
en vivo, ADR-011). Emitir además `--color-primary` en `:root` a mano (duplica la
fuente de verdad y se desincroniza).

**Consecuencias.** El resultado visual es idéntico al que pide el kickoff y además
mejor: `currentColor` hereda del ámbito, así que las ilustraciones se retematizan
solas dentro del preview de `/admin/marca` sin ningún trabajo extra.

---

## ADR-017 — La validación del DNI es sincrónica en el cliente
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El formulario del hero podría implementarse como Server Action.

**Decisión.** Es un formulario de cliente que llama a `checkSubscriber()` de forma
sincrónica sobre datos ya importados.

**Alternativas descartadas.** Server Action: implicaría lógica de servidor, que la
sección 14 excluye, y sobre todo agregaría una ida y vuelta de red justo en el
instante que tiene que sentirse inmediato.

**Consecuencias.** La revelación arranca en el mismo frame en que el abonado
suelta el botón. En la Fase 1, cuando `checkSubscriber()` pase a consultar la API
del ISP, la función se vuelve asíncrona y el formulario gana un estado de carga:
es un cambio localizado y previsto.
