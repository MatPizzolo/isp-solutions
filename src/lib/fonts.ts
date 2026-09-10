import { IBM_Plex_Sans, Inter, Manrope, Outfit, Sora, Source_Sans_3 } from "next/font/google";

import type { FontPresetId } from "@/types";

/**
 * `next/font/google` resuelve las fuentes en build: no puede cargar una familia
 * arbitraria en runtime. Por eso hay tres presets fijos, los seis archivos se
 * cargan una sola vez en el layout raíz, y el tenant elige un par (ADR-003).
 *
 * Los pesos están recortados a los que realmente se usan: seis familias
 * completas serían cientos de KB de woff2 por una demo.
 */
const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const source = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source",
  display: "swap",
});

interface FontPreset {
  /** Se muestra en el selector de /admin/marca. */
  label: string;
  /** Nombre de la variable CSS, sin el prefijo `--font-`. */
  headingVar: string;
  bodyVar: string;
}

/**
 * Los tres pares. Todos cumplen el criterio del kickoff: sans geométrica o
 * humanista para títulos, sans neutra para cuerpo, ninguna serif (ADR-014).
 */
export const FONT_PRESETS: Record<FontPresetId, FontPreset> = {
  "sora-plex": { label: "Sora / IBM Plex Sans", headingVar: "sora", bodyVar: "plex" },
  "manrope-inter": { label: "Manrope / Inter", headingVar: "manrope", bodyVar: "inter" },
  "outfit-source": { label: "Outfit / Source Sans", headingVar: "outfit", bodyVar: "source" },
};

export const FONT_PRESET_IDS = Object.keys(FONT_PRESETS) as FontPresetId[];

/**
 * Las seis clases de `next/font`. Van juntas en `<html>` para que las seis
 * variables queden declaradas ahí y se hereden a todo el árbol — incluido el
 * contenedor scoped del preview de marca, que así puede elegir otro preset.
 */
export const fontClassNames = [sora, plex, manrope, inter, outfit, source]
  .map((font) => font.variable)
  .join(" ");

/** Preset → el par de variables de indirección que consume `@theme inline`. */
export function resolveFontVars(preset: FontPresetId): Record<string, string> {
  const { headingVar, bodyVar } = FONT_PRESETS[preset];
  return {
    "--font-heading": `var(--font-${headingVar})`,
    "--font-body": `var(--font-${bodyVar})`,
  };
}
