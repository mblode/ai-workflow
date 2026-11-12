import { Reveal } from "deck-presenter";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { ACCENT } from "@/components/slides/accent";
import { FlowChain } from "@/components/slides/flow-chain";
import type { FlowStep } from "@/components/slides/flow-chain";
import { Display } from "@/components/slides/primitives/display";
import { Mark } from "@/components/slides/primitives/mark";
import { Frame } from "@/components/slides/primitives/layouts";
import { Enter } from "@/components/slides/primitives/motion";
import { QRCode } from "@/components/slides/qr-code";
import { SlideContainer } from "@/components/slides/slide-container";
import type { Pose } from "@/lib/motion";
import { cn } from "@/lib/utils";
import profile from "@/public/images/profile.jpg";

// Where each slide came from is in docs/ai-workflow-spine.md. Slide order
// lives in lib/slides.ts, so the comments here name slides, not numbers.
// Usage numbers are from local Claude Code and Codex history, 14 October to
// 13 November 2026, and are approximate.

const SKILLS_URL = "https://github.com/mblode/agent-skills";

const LIFT: Pose = { opacity: 0, y: "0.25em" };
const RADIUS = "rounded-[calc(var(--stage-w,100vw)*0.008)]";
const PANEL = "border border-[var(--hairline)] bg-[#1a1817]";

/** One supporting line under a headline. */
function Line({
  children,
  className,
  delay = 0.6,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Enter
      as="p"
      className={cn("max-w-[34ch] text-[var(--fg-soft)] leading-[1.3] slide-text-4xl", className)}
      delay={delay}
      from={LIFT}
    >
      {children}
    </Enter>
  );
}

/** A short list that arrives one line at a time. */
function List({ items, delay = 0.6 }: { items: readonly string[]; delay?: number }) {
  return (
    <ul className="flex flex-col gap-[var(--slide-space-5)]">
      {items.map((item, index) => (
        <Enter
          as="li"
          className="flex gap-[0.6em] leading-[1.25] slide-text-3xl"
          delay={delay + index * 0.25}
          from={LIFT}
          key={item}
        >
          <span
            aria-hidden="true"
            className="mt-[0.5em] size-[0.3em] shrink-0 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />
          <span>{item}</span>
        </Enter>
      ))}
    </ul>
  );
}

/** Name over a line, in a row of columns split by hairlines. */
function Cells({
  items,
  columns = 3,
  delay = 0.6,
}: {
  items: readonly { name: string; body: string }[];
  columns?: 2 | 3 | 4;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-[var(--slide-space-8)] gap-y-[var(--slide-space-8)]",
        { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[columns],
      )}
    >
      {items.map((item, index) => (
        <Enter
          as="div"
          className="flex flex-col gap-[var(--slide-space-3)] border-t border-[var(--hairline)] pt-[var(--slide-space-4)]"
          delay={delay + index * 0.15}
          from={LIFT}
          key={item.name}
        >
          <p className="font-heading font-semibold leading-[1.1] slide-text-4xl">{item.name}</p>
          <p className="leading-[1.3] text-[var(--fg-soft)] slide-text-2xl">{item.body}</p>
        </Enter>
      ))}
    </div>
  );
}

/** A terminal-like panel of mono lines. */
function Terminal({
  lines,
  className,
  delay = 0.6,
}: {
  lines: readonly { key: string; content: ReactNode }[];
  className?: string;
  delay?: number;
}) {
  return (
    <Enter
      as="div"
      className={cn(
        "flex flex-col gap-[var(--slide-space-3)] p-[var(--slide-space-8)] font-mono slide-text-2xl",
        PANEL,
        RADIUS,
        className,
      )}
      delay={delay}
      from={LIFT}
    >
      {lines.map((line) => (
        <p key={line.key}>{line.content}</p>
      ))}
    </Enter>
  );
}

/** Headshot and name. */
function Byline() {
  return (
    <div className="flex items-center gap-[var(--slide-space-4)]">
      <Image
        alt="Matthew Blode"
        className="size-[calc(var(--stage-w,100vw)*0.045)] rounded-full"
        src={profile}
      />
      <p className="text-[var(--fg-soft)] slide-text-3xl">Matthew Blode</p>
    </div>
  );
}

