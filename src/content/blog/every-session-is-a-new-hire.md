---
title: "Every Session Is a New Hire"
description: "An agent's memory fails in two ways: it rots inside a long session, and it vanishes entirely between them. The fix is not a bigger context window. It's treating every session like onboarding a new teammate — and keeping the onboarding doc in the repo."
pubDate: 2026-10-08
relatedProject: "fdf"
---

The agent that understood my codebase yesterday is a stranger this morning.

Not a worse stranger, usually. Often a more capable one — a point release shipped overnight, or I just opened a fresh session with a clean context window. But it knows nothing about why the auth middleware looks the way it does, which approach we already tried and abandoned, or the constraint I spent forty minutes explaining last week. That conversation is gone. From the agent's point of view, it is day one, and I am a new manager handing it a codebase it has never seen.

The uncomfortable part is that this was always true, even inside a single session. The agent was already forgetting while we worked. The only thing that changed overnight is that I lost the ability to pretend otherwise.

---

## Two different kinds of forgetting

When people talk about agents and memory, they usually mean the obvious failure: the chat ends, the context is gone, tomorrow starts from zero. That one is real, and I'll come back to it. But it gets all the attention because it is visible. There is a second kind of forgetting that happens *during* a session, quietly, while everything still looks fine.

The intuition most of us carry is that a model reads its whole context window evenly — that 200k tokens in means 200k tokens usefully available. That intuition is wrong, and it has been measured.

Two findings are worth knowing by name:

- **Position matters.** In ["Lost in the Middle"](https://arxiv.org/abs/2307.03172), Nelson Liu and colleagues showed that models retrieve information best when it sits near the beginning or the end of the input, and measurably worse when it sits in the middle. The accuracy curve is U-shaped. Crucially, they found that extended-context variants of a model did *not* fix this — a bigger window moved the same bias around, it didn't remove it.
- **Length itself degrades reliability.** Chroma's ["Context Rot"](https://research.trychroma.com/context-rot) report ran eighteen current models — the frontier tier, not weak ones — on deliberately trivial tasks, and watched reliability fall as the input grew. Not because the task got harder. The task was the same. The context just got longer.

Put those together and you get the thing I actually feel in a long working session. The architectural constraint I explained in the first hour is now buried in the middle of a 120k-token transcript, which is exactly where retrieval is weakest. The model has not been told to ignore it. It simply weights it less, every turn, until it effectively doesn't apply.

```
 How much the model actually "remembers" a fact,
 by where it sits in a long context

 reliability
   high │●                                      ●
        │ ●                                    ●
        │   ●                                ●
        │     ●                            ●
        │        ●                      ●
    low │           ●●●●●●●●●●●●●●●●●●●
        └────────────────────────────────────────
         start          middle           end
              ↑ the constraint you
                explained in hour one
```

And here is where hallucination comes in, because hallucination is not a separate bug sitting next to this one. It is what degradation looks like from the outside. A model that has lost the real constraint does not return an error. It fills the gap with the most plausible-looking thing, confidently, in the same tone it used when it was right. The failure mode of a forgetful system that is also fluent is not silence — it's confident invention. The longer the session runs, the more of the answer is reconstruction rather than recall, and you cannot tell which is which by reading it.

---

## The reflex that doesn't work

The natural response to "the model is forgetting" is "give it more memory." Bigger window. Longer context. Feed it the whole repo.

The research above is the first problem with that: past a point, more context makes recall *worse*, not better, because you are stuffing the critical facts into the low-reliability middle and surrounding them with distractors. The second problem is economic — every token you re-feed to re-explain the project is paid for again, every session, and the bill grows with the project.

But the deepest problem is that it treats a structural fact as a temporary shortage. The session is not a container that's slightly too small. It is the wrong place to keep anything you need to survive. A chat thread has no schema, no second reader, no diff, and no way to be checked. Whatever mattered in it — the decision, the rejected approach, the reason — evaporates on close, and degrades even before then.

You cannot out-scale this. You have to stop storing memory there.

---

## So stop fighting the amnesia

The reframe that actually changed how I work: **don't try to give the agent a memory. Assume it has none, and build the thing that makes that survivable.**

Every good organization has already solved this problem, because people leave. A senior engineer quits, and the company does not lose the architecture — because the architecture was never only in her head. It's in the design docs, the README, the decision records, the onboarding guide. A new hire reads those and is productive in a week without anyone re-deriving three years of context from memory. The knowledge outlived the person who had it.

That is exactly the situation I'm in with an agent, except the turnover isn't once a year — it's every session, and sometimes mid-session. So the question stops being "how do I make the agent remember?" and becomes "what would I hand a competent new hire on day one so they didn't need to?"

| | Fighting the amnesia | Onboarding the new hire |
| --- | --- | --- |
| Where "why" lives | In the running conversation | In files in the repo |
| New session | Re-explain from scratch | Point it at the docs |
| Degrades over a long session | Yes — buried in the middle | No — re-read fresh each time |
| Survives a model swap | No | Yes |
| Checkable by a tool | No | Yes |

The right-hand column is not more work than the left — it is the same work, written down once instead of re-performed every session. The conversation was always going to contain the architecture and the constraints. The only decision is whether it also gets written somewhere a stranger can read it tomorrow.

---

## What good onboarding looks like in a repo

An onboarding doc that is wrong is worse than none, because a new hire *trusts* it. A credential that points at nothing fails loudly; a document describing a module you refactored in March fails silently, and feeds confident, wrong context to every session that reads it. So the written layer needs two properties most documentation never has: it has to be where the agent will actually look, and something has to fail when it stops being true.

This is the problem I ended up building [FDF](/projects/fdf/) around. The shape it settles on is deliberately boring:

- **A fixed place the agent reads first.** Stack, architecture, interface conventions, and infrastructure live in known files, not in whatever I happened to say in turn three. A new session loads the onboarding doc instead of guessing — and because it reads them fresh at the start, they land in high-reliability context rather than rotting in the middle of a transcript.
- **Intent attached to each feature, not to a conversation.** The spec, the plan, the acceptance tests, and the decisions sit beside the code as versioned files. The reasoning behind feature nine is readable by the session that builds feature ten, which never saw the discussion that produced it.
- **Drift that fails the build.** `fdf validate` exits non-zero when the documents and the structure disagree. A stale onboarding guide stops being something you discover six months late and becomes something CI refuses to merge. That is the difference between a document and a wiki page nobody trusts.

None of this requires my format specifically. Plenty of teams get most of the way there with an `ARCHITECTURE.md` that someone genuinely keeps true. What you can't skip is the decision underneath it: your project's memory is not going to live in the session, so you have to choose, on purpose, where it lives instead — and put something in place that notices when it goes stale.

---

Treat the agent as brilliant and amnesiac, because that is what it is. Brilliant means it can get productive fast from a good onboarding doc. Amnesiac means it will absolutely need one, every single time, forever. The teams that do well with agents over long projects are not the ones who found a model that remembers. They're the ones who stopped needing it to.

The stranger shows up again tomorrow morning, sharp and context-free. The only question that matters is what's waiting in the repo when it does.
