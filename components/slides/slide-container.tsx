import type { Palette } from "@/lib/slides";
import { cn } from "@/lib/utils";

interface SlideContainerProps {
  children: React.ReactNode;
  className?: string;
  palette?: Palette;
}

export function SlideContainer({ children, className, palette = "e" }: SlideContainerProps) {
  return (
    <div
      className={cn(
        "slide relative flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]",
        className,
      )}
      data-palette={palette}
    >
      {children}
    </div>
  );
}
