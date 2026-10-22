---
title: "Find Issues, If Any"
description: "An AI reviewer found problems in every fix for 250 P0 tickets, and a retrospective concluded none were closed. In the end there was one real defect. The model did what it was asked. The brief was the bug."
pubDate: 2026-10-22
relatedProject: "fdf"
---

Ask an AI agent to find problems in a pull request, and it will find some. Every time.

Most of us have seen this in small ways. You paste in a diff, ask whether anything looks off, and get back a list of suggestions for code that was fine. You skim past the nitpicks, keep the one useful point, and move on. It costs ten minutes.

I recently watched that same habit, repeated across 250 pull requests, turn into weeks of escalation and a client telling a team it had closed none of its tickets. When everything was finally checked, there was one real defect.

The model wasn't the problem. The question was.

---

## The retrospective

I was working alongside the Operations Manager for a global client — a phone seller you would recognise, and I'll leave it there. After the last big release to their selling platform, 250 P0 tickets were raised against it.

P0 is the top of the scale. It is supposed to mean the client is losing revenue right now. In practice it is also the fastest lane in any support queue, and everyone knows it, so plenty of tickets get raised as P0 because that is how you get something looked at today. That isn't a scandal. It's how escalation works when the label decides the response time. But it means "250 P0s" was never 250 revenue outages. It was 250 things somebody wanted fixed fast.

Then came the retrospective, and the client's headline: out of 250 tickets, not one had been closed.

The Operations Manager was flabbergasted. He went back and checked. Of the 250, 181 were already closed. The rest were being actively worked and expected to close soon.

So how does a team that has closed 181 tickets get told it has closed none?

---

## How 181 became zero

Every pull request raised against those tickets went through an AI review before the ticket could count as done. The reviewer was Claude. The process was simple: share the ticket, share the PR, and ask it to review the change and find any issues or gaps.

It found issues. On every one.

Those findings were treated as open defects, so the tickets were treated as open, so the count came out at zero. What followed was two rounds of back and forth — AI findings, engineers responding, Tech Leads reviewing both — until the 250 had narrowed to 8 follow-up tickets, each claimed as a genuinely open issue. Then those 8 were examined properly.

```
 250  P0 tickets raised after the release
  │
  ├── 181 already closed, the rest in progress
  │
  ├── AI review flags issues on every PR
  │
  ├── two rounds of review with Tech Leads
  │
  ▼
   8  follow-up tickets, "all open issues"
  │
  ├── 7  asks for more robust test cases
  └── 1  null pointer: a real gap, since fixed
  │
  ▼
   1  real defect
```

In every case, the original ticket had been closed correctly.

Seven of the eight were engineers being asked to write more robust tests. Better tests are worth having, and I would never argue against them. But "this fix could have stronger tests" and "this ticket is not fixed" are two different statements, and the process had quietly merged them into one.

The eighth was a real null pointer — a genuine gap in a fix, caught and corrected. That happens. We are all human, and on a release this size something will slip through. Catching it is exactly what review is for.

One real defect. Everything else was the reviewer answering the question it had been given.

---

## You asked for problems

