import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/cx";

/**
 * Variantes. **No todo es primario**: una pantalla tiene una sola acción ámbar.
 * Si dos botones compiten por el acento, uno de los dos está mal.
 */
const VARIANT = {
  primary: "bg-accent text-ink hover:bg-accent-hover font-semibold",
  secondary: "bg-surface text-ink border border-line hover:bg-background font-medium",
  onPrimary: "bg-surface text-primary hover:bg-background font-semibold",
  ghost: "text-ink hover:bg-background font-medium",
  danger: "bg-danger text-white hover:opacity-90 font-semibold",
} as const;

const SIZE = {
  md: "h-10 px-4 text-[15px]",
  lg: "h-12 px-6 text-[15px]",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      // `aria-busy` en lugar de cambiar el texto: quien usa lector de pantalla
      // no pierde la etiqueta del botón mientras carga.
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cx(
        "rounded-base inline-flex items-center justify-center gap-2 transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-45",
        VARIANT[variant],
        SIZE[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
