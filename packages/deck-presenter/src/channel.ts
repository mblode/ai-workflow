import type { DeckCommand } from "./keys";

/** Same-origin channel between the deck window and the presenter window. */
export const DECK_CHANNEL = "deck-presenter";

/** A screen blanked to black or white, as B and W do in Keynote. */
export type DeckBlank = "black" | "white" | null;

export type DeckMessage =
  | { type: "state"; slide: number; pending: number; blank: DeckBlank }
  | { type: "command"; command: DeckCommand }
  | { type: "hello" };
