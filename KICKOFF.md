# KICKOFF — Plataforma de Beneficios White Label para ISPs

> Archivo de iniciación para Claude Code. Leelo completo antes de ejecutar cualquier cosa.
> Este documento define el proyecto, la Fase 0 (demo visual con datos mock) y todo lo que debe crearse en el repositorio: estructura, `CLAUDE.md`, carpeta `docs/`, datos del cliente ficticio y la aplicación Next.js.

---

## 0. Cómo usar este archivo

1. Leer las secciones 1 a 17 completas.
2. El repositorio es **este directorio** (`isp-solutions/`). No crear una subcarpeta. Si no es un repo git, inicializarlo en el paso 1 (`git init`, rama `main`).
3. Ejecutar los pasos en el orden de la sección 15, sin saltear la documentación inicial.
4. Cualquier decisión que no esté cubierta acá se registra en `docs/DECISIONES.md` antes de implementarla.
5. Si algo es ambiguo, elegir la opción más simple que respete la sección 14 ("Lo que NO se hace en esta fase") y dejarlo anotado.
6. Cuando el tiempo apriete, la prioridad la marca el guion de demo de la sección 2.1, no el orden de las tablas de pantallas.

---

## 1. Contexto del negocio (resumen)

**Qué es:** una plataforma B2B2C (SaaS + marketplace) que permite a ISPs y cableoperadores pequeños y medianos ofrecer a sus abonados una tienda de productos y beneficios exclusivos, con su propia marca, sin desarrollar software, sin comprar stock y sin operar logística.

**Tres actores:**

| Actor | Rol | Qué obtiene |
|---|---|---|
| ISP / cableoperador | Cliente de la plataforma y canal de distribución | Tienda con su marca, fidelización, nueva fuente de ingresos |
| Abonado | Usuario final | Precios y productos exclusivos por ser cliente de su ISP |
| Proveedor | Provee productos y fulfillment | Acceso a demanda agregada de muchos ISPs |

**Posicionamiento:** no es "una tienda online para ISPs". Es *"la plataforma de beneficios para los clientes de tu ISP. Tu propia tienda. Tu marca. Tus clientes. Sin stock ni desarrollo tecnológico."*

**Diferencial técnico central:** la tienda verifica que el visitante sea abonado activo (por DNI o número de cliente) y recién ahí habilita el precio exclusivo. Cliente suspendido → beneficios suspendidos. Esa lógica de elegibilidad es lo que nos separa de una Tiendanube común.

**Modelo de ingresos (a futuro, no se implementa ahora):** setup inicial + fee mensual SaaS por rango de abonados + comisión/margen sobre ventas + promociones patrocinadas + importación propia en fases posteriores.

**Estrategia:** validar primero con un ISP ancla real (60.000 abonados en Provincia de Buenos Aires) como laboratorio y caso de éxito, después replicar a 5–10 ISPs, y recién con volumen negociar proveedores e importación.

**Nombre provisorio de la plataforma:** `Nexo Beneficios` (configurable; se cambia en un solo lugar).

---

## 2. Objetivo de la Fase 0 (esta iniciación)

Construir una **demo navegable y deployable** de la tienda white-label y del panel de administración del ISP, usando un **cliente ficticio** con datos mock, para poder mostrarla al dueño del ISP real antes de invertir en integraciones.

La demo tiene que responder visualmente tres preguntas del dueño del ISP:

1. ¿Cómo lo ve mi abonado? (tienda con mi marca, precio exclusivo al validar DNI)
2. ¿Qué controlo yo? (panel con catálogo, promociones, pedidos, reportes, marca)
3. ¿Qué gano? (dashboard con el funnel oficial de la sección 7 / `07-metricas-y-kpis.md`)

**El pitch de la reunión** (para que el diseño lo tenga presente): *"Quiero desarrollar para ustedes una plataforma de beneficios y tienda exclusiva para sus abonados. Yo asumo el desarrollo y la operación inicial. Ustedes aportan acceso a la base de clientes para validar que sean abonados y promocionan la plataforma. Durante el piloto medimos ventas, conversión y beneficios. Si funciona, lo escalamos."* La demo existe para que esa frase se vea en vez de explicarse.

**Alcance confirmado:**

- Tienda del abonado con flujos simulados: validación de DNI, catálogo, producto, carrito, checkout falso, confirmación y seguimiento de pedido.
- Panel admin del ISP (mock) con dashboard, catálogo, promociones, pedidos, abonados, editor de marca y reportes.
- Todo funciona con datos en archivos JSON + estado en memoria/localStorage. **Sin backend, sin base de datos, sin pagos reales, sin auth real.**
- Diseñado multi-tenant desde el día uno: el tenant es un archivo de configuración y toda la UI se tematiza a partir de él.

### 2.1 Guion de la demo y prioridades

Este es el recorrido exacto que se hace en la reunión. Define el orden de implementación dentro de los pasos 7 y 8, el orden de QA, y qué se recorta si falta tiempo.

| # | Momento | Ruta | Prioridad |
|---|---|---|---|
| 1 | "Así lo ve tu abonado": landing con la marca del ISP y el gate de DNI | `/` | **P1** |
| 2 | Validar DNI `30111222` → revelación del precio exclusivo | `/ingresar` → `/tienda` | **P1** |
| 3 | Producto con ahorro en $ y %, cuotas, stock | `/producto/[slug]` | **P1** |
| 4 | "Esto es tu marca, no la nuestra": cambiar dos colores y ver la landing cambiar en vivo | `/admin/marca` | **P1** |
| 5 | Comprar: carrito → checkout simulado → pedido confirmado | `/carrito` → `/checkout` → `/pedido/[id]` | P2 |
| 6 | "Esto es lo que ganás": funnel e ingreso estimado del ISP | `/admin/dashboard` | P2 |
| 7 | Reporte del piloto imprimible | `/admin/reportes` | P2 |
| 8 | Resto: mis pedidos, cómo funciona, catálogo admin, promociones, pedidos admin, abonados | varias | P3 |

Regla: **P1 completo y pulido antes de tocar P2; P2 antes de P3.** Una P1 impecable vale más que las 16 pantallas a medias.

---

## 3. Decisiones técnicas

