import type { Transition } from "motion/react";

// The deck's motion vocabulary, shared by the server-rendered slides and the
// client primitives that animate them. Plain data only, so a server component
// can import it and pass poses across to the client.

/** One beat of choreography, in seconds. Every delay in the deck counts in beats. */
export const BEAT = 0.16;

/**
 * Springs for things that move: deliberate for cards and panels, snappy for
 * numbers and stamps, bouncy for sticker scale only. Eases for text and wipes,
 * which never bounce. Everything lands in about a second.
 */
export const FEELS = {
  bouncy: { bounce: 0.5, type: "spring", visualDuration: 0.42 },
  deliberate: { bounce: 0.15, type: "spring", visualDuration: 0.5 },
  enter: { duration: 0.46, ease: [0.22, 1, 0.36, 1] },
  expo: { duration: 0.64, ease: [0.19, 1, 0.22, 1] },
  snappy: { bounce: 0.3, type: "spring", visualDuration: 0.36 },
  swing: { duration: 0.46, ease: [0.45, 0, 0.55, 1] },
} as const satisfies Record<string, Transition>;

export type Feel = keyof typeof FEELS;

/** Where an animation starts or lands: motion values by name. */
export type Pose = Record<string, string | number>;

/** A feel with a delay in beats. Opacity always fades quickly and never springs. */
export const transitionFor = (feel: Feel, delay = 0): Transition => {
  const seconds = delay * BEAT;
  return {
    ...FEELS[feel],
    delay: seconds,
    opacity: { delay: seconds, duration: 0.18, ease: "easeOut" },
  };
};

const REST: Pose = { opacity: 1, scale: 1, scaleX: 1, scaleY: 1 };

// "-70%" rests at "0%", so a value never changes unit mid-flight.
const zero = (value: string | number) =>
  typeof value === "string" ? value.replace(/^-?[\d.]+/, "0") : 0;

/** The resting pose for an entrance: full size, no offset, no tilt, no clip. */
export const restOf = (from: Pose): Pose =>
  Object.fromEntries(
    Object.entries(from).map(([key, value]) => {
      if (key in REST) {
        return [key, REST[key]];
      }
      if (key === "clipPath") {
        return [key, "inset(0% 0% 0% 0%)"];
      }
      return [key, zero(value)];
    }),
  );

/**
 * True where the deck holds still: reduced motion, or the presenter's preview
 * iframes. Phones animate like the big screen. Client only; the server renders
 * the animated version.
 */
export const deckIsStill = () =>
  typeof window !== "undefined" &&
  (window.self !== window.top || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