/** A QR code on a light tile, with its address under it. */
function QrBlock({ data, label, size = 0.07 }: { data: string; label: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-[var(--slide-space-2)]">
      <div
        aria-label={`QR code linking to ${label}`}
        className="rounded-[calc(var(--stage-w,100vw)*0.005)] bg-[#f6ebd9] p-[var(--slide-space-3)]"
        role="img"
        style={{ "--qr": size } as CSSProperties}
      >
        <QRCode
          className="size-[calc(var(--stage-w,100vw)*var(--qr))]"
          data={data}
          foregroundColor="#211f1e"
        />
      </div>
      <p className="whitespace-nowrap font-mono slide-text-2xl">{label}</p>
    </div>
  );
}

/** A small QR code in the bottom-right corner. */
function QrCorner({ data, label }: { data: string; label: string }) {
  return (
    <Enter
      as="div"
      className="absolute right-[var(--slide-space-12)] bottom-[var(--slide-space-10)]"
      delay={1}
      from={LIFT}
    >
      <QrBlock data={data} label={label} />
    </Enter>
  );
}

/** A big accent number over its label. */
function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <Enter
      as="div"
      className="flex flex-col gap-[var(--slide-space-2)] border-t border-[var(--hairline)] pt-[var(--slide-space-4)]"
      delay={delay}
      from={LIFT}
    >
      <p
        className="font-heading font-semibold leading-none tracking-[-0.03em] slide-text-7xl"
        style={{ color: ACCENT }}
      >
        {value}
      </p>
      <p className="leading-[1.25] text-[var(--fg-soft)] slide-text-2xl">{label}</p>
    </Enter>
  );
}

export function SlideIntro() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <Display className="max-w-[14ch]" size="huge">
          How I use AI
        </Display>
        <Line className="max-w-none" delay={0.5}>
          How I go from an idea to shipped code with AI agents. No experience needed.
        </Line>
        <Enter as="div" delay={0.8} from={LIFT}>
          <Byline />
        </Enter>
      </Frame>
    </SlideContainer>
  );
}

// The May talk is blode.co/ai-usage (Unblocking Yourself with AI, 14 May 2026).
export function SlideSinceMay() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">Since May</Display>
          <Line className="max-w-[40ch] slide-text-3xl" delay={0.4}>
            In May I ran one prompt in twenty terminal tabs. Now I use three saved prompts, and
            agents that carry each change all the way to merge.
          </Line>
        </div>
        <div className="grid grid-cols-3 gap-[var(--slide-space-8)]">
          <Stat delay={0.8} label="chats with Claude Code in 30 days" value="1,694" />
          <Stat delay={1} label="messages I typed to agents" value="17.5k" />
          <Stat
            delay={1.2}
            label="of my chats were Claude Code. Codex mostly reviews."
            value="92%"
          />
        </div>
      </Frame>
    </SlideContainer>
  );
}

// From blode.co/uses (editor and terminal, hardware, apps and glue).
const SETUP = [
  {
    name: "Claude Code",
    body: "An AI agent in the terminal. It reads code, runs commands and makes changes.",
  },
  { name: "Codex", body: "OpenAI’s agent. I mostly use it to review pull requests." },
  { name: "cmux", body: "A terminal app with a tab per agent. It pings me when one needs me." },
  { name: "captain", body: "My tool: one chat that hands tasks out to many agents." },
  { name: "Raycast", body: "Text snippets: three letters expand into a full prompt." },
  { name: "Skills", body: "Saved checklists an agent reads before a kind of job." },
] as const;

export function SlideSetup() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-12)]">
        <Display size="2xl">My setup</Display>
        <Cells items={SETUP} />
      </Frame>
    </SlideContainer>
  );
}

