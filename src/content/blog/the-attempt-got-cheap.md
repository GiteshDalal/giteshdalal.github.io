---
title: "The Attempt Got Cheap"
description: "GPT-6 Sol and Luna lead with cost per task instead of raw scores, and that moves the expensive part of agentic engineering from writing code to checking it."
pubDate: 2026-09-23
draft: false
relatedProject: "fdf"
---

On September 22, two frontier launches landed within hours of each other, and neither of them led with a bigger number. Anthropic shipped [Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5) with lower prices and a claim that it costs about 40% less to run than Opus 5 on typical work. OpenAI shipped [GPT-6 Sol and GPT-6 Luna](https://openai.com/index/introducing-gpt-6-sol-and-luna/), the mid and budget tiers under GPT-6 Astra, and almost every benchmark in the announcement comes with a second column: what the task cost.

I wrote about Opus 5.5 earlier today in [Six Models, One Bundle](/blog/six-models-one-bundle/), mostly about how it changes which model I keep in the orchestrating seat. This post is about the other launch, and about the shape the two share. When the headline is "same score, a fraction of the price", the question a working engineer should ask is not "which model is best?" It's "what is expensive now?"

---

## What OpenAI actually shipped

Stripped of the chart styling, the announcement is mostly a price sheet with evidence attached.

| | GPT-6 Sol | GPT-6 Luna |
| --- | --- | --- |
| **Tier** | Mid | Budget |
| **Input / output (per 1M tokens)** | $2 / $10 | $0.10 / $0.50 |
| **API id** | `gpt-6-sol` | `gpt-6-luna` |
| **DeepSWE v1.1** | 68.8% at max effort | 66.6% at max effort |
| **Where** | ChatGPT Work, Codex, API | Same, plus the desktop app for Free and Go users |

OpenAI says both are 50% cheaper than their GPT-5.6 counterparts, and that cached input reads get a 90% discount. For context, Opus 5.5's list price is $4 per million input tokens and $20 per million output. Luna's per-token price is a fortieth of that.

The benchmark claims that matter for coding:

- **DeepSWE v1.1**, complex engineering tasks in real codebases: Sol at max effort scores 68.8%, which OpenAI puts "within 1.1 percentage points of Claude Fable 5's highest score", at roughly 80% lower cost per task. Luna at max scores 66.6%.
- **FrontierCode**, whether an agent's changes are ready to merge: Sol "is able to match Claude Fable 5.1 xhigh at much lower cost."
- **OSWorld 2.0**, computer use: Sol at xhigh gets 60.5% against Opus 5 at medium's 60.3%, again at about 80% lower cost.

And one line that I think is more interesting than any of the scores: both models show "lower rates of misleading claims about their coding work" than GPT-5.6. OpenAI notes the evaluation is built to provoke dishonesty and that deception is much rarer in normal use. Still, a vendor putting "how often does the model misreport what it did" in a launch post tells you where the real failure mode is.

---

## Reading a cost-per-task chart

Cost-per-task numbers are more useful than bare scores, because they're closer to what you pay. They're also easier to bend. A few things to keep in mind before rearranging anything around them.

**Effort levels are a free variable.** Sol and Luna run at low, medium, high, xhigh and max. Almost every comparison in the post pairs a specific OpenAI effort level with a specific competitor effort level: Sol at xhigh against Opus 5 at medium, Sol at max against Fable 5 at xhigh. Those pairings are chosen, not neutral. A model at max effort spends more tokens per task, so "80% cheaper" at one setting says little about another.

**The comparison target moved the same day.** Most of the Anthropic baselines are Opus 5 and Fable 5 or 5.1. Opus 5.5, priced lower than Opus 5 and announced as matching Fable 5.1 on most work, shipped the same day. Every "X% cheaper than Opus 5" ratio was already stale by the evening.

**The benchmarks are the vendor's choice.** DeepSWE, FrontierCode, OSWorld and AutomationBench are reasonable tests. They are also the ones in the post. Your codebase isn't in any of them.

None of that makes the launch less real. A budget-tier model within a few points of last season's frontier on real-codebase engineering tasks, at fifty cents per million output tokens, is a genuine shift. It just means the right response is to measure on your own work, not to re-plan around a chart.

---

## What gets expensive instead

Here is the part I keep coming back to. If a competent attempt at a well-specified task costs a few cents, the attempt is no longer where the money or the time goes. Three things are.

```
          cost of one agent task
 ┌──────────────────────────────────────────────┐
 │ deciding what to ask for          ← human    │
 │ the attempt itself                ← shrinking│
 │ checking whether it's right       ← growing  │
 │ fixing what the check missed      ← growing  │
 └──────────────────────────────────────────────┘
```

**Deciding what to ask for.** A cheap model that does exactly what it was told is only as good as what it was told. I made this argument about autonomy in my last post: the longer an agent runs without you, the more a vague requirement costs. Cheapness pushes in the same direction from a different side. When attempts are nearly free, you'll run more of them, and every ambiguous instruction gets multiplied by the number of runs.

**Checking the result.** The honest-reporting metric is the tell. The scenario the eval is built to catch is an agent that says it finished, says the tests pass, and is wrong. At frontier prices you might have one agent doing a task and you reviewing it. At Luna prices you can have ten, and nobody is reviewing ten diffs by eye. Verification has to be something a machine can run: tests that encode what "done" means, a build that fails on the wrong thing, checks that don't ask the model whether it succeeded.

**Recovering from a confident mistake.** A wrong change that passes review is the most expensive outcome in the whole pipeline, and it doesn't get cheaper when tokens do. If anything the volume makes it more likely.

In [Three Years with AI](/blog/three-years-with-ai/) I wrote that spec-driven skills let a fast, cheaper model produce production-grade output without the most expensive reasoning model on every line. That was a claim about the attempt. Sol and Luna make that side of the trade easier. They do nothing for the other side.

---

## Switching harnesses got cheaper too

A smaller item from the same week points the same way. [Claude Code 2.1.277](https://code.claude.com/docs/en/changelog), released September 18, added `AGENTS.md` support: in a project with no `CLAUDE.md`, Claude Code now reads `AGENTS.md` instead. Codex and OpenCode already use that file. The practical effect is that one instruction file in a repository can now brief all three tools.

Put that next to the pricing news and the picture is consistent. Moving a task between vendors used to cost you something twice: a different price, and a different set of instruction files to maintain. Both costs are dropping. The model you use for a given task is becoming a routing decision you can revisit weekly, not a commitment.

That only works if everything the agent needs to know lives in the repository rather than in one tool's configuration or one session's scrollback. An instruction file tells an agent how to behave in a codebase. It doesn't tell it what a feature is supposed to do, why a decision was made, or whether the work is finished. That knowledge has to be somewhere any harness can read and any check can verify.

---

## What I'd take from it

| If you're optimizing for | The launch changes | The launch doesn't change |
| --- | --- | --- |
| **Throughput** | Many more attempts per dollar | Someone still has to say what "right" is |
| **Model choice** | Budget tiers are real contenders for well-scoped work | You need your own evals to know which work that is |
| **Portability** | Instruction files are converging across tools | Intent and acceptance criteria still need a home |
| **Trust** | Vendors are measuring misreported work | "The agent said it passed" is still not a test |

This is why I've leaned on documents that live beside the code rather than in any one tool. In my own projects that's [FDF](/projects/fdf/), where every feature's spec, acceptance tests and task status sit in a `docs/features/` bundle and `fdf validate` fails the build when they stop matching. Whichever model or harness runs the next task reads the same files, and the check doesn't care who wrote the code.

The cheap attempt is good news. It just moves the work. The engineers who get the most out of Luna-priced models won't be the ones running the most agents. They'll be the ones who wrote down what "done" means before the agents started.
