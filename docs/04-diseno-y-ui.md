# Diseño y UI

Plan de diseño completo. Se escribió antes de codear una sola línea de UI de
producto, se revisó contra la checklist de tells genéricos de `KICKOFF.md` §12, y
la sección 13 anota qué cambió después de esa revisión.

Contexto de público, tono y restricciones: `.impeccable.md` en la raíz.

---

## 1. Dirección

**Minimalismo refinado, con toda la audacia concentrada en un solo momento.**

Es una decisión, no timidez. La tienda es de un operador regional que necesita
parecer confiable, y el principio 1 del proyecto dice que si la plataforma se nota
más que el operador, está mal. Un diseño llamativo en cada sección rompería
exactamente eso.

La consecuencia práctica: **el sistema de diseño de la plataforma no tiene colores
propios.** Todos salen de `tenant.json`. Lo único que aportamos es estructura,
ritmo y tipografía, y esas tres cosas tienen que sostenerse sin ayuda del color.

### La escena, que define el tema

> Un abonado de 55 años abre la tienda desde el celular, en la cocina de su casa,
> a las ocho de la noche, con la factura del mes al lado. Quiere entender si le
> conviene.

Tema **claro**. No por prudencia: porque esto se parece a una factura y a un
"Mi Cuenta", y las facturas son claras. Un fondo oscuro con acentos brillantes
sería la reflexión automática de "producto de tecnología" y contradiría la escena.

### El elemento memorable, y el único

**La revelación del precio.** Guion completo en la sección 4.

Todo lo demás se mantiene quieto: sin fade-in por sección, sin hover elaborado en
cada card, sin gradientes decorativos, sin animaciones al hacer scroll.

---

## 2. Tokens

Todos salen del tenant. Acá se documenta qué significa cada uno y cuándo se usa.
Los valores de ejemplo son los de Zonda Fibra.

### Color

| Token | Rol | Cuándo se usa |
|---|---|---|
| `primary` | Azul noche `#0E2A47` | Navegación, botones secundarios, superficies de énfasis, ilustraciones de producto |
| `accent` | Ámbar `#F2A43A` | **Escaso.** CTA principal y ahorro. Si aparece en más de dos lugares por pantalla, sobra |
| `background` | Gris frío `#F3F5F8` | Fondo de página |
| `surface` | Blanco `#FFFFFF` | Tarjetas, tablas, inputs |
| `ink` | Tinta `#142033` | Texto principal |
| `muted` | `#55627A` | Texto secundario, etiquetas, precio tachado |
| `line` | `#D9DFE8` | Bordes y separadores de 1px |
| `success` | Verde `#1E8A5F` | Validación correcta, servicio activo |
| `danger` | Rojo `#C8401F` | Errores, cuenta suspendida |

**Ni negro puro ni blanco puro para texto.** La tinta es azulada y el gris de
fondo también: comparten el matiz del primario, que es lo que da cohesión sin que
se note.

**Regla del ámbar.** El acento marca dos cosas y nada más: la acción principal de
la pantalla, y el dinero que el abonado se ahorra. Nunca decora.

### Opacidades

Tailwind v4 compila `bg-accent/15` a `color-mix(in oklab, …)`, que acepta hex sin
problema. Se usan solo tres niveles, para que no proliferen:

- `/10` fondo de chip sobre superficie clara
- `/15` fondo de estado
- `/30` bordes suaves

### Radio y elevación

- `rounded-base` (10px): tarjetas, botones, inputs.
- `rounded-sm` (6px): chips, badges, celdas editables.
- **Sin sombras.** La separación se hace con `line` de 1px y con el contraste
  entre `background` y `surface`. Una sombra gris difusa en cada tarjeta es el
  primer tell de la lista.
- Única excepción: el drawer del carrito y el panel de modo demo, que flotan sobre
  el contenido y necesitan despegarse. Ahí sí, una sombra sola y contenida.

---

## 3. Tipografía

Preset por defecto `sora-plex`: **Sora** para títulos, **IBM Plex Sans** para
cuerpo e interfaz.

Que las fuentes sean cargadas y no del sistema no es capricho: **poder cambiar la
tipografía en vivo es parte del argumento de venta del white-label.** Los tres
presets tienen que verse distintos entre sí o el momento 5 de la demo no se nota.

### Escala

| px | Uso | Familia | Peso |
|---|---|---|---|
| 13 | Etiquetas de tabla, notas al pie, ayuda de campo | cuerpo | 400/500 |
| 15 | Interfaz general, botones, celdas | cuerpo | 400/500 |
| 17 | Cuerpo de lectura, descripciones | cuerpo | 400 |
| 22 | Títulos de sección, precio en tarjeta | título | 600 |
| 28 | Títulos de pantalla, precio en detalle | título | 600 |
| 36 | Hero secundario, cifras del dashboard | título | 600 |
| 48 | Hero de la landing | título | 700 |

Escala fija en rem, no fluida: el abonado mira a un DPI consistente y un título
que se encoge dentro de un panel se ve peor, no mejor.