| Aspecto | Decisión |
|---|---|
| Framework | Next.js (última estable, App Router) + TypeScript estricto |
| Estilos | Tailwind CSS. Colores, radios y tipografías **siempre** vía CSS variables inyectadas desde el tenant (nunca hex hardcodeado en componentes). Tailwind se configura para que `bg-primary`, `text-muted`, etc. apunten a esas variables |
| Tipografías | `next/font/google` no puede cargar fuentes en runtime. Se definen **3 presets fijos** en `src/lib/fonts.ts` (ej. `sora-plex`, `manrope-inter`, `outfit-source`), los 3 se cargan en `layout.tsx`, y el tenant elige uno con `theme.fontPreset`. `/admin/marca` cambia entre esos mismos 3 |
| Componentes | Propios, sin librería de UI pesada. Se permite `lucide-react` para íconos y `recharts` para gráficos del admin |
| Estado | React Context + hooks. Todo lo persistente va a `localStorage` con claves centralizadas en `src/lib/storage-keys.ts`: `nexo:session:<tenantId>` (abonado), `nexo:cart:<tenantId>`, `nexo:orders:<tenantId>` (órdenes creadas en la demo), `nexo:admin-session:<tenantId>`, `nexo:admin-overrides:<tenantId>` (catálogo/promos/marca) |
| Renderizado | Server Components cargan datos base desde `src/lib/*`. Sesión y overrides viven solo en el cliente. **Regla de hidratación:** ningún precio se renderiza hasta conocer el estado de sesión en el cliente (se muestra un skeleton del tamaño del precio). Así no hay flash "público → exclusivo" y la revelación del precio ocurre una sola vez, cuando corresponde |
| Datos | El **catálogo es de la plataforma**: `src/data/products.json` (compartido por todos los ISPs a futuro). Los **datos del tenant** (abonados, órdenes, métricas, promociones) viven en `src/tenants/<id>/`. Acceso siempre a través de funciones en `src/lib/` (nunca importar JSON directo desde componentes) |
| Tenant activo | Variable de entorno `NEXT_PUBLIC_TENANT` (default `zonda`), resuelta en `src/tenants/index.ts` (registro `id → tenant`). Resolución por subdominio recién en Fase 2 |
| Modo demo | `NEXT_PUBLIC_DEMO_MODE=true` muestra un badge discreto "Demo" y un panel flotante con los DNIs de prueba, credenciales del admin y botón "Restablecer demo" |
| Imágenes | **Sin archivos de imagen por producto.** Un componente `ProductPlaceholder` con 5 ilustraciones geométricas (una por categoría) renderizadas como SVG inline que usan `var(--color-primary)`, así el editor de marca también retematiza las "fotos". `product.image` queda opcional (`null` en Fase 0) para fotos reales en Fase 1. **No usar logos, fotos ni marcas reales** |
| Idioma | Copy de UI y docs en español rioplatense (voseo). Código, nombres de archivos, variables y commits en inglés |
| Deploy | Vercel. Build debe pasar con `next build` sin warnings de tipos |
| Package manager | pnpm |

---

## 4. Cliente demo: **Zonda Fibra** (tenant ficticio)

ISP inventado. Todo lo que sigue es ficción y debe quedar en `src/tenants/zonda/tenant.json`.

```json
{
  "id": "zonda",
  "platformName": "Nexo Beneficios",
  "name": "Zonda Fibra",
  "orderPrefix": "ZF",
  "legalName": "Zonda Telecomunicaciones S.A.",
  "tagline": "Internet que te acerca",
  "city": "San Andrés del Río",
  "province": "Provincia de Buenos Aires",
  "subscribers": 58000,
  "website": "zondafibra.com.ar",
  "supportWhatsapp": "+54 9 2477 00-0000",
  "supportEmail": "beneficios@zondafibra.com.ar",
  "logo": "/tenants/zonda/logo.svg",
  "logoDark": "/tenants/zonda/logo-dark.svg",
  "theme": {
    "colors": {
      "primary": "#0E2A47",
      "primaryHover": "#173C63",
      "accent": "#F2A43A",
      "accentHover": "#E0912A",
      "background": "#F3F5F8",
      "surface": "#FFFFFF",
      "text": "#142033",
      "textMuted": "#55627A",
      "border": "#D9DFE8",
      "success": "#1E8A5F",
      "danger": "#C8401F"
    },
    "fontPreset": "sora-plex",
    "radius": "10px",
    "radiusSm": "6px"
  },
  "identification": {
    "primaryField": "dni",
    "alternativeField": "customerNumber",
    "label": "Ingresá tu DNI o número de cliente"
  },
  "plans": [
    { "id": "fibra-100", "name": "Fibra 100", "speedMbps": 100, "tier": "base" },
    { "id": "fibra-300", "name": "Fibra 300", "speedMbps": 300, "tier": "base" },
    { "id": "fibra-600-tv", "name": "Fibra 600 + TV", "speedMbps": 600, "tier": "premium" }
  ],
  "benefits": {
    "premiumDiscount": 0.12,
    "freeShippingFrom": 150000,
    "installmentsWithoutInterest": 6
  },
  "revenueShare": {
    "isp": 0.03,
    "platform": 0.05
  },
  "storeCopy": {
    "heroTitle": "Beneficios exclusivos para clientes de Zonda Fibra",
    "heroSubtitle": "Tecnología, conectividad y hogar con precios que solo tenés por ser cliente.",
    "howItWorks": [
      "Ingresá tu DNI o número de cliente.",
      "Vemos que tu cuenta esté activa.",
      "Comprás con precio exclusivo y lo recibís en tu casa."
    ]
  }
}
```

**Regla de copy con marca:** todo texto que nombre al ISP, al plan o a las cuotas se interpola desde el tenant (`{tenant.name}`, `{benefits.installmentsWithoutInterest}`), nunca se escribe "Zonda Fibra" ni "6 cuotas" en un componente. Los ejemplos de este documento muestran el resultado con Zonda, no el string fuente.

**Personalidad de marca (para copy y diseño):** cercana, regional, confiable. Habla como un vecino que sabe de tecnología, no como una telco corporativa. El "zonda" es un viento cálido del oeste argentino: energía, movimiento, calidez. El acento ámbar sale de ahí; el azul noche es la confianza de la red.

---

## 5. Estructura del repositorio a crear

