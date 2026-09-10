# Flujos de usuario

Los mensajes de este documento son los textos **exactos** de la UI. Si un mensaje
cambia, cambia acá primero.

## 1. Elegibilidad

```
Entrada: DNI o número de cliente
   │
   ▼
normalizar: quitar puntos, espacios y guiones → solo dígitos
   │
   ├─ vacío o menos de 6 dígitos ──▶ error de formato (no consulta)
   │
   ▼
buscar en subscribers del tenant, por dni y por customerNumber
   │
   ├─▶ not_found   ──▶ mensaje + sugerencia
   ├─▶ inactive    ──▶ mensaje, sin CTA de regularización
   ├─▶ suspended   ──▶ mensaje + CTA a WhatsApp del ISP
   └─▶ active      ──▶ crear sesión { subscriberId, name, planId, tier, validatedAt }
                       marcar flag de revelación (sessionStorage)
                       redirigir a ?next= o a /tienda
                       (si validó desde el hero: no redirige, revela ahí mismo)
```

### Mensajes exactos

| Resultado | Mensaje | Acción |
|---|---|---|
| Formato inválido | "Ingresá tu DNI sin puntos ni espacios." | Foco en el input, no consulta |
| `not_found` | "No encontramos ese DNI. Probá con tu número de cliente (está en tu factura)." | Link a "¿Dónde encuentro mi número de cliente?" |
| `inactive` | "Esta cuenta ya no tiene servicio activo. Los beneficios son para clientes de {tenant.name}." | Link al sitio del ISP |
| `suspended` | "Tu cuenta está suspendida. Regularizala para volver a acceder a tus beneficios." | Botón "Hablar por WhatsApp" a `tenant.supportWhatsapp` |
| `active` | "Hola, {nombre}. Tenés {plan} — ya podés ver tus precios." | Revelación del precio |

El resultado se anuncia con `aria-live="polite"`. El estado de error no reemplaza
el input: se muestra debajo, y el valor ingresado se conserva.

### Sesión

- Clave `nexo:session:<tenantId>` en `localStorage`.
- Vence a las 24 horas de `validatedAt`. Una sesión vencida se borra al leerla y
  se trata como si no existiera.
- El header muestra "Hola, {nombre} · {plan}" con un botón "Salir".
- "Salir" borra la sesión y el flag de revelación, y deja el carrito intacto.

## 2. La revelación del precio

### Camino de la reunión: `/ingresar` → `/tienda`

```
[1]  El abonado escribe su DNI en /ingresar y toca "Ver mi precio"
[2]  checkSubscriber() devuelve active            (síncrono, sin red)
[3]  signIn(): guarda la sesión y arma el flag one-shot en sessionStorage
[4]  Saludo con nombre y plan, y navegación a ?next= o a /tienda
[5]  Al montar la grilla, el orquestador consume el flag, lo borra
     y pasa a la fase "revelando"
[6]  Los precios de la grilla, en cascada de izquierda a derecha
     y de arriba hacia abajo:
        · el precio público se tacha
        · el precio exclusivo cae en su lugar
        · aparece el chip de ahorro en $ y %
[7]  Al terminar, la fase pasa a "listo" y no vuelve a ocurrir
```

### Camino alternativo: el hero de la landing

Idéntico, salvo que **no hay navegación**: la revelación ocurre en el mismo lugar,
sobre los productos destacados. Lo pide la sección 12 del kickoff y se implementa,
pero no es el camino que se recorre en la reunión (`ADR-018`).

Reglas comunes:

- **Una sola vez.** El flag se borra antes de animar, así que ni una recarga ni
  StrictMode en desarrollo la repiten.
- **La revelación sobrevive el cambio de ruta.** Los providers viven en
  `(store)/layout.tsx`, por encima de las páginas, así que no se desmontan al
  navegar de `/ingresar` a `/tienda`.
- **El escalonado se topea.** Sobre la grilla completa hay muchos más precios que
  sobre los seis destacados; a partir del índice 11 el retraso deja de crecer para
  que los últimos productos no queden colgando.
- `prefers-reduced-motion: reduce` desactiva la animación. Se llega al mismo
  resultado, sin transición.
- Antes de conocer la sesión, cada precio muestra un skeleton del mismo tamaño
  que el precio final. Nunca se ve el precio público convertirse en exclusivo por
  efecto de una recarga.

## 3. Catálogo y producto

