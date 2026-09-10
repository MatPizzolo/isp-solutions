# Visión y modelo de negocio

## Qué es

**Un "Mi Cuenta / Mi Movistar" como servicio, bajo marca blanca, para ISPs y
cableoperadores chicos y medianos del interior.** El espacio propio del abonado
dentro de su ISP: ahí ve su plan, sus beneficios y los servicios que puede sumar
—TV y streaming, celular, gaming, seguridad digital, mejoras de su propio
Internet— además de una góndola de productos para el hogar.

Todo con la marca del ISP, sin que tenga que desarrollar tecnología ni mantener
stock.

**Posicionamiento:** no es "una tienda online para ISPs". Es *la plataforma de
beneficios y servicios para los clientes de tu ISP. Tu propia tienda. Tu marca.
Tus clientes. Sin stock ni desarrollo tecnológico.*

### Por qué servicios y no solo productos

Una tienda de productos físicos compite con MercadoLibre y pierde: el mismo
producto, mejor logística del otro lado, y el único diferencial es un descuento de
un dígito.

Una tienda de servicios sobre la factura del ISP **no compite con nadie**, porque
nadie más puede cobrarle a ese abonado en la boleta que ya paga todos los meses.
Eso tiene tres consecuencias que ordenan todo el proyecto:

1. **La conversión es creíble.** Pedirle a alguien que gaste $220.000 de una vez
   es una decisión de compra que se piensa. Pedirle que sume $6.000 por mes a una
   factura que ya paga es casi un clic.
2. **El ingreso es recurrente.** No se mide en ventas, se mide en MRR y en cuánto
   sube el ARPU del ISP.
3. **El riesgo operativo del piloto casi desaparece.** Un servicio no tiene stock,
   ni envío, ni devoluciones, ni logística inversa — que es la objeción más grande
   que un dueño de ISP puede poner sobre la mesa.

**Diferencial técnico central:** la tienda verifica que el visitante sea abonado
activo —por DNI o número de cliente— y recién ahí habilita el precio exclusivo.
Cliente suspendido, beneficios suspendidos. Esa lógica de elegibilidad es lo que
separa a esto de una tienda online cualquiera.

**El ítem de mayor margen del catálogo es el propio ISP.** Un abonado de Fibra 100
que pasa a Fibra 300 no tiene costo de mercadería, corre sobre infraestructura ya
instalada y se cobra por un canal ya montado. La tienda no es solo un beneficio
para los abonados: es un canal de venta del ISP sobre su propia base.

## Segmentos y propuesta de valor

| Segmento | Qué problema tiene | Qué le damos |
|---|---|---|
| **ISP / cableoperador** | Compite por precio contra operadores nacionales, tiene churn y no tiene forma barata de diferenciarse ni de sumar ingresos nuevos. El abonado percibe la conexión como una commodity | El "Mi Cuenta" que los operadores grandes tienen y él no: ingreso recurrente incremental sobre su propia base, una herramienta de retención concreta y un canal para vender upgrades de su propio plan. Sin inversión en software ni en stock |
| **Abonado** | Paga Internet todos los meses y no percibe nada más que la conexión | Servicios y beneficios que solo consigue por ser cliente de su ISP, cobrados en la factura que ya paga, sin dar datos de tarjeta ni abrir otra cuenta |
| **Proveedor de servicios** | Le cuesta llegar al interior y adquirir clientes uno por uno | Distribución sobre bases de abonados ya existentes, con cobranza resuelta y churn bajo |
| **Proveedor / mayorista de hardware** | Vende por canales saturados y compite en marketplaces por precio | Acceso a demanda agregada de muchos ISPs, con un solo integrador y una sola operación |

## Canales

- **Hacia el ISP:** venta directa, referidos entre operadores, cámaras y
  asociaciones regionales de cableoperadores.
- **Hacia el abonado:** el ISP mismo. Ese es el punto — la base de abonados y los
  canales de comunicación del ISP (factura, WhatsApp, redes, soporte) son el canal
  de adquisición, y son gratuitos para la plataforma.

## Fuentes de ingreso

| Fuente | Cuándo | Descripción |
|---|---|---|
| **Comisión sobre servicios** | Recurrente, todos los meses | Porción del MRR de los servicios contratados. **Es la fuente principal** |
| **Comisión de canal sobre upgrades de plan** | Recurrente | Porcentaje chico sobre la diferencia mensual que el abonado le paga al ISP por mejorar su plan |
| Fee mensual SaaS | Recurrente | Por rango de abonados |
| Setup inicial | Alta del ISP | Configuración de marca, catálogo y elegibilidad |
| Comisión y margen sobre producto físico | Por transacción | Reventa de hardware. Volumen alto, margen fino |
| Promociones patrocinadas | Fase 3 | Marcas que pagan por posición destacada en la red de tiendas |

Las dos primeras son recurrentes y crecen sin esfuerzo comercial adicional: un
servicio contratado sigue facturando todos los meses. Esa es la diferencia entre
este modelo y el de una tienda.

### El reparto con el ISP depende del tipo de ítem

Un porcentaje único no tendría sentido, porque las tres economías son distintas
(ver `ADR-029` en `DECISIONES.md`):