Los saltos son **ajustados abajo y amplios arriba** (1,15 entre 13 y 17; 1,29 entre
22 y 48). Es a propósito: la zona de interfaz necesita muchos tamaños cercanos sin
hacer ruido, y la zona de títulos necesita contraste real.

### Reglas

- Títulos en **sentence case**. Nunca en mayúsculas, nunca title case.
- Medida de línea máxima de 68 caracteres en prosa. Las tablas pueden ser más anchas.
- **Sin eyebrows** en mayúsculas espaciadas sobre los títulos.
- Ninguna palabra suelta resaltada en color dentro de un título.
- **Todas las cifras con `tabular-nums`**, en la fuente de cuerpo. Nunca
  monospace: durante la revelación los dígitos no pueden bailar, y monospace para
  cifras chicas es un tell.

---

## 4. La revelación del precio

Es el único momento con coreografía del proyecto entero, y el que se recorre en la
reunión. Camino oficial: `/ingresar` → `/tienda` (`ADR-018`).

### Por qué se permite acá y no en otro lado

La guía de producto dice que la interfaz no debe tener secuencias orquestadas de
carga, y es correcto: el usuario está en una tarea y no quiere mirar cómo carga.
**Esto no es una animación de carga: es un cambio de estado disparado por el
propio abonado.** Comunica que algo pasó como consecuencia de lo que hizo, que es
exactamente para lo que sirve el movimiento.

### El bloque de precio: tres renglones, siempre

Es la pieza que hace que nada se mueva. El bloque **siempre ocupa tres renglones**,
en los tres estados:

```
              cargando           sin sesión              revelado
           ┌────────────┐    ┌────────────────┐    ┌──────────────────┐
renglón A  │ ▓▓▓▓▓      │    │                │    │ $ 520.000        │  ← tachado, muted, 15px
renglón B  │ ▓▓▓▓▓▓▓▓▓  │    │ $ 520.000      │    │ $ 468.000        │  ← 22px, ink
renglón C  │ ▓▓▓▓       │    │ 🔒 Tu precio   │    │ Ahorrás $ 52.000 │  ← chip ámbar, 13px
           └────────────┘    └────────────────┘    └──────────────────┘
```

El renglón A está **reservado y vacío** cuando no hay sesión. Por eso el precio
tachado aparece en un espacio que ya existía y **nada se corre de lugar**. El
skeleton de carga ocupa los mismos tres renglones.

Un `span` invisible dentro de cada renglón, con el contenido más ancho posible,
fija el ancho del bloque. Así el número final no cambia el ancho de la tarjeta al
aparecer.

### Guion, con tiempos

```
t=0      El abonado toca "Ver mi precio" en /ingresar
         checkSubscriber() resuelve sincrónico, sin red
         El borde del input pasa a `success`                      120 ms

t=120    Aparece el saludo, con aria-live="polite"
         "Hola, Lucía. Tenés Fibra 300."                          200 ms, ease-out-quart

t=650    Navegación a /tienda
         Los 530 ms de espera son deliberados: es el instante en
         que se ve que la validación funcionó. Es parte del pitch,
         no una demora.

t=650+   Monta /tienda. La sesión ya está lista —el provider vive
         en (store)/layout y no se desmontó— así que no hay
         skeleton. El módulo "Tu plan" ya está en el primer paint:
         no entra animado, porque eso movería el contenido de abajo.

         Por cada precio visible, con retraso = índice × 40 ms
         (índice topeado en 9, o sea 360 ms de cascada máxima):

           +0 → 180 ms   se dibuja el tachado sobre el precio de lista
                         (scaleX de 0 a 1, origen izquierda)
         +100 → 420 ms   el precio exclusivo cae en el renglón B
                         (translateY -0,35em → 0, opacidad 0 → 1)
         +260 → 480 ms   aparece el chip de ahorro en el renglón C
                         (opacidad 0 → 1, scale 0,94 → 1)

t≈1130   Fin. La fase pasa a "listo" y no vuelve a ocurrir.
```

**Total desde el toque hasta el último precio: alrededor de 1,1 segundos**, de los
cuales 840 ms son la cascada. Entra en el presupuesto de una animación de entrada
(500–800 ms) más la pausa deliberada del saludo.

### Curvas

```css
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);   /* todo lo que entra */
```

Una sola curva para todo el movimiento del proyecto. **Sin rebote y sin
elástico**: ninguna curva sobrepasa 1 en el eje de salida. Un objeto real
desacelera, no rebota, y el overshoot llama la atención sobre la animación en vez
de sobre el contenido.

### Movimiento reducido

```css
@media (prefers-reduced-motion: reduce) {
  /* No se elimina la transición: se reemplaza por un fundido sin desplazamiento */
  .price-root[data-state="revealing"] * {
    animation: fade-in 200ms linear both;
    transform: none;
  }
}
```

Se conserva la señal de que algo cambió, se saca el movimiento espacial. Resolver
esto solo en CSS es obligatorio: llamar a `matchMedia()` durante el render sería
una fuente de mismatch de hidratación.

