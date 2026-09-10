# Modelo de datos

Todos los tipos viven en `src/types/index.ts`. TypeScript estricto: sin `any`, sin
`as unknown as`.

## Tenant

Configuración del ISP. Un archivo por tenant en `src/tenants/<id>/tenant.json`.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `string` | Identificador único, en minúsculas. Es la clave del registro y el sufijo de las claves de `localStorage` |
| `platformName` | `string` | Nombre de la plataforma, no del ISP. Aparece en el footer, en chico |
| `name` | `string` | Nombre comercial del ISP. Es lo que ve el abonado en todas partes |
| `orderPrefix` | `string` | Prefijo del número de pedido. Nunca hardcodeado |
| `legalName` | `string` | Razón social, solo para el footer |
| `tagline` | `string` | Editable desde `/admin/marca` |
| `city`, `province` | `string` | Ubicación, para el footer y el copy regional |
| `subscribers` | `number` | Base de abonados. Es el primer escalón del funnel |
| `website` | `string` | Sin protocolo |
| `supportWhatsapp` | `string` | Destino del CTA de cuenta suspendida |
| `supportEmail` | `string` | |
| `logo`, `logoDark` | `string` | Rutas en `public/tenants/<id>/` |
| `theme` | `Theme` | Ver abajo |
| `identification` | `Identification` | Qué campo se pide y con qué etiqueta |
| `plans` | `Plan[]` | Planes del ISP |
| `benefits` | `Benefits` | Descuento premium, envío gratis desde, cuotas sin interés |
| `revenueShare` | `RevenueShare` | Una entrada por tipo de ítem. Ver abajo |
| `storeCopy` | `StoreCopy` | Textos del hero y los tres pasos de "cómo funciona" |

```ts
interface Theme {
  colors: {
    primary: string; primaryHover: string;
    accent: string;  accentHover: string;
    background: string; surface: string;
    text: string; textMuted: string; border: string;
    success: string; danger: string;
  };
  fontPreset: FontPresetId;   // 'sora-plex' | 'manrope-inter' | 'outfit-source'
  radius: string;             // p. ej. '10px'
  radiusSm: string;
}

interface Plan {
  id: string; name: string; speedMbps: number;
  tier: 'base' | 'premium';
}

interface Benefits {
  premiumDiscount: number;              // fracción, p. ej. 0.12
  freeShippingFrom: number;             // en pesos
  installmentsWithoutInterest: number;  // cantidad de cuotas
}

/**
 * Un porcentaje único no sirve: la reventa de hardware deja ~10% de margen
 * total, un servicio recurrente deja mucho más, y un upgrade del plan propio
 * del ISP no tiene costo de mercadería. Ver ADR-029.
 */
interface RevenueShare {
  products:     { isp: number; platform: number };
  services:     { isp: number; platform: number };
  planUpgrades: { isp: number; platform: number };
}
```

En productos físicos la plataforma se queda con más que el ISP, porque pone el
catálogo y el fulfillment. En servicios se invierte, porque el ISP pone la
relación con el cliente y la cobranza. **En upgrades de plan `platform` es cero**:
el proveedor es el ISP, así que cobrarle ahí sería cobrarle por vender lo suyo
(`ADR-029`). El cero queda explícito en la configuración, no hardcodeado.

**Regla de copy con marca:** todo texto que nombre al ISP, al plan o a las cuotas
se interpola desde el tenant. Nunca se escribe el nombre del ISP ni una cantidad
de cuotas dentro de un componente.

## CatalogItem

Catálogo **de la plataforma**, en `src/data/catalog.json`. Compartido por todos
los ISPs; por eso el SKU lleva prefijo de plataforma y no del ISP.

El catálogo tiene **dos tipos de ítem** y el campo `kind` los discrimina
(`ADR-024`). La diferencia no es cosmética: un servicio no tiene stock, no se
envía, se cobra todos los meses en la factura del ISP y puede venir incluido en el
plan del abonado.

```ts
type CatalogItem = PhysicalProduct | ServiceItem;
```

### Campos comunes

