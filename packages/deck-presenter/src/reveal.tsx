"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

/** Marks a reveal that has not fired yet. The presenter window counts these. */
export const PENDING_REVEAL = "[data-reveal]";

/**
 * Fires the first pending reveal on the slide. Returns false when there is
 * none, so a deck's "next" can reveal first and only then advance.
 */
export const revealNext = () => {
  const pending = document.querySelector<HTMLButtonElement>(PENDING_REVEAL);
  pending?.click();
  return Boolean(pending);
};

// Going back lands on a slide you have already built, so it arrives built, as
// in Keynote. The deck sets this before it navigates back; the reveals on the
// slide that mounts next read it, and the deck clears it once that slide is up.
let mountBuilt = false;

export const showNextSlideBuilt = (built = true) => {
  mountBuilt = built;
};

// The click target for one reveal step. It covers the slide, so a click
// anywhere fires the first pending step, wherever the step sits.
function RevealButton({ onReveal }: { onReveal: () => void }) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      aria-label="Reveal the next line"
      // z-10: the opacity-0 children form a stacking context that would
      // otherwise paint over this button and swallow the click.
      className="absolute inset-0 z-10 cursor-default"
      data-reveal
      // The last overlay sits on top, so a click is handed to the first one.
      onClick={() => {
        if (document.querySelector(PENDING_REVEAL) === buttonRef.current) {
          onReveal();
          return;
        }
        revealNext();
      }}
      ref={buttonRef}
      type="button"
    />
  );
}

// Whether the nearest reveal has fired. Content outside any reveal is shown.
const Revealed = createContext(true);

/** True once the step this sits in has been revealed, or if it sits in none. */
export const useRevealed = () => useContext(Revealed);

interface StepsValue {
  /** Every step counts as shown: the slide mounted built. */
  all: boolean;
  shown: ReadonlySet<string>;
  show: (step: string) => void;
}

const Steps = createContext<StepsValue | null>(null);

/**
 * Tracks the named steps on one slide, so things outside a reveal can change
 * when it fires: a card flips, a fan gathers into a stack. Mount one per slide.
 */
export function RevealSteps({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => ({
    all: mountBuilt,
    shown: new Set<string>() as ReadonlySet<string>,
  }));
  const show = useCallback((step: string) => {
    setState((prev) =>
      prev.shown.has(step) ? prev : { ...prev, shown: new Set(prev.shown).add(step) },
    );
  }, []);
  const value = useMemo(() => ({ ...state, show }), [state, show]);

  return <Steps value={value}>{children}</Steps>;
}

/** True once the reveal named `step` has fired, or outside any `RevealSteps`. */
export const useRevealStep = (step: string) => {
  const steps = useContext(Steps);
  return steps ? steps.all || steps.shown.has(step) : true;
};

/** `useRevealStep` for several steps at once, in order. */
export const useRevealSteps = (names: readonly string[]) => {
  const steps = useContext(Steps);
  return names.map((step) => (steps ? steps.all || steps.shown.has(step) : true));
};

// No transition: the step's own entrance animation does the showing, and a
// wrapper fading on top of it would multiply into an ease-in. The wrapper only
// stops hidden content flashing before it plays.
const fadeClass = (revealed: boolean) => (revealed ? "opacity-100" : "opacity-0");

/**
 * One reveal step. The children stay in the DOM (hidden from assistive tech)
 * so the slide does not reflow when they appear. A slide can hold several:
 * they reveal in DOM order, one per press, wherever the click lands. The deck
 * owns the keys and calls `revealNext`.
 */
export function Reveal({ children, step }: { children: ReactNode; step?: string }) {
  const [revealed, setRevealed] = useState(() => mountBuilt);
  const steps = useContext(Steps);
  const reveal = () => {
    setRevealed(true);
    if (step) {
      steps?.show(step);
    }
  };

  return (
    <Revealed value={revealed}>
      {!revealed && <RevealButton onReveal={reveal} />}
      <div
        aria-hidden={!revealed}
        className={fadeClass(revealed)}
        data-reveal-state={revealed ? "shown" : "pending"}
      >
        {children}
      </div>
    </Revealed>
  );
}

const GroupRevealed = createContext(true);

/**
 * One reveal step shared by pieces spread through a layout, such as the
 * values in a table: every `RevealItem` inside appears on the same press.
 */
export function RevealGroup({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(() => mountBuilt);

  return (
    <GroupRevealed value={revealed}>
      {!revealed && <RevealButton onReveal={() => setRevealed(true)} />}
      {children}
    </GroupRevealed>
  );
}

export function RevealItem({ children }: { children: ReactNode }) {
  const revealed = useContext(GroupRevealed);

  return (
    <Revealed value={revealed}>
      <div
        aria-hidden={!revealed}
        className={fadeClass(revealed)}
        data-reveal-state={revealed ? "shown" : "pending"}
      >
        {children}
      </div>
    </Revealed>
  );
}