```
isp-solutions/                      ← este directorio, raíz del repo
├── CLAUDE.md
├── KICKOFF.md                      ← este archivo (ya está acá)
├── README.md
├── .env.example
├── docs/
│   ├── 00-vision-y-modelo-de-negocio.md
│   ├── 01-alcance-fase-0-demo.md
│   ├── 02-arquitectura.md
│   ├── 03-modelo-de-datos.md
│   ├── 04-diseno-y-ui.md           ← esqueleto en paso 1, contenido completo en paso 5
│   ├── 05-flujos-de-usuario.md
│   ├── 06-roadmap.md
│   ├── 07-metricas-y-kpis.md
│   ├── DECISIONES.md
│   └── CHANGELOG.md
├── public/
│   └── tenants/zonda/              ← logo.svg, logo-dark.svg, favicon
├── scripts/
│   └── generate-mock-data.ts       ← genera orders.json y metrics.json con seed fija (tsx)
└── src/
    ├── app/
    │   ├── (store)/                ← tienda del abonado
    │   │   ├── layout.tsx          ← header + footer de tienda, providers de sesión y carrito
    │   │   ├── page.tsx            ← landing de beneficios
    │   │   ├── ingresar/
    │   │   ├── tienda/
    │   │   ├── tienda/[category]/
    │   │   ├── producto/[slug]/
    │   │   ├── carrito/
    │   │   ├── checkout/
    │   │   ├── pedido/[id]/
    │   │   ├── mis-pedidos/
    │   │   └── como-funciona/
    │   ├── admin/                  ← panel del ISP
    │   │   ├── layout.tsx          ← sidebar + guard de sesión admin (cliente)
    │   │   ├── page.tsx            ← login mock
    │   │   ├── dashboard/
    │   │   ├── catalogo/
    │   │   ├── promociones/
    │   │   ├── pedidos/
    │   │   ├── abonados/
    │   │   ├── marca/
    │   │   └── reportes/
    │   ├── dev/tokens/page.tsx     ← solo desarrollo: muestra los tokens del tenant (paso 3)
    │   ├── layout.tsx              ← carga los 3 font presets e inyecta CSS vars del tenant
    │   ├── not-found.tsx
    │   └── globals.css
    ├── components/
    │   ├── ui/                     ← Button, Input, Badge, Chip, Price, Modal, Drawer, Table, EmptyState, Toast
    │   ├── store/                  ← ProductCard, ProductPlaceholder, CategoryNav, CartDrawer, EligibilityGate, PriceReveal…
    │   └── admin/                  ← FunnelChart, KpiTile, DataTable, BrandEditor, BrandPreview…
    ├── contexts/
    │   ├── SessionContext.tsx      ← abonado validado (mock) + flag de revelación pendiente
    │   ├── CartContext.tsx
    │   └── AdminContext.tsx        ← sesión admin + overrides de catálogo/promos/marca
    ├── data/
    │   └── products.json           ← catálogo de la PLATAFORMA (no del tenant)
    ├── lib/
    │   ├── tenant.ts               ← getTenant(), resolveTheme() → CSS vars
    │   ├── fonts.ts                ← los 3 presets de next/font/google
    │   ├── storage-keys.ts         ← todas las claves de localStorage
    │   ├── catalog.ts              ← getProducts(), getProductBySlug(), getCategories(), applyOverrides()
    │   ├── eligibility.ts          ← checkSubscriber(dni | customerNumber)
    │   ├── pricing.ts              ← computePrice(product, session?, promos) → {final, savings, installments, label}
    │   ├── promotions.ts           ← getActivePromotions(date), estado vigente/programada/vencida
    │   ├── orders.ts               ← createOrder(), getOrders(), estados y etiquetas
    │   ├── metrics.ts              ← funnel, series, top productos
    │   └── format.ts               ← formatARS(), formatDate(), formatPercent()
    ├── tenants/
    │   ├── index.ts                ← registro id → tenant, resuelve NEXT_PUBLIC_TENANT
    │   └── zonda/
    │       ├── tenant.json
    │       ├── subscribers.json
    │       ├── promotions.json
    │       ├── orders.json         ← generado
    │       └── metrics.json        ← generado
    └── types/
        └── index.ts                ← Tenant, Product, Subscriber, Order, Promotion, Metrics…
```

---

## 6. `CLAUDE.md` — contenido requerido

Crear `CLAUDE.md` en la raíz. Es el archivo que Claude Code lee en cada sesión; tiene que ser corto, operativo y mantenerse actualizado. Debe contener, en este orden:

1. **Qué es este proyecto** (3 líneas): plataforma white-label de beneficios para ISPs; Fase 0 = demo con datos mock del tenant ficticio Zonda Fibra.
2. **Leer antes de tocar código:** `docs/01-alcance-fase-0-demo.md` y `docs/02-arquitectura.md`. Para cambios de diseño, `docs/04-diseno-y-ui.md`.
3. **Stack y comandos:** `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm mock:generate`.
4. **Variables de entorno:** `NEXT_PUBLIC_TENANT`, `NEXT_PUBLIC_DEMO_MODE`.
5. **Reglas duras:**
   - Sin backend, DB, pagos ni auth reales en Fase 0.
   - Ningún color, fuente o texto de marca hardcodeado: todo sale del tenant.
   - Los componentes no importan JSON; usan `src/lib/*`.
   - Ningún precio se renderiza antes de conocer la sesión en el cliente (regla de hidratación).
   - Claves de `localStorage` solo desde `src/lib/storage-keys.ts`.
   - Copy en español rioplatense; código en inglés.
   - No usar marcas, logos ni fotos reales.
   - TypeScript estricto, sin `any`.
   - Mobile first; todas las pantallas se verifican en 375px y 1280px.
6. **Cómo agregar un producto / un tenant / una promoción** (recetas de 3–4 líneas cada una).
7. **DNIs de prueba** (tabla de la sección 8.3) y credenciales del admin.
8. **Guion de la demo** (tabla de la sección 2.1): es el camino de QA obligatorio antes de cada commit de UI.
9. **Definition of done** por tarea: typecheck + lint + test + build OK, responsive verificado, sin colores hardcodeados, guion de demo recorrido sin errores en consola, entrada en `docs/CHANGELOG.md`, decisión registrada en `docs/DECISIONES.md` si aplica.
10. **Estado actual del proyecto** (sección viva, 5 líneas máximo): qué está hecho, qué sigue.

---

## 7. Carpeta `docs/` — contenido de cada archivo

Escribir los docs **antes** de inicializar Next.js. Son la fuente de verdad del proyecto.

### `00-vision-y-modelo-de-negocio.md`
Resumen del Business Model Canvas: segmentos (ISP, abonado, proveedor), propuesta de valor para cada uno, canales, fuentes de ingreso (setup, SaaS, comisión, margen, promociones patrocinadas), recursos clave, círculo virtuoso (más ISPs → más abonados → más volumen → mejores precios → más ISPs), posicionamiento, estrategia en tres capas (SaaS → marketplace → importación). Incluir los escenarios de referencia 10/50/100 ISPs y la sensibilidad por % de compradores, aclarando que son hipótesis de trabajo, no proyecciones.

### `01-alcance-fase-0-demo.md`
Objetivo de la demo, las tres preguntas que responde (sección 2), alcance incluido y excluido, criterios de aceptación (sección 16), y lista de pantallas con su estado (pendiente / en curso / listo).

