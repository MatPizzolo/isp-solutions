"use client";

/* eslint-disable react-hooks/set-state-in-effect --
 * Este archivo existe para hacer de puente entre `localStorage` y React, y esa
 * es exactamente la excepción que la regla contempla: leer un sistema externo
 * después del montaje. Hacerlo en el cuerpo del render o en un inicializador
 * perezoso de `useState` produciría un mismatch de hidratación.
 *
 * La alternativa que sugiere la regla, `useSyncExternalStore`, es peor acá: su
 * ciclo de getServerSnapshot y getSnapshot no deja expresar el estado "todavía
 * no sé", que es el que muestra el skeleton y evita el flash de precio.
 * Ver docs/02-arquitectura.md, "Regla de hidratación".
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { SESSION_TTL_MS, storageKeys } from "@/lib/storage-keys";
import type { Session } from "@/types";

export type SessionStatus = "loading" | "ready";
export type RevealPhase = "idle" | "running" | "done";

/** Tiempos de la revelación. Una sola fuente, para que CSS y JS no se separen. */
export const REVEAL = {
  /** Retraso por ítem, en ms. */
  step: 40,
  /** Índice máximo: a partir de acá el retraso deja de crecer. */
  maxIndex: 9,
  /** Duración de la animación más larga de un ítem, en ms. */
  duration: 480,
} as const;

export const REVEAL_TOTAL_MS = REVEAL.maxIndex * REVEAL.step + REVEAL.duration;

interface SessionContextValue {
  status: SessionStatus;
  session: Session | null;
  revealPhase: RevealPhase;
  /** Guarda la sesión y arma el flag one-shot de revelación. */
  signIn: (session: Session) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function parseSession(raw: string): Session | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const candidate = parsed as Partial<Session>;
    if (
      typeof candidate.subscriberId !== "string" ||
      typeof candidate.name !== "string" ||
      typeof candidate.planId !== "string" ||
      (candidate.tier !== "base" && candidate.tier !== "premium") ||
      typeof candidate.validatedAt !== "number"
    ) {
      return null;
    }
    return candidate as Session;
  } catch {
    return null;
  }
}

export function SessionProvider({ tenantId, children }: { tenantId: string; children: ReactNode }) {
  const keys = useMemo(() => storageKeys(tenantId), [tenantId]);

  // Estado inicial incondicional. El HTML del servidor y el primer render del
  // cliente son idénticos, así que no puede haber mismatch de hidratación.
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("idle");
  const consumed = useRef(false);

  // Lectura del almacenamiento en un efecto, nunca en el cuerpo del render ni
  // en un inicializador perezoso de useState.
  useEffect(() => {
    const raw = window.localStorage.getItem(keys.session);
    const parsed = raw ? parseSession(raw) : null;
    const fresh = parsed && Date.now() - parsed.validatedAt < SESSION_TTL_MS ? parsed : null;
    if (raw && !fresh) window.localStorage.removeItem(keys.session);
    setSession(fresh);
    setStatus("ready");
  }, [keys.session]);

  // Orquestador de la revelación. El provider vive en (store)/layout y no se
  // desmonta al navegar, así que la revelación disparada en /ingresar sobrevive
  // el cambio de ruta hacia /tienda.
  useEffect(() => {
    if (status !== "ready" || !session) return;
    if (consumed.current) return;
    if (window.sessionStorage.getItem(keys.reveal) !== "1") return;

    // El flag se borra y se marca el ref ANTES de animar: ni una recarga ni la
    // doble invocación de efectos de StrictMode repiten la revelación.
    consumed.current = true;
    window.sessionStorage.removeItem(keys.reveal);
    setRevealPhase("running");

    const timer = window.setTimeout(() => setRevealPhase("done"), REVEAL_TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, [status, session, keys.reveal]);

  const signIn = useCallback(
    (next: Session) => {
      window.localStorage.setItem(keys.session, JSON.stringify(next));
      window.sessionStorage.setItem(keys.reveal, "1");
      consumed.current = false;
      setSession(next);
    },
    [keys.session, keys.reveal],
  );

  const signOut = useCallback(() => {
    window.localStorage.removeItem(keys.session);
    window.sessionStorage.removeItem(keys.reveal);
    consumed.current = false;
    setSession(null);
    setRevealPhase("idle");
  }, [keys.session, keys.reveal]);

  const value = useMemo<SessionContextValue>(
    () => ({ status, session, revealPhase, signIn, signOut }),
    [status, session, revealPhase, signIn, signOut],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession tiene que usarse dentro de SessionProvider");
  return value;
}
