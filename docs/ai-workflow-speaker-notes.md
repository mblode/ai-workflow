# How I use AI: speaker notes

Twenty minutes, 19 slides, no Q&A, on Microsoft Teams for about 16 Linktree engineers, Thursday 13 November 2026. Pitch it at someone who has barely used an AI agent: explain each piece of jargon in plain words the first time it comes up, then use it freely. Some of the room saw the May talk (blode.co/ai-usage), so mention what changed since May without retelling it. One flow (plan, review the plan, build, clean up, pull request, AI review, fix until green, merged and live) and one idea: let the agents do the work, and put your judgement into the plan, the checks and the skills. Numbers are from my chat history over the last 30 days and are approximate, so say "about". Beats are prompts, not a script, and the timings are estimates until a timed run. Anything under a `Flags:` line is for editing and never shows in the presenter window.

## 1. How I use AI

- 0:00 to 0:50.
- Hey everyone. Thanks Tommy for setting this up.
- Twenty minutes, no questions at the end, so I'll keep moving. Ping me on Slack after.
- This is how I go from an idea to shipped code with AI agents. An agent is an AI that does tasks, not just answers. It reads your code, runs commands and makes changes.
- You don't need any experience with them. If you've only used ChatGPT in a browser, this is for you.

## 2. Since May

- 0:50 to 1:50.
- Some of you saw my talk back in May. It's still up at blode.co/ai-usage, so I won't repeat it.
- Back then I ran one long prompt in twenty terminal tabs.
- Now I use three saved prompts. And the agents carry each change all the way to merge. Merge means your change joins the main code.
- The numbers for the last 30 days. About 1,700 chats with Claude Code. About 17,500 messages I typed to agents.
- About 92% of those chats were Claude Code. Codex, which is OpenAI's agent, mostly reviews my work now.
- That sounds like a lot of typing. It isn't really. Most of those messages are three letters long, and I'll show you why in a minute.

Flags:
- SOURCE: chat-history, 30 days to 13 Nov 2026: 1,694 Claude Code sessions, about 17.5k prompts, 147 Codex sessions.

## 3. My setup

- 1:50 to 3:00.
- My setup is pretty boring, and that's on purpose.
- Claude Code is my main agent. It runs in the terminal.
- Codex is OpenAI's agent. I mostly use it to review pull requests. A pull request is a proposed change, waiting for review.
- cmux is a terminal app with a tab per agent. It pings me when one of them needs me.
- captain is a tool I built. It's one chat that hands tasks out to lots of agents.
- Raycast gives me snippets: three letters that expand into a full prompt.
- And skills. A skill is a saved checklist the agent reads first. One for planning, one for pull requests, and so on.
- The full list is on blode.co/uses. There's a QR code for it at the end.

## 4. Let it work. Guard the edges.

- 3:00 to 4:00.
- My `cc` alias runs Claude with `--dangerously-skip-permissions`. That flag stops Claude asking before every command. I don't click yes a hundred times a day.
- But I only do that because three guardrails are in place.
- One. Each change happens in its own copy of the repo. That's called a worktree: a second checkout of the same repo. So two agents can't break each other's work.
- Two. Automated checks must pass. On GitHub those run in CI, which runs your checks on every change.
- Three. A reviewer must pass it too, and that's another AI. More on that later.
- If you're new to agents, keep approvals on. Let it ask you. Turn them off only once these guardrails exist, and always follow our security policy.

Flags:
- Do not encourage anyone to break company policy. The point is the pairing, not the flag.

## 5. Three keystrokes

- 4:00 to 5:10.
- This is the cheapest trick in the talk.
- A snippet turns three letters into a whole prompt. I have three. One to plan, one to build, one to ship.
- `zcc` is Plan. Do extensive research, then write a plan with checkable tasks, what done looks like, dependencies, and how to check it. About 50 chats last month.
- `zep` is Build. Do the agreed plan, split independent tasks across helper agents, and tick tasks off only with proof. About 130 chats.
- `zgp` is Ship. Tidy it up, commit, push, open the pull request, then look after it until it merges. About 70.
- You don't need Raycast for this. Any text expander works. Even a notes file you copy from.
- Take a screenshot. Steal them, change the words, make them yours.

