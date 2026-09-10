# Arquitectura

## Capas

```
┌──────────────────────────────────────────────────────────────────┐
│  src/tenants/<id>/tenant.json        configuración del ISP       │
│           │                                                      │
│           ▼                                                      │
│  src/lib/tenant.ts  →  resolveTheme()  →  CSS custom properties  │
│           │                                                      │
│           ▼                                                      │
│  src/app/layout.tsx   inyecta las variables en <html>            │
│           │                                                      │
│           ▼                                                      │
│  globals.css   mapea las variables a utilidades de Tailwind      │
│           │                                                      │
│           ▼                                                      │
│  componentes    usan bg-primary / text-muted / rounded-base      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  src/data/*.json  +  src/tenants/<id>/*.json      datos           │
│           │                                                      │
│           ▼                                                      │
│  src/lib/*        funciones puras de acceso y cálculo            │
│           │                                                      │
│           ├──▶  Server Components   datos base, sin sesión       │
│           │                                                      │
│           ▼                                                      │
│  src/contexts/*   sesión, carrito y overrides (solo cliente)     │
│           │                                                      │
│           ▼                                                      │
│  src/components/*  render final                                  │
└──────────────────────────────────────────────────────────────────┘
```

Regla que sostiene todo: **los componentes nunca importan JSON**. Todo pasa por
`src/lib/*`. Cuando en la Fase 1 el JSON se reemplace por una API, cambia `lib` y
nada más.

## Qué es de la plataforma y qué es del tenant

| Dato | Dueño | Ubicación | Por qué |
|---|---|---|---|
| Catálogo de productos | Plataforma | `src/data/products.json` | Se negocia una vez y lo comparten todos los ISPs. Por eso el SKU lleva prefijo `NX-` y no el del ISP |
| Configuración de marca | Tenant | `src/tenants/<id>/tenant.json` | Es lo que hace que la tienda sea del ISP |
| Abonados | Tenant | `src/tenants/<id>/subscribers.json` | Es la base de clientes del ISP; en producción nunca sale de su sistema |
| Promociones | Tenant | `src/tenants/<id>/promotions.json` | Cada ISP decide sus promos |
| Órdenes | Tenant | `src/tenants/<id>/orders.json` | Generadas por script; en producción van a base de datos |
| Métricas | Tenant | `src/tenants/<id>/metrics.json` | Derivadas de las órdenes |

## Resolución del tenant

`src/tenants/index.ts` mantiene un registro `id → Tenant` y expone la resolución
del tenant activo desde `NEXT_PUBLIC_TENANT`, con `zonda` como default. Si el id
no existe en el registro, se falla en build con un mensaje claro en lugar de
degradar silenciosamente.

La resolución por subdominio es de la Fase 2. El único lugar que cambia es este
archivo: nada más en la aplicación sabe cómo se eligió el tenant.

## Theming

`resolveThemeVars(tenant.theme)` transforma la configuración del tenant en un
objeto plano de custom properties. Ese objeto se inyecta con el atributo `style`
sobre `<html>` en el layout raíz — no como una etiqueta `<style>`: no agrega un
nodo al DOM, no necesita `dangerouslySetInnerHTML` ni `nonce` de CSP, gana en
especificidad sobre cualquier regla de `:root`, viaja en el primer byte del HTML
(sin FOUC) y su valor es determinístico desde `tenant.json`, así que no puede
producir un mismatch de hidratación.

### Dos capas de nombres

Es importante que no se llamen igual, o el mapeo queda circular y muere en
silencio:

| Capa | Ejemplos | Quién las define |
|---|---|---|
| **Variables de marca** | `--brand-primary`, `--brand-radius`, `--font-heading` | Se inyectan en runtime desde el tenant o desde un override |
| **Claves del tema** | `--color-primary`, `--radius-base`, `--font-display` | Las declara `globals.css` en `@theme inline`, apuntando a las anteriores |

`@theme inline` no es una preferencia de estilo, es un requisito: hace que la
utilidad quede como `.bg-primary { background-color: var(--brand-primary) }`, con
el `var()` resolviéndose **en el elemento que la consume** y no en `:root`. Sin
`inline`, un override en un contenedor anidado no tendría ningún efecto. El
razonamiento completo está en `ADR-011`.

Los tonos de hover se derivan con `color-mix()` a partir de lo que resuelva el
primario en cada ámbito, así que siguen a los overrides sin trabajo extra. El
tenant puede fijarlos explícitamente si quiere.

Dos consecuencias que hay que preservar:

1. **Ningún hex vive en un componente.** Verificable con
   `grep -riE "#[0-9a-fA-F]{6}" src/components src/app` → 0 resultados.
