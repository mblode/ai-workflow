"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NoteLine } from "./note-line";

const SWIPE_PX = 60;
const BUTTON_CLASS =
  "inline-flex h-14 flex-1 cursor-pointer items-center justify-center rounded-full bg-white/10 text-2xl active:bg-white/20 disabled:pointer-events-none disabled:opacity-30";

const slideFromHash = (total: number) => {
  const value = Number.parseInt(window.location.hash.slice(1), 10);
  return Number.isInteger(value) ? Math.min(Math.max(value, 1), total) : 1;
};

/**
 * The speaker notes for a phone. There is no link to the deck window (a
 * BroadcastChannel stops at the browser), so the speaker changes slide here:
 * buttons, a swipe, or the slide number in the URL hash.
 */
export function MobileNotes({ notes, titles }: { notes: string[][]; titles: string[] }) {
  const total = titles.length;
  const [slide, setSlide] = useState(1);
  const touchX = useRef<number>(null);

  const go = useCallback(
    (to: number) => {
      const next = Math.min(Math.max(to, 1), total);
      setSlide(next);
      window.history.replaceState(null, "", `#${next}`);
      window.scrollTo({ top: 0 });
    },
    [total],
  );

  useEffect(() => {
    setSlide(slideFromHash(total));
  }, [total]);

  // Keep the screen on while the phone sits in a hand or on a lectern.
  useEffect(() => {
    let lock: WakeLockSentinel | undefined;
    const request = () => {
      navigator.wakeLock?.request("screen").then(
        (sentinel) => {
          lock = sentinel;
        },
        () => {},
      );
    };
    const onVisible = () => document.visibilityState === "visible" && request();
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, []);

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    if (start === null) {
      return;
    }
    const delta = event.changedTouches[0].clientX - start;
    if (Math.abs(delta) >= SWIPE_PX) {
      go(slide + (delta < 0 ? 1 : -1));
    }
  };

  return (
    <main
      className="flex min-h-dvh flex-col bg-black text-white"
      onTouchEnd={onTouchEnd}
      onTouchStart={(event) => {
        touchX.current = event.touches[0].clientX;
      }}
    >
      <header className="sticky top-0 border-white/15 border-b bg-black px-4 py-3">
        <p className="text-sm text-white/60 tabular-nums">
          Slide {slide} / {total}
        </p>
        <h1 className="text-lg leading-tight">{titles[slide - 1]}</h1>
      </header>
      <section
        aria-label="Speaker notes"
        className="flex flex-1 flex-col gap-4 px-4 py-5 text-xl leading-snug"
      >
        {notes[slide - 1]?.map((line, index) => (
          <NoteLine key={`${index}-${line}`} line={line} />
        ))}
      </section>
      <nav
        aria-label="Slides"
        className="sticky bottom-0 flex gap-3 border-white/15 border-t bg-black px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <button
          aria-label="Previous slide"
          className={BUTTON_CLASS}
          disabled={slide <= 1}
          onClick={() => go(slide - 1)}
          type="button"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          aria-label="Next slide"
          className={BUTTON_CLASS}
          disabled={slide >= total}
          onClick={() => go(slide + 1)}
          type="button"
        >
          <span aria-hidden="true">→</span>
        </button>
      </nav>
    </main>
  );
}