### Una sola vez

El flag de `sessionStorage` se borra **antes** de arrancar la animación, y un
`ref` marca que ya se consumió. Ni una recarga ni la doble invocación de efectos
de StrictMode en desarrollo la repiten.

---

## 5. Layout

- Contenedor máximo **1200px**, con 16px de aire lateral en móvil y 24px desde
  640px.
- Grilla base de **4px**. Los valores de espaciado usados son 4, 8, 12, 16, 24,
  32, 48, 64, 96.
- **Contenido alineado a la izquierda.** Solo el hero de la landing se centra.
- **Ritmo variado, no uniforme.** Entre secciones: 96px después del hero, 64px
  entre secciones de contenido, 48px antes del footer. Dentro de una sección:
  título a contenido 24px, entre ítems de lista 12px. Un espaciado idéntico en
  todos lados es monotonía.
- **No todo es una tarjeta.** Bordes y fondos solo cuando separan información
  real. La franja de confianza, "Cómo funciona" y el resumen del pedido son texto
  sobre el fondo, sin contenedor.

### La grilla del catálogo no es homogénea

Tres tratamientos distintos, porque el contenido es distinto:

- **Ítem de servicio:** precio mensual, permanencia, cuándo se activa.
- **Ítem de producto:** precio único, cuotas, stock.
- **Upgrade de plan:** ancho doble, sin ilustración, con el plan actual y el
  destino. Solo aparece con sesión.

Eso rompe por sí solo la grilla de tarjetas idénticas, que es el tell más común.

---

## 6. Wireframes

### 6.1 Landing sin sesión

```
┌────────────────────────────────────────────────────────────────┐
│ [logo Zonda Fibra]          Buscar…            🛒   Ingresar   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│         Todo lo que podés sumar a tu Zonda Fibra               │  48px
│         TV, celular, gaming y seguridad digital, con           │  17px
│         precio de cliente y en la misma factura que ya pagás.  │
│                                                                │
│         ┌────────────────────────────────┐ ┌───────────────┐   │
│         │ Ingresá tu DNI o nº de cliente │ │ Ver mi precio │   │  56px alto
│         └────────────────────────────────┘ └───────────────┘   │
│         ¿Por qué te pedimos el DNI?                            │  13px, link
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  TV y streaming   Celular   Gaming   Seguridad digital   Tu plan│  chips
├────────────────────────────────────────────────────────────────┤
│  Destacados                                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ [ilustr]│ │ [ilustr]│ │ [ilustr]│ │ [ilustr]│               │
│  │ Pack    │ │ Línea   │ │ Pase    │ │ Router  │               │
│  │ Streaming│ │ móvil  │ │ Gaming  │ │ Mesh    │               │
│  │         │ │         │ │         │ │         │               │
│  │ $12.000 │ │ $14.000 │ │ $ 7.500 │ │$189.000 │  ← renglón B  │
│  │🔒 Tu pre│ │🔒 Tu pre│ │🔒 Tu pre│ │🔒 Tu pre│  ← renglón C  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
├────────────────────────────────────────────────────────────────┤
│  Cómo funciona                                                 │
│  1. Ingresás tu DNI o número de cliente.                       │
│  2. Confirmamos que tu cuenta esté activa.                     │
│  3. Lo sumás a tu factura y lo usás enseguida.                 │
├────────────────────────────────────────────────────────────────┤
│  Se suma a tu factura · Sin tarjeta · Soporte de Zonda Fibra   │
├────────────────────────────────────────────────────────────────┤
│  Zonda Telecomunicaciones S.A. · San Andrés del Río            │
│  Beneficios operados por Nexo Beneficios                       │  13px, muted
└────────────────────────────────────────────────────────────────┘
```

El gate de DNI **no es una tarjeta flotando sobre un degradado**. Es un input
grande apoyado sobre el fondo de la página, del ancho de la columna de contenido.
La pregunta "¿Por qué te pedimos el DNI?" está antes de que lo escriba, no después:
el público de esta tienda desconfía por defecto de que le pidan el documento.

Los números de "Cómo funciona" se quedan porque **son una secuencia real**. Van
integrados en la oración, no como numerales grandes de display.

### 6.2 Landing con sesión

Cambia el header y la franja del hero; el resto es igual.

```
│ [logo]      Buscar…       🛒   Hola, Lucía · Fibra 300  Salir  │
├────────────────────────────────────────────────────────────────┤
│         Estos son tus precios, Lucía                           │
│         Todo lo que sumes va a tu factura de Zonda Fibra.      │
│                                                                │
│         Tenés Fibra 300. Pasá a Fibra 600 + TV                 │  módulo Tu plan
│         por $ 11.500 más por mes.          [ Ver el cambio ]   │
```

### 6.3 `/ingresar`, los cuatro estados