// ~/dotfiles aliases.zsh, and the hooks in ~/.claude/settings.json.
export function SlideYolo() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <Display className="max-w-[18ch]" size="xl">
          Let it work. Guard the edges.
        </Display>
        <Terminal
          className="w-fit"
          delay={0.5}
          lines={[
            {
              key: "a",
              content: (
                <span>
                  <span className="text-[var(--fg-soft)]">alias </span>cc=
                  <span style={{ color: ACCENT }}>{`"claude --dangerously-skip-permissions"`}</span>
                </span>
              ),
            },
          ]}
        />
        <List
          delay={0.9}
          items={[
            "This flag stops Claude asking before every command",
            "Each change happens in its own copy of the repo",
            "Automated checks and a reviewer must pass before anything merges",
          ]}
        />
        <Line className="max-w-none slide-text-2xl" delay={1.8}>
          New to agents? Keep approvals on until these guardrails exist, and follow your security
          policy.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

// Raycast snippets. Session counts are approximate, last 30 days.
const SNIPPETS = [
  {
    key: "zcc",
    job: "Plan",
    use: "about 50 chats",
    text: "Do extensive research then make an executable plan with checkable tasks, acceptance criteria, dependencies and verification commands.",
  },
  {
    key: "zep",
    job: "Build",
    use: "about 130 chats",
    text: "Execute the agreed plan with parallel subagents on independent tasks. Keep a visible checklist and tick tasks off only with evidence.",
  },
  {
    key: "zgp",
    job: "Ship",
    use: "about 70 chats",
    text: "/tidy and Git commit all changes and push all changes and /pr‑creator and /pr‑babysitter",
  },
] as const;

export function SlideSnippets() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">Three keystrokes</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.3}>
            A snippet turns three letters into a whole prompt. One to plan, one to build, one to
            ship.
          </Line>
        </div>
        <div className="grid grid-cols-3 gap-[var(--slide-space-6)]">
          {SNIPPETS.map((snippet, index) => (
            <Enter
              as="div"
              className={cn(
                "flex flex-col gap-[var(--slide-space-4)] p-[var(--slide-space-6)]",
                PANEL,
                RADIUS,
              )}
              delay={0.5 + index * 0.3}
              from={LIFT}
              key={snippet.key}
            >
              <p className="flex items-baseline justify-between gap-[var(--slide-space-3)]">
                <span className="flex items-baseline gap-[var(--slide-space-3)]">
                  <span
                    className="font-mono font-semibold slide-text-4xl"
                    style={{ color: ACCENT }}
                  >
                    {snippet.key}
                  </span>
                  <span className="font-heading font-semibold slide-text-3xl">{snippet.job}</span>
                </span>
                <span className="text-[var(--fg-soft)] slide-text-xl">{snippet.use}</span>
              </p>
              <p className="font-mono leading-[1.4] slide-text-xl">{snippet.text}</p>
            </Enter>
          ))}
        </div>
      </Frame>
    </SlideContainer>
  );
}

const FLOW: readonly FlowStep[] = [
  { name: "Plan", detail: "The agent reads the code and writes a plan" },
  { name: "Review the plan", detail: "I answer its questions and cut scope" },
  { name: "Build", detail: "Several agents write the code at once" },
  { name: "Clean up", detail: "/tidy reviews its own change" },
  { name: "Open a pull request", detail: "/pr-creator writes it up" },
  { name: "AI review", detail: "Codex checks it on GitHub" },
  { name: "Fix until green", detail: "/pr-babysitter handles checks and comments" },
  { name: "Merged and live", detail: "Checked in production" },
];

// One click per step. Model choice sits under the chain.
export function SlideFlow() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-12)]">
        <div className="flex flex-col gap-[var(--slide-space-3)]">
          <Mark>The flow</Mark>
          <Display size="xl">A new feature, start to finish</Display>
        </div>
        <FlowChain steps={FLOW} />
      </Frame>
    </SlideContainer>
  );
}

// The planning skill, and the zcc snippet's own checklist.
export function SlidePlan() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">Think really hard once</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.4}>
            A good plan is a checklist an agent can finish without me.
          </Line>
        </div>
        <List
          delay={0.8}
          items={[
            "Small tasks you can tick off",
            "What “done” looks like for each one",
            "Which tasks depend on others, so the rest run at the same time",
            "The command that proves it works",
            "What’s known, kept apart from guesses",
          ]}
        />
      </Frame>
    </SlideContainer>
  );
}