| Tipo de ítem | Quién pone qué | Reparto |
|---|---|---|
| **Producto físico** | La plataforma pone catálogo, proveedor y fulfillment | La plataforma se queda con más |
| **Servicio** | El ISP pone la relación con el cliente y la cobranza; la plataforma pone el acuerdo con el proveedor y la operación | El ISP se queda con más |
| **Upgrade de plan** | El servicio es enteramente del ISP; la plataforma es solo el canal | El ISP se queda con casi todo |

Esto tiene una consecuencia contraintuitiva y muy útil en la reunión: **el ISP
puede ganar más con menos GMV**. Un dashboard que solo midiera volumen contaría la
historia al revés.

## Recursos clave

- La **capa de elegibilidad**: la integración con el sistema de gestión del ISP.
  Es lo más difícil de copiar y lo que hace que el beneficio sea real.
- El **catálogo compartido**: negociado una vez, usado por todos los ISPs. Por eso
  `catalog.json` es de la plataforma y no del tenant.
- La **relación con proveedores**, que mejora a medida que crece el volumen agregado.
- El **software multi-tenant**, que hace que sumar un ISP sea configuración y no
  desarrollo.

## Círculo virtuoso

```
   más ISPs  ──▶  más abonados alcanzados  ──▶  más volumen de compra
      ▲                                                   │
      │                                                   ▼
  propuesta más   ◀──  mejores precios exclusivos  ◀──  mejor poder
  atractiva            para el abonado                  de negociación
```

Cada ISP que entra mejora las condiciones de los que ya están. Esa es la razón por
la que conviene crecer en cantidad de ISPs antes que en profundidad de catálogo.

## Estrategia en tres capas

1. **SaaS.** Vender la tienda white-label como servicio. Ingreso predecible,
   poco riesgo operativo, sirve para financiar las capas siguientes.
2. **Marketplace.** Con varios ISPs conectados, agregar la demanda y negociar
   directo con proveedores. Acá aparece el margen sobre producto.
3. **Importación propia.** Con volumen sostenido, importar las categorías de mayor
   rotación bajo marca propia. Acá está el margen grande, y no antes.

Cada capa financia y valida a la siguiente. Saltear la primera es el error clásico.

## Escenarios de referencia

> **Estas cifras son hipótesis de trabajo, no proyecciones.** Existen para dar
> orden de magnitud y para poder discutir supuestos, no para poner en una
> presentación como si fueran un pronóstico. Los supuestos se validan en el piloto
> de la Fase 1.

Supuestos comunes, extrapolados del período de referencia de
`07-metricas-y-kpis.md`: ISP promedio de 20.000 abonados; MRR de $312 por abonado
por mes en régimen; ingreso de la plataforma de $75 por abonado por mes entre
servicios, upgrades y hardware; fee SaaS de $400.000 por ISP por mes.

| Escenario | ISPs | Abonados | MRR de la red | Comisiones anuales | SaaS anual | Ingreso plataforma |
|---|---|---|---|---|---|---|
| Red inicial | 10 | 200.000 | $62M/mes | $180M | $48M | **$228M/año** |
| Red media | 50 | 1.000.000 | $312M/mes | $900M | $240M | **$1.140M/año** |
| Red consolidada | 100 | 2.000.000 | $624M/mes | $1.800M | $480M | **$2.280M/año** |

La columna que importa no es la última, es **el MRR de la red**: es la base sobre
la que se negocia con proveedores y la que le da previsibilidad al negocio. Un
ingreso recurrente de esa magnitud vale bastante más que un GMV transaccional
equivalente.

### Sensibilidad al porcentaje de convertidos

El supuesto más frágil sigue siendo qué proporción de abonados llega a contratar
algo. Sobre el escenario de 10 ISPs (200.000 abonados), moviendo solo esa
variable:

| Convertidos en 90 días | MRR de la red | Comisiones anuales | Ingreso plataforma |
|---|---|---|---|
| 1,5% (pesimista) | $37M/mes | $108M | **$156M/año** |
| 2,5% (base) | $62M/mes | $180M | **$228M/año** |
| 4% (optimista) | $100M/mes | $288M | **$336M/año** |

Dos conclusiones que importan:

- El negocio no se define por el ticket ni por el tamaño del catálogo. Se define
  por **qué porcentaje de la base de abonados contrata algo al menos una vez**.
  Por eso la métrica guía del piloto es el *ARPU incremental* y no el GMV
  absoluto (ver `07-metricas-y-kpis.md`).
- Incluso el escenario pesimista sostiene el negocio, porque el ingreso es
  recurrente: un convertido de hoy sigue facturando el año que viene. En un
  modelo transaccional el escenario pesimista hay que volver a ganárselo todos
  los meses.

## Por qué se arranca con un ISP ancla

Antes de vender a diez ISPs hace falta poder mostrar uno funcionando. El ISP ancla
—60.000 abonados en Provincia de Buenos Aires— es a la vez laboratorio y caso de
éxito: sirve para calibrar los supuestos de conversión, para ajustar el catálogo a
lo que realmente se compra, y para tener números propios en la próxima reunión de
venta en lugar de hipótesis.

La propuesta al ISP ancla es explícitamente un piloto de riesgo compartido:
nosotros ponemos el desarrollo y la operación, ellos ponen la base de abonados y
la promoción, se mide, y si funciona se escala.