```
ESTADO NEUTRO                          ESTADO ACTIVO
┌──────────────────────────────┐       ┌──────────────────────────────┐
│ Ingresá tu DNI               │       │ ✓ Hola, Lucía.               │
│ ┌──────────────────────────┐ │       │   Tenés Fibra 300.           │
│ │ 30.111.222               │ │       │                              │
│ └──────────────────────────┘ │       │   Ya podés ver tus precios.  │
│ Sin puntos ni espacios       │       │                              │
│                              │       │   Te llevamos a la tienda…   │
│      [   Ver mi precio   ]   │       └──────────────────────────────┘
│                              │        borde success, aria-live
│ ¿Por qué te pedimos el DNI?  │
└──────────────────────────────┘

ESTADO SUSPENDIDO                      ESTADO INACTIVO / NO ENCONTRADO
┌──────────────────────────────┐       ┌──────────────────────────────┐
│ ┌──────────────────────────┐ │       │ ┌──────────────────────────┐ │
│ │ 20.555.666               │ │       │ │ 35.000.111               │ │
│ └──────────────────────────┘ │       │ └──────────────────────────┘ │
│ Tu cuenta está suspendida.   │       │ No encontramos ese DNI.      │
│ Regularizala para volver a   │       │ Probá con tu número de       │
│ acceder a tus beneficios.    │       │ cliente (está en tu factura).│
│                              │       │                              │
│ [ Hablar por WhatsApp ]      │       │ ¿Dónde encuentro mi número?  │
└──────────────────────────────┘       └──────────────────────────────┘
 borde danger                           borde danger
```

El error **no reemplaza el input** y el valor tipeado se conserva. El mensaje va
debajo, en `danger`, con `aria-live="polite"`. Ningún estado de error usa el
ámbar: el acento es para el ahorro y la acción principal, no para el problema.

### 6.4 `/tienda` con sesión, con el módulo "Tu plan"

```
┌────────────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ TU PLAN                                                    │ │  ← superficie
│ │ Tenés Fibra 100 · 100 Mbps                                 │ │    primary,
│ │                                                            │ │    ancho completo
│ │ Pasá a Fibra 300           $ 9.000  $ 7.500 más por mes    │ │
│ │ El triple de velocidad     tachado   ámbar                 │ │
│ │                                       [ Ver el cambio ]    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                │
│  Todo   TV   Celular   Gaming   Seguridad digital   Productos  │
│  Buscar…                                    Ordenar: Relevancia│
│                                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │[ilustr] │ │[ilustr] │ │[ilustr] │ │[ilustr] │               │
│  │Pack     │ │Fútbol   │ │Línea    │ │Pase     │               │
│  │Streaming│ │en vivo  │ │móvil    │ │Gaming   │               │
│  │$12.000  │ │$15.000  │ │$14.000  │ │$ 7.500  │  ← A tachado  │
│  │$ 9.900  │ │$12.900  │ │$11.900  │ │$ 6.900  │  ← B          │
│  │por mes  │ │por mes  │ │por mes  │ │por mes  │               │
│  │Ahorrás  │ │Ahorrás  │ │Ahorrás  │ │Ahorrás  │  ← C, ámbar   │
│  │$2.100/m │ │$2.100/m │ │$2.100/m │ │$ 600/m  │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
└────────────────────────────────────────────────────────────────┘
```

El módulo "Tu plan" usa fondo `primary` con texto claro: es el único bloque de la
pantalla con esa inversión, y por eso no compite con nada. Para Martín, que ya
está en el plan más alto, **el módulo no existe** y la grilla arranca arriba.

### 6.5 `/beneficio/[slug]` — servicio, producto e incluido

```
SERVICIO, abonado base                 SERVICIO, incluido en el plan
┌────────────────┬─────────────────┐   ┌────────────────┬─────────────────┐
│                │ TV y streaming  │   │                │ TV y streaming  │
│   [ilustración │ Pack Streaming  │   │   [ilustración │ Pack Streaming  │
│    geométrica  │ Total           │   │    geométrica  │ Total           │
│    categoría   │ Mirabox         │   │    categoría   │ Mirabox         │
│    tv]         │                 │   │    tv]         │                 │
│                │ $ 12.000        │   │                │ ┌─────────────┐ │
│                │ $ 9.900 por mes │   │                │ │ Incluido en │ │
│                │ Ahorrás $2.100  │   │                │ │ tu plan     │ │
│                │ por mes         │   │                │ └─────────────┘ │
│                │                 │   │                │ Tu Fibra 600+TV │
│                │ Sin permanencia │   │                │ ya lo incluye.  │
│                │ Se activa al    │   │                │                 │
│                │ instante        │   │                │ [  Activar   ]  │
│                │ Se cobra desde  │   │                │                 │
│                │ tu factura de   │   │                └─────────────────┘
│                │ octubre         │   
│                │                 │   PRODUCTO añade en su lugar:
│                │ [  Contratar  ] │     6 cuotas sin interés de $ 78.000
└────────────────┴─────────────────┘     Stock disponible / Sin stock por ahora
```

