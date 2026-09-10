import type { InputHTMLAttributes } from "react";

import { cx } from "@/lib/cx";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label real, siempre. Nunca se usa el placeholder como etiqueta. */
  label: string;
  /** Ayuda debajo del campo, antes de que el error aparezca. */
  hint?: string;
  error?: string;
  size?: "md" | "lg";
  hideLabel?: boolean;
}

export function Input({
  id,
  label,
  hint,
  error,
  size = "md",
  hideLabel = false,
  className,
  ...rest
}: InputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className={cx("text-ink mb-1.5 block text-[15px] font-medium", hideLabel && "sr-only")}
      >
        {label}
      </label>

      <input
        id={id}
        aria-invalid={error ? true : undefined}
        // Los dos ids van juntos: la ayuda sigue siendo útil cuando hay error.
        aria-describedby={cx(hintId, errorId) || undefined}
        className={cx(
          "bg-surface text-ink placeholder:text-muted/70 rounded-base w-full border px-4",
          "transition-colors outline-none",
          size === "lg" ? "h-14 text-[17px]" : "h-12 text-[15px]",
          error ? "border-danger" : "border-line focus:border-primary",
          className,
        )}
        {...rest}
      />

      {hint && !error && (
        <p id={hintId} className="text-muted mt-1.5 text-[13px]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-danger mt-1.5 text-[13px]">
          {error}
        </p>
      )}
    </div>
  );
}