| Campo | Tipo | Regla |
|---|---|---|
| `kind` | `'product' \| 'service'` | Discriminante de la unión |
| `id` | `string` | `{prefijo de categoría}-{3 dígitos}`, p. ej. `con-001`, `tv-002` |
| `slug` | `string` | Único en todo el catálogo. Es la URL |
| `sku` | `string` | Prefijo `NX-` |
| `name` | `string` | |
| `category` | `CategoryId` | Ver la tabla de categorías |
| `brand` | `string` | **Ficticia.** Ninguna marca real |
| `shortDescription` | `string` | Una línea, para la card |
| `description` | `string` | Dos o tres párrafos, sin exagerar |
| `featured` | `boolean` | Seis ítems en `true` |
| `active` | `boolean` | En `false` no aparece en la tienda, sí en el admin |
| `image` | `string \| null` | `null` en Fase 0 → se usa `ProductPlaceholder` |
| `specs` | `{ label, value }[]` | |
| `tags` | `string[]` | |

### `PhysicalProduct`

Compra de un solo tiro, con stock y envío.

| Campo | Tipo | Regla |
|---|---|---|
| `publicPrice` | `number` | Pesos, entero |
| `exclusivePrice` | `number` | Entre 6% y 14% por debajo del público |
| `supplierCost` | `number` | Entre 8% y 12% por debajo del exclusivo. **Piso duro de precio** |
| `stock` | `number` | `0` significa sin stock: no se puede agregar al carrito |
| `installmentsEligible` | `boolean` | Si es `false` no se muestran cuotas |

### `ServiceItem`

Alta recurrente, cobrada en la factura del ISP.

| Campo | Tipo | Regla |
|---|---|---|
| `publicMonthlyPrice` | `number` | Precio mensual sin ser abonado |
| `exclusiveMonthlyPrice` | `number` | Entre 6% y 25% por debajo del público |
| `providerMonthlyCost` | `number` | Lo que cuesta el servicio. **Piso duro de precio** |
| `includedInTiers` | `('base' \| 'premium')[]` | Tiers que ya lo tienen **sin cargo** |
| `commitmentMonths` | `number` | `0` = sin permanencia |
| `activation` | `'instant' \| 'next_invoice' \| 'technician'` | Cuándo empieza a funcionar |
| `fromPlanId` | `string \| undefined` | Solo `plan`: desde qué plan aplica el upgrade |
| `toPlanId` | `string \| undefined` | Solo `plan`: a qué plan lleva |

`includedInTiers` es lo que vuelve **concreto** el beneficio del plan premium. Un
12% de descuento es abstracto; *"tu plan ya incluye esto sin cargo"* no lo es. Un
ítem incluido muestra la etiqueta "Incluido en tu plan" en lugar de un precio, y
el botón dice "Activar" en vez de "Contratar".

`fromPlanId` y `toPlanId` hacen que cada abonado vea **solo el upgrade que le
corresponde** (`ADR-027`). Lucía, con Fibra 300, ve el pase a Fibra 600 + TV;
Camila, con Fibra 100, ve el pase a Fibra 300; quien ya está en el plan más alto
no ve el módulo. Es el momento de personalización más fuerte de la demo.

### Categorías

Las tres primeras son las que abren la landing, en ese orden (`ADR-025`).

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

Total: 30 — 18 servicios y 12 productos. Los dos ítems con `stock: 0` y el ítem
con `active: false` que pide el kickoff para probar esos estados salen del bloque
de productos físicos, que es donde el stock existe.

## Subscriber

Abonados del tenant, en `src/tenants/<id>/subscribers.json`.

```ts
interface Subscriber {
  id: string;
  dni: string;               // solo dígitos
  customerNumber: string;    // solo dígitos
  name: string;
  planId: string;            // referencia a tenant.plans
  status: SubscriberStatus;
  email: string;
  phone: string;
  customerSince: string;     // ISO date
  address: { street: string; number: string; city: string; postalCode: string };
}
```

### `SubscriberStatus` vs `EligibilityResult`

Son dos cosas distintas y conviene no confundirlas:

- **`SubscriberStatus`** es un atributo del abonado en el sistema del ISP:
  `'active' | 'suspended' | 'inactive'`.
- **`EligibilityResult`** es lo que devuelve `checkSubscriber()`:
  `'active' | 'suspended' | 'inactive' | 'not_found'`.

`not_found` **no es un estado de abonado**: es el resultado de buscar un
documento que no está en la base. Por eso no existe ningún registro con ese
estado en el JSON.

```ts
type EligibilityResult =
  | { result: 'active'; subscriber: Subscriber; plan: Plan; tier: 'base' | 'premium' }
  | { result: 'suspended'; subscriber: Subscriber }
  | { result: 'inactive'; subscriber: Subscriber }
  | { result: 'not_found' };
```

Solo `active` crea sesión. Los mensajes exactos de cada caso están en
`05-flujos-de-usuario.md`.

## Promotion

En `src/tenants/<id>/promotions.json`.

