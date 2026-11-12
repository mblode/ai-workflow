"use client";

import { useRevealed } from "deck-presenter";
import {
  MotionConfig,
  MotionConfigContext,
  motion,
  useAnimate,
  useMotionValue,
  useTransform,
} from "motion/react";
import type { TargetAndTransition, Transition } from "motion/react";
import { useContext, useEffect, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { BEAT, FEELS, deckIsStill, restOf, transitionFor } from "@/lib/motion";
import type { Feel, Pose } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { StepMotion } from "./steps";

// The motion grammar, on the motion package. Every piece renders its resting
// layout and animates in from an offset when its reveal fires (straight away
// outside a reveal). A slide already seen, a presenter preview, reduced motion
// and phones skip to the end: SlideNavigation sets `skipAnimations`.

const TAGS = { div: motion.div, li: motion.li, p: motion.p, span: motion.span };

export type EnterTag = keyof typeof TAGS;

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
  feel = "snappy",
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

/**
 * Plays keyframes once its reveal fires, for moves an offset can't describe:
 * a bounce, a toss, a wave. Holds the first frame until then.
 */
export function Play({
  keyframes,
  transition,
  delay = 0,
  className,
  style,
  children,
}: {
  keyframes: Record<string, (string | number)[]>;
  transition: Transition;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const revealed = useRevealed();
  const first = useMemo(
    () => Object.fromEntries(Object.entries(keyframes).map(([key, frames]) => [key, frames[0]])),
    [keyframes],
  );

  return (
    <motion.span
      animate={(revealed ? keyframes : first) as TargetAndTransition}
      className={className}
      initial={first as TargetAndTransition}
      style={style}
      transition={{ ...transition, delay: delay * BEAT }}
    >
      {children}
    </motion.span>
  );
}

/**
 * Idle motion: slow enough to be felt more than seen. It keeps going on a
 * slide you come back to, and holds still for reduced motion, phones and the
 * presenter's previews.
 */
export function Loop({
  animate,
  duration,
  mirror = false,
  className,
  style,
  children,
}: {
  /** Transform strings, so motion hands the loop to the compositor (WAAPI). */
  animate: { transform: string[] };
  duration: number;
  mirror?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const still = useMemo(deckIsStill, []);
  // The loop has its own rule, but what it carries (a sticker's entrance)
  // follows the slide's: a slide you come back to doesn't replay it.
  const outer = useContext(MotionConfigContext).skipAnimations ?? false;

  return (
    <MotionConfig skipAnimations={still}>
      <motion.span
        animate={animate as TargetAndTransition}
        className={className}
        style={style}
        transition={{
          duration,
          ease: mirror ? FEELS.swing.ease : "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: mirror ? "mirror" : "loop",
        }}
      >
        <MotionConfig skipAnimations={outer}>{children}</MotionConfig>
      </motion.span>
    </MotionConfig>
  );
}

/** A line whose words lift into place one after another, 50ms apart. */
export function WordRise({
  children,
  delay = 0,
  className,
}: {
  children: string;
  delay?: number;
  className?: string;
}) {
  const words = children.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <Enter
            className="inline-block whitespace-nowrap"
            delay={delay + Math.min(i * 0.05, 0.35) / BEAT}
            feel="enter"
            from={{ opacity: 0, y: "0.45em" }}
          >
            {word}
          </Enter>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/** An integer that rolls from `from` to `value`. Give its parent sr-only text. */
export function Count({
  value,
  from = 0,
  delay = 0,
  duration = 1100,
}: {
  value: number;
  from?: number;
  delay?: number;
  duration?: number;
}) {
  const revealed = useRevealed();
  // A scoped animate, so a slide that arrives built skips straight to the value.
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const count = useMotionValue(from);
  const text = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!revealed) {
      return;
    }
    const controls = animate(count, value, {
      delay: delay * BEAT,
      duration: duration / 1000,
      ease: FEELS.expo.ease,
    });
    return () => controls.stop();
  }, [animate, count, delay, duration, revealed, value]);

  return (
    <motion.span aria-hidden="true" className="tabular-nums" data-count ref={scope}>
      {text}
    </motion.span>
  );
}

/**
 * A unit chart: `total` dots in a grid, the first `lit` popping to the accent.
 * `then` lights the next `count` in blue when the reveal named `step` fires.
 */
export function DotGrid({
  total,
  lit,
  columns,
  delay = 0,
  litDelay = 4,
  then,
}: {
  total: number;
  lit: number;
  columns: number;
  delay?: number;
  litDelay?: number;
  then?: { count: number; step: string };
}) {
  return (
    <div
      aria-hidden="true"
      className="grid w-fit gap-[calc(var(--stage-w,100vw)*0.009)]"
      style={{ gridTemplateColumns: `repeat(${columns}, auto)` }}
    >
      {Array.from({ length: total }, (_, i) => {
        const wave = Math.floor(i / columns) + (i % columns);

        return (
          <span
            className="relative block size-[calc(var(--stage-w,100vw)*0.02)]"
            // The dots are an unchanging picture of one number, so the index is the identity.
            // oxlint-disable-next-line react/no-array-index-key
            key={i}
          >
            <Enter
              className="absolute inset-0 rounded-full bg-[var(--hairline-strong)]"
              delay={delay + (wave * 0.026) / BEAT}
              feel="enter"
              from={{ opacity: 0, scale: 0 }}
            />
            {i < lit ? (
              <Enter
                className="absolute inset-0 rounded-full bg-[var(--accent)]"
                delay={litDelay + (i * 0.08) / BEAT}
                feel="bouncy"
                from={{ opacity: 0, scale: 0.4 }}
              />
            ) : null}
            {then && i >= lit && i < lit + then.count ? (
              <StepMotion
                after={{ opacity: 1, scale: 1 }}
                as="span"
                before={{ opacity: 0, scale: 0.4 }}
                className="absolute inset-0 rounded-full bg-[#0873aa]"
                delay={((i - lit) * 0.02) / BEAT}
                feel="bouncy"
                step={then.step}
              />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

/** A full-bleed band of drifting mono text, the copy read once by screen readers. */
export function Marquee({
  text,
  className,
  delay = 0,
  from = "down",
}: {
  text: string;
  className?: string;
  delay?: number;
  from?: "down" | "up";
}) {
  const run = Array.from({ length: 6 }, () => text).join("");
  // Three copies scroll past per loop, so the time scales with the text: every
  // band drifts at the same calm speed, whatever it says.
  const duration = text.length * 1.6;

  return (
    <Enter
      as="div"
      className={cn(
        "absolute inset-x-0 overflow-hidden whitespace-nowrap py-[var(--slide-space-3)] font-mono uppercase tracking-[0.14em] slide-text-xl",
        className,
      )}
      delay={delay}
      feel="expo"
      from={{ clipPath: from === "down" ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)" }}
    >
      <span className="sr-only">{text}</span>
      <Loop
        animate={{ transform: ["translateX(0%)", "translateX(-50%)"] }}
        className="flex w-max"
        duration={duration}
      >
        <span aria-hidden="true" className="pr-[1ch]">
          {run}
        </span>
        <span aria-hidden="true" className="pr-[1ch]">
          {run}
        </span>
      </Loop>
    </Enter>
  );
}

/** A slowly turning sunburst plate, cropped by whatever holds it. */
export function Sunburst({
  className,
  delay = 0,
  tones,
}: {
  className?: string;
  delay?: number;
  tones: [string, string];
}) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute block", className)}>
      <Enter className="block size-full" delay={delay} from={{ opacity: 0, scale: 0.7 }}>
        <Loop
          animate={{ transform: ["rotate(0deg)", "rotate(360deg)"] }}
          className="block size-full"
          duration={180}
        >
          <span
            className="sunburst block size-full"
            style={{ "--sun-a": tones[0], "--sun-b": tones[1] } as CSSProperties}
          />
        </Loop>
      </Enter>
    </span>
  );
}
