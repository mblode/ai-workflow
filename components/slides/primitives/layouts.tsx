import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Every screen, a phone included, shows the same 16:9 frame, so nothing here
// reflows. It reads this deck's --slide-* tokens.

/**
 * The slide's own inset. The stage pads every slide evenly; the left-aligned
 * layouts sit further in, so a headline never hugs the edge.
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
