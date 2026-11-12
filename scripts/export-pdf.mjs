// Exports the deck to a PDF, one fully built 1920x1080 page per slide: the
// backup for a venue laptop that can't run the app.
//
//   npm run build && npm start      # in one terminal
//   npm run export-pdf              # in another
//
// The deck root defaults to the production server `npm start` runs. Against
// `npm run dev`, which portless serves at https://ai-workflow.localhost,
// pass that root instead:
//
//   npm run export-pdf -- https://ai-workflow.localhost/ai-workflow
//
// DECK_URL sets the root the same way; the argument wins. OUT sets the PDF path.
// CHROME_PATH points at a Chrome or Chromium binary when the installed Google
// Chrome isn't the one to use.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { HEIGHT, WIDTH, captureDeck, deckUrlFromArgs, launchBrowser } from "./capture-deck.mjs";

const OUT = process.env.OUT ?? "out/ai-workflow.pdf";

const browser = await launchBrowser();

try {
  const slides = await captureDeck(browser, deckUrlFromArgs());
  const pages = slides
    .map(
      ({ frames }) =>
        `<img src="data:image/png;base64,${frames.at(-1).toString("base64")}" alt="">`,
    )
    .join("");
  const page = await browser.newPage();
  await page.setContent(
    `<style>@page{size:${WIDTH}px ${HEIGHT}px;margin:0}body{margin:0}img{display:block;width:${WIDTH}px;height:${HEIGHT}px;break-after:page}</style>${pages}`,
  );
  const pdf = await page.pdf({ height: `${HEIGHT}px`, printBackground: true, width: `${WIDTH}px` });
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, pdf);
  console.log(`${slides.length} slides → ${OUT}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
