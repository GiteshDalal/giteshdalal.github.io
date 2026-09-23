---
title: "Six Models, One Bundle"
description: "Eleven weeks of building with FDF: how it changed my job, and why Fable 5.1 and Opus 5.5 made written specifications matter more, not less."
pubDate: 2026-09-23
relatedProject: "fdf"
---

Since the fifth of July, six different Claude models have co-authored commits in the monorepo behind my e-commerce platform: Opus 4.8, Fable 5, Opus 5, Sonnet 5, Fable 5.1 and, since its release on September 22, Opus 5.5. None of them remembered what the one before had learned — models don't — and none of them needed to. Whichever model runs a session, the work starts from the same directory: `docs/features/`, an [FDF](/projects/fdf/) bundle that records what the software does, why it does it, and what state each piece is in.

In [Three Years with AI](/blog/three-years-with-ai/) I introduced FDF as the place my spec-driven habits finally landed. This post is about what came after: how the format changed the way I work day to day, and how it keeps changing as the models underneath it get better.

---

## It started as a document, not a tool

FDF wasn't designed in the abstract. The first bundle appeared inside that monorepo on July 5, and its first feature document described something that had already shipped: an account-onboarding flow. Five Gherkin scenarios lifted from its API contract, a backfilled spec and plan, and three tasks marked `done` whose paths pointed at real code.

Documenting a finished feature sounds like busywork. It turned out to be the opposite. It made me state what "done" had actually meant, and it gave every agent that came later a worked example of a finished feature.

The FDF repository followed the next day, and v0.2 shipped before that day was out: a validator, scaffolding, a migration command and the first three agent skills, co-authored with Opus 4.8.

---

## What changed in how I work

### I stopped re-explaining the project

Before FDF, too many sessions opened with me rebuilding context in chat: the stack, the architecture, the conventions, the decision we made last week and why. Each session re-derived that picture a little differently, and the differences ended up in the code.

Now five Context documents hold it: `STACK.md`, `ARCHITECTURE.md`, `SURFACES.md`, `INFRA.md` and `DOMAIN.md`. They are filled once through an interview with an agent, and after that they change only with my explicit approval, with every change logged. That interview is the most leveraged conversation in the whole workflow. An agent that knows the stack builds the project's way instead of guessing a plausible one.

`DOMAIN.md` was the latest addition, and the one I underestimated. When the same concept is `Item` in one document, `Product` in another and `SKU` in a third, every reader — human or model — sees three concepts, and the drift reaches schemas and endpoints. One canonical name per concept, with the banned alternatives written beside it, removes a class of confusion that is easy to blame on the model.

### My job is three gates

FDF has three points where a human has to say yes: the context interview, the design approval before any code exists, and any edit to a Context document. Everything between them is work agents do on their own.

That quietly redefined my role. I don't approve line edits anymore. I approve intent before the work starts, and I review evidence after it ends: for every acceptance case, the command that ran and its actual output. A case that didn't run is reported as unrun, and the feature stays open. "Tests pass" is not evidence.

### Parallel by default

A task written so that an implementer with zero context can carry it out can be handed to one, and to five more at the same time. Since the monorepo adopted FDF, 181 of the 184 pull requests merged into it came from branches opened by agent sessions. In July, 11 pull requests were merged. In September, as I write this, the count is 180.

That jump isn't FDF alone; Fable 5.1 arrived at the start of September, and better models do more per session. But no model can work in parallel on intent that lives only in my head. The bundle is what makes the work divisible.

### "Done" is a claim, and claims get checked

A status in FDF is a statement of fact, and the tooling treats it that way. The validator rejects a feature marked `implementing` when all of its tasks are done. The workflow won't mark a feature `done` while an acceptance case is failing or unrun. After delivery, a feature is never edited in place: a `Fix` restores behavior its document already promises, a `Change` alters the promise, and the validator won't let a Change close until the feature's scenarios actually describe the new behavior.

The part I didn't expect to value most is the debt register. When a feature ships without, say, its batch import, it is genuinely done *and* it left a gap. Those are two facts, not a contradiction, and writing the gap down as debt lets the repo state both. The platform's register holds more than thirty entries, nearly all of them open. That doesn't embarrass me. It's the most honest dashboard I have.

### Bugs start with a root cause

When something breaks, the first move is no longer a patch. The root cause decides which document owns the repair. Code that contradicts an existing scenario gets a `Fix`, and the regression case joins the feature's test document. A case no scenario covers becomes a `Change`, because someone now has to decide what *should* happen, and that goes back through design approval. Patching first is how behavior used to drift away from what anyone had agreed to.

---

## How it's evolving with better models

FDF's two busy stretches line up with two very different sets of models at work in the monorepo:

| Period | Models | FDF |
| --- | --- | --- |
| July | Opus 4.8, Fable 5 | v0.1 to v0.4: features, Context documents, the sibling-file layout |
| September | Opus 5, Sonnet 5, Fable 5.1, Opus 5.5 | v0.5 to v0.6: Changes and Fixes, root-cause debugging, practices, `DOMAIN.md`, the debt register |

