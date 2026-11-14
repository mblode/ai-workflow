export type Palette = "a" | "b" | "c" | "d" | "e";

// Sharing AI tools and workflow, Mark My Words, 13 November 2026: the real
// prompts, files and checks that take a ticket from plan to merged PR.
// Every slide sits on the one dark ground (e).
export const SLIDES = [
  { slug: "intro", title: "How I use AI", palette: "e" },
  { slug: "numbers", title: "30 days, by the numbers", palette: "e" },
  { slug: "setup", title: "My setup", palette: "e" },
  { slug: "yolo", title: "Let it work. Guard the edges.", palette: "e" },
  { slug: "snippets", title: "Three keystrokes", palette: "e" },
  { slug: "flow", title: "A new feature, start to finish", palette: "e" },
  { slug: "plan", title: "Think really hard once", palette: "e" },
  { slug: "models", title: "Pick the model, then the effort", palette: "e" },
  { slug: "parallel", title: "One chat runs the fleet", palette: "e" },
  { slug: "review", title: "Agents review agents", palette: "e" },
  { slug: "rubric", title: "Write down done first", palette: "e" },
  { slug: "babysit", title: "Open isn’t done", palette: "e" },
  { slug: "gates", title: "The checks catch broken code", palette: "e" },
  { slug: "prove", title: "Give the agent a way to prove it", palette: "e" },
  { slug: "repo", title: "Write the repo for the agent", palette: "e" },
  { slug: "ladder", title: "Lazy, not negligent", palette: "e" },
  { slug: "matt-mode", title: "Write your working style down", palette: "e" },
  { slug: "skills", title: "My agent skills", palette: "e" },
  { slug: "history", title: "Your chat history is a database", palette: "e" },
  { slug: "close", title: "Try one thing tomorrow", palette: "e" },
] as const satisfies readonly {
  slug: string;
  title: string;
  palette: Palette;
}[];

export const TOTAL_SLIDES = SLIDES.length;

export const DECK_TITLE = "How I use AI";

export const DECK_SUMMARY =
  "Matthew Blode's AI workflow, shown as the real prompts, files and checks: three snippets, plan to merged PR, parallel agents, and the gates that keep it safe.";
