# Visión y modelo de negocio

## Qué es

Una plataforma B2B2C —SaaS más marketplace— que le permite a un ISP o cableoperador
chico o mediano ofrecerles a sus abonados una tienda de productos y beneficios
exclusivos, con la marca del ISP, sin desarrollar software, sin comprar stock y
sin operar logística.

**Posicionamiento:** no es "una tienda online para ISPs". Es *la plataforma de
beneficios para los clientes de tu ISP. Tu propia tienda. Tu marca. Tus clientes.
Sin stock ni desarrollo tecnológico.*

**Diferencial técnico central:** la tienda verifica que el visitante sea abonado
activo —por DNI o número de cliente— y recién ahí habilita el precio exclusivo.
Cliente suspendido, beneficios suspendidos. Esa lógica de elegibilidad es lo que
separa a esto de una tienda online cualquiera.

## Segmentos y propuesta de valor

| Segmento | Qué problema tiene | Qué le damos |
|---|---|---|
| **ISP / cableoperador** | Compite por precio contra operadores nacionales, tiene churn y no tiene forma barata de diferenciarse ni de generar ingresos nuevos | Una tienda con su marca lista en semanas, una herramienta de fidelización concreta y una fuente de ingresos por comisión, sin inversión en software ni en stock |
| **Abonado** | Paga Internet todos los meses y no percibe nada más que la conexión | Precios y productos que solo consigue por ser cliente de su ISP, con envío a domicilio y cuotas |
| **Proveedor / mayorista** | Vende a través de canales saturados y compite en marketplaces por precio | Acceso a demanda agregada de muchos ISPs, con un solo integrador y una sola operación |

## Canales

- **Hacia el ISP:** venta directa, referidos entre operadores, cámaras y
  asociaciones regionales de cableoperadores.
- **Hacia el abonado:** el ISP mismo. Ese es el punto — la base de abonados y los
  canales de comunicación del ISP (factura, WhatsApp, redes, soporte) son el canal
  de adquisición, y son gratuitos para la plataforma.

## Fuentes de ingreso

| Fuente | Cuándo | Descripción |
|---|---|---|
| Setup inicial | Alta del ISP | Configuración de marca, catálogo y elegibilidad |
| Fee mensual SaaS | Recurrente | Por rango de abonados |
| Comisión sobre ventas | Por transacción | Porcentaje del GMV |
| Margen sobre producto | Por transacción | Diferencia entre costo de proveedor y precio exclusivo |
| Promociones patrocinadas | Fase 3 | Marcas que pagan por posición destacada en la red de tiendas |

El ISP participa del ingreso mediante revenue share sobre el GMV de su tienda
(`revenueShare.isp` en la configuración del tenant). Es lo que convierte la
propuesta de "una herramienta más" en "una fuente de ingresos".

## Recursos clave

- La **capa de elegibilidad**: la integración con el sistema de gestión del ISP.
  Es lo más difícil de copiar y lo que hace que el beneficio sea real.
- El **catálogo compartido**: negociado una vez, usado por todos los ISPs. Por eso
  `products.json` es de la plataforma y no del tenant.
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

Supuestos comunes: ISP promedio de 20.000 abonados; 8% de abonados compradores en
un año; 1,4 órdenes por comprador; ticket promedio de $220.000; comisión de
plataforma del 5% del GMV; fee SaaS de $400.000 por ISP por mes.

| Escenario | ISPs | Abonados | GMV anual | Comisión (5%) | SaaS anual | Ingreso plataforma |
|---|---|---|---|---|---|---|
| Red inicial | 10 | 200.000 | $4.928M | $246M | $48M | **$294M** |
| Red media | 50 | 1.000.000 | $24.640M | $1.232M | $240M | **$1.472M** |
| Red consolidada | 100 | 2.000.000 | $49.280M | $2.464M | $480M | **$2.944M** |

### Sensibilidad al porcentaje de compradores

El supuesto más frágil de todos es qué proporción de abonados llega a comprar.
Sobre el escenario de 10 ISPs (200.000 abonados), moviendo solo esa variable:

| Compradores anuales | Compradores | Órdenes | GMV anual | Comisión (5%) |
|---|---|---|---|---|
| 4% (pesimista) | 8.000 | 11.200 | $2.464M | $123M |
| 8% (base) | 16.000 | 22.400 | $4.928M | $246M |
| 12% (optimista) | 24.000 | 33.600 | $7.392M | $370M |

La conclusión que importa: el negocio no se define por el ticket ni por el
catálogo, se define por **qué porcentaje de la base de abonados se convierte en
comprador**. Por eso la métrica guía del piloto es *GMV por cada 1.000 abonados*
y no el GMV absoluto (ver `07-metricas-y-kpis.md`).

## Por qué se arranca con un ISP ancla

Antes de vender a diez ISPs hace falta poder mostrar uno funcionando. El ISP ancla
—60.000 abonados en Provincia de Buenos Aires— es a la vez laboratorio y caso de
éxito: sirve para calibrar los supuestos de conversión, para ajustar el catálogo a
lo que realmente se compra, y para tener números propios en la próxima reunión de
venta en lugar de hipótesis.

La propuesta al ISP ancla es explícitamente un piloto de riesgo compartido:
nosotros ponemos el desarrollo y la operación, ellos ponen la base de abonados y
la promoción, se mide, y si funciona se escala.