// Session counts by the model that answered most, last 30 days.
const MODELS = [
  { model: "Opus 5.5", effort: "medium effort", job: "My default for almost everything." },
  {
    model: "Fable 5.2",
    effort: "Claude Ultra plan",
    job: "The hardest problems: design, tricky bugs.",
  },
  { model: "Haiku 5.5", effort: "low effort", job: "Quick, cheap searches across many files." },
  { model: "Codex", effort: "high effort", job: "Reviews every pull request." },
] as const;

export function SlideModels() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <Display size="xl">Pick the model, then the effort</Display>
        <div className="flex flex-col">
          {MODELS.map((row, index) => (
            <Enter
              as="div"
              className="grid grid-cols-[1.1fr_1fr_2.4fr] items-baseline gap-[var(--slide-space-6)] border-t border-[var(--hairline)] py-[var(--slide-space-4)]"
              delay={0.5 + index * 0.2}
              from={LIFT}
              key={row.model}
            >
              <p className="font-heading font-semibold slide-text-4xl">{row.model}</p>
              <p className="font-mono slide-text-2xl" style={{ color: ACCENT }}>
                {row.effort}
              </p>
              <p className="text-[var(--fg-soft)] slide-text-2xl">{row.job}</p>
            </Enter>
          ))}
        </div>
        <Line className="max-w-none slide-text-2xl" delay={1.5}>
          Effort is how long it thinks before it answers. More effort: slower, smarter, costlier.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

const FLEET = [
  {
    name: "Worktrees",
    body: "A separate copy of the repo for each change, so agents never trip over each other.",
  },
  { name: "cmux", body: "A tab per agent. It pings me when one is stuck or done." },
  {
    name: "captain",
    body: "I give it a list. It starts an agent per task and only brings back decisions.",
  },
] as const;

// The captain run: one monorepo move, 2 to 3 November 2026.
export function SlideParallel() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-12)]">
        <Display size="2xl">One chat runs the fleet</Display>
        <Cells items={FLEET} />
        <Line className="max-w-none slide-text-3xl" delay={1.2}>
          One big move this month: 11 agents, about 42 pull requests.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

// A Codex P1 on a Bun migration PR, 29 October 2026. About 60 P1 flags in 30 days.
export function SlideReview() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">Agents review agents</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.3}>
            A second AI model reads every pull request before it merges.
          </Line>
        </div>
        <Enter
          as="div"
          className={cn(
            "flex w-[78%] flex-col gap-[var(--slide-space-4)] p-[var(--slide-space-8)]",
            PANEL,
            RADIUS,
          )}
          delay={0.5}
          from={LIFT}
        >
          <p className="flex items-center gap-[var(--slide-space-3)] font-mono slide-text-xl">
            <span
              className="rounded-[0.3em] px-[0.5em] py-[0.1em] text-[#211f1e]"
              style={{ backgroundColor: ACCENT }}
            >
              P1: must fix
            </span>
            <span className="text-[var(--fg-soft)]">chatgpt-codex-connector</span>
          </p>
          <p className="font-heading font-semibold leading-[1.15] slide-text-4xl">
            Keep the database library pinned to the right version
          </p>
          <p className="leading-[1.35] text-[var(--fg-soft)] slide-text-2xl">
            An upgrade quietly dropped the pin, so the app would have run an older version.
          </p>
        </Enter>
        <Reveal>
          <Line className="max-w-none text-[var(--fg)] slide-text-4xl" delay={0}>
            The agent fixed it, Codex re-reviewed it, then it merged.
          </Line>
        </Reveal>
      </Frame>
    </SlideContainer>
  );
}