El par de la izquierda y el del medio son el **momento 4 del guion**: el mismo
producto, dos abonados, dos pantallas. Conviene tenerlas en dos pestañas para
mostrarlas seguidas.

### 6.6 `/carrito` — el resumen es una factura

Esta es la decisión estructural más importante después de la revelación. El
resumen **no es una tarjeta de e-commerce con un total**: está compuesto como un
fragmento de factura, porque eso es literalmente lo que pasa.

```
┌────────────────────────────────────────────────────────────────┐
│  Tu carrito                                                    │
│                                                                │
│  Pagás hoy                                                     │  22px
│  ──────────────────────────────────────────────────────────    │
│  Smart TV 50"                    1        $ 468.000            │
│  Envío a domicilio                            Gratis           │
│  ──────────────────────────────────────────────────────────    │
│  Total a pagar hoy                        $ 468.000            │  600
│                                                                │
│                                                                │  32px
│  Se suma a tu factura de Zonda Fibra                           │  22px
│  ──────────────────────────────────────────────────────────    │
│  Pack Streaming Total                     $ 9.900 por mes      │
│  Pase Gaming                              $ 6.900 por mes      │
│  ──────────────────────────────────────────────────────────    │
│  Total por mes                           $ 16.800 por mes      │  600
│  Desde tu factura de octubre                                   │  13px muted
│                                                                │
│  Estás ahorrando $ 52.000 hoy y $ 2.700 por mes                │  ámbar
│  por ser cliente de Zonda Fibra.                               │
│                                                                │
│                                    [   Continuar   ]           │
└────────────────────────────────────────────────────────────────┘
```

**Los dos totales nunca se suman.** Son dos bloques separados por 32px de aire y
por dos encabezados distintos. Un número que mezclara $468.000 con $9.900 por mes
no significaría nada.

Un carrito de solo servicios no muestra el bloque "Pagás hoy" en absoluto, ni la
línea de envío.

### 6.7 `/checkout` — dos pasos o tres

```
SOLO SERVICIOS (dos pasos)             CON PRODUCTO FÍSICO (tres pasos)
┌──────────────────────────────┐       ┌──────────────────────────────┐
│ 1. Confirmá  2. Listo        │       │ 1. Entrega 2. Pago 3. Revisión│
├──────────────────────────────┤       ├──────────────────────────────┤
│ Qué estás sumando            │       │ Dónde te lo enviamos         │
│ Pack Streaming  $9.900 /mes  │       │ [calle] [número]             │
│ Pase Gaming     $6.900 /mes  │       │ [localidad] [CP]             │
│ ───────────────────────────  │       │ Prellenado desde tu cuenta   │
│ Total          $16.800 /mes  │       │                              │
│                              │       │ Cómo lo pagás                │
│ Se cobra en tu factura de    │       │ ● En tu factura de Zonda     │
│ Zonda Fibra, desde octubre.  │       │ ○ Mercado Pago               │
│ No hace falta tarjeta.       │       │ ○ Tarjeta en 6 cuotas        │
│                              │       │                              │
│ [  Confirmar y activar  ]    │       │ [   Confirmar pedido   ]     │
└──────────────────────────────┘       └──────────────────────────────┘
```

El camino de servicios **no pide dirección ni datos de pago**. Dos pasos y afuera.
Es el flujo más corto de la demo y el que muestra el diferencial: nadie más puede
cobrar en esa factura.

El débito en factura va **preseleccionado** (`ADR-026`).

### 6.8 `/pedido/[id]`

```
CON PRODUCTO FÍSICO                    SOLO SERVICIOS
Pedido ZF-2026-0412                    Pedido ZF-2026-0413
Confirmado · 10 de septiembre          Confirmado · 10 de septiembre

●───────●───────○───────○              Pack Streaming Total
Confir  Prepa   En      Entre          Se activa al instante ✓
mado    rando   camino  gado           Se cobra desde tu factura
                                       de octubre
Enviamos a: Los Álamos 1245            
```

Un pedido de solo servicios **no tiene timeline de entrega**. No hay nada que
enviar, así que mostrar una línea de cuatro pasos apagados sería inventar un
proceso que no existe.

### 6.9 `/admin/dashboard` — el funnel es el hero

```
┌────────────────────────────────────────────────────────────────┐
│ Dashboard                              [30 días][60][90 días]  │
├────────────────────────────────────────────────────────────────┤
│ Abonados      ████████████████████████████████████████  58.000 │
│ Visitas       ████▌                                      6.812 │  11,7%
│ Validados     ██▍                                        3.406 │  50,0%
│ Convertidos   █                                          1.419 │  41,7%
│ Transacciones █▍                                         1.963 │
├────────────────────────────────────────────────────────────────┤
│ MRR                 Ingreso ISP        ARPU         Recompra   │
│ $ 15,7 M            $ 6,9 M            $ 271        31,4%      │  36px
│ por mes             por mes            por abonado             │  13px muted
├────────────────────────────────────────────────────────────────┤
│ Ingreso recurrente, últimos 6 meses                            │
│         ▁▂▄▆▇█                                                 │
├────────────────────────────────────────────────────────────────┤
│ Por ingreso recurrente        │  Por volumen facturado         │
│ Tu plan            30%        │  Entretenimiento      25%      │
│ TV y streaming     29%        │  Hogar conectado      19%      │
│ Celular            18%        │  Tecnología           13%      │
└────────────────────────────────────────────────────────────────┘
```

