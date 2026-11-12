/**
 * The notes for each slide, by slide index, from one markdown doc. A slide's
 * section runs from its `## N.` heading to its `Flags:` line: flags are for
 * editing, not the stage.
 */
export function parseSpeakerNotes(markdown: string, totalSlides: number): string[][] {
  const notes: string[][] = Array.from({ length: totalSlides }, () => []);
  let current: string[] | undefined;

  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      // "## 4. Title" parses to 4; the trailing non-slide sections parse to NaN.
      current = notes[Number.parseInt(line.slice(3), 10) - 1];
    } else if (line === "Flags:") {
      current = undefined;
    } else if (line.trim()) {
      current?.push(line);
    }
  }

  return notes;
}
