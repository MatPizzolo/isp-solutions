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

**Decisión.** `catalog.json` vive en `src/data/` y es compartido. Abonados,
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
**Fecha:** 2026-09-09 · **Estado:** aceptada — **manda el funnel (opción B)**

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

**Decisión.** Opción B. El "60" es un volumen arbitrario de datos de relleno; las
tasas del funnel están atadas a la definición oficial de `07-metricas-y-kpis.md` y
al pitch de la reunión. Un dashboard con un embudo roto cuesta más que un JSON más
grande.

**Consecuencias.**

> **Actualizado el 2026-09-09 por `ADR-024`.** Las cifras de abajo ya reflejan el
> reencuadre a servicios; la decisión de fondo —manda el funnel, no el número
> arbitrario de órdenes— no cambió.

- `scripts/generate-mock-data.ts` genera aproximadamente **2.400 transacciones**
  en los últimos 90 días, no 60: unas 520 órdenes con ítems físicos y el resto
  altas de servicio y upgrades de plan.
- Las cifras completas del período de referencia están en `07-metricas-y-kpis.md`,
  que es la única fuente. En resumen: 58.000 abonados → 6.960 visitas → 3.480
  validados → 1.450 convertidos → ~2.400 transacciones → GMV ≈ $147M y MRR al
  cierre ≈ $18,1M por mes.
- Se mantiene el ticket promedio de producto físico entre $180.000 y $260.000 que
  pide la sección 8.4.
- `/admin/pedidos` necesita **paginación** desde el principio: una tabla de miles
  de filas sin paginar no es usable ni rápida. Se documenta en el plan de diseño.
- Se mantienen todos los invariantes de `07-metricas-y-kpis.md`, que el generador
  valida antes de escribir los archivos.

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

---

## ADR-018 — El camino de la reunión es `/ingresar` → `/tienda`
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El kickoff se contradice. La tabla de la sección 2.1 pone el momento
2 de la demo como `/ingresar` → `/tienda`. La sección 12 dice que si el abonado
valida desde el hero, la revelación ocurre ahí mismo y "ese es el momento de la
reunión". No pueden ser los dos el camino principal: definen dónde va el pulido
fino y qué se captura en el checkpoint visual.

**Decisión.** Se implementan los dos, pero el camino que se recorre frente al
dueño del ISP es **`/ingresar` → `/tienda`**. Ahí va el pulido fino y de ahí sale
la captura del checkpoint del paso 7.

**Alternativas descartadas.** El hero como camino principal (más impactante por no
tener corte visual, pero deja la pantalla de validación y sus cuatro estados sin
mostrarse, que es media respuesta a "¿cómo lo ve mi abonado?"). Pulir los dos por
igual (cuesta tiempo en el paso P1, que es el crítico).

**Consecuencias.**

- La revelación tiene que **sobrevivir una navegación de cliente**. Los providers
  van en `(store)/layout.tsx`, por encima de las páginas, así que no se desmontan
  al cambiar de ruta. Si estuvieran en cada página, el flag se consumiría en
  `/ingresar` y la animación se perdería en el camino.
- El escalonado corre sobre la **grilla completa del catálogo**, no sobre seis
  destacados. El índice de retraso se topea en 11 para que los últimos productos
  no queden colgando varios segundos.
- `/ingresar` pasa a ser P1 crítica con sus cuatro estados pulidos, no una pantalla
  de paso.

---

## ADR-019 — El usuario del admin se deriva del dominio del tenant
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** La sección 10 del kickoff da las credenciales del admin como
`admin@zondafibra.com.ar` / `demo`. Pero la sección 16 exige que
`grep -ri "zonda" src/components src/app` dé cero resultados y que ningún texto de
marca viva fuera de `tenant.json` — y `tenant.json` no tiene ningún campo para el
usuario del admin. Tal como está enunciado, una de las dos reglas se rompe.

**Decisión.** El usuario se deriva: `admin@${tenant.website}`. Con el tenant de la
demo eso da exactamente `admin@zondafibra.com.ar`. La clave queda en `demo`, que
no es texto de marca.

**Alternativas descartadas.** Agregar un bloque `demoAdmin: { email, password }` a
`tenant.json`: más explícito, pero mete en la configuración del tenant un campo
que en producción no existe, porque el login real llega en la Fase 2. Dejarlo en
`src/lib/`: pasaría el grep del criterio de aceptación —que solo mira
`src/components` y `src/app`— pero violaría igual la regla de fondo.

