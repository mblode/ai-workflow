# How I use AI: speaker notes

Twenty minutes, 18 slides, no Q&A, on Microsoft Teams for about 16 Linktree engineers, Thursday 13 November 2026. Many of them saw the May talk (blode.co/ai-usage), so frame changes as "since May" and never retell it. One flow (plan, execute, tidy, PR, review, babysit, merged) and one idea: let the agents run, and put your judgement into the plan, the gates and the skills. Numbers are from my chat history over the last 30 days and are approximate, so say "about". Beats are prompts, not a script, and the timings are estimates until a timed run. Anything under a `Flags:` line is for editing and never shows in the presenter window.

## 1. How I use AI

- 0:00 to 0:20.
- Hey everyone. Thanks Tommy for setting this up.
- Twenty minutes, no questions at the end, so I'll go fast. Ping me on Slack after if anything's unclear.
- This is how I actually use AI day to day. The setup, the three snippets I type all day, the flow from plan to merged PR, and the skills that hold it together.

## 2. Since May

- 0:20 to 1:30.
- Some of you saw my talk back in May. That's still up at blode.co/ai-usage, so I won't repeat it.
- A lot has changed since then. In May I said plan in Claude, execute in Codex. Now Claude Code does about 92% of my sessions. Codex is mostly my reviewer on GitHub.
- In May I had one long default prompt. Now it's three snippets.
- In May I said Codex runs through the night and I triage PRs over coffee. Now the agents merge and check production, and only decisions come back to me.
- The numbers for the last 30 days: about 1,700 Claude Code sessions, about 17,500 prompts, and about 150 Codex sessions.
- That sounds like a lot. Most of those sessions run while I'm doing something else.

Flags:
- SOURCE: chat-history, 30 days to 13 Nov 2026: 1,694 Claude Code sessions, about 17.5k prompts, 147 Codex sessions. May quotes from ai-usage slides 07, 08 and 14a.

## 3. My setup

- 1:30 to 2:30.
- My setup is pretty boring, and that's on purpose.
- Claude Code and Codex in the terminal. cmux to run lots of them side by side, with DiffHub to read the diffs.
- Raycast for snippets, which I'll show you in a second.
- A MacBook Pro that runs agents around the clock. It doesn't sleep.
- And my iPhone. A surprising amount of my merging happens from bed. The agent has already done the checks, so I'm reading the summary and pressing the button.
- The whole list is on blode.co/uses if you want to copy any of it.
- None of this is exotic. The difference is less the tools and more what I've wrapped around them.

## 4. Skip the prompts. Guard the edges.

- 2:30 to 3:40.
- This is the slide that makes security people nervous, so let me be careful.
- My `cc` alias is Claude with `--dangerously-skip-permissions`. `co` is the Codex equivalent. I don't approve every command.
- But that flag never runs on its own. It's paired with guardrails.
- Hooks. Tests are only allowed right before `git push`. Heavy commands get queued so ten agents don't build at once. Whole-file reads over 400 lines get refused.
- Worktrees. Every change gets its own worktree on its own branch, so one agent can't trash another's work.
- Gates. Lint, format and CI catch the wrong code before it lands.
- So I'm not removing safety. I'm moving it from me clicking yes to things that check every time.
- Please follow our security policy here. Auto mode with good hooks gets you most of the way.

Flags:
- Do not encourage anyone to break company policy. The point is the pairing, not the flag. `~/.claude/settings.json` has `defaultMode: "auto"`.

## 5. Three keystrokes

- 3:40 to 5:00.
- In May I had one long default prompt. Now it's three Raycast snippets, and they do most of my typing.
- `zcc` is the plan. It asks for a plan with acceptance criteria and the commands that prove each step works. I used it in about 50 sessions last month.
- `zep` is execute. It tells the agent who owns which files, and not to sit there polling. About 129 sessions.
- `zgp` is ship. Tidy the diff, commit, open the PR, then babysit it until it merges. About 70 sessions.
- That's it. Plan, execute, ship.
- The text is on the slide, so take a screenshot. Steal them, change the words, make them yours.
- The reason this works is that I stopped rewriting the same instructions every time. I wrote them once, and now it's three keystrokes.

Flags:
- The snippets couldn't be exported from Raycast. The slide text came from my own message. Don't claim it's a verbatim export.

## 6. The flow

