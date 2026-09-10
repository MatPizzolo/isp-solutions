"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";

/**
 * Panel lateral. Junto con el panel de modo demo, es uno de los dos únicos
 * elementos del proyecto con sombra: flota sobre el contenido y necesita
 * despegarse de él.
 *
 * No es un modal: no bloquea la tarea, se puede cerrar con Escape o tocando
 * afuera, y el contenido de atrás sigue siendo el contexto.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panel.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      // Devolver el foco a donde estaba es lo que hace que abrir y cerrar el
      // carrito no expulse a quien navega con teclado al principio de la página.
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="bg-ink/25 absolute inset-0 cursor-default"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="bg-surface absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col shadow-[0_0_40px_rgba(0,0,0,0.18)] outline-none"
      >
        <div className="border-line flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <Button variant="ghost" size="md" onClick={onClose} aria-label="Cerrar">
            <X aria-hidden className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && <div className="border-line border-t px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
