"use client";

import { useRevealStep, useRevealSteps } from "deck-presenter";
import { motion } from "motion/react";
import type { TargetAndTransition, Transition } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { BEAT, transitionFor } from "@/lib/motion";
import type { Feel, Pose } from "@/lib/motion";

// What a click changes on things already on screen. A Reveal names its step
// (`<Reveal step="flip">`); these move from `before` to `after` when it fires.
// A slide that mounts built starts at `after`, so nothing replays.

const TAGS = { div: motion.div, span: motion.span };

export function StepMotion({
  step,
  before,
  after,
  as = "div",
  feel = "deliberate",
  delay = 0,
  transition,
  className,
  style,
  children,
}: {
  step: string;
  before: Pose;
  /** Values, or keyframe lists for a move that ends where it began (a wobble). */
  after: Record<string, string | number | (string | number)[]>;
  as?: keyof typeof TAGS;
  feel?: Feel;
  /** In beats, counted from the click. */
  delay?: number;
  /** Overrides for keyframe timing. */
  transition?: Transition;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const shown = useRevealStep(step);
  const Component = TAGS[as];

  return (
    <Component
      animate={(shown ? after : before) as TargetAndTransition}
      className={className}
      initial={false}
      style={style}
      transition={{ ...transitionFor(feel, delay), ...transition, delay: delay * BEAT }}
    >
      {children}
    </Component>
  );
}

/** A highlight that walks to the last of `steps` shown, one row tall each. */
export function StepHighlight({ steps, className }: { steps: string[]; className?: string }) {
  const shown = useRevealSteps(steps);
  const active = shown.lastIndexOf(true);

  return (
    <motion.span
      animate={{ opacity: active === -1 ? 0 : 1, y: `${Math.max(active, 0) * 100}%` }}
      aria-hidden="true"
      className={className}
      initial={false}
      transition={{ ...transitionFor("deliberate"), opacity: { duration: 0.2, ease: "easeOut" } }}
    />
  );
}
