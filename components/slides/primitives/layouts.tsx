import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Layouts ported from Amtec's deck package (amtec/packages/deck/src/primitives
// and deck.css): the eyebrow, frame, split and footnote. They read this deck's
// --slide-* tokens and palette variables. Every screen, a phone included,
// shows the same 16:9 frame, so nothing here reflows.

/** Mono, uppercase kicker above a headline. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono uppercase tracking-[0.14em] text-[var(--fg-soft)] slide-text-xl",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * The slide's own inset. The stage pads every slide evenly; the left-aligned
 * layouts sit further in, as Amtec's do, so a headline never hugs the edge.
 */
export function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col px-[var(--slide-space-16)] py-[var(--slide-space-12)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const SPLIT_RATIO = {
  "1:1": "grid-cols-2",
  "3:2": "grid-cols-[3fr_2fr]",
  "2:3": "grid-cols-[2fr_3fr]",
} as const;

/** Two columns, optionally asymmetric, with an optional hairline between. */
export function Split({
  left,
  right,
  ratio = "1:1",
  divider = false,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  ratio?: keyof typeof SPLIT_RATIO;
  divider?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("grid items-start gap-[var(--slide-space-16)]", SPLIT_RATIO[ratio], className)}
    >
      <div className="min-w-0">{left}</div>
      <div
        className={cn(
          "min-w-0",
          divider && "border-l border-[var(--hairline)] pl-[var(--slide-space-16)]",
        )}
      >
        {right}
      </div>
    </div>
  );
}

/** A source line pinned under the content. */
export function Footnote({ children }: { children: ReactNode }) {
  return <p className="mt-auto text-[var(--fg-soft)] slide-text-2xl">{children}</p>;
}