- 5:00 to 6:40.
- This is the whole thing on one slide. It starts with a new feature, usually a ticket or a messy note. Step one is the plan: `/planning` with `/codebase-architecture`. The agent reads the code and writes a plan.
- Click. I update the plan. I answer its questions and cut scope. This is where most of my time goes.
- Click. Execute with `zep`. Often with parallel subagents.
- Click. Tidy. `/tidy` reviews its own diff, and oxfmt and oxlint clean it up.
- Click. Open the PR with `/pr-creator`, in our house style.
- Click. Codex reviews it on GitHub. One agent checking another.
- Click. Babysit. `/pr-babysitter` fixes CI, conflicts and review comments.
- Click. Merged and live, and checked in prod.
- The line at the bottom is the model. More on that in a couple of slides.
- I'm in two places: the plan, and the decision at the end. Everything in between runs on its own.

Flags:
- Step 1 (Plan) shows on arrival. Then seven clicks, one per step. Don't race it.

## 7. Think hard once

- 6:40 to 7:50.
- The plan is where the work happens. If the plan's wrong, the agent builds the wrong thing really fast.
- A good plan has four things.
- Tasks you can tick off. Not "improve the API", but "add this field, update this test".
- Acceptance criteria. How do we know it's done?
- Dependencies. What has to happen first, and what can run in parallel.
- Verification commands. The exact command that proves each step works.
- That last one changed the most for me. If the agent knows how to check its own work, it doesn't come back and ask me.
- I think hard once, up front, and then I don't have to think about it again.
- This deck had a plan like that. Six tasks, each with acceptance criteria. Two ran in parallel.

## 8. Pick the model, then the effort

- 7:50 to 8:50.
- My default is Opus 5.5 on medium effort. It answered most in about 970 sessions last month.
- For the really hard problems I switch to Fable 5.2. I'm on the Claude Ultra plan for that. It's slower and I don't use it much, about a dozen sessions.
- Haiku for sweeps. Rename this across 200 files, check every page for this one thing.
- Codex is my reviewer.
- The bit people skip is effort. I typed `/effort` about 50 times last month and `/model` about 34. I turn effort down more than I turn the model up.
- Most of the time the model isn't the problem. A vague plan is the problem. A better model on a bad plan just gives you a more confident wrong answer.

Flags:
- SOURCE: chat-history, Opus 5.5 most in 967 sessions, Fable 5.2 in 11. Fable on Ultra is my stated choice, not measured.

## 9. One chat runs the fleet

- 8:50 to 10:10.
- In May I showed you cmux times 20. That's still true, but I don't drive 20 tabs by hand any more.
- Now one chat runs the fleet. I use a skill called captain.
- I give it the work. It splits it into tasks, starts an agent per task, each in its own worktree, and only brings back what needs me.
- Real example. A big move in my company's monorepo. Eleven workspaces running at once, about 42 PRs out of it.
- I didn't read 42 PRs line by line. I read the plan, I answered the questions that came back, and I made the calls.
- Worktrees are what make this safe. Without them, two agents edit the same file and you spend the afternoon untangling it.
- If you only take one thing from this slide, take worktrees.

Flags:
- No client or app names for the monorepo story. captain: 56 uses in 30 days.

## 10. Agents review agents

- 10:10 to 11:10.
- Every PR gets reviewed by a different agent. For me that's Codex in GitHub.
- It labels what it finds by priority. Last month it raised about 62 P1s across about 20 sessions.
- Here's one that mattered. In my company's monorepo, an agent wrote a database migration. It looked fine. Tests passed.
- Codex flagged a P1. The migration had dropped the version pin on our ORM.
- That's a one-line change in a big diff. Easy to miss in a skim.
- The point isn't that Codex is smarter. It's a second pair of eyes that didn't write the code, so it doesn't share the same blind spot.
- Then the babysitter reads the review and fixes it. Which is the next slide.

## 11. Done means merged

- 11:10 to 12:10.
- In May, a PR being open felt like done. It isn't.
- `pr-babysitter` watches the PR until it can merge. CI fails, it reads the log and fixes it. Conflicts, it merges main. Review comments, it answers them or fixes them.
- First thing it checks is whether the failure is infrastructure. A killed job or a flaky runner gets a re-run, not a code change.
- I used it about 190 times last month.
- My rule is done means live. Not pushed, not PR open. Merged, deployed, and checked in production.
- When an agent says it's done, I want to see the commit, the PR state, and what's still pending.
- That one change took a whole category of "oh, I forgot about that PR" off my plate.

## 12. The gates catch wrong code

