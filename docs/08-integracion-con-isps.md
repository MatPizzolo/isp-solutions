# Integración y coordinación con los sistemas de cada ISP

> **Este documento es para la Fase 1 en adelante.** No se implementa nada de acá
> en la Fase 0. Existe ahora porque las decisiones de arquitectura que se toman
> hoy —sobre todo la forma de `Subscriber` y los puntos de corte— determinan si
> esto después es configuración o es una reescritura por cada operador.

## El problema

La demo resuelve la elegibilidad leyendo un JSON. En producción, ese JSON es el
sistema de gestión de un ISP real, y **cada ISP tiene uno distinto**.

El ecosistema típico de un operador chico o mediano incluye plataformas como
Wispro, MikroWisp, ISPCube o UISP, además de desarrollos propios y, más seguido de
lo que uno esperaría, planillas. La facturación a veces vive en la misma
plataforma y a veces en un sistema contable aparte.

Esto no es un detalle de implementación: **es el cuello de botella del negocio**.
Si conectar un ISP cuesta tres meses de trabajo a medida, el escenario de 50
operadores de `00-vision-y-modelo-de-negocio.md` no existe. Todo el modelo depende
de que sumar un operador sea configuración y no desarrollo.

## Los cuatro niveles de conector

La respuesta no es "integrarse con todos", es **escalonar la integración** para
que un ISP pueda arrancar sin desarrollo de su lado y profundizar después.

| Nivel | Cómo llegan los datos | Qué necesita el ISP | Tiempo de alta |
|---|---|---|---|
| **0 — Archivo manual** | El operador exporta un CSV de abonados y lo sube al panel | Nada. Saber exportar de su sistema | Días |
| **1 — Export automático** | Una tarea programada deja el archivo en SFTP, S3 o una URL, todas las noches | Una tarea programada, no una API | 1 a 2 semanas |
| **2 — API de consulta** | Se consulta su sistema por DNI, en tiempo real | Que su plataforma exponga API de lectura | 2 a 4 semanas |
| **3 — Bidireccional** | Además de leer, se escribe: alta del concepto en la factura y cambio de plan | API de escritura y acuerdo sobre facturación y aprovisionamiento | 1 a 3 meses |

### Qué habilita cada nivel

Esto es lo que importa: **no hace falta el nivel 3 para arrancar.**

| Capacidad | 0 | 1 | 2 | 3 |
|---|:--:|:--:|:--:|:--:|
| Validar DNI y mostrar precio exclusivo | ✅ | ✅ | ✅ | ✅ |
| Suspender beneficios a una cuenta en mora | con retraso | al día siguiente | al instante | al instante |
| Contratar un servicio | ✅ con carga manual del operador | ✅ con carga manual | ✅ con carga manual | ✅ automático |
| Cobrarlo en la factura | manual | manual | manual | automático |
| Upgrade de plan | manual | manual | manual | automático |
| Aprovisionar el cambio de plan en la red | manual | manual | manual | automático |

En los niveles 0 a 2, el alta de un servicio genera una **cola de trabajo** en el
panel: el operador ve las altas del día, las carga en su sistema y las marca como
procesadas. Es trabajo manual, pero es trabajo manual *acotado y visible*, y sobre
todo **no bloquea el arranque**.

### El piloto arranca en nivel 0

Es la decisión que más de-riesga la propuesta y conviene decirla en la reunión:
*"para empezar no necesitás que tu proveedor de software haga nada. Exportás un
listado de abonados, lo subís, y la tienda ya valida DNIs."*

Un operador chico no controla su plataforma de gestión —la alquila— y pedirle que
consiga desarrollo de su proveedor antes de ver resultados es pedirle que arriesgue
primero. El nivel 0 invierte el orden: primero funciona, después se automatiza.

## Qué hay que acordar además del software

La parte técnica suele ser la más fácil. Lo que hace fracasar un piloto es lo que
no se conversó:

| Tema | La pregunta que hay que responder antes de arrancar |
|---|---|
| **Soporte al abonado** | Si un servicio no funciona, ¿a quién llama? El abonado va a llamar al ISP igual, así que su equipo tiene que saber qué contestar |
| **Cobranza y mora** | El servicio se cobra en la factura del ISP. Si el abonado no paga, ¿quién absorbe? ¿Se corta el servicio, el Internet, o los dos? |
| **Baja del abonado** | Si se da de baja con un servicio con permanencia vigente, ¿qué pasa con esa permanencia? |
| **Datos personales** | Qué campos salen del sistema del ISP, con qué finalidad y bajo qué acuerdo de tratamiento. El operador es responsable de los datos de sus abonados |
| **Marca** | Quién aprueba textos y colores del lado del ISP, y en cuánto tiempo |
| **Promoción** | Qué canales usa y con qué frecuencia. Es lo que el ISP aporta según la propuesta, y es la variable de la que más depende la conversión |
| **Liquidación** | Cada cuánto se liquida el revenue share y contra qué reporte |

La última fila conviene resolverla con `/admin/reportes`: si el operador puede
imprimir él mismo el reporte que sustenta la liquidación, la conversación mensual
deja de ser una discusión.

## Qué implica esto para el código de hoy

Tres cosas que hay que respetar ya en la Fase 0 para que el conector sea después
un archivo y no una refactorización:

### 1. `Subscriber` es un contrato, no un accidente

La forma de `Subscriber` en `03-modelo-de-datos.md` es el **modelo normalizado**.
El trabajo de un conector es producir exactamente esa forma a partir del export de
cada ISP; nada del resto de la aplicación conoce el formato original.

`src/tenants/zonda/subscribers.json` no es "los datos de la demo": es el ejemplo
canónico de la salida de un conector.

### 2. La elegibilidad tiene que poder ser asíncrona

`checkSubscriber()` es sincrónica en la Fase 0 porque lee un JSON ya importado
(`ADR-017`). En los niveles 2 y 3 pasa a ser una consulta de red. El formulario de
DNI tiene que poder mostrar un estado de carga sin que eso cambie nada más.

### 3. Los datos tienen fecha

En los niveles 0 y 1 la información está desactualizada por definición. El modelo
necesita saber **de cuándo son los datos** para poder mostrarlo en el panel
—"abonados al 12/09, 14:30"— y para que el operador entienda por qué alguien que
dio de baja ayer todavía ve beneficios. Es un campo, pero si no está desde el
principio se nota tarde.

## Onboarding de un ISP nuevo

Lo que hay que juntar para dar de alta un operador, sea cual sea el nivel:

1. `tenant.json`: nombre, razón social, ciudad, contacto de soporte, colores,
   tipografía, prefijo de pedido.
2. Logo en SVG, versión clara y oscura.
3. Lista de planes con velocidad y tier, que es lo que habilita los upgrades y los
   servicios incluidos.
4. Export de abonados en el formato que su sistema produzca, más el mapeo al
   modelo normalizado.
5. Concepto de facturación acordado, aunque al principio se cargue a mano.
6. Quién aprueba marca y quién atiende soporte.
7. Plan de comunicación: canales y calendario.

Los puntos 1 a 3 son media hora. El 4 es donde está el trabajo real, y el 7 es el
que decide si el piloto convierte.

## Señal de alerta

Si un operador no puede exportar un listado de sus propios abonados con DNI,
estado y plan, **no está listo para el piloto** — y probablemente tenga problemas
más grandes que la falta de una tienda. Conviene detectarlo en la primera reunión
y no en el mes dos.
