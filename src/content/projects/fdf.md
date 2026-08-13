---
title: "FDF - Feature Document Format"
tagline: "Documentation-as-a-directory for software features"
github: "https://github.com/GiteshDalal/fdf"
order: 1
status: "active"
ogImage: "/og/fdf.png"
relatedPost: "three-years-with-ai"
overview:
  audience: "Teams building long-lived software with AI agents."
  problem: "Intent trapped in chat disappears, and documentation drifts away from the software."
  capabilities:
    - "Feature bundles keep specs, plans, acceptance tests, and tasks together."
    - "Lifecycle status makes every feature's current state explicit."
    - "Deterministic validation catches structural drift before it merges."
  supports:
    - "Claude Code"
    - "Codex"
    - "OpenCode"
  install: "curl -fsSL https://raw.githubusercontent.com/GiteshDalal/fdf/main/install.sh | bash"
  examplePath: "docs/features/payments/"
  exampleFiles:
    - "payments.spec.md"
    - "payments.plan.md"
    - "payments.test.md"
    - "payments/"
  validation: "fdf validate — bundle valid"
---

**FDF** (Feature Document Format) is an open documentation format — plus an opinionated CLI that enforces it — for teams building software with AI agents. Every feature lives as Markdown + Gherkin in a validated `docs/features/` bundle: its design spec, implementation plan, acceptance tests, and tasks sit right beside it as stem-qualified siblings, and a status field tracks the feature from `draft` to `done`. The `fdf` CLI validates the whole bundle, so the documentation cannot silently drift away from reality.

To understand why that matters, you have to look at how AI-assisted development actually plays out over time.

## The spectrum: vibe coding to agentic engineering

Every AI-assisted project sits somewhere on a spectrum. On one end is **vibe coding**: you describe what you want in chat, the agent writes it, you eyeball the result and keep prompting until it works. On the other end is **agentic engineering**: specifications are written down and approved before code exists, agents work from those documents, and the documents are kept true as the code evolves.

```
 Vibe Coding                                        Agentic Engineering
 ────────────●──────────────────────────────────────●────────────────
 "make it work"          the spectrum           "make it last"

 · intent lives in chat                    · intent lives in the repo
 · agent guesses architecture             · agent reads the architecture
 · context dies with the session          · context survives every session
 · speed now, debt later                  · slower start, compounding payoff
```

Neither end is wrong. What's wrong is being on the wrong end for the kind of project you're building.

### Vibe coding: brilliant for a weekend, brutal at scale

Vibe coding is genuinely great at what it's for. There is no setup, no ceremony, and the feedback loop is seconds long. For a proof of concept, a demo, a throwaway script, or exploring whether an idea is even feasible, it is the fastest way to working software that has ever existed.

The problem is what it leaves behind:

| | Vibe coding | Agentic engineering |
| --- | --- | --- |
| **Time to first demo** | Hours | Days |
| **Where the "why" lives** | Chat scrollback (gone) | Version-controlled specs |
| **New session / new agent** | Re-explains everything from zero | Reads the bundle, gets to work |
| **Architecture** | Whatever each prompt implied | Written down, human-approved |
| **Drift detection** | A painful discovery months later | A failing validation in CI |
| **Cost curve over time** | Compounds upward | Amortizes downward |

Agents made writing code cheap. What broke is the record of *why* the code exists. In a vibe-coded project, every design decision was made in a conversation that no longer exists. Each new session re-derives the architecture from the code and guesses — slightly differently each time. Contradictory patterns pile up. The agent that added feature ten never knew the constraints behind features one through nine.

That's technical debt in its purest form, and it compounds. Early on you don't feel it: the codebase is small, one context window still holds it. The further you go, the more each change costs — more tokens burned re-explaining the project, more regressions in things that used to work, more sessions spent untangling contradictions instead of shipping. Eventually the honest estimate for "add this feature" becomes "rewrite the project." For a small POC that's fine, because you were going to throw it away anyway. For anything meant to live for years, it wrecks the economics of the whole project.

### Going big demands structure

The moment a project becomes serious — a startup betting the company on its codebase, a product with paying users, anything you'd call an investment rather than an experiment — you need to move toward the engineering end of the spectrum. Not because process is virtuous, but because the math flips: the cost of writing things down is fixed and small; the cost of *not* writing them down grows with every feature.