- 12:10 to 13:10.
- If agents write most of the code, something has to catch the bad code. For me that's gates.
- oxfmt formats. oxlint lints. Ultracite ties them together.
- lefthook runs them on pre-commit and pre-push. So the agent can't commit something that doesn't pass.
- Then CI runs the lot again. Lint, format, types, build.
- And the hook from before. Tests only run right before push. While it's working, the agent runs only lint and types on the files it changed.
- That sounds backwards, but it stops ten agents running the full suite every two minutes.
- The gates don't care who wrote the code. Same bar for me, for Claude, for Codex.
- My review time goes on the plan and the decisions. The gates handle the rest.

## 13. Write the repo for the agent

- 13:10 to 14:10.
- The agent reads your repo before it reads your prompt. So I write the repo for the agent.
- Monorepos. Turborepo, everything in one place. The agent can see the whole picture.
- An AGENTS.md at the root. The commands, the layout, the gotchas. Short. If it's wrong, I fix it in the same commit as the change that made it wrong.
- A real README. Agents read those too.
- And skills in the repo when the repo needs them.
- The test I use is simple. Could a new engineer get going from these files alone, without asking anyone? If yes, so can the agent.
- My scaffold skill sets all of this up for a new Next.js project, so I don't do it by hand.

## 14. Lazy, not negligent

- 14:10 to 15:10.
- Agents love writing code. Way too much code. So my global CLAUDE.md has a ladder they climb before writing anything.
- Does this need to exist at all? If not, skip it.
- Is it already in the codebase? Reuse it. Reimplementing something three files over is the most common slop I see.
- Does the standard library do it? Use that.
- Does the platform do it? A date input beats a date picker library. CSS beats JavaScript.
- Is there a dependency already installed? Use it. Don't add a new one for five lines.
- Can it be one line? Make it one line.
- Only then write the minimum code that works.
- The rule is lazy, not negligent. It never cuts validation, error handling, security or accessibility.

## 15. Write your working style down

- 15:10 to 16:20.
- The newest thing I've done is write my working style down as a skill. I call it matt-mode.
- It's everything I'd tell a new person on day one.
- Done means live. Not pushed, live.
- Never block on Matt for reversible work. If it can be undone, decide and tell me after.
- And a table of the phrases I keep typing, with what each one means. So when I say "ship it", the agent knows exactly what that involves.
- Before this, I was the bottleneck. Every agent stopped and asked me small questions.
- Now only the real decisions come back. The irreversible ones, and the ones where I actually have an opinion.
- You can write your own in an afternoon. Look at what you keep correcting, and write it down.

Flags:
- matt-mode is on an unmerged branch of a private repo (`12614ff`). Quote it, don't link it, don't promise to share it.

## 16. My agent skills

- 16:20 to 17:30.
- Everything I've shown you lives in my agent skills. They're open source at github.com/mblode/agent-skills.
- One command installs all 27 for Claude Code and Codex. It's on the slide.
- Here's what I actually use, last 30 days. `tidy` about 330 times. `pr-creator` about 200. `pr-babysitter` about 190. Then planning, ui-design, codebase-architecture, captain.
- So the top three are all about getting a PR from written to merged. That's where the time was going.
- Every skill started as something I was annoyed at. An agent did the wrong thing, I wrote the rule, and it stopped.
- When a new model comes out, I go through them again. Sometimes I can delete rules because the model got smarter.

Flags:
- SOURCE: chat-history 30 days: tidy 327, pr-creator 201, pr-babysitter 188, planning 93, ui-design 90, codebase-architecture 75, captain 56.

## 17. Your chat history is a database

- 17:30 to 18:40.
- Every number in this talk came from one place, my chat history.
- Claude Code and Codex keep every session on your disk. That's thousands of conversations. Every bug you fixed, every decision, every dead end.
- I have a skill called chat-history that searches all of it. I asked it how many sessions, which skills, which models, and it counted them.
- But the better use is day to day. "We fixed this before, how?" "Why did we change the plan?" It finds the session and shows me what happened after.
- It's also how I find what to turn into a skill. If I've typed the same correction ten times, that's a rule waiting to be written.
- You already have this data. Most people never look at it.

## 18. Try one thing tomorrow

- 18:40 to 20:00.
- So, one thing to try tomorrow.
- Pick the instruction you type most often and turn it into a snippet. Or a skill. Write it once, stop retyping it.
- If you want a head start, install my skills. Left QR code is the skills repo, right is my uses page with the full setup.
- And if you try the yolo flag, try it with the hooks and worktrees, and inside our policy.
- The short version of the whole talk: let the agents run, and put your judgement into the plan, the gates and the skills.
- Thanks everyone. Ping me on Slack if you want to go deeper on any of it.
