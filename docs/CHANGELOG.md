# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Una entrada por paso completado de la sección 15 de `KICKOFF.md`.

## [No publicado]

### Paso 1 — Documentación base — 2026-09-09

Agregado:

- `docs/` con los diez documentos fuente del proyecto: visión y modelo de negocio,
  alcance de la Fase 0, arquitectura, modelo de datos, esqueleto del plan de diseño,
  flujos de usuario, roadmap, métricas y KPIs, log de decisiones y este changelog.
- `CLAUDE.md` con las reglas duras, comandos, DNIs de prueba, guion de demo
  y definition of done.
- `README.md`, `.env.example` y `.gitignore`.

Decidido:

- Tailwind v4 con theming CSS-first (`ADR-011`).
- Playwright solo como dependencia de desarrollo, para las capturas del guion (`ADR-012`).
- Prettier junto a la config de ESLint de Next (`ADR-013`).
- Los tres presets tipográficos quedan fijos en `sora-plex`, `manrope-inter`
  y `outfit-source` (`ADR-014`).

Abierto:

- `ADR-015`: el volumen de órdenes mock y el funnel de `metrics.json` no pueden
  cumplirse a la vez tal como están enunciados en `KICKOFF.md`. Pendiente de
  resolver antes del paso 4.

Eliminado:

- `PROMPT.md`, reemplazado por `KICKOFF.md`.
