"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Size = "md" | "lg" | "xl" | "2xl" | "huge";

interface DisplayProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "p" | "blockquote";
  size?: Size;
  className?: string;
}

const SIZE_CLASS: Record<Size, string> = {
  md: "slide-text-4xl",
  lg: "slide-text-5xl",
  xl: "slide-text-6xl",
  "2xl": "slide-text-7xl",
  huge: "slide-text-display",
};

const WHITESPACE = /\s/;

/**
 * Pins a headline's line breaks while its weight animates. Glide is narrower
 * when light, so a line near the edge can gain or lose a word mid-animation.
 * This measures the breaks at the final frame, holds them with <br>s and
 * `nowrap` until the animation ends, then hands wrapping back to the browser,
 * which lands on the same breaks. Returns a cleanup that unlocks early.
 */
function lockLines(el: HTMLElement): (() => void) | undefined {
  const animations = el.getAnimations();
  if (animations.length === 0) {
    return undefined;
  }

  // Measure at the final frame without restarting the animation.
  const saved = animations.map((a) => a.currentTime);
  for (const a of animations) {
    a.currentTime = a.effect?.getComputedTiming().endTime ?? 0;
  }

  const breaks: { node: Text; offset: number }[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let lastTop: number | undefined;
  let afterSpace = false;

  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const text = node.data;
    for (let i = 0; i < text.length; i += 1) {
      if (WHITESPACE.test(text[i])) {
        afterSpace = true;
        continue;
      }
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const top = Math.round(range.getBoundingClientRect().top);
      // A word that starts lower than the last one, after a space, is a soft
      // wrap. A drop with no space before it is a block child, not a wrap.
      if (lastTop !== undefined && top > lastTop && afterSpace) {
        breaks.push({ node, offset: i });
      }
      lastTop = top;
      afterSpace = false;
    }
  }

  for (const [i, a] of animations.entries()) {
    a.currentTime = saved[i];
  }

  // Split from the end so earlier offsets stay valid. A one-line headline has
  // no breaks but still needs `nowrap`, or it can split while light.
  const inserted: HTMLBRElement[] = [];
  for (const { node, offset } of breaks.toReversed()) {
    const rest = node.splitText(offset);
    const br = document.createElement("br");
    rest.before(br);
    inserted.push(br);
  }
  el.style.whiteSpace = "nowrap";

  let unlocked = false;
  const unlock = () => {
    if (unlocked) {
      return;
    }
    unlocked = true;
    for (const br of inserted) {
      br.remove();
    }
    // Merges the split text back into React's original nodes.
    el.normalize();
    el.style.whiteSpace = "";
  };

  // A cancelled animation rejects `finished`; unlock either way.
  Promise.all(animations.map((a) => a.finished))
    .catch(() => null)
    .finally(unlock);
  return unlock;
}

/**
 * Kinetic display headline. Glide variable font animates weight on enter
 * (`display-settle` keyframes), with its line breaks pinned so it never
 * re-wraps mid-animation. Use sparingly: one per slide.
 */
export function Display({ children, as: As = "h1", size = "lg", className }: DisplayProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    let unlock: (() => void) | undefined;
    let cancelled = false;
    // Breaks depend on the real font, so wait for it before measuring.
    document.fonts.ready.then(() => {
      if (!cancelled) {
        unlock = lockLines(el);
        // The entrance waits on this (globals.css), so a server-rendered
        // headline can't start animating before its lines are pinned.
        el.dataset.settled = "";
      }
    });
    return () => {
      cancelled = true;
      unlock?.();
    };
  }, []);

  return (
    <As className={cn("honk-display", SIZE_CLASS[size], className)} ref={ref as React.Ref<never>}>
      {children}
    </As>
  );
}
