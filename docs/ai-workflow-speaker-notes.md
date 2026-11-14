# How I use AI: speaker notes

Twenty minutes, 20 slides, no Q&A, on Microsoft Teams for the Mark My Words engineers, Thursday 13 November 2026. The room is working developers who already use Claude Code or Codex, so skip the definitions and show the real thing: the prompt, the file, the command. Early feedback on the first draft was that it was too general for developers and needed real examples, so every slide now carries something they can copy. One flow (plan, review the plan, build, clean up, pull request, AI review, fix until green, merged and live) and one idea: let the agents do the work, and put your judgement into the plan, the checks and the skills. Numbers are from my chat history over the last 30 days and are approximate, so say "about". Beats are prompts, not a script, and the timings are estimates until a timed run. Anything under a `Flags:` line is for editing and never shows in the presenter window.

## 1. How I use AI

- 0:00 to 0:40.
- Hey everyone. Thanks Tommy for setting this up.
- Twenty minutes, no questions at the end, so I'll keep moving. Ping me on Slack after.
- You all use these tools already, so I'm not going to explain what an agent is.
- This is the exact prompts, files and checks I use to take a ticket to a merged pull request. Everything on screen is real, and you can copy any of it.

## 2. 30 days, by the numbers

- 0:40 to 1:30.
- First, how much I lean on this. The last 30 days.
- About 1,700 chats with Claude Code. About 17,500 messages I typed to agents.
- About 92% of those chats were Claude Code. Codex mostly reviews my work now.
- That sounds like a lot of typing. It isn't. Most of those messages are three letters long.
- The rest of this talk is what those three letters expand into.

Flags:
- SOURCE: chat-history, 30 days to 13 Nov 2026: 1,694 Claude Code sessions, about 17.5k prompts, 147 Codex sessions.

## 3. My setup

- 1:30 to 2:30.
- My setup is pretty boring, and that's on purpose.
- Claude Code is my main agent. Opus 5.5 at medium effort, in auto mode.
- Codex reviews every pull request on GitHub. It's about 8% of my chats.
- cmux is a terminal with a tab per agent. It pings me when one of them needs me.
- captain is a tool I built. One chat that starts an agent per task.
- Raycast gives me snippets: three letters that expand into a full prompt.
- And skills. 27 markdown files. An agent reads one before that kind of job: one for planning, one for pull requests, and so on.
- The full list is on blode.co/uses.

## 4. Let it work. Guard the edges.

- 2:30 to 3:30.
- These are my two aliases. `cc` runs Claude with `--dangerously-skip-permissions`. `co` runs Codex with approvals and the sandbox off. I don't click yes a hundred times a day.
- I only do that because three guardrails are in place.
- One. A git worktree per change. Two agents can't touch each other's files.
- Two. Hooks. No tests until `git push`, so ten agents aren't running the suite every two minutes. And no whole-file reads over 400 lines, which keeps the context small.
- Three. Nothing merges until CI passes and Codex has reviewed it.
- Don't copy the flags without the guardrails. And we handle student data, so follow our security policy first.

Flags:
- Do not encourage anyone to break company policy. The point is the pairing, not the flag.
- SOURCE: `cc` and `co` in my shell aliases; hooks in my Claude settings (a third hook queues heavy commands, not on the slide).

## 5. Three keystrokes

- 3:30 to 4:40.
- This is the cheapest trick in the talk, and these are the actual prompts.
- `zcc` is Plan. Do extensive research, then write a plan with checkable tasks, acceptance criteria, dependencies and verification commands. About 50 chats last month.
- `zep` is Build. Execute the agreed plan, parallel subagents on independent tasks, keep a visible checklist, and tick tasks off only with evidence. About 130 chats.
- `zgp` is Ship. `/tidy`, commit, push, `/pr-creator`, `/pr-babysitter`. About 70.
- Look at the words that do the work. "Verification commands". "Only with evidence". They stop the agent marking its own homework.
- You don't need Raycast. Any text expander works.
- Take a screenshot. Steal them, change the words, make them yours.

## 6. A new feature, start to finish

- 4:40 to 5:40.
- This is the whole thing on one slide. Step one is Plan. I type `zcc` with the `/planning` skill, and out comes a plan file in `docs/plans`.
- Click. Review the plan. I answer its questions and cut scope. This is where most of my time goes.
- Click. Build. `zep`. One subagent per independent task.
- Click. Clean up. `/tidy` reads the diff in five passes, then fixes what it found.
- Click. Open a pull request. `/pr-creator` writes the title and body.
- Click. AI review. Codex on GitHub. P1 means must fix.
- Click. Fix until green. `/pr-babysitter` handles conflicts, CI and review threads.
- Click. Merged and live. Smoke-tested in production.
- I'm in two places: the plan, and the decision at the end.

Flags:
- Step 1 (Plan) shows on arrival. Then seven clicks, one per step. Don't race it.
- tidy's five passes: claims, added lines, removed lines, call sites, outside the diff.

## 7. Think really hard once