### `02-arquitectura.md`
Diagrama de capas (tenant config → theme → UI; data JSON → lib → contexts → components), qué es de la plataforma y qué es del tenant, resolución de tenant, estrategia de estado y persistencia (tabla de claves de `localStorage` y qué contexto es dueño de cada una), **regla de hidratación** (servidor renderiza sin sesión; el cliente resuelve sesión y overrides; los precios esperan), estrategia server/client components por pantalla, cómo se simulan elegibilidad/checkout/órdenes, y qué se reemplaza en Fase 1 (API de elegibilidad del ISP, pasarela Mercado Pago, base de datos, auth). Marcar explícitamente los "puntos de corte" donde el mock se convierte en integración real: `eligibility.ts`, `orders.ts` (createOrder), `AdminContext` (overrides → API).

### `03-modelo-de-datos.md`
Tipos `Tenant`, `Product`, `Subscriber`, `Order`, `OrderItem`, `Promotion`, `Metrics` con sus campos, tipos y reglas. Documentar el algoritmo de precio (sección 11.2) con ejemplos numéricos para los 3 planes, la tabla de estados de pedido con sus etiquetas de UI (sección 8.4), los estados de abonado vs. resultados de elegibilidad (`SubscriberStatus` vs `EligibilityResult`), y el esquema de `Promotion` (sección 8.5).

### `04-diseno-y-ui.md`
Plan de diseño completo (ver sección 12): tokens, tipografía, escala, layout con wireframes ASCII, principios, componentes base, y una checklist de "tells genéricos a evitar". **En el paso 1 se crea solo el esqueleto** (títulos de sección y la nota "se completa en el paso 5"). En el paso 5 Claude Code lo escribe completo, **lo revisa contra la sección 12**, y recién después codea UI.

### `05-flujos-de-usuario.md`
Diagramas en texto de cada flujo (sección 11) con estados, errores y mensajes exactos de UI.

### `06-roadmap.md`
- **Fase 0 — Demo** (este repo): tienda + admin con mock.
- **Fase 1 — Piloto con ISP ancla (60.000 abonados):** integración de elegibilidad (archivo → API), Mercado Pago, órdenes reales, catálogo de ~30 productos con proveedor real, dashboard con datos reales, revenue share.
- **Fase 2 — Network (5–10 ISPs):** multi-tenant por subdominio, onboarding self-service, roles, facturación SaaS.
- **Fase 3 — Marketplace:** proveedores múltiples, promociones patrocinadas, importación propia, marca propia.

### `07-metricas-y-kpis.md`
**Funnel oficial** (única definición; la usan la sección 2, el dashboard, los reportes y `metrics.json`): abonados → visitas → validados → compradores → órdenes → GMV → ingreso ISP. Se dice "validados" (validaron el DNI), no "registrados". Definiciones exactas de cada métrica, incluidas las de los tiles del dashboard (ticket promedio = GMV / órdenes no canceladas; tasa de recompra = compradores con 2+ órdenes / compradores; ahorro generado = Σ (publicPrice − precioFinal) × cantidad), la métrica guía "GMV por cada 1.000 abonados", hipótesis del piloto (visitas 10–20%, validados 5–10%, compradores 2–5%, ticket $200–400k) marcadas como supuestos a validar.

### `DECISIONES.md`
Log tipo ADR, una entrada por decisión: fecha, contexto, decisión, alternativas descartadas, consecuencias. Arrancar con las decisiones de la sección 3.

### `CHANGELOG.md`
Formato Keep a Changelog. Una entrada por paso completado de la sección 15.

---

## 8. Datos mock

### 8.1 Tenant
El JSON de la sección 4, en `src/tenants/zonda/tenant.json`. Generar `logo.svg` (wordmark "Zonda Fibra" con un trazo que sugiera viento/onda, en azul noche, versión clara para fondos oscuros) y favicon.

### 8.2 Productos — `src/data/products.json` (catálogo de la plataforma)
**30 productos** repartidos en 5 categorías, con marcas ficticias. Precios en pesos argentinos (2026), ticket promedio orientado a $150.000–300.000, con algunos productos de mayor valor. El SKU lleva prefijo de la plataforma (`NX-`), no del ISP: el catálogo es compartido.

Esquema:

```json
{
  "id": "con-001",
  "slug": "router-wifi-6-mesh-pack-2",
  "sku": "NX-RT-MESH2",
  "name": "Router Wi-Fi 6 Mesh — pack 2 nodos",
  "category": "conectividad",
  "brand": "Nubetek",
  "shortDescription": "Cobertura pareja en toda la casa, sin zonas muertas.",
  "description": "Texto de 2–3 párrafos, claro, sin exagerar.",
  "publicPrice": 189000,
  "exclusivePrice": 169000,
  "supplierCost": 152000,
  "stock": 25,
  "featured": true,
  "active": true,
  "image": null,
  "specs": [
    { "label": "Estándar", "value": "Wi-Fi 6 (802.11ax)" },
    { "label": "Cobertura", "value": "Hasta 250 m²" }
  ],
  "tags": ["wifi6", "mesh", "hogar"],
  "installmentsEligible": true
}
```

Categorías y mínimos:

| Categoría | id | Cantidad | Ejemplos (marcas ficticias) |
|---|---|---|---|
| Conectividad | `conectividad` | 8 | Router Wi-Fi 6 Mesh (Nubetek), access point, repetidor, UPS 800VA (Voltra), switch 8 puertos, cable Cat6 20m, adaptador USB Wi-Fi, TV box certificado (Lumo) |
| Seguridad | `seguridad` | 6 | Cámara IP interior, cámara exterior, videoportero (Corvus), kit alarma 4 sensores, sensor de puerta, cerradura inteligente |
| Entretenimiento | `entretenimiento` | 5 | Smart TV 43", Smart TV 50" (Andina), soundbar 2.1, auriculares BT, parlante portátil |
| Tecnología | `tecnologia` | 6 | Celular gama media (Solana), celular gama alta, tablet 10", notebook 15" i5, smartwatch, cargador GaN 65W |
| Hogar conectado | `hogar` | 5 | Air fryer (Pampa Home), cafetera, lámpara inteligente, aspiradora robot, enchufe inteligente |

Regla: `exclusivePrice` entre 6% y 14% por debajo de `publicPrice`; `supplierCost` entre 8% y 12% por debajo de `exclusivePrice`. 6 productos con `featured: true`. 2 productos con `stock: 0` para probar el estado "sin stock". 1 producto `active: false` para probar el admin.

