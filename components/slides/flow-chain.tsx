"use client";

import { Reveal, useRevealSteps } from "deck-presenter";
import { ACCENT } from "@/components/slides/accent";
import { Enter } from "@/components/slides/primitives/motion";

export interface FlowStep {
  name: string;
  detail: string;
}

/**
 * Steps in reading order. The first is there on arrival, each click adds the
 * next, and the newest one carries the accent.
 */
export function FlowChain({ steps }: { steps: readonly FlowStep[] }) {
  const keys = steps.slice(1).map((_, i) => `flow-${i + 1}`);
  const shown = useRevealSteps(keys);
  const newest = shown.lastIndexOf(true) + 1;

  return (
    <div className="grid grid-cols-4 gap-x-[var(--slide-space-6)] gap-y-[var(--slide-space-10)]">
      {steps.map((step, i) => {
        const lit = i === newest;
        const node = (
          <Enter
            as="div"
            className="flex h-full flex-col gap-[var(--slide-space-2)] border-t-2 pt-[var(--slide-space-3)]"
            from={{ opacity: 0, y: "0.25em" }}
            style={{
              borderColor: lit ? ACCENT : "var(--hairline)",
              transition: "border-color 300ms ease-out",
            }}
          >
            <p className="font-mono text-[var(--fg-soft)] slide-text-xl">{i + 1}</p>
            <p
              className="font-heading font-semibold leading-[1.1] slide-text-3xl"
              style={{ color: lit ? ACCENT : undefined, transition: "color 300ms ease-out" }}
            >
              {step.name}
            </p>
            <p className="font-mono leading-[1.3] text-[var(--fg-soft)] slide-text-xl">
              {step.detail}
            </p>
          </Enter>
        );

        return i === 0 ? (
          <div key={step.name}>{node}</div>
        ) : (
          <Reveal key={step.name} step={keys[i - 1]}>
            {node}
          </Reveal>
        );
      })}
    </div>
  );
}