- 5:40 to 6:50.
- If the plan's wrong, the agent builds the wrong thing really fast. So the plan has a contract. This is from my `/planning` skill.
- Outcome. The problem, the intended behaviour, and the acceptance criteria.
- Approach. The smallest slice that works, and the files it touches.
- Decisions. The question, the choice, the evidence, and what would flip it. So I can see where it guessed.
- Boundaries. What's out of scope.
- Verification. A command or test tied to each acceptance criterion.
- Recovery. How to roll back a migration.
- Read the quote at the bottom. "Run tests" is not verification. Name the scenario and the expected result.

Flags:
- SOURCE: `skills/planning/SKILL.md` in github.com/mblode/agent-skills. The six rows shorten the Plan contract (a seventh, Docs, is left off); the quote is word for word from its Gotchas.

## 8. Pick the model, then the effort

- 6:50 to 7:40.
- Two choices every time. Which model, and how much effort.
- Opus 5.5 on medium effort is my default for almost everything.
- Fable 5.2 is for the hardest problems, like design or a tricky bug. I'm on the Claude Ultra plan for that.
- Haiku 5.5 on low effort for quick, cheap searches across lots of files.
- Codex on high effort reviews every pull request.
- In 30 days I typed `/effort` 50 times and `/model` 34. So I do change it, but not often.
- Turn effort up when the answer is wrong, not before. Usually the model isn't the problem. A vague plan is.

Flags:
- SOURCE: chat-history, Opus 5.5 answered most in 967 sessions, Fable 5.2 in 11. `/effort` typed 50 times, `/model` 34.

## 9. One chat runs the fleet

- 7:40 to 8:50.
- Once one agent works, the next step is running a few at once. Three things make that possible.
- Worktrees. `git worktree add`, once per change. Agents never share a working tree.
- cmux. A tab per agent. It pings me when one is stuck or done, so I'm not watching twenty tabs.
- captain. I give it a list. It starts an agent per task and only brings back decisions.
- A real example. One big move this month, in another monorepo I look after. 11 agents, about 42 pull requests.
- I didn't read 42 pull requests line by line. I read the plan, I answered the questions that came back, and I made the calls.
- Don't start here. Start with one agent. But if you take one thing from this slide, take worktrees.

Flags:
- No client or app names for the monorepo story. captain: 56 uses in 30 days.

## 10. Agents review agents

- 8:50 to 9:50.
- A second model reads every pull request before it merges. For me that's Codex on GitHub.
- It labels what it finds by priority. P1 means must fix. Last month it raised about 62 of them.
- Here's one that mattered. In that same monorepo, an upgrade quietly dropped the pin on our database library. So the app would have run an older version.
- The tests passed. The diff looked fine. It's one line in a big change, so it's easy to miss in a skim.
- Codex flagged it as a P1, must fix.
- Click. The agent fixed it, Codex re-reviewed it, then it merged.
- Codex didn't write the code, so it doesn't share the same blind spot. Same reason we ask a teammate to review.

Flags:
- One click, for the "fixed, re-reviewed, merged" line. SOURCE: 62 P1 labels across about 20 sessions in 30 days.

## 11. Write down done first

- 9:50 to 10:50.
- This one comes from another agent setup I run. Before an agent starts a task, it gets a checklist of what finished looks like.
- The agent doing the work can't edit that checklist. So it can't quietly move the goalposts when the work gets hard.
- When it says it's done, a fresh agent grades it. Fresh means it never saw the work or the reasoning, so it can't be talked into a pass.
- Every tick needs proof. A line of code, or the output of a command. "Looks good" doesn't count.
- Click. Of 23 graded tasks, 10 failed. That's the point. A grader that never says no isn't checking anything.
- If you try one piece of this: write down what done means before you start the agent, not after.

Flags:
- One click, for the "10 of 23 failed" line. SOURCE: task rubrics and verdict files in my company's factory repo (13 passed, 10 failed). Never name the repo or clients.

## 12. Open isn't done

- 10:50 to 11:50.
- Opening a pull request feels like done. It isn't. Someone still has to get it over the line.
- This is the checklist straight out of `/pr-babysitter`. It runs on every CI event.
- Conflict check. It rebases when main has moved. Conflicts in lockfiles it fixes. Conflicts in real logic it hands back to me.
- CI check. Diagnose, fix, run the gate, push.
- Comment check. It triages every new review comment.
- Readiness check. It tells me when the pull request can merge, and what's blocking it when it can't.
- And after merge it watches the deploy and smoke-tests production.
- The line at the bottom is my favourite rule. Two identical failures means stop pushing. Don't try a third variant.
- I used it about 190 times last month.

Flags:
- SOURCE: `skills/pr-babysitter/SKILL.md`, Monitor Loop checklist (last line shortened) and the one-shot loop rule.

## 13. The checks catch broken code

- 11:50 to 12:50.
- If agents write most of the code, something has to catch the broken code. These are the two files that do it in this deck's repo.
- On the left, `lefthook.yml`. On commit, oxfmt formats and oxlint fixes the staged files only, in parallel.
- On the right, CI. Lint, format check, types, build. Then one more step, which I'll show next.
- Tests run once, right before the push. Not while the agent is working.
- One catch. Checks catch broken code, not too much code. Agents love writing extra. `/tidy` handles that.
- The checks don't care who wrote the code. Same bar for me, for Claude, for Codex.