Placeholders: componente `ProductPlaceholder` (sección 3) con una ilustración geométrica simple por categoría (no íconos genéricos de stock), en SVG inline con `var(--color-primary)` y una variación sutil por producto (p. ej. rotación o posición derivada del `id`) para que la grilla no se vea repetida. Cuando `product.image` sea `null`, `ProductCard` y la galería del producto usan el placeholder.

### 8.3 Abonados de prueba — `src/tenants/zonda/subscribers.json`

| DNI | Nº cliente | Nombre | Plan | Estado | Para probar |
|---|---|---|---|---|---|
| 30111222 | 104588 | Lucía Ferreyra | Fibra 300 | `active` | Flujo feliz, precio exclusivo del producto |
| 27888999 | 98231 | Martín Solari | Fibra 600 + TV | `active` | Tier premium, descuento 12% |
| 33444555 | 121904 | Camila Prieto | Fibra 100 | `active` | Plan base, primer pedido |
| 20555666 | 77120 | Roberto Ibáñez | Fibra 300 | `suspended` | Cuenta en mora: beneficios suspendidos |
| 18999000 | 45012 | Elena Carrizo | Fibra 100 | `inactive` | Baja del servicio |
| 35000111 | — | — | — | `not_found` | DNI que no existe |

Cada abonado tiene además: `address` (calle, número, localidad, CP ficticio), `email`, `phone`, `customerSince`. El caso `not_found` no está en el JSON: es un resultado de `checkSubscriber()`, no un estado de abonado.

### 8.4 Órdenes y métricas — `src/tenants/zonda/orders.json`, `src/tenants/zonda/metrics.json`
Generados por `scripts/generate-mock-data.ts` con seed fija (resultado determinístico). Las órdenes mock usan solo los DNIs de prueba activos y otros abonados sintéticos con nombre pero sin DNI de prueba.

- **Órdenes:** 60 órdenes en los últimos 90 días, distribuidas de forma creíble (más en fines de semana y a principio de mes), en proporción realista (~70% `delivered`). Ticket promedio resultante entre $180.000 y $260.000.
- **Estados de pedido** (únicos, con su etiqueta de UI; la timeline de `/pedido/[id]` es esta misma lista sin `pending` ni `cancelled`):

  | Estado | Etiqueta | Nota |
  |---|---|---|
  | `pending` | Pendiente de pago | no aparece en el flujo demo (el checkout crea `paid`) |
  | `paid` | Confirmado | estado inicial de una orden de la demo |
  | `processing` | Preparando | |
  | `shipped` | En camino | |
  | `delivered` | Entregado | |
  | `cancelled` | Cancelado | se muestra fuera de la timeline |

- **Métricas:** funnel de los últimos 90 días con la definición de `07-metricas-y-kpis.md`, coherente con las hipótesis del piloto sobre 58.000 abonados (visitas ≈ 12%, validados ≈ 6%, compradores ≈ 2,5%), serie mensual de GMV y órdenes (últimos 6 meses), top 8 productos, ventas por categoría, ahorro generado a los abonados, ingreso estimado del ISP (`gmv × revenueShare.isp`) y de la plataforma (`gmv × revenueShare.platform`). El script valida al final que las cifras del funnel sean consistentes entre sí (compradores ≤ validados ≤ visitas ≤ abonados; GMV = Σ órdenes no canceladas).

### 8.5 Promociones — `src/tenants/zonda/promotions.json`
3 promociones: un banner destacado ("Semana de la conectividad", vigente), un descuento extra por plan premium en `entretenimiento` (vigente), y una promo vencida (para mostrar estados en el admin).

Esquema:

```json
{
  "id": "promo-001",
  "name": "Semana de la conectividad",
  "type": "banner | tier_discount | category_discount",
  "discount": 0.05,
  "category": "entretenimiento",
  "tier": "premium",
  "bannerTitle": "…",
  "bannerSubtitle": "…",
  "startsAt": "2026-09-01",
  "endsAt": "2026-09-14",
  "active": true
}
```

`discount`, `category` y `tier` son opcionales según el `type`. El estado (vigente / programada / vencida) se deriva de las fechas y `active`, no se guarda.

---

## 9. Pantallas — Tienda del abonado

| Ruta | Contenido |
|---|---|
| `/` | Hero con marca del ISP y el **gate de DNI como elemento central** (ver sección 12). Debajo: categorías, productos destacados (con precio público y candado si no está validado), "Cómo funciona" en 3 pasos, franja de confianza (envío, cuotas, soporte del ISP) |
| `/ingresar` | Validación de DNI/nº de cliente. Estados: activo (bienvenida con nombre y plan), suspendido (mensaje claro + CTA a regularizar con WhatsApp del ISP), inactivo, no encontrado |
| `/tienda` | Catálogo con filtros por categoría, búsqueda, orden (relevancia, precio, ahorro). Chips de categoría, grilla responsive |
| `/tienda/[category]` | Misma vista filtrada, con título y descripción de categoría |
| `/producto/[slug]` | Galería (placeholder), precio público tachado vs exclusivo, ahorro en $ y %, cuotas sin interés, specs, stock, "Agregar al carrito". Si no está validado: precio público visible y precio exclusivo con candado + CTA "Ingresá tu DNI para ver tu precio" |
| `/carrito` | Items, cantidades, subtotal, ahorro total ("Estás ahorrando $X por ser cliente de Zonda Fibra"), envío (gratis desde `freeShippingFrom`), CTA a checkout. Drawer lateral también accesible desde el header |
| `/checkout` | Paso 1: datos de entrega prellenados desde el abonado (editables). Paso 2: pago simulado ("Mercado Pago", "Tarjeta en {n} cuotas", "Débito en la factura de {tenant.name}" — este último marcado como "próximamente"). Paso 3: revisión y confirmar. Sin datos de tarjeta reales; un solo botón "Simular pago aprobado" |
| `/pedido/[id]` | Confirmación con número de pedido, resumen, timeline de estado (Confirmado → Preparando → En camino → Entregado, según la tabla de 8.4). Botón demo "Avanzar estado" solo en modo demo |
| `/mis-pedidos` | Historial del abonado validado. Empty state con dirección clara si no tiene pedidos |
| `/como-funciona` | Explicación para el abonado, FAQ corta (¿por qué necesito el DNI?, ¿qué pasa si doy de baja el servicio?, envíos, garantía) |

Header de tienda: logo del ISP, buscador, carrito, y estado de sesión ("Hola, Lucía · Fibra 300" o "Ingresá tu DNI"). Footer: datos del ISP, "Beneficios operados por Nexo Beneficios" en chico.

---

## 10. Pantallas — Panel admin del ISP

Acceso mock en `/admin` con usuario `admin@zondafibra.com.ar` / clave `demo` (validación en cliente, solo para la demo). Layout con sidebar, tematizado con los tokens del tenant pero en tono más neutro y denso.

