"use client";

import { Check, TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { cx } from "@/lib/cx";

interface ToastEntry {
  id: number;
  message: string;
  tone: "success" | "error";
}

interface ToastContextValue {
  notify: (message: string, tone?: ToastEntry["tone"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ToastEntry[]>([]);

  const notify = useCallback((message: string, tone: ToastEntry["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setEntries((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setEntries((current) => current.filter((entry) => entry.id !== id));
    }, DURATION_MS);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext value={value}>
      {children}
      {/* role="status" y no "alert": un aviso de confirmación no debe
          interrumpir lo que el lector de pantalla esté diciendo. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 z-[60] flex flex-col gap-2"
      >
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cx(
              "rounded-base flex items-center gap-2 border px-4 py-3 text-[15px] shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
              entry.tone === "success"
                ? "bg-surface border-success/30 text-ink"
                : "bg-surface border-danger/30 text-ink",
            )}
          >
            {entry.tone === "success" ? (
              <Check aria-hidden className="text-success size-4 shrink-0" />
            ) : (
              <TriangleAlert aria-hidden className="text-danger size-4 shrink-0" />
            )}
            {entry.message}
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast tiene que usarse dentro de ToastProvider");
  return value;
}