**Consecuencias.** Un tenant nuevo hereda su usuario de admin sin configurar nada.
Cuando llegue la auth real, esto se borra entero en lugar de migrarse.

---

## ADR-020 — Prefijos de id de producto por categoría
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El kickoff muestra el formato de id solo para una categoría
(`con-001`, conectividad) y no define las otras cuatro.

**Decisión.** `con-` conectividad · `seg-` seguridad · `ent-` entretenimiento ·
`tec-` tecnología · `hog-` hogar conectado. Tres dígitos, secuencia por categoría.

**Consecuencias.** Ninguna más allá de la legibilidad. El id no se muestra al
abonado; la URL usa `slug` y la referencia comercial es el `sku`.

---

## ADR-021 — `noUncheckedIndexedAccess` activado
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El kickoff pide "TypeScript estricto, sin `any`". `strict: true` no
cubre el acceso por índice: `products[0]` se tipa como `Product` aunque el arreglo
esté vacío, y toda la app lee datos de archivos JSON por índice y por clave.

**Decisión.** Sumar `noUncheckedIndexedAccess: true` al `tsconfig.json`.

**Alternativas descartadas.** `exactOptionalPropertyTypes`: también es útil, pero
genera fricción constante con las props opcionales de React sin aportar seguridad
donde importa acá.

**Consecuencias.** Buscar un producto o un abonado devuelve `T | undefined` y hay
que manejar el caso. Es exactamente lo que se quiere: un slug inexistente tiene
que dar 404, no reventar en runtime.

---

## ADR-022 — Prettier no toca Markdown
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** Prettier reformatea tablas y reflowea párrafos en Markdown. Al
correrlo por primera vez quiso reescribir los diez documentos de `docs/`, además
de `KICKOFF.md`.

**Decisión.** `*.md` va a `.prettierignore`. Prettier queda para código
(`.ts`, `.tsx`, `.css`, `.json`, `.mjs`, `.mts`, `.yaml`).

**Consecuencias.** `KICKOFF.md`, que es el documento de especificación del
proyecto, no se reformatea nunca. Las tablas y los wireframes ASCII de los docs
conservan la alineación manual, que es la que los hace legibles.

---

## ADR-023 — `formatARS()` adelantado al paso 2
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El paso 2 tiene que dejar `pnpm test` verificado, pero los tests
reales (`pricing`, `eligibility`) son del paso 4. Vitest falla si no encuentra
ningún archivo de test.

**Decisión.** Adelantar `src/lib/format.ts` con `formatARS()` y su test, en lugar
de usar `--passWithNoTests`.

**Alternativas descartadas.** `--passWithNoTests` en el script: dejaría un flag
que después esconde un patrón de búsqueda roto sin avisar.

**Consecuencias.** El toolchain queda verificado contra código real —resolución
del alias `@/`, transformación de TypeScript, aserciones— y no contra una
ejecución vacía. El test fija además el espacio duro (U+00A0) que el locale
`es-AR` mete entre el `$` y la cifra: si una versión de Node o de ICU lo
cambiara, se rompería el formato de precios en toda la app y este es el único
lugar donde saltaría.

---

## ADR-024 — Reencuadre: tienda de servicios y beneficios, no de productos físicos
**Fecha:** 2026-09-09 · **Estado:** aceptada · **Reemplaza el eje de `KICKOFF.md` §1 y §8.2**

**Contexto.** El kickoff describe el producto como una tienda de productos físicos
con elegibilidad por DNI. Una tienda de productos físicos compite con MercadoLibre
y pierde: mismo producto, mejor logística del otro lado, y el único diferencial es
un 6% a 14% de descuento.

El encuadre correcto es **"Mi Cuenta / Mi Movistar como servicio"**: la tienda es
el espacio del abonado en su ISP, donde ve su plan, sus beneficios y los servicios
que puede sumar. Ahí el ISP no compite con nadie, porque **nadie más puede cobrarle
a ese abonado en la factura que ya paga todos los meses**.

**Decisión.** El catálogo pasa a ser mayoritariamente de **servicios** —TV y
streaming, celular, gaming, seguridad digital y upgrades del propio plan— con los
productos físicos como góndola secundaria. La landing abre con las categorías de
servicio.

**Alternativas descartadas.** Mantener el eje de productos físicos (compite de
frente con el e-commerce generalista). Tienda de servicios pura, sin hardware
(pitch más filoso, pero deja sin usar todo el flujo de carrito, envío y pedido que
ocupa las pantallas P2 del guion de demo).

