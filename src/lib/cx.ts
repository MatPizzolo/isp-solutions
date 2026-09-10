type ClassValue = string | false | null | undefined;

/**
 * Une clases, descartando lo falso. Cinco líneas en vez de una dependencia:
 * no hace falta resolver conflictos de Tailwind, porque los componentes no
 * reciben clases que peleen con las suyas.
 */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
