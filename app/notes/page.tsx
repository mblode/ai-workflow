import { MobileNotes } from "deck-presenter";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SLIDES } from "@/lib/slides";
import { getSpeakerNotes, NOTES_ENABLED } from "@/lib/speaker-notes";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Speaker notes",
};

export default async function NotesPage() {
  if (!NOTES_ENABLED) {
    notFound();
  }
  return <MobileNotes notes={await getSpeakerNotes()} titles={SLIDES.map(({ title }) => title)} />;
}