```ts
interface Promotion {
  id: string;
  name: string;
  type: 'banner' | 'tier_discount' | 'category_discount';
  discount?: number;                  // fracción; no aplica a 'banner'
  category?: CategoryId;              // acota por categoría
  tier?: 'base' | 'premium';          // acota por plan
  bannerTitle?: string;
  bannerSubtitle?: string;
  startsAt: string;                   // ISO date
  endsAt: string;                     // ISO date
  active: boolean;
}
```

**El estado no se guarda, se deriva** de las fechas y de `active`:

| Estado | Condición |
|---|---|
| Vigente | `active && startsAt <= hoy <= endsAt` |
| Programada | `active && hoy < startsAt` |
| Vencida | `!active \|\| hoy > endsAt` |

`getActivePromotions(date)` recibe la fecha por parámetro: no lee el reloj.

## Order

Generadas en `src/tenants/<id>/orders.json` y creadas durante la demo en
`localStorage`. `getOrders()` devuelve la unión de ambas.

```ts
interface Order {
  id: string;              // `${tenant.orderPrefix}-${año}-${4 dígitos}`
  subscriberId: string;
  subscriberName: string;
  createdAt: string;       // ISO datetime
  status: OrderStatus;
  items: OrderItem[];
  hasPhysicalItems: boolean;   // decide si hay envío y timeline de entrega
  oneOffSubtotal: number;      // Σ de los ítems 'once'
  monthlySubtotal: number;     // Σ de los ítems 'monthly' — NO se suma al anterior
  shipping: number;            // 0 si no hay físicos, o si supera freeShippingFrom
  oneOffTotal: number;         // oneOffSubtotal + shipping
  oneOffSavings: number;
  monthlySavings: number;
  address: Address | null;     // null si la orden es solo de servicios
  paymentMethod: 'invoice' | 'mercadopago' | 'card';
}

interface OrderItem {
  itemId: string;
  itemName: string;
  kind: 'product' | 'service';
  period: 'once' | 'monthly';
  quantity: number;            // siempre 1 en servicios
  publicPrice: number;         // congelado al momento de la compra
  finalPrice: number;          // congelado al momento de la compra
  appliedLabel: string;        // qué beneficio ganó
}
```

**Los importes de un solo tiro y los mensuales nunca se suman entre sí.** Una
orden de un Smart TV y un pack de streaming son $468.000 una vez **y** $9.900 por
mes: dos renglones, dos totales. Sumarlos daría un número que no significa nada.

Los precios se congelan **en la orden**, porque una orden es un hecho histórico.
En el **carrito** pasa lo contrario: solo se guarda `{ itemId, quantity }` y el
precio se recalcula siempre, para que un cambio del admin o el vencimiento de una
promo se reflejen al instante.

### Estados de pedido

| Estado | Etiqueta de UI | Nota |
|---|---|---|
| `pending` | Pendiente de pago | No aparece en el flujo de la demo: el checkout crea `paid` |
| `paid` | Confirmado | Estado inicial de una orden creada en la demo |
| `processing` | Preparando | Solo con ítems físicos |
| `shipped` | En camino | Solo con ítems físicos |
| `delivered` | Entregado | Solo con ítems físicos |
| `cancelled` | Cancelado | Se muestra fuera de la timeline |

La timeline de `/pedido/[id]` depende de qué se compró:

- **Con ítems físicos:** Confirmado → Preparando → En camino → Entregado.
- **Solo servicios:** no hay timeline de entrega. Muestra la fecha de activación y
  desde qué factura se cobra. Es un flujo de dos pasos, y por eso es el más corto
  y el más demostrable.

## Subscription

Un ítem de servicio contratado genera una suscripción, que es lo que después se
ve en "Mis servicios" y lo que alimenta las métricas recurrentes.

```ts
interface Subscription {
  id: string;
  subscriberId: string;
  itemId: string;
  itemName: string;
  orderId: string;             // la orden que la originó
  status: SubscriptionStatus;
  monthlyPrice: number;        // 0 si vino incluida en el plan
  publicMonthlyPrice: number;
  appliedLabel: string;
  startedAt: string;           // ISO date
  billedFrom: string;          // desde qué factura se cobra
  commitmentUntil: string | null;
  cancelledAt: string | null;
}
```

| Estado | Etiqueta de UI | Nota |
|---|---|---|
| `pending_activation` | Se activa con tu próxima factura | `activation: 'next_invoice'` |
| `scheduled_visit` | Coordinamos la visita técnica | `activation: 'technician'` |
| `active` | Activo | Cuenta para el MRR |
| `cancelled` | Dado de baja | Deja de contar para el MRR |