Barras horizontales proporcionales que se leen de izquierda a derecha, no cuatro
tarjetas separadas: un embudo tiene que **verse** como un embudo. El porcentaje va
respecto de la etapa anterior, no del total.

Los dos cortes por categoría van **lado a lado y en ese orden**. El de recurrente
primero, porque es el negocio; el de volumen al lado, porque explica por qué el
GMV está dominado por un televisor.

### 6.10 `/admin/catalogo`

```
┌────────────────────────────────────────────────────────────────┐
│ Catálogo            [Todos][Servicios][Productos]   Buscar…    │
├────────────────────────────────────────────────────────────────┤
│    Ítem              Categoría   Lista    Cliente  Ahorro  ⚙   │  44px
│ ── ─────────────── ─────────── ──────── ───────── ─────── ──── │
│ 🔵 Pack Streaming    TV          12.000  [ 9.900]  17,5%  ●  ★ │
│ 🔵 Fútbol en vivo    TV          15.000  [12.900]  14,0%  ●  ☆ │
│ 🟠 Smart TV 50"      Entret.    520.000  [468.000] 10,0%  ●  ★ │
│ 🟠 Tablet 10"        Tecnol.    245.000  [221.000]  9,8%  ○  ☆ │
└────────────────────────────────────────────────────────────────┘
```

Filas de 44px, cifras alineadas a la derecha con `tabular-nums`. El precio cliente
es editable en línea y valida con la **misma función** que usa la tienda, así el
panel y el abonado nunca discrepan. La fila inactiva se ve atenuada, no oculta.

### 6.11 `/admin/marca`

```
┌───────────────────────┬────────────────────────────────────────┐
│ Marca                 │  Vista previa                          │
│                       │  ┌──────────────────────────────────┐  │
│ Logo                  │  │ [logo]        Buscar…   Ingresar │  │
│ [ Subir archivo ]     │  │                                  │  │
│                       │  │  Todo lo que podés sumar a tu    │  │
│ Color principal       │  │  Zonda Fibra                     │  │
│ [■] #0E2A47           │  │                                  │  │
│                       │  │  ┌──────────────┐ ┌───────────┐  │  │
│ Color de acento       │  │  │ Ingresá tu…  │ │ Ver mi p… │  │  │
│ [■] #F2A43A           │  │  └──────────────┘ └───────────┘  │  │
│                       │  │                                  │  │
│ Tipografía            │  │  [prod] [prod] [prod] [prod]     │  │
│ (•) Sora / IBM Plex   │  └──────────────────────────────────┘  │
│ ( ) Manrope / Inter   │                                        │
│ ( ) Outfit / Source   │  Es la landing real, no una maqueta.   │
│                       │                                        │
│ [ Restablecer ]       │                                        │
└───────────────────────┴────────────────────────────────────────┘
```

La vista previa **es la landing real** dentro de un contenedor con las variables
de marca del borrador, escalada. Ya está verificado que funciona: mismo marcado,
sin una sola prop, retematizado. Las ilustraciones de producto cambian también,
porque usan `currentColor`.

En móvil el editor y la vista previa se apilan, con la vista previa arriba: lo que
importa es ver el cambio, no el formulario.

---

## 7. Estados por pantalla

Una pantalla no está lista si alguno de estos es un `div` vacío.

| Pantalla | Carga | Vacío | Error | Sin sesión | Sesión base | Sesión premium | 375px |
|---|---|---|---|---|---|---|---|
| `/` | Skeleton de 3 renglones en cada precio | — | — | Gate de DNI, precios con candado | Saludo con nombre, precios revelados | Ídem, más ítems "Incluido en tu plan" | Hero apilado, chips con scroll horizontal, grilla de 1 columna |
| `/ingresar` | Botón con spinner mientras valida | — | 4 mensajes distintos, borde `danger`, valor conservado | Estado normal | Redirige a `?next=` | Ídem | Input a ancho completo, botón debajo |
| `/tienda` | Skeleton en precios | "No encontramos productos para «X»" con acción | Categoría inexistente → 404 | Precios con candado, sin módulo Tu plan | Módulo Tu plan + precios | Sin módulo si ya tiene el plan más alto | 1 columna, filtros en acordeón |
| `/beneficio/[slug]` | Skeleton | — | Slug inexistente o inactivo → 404 | Precio de lista + CTA a validar | Precio + ahorro + permanencia | "Incluido en tu plan" y botón "Activar" | Ilustración arriba, datos debajo |
| `/carrito` | Skeleton en totales | "Tu carrito está vacío" + botón a la tienda | Ítem sin stock → aviso en la línea | Redirige a `/ingresar?next=/carrito` | Dos bloques de totales | Ídem, con más ahorro | Bloques apilados, CTA fija abajo |
| `/checkout` | Botón deshabilitado mientras confirma | — | Campos obligatorios marcados | Redirige a `/ingresar?next=/checkout` | 2 o 3 pasos según el carrito | Ídem | Un paso por pantalla |
| `/pedido/[id]` | Skeleton | — | Id inexistente → 404 | Redirige | Timeline o activación | Ídem | Timeline vertical |
| `/mis-servicios` | Skeleton | "Todavía no sumaste ningún servicio" + acción | — | Redirige | Lista con total mensual | Incluidos en $0, marcados | Lista de 1 columna |
| `/admin/dashboard` | Skeleton en tiles y gráfico | — | — | Redirige a `/admin` | — | — | Funnel apilado, tiles de 2 columnas |
| `/admin/marca` | — | — | Logo > 200 KB → aviso claro | Redirige a `/admin` | — | — | Vista previa arriba, editor debajo |

