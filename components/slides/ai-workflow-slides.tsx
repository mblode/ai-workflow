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
const USES_URL = "https://blode.co/uses";

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
      <p className="font-mono slide-text-2xl">{label}</p>
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
          Tools, prompts and the flow from idea to merged PR.
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
            In May it was one prompt and twenty cmux tabs. Now it’s three snippets, a fleet, and
            agents that see the PR through to merge.
          </Line>
        </div>
        <div className="grid grid-cols-3 gap-[var(--slide-space-8)]">
          <Stat delay={0.8} label="Claude Code sessions in 30 days" value="1,694" />
          <Stat delay={1} label="prompts I typed" value="17.5k" />
          <Stat delay={1.2} label="Claude Code, with Codex as the reviewer" value="92%" />
        </div>
      </Frame>
    </SlideContainer>
  );
}

// From blode.co/uses (editor and terminal, hardware, apps and glue).
const SETUP = [
  { name: "Claude Code", body: "Plans, builds and reviews. Almost every session." },
  { name: "Codex", body: "Reviews every PR on GitHub." },
  { name: "cmux", body: "A terminal with a tab per agent, and a ping when one needs me." },
  { name: "captain", body: "One chat that hands work to the fleet." },
  { name: "Raycast", body: "Snippets for my three prompts." },
  { name: "iPhone", body: "Agents run on the Mac all day. I merge from my phone." },
] as const;

export function SlideSetup() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-12)]">
        <Display size="2xl">My setup</Display>
        <Cells items={SETUP} />
        <QrCorner data={USES_URL} label="blode.co/uses" />
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
          Skip the prompts. Guard the edges.
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
            "Every change gets its own worktree",
            "Hooks: tests only run right before git push",
            "CI and a reviewer gate every merge",
          ]}
        />
        <Line className="max-w-none slide-text-2xl" delay={1.8}>
          At work, follow the security policy first.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

// Raycast snippets. Session counts are approximate, last 30 days.
const SNIPPETS = [
  {
    key: "zcc",
    use: "about 50 sessions",
    text: "Do extensive research then make an executable plan with checkable tasks, acceptance criteria, dependencies and verification commands.",
  },
  {
    key: "zep",
    use: "about 130 sessions",
    text: "Execute the agreed plan with parallel subagents on independent tasks. Keep a visible checklist and tick tasks off only with evidence.",
  },
  {
    key: "zgp",
    use: "about 70 sessions",
    text: "/tidy and Git commit all changes and push all changes and /pr‑creator and /pr‑babysitter",
  },
] as const;

export function SlideSnippets() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <Display size="2xl">Three keystrokes</Display>
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
                <span className="font-mono font-semibold slide-text-4xl" style={{ color: ACCENT }}>
                  {snippet.key}
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
  { name: "Plan", detail: "/planning, /codebase‑architecture" },
  { name: "Update the plan", detail: "answer its questions, cut scope" },
  { name: "Execute", detail: "zep, parallel subagents" },
  { name: "Tidy", detail: "/tidy, oxfmt, oxlint" },
  { name: "Open the PR", detail: "/pr-creator" },
  { name: "Codex reviews", detail: "on GitHub" },
  { name: "Babysit", detail: "/pr-babysitter" },
  { name: "Merged and live", detail: "checked in prod" },
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
        <p className="text-[var(--fg-soft)] slide-text-2xl">
          Opus 5.5 on medium effort, or Fable 5.2 on Claude Ultra for the hard ones.
        </p>
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
            "Tasks you can tick off",
            "Acceptance criteria for each one",
            "Dependencies, so independent work runs in parallel",
            "The command that proves it’s done",
            "Facts kept apart from guesses and open decisions",
          ]}
        />
      </Frame>
    </SlideContainer>
  );
}

// Session counts by the model that answered most, last 30 days.
const MODELS = [
  { model: "Opus 5.5", effort: "medium", job: "The default. About 970 sessions." },
  { model: "Fable 5.2", effort: "Claude Ultra", job: "The hard ones: architecture, nasty bugs." },
  { model: "Haiku 5.5", effort: "low", job: "Sweeps and scans across many files." },
  { model: "Codex", effort: "high", job: "The reviewer on every PR." },
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
          I change /effort more often than I change /model.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

const FLEET = [
  { name: "Worktrees", body: "Every change gets its own copy of the repo, off the latest main." },
  { name: "cmux", body: "A tab per agent. It pings me when one is stuck or done." },
  { name: "captain", body: "Turns a list into workers. Only the decisions come back to me." },
] as const;

// The captain run: one monorepo move, 2 to 3 November 2026.
export function SlideParallel() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-12)]">
        <Display size="2xl">One chat runs the fleet</Display>
        <Cells items={FLEET} />
        <Line className="max-w-none slide-text-3xl" delay={1.2}>
          One monorepo move this month: 11 agents, about 42 PRs.
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
        <Display size="2xl">Agents review agents</Display>
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
              P1
            </span>
            <span className="text-[var(--fg-soft)]">chatgpt-codex-connector</span>
          </p>
          <p className="font-heading font-semibold leading-[1.15] slide-text-4xl">
            Keep the ORM version pin the migration dropped
          </p>
          <p className="leading-[1.35] text-[var(--fg-soft)] slide-text-2xl">
            The lockfile now resolves an older release candidate than the schema needs.
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

