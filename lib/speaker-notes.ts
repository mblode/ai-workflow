import { parseSpeakerNotes } from "deck-presenter";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TOTAL_SLIDES } from "@/lib/slides";

const NOTES_PATH = path.join(process.cwd(), "docs/ai-workflow-speaker-notes.md");

/**
 * Served everywhere, production included, so the phone view works on stage.
 * The pages are noindex, and anything under a `Flags:` line never ships.
 */
export const NOTES_ENABLED = true;

/**
 * The beats for each slide, by slide index. Cached so the notes file is read
 * at build time and /notes and /presenter prerender into the static shell.
 */
export async function getSpeakerNotes(): Promise<string[][]> {
  "use cache";
  return parseSpeakerNotes(await readFile(NOTES_PATH, "utf-8"), TOTAL_SLIDES);
}