Solo las suscripciones `active` suman al ingreso recurrente. Las
`pending_activation` se muestran en "Mis servicios" pero no se facturan todavía.

## Metrics

En `src/tenants/<id>/metrics.json`, generado. Las definiciones de cada métrica
están en `07-metricas-y-kpis.md`, que es la única fuente.

```ts
interface Metrics {
  generatedAt: string;
  periods: {
    [days in 30 | 60 | 90]: {
      funnel: {
        subscribers: number;
        visits: number;
        validated: number;
        converted: number;       // abonados con al menos un alta o compra
        transactions: number;    // órdenes + altas de servicio
        gmv: number;             // un solo tiro + lo facturado de recurrentes
        ispRevenue: number;      // suma de los tres tramos de revenueShare
      };
      recurring: {
        activeSubscriptions: number;
        mrr: number;                    // al cierre del período
        ispRecurringRevenue: number;    // porción del MRR que va al ISP
        incrementalArpu: number;        // mrr / subscribers
        planUpgrades: number;
      };
      averageTicket: number;            // solo órdenes con ítems físicos
      repeatRate: number;
      savingsGenerated: { oneOff: number; monthly: number };
      platformRevenue: number;
      gmvPerThousandSubscribers: number;
    };
  };
  monthlySeries: { month: string; gmv: number; mrr: number; transactions: number }[];
  topItems: { itemId: string; name: string; kind: 'product' | 'service';
              units: number; gmv: number }[];   // 8
  categorySales: { category: CategoryId; gmv: number; share: number }[];
}
```

`savingsGenerated` viene partido en dos porque el ahorro de un solo tiro y el
ahorro mensual no son comparables. En el reporte se muestran uno al lado del otro:
*"les ahorramos $X una vez y $Y por mes"*. El segundo es el que retiene.

El generador valida los invariantes de `07-metricas-y-kpis.md` antes de escribir
el archivo y falla ruidosamente si alguno no se cumple.

## Algoritmo de precio

`computePrice(item, session | null, activePromotions, now)`. Función pura: no lee
el reloj ni `window`. Sirve para los dos tipos de ítem; lo único que cambia es de
dónde salen los precios base y qué significa el resultado.

```
sin sesión → finalPrice = precio público
             el precio exclusivo NUNCA se muestra ni se calcula para la vista

con sesión →
   [0] si es servicio y session.tier está en item.includedInTiers:
          finalPrice = 0
          appliedLabel = "Incluido en tu plan"
          ← corta acá, no se evalúa nada más

   candidatos:
   a) precio exclusivo del ítem                                 siempre
   b) público × (1 − benefits.premiumDiscount)                  si tier == 'premium'
   c) público × (1 − promo.discount)                            por cada promo vigente
                                                                que aplique por categoría
                                                                o por tier
   descartar todo candidato < costo del ítem                    piso duro
   finalPrice   = min(candidatos)      ← NO se acumulan: gana el mejor
   appliedLabel = nombre del candidato ganador
   savings        = público − finalPrice
   savingsPercent = savings / público
   installments   = finalPrice / benefits.installmentsWithoutInterest
                    (solo producto físico con installmentsEligible)
```

| | Producto físico | Servicio |
|---|---|---|
| Precio público | `publicPrice` | `publicMonthlyPrice` |
| Precio exclusivo | `exclusivePrice` | `exclusiveMonthlyPrice` |
| Piso duro | `supplierCost` | `providerMonthlyCost` |
| `period` del resultado | `'once'` | `'monthly'` |
| Cuotas | Sí, si `installmentsEligible` | Nunca — ya es mensual |
| Puede dar cero | No | Sí, si viene incluido en el plan |

Devuelve:

```ts
interface PriceQuote {
  period: 'once' | 'monthly';
  publicPrice: number;
  finalPrice: number;
  savings: number;
  savingsPercent: number;
  installments: { count: number; amount: number } | null;
  appliedLabel: string;
  isExclusive: boolean;
  isIncludedInPlan: boolean;
}
```

`period` es lo que decide cómo se muestra la cifra: `$ 189.000` o
`$ 8.900 por mes`. Nunca se mezclan en una misma suma; el carrito y los totales
llevan los dos renglones separados.

El caso `isIncludedInPlan` se evalúa **antes** que todo lo demás y corta la
cadena: no tiene sentido buscar el mejor descuento sobre algo que no se cobra.