**Consecuencias.**

- **La conversión pasa a ser creíble.** Pedirle a un abonado que gaste $220.000 de
  una vez es una decisión de compra; pedirle que sume $6.000 por mes a una factura
  que ya paga es casi un clic. La hipótesis de 2% a 5% de compradores del kickoff
  era dudosa para hardware y es razonable para servicios — y esa hipótesis es la
  que sostiene el dashboard que responde "¿qué gano?".
- **El ingreso pasa a ser recurrente.** Todo el modelo de métricas medía GMV, que
  es de un solo tiro. Ver `ADR-028`.
- **Baja el riesgo operativo del piloto.** Un servicio no tiene stock, ni envío, ni
  devoluciones, ni logística inversa. Es la objeción más grande que el dueño del
  ISP podía poner sobre la mesa, y desaparece del argumento principal.
- **Riesgo que queda del otro lado:** conseguir acuerdos con proveedores de
  streaming o de telefonía es bastante más difícil que comprarle routers a un
  mayorista. En la demo son marcas ficticias y no importa; en la Fase 1 es el
  camino crítico.
- `KICKOFF.md` **no se modifica**: queda como registro de la especificación
  original, tal como fue escrita. Todo el reencuadre vive en `docs/` y su traza
  está acá. Cada ADR que se aparta del kickoff lo dice en su encabezado, así que
  la diferencia entre "lo que se pidió" y "lo que se decidió después" es
  auditable. Los ADR que se apartan son `ADR-024`, `ADR-026` y `ADR-029`.

---

## ADR-025 — Composición del catálogo: 18 servicios y 12 productos
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** La sección 14 del kickoff topea el catálogo en 30 ítems. Con dos
tipos de ítem hay que repartirlos.

**Decisión.** 18 servicios y 12 productos físicos. Categorías:

| Tipo | Categoría | id | Cantidad |
|---|---|---|---|
| Servicio | TV y streaming | `tv` | 5 |
| Servicio | Celular | `celular` | 3 |
| Servicio | Gaming | `gaming` | 3 |
| Servicio | Seguridad digital | `seguridad-digital` | 3 |
| Servicio | Tu plan de Internet | `plan` | 4 |
| Producto | Conectividad | `conectividad` | 3 |
| Producto | Seguridad del hogar | `seguridad` | 3 |
| Producto | Entretenimiento | `entretenimiento` | 2 |
| Producto | Tecnología | `tecnologia` | 2 |
| Producto | Hogar conectado | `hogar` | 2 |

La landing abre con **TV · Celular · Gaming**, que es el orden del boceto de MVP.
Los productos físicos quedan como segunda góndola, más abajo.

**Consecuencias.** Los dos ítems sin stock y el ítem inactivo que pide el kickoff
para probar esos estados salen del bloque de productos físicos, que es donde esos
estados existen. Un servicio no tiene stock.

---

## ADR-026 — El débito en la factura del ISP es el método de pago principal
**Fecha:** 2026-09-09 · **Estado:** aceptada · **Invierte `KICKOFF.md` §9**

**Contexto.** El kickoff lista tres métodos de pago en el checkout y marca
"Débito en la factura de {tenant.name}" como *próximamente*, deshabilitado.

Esa línea gris es la única capacidad que ningún competidor puede copiar, y estaba
apagada.

**Decisión.** El débito en factura pasa a ser el método **principal y
preseleccionado**. Mercado Pago y tarjeta quedan como alternativas. Para los
servicios es además el único método: un servicio recurrente se cobra en la factura.

**Consecuencias.**

- Elimina la dependencia de la pasarela de pagos para el piloto de servicios. No
  hace falta integrar Mercado Pago para facturar un servicio: hace falta un
  concepto más en la factura que el ISP ya emite todos los meses.
- El checkout de un servicio no pide dirección de entrega ni datos de pago. Es
  confirmar y listo, lo que lo vuelve el flujo más corto y más demostrable.
- En la Fase 1 aparece un punto de corte nuevo: la conciliación con el sistema de
  facturación del ISP. Es más simple que una pasarela, pero es integración real.

---

## ADR-027 — Los planes del ISP entran al catálogo como ítems destacados
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El ítem de mayor margen posible no es un router: es que un abonado
de Fibra 100 pase a Fibra 300. Costo de mercadería cero, infraestructura ya
instalada, cobranza ya montada.

**Decisión.** Los upgrades de plan del propio ISP entran al catálogo como
servicios de categoría `plan`, con un módulo propio y personalizado en la tienda:
*"Tenés Fibra 100 — pasá a Fibra 300 por $X más por mes"*.