---

## 8. Componentes base

Cada componente interactivo tiene los siete estados: normal, hover, foco, activo,
deshabilitado, cargando, error. No se da por terminado con la mitad.

| Componente | Variantes | Notas |
|---|---|---|
| `Button` | `primary` (ámbar), `secondary` (contorno primary), `ghost`, `danger` | Alturas 40 y 48. **No todo es primario**: una pantalla tiene una sola acción ámbar |
| `Input` | texto, número, con prefijo | Altura 48, label real siempre, ayuda debajo, error debajo con `aria-describedby` |
| `Price` | `sm`, `md`, `lg` | Los tres renglones de la sección 4. Es el componente más importante del proyecto |
| `Badge` | `success`, `danger`, `neutral`, `included` | `included` es el de "Incluido en tu plan" |
| `Chip` | filtro seleccionable | Radio `sm`, altura 32 |
| `Drawer` | carrito | Única sombra permitida junto al panel demo |
| `Table` | admin | Filas 44px, `tabular-nums`, cifras a la derecha |
| `EmptyState` | — | Enseña la interfaz, no dice "no hay nada" |
| `Toast` | `success`, `error` | Arriba a la derecha, 4s, con `role="status"` |
| `Skeleton` | línea, bloque | Pulso de opacidad, sin barrido diagonal |
| `ProductPlaceholder` | 5 ilustraciones | `currentColor` sobre `text-primary` (`ADR-016`), con variación derivada del id |

### `ProductPlaceholder`

Cinco composiciones geométricas, una por familia de categoría, no íconos de stock:

- **TV y streaming:** rectángulos concéntricos desplazados, como pantallas apiladas.
- **Celular:** arcos de señal, tres, de grosor decreciente.
- **Gaming:** una retícula de rombos con uno desplazado del eje.
- **Seguridad:** un escudo construido con dos trapecios y una diagonal.
- **Conectividad y hogar:** ondas concéntricas desde una esquina.

La variación por producto sale del `id`: rotación de 0 a 12 grados y desplazamiento
del centro. Suficiente para que la grilla no se vea repetida, no tanto como para
que parezca aleatoria.

---

## 9. Admin

Misma familia tipográfica, misma escala. Paleta **más neutra**: el primario solo
para navegación activa y el ámbar únicamente en la acción principal de cada
pantalla.

- Sidebar de 240px sobre un neutro apenas más frío que el contenido, colapsable a
  iconos por debajo de 1024px.
- Densidad alta pero legible: filas de 44px, no de 32.
- Todas las cifras a la derecha, con `tabular-nums`.
- Patrones estándar: barra superior, navegación lateral, pestañas. **No se
  reinventan afordancias** para darle sabor: el dueño del ISP tiene que sentir que
  ya sabe usarlo.

---

## 10. Copy

- Voseo, activo, concreto.
- Los botones dicen lo que pasa: "Ver mi precio", "Contratar", "Activar",
  "Confirmar y activar", "Ver el cambio".
- Los errores explican qué pasó **y qué hacer**.
- Los estados vacíos invitan a una acción concreta.
- Nada de "¡Bienvenido a la experiencia!".
- Cada palabra se gana el lugar: sin encabezados que repitan el título, sin
  bajadas que repitan el encabezado.
- **Sin rayas largas** en el copy de interfaz. Se usan comas, dos puntos o punto.

Los textos exactos están en `05-flujos-de-usuario.md`, que es la fuente.

---

## 11. Piso de calidad

No se anuncia, se cumple.

- Responsive real a 375px, sin scroll horizontal en ninguna pantalla.
- Foco visible en teclado, resuelto una vez en `globals.css` con `:focus-visible`.
- Contraste AA en texto y en estados.
- `prefers-reduced-motion` respetado, resuelto solo en CSS.
- `alt` en toda imagen; las ilustraciones decorativas van con `aria-hidden`.
- Formularios con labels reales, nunca con placeholder como etiqueta.
- `aria-live="polite"` en el resultado de la validación de DNI y en el precio
  revelado.