| Ruta | Contenido |
|---|---|
| `/admin/dashboard` | **El funnel es el hero:** 58.000 abonados → visitas → validados → compradores → órdenes → GMV → ingreso ISP, con porcentajes de conversión entre etapas. Tiles: GMV 30 días, ticket promedio, ingreso estimado del ISP, tasa de recompra. Gráfico de GMV mensual (6 meses). Top productos. Ventas por categoría. Selector de período (30/60/90 días) |
| `/admin/catalogo` | Tabla de productos: imagen, nombre, categoría, precio público, precio exclusivo, ahorro %, stock, destacado, activo. Acciones: activar/desactivar, marcar destacado, editar precio exclusivo inline (con validación: no puede superar el público). Filtros y búsqueda. Cambios persisten en `AdminContext` + localStorage y se reflejan en la tienda |
| `/admin/promociones` | Lista de promos con estado (vigente / programada / vencida). Crear/editar: nombre, tipo (banner destacado / descuento extra por plan / descuento por categoría), vigencia, preview del banner en la tienda |
| `/admin/pedidos` | Tabla con filtros por estado y fecha. Detalle: items, abonado, dirección, timeline, botón "Cambiar estado". Export CSV (generado en cliente) |
| `/admin/abonados` | Buscador por DNI/nº cliente que muestra estado, plan, pedidos y beneficios habilitados. Texto explicativo: "En producción esto consulta tu sistema de gestión en tiempo real" |
| `/admin/marca` | Editor: logo (upload local; se guarda como data URL en los overrides si pesa menos de 200 KB, si no queda solo en memoria), colores primario/acento (con `primaryHover`/`accentHover` derivados automáticamente), tipografía (los 3 presets de `fonts.ts`), radio, tagline, textos del hero. **Preview en vivo** de la landing a la derecha: es la landing real renderizada en un contenedor con las CSS vars del override, no una maqueta aparte. Botón "Restablecer". Este es el argumento de venta del white-label: mostrar cómo cambia todo, incluidas las imágenes de producto, con dos colores |
| `/admin/reportes` | Reporte del piloto listo para compartir: funnel, GMV, ahorro total generado a los abonados, ingreso del ISP, ingreso de la plataforma, GMV por cada 1.000 abonados. Botón "Descargar resumen" (imprime a PDF vía `window.print` con estilos de impresión) |

---

## 11. Flujos simulados

### 11.1 Elegibilidad
```
Input (DNI o nº cliente) → normalizar (solo dígitos) → buscar en subscribers del tenant
  ├─ not_found  → "No encontramos ese DNI. Probá con tu número de cliente (está en tu factura)."
  ├─ inactive   → "Esta cuenta ya no tiene servicio activo. Los beneficios son para clientes de {tenant.name}."
  ├─ suspended  → "Tu cuenta está suspendida. Regularizala para volver a acceder a tus beneficios." + CTA WhatsApp
  └─ active     → crear sesión {subscriberId, name, planId, tier, validatedAt}
                  → marcar revelación pendiente (sessionStorage `nexo:reveal:<tenantId>`)
                  → redirigir a `?next=` o a /tienda
```
Sesión en `localStorage` clave `nexo:session:<tenantId>`. Expira a las 24 h. Botón "Salir" en el header. La **revelación del precio** la ejecuta la primera pantalla con precios que se renderiza después de validar: consume el flag de `sessionStorage`, anima una sola vez y lo borra. Cargas posteriores muestran el precio exclusivo sin animación.

### 11.2 Pricing
`computePrice(product, session | null, activePromotions)` devuelve `{ finalPrice, publicPrice, savings, savingsPercent, installments, appliedLabel }`.

```
sin sesión                → finalPrice = publicPrice; exclusivo bloqueado. NUNCA se muestra el exclusivo.
con sesión, candidatos:
  a) product.exclusivePrice                                         (siempre)
  b) publicPrice × (1 − benefits.premiumDiscount)                   (si tier == premium)
  c) publicPrice × (1 − promo.discount)                             (por cada promo vigente que aplique
                                                                     por categoría o por tier)
finalPrice = min(candidatos)          ← los descuentos NO se acumulan: se aplica el mejor
appliedLabel = nombre del candidato ganador ("Precio cliente", "Plan premium", nombre de la promo)
savings = publicPrice − finalPrice
installments = finalPrice / installmentsWithoutInterest (si installmentsEligible)
```
Reglas: `finalPrice` nunca baja de `supplierCost` (si un candidato lo hace, se descarta y se registra en consola en dev). En `/admin/catalogo`, el precio exclusivo editable no puede superar el público ni bajar del costo. `pricing.ts` es pura: recibe fecha y promos como parámetros, no lee `Date.now()`.

### 11.3 Carrito y checkout
Carrito en `localStorage` clave `nexo:cart:<tenantId>`. Guarda `{productId, quantity}`; el precio se recalcula siempre con `computePrice` (nunca se persiste un precio). No permite agregar sin stock. Checkout requiere sesión activa (si no hay, redirige a `/ingresar?next=/checkout`). Al confirmar: `createOrder()` genera id `{tenant.orderPrefix}-{año}-{secuencia de 4 dígitos}`, estado `paid`, guarda en `nexo:orders:<tenantId>` y redirige a `/pedido/[id]`. `getOrders()` devuelve mock + creadas en la demo, así aparecen en `/mis-pedidos` y en `/admin/pedidos`.

### 11.4 Admin
Login mock → sesión admin en `localStorage` (`nexo:admin-session:<tenantId>`); `admin/layout.tsx` redirige a `/admin` si no existe. Cambios de catálogo/promos/marca se guardan como *overrides* parciales sobre los JSON base (`nexo:admin-overrides:<tenantId>`); la tienda lee `base + overrides` a través de `applyOverrides()` en `src/lib/catalog.ts`. "Restablecer demo" (sidebar del admin y panel de modo demo) borra todas las claves `nexo:*` del tenant.

---

## 12. Diseño y UI

Claude Code debe primero escribir el plan de diseño en `docs/04-diseno-y-ui.md`, revisarlo contra esta sección y contra la lista de "tells genéricos", y recién después codear.

### Dirección
La tienda tiene que sentirse como **del ISP**, no como un marketplace genérico ni como un template SaaS. Es un beneficio del servicio de Internet que ya pagás: cercano, concreto, local.