```
/tienda
   ├─ chips de categoría: TV · Celular · Gaming · Seguridad digital ·
   │                      Tu plan · y las de producto físico
   ├─ búsqueda por texto
   ├─ orden: relevancia | precio ascendente | precio descendente | ahorro
   ├─ módulo "Tu plan" arriba de todo, solo con sesión:
   │     "Tenés {plan actual} — pasá a {plan siguiente} por ${delta} más por mes"
   │     (no se muestra si el abonado ya está en el plan más alto)
   └─ grilla de ítems activos
        │
        └─▶ /beneficio/[slug]
                ├─ sin sesión:  precio público + precio exclusivo con candado
                │               CTA "Ingresá tu DNI para ver tu precio"
                ├─ con sesión, producto físico:
                │      público tachado, exclusivo, ahorro en $ y %,
                │      cuotas sin interés, specs, stock
                ├─ con sesión, servicio:
                │      público tachado, exclusivo por mes, ahorro mensual,
                │      permanencia, cuándo se activa, desde qué factura se cobra
                ├─ servicio incluido en el plan:
                │      "Incluido en tu plan" en lugar del precio,
                │      botón "Activar" en lugar de "Contratar"
                └─ stock 0 (solo físicos): "Sin stock por ahora", botón deshabilitado
```

El **módulo "Tu plan"** es el momento de personalización más fuerte de la tienda
(`ADR-027`). Camila, con Fibra 100, ve el pase a Fibra 300; Lucía, con Fibra 300,
ve el pase a Fibra 600 + TV; Martín, que ya tiene el plan más alto, no ve el
módulo. Es lo que hace que la tienda se sienta "Mi Cuenta" y no una vidriera.

Estados de la búsqueda:

| Estado | Mensaje |
|---|---|
| Sin resultados | "No encontramos productos para «{término}». Probá con otra palabra o mirá todas las categorías." |
| Categoría vacía | "Todavía no hay productos en esta categoría." |

Un producto con `active: false` no aparece en la tienda ni es accesible por URL
directa: devuelve 404.

## 4. Carrito

```
Agregar al carrito
   ├─ producto sin stock   ──▶ bloqueado, no se puede agregar
   ├─ cantidad > stock     ──▶ se limita al stock disponible
   ├─ servicio             ──▶ cantidad siempre 1, sin control de cantidad
   ├─ servicio ya contratado ──▶ bloqueado: "Ya tenés este servicio activo"
   ├─ servicio incluido en el plan ──▶ no va al carrito: se activa directo
   └─ ok                   ──▶ se guarda { itemId, quantity }
                               se abre el drawer lateral con el ítem agregado
```

El carrito muestra **dos totales que nunca se suman entre sí**:

```
Pagás hoy                       $ 468.000
  Smart TV 50"                  $ 468.000
  Envío                             gratis

Se suma a tu factura          $ 9.900 / mes
  Pack Streaming Total        $ 9.900 / mes

Estás ahorrando $ 52.000 hoy y $ 2.100 por mes por ser cliente de {tenant.name}
```

- El carrito **nunca guarda precios**. Se recalculan con `computePrice` en cada
  render, así que un cambio de precio en el admin o el vencimiento de una promo
  se ven al instante.
- Envío: gratis desde `benefits.freeShippingFrom`, y solo cuenta el subtotal de
  ítems físicos. Si falta poco, se muestra "Te faltan {monto} para el envío
  gratis". Un carrito de solo servicios no muestra envío en absoluto.
- Vacío: "Tu carrito está vacío. Mirá lo que podés sumar con tu precio de
  cliente." con un botón a `/tienda`.

## 5. Checkout

El checkout tiene **dos formas**, según qué haya en el carrito. Es la diferencia
más visible del reencuadre a servicios (`ADR-024`, `ADR-026`).

### 5.a Solo servicios — el camino corto

```
¿Hay sesión activa?
   ├─ no ──▶ redirigir a /ingresar?next=/checkout
   └─ sí ──▶
        Paso 1 · Confirmación
           qué se contrata, cuánto suma por mes, desde qué factura se cobra,
           cuándo se activa y si tiene permanencia
           cobro: "Se suma a tu factura de {tenant.name}"   ← único método
        Paso 2 · Listo
           botón único: "Confirmar y activar"
```

**Sin dirección de entrega, sin datos de pago, sin envío.** Dos pasos y afuera.
Es el flujo más corto de toda la demo y por eso el más fácil de mostrar en la
reunión: el abonado no tiene que sacar la tarjeta ni crear una cuenta en ningún
lado.

### 5.b Con productos físicos

```
Paso 1 · Datos de entrega
   prellenados desde el abonado, editables
   validación: calle, número, localidad y CP obligatorios
Paso 2 · Pago
   ● Débito en la factura de {tenant.name}        ← preseleccionado
   ○ Mercado Pago
   ○ Tarjeta en {benefits.installmentsWithoutInterest} cuotas sin interés
Paso 3 · Revisión
   ítems, subtotal, envío, ahorro
   si además hay servicios, el resumen muestra los dos renglones por separado:
      "Pagás hoy: $X"   ·   "Se suma a tu factura: $Y por mes"
   botón único: "Confirmar pedido"
```

El débito en factura es el método **principal y preseleccionado**, no una opción
futura (`ADR-026`): es la única capacidad que ningún competidor puede copiar. Los
otros dos quedan como alternativa.

