// Browser evidence for the current commit. Run after npm run build.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const out = "out/slide-review";
const origin = "http://127.0.0.1:3020";
const root = `${origin}/ai-workflow`;
// One `slug: "…"` per slide in lib/slides.ts, so the count never drifts.
const TOTAL_SLIDES = (readFileSync("lib/slides.ts", "utf-8").match(/\bslug: "/g) ?? []).length;
const SETTLE_MS = 1600;
const issues = [];
const results = [];
await mkdir(out, { recursive: true });
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3020"],
  { stdio: "inherit" },
);
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(root);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* The local server is still starting. */
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
  }
  if (!ready) {
    throw new Error("Local deck did not start");
  }
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("pageerror", (error) => issues.push({ kind: "pageerror", message: error.message }));
  for (let slide = 1; slide <= TOTAL_SLIDES; slide += 1) {
    const response = await page.goto(`${root}/${slide}`);
    if (!response?.ok()) {
      throw new Error(`Slide ${slide} returned ${response?.status()}`);
    }
    await page.evaluate(async () => {
      document.documentElement.dataset.presenting = "";
      await document.fonts.ready;
    });
    // Every entrance lands within about 1.2s; wait it out with some margin.
    await page.waitForTimeout(SETTLE_MS);
    const id = String(slide).padStart(2, "0");
    await page.screenshot({ path: `${out}/slide-${id}-initial.png` });
    // Fire each pending step the way the deck's `revealNext` does. A slide
    // with several steps stacks their overlays, so a pointer click on the
    // first one is intercepted by the one above it.
    while (await page.locator("[data-reveal]").count()) {
      await page.locator("[data-reveal]").first().dispatchEvent("click");
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(SETTLE_MS);
    const result = await page.evaluate(() => {
      const stage = document.querySelector(".slide");
      if (!stage) {
        throw new Error("Missing slide stage");
      }
      const bounds = stage.getBoundingClientRect();
      const overflow = [...stage.querySelectorAll("h1,h2,p,li,svg")]
        .filter((node) => {
          const rect = node.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            (rect.left < bounds.left - 2 ||
              rect.right > bounds.right + 2 ||
              rect.top < bounds.top - 2 ||
              rect.bottom > bounds.bottom + 2)
          );
        })
        .map((node) => ({ tag: node.tagName, text: node.textContent?.slice(0, 150) }));
      return { heading: stage.querySelector("h1,h2")?.textContent, overflow };
    });
    results.push({ slide, ...result });
    if (result.overflow.length) {
      issues.push({ kind: "overflow", slide, elements: result.overflow });
    }
    await page.screenshot({ path: `${out}/slide-${id}-built.png` });
  }
  const notes = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  notes.on("pageerror", (error) =>
    issues.push({ kind: "notes-pageerror", message: error.message }),
  );
  const notesResponse = await notes.goto(`${root}/notes#1`);
  if (!notesResponse?.ok()) {
    throw new Error(`Notes returned ${notesResponse?.status()}`);
  }
  for (let slide = 1; slide <= TOTAL_SLIDES; slide += 1) {
    if (slide > 1) {
      await notes.getByRole("button", { name: "Next slide", exact: true }).click();
    }
    await notes.getByText(`Slide ${slide} / ${TOTAL_SLIDES}`, { exact: true }).waitFor();
    await notes.screenshot({
      path: `${out}/notes-${String(slide).padStart(2, "0")}.png`,
      fullPage: true,
    });
  }
  await writeFile(
    `${out}/report.json`,
    JSON.stringify({ commit: process.env.GITHUB_SHA ?? null, results, issues }, null, 2),
  );
  if (issues.length) {
    throw new Error(`${issues.length} browser verification issues; inspect report.json`);
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