FDF itself was built by the same rotating cast: Opus 4.8 co-authored v0.2, Fable 5 the Context documents in v0.3, and Opus 5 most of v0.5 and v0.6. Four releases, v0.5.0 through v0.6.1, shipped across two days in mid-September. A few patterns stand out, and some of them land in the release I'm finishing now.

### Autonomy raises the price of ambiguity

Anthropic [describes Fable 5.1](https://www.anthropic.com/claude-fable-and-mythos-5-1) as better suited than its predecessor to long stretches of work without supervision, and its [prompting guide for Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) credits the model with getting complex problems right on the first attempt — when they are well specified. Both point the same way. The longer an agent runs without me, the more a vague requirement costs. An hour of confident, well-tested work against the wrong target is still an hour of wrong work.

Better models didn't make the documents optional. They made each document carry more weight.

### The format grew; the instructions loosened

In eleven weeks the spec grew from about 1,400 words to more than 10,000, and the execution skill from 36 lines to over 200. Nearly all of that growth is *what must be true*: new document types, new rules, new invariants for the validator to check. Very little of it is *how to think*.

The procedural side is moving the other way. The next version of the execution skill makes parallel subagents the default instead of serial work, and asks the agent to state which mode it chose, and why, in one line. Worked examples that duplicated the spec are giving way to a pointer to `fdf spec`, so every fact has one home. The same prompting guide makes this point about exactly this kind of artifact: "Skills developed for prior models are often too prescriptive," and that can lower the quality of what the model produces. The rule I've settled on: specify outcomes and invariants tightly, and leave the method to the model.

### The plan is the handoff

Context rot was the villain of my last post. Bigger windows didn't defeat it. The frontier models now have a million tokens of context, and filling it still isn't the point. Writing things down defeated it.

Planning fills a conversation with exploration and back-and-forth that execution never needs. So planning now ends with a handoff: compact the conversation or start a fresh one, and resume from a short prompt that points at files. That prompt is never allowed to carry a decision the files lack. If I'm about to write a sentence of context the plan doesn't contain, the plan is incomplete, and the sentence goes into the plan. Anthropic's guidance arrives at the same place from the other side: a fresh-context agent checking the work tends to do better than a model critiquing itself.

### Route work by judgment, not by habit

Every task in a plan now carries a label. *Mechanical* tasks leave nothing to decide (exact files, exact signatures, a pattern the code already follows) and go to a fast, Sonnet-class model. *Judgment* tasks leave design latitude, cross module boundaries, or touch concurrency, security or a data migration, and they go to the most capable model available. A mechanical task that fails its acceptance gets one retry on the stronger model, with the failure output attached. A second failure is a blocker for a human.

[Opus 5.5](https://www.anthropic.com/claude-opus-5-5) shifted the economics of that split. Anthropic says it matches Fable 5.1 on most work, runs about 40% cheaper than Opus 5, and is much better at handing work to subagents. The model I'd want orchestrating the work just got cheaper to keep in the loop. In my last post, picking a model per task was a personal habit. Now it's written into the plan.

### Context drifts even when features don't

Faster agents have a side effect: the world the Context documents describe changes faster too. A dependency upgrade, a CI move or a refactor changes no behavior, so no feature records it, and `STACK.md` quietly goes stale. Stale context is worse than none, because every later feature is designed against it.

So the next release adds a ninth skill, `fdf-checkpoint`: a periodic audit of the Context documents, the vendored spec and the agent instruction files, checked against the code and against each other. Like everything that touches context, it proposes, and I decide.

---

## What hasn't changed

The validator still has no opinions. `fdf validate` returns an exit code, and it returns the same one whichever model wrote the documents. A model that is right almost every time, opening well over a hundred pull requests a month, still gets some things wrong. The only question is whether anything notices.

The gates haven't moved either. I still approve the context, the design and every change to either. The models have become dramatically better at everything between the gates, and none of them has made a gate unnecessary.

And I still test FDF's skills with the weakest model I have. The agent that exercises them in throwaway projects runs on Haiku, gets one concrete task at a time, and is told to report exactly what happened and never to fake a result. If a basic engineer can follow a skill, a frontier model will. If it can't, the skill is the bug.

---

## What carries over

Six models in eleven weeks, and more on the way. Each one arrives knowing nothing about my project. What carries over is the bundle: the intent, the decisions, the vocabulary and an honest list of what isn't done yet.

That is the real change in how I work. My job is no longer to get the best out of a particular model. It's to keep the documents true, so that whichever model shows up next can start working on the first read.

FDF is open source. The [project page](/projects/fdf/) covers the format and how it compares with other approaches, and the spec, CLI and skills are on [GitHub](https://github.com/GiteshDalal/fdf).