Cada upgrade declara `fromPlanId` y `toPlanId`, así que la tienda le muestra a
cada abonado **solo el upgrade que le corresponde según su plan actual**. Quien ya
está en el plan más alto no ve el módulo.

**Alternativas descartadas.** Meterlos como una categoría más sin tratamiento
especial (desperdicia el argumento). Dejarlos afuera (deja el catálogo solo con
beneficios de terceros y saca de la mesa el argumento económico más fuerte).

**Consecuencias.**

- Convierte la tienda de "un beneficio para tus abonados" en "un canal de venta
  sobre tu propia base". Es la diferencia entre un costo y una inversión.
- Es también el mejor momento de personalización de la demo: dos abonados de
  prueba con planes distintos ven módulos distintos. Refuerza el "Mi Movistar".
- El reparto de ingresos se invierte para este tipo de ítem: el servicio es del
  ISP, así que el ISP se queda con casi todo y la plataforma cobra una comisión de
  canal. Ver `ADR-029`.

---

## ADR-028 — Métricas recurrentes junto al GMV
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El funnel oficial termina en GMV e ingreso del ISP, que son medidas
de un negocio transaccional. Con los servicios liderando, el número que importa es
el recurrente.

**Decisión.** El funnel se mantiene, pero desemboca en **dos resultados**: GMV del
período (un solo tiro más lo facturado de recurrentes) e **ingreso recurrente
mensual** al cierre del período. Se suman como métricas oficiales: servicios
activos, MRR, ARPU incremental por abonado e ingreso recurrente del ISP.

**Consecuencias.** El dashboard muestra menos GMV que en el modelo anterior y
**más ingreso para el ISP**, porque el reparto sobre servicios es mucho más
favorable que sobre reventa de hardware. Es exactamente la conversación que
conviene tener en la reunión: menos volumen, más margen, y que vuelve todos los
meses.

---

## ADR-029 — El reparto de ingresos depende del tipo de ítem
**Fecha:** 2026-09-09 · **Estado:** aceptada · **Cambia la forma de `tenant.json`**

**Contexto.** El kickoff define `revenueShare` como dos números fijos (`isp` 0,03
y `platform` 0,05). Eso solo tiene sentido para reventa de hardware, donde el
margen total ronda el 10%. Un servicio recurrente tiene un margen mucho mayor, y
un upgrade del plan propio del ISP no tiene costo de mercadería en absoluto.

Un mismo porcentaje para los tres casos daría cifras sin sentido.

**Decisión.** `revenueShare` pasa a tener una entrada por tipo de ítem:

```json
"revenueShare": {
  "products":     { "isp": 0.03, "platform": 0.05 },
  "services":     { "isp": 0.25, "platform": 0.15 },
  "planUpgrades": { "isp": 1.00, "platform": 0.00 }
}
```

**Hipótesis de trabajo, no números negociados.** El reparto real se acuerda con
cada ISP; estos valores existen para que el dashboard muestre cifras coherentes.

### La regla de fondo: el ISP nunca paga comisión sobre lo que ya es suyo

Había dos cosas mezcladas bajo la palabra "comisión", y separarlas ordena el
modelo entero:

| | De dónde sale el margen de la plataforma | ¿El ISP paga algo? |
|---|---|---|
| **Producto físico** | Del proveedor: se compra mayorista y se vende minorista | No |
| **Servicio de terceros** | Del proveedor del servicio, por llevarle distribución | No |
| **Upgrade de plan** | No hay proveedor — **el proveedor es el ISP** | Sería lo único que le cobraríamos |

Por eso `planUpgrades.platform` es **cero**. El módulo de upgrade de plan es una
herramienta que le damos al ISP para vender lo suyo, no un canal por el que le
cobramos. La diferencia entre *"te ayudo a vender lo tuyo"* y *"te cobro por
vender lo tuyo"* se juega enteramente en ese número, y en una reunión donde
estamos pidiendo acceso a su base de abonados, cobrarle por vender su propio
producto es el peor lugar posible para poner un porcentaje.

El `0.00` queda **explícito en la configuración**, no hardcodeado: es una decisión
comercial revisable en la Fase 2 o 3, no una propiedad del software.

**Consecuencias.**

- En productos físicos la plataforma gana más que el ISP, porque asume el catálogo
  y el fulfillment. En servicios se invierte, porque el ISP pone la relación con
  el cliente y la cobranza. En upgrades de plan el ISP se queda con todo.