// The pr-babysitter skill.
export function SlideBabysit() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="2xl">Done means merged</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.4}>
            /pr-babysitter keeps going until the PR can merge.
          </Line>
        </div>
        <List
          delay={0.8}
          items={[
            "Fixes failing CI",
            "Resolves conflicts with main",
            "Answers every review thread",
            "Re-runs infra flakes instead of changing code",
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
        <Display size="2xl">The gates catch wrong code</Display>
        <Terminal
          className="w-[80%]"
          delay={0.5}
          lines={[
            {
              key: "commit",
              content: (
                <span>
                  <span style={{ color: ACCENT }}>pre-commit</span> oxfmt and oxlint --fix on staged
                  files
                </span>
              ),
            },
            {
              key: "push",
              content: (
                <span>
                  <span style={{ color: ACCENT }}>pre-push</span> the same gate as CI
                </span>
              ),
            },
            {
              key: "ci",
              content: (
                <span>
                  <span style={{ color: ACCENT }}>CI</span> lint, format, types, build
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
          They don’t catch too much code. That’s what /tidy is for.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

const REPO = [
  { name: "Monorepo", body: "One clone, every app, shared config with turborepo." },
  { name: "AGENTS.md", body: "Commands, layout and rules. The onboarding doc for agents." },
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
        <Cells columns={4} items={REPO} />
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
          YAGNI and DRY, written down so the agent follows them too.
        </Line>
      </Frame>
    </SlideContainer>
  );
}

// From the matt-mode skill (agent-skills-private, branch matt-mode).
const MATT_MODE = [
  { said: "“Done means live.”", means: "Merged, deployed and checked where people use it." },
  { said: "“You decide.”", means: "Make the call, do everything high value, say what you chose." },
  { said: "“Bypass.”", means: "Admin merge now. Never without that word." },
] as const;

export function SlideMattMode() {
  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-10)]">
        <div className="flex flex-col gap-[var(--slide-space-4)]">
          <Display size="xl">Write your working style down</Display>
          <Line className="max-w-none slide-text-3xl" delay={0.4}>
            matt-mode is a skill that explains how I like to work.
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
  { name: "tidy", uses: 327 },
  { name: "pr-creator", uses: 201 },
  { name: "pr-babysitter", uses: 188 },
  { name: "planning", uses: 93 },
  { name: "ui-design", uses: 90 },
  { name: "codebase-architecture", uses: 75 },
] as const;

export function SlideSkills() {
  const most = TOP_SKILLS[0].uses;

  return (
    <SlideContainer palette="e">
      <Frame className="justify-center gap-[var(--slide-space-8)]">
        <Display size="2xl">My agent skills</Display>
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
        <div className="flex w-[64%] flex-col gap-[var(--slide-space-3)]">
          {TOP_SKILLS.map((skill, index) => (
            <Enter
              as="div"
              className="grid grid-cols-[14em_1fr_3em] items-center gap-[var(--slide-space-4)] slide-text-2xl"
              delay={0.8 + index * 0.12}
              from={LIFT}
              key={skill.name}
            >
              <span className="whitespace-nowrap font-mono">{skill.name}</span>
              <span
                aria-hidden="true"
                className="h-[0.5em] rounded-full"
                style={{ backgroundColor: ACCENT, width: `${(skill.uses / most) * 100}%` }}
              />
              <span className="text-right tabular-nums text-[var(--fg-soft)]">{skill.uses}</span>
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
          “We fixed this before.” /chat-history searches every Claude Code and Codex session for the
          decision and what came after it.
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
              "Plan before you build",
              "Let an agent babysit one PR to merge",
            ]}
          />
          <Enter as="div" className="flex gap-[var(--slide-space-8)]" delay={1.2} from={LIFT}>
            <QrBlock data={SKILLS_URL} label="agent skills" />
            <QrBlock data={USES_URL} label="blode.co/uses" />
          </Enter>
        </div>
        <Enter as="div" delay={1.4} from={LIFT}>
          <Byline />
        </Enter>
      </Frame>
    </SlideContainer>
  );
}