// The task rubric and fresh-context verifier in my company's factory repo.
export function SlideRubric() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">Write down done first</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.4}>
            Before an agent starts, it gets a checklist of what finished looks like.
          </Line>
        </div>
        <List
          delay={0.8}
          items={[
            "The agent doing the work can’t edit the checklist",
            "A fresh agent that never saw the work grades it",
            "Every tick needs proof: a line of code or a command’s output",
          ]}
        />
        <Reveal>
          <Line className="max-w-none text-[var(--fg)] slide-text-4xl" delay={0}>
            Of 23 graded tasks, 10 failed. A grader that never says no isn’t checking.
          </Line>
        </Reveal>
      </Frame>
    </SlideContainer>
  );
}

// The pr-babysitter skill.
export function SlideBabysit() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">Open isn’t done</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.4}>
            A pull request isn’t finished until it merges. /pr-babysitter watches it and:
          </Line>
        </div>
        <List
          delay={0.8}
          items={[
            "Fixes failing automated checks (CI)",
            "Updates it when the main branch has moved on",
            "Replies to every review comment",
            "Re-runs flaky checks instead of changing code",
          ]}
        />
      </Frame>
    </SlideContainer>
  );
}

// lefthook.yml and CI in donebear and this repo.
export function SlideGates() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">The checks catch broken code</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.3}>
            Automatic checks that run before any code can land.
          </Line>
        </div>
        <Terminal
          className="w-[80%]"
          delay={0.5}
          lines={[
            {
              key: "commit",
              content: (
                <span>
                  <span style={{ color: ACCENT }}>on commit</span> format (oxfmt) and lint (oxlint)
                  the changed files
                </span>
              ),
            },
            {
              key: "push",
              content: (
                <span>
                  <span style={{ color: ACCENT }}>on push</span> run the same checks as CI
                </span>
              ),
            },
            {
              key: "ci",
              content: (
                <span>
                  <span style={{ color: ACCENT }}>in CI</span> lint, format, types, build
                </span>
              ),
            },
            {
              key: "tests",
              content: (
                <span>
                  <span style={{ color: ACCENT }}>tests</span> once, right before the push
                </span>
              ),
            },
          ]}
        />
        <Line className="max-w-none slide-text-3xl" delay={1.2}>
          Checks catch broken code, not too much code. /tidy handles that.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

const REPO = [
  { name: "Monorepo", body: "Every app in one repo, sharing the same config." },
  { name: "AGENTS.md", body: "A README for agents: commands, layout and rules." },
  { name: "README", body: "What it is and how to run it, for people." },
  { name: "Skills", body: "Checklists the agent loads for one kind of job." },
] as const;

export function SlideRepo() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-12)]">
        <Display className="max-w-[16ch]" size="2xl">
          Write the repo for the agent
        </Display>
        <Line className="max-w-none slide-text-3xl" delay={0.3}>
          Agents start every task with no memory. The repo has to explain itself.
        </Line>
        <Cells columns={4} delay={0.7} items={REPO} />
      </Frame>
    </SlideContainer>
  );
}

// The minimal-code ladder from my global CLAUDE.md.
const LADDER = [
  "Does this need to exist at all?",
  "Already in the codebase? Reuse it.",
  "Does the standard library do it?",
  "Does the platform do it?",
  "Does an installed dependency do it?",
  "One line? One line.",
  "Only then, the least code that works.",
] as const;

export function SlideLadder() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-8)]">
        <Display size="2xl">Lazy, not negligent</Display>
        <ol className="flex flex-col gap-[var(--slide-space-3)]">
          {LADDER.map((rung, index) => (
            <Enter
              as="li"
              className="grid grid-cols-[1.6em_1fr] leading-[1.2] slide-text-3xl"
              delay={0.5 + index * 0.15}
              from={LIFT}
              key={rung}
            >
              <span className="font-mono text-[var(--fg-soft)]">{index + 1}</span>
              <span style={{ color: index === LADDER.length - 1 ? ACCENT : undefined }}>
                {rung}
              </span>
            </Enter>
          ))}
        </ol>
        <Line className="max-w-none slide-text-2xl" delay={1.8}>
          Never cut input checks, error handling, security or accessibility.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

// From the matt-mode skill (agent-skills-private, branch matt-mode).
const MATT_MODE = [
  { said: "“Done means live.”", means: "Merged, deployed and checked where people use it." },
  { said: "“You decide.”", means: "Make the call, do everything high value, say what you chose." },
  { said: "“Bypass.”", means: "Skip the merge checks. Only ever when I say that word." },
] as const;