Flags:
- SOURCE: `lefthook.yml` and `.github/workflows/ci.yml` in this repo, with comments and the setup steps left out.

## 14. Give the agent a way to prove it

- 12:50 to 13:50.
- That last CI step is the most useful thing in the repo.
- A slide deck has no tests. So how does an agent know it didn't break a slide?
- This is the Verification section of the AGENTS.md. Lint, format, types, build. Then a script.
- The script serves the build, opens every slide in a browser, fires every click, and fails if any text overflows the slide. It saves screenshots.
- So the agent can't say "looks good" about a slide it never rendered. And CI runs the same script.
- Every repo has a version of this. If there's no command that proves the change works, write one. It pays back on the first pull request.

Flags:
- SOURCE: this repo's `AGENTS.md` (Verification) and `scripts/verify-slides.mjs`.

## 15. Write the repo for the agent

- 13:50 to 14:50.
- Agents start every task with no memory. The repo has to explain itself.
- This is from the AGENTS.md in this deck's repo. Three things.
- Commands. The exact ones, with what each runs.
- Layout. Where things live, and the recipe for the common job. Here that's adding a slide.
- Conventions. Look at the last line. Icons come from one package, and importing the other one fails lint.
- That's the pattern. A rule in prose gets ignored. A rule a check enforces sticks.
- Keep it short. When it's wrong, fix it in the same change.
- My test is simple. Could a new engineer get going from this file alone? If yes, so can the agent.

Flags:
- SOURCE: this repo's `AGENTS.md`: three of the eight commands, the add-a-slide line and the icons convention.

## 16. Lazy, not negligent

- 14:50 to 15:50.
- Agents love writing code. Way too much code. So before an agent writes anything, it climbs this ladder. It's in my global CLAUDE.md.
- Does this need to exist at all? If not, skip it.
- Already in the codebase? Reuse it. Rewriting something that lives three files over is the most common mess I see.
- Does the standard library do it? Use that.
- Does the platform do it? A date input beats a date picker library. CSS beats JavaScript.
- Does a dependency we already have do it? Use it. Don't add a new one for five lines.
- One line? One line.
- Only then, the least code that works.
- Lazy, not negligent. It never cuts input checks, error handling, security or accessibility.

Flags:
- SOURCE: global CLAUDE.md "Minimal code" section.

## 17. Write your working style down

- 15:50 to 16:50.
- matt-mode is a skill that tells agents how I like to work. It's what I'd tell a new teammate on day one.
- It has a table of things I say and what I mean by them.
- "Done means live." Merged, deployed and checked where people use it.
- "You decide." Make the call, do everything high value, and tell me what you chose.
- "Bypass." Skip the merge checks. Only ever when I say that exact word.
- Before this, I was the bottleneck. Every agent stopped and asked me small questions.
- Now only the real decisions come back.
- You can write your own. Look at what you keep correcting, and write that down.

Flags:
- matt-mode is on an unmerged branch of a private repo (`12614ff`). Quote it, don't link it, don't promise to share it.

## 18. My agent skills

- 16:50 to 17:40.
- Everything I've shown you lives in my agent skills. They're open source at github.com/mblode/agent-skills. QR code in the corner.
- One command installs them for Claude Code and Codex. It's on the slide.
- Here are the ones I use most, last 30 days.
- `tidy` reviews and cleans up a change, about 330 times.
- `pr-creator` writes the pull request, about 200.
- `pr-babysitter` gets it to merge, about 190.
- Then planning, ui-design, and codebase-architecture, which shapes code agents can work in.
- Every skill started as something that annoyed me. An agent did the wrong thing, I wrote the rule, and it stopped.

Flags:
- SOURCE: chat-history 30 days: tidy 327, pr-creator 201, pr-babysitter 188, planning 93, ui-design 90, codebase-architecture 75.

## 19. Your chat history is a database

- 17:40 to 18:50.
- Every chat with an agent is saved on your machine. Thousands of them. Every bug you fixed, every decision, every dead end.
- I have a skill called `/chat-history` that searches them.
- I use it when I think, "we fixed this before". It finds the chat and shows me what happened after.
- These are three things I asked it for this talk. How many Claude Code chats in 30 days. Which skill I call most. How many P1s Codex raised.
- It's also how I find what to turn into a skill. If I've typed the same correction ten times, that's a rule waiting to be written.
- Click. Every number in this talk came from it.

Flags:
- One click, for the "every number" line. The three questions are a summary of what I asked, not the literal prompts.

## 20. Try one thing tomorrow

- 18:50 to 20:00.
- So pick one thing to try tomorrow. Just one.
- Copy `zcc`, `zep` and `zgp` into a text expander. Change the words to suit you.
- Add a verification command to your AGENTS.md. One command that proves a change works.
- Run `/pr-babysitter` on your next pull request. Watch what it does with the review comments.
- The QR code is my agent skills, with the install command.
- The short version of the talk: let the agents do the work, and put your judgement into the plan, the checks and the skills.
- Thanks everyone. Ping me on Slack if you want to go deeper.