2. **Las variables de marca se pueden redefinir en un contenedor scoped.** De eso
   depende el preview en vivo de `/admin/marca`: se envuelve la landing real en un
   `div` con las custom properties del override y se retematiza sola, sin prop
   drilling, sin iframe y sin una maqueta paralela. Las ilustraciones de producto
   usan `currentColor` sobre la clase `text-primary` (ver `ADR-016`), así que
   heredan el ámbito y también cambian.

### Tipografías

`next/font/google` no puede cargar fuentes en runtime: los nombres de clase se
generan en build. Por eso hay **tres presets fijos** en `src/lib/fonts.ts`, los
tres se cargan en el layout raíz, y el tenant elige uno con `theme.fontPreset`.
Cada preset expone su par de fuentes como variables (`--font-heading`,
`--font-body`), lo que permite que el editor de marca cambie de preset —y que el
contenedor scoped del preview use uno distinto del resto de la página— sin
recargar.

## Estado y persistencia

Todo lo persistente vive en `localStorage`, con las claves centralizadas en
`src/lib/storage-keys.ts`. Ningún componente escribe una clave a mano.

| Clave | Dueño | Contenido | Vida |
|---|---|---|---|
| `nexo:session:<tenantId>` | `SessionContext` | Abonado validado: id, nombre, plan, tier, `validatedAt` | 24 h |
| `nexo:cart:<tenantId>` | `CartContext` | `{ productId, quantity }[]` — **nunca precios** | Hasta vaciarse |
| `nexo:orders:<tenantId>` | `CartContext` / `orders.ts` | Órdenes creadas durante la demo | Persistente |
| `nexo:admin-session:<tenantId>` | `AdminContext` | Sesión del admin mock | Persistente |
| `nexo:admin-overrides:<tenantId>` | `AdminContext` | Overrides parciales de catálogo, promos y marca | Persistente |
| `nexo:reveal:<tenantId>` | `SessionContext` | Flag one-shot de revelación (en **`sessionStorage`**) | Se consume una vez |

"Restablecer demo" borra todas las claves `nexo:*` del tenant activo y recarga.

## Regla de hidratación

El servidor renderiza **siempre sin sesión**. La sesión y los overrides solo
existen en el cliente.

De ahí sale la regla que hace que la demo no se rompa:

> **Ningún precio se renderiza hasta conocer el estado de sesión en el cliente.**

Cada contexto expone `status: 'loading' | 'ready'`. Mientras `status === 'loading'`,
los componentes de precio muestran un skeleton **del mismo tamaño exacto** que el
precio final. Así:

- No hay flash de "precio público → precio exclusivo" al recargar con sesión.
- No hay layout shift.
- No hay mismatch de hidratación, porque el primer render del cliente es idéntico
  al del servidor.
- La revelación del precio ocurre **una sola vez**, cuando corresponde, y no como
  efecto colateral de una recarga.

Nada que lea `localStorage` corre durante el render inicial: la lectura ocurre en
un efecto, después del primer commit.

## La revelación del precio

Es el elemento memorable de la demo y su mecánica está acá porque es
arquitectura, no decoración.

```
1. El abonado valida el DNI (desde el hero de la landing o desde /ingresar)
2. checkSubscriber() devuelve active
3. SessionContext crea la sesión y marca el flag one-shot en sessionStorage
4. La primera pantalla con precios que se renderiza después:
      - consume el flag y lo borra
      - corre una única animación orquestada: los precios bajan al exclusivo
        y aparece el ahorro
5. Cualquier carga posterior muestra el exclusivo directamente, sin animación
```

Dos caminos, los dos implementados:

- **Desde `/ingresar`** — *este es el camino de la reunión* (`ADR-018`). Se
  redirige a `?next=` o a `/tienda` y la revelación ocurre al llegar, escalonada
  sobre la grilla del catálogo. Dos consecuencias de diseño: la revelación tiene
  que **sobrevivir la navegación de cliente**, y el escalonado corre sobre muchos
  más precios que en el hero, así que el índice se topea (ver más abajo) para que
  los últimos no queden colgando.
- **Desde el hero de la landing:** no se navega, la revelación ocurre ahí mismo
  sobre los destacados. Lo pide la sección 12 del kickoff y se implementa, pero no
  es el camino que se recorre en la reunión.

`prefers-reduced-motion: reduce` desactiva la animación; el resultado final es el
mismo, se llega sin transición. Se resuelve **solo en CSS**: llamar a `matchMedia()`
durante el render sería una fuente de mismatch de hidratación.

### Cómo se orquesta el escalonado

