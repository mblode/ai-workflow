/** Everything a key or a clicker can ask the deck to do. */
type KeyCommand =
  | "next"
  | "prev"
  | "first"
  | "last"
  | "black"
  | "white"
  | "fullscreen"
  | "presenter";

export type DeckCommand = { type: KeyCommand } | { type: "goto"; slide: number };

/**
 * Keynote, PowerPoint and Google Slides agree on these, and they cover what
 * clickers send: Page Up/Down for the arrows, F5 or Shift+F5 for the slideshow
 * button, and "." or B for the blank button.
 */
const KEY_COMMANDS: Record<string, KeyCommand> = {
  " ": "next",
  ",": "white",
  ".": "black",
  ArrowDown: "next",
  ArrowLeft: "prev",
  ArrowRight: "next",
  ArrowUp: "prev",
  Backspace: "prev",
  End: "last",
  Enter: "next",
  F5: "fullscreen",
  Home: "first",
  PageDown: "next",
  PageUp: "prev",
  b: "black",
  f: "fullscreen",
  n: "next",
  p: "presenter",
  w: "white",
};

const DIGIT = /^\d$/;
// A typed slide number is forgotten if Enter doesn't follow within this.
const JUMP_TIMEOUT_MS = 2000;
const TEXT_INPUTS = new Set(["email", "number", "password", "search", "tel", "text", "url"]);

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLInputElement && TEXT_INPUTS.has(target.type)) ||
  (target instanceof HTMLElement && target.isContentEditable);

// A focused button keeps Space and Enter for itself, so a mouse user can still
// press it from the keyboard.
const isButtonActivation = (event: KeyboardEvent) =>
  (event.key === " " || event.key === "Enter") && event.target instanceof HTMLButtonElement;

/**
 * Returns a reader that turns keydowns into deck commands. It holds typed
 * digits, so "1", "2", Enter jumps to slide 12, as in Keynote.
 */
export function createKeyReader() {
  let typed = "";
  let typedAt = 0;

  return (event: KeyboardEvent): DeckCommand | undefined => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) {
      return;
    }
    if (isTyping(event.target) || isButtonActivation(event)) {
      return;
    }

    const now = Date.now();
    if (now - typedAt > JUMP_TIMEOUT_MS) {
      typed = "";
    }
    if (DIGIT.test(event.key)) {
      typed += event.key;
      typedAt = now;
      return;
    }
    if (event.key === "Enter" && typed) {
      const slide = Number(typed);
      typed = "";
      return { slide, type: "goto" };
    }

    const type = KEY_COMMANDS[event.key] ?? KEY_COMMANDS[event.key.toLowerCase()];
    return type ? { type } : undefined;
  };
}
