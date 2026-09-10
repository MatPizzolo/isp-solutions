# Nexo Beneficios — demo Fase 0

Un "Mi Cuenta / Mi Movistar" como servicio, bajo marca blanca, para ISPs y
cableoperadores chicos y medianos: el abonado valida su DNI o número de cliente,
ve su plan y suma servicios —TV y streaming, celular, gaming, seguridad digital,
mejoras de su propio Internet— cobrados en la factura que ya paga. Hay además una
góndola de productos para el hogar, pero los servicios son el eje.

Todo con la marca del operador, sin que tenga que desarrollar tecnología ni
mantener stock.

Esta es la **Fase 0**: una demo navegable con datos mock de un ISP ficticio,
**Zonda Fibra**. No hay backend, ni base de datos, ni pagos, ni autenticación
real. Todo funciona con archivos JSON y `localStorage`.

## Cómo correrlo

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Abrir http://localhost:3000

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Tests unitarios (Vitest) |
| `pnpm mock:generate` | Regenera órdenes y métricas mock con seed fija |

## DNIs de prueba

| DNI | Nº cliente | Qué muestra |
|---|---|---|
| `30111222` | 104588 | Abonado activo — el flujo principal de la demo |
| `27888999` | 98231 | Plan premium — servicios incluidos sin cargo |
| `33444555` | 121904 | Plan base — ve el módulo de upgrade de plan |
| `20555666` | 77120 | Cuenta suspendida — beneficios bloqueados |
| `18999000` | 45012 | Servicio dado de baja |
| `35000111` | — | DNI que no existe |

**Panel del ISP:** http://localhost:3000/admin ·
`admin@zondafibra.com.ar` / `demo`

Con `NEXT_PUBLIC_DEMO_MODE=true` hay un panel flotante con estos datos a mano y un
botón "Restablecer demo" que devuelve todo al estado inicial.

## Cómo cambiar de tenant

El tenant activo sale de `NEXT_PUBLIC_TENANT` (default: `zonda`).

Para agregar uno nuevo: crear `src/tenants/<id>/` con `tenant.json`,
`subscribers.json` y `promotions.json`, registrar el id en `src/tenants/index.ts`,
poner el logo en `public/tenants/<id>/` y correr `pnpm mock:generate`. No hay que
tocar ningún componente: colores, tipografía, radios, textos y hasta las
ilustraciones de producto salen de `tenant.json`.

## Documentación

| Archivo | Contenido |
|---|---|
| [`KICKOFF.md`](KICKOFF.md) | Especificación completa del proyecto |
| [`CLAUDE.md`](CLAUDE.md) | Reglas de trabajo, comandos y estado actual |
| [`docs/00-vision-y-modelo-de-negocio.md`](docs/00-vision-y-modelo-de-negocio.md) | Modelo de negocio y escenarios |
| [`docs/01-alcance-fase-0-demo.md`](docs/01-alcance-fase-0-demo.md) | Alcance y criterios de aceptación |
| [`docs/02-arquitectura.md`](docs/02-arquitectura.md) | Capas, theming, regla de hidratación |
| [`docs/03-modelo-de-datos.md`](docs/03-modelo-de-datos.md) | Tipos y algoritmo de precio |
| [`docs/04-diseno-y-ui.md`](docs/04-diseno-y-ui.md) | Plan de diseño |
| [`docs/05-flujos-de-usuario.md`](docs/05-flujos-de-usuario.md) | Flujos, estados y mensajes exactos |
| [`docs/06-roadmap.md`](docs/06-roadmap.md) | Fases 1 a 3 |
| [`docs/07-metricas-y-kpis.md`](docs/07-metricas-y-kpis.md) | Funnel oficial y definiciones |
| [`docs/DECISIONES.md`](docs/DECISIONES.md) | Log de decisiones |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Historial de cambios |

## Nota

Zonda Fibra es un ISP inventado. Todas las marcas de producto del catálogo son
ficticias. El proyecto no incluye logos, fotos ni nombres de empresas reales.
