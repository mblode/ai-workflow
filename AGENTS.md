# ai-workflow

The slide deck for Matthew Blode's talk "How I use AI" (Sharing AI tools and workflow, a 20-minute internal session at Linktree on 13 November 2026). Copied from the `you-have-taste` deck on 13 November 2026. A Next.js 16 app served as a zone at <https://blode.co/ai-workflow>: `basePath` and `assetPrefix` are `/ai-workflow`, and each slide is its own URL (`/ai-workflow/6`).

## Commands

Node 24 (`.nvmrc`), npm 12. Run from the repo root.

```bash
npm ci                # install; `prepare` installs the lefthook hooks
npm run dev           # dev server through portless (prints the https *.localhost URL)
npm run lint          # oxlint .
npm run format:check  # oxfmt --check . (markdown is ignored)
npm run check-types   # tsc --noEmit
npm run build         # production build
npm run check         # ultracite check: lint and format together
npm run fix           # ultracite fix
```

There are no tests. CI (`.github/workflows/ci.yml`) runs lint, format check, types and build. The pre-commit hook runs `oxfmt --write` and `oxlint --fix` on staged files. `npm run export-pdf` writes a PDF backup from a running deck, and `npm run export-pptx` a PowerPoint with the same clicks and the speaker notes in Presenter View (both share `scripts/capture-deck.mjs`; see the comment at the top of each script).

## Layout

- `lib/slides.ts`: the slide list (slug, title, palette). The deck outline, metadata, sitemap and OG images all read from it.
- `app/[slide]/page.tsx`: maps the slide number to a component; `slideComponents` must stay in the same order as `SLIDES`.
- `components/slides/ai-workflow-slides.tsx`: every slide component. Shared pieces are in `components/slides/` (`flow-chain.tsx` is the click-by-click flow on the flow slide).
- Animation is the `motion` package, through `components/slides/primitives/` (`Enter` for entrances, `StepMotion` for what a click changes); the feels, beats and poses are in `lib/motion.ts`. `<Reveal step="name">` lets things outside the reveal change when it fires. Only the headline's weight settle is CSS (`app/globals.css`).
- Art: type on one dark ground (palette `e`), with orange (`ACCENT`, in `components/slides/accent.ts`) as the only accent. The only image is the headshot in `public/images/`, imported statically so `basePath` is applied.
- `packages/deck-presenter`: npm workspace consumed as source (`transpilePackages` plus a Tailwind `@source` in `app/globals.css`). It holds the presenter window, the deck sync hook, `Reveal` and the key map (`src/keys.ts`).
- `docs/ai-workflow-speaker-notes.md`: speaker notes, shown in the presenter window. `docs/ai-workflow-spine.md` lists where every slide came from.

To add a slide: add an entry to `SLIDES`, write the component, and add it to `slideComponents` at the same index.

## Presenting

Slides render as a fixed 16:9 stage, letterboxed, on every screen including phones (no reflowed phone layout; portrait phones get a "turn sideways" hint, touch screens keep room for the nav pill), and every `--slide-*` token is a share of the stage width (`app/globals.css`, "16:9 stage"). Don't use `md:` breakpoints inside slides. Size new slide content with the `--slide-*` tokens or `--stage-w`, not bare viewport units. `P` opens the speaker notes window (`/presenter`), which drives the deck over a `BroadcastChannel`, so both windows must be in the same browser. `/presenter` and `/notes` are served in production too (`NOTES_ENABLED` in `lib/speaker-notes.ts`), noindex, and anything under a `Flags:` line never ships. `/notes` is the phone view. It cannot follow the deck (different device), so you change slide there with the buttons, a swipe or `#7` in the URL. Both windows share one key map, `createKeyReader` in `packages/deck-presenter/src/keys.ts`.

## Conventions

- Icons come from `blode-icons-react` (Lucide-compatible names such as `Loader2Icon`). `lucide-react` imports fail lint. `components.json` sets `iconLibrary` so shadcn adds use it too.
- UI components come from the `@blode` registry (`components.json`) and wrap Base UI.
- Canonical URLs, `metadataBase`, sitemap and OG image URLs use the fixed `SITE_URL` in `lib/site-url.ts`. Preview and zone-origin hostnames must never reach metadata.
- Deploys, why the lefthook `prepare` script no longer needs a `--prebuilt` workaround, and the OG image check after a deploy: `docs/deployment.md`.

## Verification

A change is proven by `npm run lint && npm run format:check && npm run check-types && npm run build`, then `node scripts/verify-slides.mjs`, which serves the build, fires every reveal and fails on overflow or a sticker over text (screenshots in `out/slide-review/`). Then open the changed slide in `npm run dev` (and `/presenter` for presenter changes). There are no tests, so motion still needs a look in the browser at 16:9.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
