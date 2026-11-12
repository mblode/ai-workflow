import { PresenterView } from "deck-presenter";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BASE_PATH } from "@/lib/site-url";
import { SLIDES } from "@/lib/slides";
import { getSpeakerNotes, NOTES_ENABLED } from "@/lib/speaker-notes";

// Slide 1 is the deck root. An iframe needs the basePath the router would add.
const PRESENTER_SLIDES = SLIDES.map(({ title }, index) => ({
  title,
  url: `${BASE_PATH}${index === 0 ? "" : `/${index + 1}`}`,
}));

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Speaker notes",
};

export default async function PresenterPage() {
  if (!NOTES_ENABLED) {
    notFound();
  }
  return <PresenterView notes={await getSpeakerNotes()} slides={PRESENTER_SLIDES} />;
}