### El elemento memorable (gastar la audacia en un solo lugar)
**El momento de la revelación del precio.** Antes de validar, los productos muestran precio público y el precio exclusivo "cerrado". Al validar el DNI, una única animación orquestada (una sola vez, respetando `prefers-reduced-motion`, disparada por el flag de la sección 11.1) hace que los precios bajen y aparezca el ahorro. El gate de DNI en el hero de la landing es un input grande, único, con el nombre del ISP: no un formulario, una invitación. Si el abonado valida desde el hero, la revelación ocurre ahí mismo sobre los destacados, sin cambiar de página: ese es el momento de la reunión.

Todo lo demás se mantiene quieto y disciplinado: sin fade-in por sección, sin hover elaborado en cada card, sin gradientes decorativos.

### Tokens (salen del tenant, se documentan acá)
- **Color:** azul noche `#0E2A47` (primario, confianza de red), ámbar zonda `#F2A43A` (acento, solo para CTA principal y ahorro), gris frío `#F3F5F8` (fondo), blanco (superficie), tinta `#142033` (texto). Verde `#1E8A5F` para éxito, rojo `#C8401F` para error. El ámbar es escaso: si aparece en más de dos lugares por pantalla, sobra.
- **Tipografía:** preset `sora-plex`: `Sora` para títulos (geométrica, con carácter) y `IBM Plex Sans` para cuerpo. Los otros dos presets deben tener el mismo carácter (sans geométrica o humanista para títulos, sans neutra para cuerpo; ninguna serif). Escala: 13 / 15 / 17 / 22 / 28 / 36 / 48. Títulos en sentence case. Líneas de texto de menos de 75 caracteres. Sin eyebrows en mayúsculas, sin una sola palabra resaltada en color dentro de un título.
- **Radio:** un solo radio base (`theme.radius`), radio menor para chips e inputs. No todo es una card: usar bordes y fondos solo cuando separan información real.
- **Espaciado:** grilla de 4px, contenedor máximo 1200px, contenido de tienda alineado a la izquierda; el hero puede centrarse.

### Layout de la landing (wireframe de referencia)
```
┌──────────────────────────────────────────────────────────┐
│ [logo Zonda Fibra]        Buscar…        🛒   Ingresá     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   Beneficios exclusivos para clientes de Zonda Fibra     │
│   Tecnología, conectividad y hogar con precios que       │
│   solo tenés por ser cliente.                            │
│                                                          │
│   ┌────────────────────────────────────┐ ┌────────────┐  │
│   │ Ingresá tu DNI o número de cliente │ │Ver mi precio│ │
│   └────────────────────────────────────┘ └────────────┘  │
│   ¿Por qué el DNI?                                       │
├──────────────────────────────────────────────────────────┤
│  Conectividad   Seguridad   Entretenimiento   Tecnología │
├──────────────────────────────────────────────────────────┤
│  Destacados                                              │
│  [prod] [prod] [prod] [prod] [prod] [prod]               │
│  $189.000  🔒 precio cliente                             │
├──────────────────────────────────────────────────────────┤
│  Cómo funciona     1 · 2 · 3 (es una secuencia real)     │
├──────────────────────────────────────────────────────────┤
│  Envío a domicilio · 6 cuotas · Soporte Zonda Fibra      │
├──────────────────────────────────────────────────────────┤
│  Footer ISP · Beneficios operados por Nexo Beneficios    │
└──────────────────────────────────────────────────────────┘
```

### Admin
Misma familia tipográfica, paleta más neutra (primario para navegación activa, ámbar solo en CTAs). Densidad alta pero legible. Tablas con filas de 44px, cifras alineadas a la derecha con tabular-nums. El funnel del dashboard se lee de izquierda a derecha con barras proporcionales, no como cards separadas.

### Copy
Voseo, activo, concreto. Los botones dicen lo que pasa: "Ver mi precio", "Agregar al carrito", "Confirmar pedido", "Simular pago aprobado". Los errores explican qué pasó y qué hacer. Los empty states invitan a una acción. Nada de "¡Bienvenido a la experiencia!".

### Tells genéricos a evitar (checklist para `04-diseno-y-ui.md`)
- Fondo crema con serif de alto contraste y acento terracota.
- Fondo casi negro con un acento ácido.
- Todo en cards idénticas con la misma sombra gris.
- Eyebrows en mayúsculas tracked-out sobre cada título.
- Metadatos unidos con "·" en todas partes; flechas "→" al final de cada link.
- Monospace para cifras pequeñas.
- Fade-and-slide-up en cada sección.
- Números 01/02/03 donde no hay secuencia.

### Piso de calidad (sin anunciarlo)
Responsive a 375px, foco visible en teclado, contraste AA, `prefers-reduced-motion` respetado, alt text en imágenes, formularios con labels reales, `aria-live` en el resultado de validación de DNI, sin layout shift al hidratar (los skeletons de precio tienen el mismo tamaño que el precio final).

### Estados que cada pantalla tiene que resolver
Cada pantalla del guion de demo define en `04-diseno-y-ui.md` cómo se ve en: carga (skeleton), vacío, error, sin sesión, con sesión base, con sesión premium, y a 375px. Una pantalla no está "lista" si alguno de esos estados es un `div` vacío.

---

## 13. Convenciones de código

- TypeScript estricto. Tipos en `src/types/index.ts`. Sin `any`, sin `as unknown as`.
- Server Components por defecto; `"use client"` solo donde hay estado o eventos. Patrón por pantalla: `page.tsx` (server) carga datos base con `src/lib/*` y se los pasa a un componente `*View` (client) que aplica sesión y overrides. Las rutas dinámicas usan `generateStaticParams` sobre el catálogo base.
- Nada que lea `localStorage` corre en el render inicial: los contexts exponen `status: 'loading' | 'ready'` y los componentes de precio esperan `ready`.
- Componentes en PascalCase, un componente por archivo, props tipadas con `interface`.
- Funciones de `src/lib/` puras y testeables; no acceden a `window` (eso es de los contexts).
- Formato de moneda siempre por `formatARS()` → `$ 189.000`.
- Nombres de rutas en español (son URLs que ve el abonado); nombres de archivos de componentes en inglés.
- Commits en inglés, convencionales: `feat(store): add eligibility gate`, `docs: add architecture`.
- Un commit por paso de la sección 15, como mínimo.
- ESLint + Prettier con la config default de Next; `pnpm lint` y `pnpm typecheck` deben pasar limpios.
- `README.md` corto: qué es, cómo correrlo, DNIs de prueba, credenciales del admin, cómo cambiar de tenant.

---

## 14. Lo que NO se hace en esta fase