- Sin layout shift al hidratar: los tres renglones del bloque de precio.
- Objetivos táctiles de 44px mínimo.

---

## 12. Checklist de tells genéricos

Revisión del plan contra la lista de `KICKOFF.md` §12, más las prohibiciones de
las guías de diseño de frontend.

| Tell | Estado |
|---|---|
| Fondo crema con serif de alto contraste y acento terracota | ✅ Evitado. Fondo gris frío, ninguna serif, acento ámbar |
| Fondo casi negro con acento ácido | ✅ Evitado. Tema claro, forzado por la escena de uso |
| Todo en cards idénticas con la misma sombra gris | ✅ Evitado. Sin sombras salvo drawer y panel demo; tres tratamientos distintos de tarjeta |
| Eyebrows en mayúsculas tracked-out sobre cada título | ✅ Ninguno |
| Metadatos unidos con "·" en todas partes | ⚠️ Corregido. Ver sección 13 |
| Flechas "→" al final de cada link | ✅ Ninguna |
| Monospace para cifras pequeñas | ✅ Evitado. `tabular-nums` en la fuente de cuerpo |
| Fade-and-slide-up en cada sección | ✅ Ninguno. El único movimiento es la revelación |
| Números 01/02/03 donde no hay secuencia | ✅ Solo en "Cómo funciona", que **es** una secuencia, e integrados en la oración |
| Bordes laterales de color como acento | ✅ Ninguno |
| Texto con degradado | ✅ Ninguno |
| Glassmorphism | ✅ Ninguno |
| Plantilla de métrica gigante con degradado | ⚠️ Corregido. Ver sección 13 |
| Grilla de tarjetas idénticas | ✅ Evitado por diferenciación de contenido |
| Modal como primer recurso | ✅ Ninguno. El carrito es drawer, la edición de precio es en línea |
| Rebote o elástico en las curvas | ⚠️ Corregido. Ver sección 13 |

---

## 13. Qué cambié después de la revisión

Cuatro cosas, todas concretas.

### 1. La curva del chip de ahorro tenía overshoot

El esbozo técnico del paso 1 usaba `cubic-bezier(0.2, 0.9, 0.3, 1.15)` para la
aparición del chip. **El 1,15 final es un rebote**, y el rebote está prohibido: un
objeto real desacelera, no rebota, y el overshoot llama la atención sobre la
animación en lugar del contenido. Justo en el único momento donde el contenido es
todo el punto.

Reemplazado por `cubic-bezier(0.25, 1, 0.5, 1)`, la misma curva para todo el
movimiento del proyecto.

### 2. La cascada era demasiado larga

Iba a ser de 55 ms por ítem con tope en el índice 11: 605 ms de cascada más 460 ms
de animación, o sea 1.065 ms solo de revelación. Para una animación de entrada el
presupuesto razonable es de 500 a 800 ms.

Bajé a 40 ms con tope en el índice 9: **360 ms de cascada y 840 ms en total**. Se
sigue leyendo como una cascada y no se hace esperar.

### 3. El dashboard iba a caer en la plantilla de métrica gigante

Los tiles del dashboard estaban pensados como "número enorme + etiqueta chica +
dato de apoyo", que es exactamente la plantilla de SaaS que la guía prohíbe.

Cambiado: los cuatro tiles van **en una fila de cifras del mismo tamaño**, sin
jerarquía inventada entre ellas, y lo que ocupa el lugar de héroe es el funnel,
que es información con forma propia. Ninguna cifra lleva degradado.

### 4. El separador "·" estaba por todas partes

Aparecía en el estado de sesión del header, en la meta de cada tarjeta, en el pie
de cada ítem del catálogo y en el footer. Es el tell más fácil de cometer.

Queda en **dos lugares y nada más**: el chip de sesión del header
("Hola, Lucía · Fibra 300") y la línea legal del footer. En el resto se usan
palabras o saltos de línea. En las tarjetas, "Sin permanencia" y "Se activa al
instante" van en renglones separados, que además se leen mejor en 375px.

---

## 14. Lo que este plan decide y el kickoff no definía

Registrado acá y no en `DECISIONES.md` porque son decisiones de diseño, no de
arquitectura.

- **Tema claro**, derivado de la escena de uso.
- **Sin sombras** salvo en los dos elementos que flotan.
- **El resumen del carrito y del checkout se compone como una factura**, con dos
  bloques separados y encabezados propios. Es la estructura que hace visible el
  diferencial del producto, y es lo que evita que el carrito se vea como el de
  cualquier tienda.
- **El módulo "Tu plan" invierte el color** (fondo primario, texto claro). Es el
  único bloque invertido de la pantalla y por eso no compite con nada.
- **Un pedido de solo servicios no tiene timeline de entrega.** Mostrar cuatro
  pasos apagados sería inventar un proceso que no existe.
- **Una sola curva de easing** para todo el movimiento del proyecto.
