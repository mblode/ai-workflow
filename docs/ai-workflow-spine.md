# How I use AI: spine and sources

**Event.** "Sharing AI tools and workflow", a 20-minute talk with no Q&A, on Microsoft Teams, Thursday 13 November 2026, 3:30pm AEDT. Booked by Tommy Ling. Served at <https://blode.co/ai-workflow>.

**Room.** The Mark My Words engineers: working developers who already use Claude Code or Codex. Feedback on the first draft (13 Nov) was that it was too general for developers and needed real examples, so the deck shows the real prompt, file or command on each slide and skips the definitions.

**One idea.** Let the agents run without asking, and put your judgement into the plan, the gates and the skills instead. Three keystrokes take a feature from plan to merged PR.

**Shape.** One flow (plan, execute, tidy, PR, review, babysit, merged), shown once on slide 6 with a click per step, then one slide for each part of it. Files shown on a slide are quoted from this repo or from the public agent-skills repo, never from a private one. Every story comes from my own projects (Done Bear, agent-skills, blode-co) or my company's monorepo, with no client names. Linktree repos count in the totals but are never named. Numbers are from my chat history over the last 30 days to 13 Nov 2026, and they are approximate.

## Where every slide came from

| Slide | Title | Source |
|---|---|---|
| 1 | How I use AI | This talk's title; layout from the you-have-taste intro slide (`origin/main` at `07f2916`) |
| 2 | 30 days, by the numbers | chat-history over 30 days: 1,694 Claude Code sessions, about 17.5k prompts, 147 Codex sessions (about 92% to 8%) |
| 3 | My setup | blode.co/uses (`blode-co/apps/web/app/uses/page.tsx`): Codex, Claude Code, cmux with DiffHub, Raycast snippets, captain, agent skills |
| 4 | Let it work. Guard the edges. | `cc` and `co` aliases in my shell config (`claude --dangerously-skip-permissions`, `codex --dangerously-bypass-approvals-and-sandbox`); `co` shown beside `cc`; `~/.claude/settings.json` (`defaultMode: "auto"`, `effortLevel: "medium"`); my Claude Code hooks (tests only right before `git push`, heavy commands queued, whole-file reads over 400 lines refused); global CLAUDE.md (one worktree per change) |
| 5 | Three keystrokes | My Raycast snippets `zcc`, `zep` and `zgp` (text from my own message; the snippets could not be exported); session counts from chat-history: zcc about 50, zep about 129, zgp about 70 |
| 6 | A new feature, start to finish | This talk's flow: new feature, `/planning` with `/codebase-architecture`, update the plan, execute with `zep`, `/tidy`, `/pr-creator`, Codex review in GitHub, `/pr-babysitter`, merged. Skill names from github.com/mblode/agent-skills |
| 7 | Think really hard once | agent-skills `planning` skill, `SKILL.md`: the Plan contract (six of its seven sections, each cut to one line) and a Gotchas line quoted word for word |
| 8 | Pick the model, then the effort | chat-history: Opus 5.5 answered most in 967 sessions, Fable 5.2 in 11, `/effort` typed 50 times, `/model` 34 times; Fable 5.2 on the Claude Ultra plan is my stated choice for hard problems |
| 9 | One chat runs the fleet | agent-skills `captain` skill (56 uses in 30 days); cmux; global CLAUDE.md worktree rule; story from my company's monorepo: 11 workspaces and about 42 PRs in one move |
| 10 | Agents review agents | Codex GitHub review in chat-history: 62 P1 labels across about 20 sessions; story: a P1 caught an ORM version pin that a migration dropped, in my company's monorepo |
| 11 | Write down done first | The task rubric and fresh-context verifier in my company's factory repo: the building agent cannot edit the rubric, a verifier with no shared context grades it and must cite file and line or command output; 23 verdicts, 13 passed and 10 failed. Repo and clients never named |
| 12 | Open isn’t done | agent-skills `pr-babysitter` (188 uses in 30 days), `SKILL.md`: the Monitor Loop checklist (last line shortened) and the "two identical failures" rule, quoted |
| 13 | The checks catch broken code | This repo's `lefthook.yml` and `.github/workflows/ci.yml`, comments and setup steps left out; the test-before-push hook in my Claude settings |
| 14 | Give the agent a way to prove it | This repo's `AGENTS.md`, Verification section, and `scripts/verify-slides.mjs` |
| 15 | Write the repo for the agent | This repo's `AGENTS.md`: three commands, the add-a-slide line and the icons convention |
| 16 | Lazy, not negligent | Global CLAUDE.md, "Minimal code" section (the seven-rung ladder) |
| 17 | Write your working style down | matt-mode skill, unmerged branch `matt-mode` of agent-skills-private (`12614ff`, `skills/matt-mode/SKILL.md`): "Done means live", "Never block on Matt for reversible work" (from factory-mode), the stock-phrases table. Quoted, not linked |
| 18 | My agent skills | github.com/mblode/agent-skills; install command `npx skills add mblode/agent-skills -g --agent codex claude-code -y` (27 skills); top skills by use in 30 days: tidy 327, pr-creator 201, pr-babysitter 188, planning 93, ui-design 90, codebase-architecture 75, captain 56; art from the you-have-taste "agent-skills" and "installs" slides |
| 19 | Your chat history is a database | agent-skills `chat-history` skill; every number in this deck came from it on 13 Nov 2026; the three questions on the slide summarise what I asked |
| 20 | Try one thing tomorrow | This talk's takeaway (copy the snippets, add a verification command, run pr-babysitter); QR code to github.com/mblode/agent-skills |
