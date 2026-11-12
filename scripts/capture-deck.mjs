// Shared by the PDF and PowerPoint exports: walks a running deck and
// screenshots every slide at 1920x1080 (at 2x, so text stays sharp on a 4K
// screen), once before any click and once after each reveal, as the clicker
// would fire them.
import { chromium } from "playwright-core";

export const WIDTH = 1920;
export const HEIGHT = 1080;
// The page runs with reduced motion, so every entrance lands at once; this
// covers the reveal fade and the images decoding.
const SETTLE_MS = 900;

/** The deck root from the first argument, then DECK_URL, then `npm start`. */
export const deckUrlFromArgs = () =>
  (process.argv[2] ?? process.env.DECK_URL ?? "http://localhost:3000/ai-workflow").replace(
    /\/$/,
    "",
  );

const deckMissing = (deckUrl) =>
  new Error(
    `No slides at ${deckUrl}. Is the deck running? Start it with \`npm run build && npm start\`, or pass the deck's URL as the first argument.`,
  );

export const launchBrowser = () =>
  chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" },
  );

/**
 * Returns one entry per slide: its title, its text once fully built, and a PNG
 * per click state, the first before any reveal and the last fully built.
 * Walks until a slide 404s.
 */
export const captureDeck = async (browser, deckUrl) => {
  // portless serves dev over HTTPS with its own local certificate.
  const page = await browser.newPage({
    ignoreHTTPSErrors: true,
    // Final frames only: no half-dealt cards or mid-roll digits.
    reducedMotion: "reduce",
    deviceScaleFactor: 2,
    viewport: { height: HEIGHT, width: WIDTH },
  });
  const slides = [];
  for (let slide = 1; ; slide += 1) {
    const url = slide === 1 ? deckUrl : `${deckUrl}/${slide}`;
    const response = await page.goto(url).catch((error) => {
      if (slide === 1) {
        throw deckMissing(deckUrl);
      }
      throw error;
    });
    if (!response?.ok()) {
      break;
    }
    // Presenting mode hides the nav pill and everything under the title slide.
    const title = await page.evaluate(async () => {
      document.documentElement.dataset.presenting = "";
      await document.fonts.ready;
      return document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "";
    });
    const frames = [];
    const settle = async () => {
      await page.waitForTimeout(SETTLE_MS);
      frames.push(await page.screenshot({ type: "png" }));
    };
    await settle();
    // Fire each pending step the way the deck's `revealNext` does. A slide
    // with several steps stacks their overlays, so a pointer click on the
    // first one would land on the one above it.
    while (await page.locator("[data-reveal]").count()) {
      await page.locator("[data-reveal]").first().dispatchEvent("click");
      await settle();
    }
    // The slide's words as a screen reader hears them: decorative copies are
    // aria-hidden, and the talk outline strip repeats on every slide.
    const text = await page.evaluate(() =>
      [...document.querySelectorAll(".slide :is(h1, h2, h3, p, li)")]
        .filter((node) => !node.closest('[aria-hidden="true"], [aria-label="Talk outline"]'))
        .map((node) => node.textContent.replaceAll(/\s+/g, " ").trim())
        .filter(Boolean)
        .join(" "),
    );
    slides.push({ frames, text, title });
  }
  await page.close();
  if (slides.length === 0) {
    throw deckMissing(deckUrl);
  }
  return slides;
};