`SessionContext` expone una única fase (`idle | running | done`) y cada precio
recibe su `revealIndex` desde el `map` de la lista. El retraso sale de CSS:
`animation-delay: calc(var(--reveal-index) * 55ms)`.

Se descartaron dos alternativas:

- **Un contador de estado que avanza en el contexto:** N actualizaciones de estado
  por N suscriptores es una tormenta de re-renders en el hilo principal, justo
  durante la única animación que tiene que verse perfecta.
- **Web Animations API:** exige una ref por precio, un registro imperativo, manejo
  manual de `prefers-reduced-motion`, y pelea con la reconciliación cuando un
  componente se monta a mitad de la animación.

Con CSS hay una sola transición de estado en total, la animación corre en el
compositor, el escalonado es gratis, y un precio que se monta tarde —porque se
navegó a `/tienda` mientras corría— toma el retraso correcto sin contabilidad
alguna.

El flag se borra de `sessionStorage` **antes** de arrancar la animación y hay un
`ref` que marca que ya se consumió, así que ni una recarga ni la doble invocación
de efectos de StrictMode en desarrollo la repiten.

## Server y client por pantalla

Patrón único, sin excepciones:

```
page.tsx        Server Component. Carga datos base con src/lib/*.
                Sin sesión, sin overrides, sin localStorage.
   │
   └──▶  <XView />   Client Component. Aplica sesión, overrides y
                     estado de UI sobre los datos que recibió.
```

Las rutas dinámicas (`/producto/[slug]`, `/tienda/[category]`) usan
`generateStaticParams` sobre el catálogo base.

`"use client"` aparece solo donde hay estado o eventos. Los contextos y los
componentes de precio son client por definición; las páginas no.

### Dónde viven los providers

`SessionProvider` y `CartProvider` van en `(store)/layout.tsx`, **no en el layout
raíz**. Dos razones: el admin no tiene que compartir la sesión del abonado, y el
preview de marca renderiza componentes de tienda que si no revelarían precios
dentro del panel.

Como `(store)/layout.tsx` es un Server Component, monta un componente
`"use client"` que envuelve a los providers. Poner `"use client"` en el layout
mismo convertiría todo el subárbol en cliente y perdería el renderizado del
catálogo en el servidor.

El provider vive por encima de las páginas de la tienda, así que no se desmonta al
navegar: por eso la revelación disparada desde `/ingresar` sobrevive al cambio de
ruta hacia `/tienda`.

## Cómo se simula cada cosa

| Concepto | Simulación en Fase 0 |
|---|---|
| Elegibilidad | `checkSubscriber()` busca en `subscribers.json` del tenant tras normalizar la entrada a dígitos |
| Sesión del abonado | Objeto en `localStorage` con vencimiento a 24 h. No hay token ni verificación |
| Login del admin | Comparación de usuario y clave en el cliente. Decorativo |
| Pago | Un botón "Simular pago aprobado". No se piden datos de tarjeta ni se llama a nada |
| Creación de orden | `createOrder()` genera el id `{orderPrefix}-{año}-{4 dígitos}`, estado `paid`, y la guarda en `localStorage` |
| Historial de órdenes | `getOrders()` devuelve las mock del JSON más las creadas en la demo |
| Cambios del admin | Overrides parciales sobre los JSON base; la tienda lee `base + overrides` vía `applyOverrides()` |

## Puntos de corte hacia la Fase 1

Los tres lugares donde el mock se convierte en integración real. La arquitectura
existe para que estos reemplazos sean localizados y no una reescritura.

| # | Archivo | Hoy | Fase 1 |
|---|---|---|---|
| 1 | `src/lib/eligibility.ts` | Lee `subscribers.json` | Consulta la API o el archivo de abonados elegibles del ISP. La firma de `checkSubscriber()` pasa a asíncrona; el resto de la app no cambia |
| 2 | `src/lib/orders.ts` → `createOrder()` | Escribe en `localStorage` | Crea la orden contra la base de datos, después de que Mercado Pago confirme el pago |
| 3 | `src/contexts/AdminContext.tsx` | Overrides en `localStorage` | Escribe contra la API de administración; la tienda deja de necesitar `applyOverrides()` porque los datos ya vienen aplicados |

Los tres están marcados con un comentario `// PUNTO DE CORTE FASE 1` en el código.

## Convenciones que hacen que esto se sostenga

- TypeScript estricto, sin `any` y sin `as unknown as`. Los tipos viven en
  `src/types/index.ts`.
- Las funciones de `src/lib/` son puras y testeables: no tocan `window` y no leen
  el reloj. `pricing.ts` recibe la fecha y las promos por parámetro.
- Moneda siempre por `formatARS()`.
- Rutas en español —las ve el abonado—, archivos y código en inglés.
