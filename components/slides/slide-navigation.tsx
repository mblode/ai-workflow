"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "blode-icons-react";
import {
  RevealSteps,
  createKeyReader,
  revealNext,
  showNextSlideBuilt,
  useDeckSync,
} from "deck-presenter";
import type { DeckBlank, DeckCommand } from "deck-presenter";
import { MotionConfig } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PRELOAD_SRCS } from "@/lib/assets";
import { deckIsStill } from "@/lib/motion";
import { BASE_PATH } from "@/lib/site-url";
import type { Palette } from "@/lib/slides";
import { cn } from "@/lib/utils";

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  palette: Palette;
  children: React.ReactNode;
}

const getSlideUrl = (slideNum: number) => (slideNum === 1 ? "/" : `/${slideNum}`);

const openPresenter = () =>
  window.open(`${BASE_PATH}/presenter`, "presenter", "popup,width=1200,height=800");

const toggleFullscreen = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }
  // Safari and some kiosk setups refuse; the deck still works windowed.
  await document.documentElement.requestFullscreen().catch(() => null);
};

// The Fullscreen API covers F and F5. F11 and the macOS green button make the
// browser itself fullscreen, which the display-mode query reports in Chromium,
// and which elsewhere shows as a window that fills the screen. Only with a mouse:
// a phone's viewport can fill its screen, and touch needs the pill. The
// presenter's previews are iframes and never present.
const isPresenting = (browserFullscreen: MediaQueryList) => {
  if (window.self !== window.top) {
    return false;
  }
  const fillsScreen =
    window.matchMedia("(pointer: fine)").matches &&
    window.innerWidth >= window.screen.width &&
    window.innerHeight >= window.screen.height;
  return Boolean(document.fullscreenElement) || browserFullscreen.matches || fillsScreen;
};

// The cursor and the nav pill get out of the way this long after the mouse stops.
const IDLE_MS = 2000;
// Clicks on these keep their own meaning: the radio demo, links, the pill.
const INTERACTIVE = "a, button, input, label, select, textarea, [data-slide-nav]";

// Slides already shown this session arrive built, without replaying their
// entrance, as in Keynote. A reload starts the talk fresh.
const enteredSlides = new Set<number>();

// The navigation remounts with every slide, so warm the art and the routes
// once per page load, not once per slide.
let warmed = false;
let prefetched = false;