## 6. A new feature, start to finish

- 5:10 to 6:10.
- This is the whole thing on one slide. It starts with a new feature, usually a ticket or a messy note. Step one is Plan. The agent reads the code and writes a plan.
- Click. Review the plan. I answer its questions and cut scope. This is where most of my time goes.
- Click. Build. Several agents write the code at once.
- Click. Clean up. `/tidy` reviews its own change and cuts what doesn't need to be there.
- Click. Open a pull request. `/pr-creator` writes it up.
- Click. AI review. Codex checks it on GitHub.
- Click. Fix until green. `/pr-babysitter` handles the failing checks and the review comments.
- Click. Merged and live. Checked in production.
- I'm in two places: the plan, and the decision at the end.

Flags:
- Step 1 (Plan) shows on arrival. Then seven clicks, one per step. Don't race it.

## 7. Think really hard once

- 6:10 to 7:20.
- The plan is where the real work happens. If the plan's wrong, the agent builds the wrong thing really fast.
- A good plan is a checklist an agent can finish without me. Five things.
- Small tasks you can tick off. Not "improve the API". More like "add this field, update this test".
- What done looks like for each one. Otherwise the agent decides, and it's usually generous to itself.
- Which tasks depend on others. Then everything else can run at the same time.
- The command that proves it works. If the agent can check its own work, it doesn't come back and ask me.
- What's known, kept apart from guesses. Agents state guesses very confidently, so I want them labelled.

## 8. Pick the model, then the effort

- 7:20 to 8:20.
- Two choices every time. Which model, and how much effort.
- Effort is how long it thinks before it answers. More effort is slower, smarter and costs more.
- Claude comes as a few models. Fable is the biggest, Opus the everyday one, Haiku the small fast one.
- Opus 5.5 on medium effort is my default for almost everything.
- Fable 5.2 is for the hardest problems, like design or a tricky bug. I'm on the Claude Ultra plan for that.
- Haiku 5.5 on low effort for quick, cheap searches across lots of files.
- Codex on high effort reviews every pull request.
- If you're starting out, leave it on the default. Turn effort up when the answer is wrong, not before.
- Usually the model isn't the problem. A vague plan is.

Flags:
- SOURCE: chat-history, Opus 5.5 answered most in 967 sessions, Fable 5.2 in 11. `/effort` typed 50 times, `/model` 34.

## 9. One chat runs the fleet

- 8:20 to 9:40.
- Once one agent works, the next step is running a few at once. Three things make that possible.
- Worktrees. A separate copy of the repo for each change, so agents never trip over each other.
- cmux. A tab per agent. It pings me when one is stuck or done, so I'm not watching twenty tabs.
- captain. I give it a list. It starts an agent per task and only brings back decisions.
- A real example. One big move this month, in a monorepo I look after outside Linktree. A monorepo is one repo holding every app. 11 agents, about 42 pull requests.
- I didn't read 42 pull requests line by line. I read the plan, I answered the questions that came back, and I made the calls.
- Don't start here. Start with one agent. But if you take one thing from this slide, take worktrees.

Flags:
- No client or app names for the monorepo story. captain: 56 uses in 30 days.

## 10. Agents review agents

- 9:40 to 10:40.
- A second AI model reads every pull request before it merges. For me that's Codex on GitHub.
- It labels what it finds by priority. P1 means must fix. Last month it raised about 62 of them.
- Here's one that mattered. In that same monorepo, an upgrade quietly dropped the pin on our database library. So the app would have run an older version.
- The tests passed. The diff looked fine. It's one line in a big change, so it's easy to miss in a skim.
- Codex flagged it as a P1, must fix.
- Click. The agent fixed it, Codex re-reviewed it, then it merged.
- Codex didn't write the code, so it doesn't share the same blind spot. Same reason we ask a teammate to review.

Flags:
- One click, for the "fixed, re-reviewed, merged" line. SOURCE: 62 P1 labels across about 20 sessions in 30 days.

## 11. Write down done first

