import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

const TONE = {
  neutral: "bg-background text-muted border-line",
  success: "bg-success/12 text-success border-success/25",
  danger: "bg-danger/12 text-danger border-danger/25",
  included: "bg-success/15 text-success border-success/30",
  accent: "bg-accent/15 text-ink border-accent/30",
} as const;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof TONE;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "rounded-sm inline-flex items-center border px-2 py-0.5 text-[13px] font-medium",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
