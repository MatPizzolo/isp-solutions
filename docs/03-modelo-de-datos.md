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
| `revenueShare` | `RevenueShare` | `isp` y `platform`, como fracción del GMV |
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
```

**Regla de copy con marca:** todo texto que nombre al ISP, al plan o a las cuotas
se interpola desde el tenant. Nunca se escribe el nombre del ISP ni una cantidad
de cuotas dentro de un componente.

## Product

Catálogo **de la plataforma**, en `src/data/products.json`. Compartido por todos
los ISPs; por eso el SKU lleva prefijo de plataforma y no del ISP.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `string` | `{prefijo de categoría}-{3 dígitos}`, p. ej. `con-001` |
| `slug` | `string` | Único. Es la URL en `/producto/[slug]` |
| `sku` | `string` | Prefijo `NX-` |
| `name` | `string` | |
| `category` | `CategoryId` | Una de las cinco |
| `brand` | `string` | **Ficticia.** Ninguna marca real |
| `shortDescription` | `string` | Una línea, para la card |
| `description` | `string` | Dos o tres párrafos, sin exagerar |
| `publicPrice` | `number` | Pesos, entero |
| `exclusivePrice` | `number` | Entre 6% y 14% por debajo del público |
| `supplierCost` | `number` | Entre 8% y 12% por debajo del exclusivo. **Es el piso duro de precio** |
| `stock` | `number` | `0` significa sin stock: no se puede agregar al carrito |
| `featured` | `boolean` | Seis productos en `true` |
| `active` | `boolean` | En `false` no aparece en la tienda, sí en el admin |
| `image` | `string \| null` | `null` en Fase 0 → se usa `ProductPlaceholder` |
| `specs` | `{ label, value }[]` | |
| `tags` | `string[]` | |
| `installmentsEligible` | `boolean` | Si es `false` no se muestran cuotas |

### Categorías

| id | Nombre | Productos |
|---|---|---|
| `conectividad` | Conectividad | 8 |
| `seguridad` | Seguridad | 6 |
| `entretenimiento` | Entretenimiento | 5 |
| `tecnologia` | Tecnología | 6 |
| `hogar` | Hogar conectado | 5 |

Total: 30. Dos productos con `stock: 0` y uno con `active: false`, para poder
mostrar esos estados.

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
  subtotal: number;        // Σ finalPrice × quantity
  shipping: number;        // 0 si subtotal >= benefits.freeShippingFrom
  total: number;           // subtotal + shipping
  savings: number;         // Σ (publicPrice − finalPrice) × quantity
  address: Address;
  paymentMethod: 'mercadopago' | 'card' | 'invoice';
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  publicPrice: number;     // congelado al momento de la compra
  finalPrice: number;      // congelado al momento de la compra
  appliedLabel: string;    // qué beneficio ganó
}
```

Los precios se congelan **en la orden**, porque una orden es un hecho histórico.
En el **carrito** pasa lo contrario: solo se guarda `{ productId, quantity }` y el
precio se recalcula siempre, para que un cambio del admin o el vencimiento de una
promo se reflejen al instante.

### Estados de pedido

| Estado | Etiqueta de UI | Nota |
|---|---|---|
| `pending` | Pendiente de pago | No aparece en el flujo de la demo: el checkout crea `paid` |
| `paid` | Confirmado | Estado inicial de una orden creada en la demo |
| `processing` | Preparando | |
| `shipped` | En camino | |
| `delivered` | Entregado | |
| `cancelled` | Cancelado | Se muestra fuera de la timeline |

La timeline de `/pedido/[id]` es exactamente esta lista **sin `pending` ni
`cancelled`**: Confirmado → Preparando → En camino → Entregado.

## Metrics

En `src/tenants/<id>/metrics.json`, generado. Las definiciones de cada métrica
están en `07-metricas-y-kpis.md`, que es la única fuente.

```ts
interface Metrics {
  generatedAt: string;
  periods: {
    [days in 30 | 60 | 90]: {
      funnel: { subscribers: number; visits: number; validated: number;
                buyers: number; orders: number; gmv: number; ispRevenue: number };
      averageTicket: number;
      repeatRate: number;
      savingsGenerated: number;
      platformRevenue: number;
      gmvPerThousandSubscribers: number;
    };
  };
  monthlySeries: { month: string; gmv: number; orders: number }[];   // 6 meses
  topProducts: { productId: string; name: string; units: number; gmv: number }[];  // 8
  categorySales: { category: CategoryId; gmv: number; share: number }[];
}
```

El generador valida los invariantes de `07-metricas-y-kpis.md` antes de escribir
el archivo y falla ruidosamente si alguno no se cumple.

## Algoritmo de precio

`computePrice(product, session | null, activePromotions, now)`. Función pura: no
lee el reloj ni `window`.

```
sin sesión → finalPrice = publicPrice
             el precio exclusivo NUNCA se muestra ni se calcula para la vista

con sesión → candidatos:
   a) product.exclusivePrice                                    siempre
   b) publicPrice × (1 − benefits.premiumDiscount)              si tier == 'premium'
   c) publicPrice × (1 − promo.discount)                        por cada promo vigente
                                                                que aplique por categoría
                                                                o por tier
   descartar todo candidato < product.supplierCost              piso duro
   finalPrice   = min(candidatos)      ← NO se acumulan: gana el mejor
   appliedLabel = nombre del candidato ganador
   savings        = publicPrice − finalPrice
   savingsPercent = savings / publicPrice
   installments   = finalPrice / benefits.installmentsWithoutInterest
                    (solo si product.installmentsEligible)
```

Devuelve:

```ts
interface PriceQuote {
  publicPrice: number;
  finalPrice: number;
  savings: number;
  savingsPercent: number;
  installments: { count: number; amount: number } | null;
  appliedLabel: string;
  isExclusive: boolean;
}
```

### Ejemplos numéricos

Producto de referencia: **Smart TV 50"**, categoría `entretenimiento`.
`publicPrice` $520.000 · `exclusivePrice` $468.000 · `supplierCost` $421.200 ·
`installmentsEligible: true`. Tenant: `premiumDiscount` 0,12 ·
`installmentsWithoutInterest` 6.

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
recibe 15%, no 12% + 15%.

Cuotas del caso premium: 6 × $76.267.

### Restricciones en el admin

En `/admin/catalogo`, el precio exclusivo editable no puede superar el público ni
bajar del `supplierCost`. La validación es la misma función, para que la tienda y
el admin nunca discrepen.
