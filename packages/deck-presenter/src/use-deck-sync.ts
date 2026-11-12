"use client";

import { useEffect } from "react";
import { DECK_CHANNEL } from "./channel";
import type { DeckBlank, DeckMessage } from "./channel";
import type { DeckCommand } from "./keys";
import { PENDING_REVEAL, revealNext } from "./reveal";

const MIRROR_DELAY_MS = 50;

const pendingReveals = () => document.querySelectorAll(PENDING_REVEAL).length;

// Reveals only ever go forward, so catching up is clicking until the counts match.
const mirrorReveals = (pending: number) => {
  if (pendingReveals() <= pending) {
    return;
  }
  revealNext();
  setTimeout(() => mirrorReveals(pending), MIRROR_DELAY_MS);
};

/**
 * The deck window owns the state: it takes commands from the presenter window
 * and reports its slide, pending reveals and blanked screen back. A deck inside an iframe is a
 * presenter preview, so it only listens and mirrors the reveals.
 */
export function useDeckSync(
  currentSlide: number,
  run: (command: DeckCommand) => void,
  blank: DeckBlank = null,
) {
  useEffect(() => {
    const isPreview = window.self !== window.top;
    const channel = new BroadcastChannel(DECK_CHANNEL);
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel takes no targetOrigin
    const post = (message: DeckMessage) => channel.postMessage(message);
    const postState = () =>
      post({ blank, pending: pendingReveals(), slide: currentSlide, type: "state" });

    channel.addEventListener("message", ({ data }: MessageEvent<DeckMessage>) => {
      if (isPreview) {
        if (data.type === "state" && data.slide === currentSlide) {
          mirrorReveals(data.pending);
        }
        return;
      }
      if (data.type === "command") {
        run(data.command);
      } else if (data.type === "hello") {
        postState();
      }
    });

    if (isPreview) {
      post({ type: "hello" });
      return () => channel.close();
    }

    // A reveal can come from a click, Space or the clicker, so watch the DOM.
    const observer = new MutationObserver(postState);
    observer.observe(document.body, { childList: true, subtree: true });
    postState();

    return () => {
      observer.disconnect();
      channel.close();
    };
  }, [blank, currentSlide, run]);
}
