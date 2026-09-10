# Diseño y UI

> **Esqueleto.** Este documento se completa en el **paso 5** de la sección 15 de
> `KICKOFF.md`, antes de escribir una sola línea de UI de producto. La única
> excepción permitida antes de ese paso es `/dev/tokens`, que no es UI de producto.
>
> El contenido completo se escribe siguiendo la sección 12 de `KICKOFF.md`, se
> revisa contra la checklist de tells genéricos y se deja anotado en la última
> sección qué se cambió después de esa revisión.

## 1. Dirección de diseño

_Pendiente (paso 5)._ Qué tiene que sentir el abonado: una tienda del ISP, no un
marketplace genérico ni un template SaaS.

## 2. El elemento memorable

_Pendiente (paso 5)._ La revelación del precio: guion paso a paso, con timings,
y el gate de DNI del hero como invitación y no como formulario.

## 3. Tokens

_Pendiente (paso 5)._ Color, tipografía, radio, espaciado y sombra. Todos salen
del tenant; acá se documenta qué significa cada uno y cuándo se usa.

## 4. Escala tipográfica

_Pendiente (paso 5)._ 13 / 15 / 17 / 22 / 28 / 36 / 48, pesos, interlineado y
medida de línea.

## 5. Principios de layout

_Pendiente (paso 5)._ Grilla de 4px, contenedor de 1200px, alineación, y cuándo
algo merece ser una card y cuándo no.

## 6. Wireframes

_Pendiente (paso 5)._ Wireframes ASCII de:

- Landing sin sesión y con sesión
- `/ingresar` en sus cuatro estados
- `/producto/[slug]`
- `/carrito`
- `/checkout`
- `/pedido/[id]`
- `/admin/dashboard`
- `/admin/catalogo`
- `/admin/marca`

## 7. Estados por pantalla

_Pendiente (paso 5)._ Para cada pantalla del guion de demo: carga, vacío, error,
sin sesión, con sesión base, con sesión premium y 375px. Una pantalla no está
lista si alguno de esos estados es un `div` vacío.

## 8. Componentes base

_Pendiente (paso 5)._ Button, Input, Price, Badge, Chip, Modal, Drawer, Table,
EmptyState, Toast, Skeleton, ProductPlaceholder: variantes, tamaños y estados.

## 9. Admin

_Pendiente (paso 5)._ Densidad, tablas, tabular-nums y el funnel como hero.

## 10. Copy

_Pendiente (paso 5)._ Voseo, botones que dicen lo que pasa, errores que explican
qué hacer, empty states que invitan.

## 11. Piso de calidad

_Pendiente (paso 5)._ Responsive a 375px, foco visible, contraste AA,
`prefers-reduced-motion`, alt text, labels reales, `aria-live` en la validación
de DNI, sin layout shift al hidratar.

## 12. Checklist de tells genéricos

_Pendiente (paso 5)._ La lista de la sección 12 de `KICKOFF.md`, marcada, más lo
que se cambió después de revisarla.