- El ingreso del ISP **sube** respecto del reparto anterior, y el de la plataforma
  baja. Es a propósito: el upgrade de plan es el argumento de venta de la
  propuesta, no una fuente de ingresos.
- La plataforma se financia con el fee SaaS, el setup y el margen de proveedor.
  Ninguna de las tres es una comisión sobre las ventas del ISP.
- Se desvía de la forma de `tenant.json` que fija `KICKOFF.md` §4. Como el kickoff
  queda intacto (`ADR-024`), esta es la única constancia del cambio.
- `metrics.ts` y el dashboard calculan el ingreso del ISP sumando los tres tramos,
  no multiplicando el GMV por un número.

---

## ADR-030 — La ruta de detalle es `/beneficio/[slug]`
**Fecha:** 2026-09-09 · **Estado:** aceptada

**Contexto.** El kickoff define `/producto/[slug]`. Con el catálogo unificado, esa
URL le queda mal a un pack de streaming o a un upgrade de plan.

**Decisión.** Una sola ruta de detalle para los dos tipos:
`/beneficio/[slug]`. La vista se adapta según `kind`.

**Alternativas descartadas.** `/producto/[slug]` más `/servicio/[slug]`: duplica
la ruta, el `generateStaticParams` y el layout para ganar poco, y obliga a saber
el tipo antes de armar un link. `/item/[slug]`: las rutas las ve el abonado y
tienen que estar en castellano.

**Consecuencias.** La fila 3 del guion de demo pasa a `/beneficio/[slug]`. El
componente de detalle discrimina por `kind`: el producto muestra stock, envío y
cuotas; el servicio muestra permanencia, cuándo se activa y desde qué factura se
cobra.

---

## ADR-031 — El copy del tenant se reescribe para el eje de servicios
**Fecha:** 2026-09-09 · **Estado:** aceptada · **Cambia `storeCopy` en `KICKOFF.md` §4**

**Contexto.** `storeCopy` es lo primero que ve el dueño del ISP en la landing, que
es la pantalla 1 del guion de demo. El texto del kickoff es de una tienda de
productos:

> *"Beneficios exclusivos para clientes de Zonda Fibra"*
> *"Tecnología, conectividad y hogar con precios que solo tenés por ser cliente."*
> Paso 3: *"Comprás con precio exclusivo y lo recibís en tu casa."*

Bajo el encuadre de servicios, el tercer paso —recibirlo en tu casa— describe el
caso menos importante, y el subtítulo enumera categorías de hardware.

**Decisión.** Nuevo `storeCopy` para el tenant de la demo:

```json
"storeCopy": {
  "heroTitle": "Todo lo que podés sumar a tu Zonda Fibra",
  "heroSubtitle": "TV, celular, gaming y seguridad digital, con precio de cliente y en la misma factura que ya pagás.",
  "howItWorks": [
    "Ingresá tu DNI o número de cliente.",
    "Confirmamos que tu cuenta esté activa.",
    "Lo sumás a tu factura y lo usás enseguida."
  ]
}
```

**Por qué así.**

- *"Todo lo que podés sumar"* posiciona la tienda como una extensión del servicio
  que el abonado ya tiene, no como un negocio aparte. Es la idea de "Mi Cuenta".
- *"en la misma factura que ya pagás"* es el diferencial dicho en seis palabras, y
  está arriba de todo en lugar de escondido en el checkout.
- El tercer paso ya no habla de logística. Habla de que no hay fricción.

**Consecuencias.** El texto vive en `tenant.json`, así que otro ISP lo cambia sin
tocar código. La regla de interpolación no cambia: ningún componente escribe el
nombre del ISP.

---

## ADR-032 — Guion de demo actualizado al eje de servicios
**Fecha:** 2026-09-09 · **Estado:** aceptada · **Reemplaza `KICKOFF.md` §2.1**

**Contexto.** El guion de demo define el orden de implementación, el orden de QA y
qué se recorta si falta tiempo. El del kickoff recorre una tienda de productos y
no muestra ninguno de los dos momentos que ahora son los más persuasivos: el
servicio incluido en el plan premium y el módulo de upgrade del plan propio.

**Decisión.** Guion nuevo:

| # | Momento | Ruta | Prioridad |
|---|---|---|---|
| 1 | "Así lo ve tu abonado": landing con la marca del ISP y el gate de DNI | `/` | **P1** |
| 2 | Validar DNI `30111222` → revelación del precio | `/ingresar` → `/tienda` | **P1** |
| 3 | **"Y esto te vende lo tuyo": el módulo de upgrade de plan, personalizado** | `/tienda` | **P1** |
| 4 | El mismo servicio: $9.900 para Lucía, "Incluido en tu plan" para Martín | `/beneficio/[slug]` | **P1** |
| 5 | "Esto es tu marca, no la nuestra": cambiar dos colores en vivo | `/admin/marca` | **P1** |
| 6 | Contratar un servicio en dos pasos, sin tarjeta ni dirección | `/beneficio` → `/checkout` → `/pedido/[id]` | P2 |
| 7 | "Esto es lo que ganás": funnel, MRR e ingreso del ISP | `/admin/dashboard` | P2 |
| 8 | Reporte del piloto imprimible | `/admin/reportes` | P2 |
| 9 | Comprar un producto físico: carrito → checkout → envío | `/carrito` → `/checkout` → `/pedido/[id]` | P3 |
| 10 | Resto: mis servicios, mis pedidos, cómo funciona, catálogo, promos, pedidos, abonados | varias | P3 |

**Qué cambió y por qué.**

- **Entra el momento 3.** Es el único de todo el guion que responde "y esto además
  me vende a mí". No cuesta una pantalla nueva: el módulo vive en `/tienda`, que
  ya es P1.
- **El momento 4 pasa a ser un par, no una pantalla.** Mostrar el mismo servicio
  con dos abonados distintos hace concreto el beneficio del plan premium; un 12%
  de descuento explicado no lo hace.
- **El alta de servicio sube a P2 y la compra física baja a P3.** El flujo de dos
  pasos, sin tarjeta ni dirección, es el que muestra el diferencial. El carrito
  con envío es el flujo que cualquier tienda tiene.

**Consecuencias.** Cinco momentos P1 en lugar de cuatro, pero sobre las mismas
cinco pantallas. El costo marginal es un módulo, no una vista. Si falta tiempo, lo
que se recorta primero es la compra física completa, que pasó a P3.

---

## ADR-033 — Integración con los ISPs por niveles, arrancando sin integración
**Fecha:** 2026-09-09 · **Estado:** aceptada · **Aplica desde la Fase 1**

**Contexto.** Cada ISP tiene un sistema de gestión distinto —Wispro, MikroWisp,
ISPCube, UISP, desarrollos propios, planillas— y un operador chico normalmente
**alquila** esa plataforma en lugar de controlarla. Pedirle que consiga desarrollo
de su proveedor antes de ver un resultado es pedirle que arriesgue primero.

Si conectar un ISP cuesta tres meses de trabajo a medida, el escenario de 50
operadores no existe. Esto no es un detalle de implementación: es el cuello de
botella del negocio.

**Decisión.** Un modelo de **conector en cuatro niveles**, documentado en
`08-integracion-con-isps.md`, donde cada nivel habilita más funcionalidad:

| Nivel | Mecanismo | Alta |
|---|---|---|
| 0 | CSV que el operador sube al panel | Días |
| 1 | Export automático a SFTP, S3 o URL | 1 a 2 semanas |
| 2 | API de consulta en tiempo real | 2 a 4 semanas |
| 3 | Bidireccional: facturación y aprovisionamiento | 1 a 3 meses |

**El piloto arranca en nivel 0.** En los niveles 0 a 2 el alta de un servicio
genera una cola de trabajo en el panel del operador, que la carga en su sistema y
la marca como procesada. Es manual, pero es acotado, visible y no bloquea el
arranque.

**Alternativas descartadas.** Exigir API desde el principio: filtra a la mayoría
de los operadores chicos, que son justamente el segmento. Integrarse con una
plataforma específica primero: ata la propuesta a que el ISP use esa plataforma.

**Consecuencias para el código de la Fase 0.**

- **`Subscriber` es un contrato.** Su forma en `03-modelo-de-datos.md` es el
  modelo normalizado; el trabajo de un conector es producir esa forma. Nada fuera
  de `eligibility.ts` conoce el formato original de ningún ISP.
- **`checkSubscriber()` tiene que poder volverse asíncrona** sin arrastrar cambios
  (ya previsto en `ADR-017`).
- **Los datos de abonados llevan fecha.** En niveles 0 y 1 están desactualizados
  por definición, y el panel tiene que poder mostrar de cuándo son. Es un campo,
  pero agregarlo tarde se nota.
- Nada de esto se implementa en la Fase 0. Se documenta para que las decisiones de
  hoy no lo bloqueen.
