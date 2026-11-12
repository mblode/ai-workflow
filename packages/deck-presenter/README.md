# deck-presenter

A speaker notes window for a React slide deck: timer, current and next slide, notes for the
slide on screen. It drives the deck from a second window, so a clicker focused on the notes
reveals and advances the slides on the projector.

The two windows talk over a `BroadcastChannel`, so they must share a browser and an origin.
The deck window owns the state. The presenter window sends next and prev, and previews the
deck in iframes that mirror its reveals.

## Use

The package ships TypeScript source and Tailwind classes. In a Next.js app:

```ts
// next.config.ts
transpilePackages: ["deck-presenter"],
```

```css
/* globals.css: Tailwind does not scan node_modules */
@source "../node_modules/deck-presenter/src";
```

In the deck, read keys with `createKeyReader`, report state and take commands, and let
"next" reveal before it advances. The presenter window reads keys the same way and forwards
them, so a clicker works whichever window has focus.

```tsx
import { createKeyReader, Reveal, revealNext, showNextSlideBuilt, useDeckSync } from "deck-presenter";
import type { DeckCommand } from "deck-presenter";

const run = useCallback((command: DeckCommand) => {
  if (command.type === "next" && !revealNext()) {
    goToSlide(currentSlide + 1);
  }
  if (command.type === "prev") {
    showNextSlideBuilt(); // the previous slide mounts with its reveals shown
    goToSlide(currentSlide - 1);
  }
  // first, last, goto, black, white, fullscreen, presenter
}, [currentSlide, goToSlide]);

useEffect(() => {
  const readKey = createKeyReader();
  const onKeyDown = (event: KeyboardEvent) => {
    const command = readKey(event);
    if (command) {
      event.preventDefault();
      run(command);
    }
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [run]);

useDeckSync(currentSlide, run);

<Reveal>Shown on the next press.</Reveal>;
```

Call `showNextSlideBuilt(false)` once the new slide is up, so later mounts start unbuilt.

`Reveal` positions its click target against the nearest positioned ancestor, so the slide
needs `position: relative`.

On the presenter route:

```tsx
import { parseSpeakerNotes, PresenterView } from "deck-presenter";

<PresenterView notes={parseSpeakerNotes(markdown, slides.length)} slides={slides} />;
```

`slides` is `{ title, url }[]`, one per slide, with `url` on the presenter's origin. The deck
must allow same-origin framing (`frame-ancestors 'self'`).

## Notes format

`parseSpeakerNotes` reads one markdown doc. A slide's notes run from its `## N.` heading to
a `Flags:` line, or to the next heading. Lines starting `- ` render as beats; other lines
render smaller. `_italics_` render dimmed, `**bold**` bold, and `` `backticks` `` small.

## Not built

Editing notes in the window, a slide filmstrip, a compiled build for npm. The package is
`private` until it has one.
