# Contexto de diseño

Destilado de `KICKOFF.md` §4 y §12 y de `docs/00-vision-y-modelo-de-negocio.md`.
No es contexto inventado: son decisiones que ya estaban tomadas por escrito.

## Público

**Dos audiencias distintas, en dos momentos distintos.**

1. **El abonado del ISP.** Vive en el interior de la Provincia de Buenos Aires,
   en una ciudad de barrio. Paga Internet todos los meses y nunca percibió nada
   más que la conexión. No es un usuario sofisticado de e-commerce: puede tener
   45 o 70 años, entra desde el celular, y desconfía por defecto de que le pidan
   un DNI. La pantalla tiene que explicarle por qué se lo piden **antes** de que
   lo escriba.
2. **El dueño del ISP**, en una reunión, mirando la demo por primera vez en una
   notebook. Tiene entre 8.000 y 60.000 abonados, compite contra operadores
   nacionales, y su pregunta real no es "¿qué lindo está?" sino "¿esto es mío o
   es de ustedes?".

## Trabajos que resuelve

- Validar que soy cliente y ver **mi** precio, sin crear una cuenta.
- Sumar un servicio a la factura que ya pago, sin sacar la tarjeta.
- Mejorar mi plan de Internet sin llamar por teléfono.
- (Para el dueño) Ver que la tienda tiene su marca y no la nuestra.

## Personalidad de marca

**Cercana, regional, confiable.** Habla como un vecino que sabe de tecnología, no
como una telco corporativa. Nada de "¡Bienvenido a la experiencia!".

El "zonda" es un viento cálido del oeste argentino: energía, movimiento, calidez.
De ahí sale el acento ámbar. El azul noche es la confianza de la red.

Voseo, activo, concreto. Los botones dicen lo que pasa: "Ver mi precio", "Sumar a
mi factura", "Confirmar pedido". Los errores explican qué pasó y qué hacer.

## Dirección estética

**Minimalismo refinado, con toda la audacia concentrada en un solo momento.**

Esto es una decisión deliberada, no timidez. La tienda es de un ISP regional que
quiere parecer confiable, no una startup. Un diseño llamativo en cada sección
haría que la plataforma se notara más que el operador, que es exactamente lo que
el principio 1 del proyecto prohíbe.

- **El elemento memorable, y el único:** la revelación del precio al validar el
  DNI. Una sola animación orquestada, una sola vez.
- Todo lo demás se mantiene quieto: sin fade-in por sección, sin hover elaborado
  en cada card, sin gradientes decorativos.
- El ámbar es escaso. Si aparece en más de dos lugares por pantalla, sobra.
- No todo es una card. Bordes y fondos solo cuando separan información real.

## Restricciones duras

- Todo color, radio y tipografía sale de `tenant.json`. Cero hex en componentes.
- Mobile first. Se verifica a 375px y a 1280px.
- Contraste AA, foco visible, `prefers-reduced-motion` respetado.
- Ningún precio se renderiza antes de conocer la sesión en el cliente.
- Tres presets tipográficos fijos; ninguno serif.
- Escala: 13 / 15 / 17 / 22 / 28 / 36 / 48. Títulos en sentence case.
- Líneas de menos de 75 caracteres.

## Tells a evitar

Lista explícita del kickoff §12:

- Fondo crema con serif de alto contraste y acento terracota.
- Fondo casi negro con un acento ácido.
- Todo en cards idénticas con la misma sombra gris.
- Eyebrows en mayúsculas tracked-out sobre cada título.
- Metadatos unidos con "·" en todas partes; flechas "→" al final de cada link.
- Monospace para cifras pequeñas.
- Fade-and-slide-up en cada sección.
- Números 01/02/03 donde no hay secuencia.
