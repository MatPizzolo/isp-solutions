Leé KICKOFF.md completo antes de hacer nada. Es el archivo de iniciación de este proyecto: una demo white-label de tienda de beneficios para ISPs (Next.js + Tailwind, datos mock de un cliente ficticio). El repo es este directorio; no crees subcarpetas ni salgas de él.

Contexto de negocio que tiene que guiar cada decisión de diseño: esta demo se muestra en una reunión con el dueño de un ISP real para proponerle "yo desarrollo y opero la plataforma, ustedes aportan la base de abonados y la promoción, medimos el piloto y si funciona escalamos". La demo reemplaza esa explicación abstracta por algo concreto. Lo que importa es que se vea como una tienda del ISP, con su marca, y que el momento en que el abonado valida el DNI y aparece su precio exclusivo sea impecable. El resto es secundario. La sección 2.1 del kickoff define el guion de la reunión y las prioridades P1/P2/P3: respetalas dentro de cada paso.

Ejecutá los pasos de la sección 15 en orden. Documentación primero (docs/ y CLAUDE.md), después Next.js. No codees UI de producto antes de escribir y revisar el plan de diseño del paso 5; la única excepción es la página /dev/tokens del paso 3.

Al terminar cada paso: verificá (lint, typecheck, test, build), commiteá, actualizá docs/CHANGELOG.md y la sección "Estado actual" de CLAUDE.md. Desde el paso 6 en adelante, antes de cada commit recorré el guion de demo de la sección 2.1 y confirmá que no haya errores en consola ni flash de precio al cargar con sesión.

Si algo no está definido en el kickoff, elegí la opción más simple que respete la sección 14 y registralo en docs/DECISIONES.md. No me preguntes; decidí, anotá y seguí.

Hay tres checkpoints donde frenás y esperás mi revisión:
1. Al terminar el paso 1: mostrame la estructura creada.
2. Al terminar el paso 5: mostrame el plan de diseño (docs/04-diseno-y-ui.md) y qué cambiaste después de revisarlo contra la checklist de tells genéricos.
3. Al terminar las pantallas P1 del paso 7 (landing, ingresar, tienda, producto): mostrame capturas o una descripción precisa de cómo quedó la revelación del precio.

Para los pasos 5, 6 y 7 usá los skills de diseño de frontend disponibles (frontend-design, impeccable) antes de escribir componentes.