No se piden ni se muestran datos de tarjeta en ningún momento.

**Los importes de un solo tiro y los mensuales nunca se suman entre sí.** Un total
que mezcle $468.000 con $9.900 por mes es un número que no significa nada.

Al confirmar:

```
createOrder()
   ├─ id = {tenant.orderPrefix}-{año}-{secuencia de 4 dígitos}
   ├─ status = 'paid'
   ├─ congela publicPrice, finalPrice y appliedLabel de cada ítem
   ├─ guarda en nexo:orders:<tenantId>
   ├─ por cada ítem de servicio → createSubscription()
   │     ├─ status según item.activation:
   │     │     instant       → 'active'
   │     │     next_invoice  → 'pending_activation'
   │     │     technician    → 'scheduled_visit'
   │     ├─ billedFrom = próxima factura
   │     └─ guarda en nexo:subscriptions:<tenantId>
   ├─ vacía el carrito
   └─ redirige a /pedido/[id]
```

## 6. Pedido

```
/pedido/[id]
   ├─ número de pedido, fecha y estado actual
   ├─ resumen de ítems con lo que se ahorró en cada uno,
   │  con los renglones de un solo tiro y los mensuales separados
   │
   ├─ si tiene ítems físicos:
   │     dirección de entrega
   │     timeline:  Confirmado ──▶ Preparando ──▶ En camino ──▶ Entregado
   │                (los estados posteriores al actual se ven apagados)
   │
   └─ si es solo de servicios:
         sin timeline de entrega
         "Se activa {cuándo}" y "Se cobra desde tu factura de {mes}"
```

- Un pedido `cancelled` muestra el aviso fuera de la timeline.
- En modo demo aparece un botón "Avanzar estado" que mueve el pedido al siguiente
  estado. Solo aparece si el pedido tiene ítems físicos: un servicio no tiene
  estados de entrega que avanzar.
- Un id inexistente devuelve 404.

## 7. Mis servicios y mis pedidos

```
/mis-servicios
   ├─ sin sesión     ──▶ redirigir a /ingresar?next=/mis-servicios
   ├─ sin servicios  ──▶ "Todavía no sumaste ningún servicio."
   │                     + botón "Ver qué podés sumar"
   └─ con servicios  ──▶ lista con estado, precio mensual y desde cuándo
                         + total: "Estás sumando ${monto} por mes a tu factura"
                         + los incluidos en el plan aparecen en $0,
                           marcados como "Incluido en tu plan"

/mis-pedidos
   ├─ sin sesión  ──▶ redirigir a /ingresar?next=/mis-pedidos
   ├─ sin pedidos ──▶ "Todavía no hiciste ningún pedido." + botón "Ver productos"
   └─ con pedidos ──▶ lista ordenada por fecha, con estado y total
```

Son dos pantallas separadas a propósito: un servicio activo y un pedido entregado
son cosas distintas y se consultan por motivos distintos. Mezclarlas en una sola
lista obligaría a explicar la diferencia con etiquetas.

## 8. Admin

```
/admin  (login mock)
   ├─ credenciales incorrectas ──▶ "Usuario o clave incorrectos."
   └─ correctas ──▶ sesión admin en localStorage ──▶ /admin/dashboard

admin/layout.tsx: si no hay sesión admin, redirige a /admin
```

### Editor de marca

```
/admin/marca
   ├─ logo: subida local. Si pesa menos de 200 KB se guarda como data URL
   │         en los overrides; si pesa más, queda solo en memoria y se avisa:
   │         "El logo es muy grande para guardarlo en la demo. Se ve en el
   │          preview pero no se conserva al recargar."
   ├─ color primario y color de acento (los hover se derivan solos)
   ├─ tipografía: los tres presets
   ├─ radio, tagline, título y subtítulo del hero
   ├─ preview en vivo: la landing real, no una maqueta
   └─ "Restablecer": borra los overrides de marca
```

Cada cambio se refleja en el preview al instante, incluidas las ilustraciones de
producto, porque usan el color primario del ámbito en el que están renderizadas.

### Overrides

Los cambios de catálogo, promociones y marca se guardan como overrides parciales
sobre los JSON base, en `nexo:admin-overrides:<tenantId>`. La tienda lee
`base + overrides`. Consecuencias visibles en la demo:

- Desactivar un producto lo saca de la tienda.
- Cambiar un precio exclusivo cambia lo que ve el abonado.
- Cambiar dos colores retematiza la tienda entera.

### Restablecer demo

Disponible en el sidebar del admin y en el panel flotante de modo demo. Borra
todas las claves `nexo:*` del tenant activo —sesión, carrito, órdenes, sesión
admin y overrides— y recarga. Pide confirmación antes: "Esto borra la sesión, el
carrito, los pedidos de la demo y los cambios del panel. ¿Seguimos?".