export function SlideMattMode() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="xl">Write your working style down</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.4}>
            matt-mode is a skill that tells agents how I like to work.
          </Line>
        </div>
        <div className="flex flex-col">
          {MATT_MODE.map((row, index) => (
            <Enter
              as="div"
              className="grid grid-cols-[1fr_2.2fr] items-baseline gap-[var(--slide-space-6)] border-t border-[var(--hairline)] py-[var(--slide-space-4)]"
              delay={0.8 + index * 0.2}
              from={LIFT}
              key={row.said}
            >
              <p className="font-heading font-semibold slide-text-4xl" style={{ color: ACCENT }}>
                {row.said}
              </p>
              <p className="text-[var(--fg-soft)] slide-text-2xl">{row.means}</p>
            </Enter>
          ))}
        </div>
      </Frame>
    </SlideContainer>
  );
}

// Skill tool calls in the last 30 days, from ~/.claude history.
const TOP_SKILLS = [
  { name: "tidy", does: "reviews and cleans up a change", uses: 327 },
  { name: "pr-creator", does: "writes the pull request", uses: 201 },
  { name: "pr-babysitter", does: "gets it to merge", uses: 188 },
  { name: "planning", does: "writes the plan", uses: 93 },
  { name: "ui-design", does: "builds and checks UI", uses: 90 },
  { name: "codebase-architecture", does: "shapes code agents can work in", uses: 75 },
] as const;

export function SlideSkills() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-8)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">My agent skills</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.3}>
            The ones I use most, and how often in the last 30 days.
          </Line>
        </div>
        <Terminal
          className="w-fit"
          delay={0.4}
          lines={[
            {
              key: "install",
              content: "npx skills add mblode/agent-skills -g --agent codex claude-code",
            },
          ]}
        />
        <div className="flex w-[70%] flex-col gap-[var(--slide-space-3)]">
          {TOP_SKILLS.map((skill, index) => (
            <Enter
              as="div"
              className="grid grid-cols-[14em_1fr_3em] items-baseline gap-[var(--slide-space-4)] slide-text-2xl"
              delay={0.8 + index * 0.12}
              from={LIFT}
              key={skill.name}
            >
              <span className="whitespace-nowrap font-mono">{skill.name}</span>
              <span className="text-[var(--fg-soft)]">{skill.does}</span>
              <span className="text-right tabular-nums" style={{ color: ACCENT }}>
                {skill.uses}
              </span>
            </Enter>
          ))}
        </div>
        <QrCorner data={SKILLS_URL} label="github.com/mblode/agent-skills" />
      </Frame>
    </SlideContainer>
  );
}

// The chat-history skill. Every number in this deck came from it.
export function SlideHistory() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-8)]">
        <Display className="max-w-[16ch]" size="2xl">
          Your chat history is a database
        </Display>
        <Line className="max-w-[40ch] slide-text-3xl" delay={0.5}>
          Every chat with an agent is saved on your machine. /chat-history searches them when you
          think, “we fixed this before”.
        </Line>
        <Reveal>
          <Line className="max-w-none text-[var(--fg)] slide-text-4xl" delay={0}>
            Every number in this talk came from it.
          </Line>
        </Reveal>
      </Frame>
    </SlideContainer>
  );
}

export function SlideClose() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <Display size="2xl">Try one thing tomorrow</Display>
        <div className="flex items-end justify-between gap-[var(--slide-space-10)]">
          <List
            delay={0.5}
            items={[
              "Save your best prompt as a snippet",
              "Ask for a plan before any code",
              "Let an agent see one pull request through to merge",
            ]}
          />
          <Enter as="div" delay={1.2} from={LIFT}>
            <QrBlock data={SKILLS_URL} label="github.com/mblode/agent-skills" size={0.11} />
          </Enter>
        </div>
        <Enter as="div" delay={1.4} from={LIFT}>
          <Byline />
        </Enter>
      </Frame>
    </SlideContainer>
  );
}