### Ejemplos numéricos

Tenant en los tres casos: `premiumDiscount` 0,12 · `installmentsWithoutInterest` 6.

#### a) Producto físico

**Smart TV 50"**, categoría `entretenimiento`. `publicPrice` $520.000 ·
`exclusivePrice` $468.000 · `supplierCost` $421.200 · `installmentsEligible: true`.

| Caso | Candidatos | `finalPrice` | Ahorro | `appliedLabel` |
|---|---|---|---|---|
| Sin sesión | — | $520.000 | — | — |
| Fibra 100 (base) | 468.000 | **$468.000** | $52.000 (10,0%) | Precio cliente |
| Fibra 300 (base) | 468.000 | **$468.000** | $52.000 (10,0%) | Precio cliente |
| Fibra 600 + TV (premium) | 468.000 · 457.600 | **$457.600** | $62.400 (12,0%) | Plan premium |
| Premium + promo 15% en `entretenimiento` | 468.000 · 457.600 · 442.000 | **$442.000** | $78.000 (15,0%) | Combo pantalla grande |
| Premium + promo 20% (activa el piso) | 468.000 · 457.600 · ~~416.000~~ | **$457.600** | $62.400 (12,0%) | Plan premium |

En el último caso el candidato de $416.000 queda por debajo del `supplierCost` de
$421.200, así que se descarta y se registra en consola solo en desarrollo. Los
descuentos no se suman nunca: en la fila de la promo del 15% el abonado premium
recibe 15%, no 12% + 15%. Cuotas del caso premium: 6 × $76.267.

#### b) Servicio incluido en el plan premium

**Pack Streaming Total**, categoría `tv`. `publicMonthlyPrice` $12.000 ·
`exclusiveMonthlyPrice` $9.900 · `providerMonthlyCost` $7.200 ·
`includedInTiers: ['premium']`.

| Caso | `finalPrice` | Ahorro | `appliedLabel` |
|---|---|---|---|
| Sin sesión | $12.000/mes | — | — |
| Fibra 100 · Fibra 300 (base) | **$9.900/mes** | $2.100/mes (17,5%) | Precio cliente |
| Fibra 600 + TV (premium) | **$0** | $12.000/mes (100%) | Incluido en tu plan |

Este es el par que hay que mostrar en la reunión uno al lado del otro: Lucía
(Fibra 300) ve $9.900 por mes y Martín (Fibra 600 + TV) ve "Incluido en tu plan".
El beneficio del plan premium deja de ser un porcentaje abstracto.

#### c) Servicio donde gana el descuento premium

**Pase Gaming**, categoría `gaming`. `publicMonthlyPrice` $7.500 ·
`exclusiveMonthlyPrice` $6.900 · `providerMonthlyCost` $5.500 ·
`includedInTiers: []`.

| Caso | Candidatos | `finalPrice` | Ahorro | `appliedLabel` |
|---|---|---|---|---|
| Sin sesión | — | $7.500/mes | — | — |
| Base | 6.900 | **$6.900/mes** | $600/mes (8,0%) | Precio cliente |
| Premium | 6.900 · 6.600 | **$6.600/mes** | $900/mes (12,0%) | Plan premium |

#### d) Upgrade del plan propio del ISP

**Pasá a Fibra 300**, categoría `plan`. `fromPlanId: 'fibra-100'` ·
`toPlanId: 'fibra-300'` · `publicMonthlyPrice` $9.000 ·
`exclusiveMonthlyPrice` $7.500 · `providerMonthlyCost` $0.

El precio es **la diferencia mensual** contra el plan actual, no el precio del
plan nuevo. Solo lo ve un abonado cuyo `planId` sea `fibra-100`.

| Caso | `finalPrice` | Ahorro | `appliedLabel` |
|---|---|---|---|
| Camila Prieto (Fibra 100) | **$7.500/mes más** | $1.500/mes (16,7%) | Precio cliente |
| Lucía Ferreyra (Fibra 300) | — | — | No se muestra: ya tiene ese plan |

`providerMonthlyCost` es cero porque el servicio es del propio ISP: no hay costo
de mercadería. El precio desde la tienda es mejor que el del canal telefónico, lo
que además empuja el autoservicio y descarga el centro de atención — un argumento
lateral que en la reunión suele pesar más de lo esperado.

### Restricciones en el admin

En `/admin/catalogo`, el precio exclusivo editable no puede superar el público ni
bajar del `supplierCost`. La validación es la misma función, para que la tienda y
el admin nunca discrepen.