- 10:40 to 11:50.
- This one comes from an agent setup I run outside Linktree. Before an agent starts a task, it gets a checklist of what finished looks like.
- The agent doing the work can't edit that checklist. So it can't quietly move the goalposts when the work gets hard.
- When it says it's done, a fresh agent grades it. Fresh means it never saw the work or the reasoning, so it can't be talked into a pass.
- Every tick needs proof. A line of code, or the output of a command. "Looks good" doesn't count.
- Click. Of 23 graded tasks, 10 failed. That's the point. A grader that never says no isn't checking anything.
- If you try one piece of this: write down what done means before you start the agent, not after.

Flags:
- One click, for the "10 of 23 failed" line. SOURCE: task rubrics and verdict files in my company's factory repo (13 passed, 10 failed). Never name the repo or clients.

## 12. Open isn't done

- 11:50 to 12:50.
- Opening a pull request feels like done. It isn't. Someone still has to get it over the line.
- `/pr-babysitter` looks after the pull request until it merges.
- It fixes failing automated checks. That's CI.
- It updates the branch when main, the shared branch everyone merges into, has moved on.
- It replies to every review comment, or fixes what the comment asked for.
- And it re-runs flaky checks instead of changing code. If a check failed because the build machine had a bad day, rewriting code is the wrong fix.
- I used it about 190 times last month.
- That one skill took a whole pile of "oh, I forgot about that PR" off my plate.

## 13. The checks catch broken code

- 12:50 to 14:00.
- If agents write most of the code, something has to catch the broken code. These checks run automatically before any code can land.
- On commit, two things. Format, which fixes spacing and layout. And lint. Lint is a tool that flags likely mistakes in code. I use oxfmt and oxlint, on the changed files only.
- On push, it runs the same checks as CI. So I find out on my machine, not ten minutes later.
- In CI, lint, format, types and build, all again.
- Tests run once, right before the push. Not while the agent is working. Otherwise ten agents run the whole suite every two minutes.
- One catch. Checks catch broken code, not too much code. Agents love writing extra. `/tidy` handles that.
- The checks don't care who wrote the code. Same bar for me, for Claude, for Codex.

## 14. Write the repo for the agent

- 14:00 to 15:00.
- Agents start every task with no memory. The repo has to explain itself.
- So I write the repo for the agent. Four things.
- A monorepo. Every app in one repo, sharing the same config. The agent sees the whole picture.
- AGENTS.md. A README for agents: the commands, the layout and the rules. Keep it short. When it's wrong, fix it in the same change.
- A README. What it is and how to run it, for people. Agents read it too.
- Skills. Checklists the agent loads for one kind of job, kept in the repo when the repo needs them.
- My test is simple. Could a new engineer get going from these files alone, without asking anyone? If yes, so can the agent.

## 15. Lazy, not negligent

- 15:00 to 16:10.
- Agents love writing code. Way too much code. So before an agent writes anything, it climbs this ladder.
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

## 16. Write your working style down

- 16:10 to 17:10.
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

## 17. My agent skills

- 17:10 to 18:00.
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

## 18. Your chat history is a database

- 18:00 to 19:00.
- Every chat with an agent is saved on your machine. Thousands of them. Every bug you fixed, every decision, every dead end.
- I have a skill called `/chat-history` that searches them.
- I use it when I think, "we fixed this before". It finds the chat and shows me what happened after.
- It's also how I find what to turn into a skill. If I've typed the same correction ten times, that's a rule waiting to be written.
- Click. Every number in this talk came from it. I asked how many chats, which skills, which models, and it counted.

Flags:
- One click, for the "every number" line.

## 19. Try one thing tomorrow

- 19:00 to 20:00.
- So pick one thing to try tomorrow. Just one.
- Save your best prompt as a snippet. Write it once, stop retyping it.
- Ask for a plan before any code. Read it, fix it, then let it build.
- Let an agent see one pull request through to merge. Watch what it does with the review comments.
- If you want a head start, the left QR code is my agent skills. The right one is blode.co/uses, with my whole setup.
- The short version of the talk: let the agents do the work, and put your judgement into the plan, the checks and the skills.
- Thanks everyone. Ping me on Slack if you want to go deeper.
