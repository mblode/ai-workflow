"use client";

import { useEffect, useRef, useState } from "react";
import { DECK_CHANNEL } from "./channel";
import type { DeckBlank, DeckMessage } from "./channel";
import { createKeyReader } from "./keys";
import type { DeckCommand } from "./keys";
import { NoteLine } from "./note-line";

export interface PresenterSlide {
  title: string;
  /** Where the deck serves this slide. Same origin as the presenter window. */
  url: string;
}

const TICK_MS = 1000;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SOFT = "text-white/60";
const BUTTON_CLASS =
  "inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-full px-4 font-medium text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-40";

const formatElapsed = (ms: number) => {
  const seconds = Math.floor(ms / MS_PER_SECOND);
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  return `${minutes}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, "0")}`;
};

// The iframe renders at 2.5x and scales down, so the slide's fluid type keeps
// its projector proportions at thumbnail size. Inert: keys stay in this window.
function SlidePreview({ number, slide }: { number: number; slide: PresenterSlide }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-white/15">
      <iframe
        className="pointer-events-none absolute top-0 left-0 size-[250%] origin-top-left scale-40"
        src={slide.url}
        tabIndex={-1}
        title={`Slide ${number}: ${slide.title}`}
      />
    </div>
  );
}

/**
 * The speaker's window. It sends next/prev to the deck window, which owns the
 * state, so keep the clicker's focus here. `notes` and `slides` share an index.
 */
export function PresenterView({ notes, slides }: { notes: string[][]; slides: PresenterSlide[] }) {
  const [deck, setDeck] = useState<{ slide: number; pending: number; blank: DeckBlank }>();
  // Elapsed time is banked on pause, so a throttled timer can't drift.
  const [timer, setTimer] = useState<{ banked: number; startedAt?: number }>({ banked: 0 });
  const [now, setNow] = useState(0);
  const channelRef = useRef<BroadcastChannel>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(DECK_CHANNEL);
    channelRef.current = channel;
    channel.addEventListener("message", ({ data }: MessageEvent<DeckMessage>) => {
      if (data.type !== "state") {
        return;
      }
      setDeck({ blank: data.blank, pending: data.pending, slide: data.slide });
      // Slide 1 is the holding slide: the clock starts on the first advance.
      if (data.slide > 1) {
        setTimer((current) =>
          current.startedAt === undefined && current.banked === 0
            ? { banked: 0, startedAt: Date.now() }
            : current,
        );
      }
    });
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel takes no targetOrigin
    channel.postMessage({ type: "hello" } satisfies DeckMessage);
    return () => channel.close();
  }, []);

  const running = timer.startedAt !== undefined;
  useEffect(() => {
    if (!running) {
      return;
    }
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, [running]);

  const elapsed =
    timer.banked + (timer.startedAt === undefined ? 0 : Math.max(0, now - timer.startedAt));
  const toggleTimer = () =>
    setTimer(
      timer.startedAt === undefined
        ? { banked: timer.banked, startedAt: Date.now() }
        : { banked: timer.banked + Date.now() - timer.startedAt },
    );

  const send = (command: DeckCommand) =>
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel takes no targetOrigin
    channelRef.current?.postMessage({ command, type: "command" } satisfies DeckMessage);
  const next = () => send({ type: "next" });
  const prev = () => send({ type: "prev" });

  // The clicker is often focused on this window, so every key it sends is
  // forwarded to the deck. Fullscreen can only be asked for in the deck's own
  // window, and P would open this one again: this window swallows both, which
  // also stops F5 reloading the notes.
  useEffect(() => {
    const readKey = createKeyReader();
    const onKeyDown = (event: KeyboardEvent) => {
      const command = readKey(event);
      if (!command) {
        return;
      }
      event.preventDefault();
      if (command.type !== "fullscreen" && command.type !== "presenter") {
        // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel takes no targetOrigin
        channelRef.current?.postMessage({ command, type: "command" } satisfies DeckMessage);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!deck) {
    return (
      <main
        className={`flex min-h-dvh items-center justify-center bg-black p-8 text-center text-xl ${SOFT}`}
      >
        Waiting for the deck. Open it in another window of this browser.
      </main>
    );
  }

  const { blank, slide, pending } = deck;
  const total = slides.length;
  const upNext = slides.at(slide);

  return (
    <main className="grid min-h-dvh gap-6 bg-black p-6 text-white md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <section aria-label="Slides" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-1">
          <p className="mr-2 min-w-[5ch] text-4xl tabular-nums">{formatElapsed(elapsed)}</p>
          <button className={BUTTON_CLASS} onClick={toggleTimer} type="button">
            {running ? "Pause" : "Start"}
          </button>
          <button className={BUTTON_CLASS} onClick={() => setTimer({ banked: 0 })} type="button">
            Reset
          </button>
          <p aria-live="polite" className={`mr-2 ml-auto tabular-nums ${SOFT}`}>
            Slide {slide} / {total}
            {pending > 0 && ` · ${pending} to reveal`}
            {blank && ` · Screen ${blank}, any key brings it back`}
          </p>
          <button
            aria-label="Previous slide"
            className={BUTTON_CLASS}
            disabled={slide <= 1}
            onClick={prev}
            type="button"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            aria-label="Next slide"
            className={BUTTON_CLASS}
            disabled={slide >= total && pending === 0}
            onClick={next}
            type="button"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="relative">
          <SlidePreview number={slide} slide={slides[slide - 1]} />
          {/* The audience sees the blank, so the speaker's preview does too. */}
          {blank && (
            <div
              aria-hidden="true"
              className={`absolute inset-0 rounded-lg border border-white/15 ${blank === "black" ? "bg-black" : "bg-white"}`}
            />
          )}
        </div>
        {upNext && (
          <div className="flex w-1/2 flex-col gap-2">
            <p className={`text-sm ${SOFT}`}>Next · {upNext.title}</p>
            <SlidePreview number={slide + 1} slide={upNext} />
          </div>
        )}
      </section>
      <section
        aria-label="Speaker notes"
        className="flex flex-col gap-4 overflow-y-auto text-2xl leading-snug md:max-h-[calc(100dvh-3rem)]"
      >
        {notes[slide - 1]?.map((line, index) => (
          // A beat can repeat within a slide, so the text alone is not a key.
          <NoteLine key={`${index}-${line}`} line={line} />
        ))}
      </section>
    </main>
  );
}
