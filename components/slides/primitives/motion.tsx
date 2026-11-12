"use client";

import { useRevealed } from "deck-presenter";
import { motion } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { restOf, transitionFor } from "@/lib/motion";
import type { Feel, Pose } from "@/lib/motion";

// The motion grammar, on the motion package. Every piece renders its resting
// layout and animates in from an offset when its reveal fires (straight away
// outside a reveal). A slide already seen, a presenter preview and reduced
// motion skip to the end: SlideNavigation sets `skipAnimations`.

const TAGS = { div: motion.div, li: motion.li, p: motion.p, span: motion.span };

type EnterTag = keyof typeof TAGS;

interface EnterProps {
  as?: EnterTag;
  /** The pose it starts from. It lands on the resting pose unless `to` says otherwise. */
  from: Pose;
  to?: Pose;
  /** In beats, counted from the click that reveals it (or from mount). */
  delay?: number;
  feel?: Feel;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
  role?: string;
}

/** One element's entrance: from an offset to rest, on the deck's feels. */
export function Enter({
  as = "span",
  from,
  to,
  delay = 0,
  feel = "enter",
  children,
  ...rest
}: EnterProps) {
  const revealed = useRevealed();
  const Component = TAGS[as];
  const target = to ?? restOf(from);

  return (
    <Component
      {...rest}
      animate={(revealed ? target : from) as TargetAndTransition}
      initial={from as TargetAndTransition}
      transition={transitionFor(feel, delay)}
    >
      {children}
    </Component>
  );
}