export function SlideNavigation({
  currentSlide,
  totalSlides,
  palette,
  children,
}: SlideNavigationProps) {
  const router = useRouter();
  const stageRef = useRef<HTMLElement>(null);
  const [blank, setBlank] = useState<DeckBlank>(null);
  // The key and click listeners are bound once, so they read the blank through a ref.
  const blankRef = useRef<DeckBlank>(null);
  useEffect(() => {
    blankRef.current = blank;
  }, [blank]);

  const goToSlide = useCallback(
    (slideNum: number) => {
      if (slideNum >= 1 && slideNum <= totalSlides && slideNum !== currentSlide) {
        router.push(getSlideUrl(slideNum), { scroll: false });
      }
    },
    [currentSlide, router, totalSlides],
  );

  const goNext = useCallback(() => {
    // A pending reveal takes the press, so a clicker's "next" never skips it.
    if (!revealNext()) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, goToSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 1) {
      showNextSlideBuilt();
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  const run = useCallback(
    (command: DeckCommand) => {
      // While the screen is blanked, any press only brings the slide back.
      if (blankRef.current && command.type !== "presenter" && command.type !== "fullscreen") {
        setBlank(null);
        return;
      }
      switch (command.type) {
        case "next": {
          goNext();
          break;
        }
        case "prev": {
          goPrev();
          break;
        }
        case "first": {
          goToSlide(1);
          break;
        }
        case "last": {
          // On the last slide already there is no navigation to clear the flag.
          if (currentSlide < totalSlides) {
            showNextSlideBuilt();
            goToSlide(totalSlides);
          }
          break;
        }
        case "goto": {
          goToSlide(command.slide);
          break;
        }
        case "black":
        case "white": {
          setBlank(command.type);
          break;
        }
        case "fullscreen": {
          void toggleFullscreen();
          break;
        }
        case "presenter": {
          openPresenter();
          break;
        }
        default: {
          break;
        }
      }
    },
    [currentSlide, goNext, goPrev, goToSlide, totalSlides],
  );

  // A slide already seen arrives built, and so does every slide in a presenter
  // preview, with reduced motion, or on a phone: motion skips each animation
  // to its end. Read once per slide, before its entrance can start.
  const arriveBuilt = useMemo(
    () => deckIsStill() || enteredSlides.has(currentSlide),
    [currentSlide],
  );

  // The headline's weight settle is CSS, so it reads the same flag from here.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      const built = enteredSlides.has(currentSlide) || window.self !== window.top;
      stage.dataset.entered = built ? "instant" : "animate";
    }
  }, [currentSlide]);

  // The slide that just mounted has read the flag, so later mounts start unbuilt.
  useEffect(() => {
    showNextSlideBuilt(false);
    enteredSlides.add(currentSlide);
  }, [currentSlide]);

  // Warm every sticker and photo once, so no slide waits on venue wifi. The
  // presenter's previews are the deck in iframes, and don't need to.
  useEffect(() => {
    if (warmed || window.self !== window.top) {
      return;
    }
    warmed = true;
    for (const src of PRELOAD_SRCS) {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    }
  }, []);

  // Every slide, not just the neighbours: a jump never waits on venue wifi.
  // The presenter's previews are the deck in iframes, and don't need to.
  useEffect(() => {
    if (prefetched || window.self !== window.top) {
      return;
    }
    prefetched = true;
    for (let slideNum = 1; slideNum <= totalSlides; slideNum += 1) {
      router.prefetch(getSlideUrl(slideNum));
    }
  }, [router, totalSlides]);

  useEffect(() => {
    const readKey = createKeyReader();
    const onKeyDown = (event: KeyboardEvent) => {
      const command = readKey(event);
      if (command) {
        event.preventDefault();
        run(command);
      }
    };
    // Clicking anywhere on the slide advances, as in presentation mode elsewhere.
    // While blanked, a click anywhere brings the slide back.
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const onSlide = target?.closest(".slide") && !target.closest(INTERACTIVE);
      if (event.button === 0 && (blankRef.current || onSlide)) {
        run({ type: "next" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("click", onClick);
    };
  }, [run]);

  // Fullscreen is presenting: `data-presenting` hides the chrome and the page
  // around the slide. `data-idle` hides the cursor and the pill until the
  // mouse moves.
  useEffect(() => {
    const root = document.documentElement;
    const browserFullscreen = window.matchMedia("(display-mode: fullscreen)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onFullscreenChange = () => {
      const presenting = isPresenting(browserFullscreen);
      if (presenting !== Object.hasOwn(root.dataset, "presenting")) {
        root.toggleAttribute("data-presenting", presenting);
        window.scrollTo(0, 0);
      }
    };
    const onMove = () => {
      delete root.dataset.idle;
      clearTimeout(timer);
      timer = setTimeout(() => (root.dataset.idle = ""), IDLE_MS);
    };
    onFullscreenChange();
    onMove();
    document.addEventListener("fullscreenchange", onFullscreenChange);
    // F11 and the macOS green button fire no fullscreenchange, only a resize.
    browserFullscreen.addEventListener("change", onFullscreenChange);
    window.addEventListener("resize", onFullscreenChange);
    window.addEventListener("pointermove", onMove);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      browserFullscreen.removeEventListener("change", onFullscreenChange);
      window.removeEventListener("resize", onFullscreenChange);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  useDeckSync(currentSlide, run, blank);

  return (
    <section
      aria-label="Slide"
      className="relative min-h-dvh"
      data-deck-stage
      data-entered="animate"
      ref={stageRef}
    >
      <p
        aria-hidden="true"
        className="rotate-hint fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-40 text-center font-sans text-sm text-white/60"
      >
        Turn your phone sideways for a bigger slide
      </p>
      <MotionConfig skipAnimations={arriveBuilt}>
        <RevealSteps key={currentSlide}>{children}</RevealSteps>
      </MotionConfig>
      {blank && (
        <div
          aria-hidden="true"
          className={cn("fixed inset-0 z-[60]", blank === "black" ? "bg-black" : "bg-white")}
          data-deck-blank
        />
      )}
      {/* The last slide stays up during applause, so on a mouse-driven screen it
          carries no chrome. Touch screens keep the pill: it is their only way
          back. */}
      <div
        className={cn(
          "-translate-x-1/2 fixed bottom-4 left-1/2 z-50 flex items-center gap-1 rounded-full bg-[var(--fg)] p-1 font-medium text-[var(--bg)] shadow-[0_8px_28px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.16)] transition-opacity duration-300",
          currentSlide >= totalSlides && "pointer-fine:hidden",
        )}
        data-palette={palette}
        data-slide-nav
      >
        <Button
          aria-label="Previous slide"
          className="cursor-pointer touch-manipulation rounded-full text-[var(--bg)] hover:bg-[color-mix(in_oklab,var(--bg)_12%,transparent)] hover:text-[var(--bg)] active:scale-[0.93]"
          disabled={currentSlide <= 1}
          onClick={goPrev}
          size="icon-lg"
          variant="ghost"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
        </Button>
        <span
          aria-live="polite"
          className="min-w-[4rem] text-center font-sans text-[var(--bg)] text-sm tabular-nums opacity-80"
        >
          <span className="sr-only">Slide </span>
          {currentSlide}
          <span className="sr-only"> of </span>
          <span aria-hidden="true"> / </span>
          {totalSlides}
        </span>
        <Button
          aria-label="Next slide"
          className="cursor-pointer touch-manipulation rounded-full text-[var(--bg)] hover:bg-[color-mix(in_oklab,var(--bg)_12%,transparent)] hover:text-[var(--bg)] active:scale-[0.93]"
          disabled={currentSlide >= totalSlides}
          onClick={goNext}
          size="icon-lg"
          variant="ghost"
        >
          <ChevronRightIcon aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </section>
  );
}
