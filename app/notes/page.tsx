import { MobileNotes } from "deck-presenter";
import type { Metadata } from "next";
import { SLIDES } from "@/lib/slides";
import { getSpeakerNotes } from "@/lib/speaker-notes";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Speaker notes",
};

export default async function NotesPage() {
  return <MobileNotes notes={await getSpeakerNotes()} titles={SLIDES.map(({ title }) => title)} />;
}