Agentic engineering is a structured way of working with agents:

- **Specs before code.** A human approves what's being built and why, before an agent builds it.
- **Context as documents, not vibes.** Stack, architecture, interface conventions, and infrastructure are written down where every agent and every teammate reads the same truth.
- **Status that matches reality.** A feature is `draft`, `specified`, `planned`, `implementing`, or `done` — and that label must be true, not aspirational.
- **Verification by machine.** Consistency between docs and reality is checked by a tool, not by hoping everyone remembered.

FDF exists to make this way of working cheap enough to actually adopt.

## How FDF helps

FDF gives the engineering end of the spectrum a concrete, minimal shape:

- **One bundle, one source of truth.** `docs/features/` holds four mandatory context documents — `STACK.md`, `ARCHITECTURE.md`, `SURFACES.md`, `INFRA.md` — as a living snapshot of the project that changes only with explicit human approval. Agents load these instead of guessing.
- **Features as documents with a lifecycle.** `fdf new billing/invoices` scaffolds a feature; its spec, plan, acceptance tests, and task breakdown live beside it (`invoices.spec.md`, `invoices.plan.md`, `invoices.test.md`, `invoices/`). Frontmatter status walks `draft → specified → planned → implementing → done`.
- **Drift is a failing build, not a six-month discovery.** `fdf validate` checks the bundle's structural and consistency rules and exits non-zero on violations — wire it into CI and stale documentation stops being possible to merge.
- **Agents that already know the rules.** `fdf install` wires skills into Claude Code, Codex, or OpenCode so your agents route work by feature status: brainstorm when there's no spec, plan when the spec is approved, execute when tasks exist.

The result: any agent, in any session, on any machine, opens the repo and finds the same intent, the same architecture, and the same current state — without a human re-explaining it in chat.

## How is FDF different from BMAD or Superpowers?

Several projects attack the vibe-coding problem, and it's fair to ask what FDF adds. The short answer: **FDF is a format, not a framework.**

- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** simulates an agile team: persona agents (analyst, PM, architect, developer, QA) hand off PRDs, architecture documents, and sharded stories through a prescribed workflow. It's powerful, but you adopt the whole ceremony — the personas, the pipeline, the document zoo it generates. And nothing *checks* those documents afterward; once generated, they can rot like any other doc.
- **[Superpowers](https://github.com/obra/superpowers)** is a library of process skills — brainstorming, test-driven development, systematic debugging — that shape how an agent behaves *within a session*. It's excellent in-session discipline, but it's session-scoped: when the conversation ends, the process knowledge produced along the way isn't a durable, enforced artifact in your repo.

FDF deliberately occupies a different layer:

- **A format with a deterministic validator, not a workflow engine.** FDF defines what artifacts must exist, how they're named, and what consistency means — and a fast Go CLI enforces it with an exit code. Correctness doesn't depend on a model following instructions; it's checked the way a linter checks code.
- **Tool-agnostic by design.** The bundle is plain Markdown + Gherkin in git. It works with Claude Code, Codex, and OpenCode today, and with whatever harness wins next year — because the interface between humans and agents is the documents, not any particular tool.
- **Minimal surface.** Four context documents, a naming convention, a status lifecycle, and one validation command. There are no personas to configure and no pipeline to buy into. You can adopt FDF on an existing project in an afternoon.
- **Complementary, not competing.** Process skills like Superpowers govern *how an agent works right now*; FDF governs *what must exist and stay true in the repo forever*. They stack — and FDF is the layer that persists after every session ends.

If you want a validated, permanent, tool-independent record of what your software does and why — the thing that makes the tenth month of a project as cheap as the first — that's the gap FDF fills.

## Try it

The preferred way to install is the one-line script:

```sh
curl -fsSL https://raw.githubusercontent.com/GiteshDalal/fdf/main/install.sh | bash
```

- Alternatively, install from [GitHub releases](https://github.com/GiteshDalal/fdf/releases), [mise](https://mise.jdx.dev), or `go install`
- `fdf init` scaffolds a bundle; `fdf new group/slug` adds a feature; `fdf validate` enforces the rules
- `fdf install` wires skills into Claude Code, Codex, or OpenCode

Full source, specs, and docs live on GitHub.
