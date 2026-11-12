import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// `slide-text-*` (app/globals.css) is the deck's own type scale. Teaching
// tailwind-merge about it lets a later size replace an earlier one, so
// `<Line className="slide-text-2xl">` renders at 2xl, not at Line's default.
const twMerge = extendTailwindMerge<"slide-text">({
  extend: {
    classGroups: {
      "slide-text": [
        {
          "slide-text": [
            "xs",
            "sm",
            "base",
            "lg",
            "xl",
            "2xl",
            "3xl",
            "4xl",
            "5xl",
            "6xl",
            "7xl",
            "display",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