- No backend, no API routes con lógica real, no base de datos, no ORM.
- No integración con Mercado Pago ni ninguna pasarela. No pedir datos de tarjeta.
- No auth real (NextAuth, Clerk, etc.). El login del admin es decorativo.
- No integración con sistemas del ISP. La elegibilidad se resuelve contra JSON.
- No panel de proveedor, no gestión de stock real, no logística.
- No app móvil, no PWA.
- No i18n; solo español.
- No marcas, logos, fotos ni nombres de empresas reales en productos ni en el tenant.
- No más de 30 productos. No más de un tenant (pero la arquitectura lo permite).
- No tests E2E. Sí tests unitarios mínimos para `pricing.ts` y `eligibility.ts` (Vitest).

---

## 15. Orden de ejecución

Ejecutar en este orden. Después de cada paso: verificar, commitear, actualizar `docs/CHANGELOG.md` y la sección "Estado actual" de `CLAUDE.md`.

1. **Documentación base.** `git init` si hace falta. Crear `docs/` con los 10 archivos de la sección 7 (`04-diseno-y-ui.md` solo como esqueleto), `CLAUDE.md` según sección 6, `README.md`, `.env.example`, `.gitignore`. Registrar las decisiones de la sección 3 en `DECISIONES.md`. **Checkpoint: mostrar la estructura y frenar para revisión.**
2. **Proyecto Next.js.** Inicializar con TypeScript, App Router, Tailwind, ESLint, pnpm, en este directorio (sin subcarpeta). Configurar Prettier, `typecheck` script, Vitest, `tsx` para scripts. Verificar `pnpm build`.
3. **Tenant y theming.** `src/tenants/zonda/tenant.json`, `src/tenants/index.ts`, `src/types`, `src/lib/tenant.ts`, `src/lib/fonts.ts` (3 presets), `src/lib/storage-keys.ts`, inyección de CSS variables en `layout.tsx`, mapeo de Tailwind a las variables, logo SVG y favicon. `/dev/tokens`: página de desarrollo que lista los tokens (esta es la única UI permitida antes del paso 5; no es UI de producto).
4. **Datos mock y lógica.** `products.json` (30), `subscribers.json`, `promotions.json`, script `generate-mock-data.ts` → `orders.json` y `metrics.json`. Todas las funciones de `src/lib/*` con tests Vitest para `pricing` (los 3 planes, promo, floor de costo, sin sesión) y `eligibility` (los 6 casos).
5. **Plan de diseño.** Escribir `docs/04-diseno-y-ui.md` completo: tokens, escala, wireframes ASCII de landing (con y sin sesión), ingresar (4 estados), producto, carrito, checkout, pedido, dashboard, catálogo admin y marca; los estados de cada pantalla; el guion de la revelación del precio paso a paso. Revisar contra la checklist de tells genéricos y dejar anotado qué se cambió. **No codear UI antes de este paso. Checkpoint: frenar para revisión del plan de diseño.**
6. **Componentes base.** `src/components/ui/*` (Button, Input, Price, Badge, Chip, Modal, Drawer, Table, EmptyState, Toast, Skeleton), `ProductPlaceholder`. Contexts de sesión, carrito y admin con su `status` de hidratación.
7. **Tienda, en orden de prioridad (2.1).** P1: landing → ingresar → tienda → producto, con la revelación del precio. Luego P2: carrito → checkout → pedido. Luego P3: mis pedidos → cómo funciona. Badge y panel de modo demo. **Checkpoint al terminar P1: frenar para revisión visual.**
8. **Admin, en orden de prioridad (2.1).** Login y layout → marca (P1, con preview en vivo) → dashboard → reportes (P2, con estilos de impresión) → catálogo → promociones → pedidos → abonados (P3).
9. **QA.** Recorrer el guion de demo completo. Revisar cada pantalla a 375px y 1280px, navegación por teclado, `prefers-reduced-motion`, contraste, hidratación sin flash de precio. Correr `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Corregir todo. Si el entorno permite capturas (Playwright o similar), revisar visualmente y guardar capturas del guion en `docs/capturas/`.
10. **Deploy y cierre.** Verificar que no haga falta configuración extra para Vercel (variables de entorno documentadas), `README.md` final, `docs/01-alcance-fase-0-demo.md` con todas las pantallas en estado "listo", `CLAUDE.md` con el estado actual y "próximos pasos: Fase 1".

---

## 16. Criterios de aceptación de la Fase 0

- [ ] `pnpm build` pasa sin errores ni warnings de tipos; `lint`, `typecheck` y `test` limpios.
- [ ] El guion de demo de la sección 2.1 se recorre de punta a punta sin errores en consola y sin flash de precio al cargar páginas con sesión.
- [ ] Con `NEXT_PUBLIC_TENANT=zonda`, toda la tienda y el admin muestran la marca Zonda Fibra; cambiar dos colores y el `fontPreset` en `tenant.json` retematiza todo, incluidas las imágenes de producto, sin tocar código.
- [ ] Los 6 casos de DNI de prueba producen exactamente los 4 estados esperados con sus mensajes.
- [ ] Sin sesión, ningún precio exclusivo es visible. Con sesión, el precio y el ahorro se muestran; premium muestra descuento mayor.
- [ ] Un abonado puede completar el flujo entero: validar → elegir 2 productos → carrito → checkout → pedido confirmado → verlo en "Mis pedidos" → verlo en `/admin/pedidos`.
- [ ] En el admin: desactivar un producto lo oculta de la tienda; cambiar un precio exclusivo se refleja en la tienda; cambiar colores en `/admin/marca` cambia el preview en vivo.
- [ ] El dashboard muestra el funnel completo con cifras coherentes con `metrics.json` y el ingreso estimado del ISP.
- [ ] `/admin/reportes` se imprime a PDF de forma legible.
- [ ] Todas las pantallas funcionan a 375px sin scroll horizontal.
- [ ] "Restablecer demo" vuelve todo al estado inicial.
- [ ] `docs/` completo, `CLAUDE.md` actualizado, `CHANGELOG.md` con una entrada por paso, `DECISIONES.md` con al menos las decisiones de la sección 3 más las tomadas durante la implementación.
- [ ] Ningún color, texto de marca, prefijo de orden ni fuente hardcodeado fuera de `tenant.json` (verificable con `grep -ri "zonda" src/components src/app` → 0 resultados).
- [ ] Ninguna marca, logo o foto real en el proyecto.

---

## 17. Después de la Fase 0 (para contexto, no para implementar ahora)

Lo primero que se reemplaza en Fase 1 es `src/lib/eligibility.ts`: pasa de leer `subscribers.json` a consultar la API o el archivo de abonados elegibles del ISP ancla. Lo segundo es el checkout: Mercado Pago Checkout Pro. Lo tercero es persistencia de órdenes. La arquitectura de esta demo tiene que hacer que esos tres reemplazos sean cambios localizados, no reescrituras.