If you have read [Agents Don't Know How to Stop](/blog/agents-dont-know-how-to-stop/), you can probably see where this goes. An agent has no comfortable way to come back and say "this is fine, ship it", because nothing in the request made "this is fine" a successful answer.

Read the instruction the way a model does. "Find issues, if any." The "if any" is a polite hedge. The "find issues" is the task. A response with zero findings looks, from inside the model, like a failure to do what was asked.

This tendency has been measured. In ["Towards Understanding Sycophancy in Language Models"](https://arxiv.org/abs/2310.13548), Mrinank Sharma and colleagues at Anthropic found that five state-of-the-art assistants consistently told users what they seemed to want to hear, and traced part of the cause to the human preference data models are trained on, where responses that matched the user's views were more likely to be preferred. A reviewer asked to find problems has been told, quite clearly, what the user wants to hear.

And a small fix in a large, old codebase offers endless material. The null check could be more defensive. The method could be split. The error handling could match some other module. There could be a test for the edge case nobody hits. The whole class could be redesigned so this category of bug becomes impossible. Every one of those is defensible on its own. None of them means the ticket is open.

That is the ten-minute experience from the start of this post. The only difference here was scale: 250 of them, and a client counting.

---

## The reflex that doesn't work

The natural reaction to a story like this is to blame the tool. AI review is noisy, so turn it off. Or try a smarter model. Or add "be concise" and "only report important issues" to the prompt.

None of those touch the problem. Turning the reviewer off throws away the one finding that was real — the null pointer, exactly the kind of finding a well-briefed reviewer exists to surface. A smarter model asked the same question will find *better-argued* nitpicks, not fewer. And "only report important issues" asks the agent to decide what's important, with no way to know, because nobody told it what this change was for.

AI is a powerful tool in the right hands. In hands that don't know how to use it practically, it creates hurdles — work that has to be done, argued over, and undone, so that a dashboard can finally say what it should have said in the first place. The difference between those two outcomes was never the model.

---

## A new hire with a ticket and a diff

The reframe that makes this obvious: **an AI reviewer is a new hire on their first morning. Brief it the way you would brief one.**

Picture it literally. Someone joined the team today. You hand them a ticket and a pull request and say: review this, find any gaps. A good new hire would ask a dozen questions before saying anything. What was this feature supposed to do? Which scenarios were in scope? Is that strange-looking code a mistake or a deliberate workaround? Is this the right place for the fix? What does "done" mean for a P0 here?

The AI doesn't ask. As I wrote in [Every Session Is a New Hire](/blog/every-session-is-a-new-hire/), a model missing the real constraints doesn't stop and report the gap — it fills it with the most plausible-looking thing, in the same confident tone it uses when it's right. Given no definition of done, it measures every fix against a generic ideal of good code. Very little ten-year-old production code meets that ideal.

| | What the reviewer got | What a new hire would need |
| --- | --- | --- |
| The goal | "Find issues or gaps" | Does this PR fix the defect, safely? |
| Definition of done | None | What closes a P0 on this project |
| What's blocking | Everything it noticed | Defects that break the fix, separated from suggestions |
| Feature intent | Implied by a ticket title | The original epic and stories, with every scenario |
| History | None | The PRs that built the feature, and why |
| A valid "no" | Not offered | "No blocking issues" is a successful outcome |

The left column is what most AI reviews actually look like. The right column isn't a cleverer prompt. Half of it is a paragraph of instructions anyone could write in five minutes. The other half is documents.

---

## Simple is a requirement, not a vibe

There is a second habit in play, and it isn't unique to AI. Engineers love to over-engineer. Show us a small bug and we'll see the design flaw behind it, the refactor that would fix the category, the abstraction that would make it impossible. It turns out agents share the instinct. Ask a model what could be better and it will happily design you a better system.

On a project that has been running for close to a decade, with millions of lines of code, that instinct isn't practical. You cannot optimise for everything. Every odd-looking pattern was probably someone's fix for something, and a change that tidies one corner can break three you never opened. The job on a P0 is to solve the real issue, safely, and move on — not to invent problems that don't exist and then solve those too.

KISS — keep it simple, stupid — is a real principle that real projects depend on. With agents in the loop, it can't stay an unspoken team value. An agent won't keep things simple because simplicity is the culture. It keeps things simple when it is told simplicity is the goal, every time, in the brief.

---

## The documents are the work

The first half of the right-hand column — state the goal, define blocking, make "no" a valid answer — would have collapsed most of the noise in this story on its own. The second half is harder, and it is where legacy projects struggle.

To judge a change, a reviewer needs:

- **The intent of the feature.** The original epic and stories, with every scenario it was meant to handle, so it can tell a bug from a behaviour someone asked for.
- **The history of the code.** The pull requests that implemented the feature where the defect turned up, so it can see what was intended and what has drifted since.
- **The local conventions.** How that part of the system actually works, so "this is inconsistent" is judged against the module, not a textbook.
- **The definition of done.** What closes a ticket of this kind, on this project.

That is a lot of context to assemble, and it is assembled per feature, not once per repository. A single `CLAUDE.md` at the root won't carry it. It can tell an agent how to run the tests and which patterns the team prefers. It can't tell it what a feature was supposed to do when it shipped years ago, or why one module has a special case that looks wrong and isn't.

This is the problem I use [FDF](/projects/fdf/) to tackle: every feature keeps its spec, plan, and acceptance tests as files beside the code, so the intent behind a change is still readable by whichever agent reviews it months later. Bigger teams reach for [BMAD](https://github.com/bmad-code-org/BMAD-METHOD), which produces PRDs, architecture documents, and stories through a full agile-style workflow. None of this requires either tool specifically. What you can't skip is the decision underneath: the context an agent needs to judge a change has to exist somewhere it can read, *before* you ask for the review.

On a new project that is a habit you can start on day one. On a project that's ten years old, it is real work — work most teams haven't budgeted for, and will have to if they plan to use AI seriously. It is not practical to hand an agent a ticket and a diff and expect it to work wonders. It will work. It will just work on the wrong question.

---

The Operations Manager got his numbers corrected in the end. Count what that took. Engineers writing responses to AI findings on fixes that already worked. Tech Leads reviewing those responses, twice. An Operations Manager auditing 250 tickets to defend a team that had done its job. A client escalating, and a retrospective spent arguing over a number that was never true. All of it to arrive back where the team had started: the tickets were fixed.

None of those people were idle before this. Every hour spent proving a fixed ticket was fixed was an hour not spent on a real problem, and a project that size is never short of real problems. That is what a tool used badly actually costs. Not the licence. The people.

AI review was meant to save senior engineers' time. Briefed like this, it spent it. In [The Attempt Got Cheap](/blog/the-attempt-got-cheap/) I argued that the expensive part of agentic engineering has moved from writing code to checking it. This is the same lesson, run in reverse: the cheapest step in the whole process, asking the model, created the most expensive work in it.

The agent will find issues again tomorrow, on whatever you hand it. It always will. The question is whether you told it which ones count, or whether your team spends next month finding out.
