---
title: "Three Years with AI"
description: "How I went from pasting error messages into ChatGPT to making four AI agents write a fantasy novel — and why readers called it slop anyway."
pubDate: 2026-07-12
---

We've all seen the flashy tech demos and hyperbolic headlines about what artificial intelligence can do. But what happens when you actually embed these tools into your daily workflow, day in and day out, for years?

Looking back to where it all really started for me in 2024, my relationship with AI has evolved from using it as a glorified search engine to deploying multi-agent systems for creative writing, building complex backends, and pioneering custom developer frameworks.

Here is the unfiltered story of my journey through the AI boom — the breakthroughs, the frustrations, the structural hacks, and the hard realities of "context rot."

---

## Phase 1: The Gateway Drug (Replacing Stack Overflow)

Before I fully integrated AI into my development ecosystem, my initial interaction with models like ChatGPT and Gemini was simple: a Stack Overflow replacement.

Instead of copy-pasting an obscure error message into a Google search and scrolling through endless, snarky forum threads, I started dumping my application errors straight into the chat prompt.

- **The Learning Curve:** They didn't always get it right on the first try.
- **Context Loading:** I frequently had to feed them layers of project context to get a viable output.
- **The Result:** Through a conversational loop, we would eventually get to the solution.

It wasn't perfect, but it was vastly faster than the old way of troubleshooting. It killed the forum search for me. I was hooked.

---

## Phase 2: The Coding Catalyst & The Go E-Commerce Project

By 2024, I decided to take the plunge into dedicated AI code assistants. At the time, the landscape was shifting; GitHub Copilot wasn't quite hitting the mark for me, leaving two main choices: Cursor and Codium.

I chose Codium because it offered a highly generous free auto-complete tier, and I wasn't ready to commit to a paid subscription for an unproven tool. It turned out to be an incredible choice. I was writing code across a diverse stack — primarily Go and Dart (for Flutter applications), alongside Java, Kotlin, and occasional Groovy scripts for work.

```
My AI Development Stack (2024)
├── Go & Dart (Personal Projects & Flutter Apps)
└── Java, Kotlin & Groovy (Work Environments)
```

The real test came when I applied it to a personal project: building a heavy Go-based e-commerce platform. Most enterprise platforms are built on Java, making them costly to run. Leveraging my e-commerce background, I wanted to build something highly efficient and cheap to operate using Go.

With Codium's autocomplete, I wrote all the core modules — pricing, catalog, checkout, and inventory — within just one and a half months. While its early step-planning multi-file features (which evolved into WinServe and later Devin paradigms) felt clunky and required frequent rejections, the localized multi-place editing capabilities completely changed my development velocity. It remained my primary editor for nearly a year.

---

## Phase 3: The Creative Leap (Writing a Novel with Claude Code)

Eventually, I migrated to Claude Code, keeping a premium, maximum-usage subscription for 13 months because I was burning through tokens exploring its boundaries. I jumped in before features like "skills" or "commands" existed, back when agentic workflows were just surfacing.

To push the tool beyond code, I undertook a massive hobby project: writing a complete high-fantasy novel.

Instead of treating the AI as a singular chatbot, I architected a system of specialized markdown (.md) agents embedded directly inside a GitHub repository. Each agent had a distinct persona and goal:

- **The Storyliner/Architect:** Powered by Claude Opus to break down the overarching plot.
- **The Writer:** Responsible for drafting scenes based on structured prompts.
- **The Editor & Reviewer:** Tasked with thematic consistency and structural flow.
- **The Critique & Grammar Fixer:** A dedicated Haiku/Sonnet agent that reviewed text line-by-line for grammatical mechanical precision.

### The Software Engineering Approach to Literature

I treated the book exactly like a software project. I built a robust `world_knowledge/` directory in my repository containing detailed markdown files for the magic system mechanics, regional histories, and world maps. Characters had distinct profile sheets detailing their backstories, behavioral traits, and speech patterns.

For the actual writing, every single chapter file began with a YAML front matter snapshot. This tracked the exact state of the universe at that moment:

```yaml
---
chapter: 12
location: Sovereign_Docks
character_state:
  name: Kaelen
  coin_balance: 42_silver
  thought_process: "Distrustful of the guard's offer."
  end_stage: "Escaped via the lower canal."
---
```

### Linting for Prose: My Writing Guidelines

Just as any serious codebase enforces a style guide and linter rules, I quickly realized my agents needed the literary equivalent. Left unguided, the models drifted into generic "AI prose" — overwrought metaphors, repetitive sentence rhythms, and characters who all sounded the same.

So I built a `writing_guidelines/` directory in the repo, and every agent was required to load the relevant guideline files before touching a chapter. These weren't vague suggestions like "write well." They were strict, enforceable rules, exactly like coding standards:

```markdown
# scene_structure.md
- Every scene must open in-motion. No waking up, no weather reports.
- One POV per scene. Head-hopping is a hard failure.
- Every scene must change something: a relationship, a goal, or the
  reader's information. If nothing changes, the scene gets cut.

# prose_flow.md
- Vary sentence length. Three long sentences in a row is a lint error.
- Dialogue tags: "said" and "asked" only. No "he exclaimed vehemently."
- Banned phrases: "little did he know", "a testament to",
  "couldn't help but", "tapestry of".
- Show emotion through action and dialogue. Naming the emotion
  directly ("he felt angry") is flagged for rewrite.
```

The Critique agent effectively became my prose linter — it didn't judge whether the writing was *good*, it validated the text against these concrete rules and returned violations, line by line, the same way `golangci-lint` returns findings against a Go file. Subjective quality judgments were left to the Editor agent, working from its own separate guideline set covering pacing and thematic consistency.

This separation was the real unlock. When "good writing" is an undefined vibe, the model flails. When it's a specification document, the model executes. It was spec-driven development for fiction — a year before I formalized the same instinct into FDF.

---

## Phase 4: Confronting "Context Rot" & Technical Deadends

While the agent architecture allowed me to complete the novel, it exposed the structural boundaries of large language models: it was an absolute token hog. As the project scaled, I hit a massive wall: **Context Rot**.

At that stage, context windows were capped around 256k. The foundational world-building documents and character sheets consumed nearly half of that window before a single word of the new chapter was even generated. The model began losing focus, hallucinating completed tasks, and suffering from severe drift.

> **Example:** A gritty pirate character would suddenly stop using maritime slang mid-scene and begin speaking in pristine, formal British English because the model lost track of its character trait context.

### My Structural Mitigations

1. **Shrinking Chapter Lengths:** I discovered the absolute sweet spot for high-quality AI literary generation is 1,000 to 1,500 words per chapter. Attempting longer outputs caused the reviews to divert and the narrative to fall apart.
2. **Aggressive Multi-Review Loops:** I instituted automated workflows where chapters underwent 3 to 5 continuous multi-agent revision loops before being committed.
3. **The Auditory Quality Check:** Once committed to Git, I opened the chapter in Microsoft Edge and used the Read Aloud feature to listen to the prose, manually correcting jarring transitions or unnatural dialogue flows.

I ultimately published the short novel on Royal Road. While it was a brilliant technical success for me, the audience reception highlighted a cultural hurdle: the community heavily avoids works flagged with AI assistance, quickly dismissing them as "AI slop" regardless of how much human structural engineering went into the plot.

---

## Phase 5: The Architect's Evolution (Spec-Driven Development)

The deep learnings from my novel-writing project directly translated back into my software engineering habits. I realized early on that tools like Claude Code were capable of extraordinary orchestration if you stopped trying to code by "vibe" and started writing strict specifications.

My workflow underwent a major paradigm shift:

| Old Way: Human-in-the-Loop | New Way: Agentic Specification |
| --- | --- |
| Sitting in front of the IDE approving every line edit. | Utilizing highly detailed Plans and architecture briefs. |
| Chatting continuously in a single, bloated window. | Spawning localized, short-lived sub-agents for specific implementation tasks. |
| Manually tracking cross-file code references. | Executing terminal commands via dangerously skip permissions and reviewing the final PR. |

By utilizing sub-agents, I completely solved the coding context rot problem. Instead of forcing one massive chat session to implement a whole system — which causes the model to lose focus and hallucinate progress — a master plan spawns tiny, context-insulated sub-agents to do one job, report back, and die.

### Ditching MCP for Lean Local Tooling

When the Model Context Protocol (MCP) exploded in popularity, I experimented with it heavily. However, I found that complex MCP integrations (like full GitHub MCP servers) bloated the context window unnecessarily with background noise. Because I prefer keeping my context windows exceptionally lean, I dropped general MCPs and switched to executing raw, highly targeted terminal commands, such as using the GitHub CLI (`gh`) directly inside the agent terminal.

### Open Knowledge Format (OKF) & Creating FDF

Managing design documentation across massive codebases remained a challenge. I studied Google's Open Knowledge Format (OKF), which champions organizing project knowledge bases via `.md` files equipped with YAML front matter so agents can quickly scan attributes without reading entire directories.

Taking inspiration from this, I developed and open-sourced my own highly opinionated framework: **FDF (Feature Document Format)**. Available on GitHub with an accompanying validation CLI tool, FDF enforces strict spec-driven development. It ensures your AI agents treat software engineering like a real-world engineering team would — validating features against concrete specification documents rather than guessing intent.

---

## Phase 6: The Current 2026 AI Landscape Evaluated

Today, the tooling ecosystem is radically different, and I select models based entirely on the task's cognitive requirements rather than brand loyalty.

```
                  ┌──────────────────────────────┐
                  │   Task-Specific AI Routing   │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌─────────────────┐     ┌─────────────────┐
│ Deep Architecture│    │ Agentic Coding  │     │ Blazing Fast    │
│   & Planning     │    │  & Open Keys    │     │ Iteration & PRs │
├──────────────────┤    ├─────────────────┤     ├─────────────────┤
│   Model: Fable   │    │  Model: Codex   │     │ Model: Grok 4.5 │
└──────────────────┘    └─────────────────┘     └─────────────────┘
```

### 1. Fable: The Master Architect

For deep cloud architecture, system design, and security vulnerability scanning, Fable is completely unmatched. As a Solutions Architect, I am naturally skeptical of automated system designs, yet I rarely find myself disagreeing with its output. It is slow and deliberate, but its multi-angle planning is so sound that I no longer open Figma or architectural charting tools manually; I let Fable design the infrastructure layout.

> 💡 **Case Study: The Hyper-Cheap Go-to-Rust Migration**
>
> I recently put Fable's architectural brilliance to the ultimate test by tasking it to convert my original Go e-commerce platform entirely into Rust.
>
> My overarching goal for this project has evolved: I want to aggressively minimize infrastructure costs to a near-zero floor. Current corporate e-commerce offerings are incredibly expensive for small-to-medium operations. By migrating the codebase to Rust, I am driving the operational footprint down so low that I can eventually offer this platform completely free for small businesses, while providing an incredibly cheap, high-throughput solution for medium businesses and massive enterprises alike. Fable meticulously handled the complex system translation, optimizing the architecture to confidently serve millions of requests on a shoe-string budget.

### 2. OpenAI GPT Codex: The Playground for Engineers

If you want to escape ecosystem lock-in, GPT Codex is the current gold standard. Anthropic has increasingly locked down Claude Code, preventing developers from using their API keys in third-party development harnesses. Codex allows total freedom. You can plug it into custom orchestration rigs like Hermes, Pi, or OpenCode. If you practice strict spec-driven development instead of vibe coding, Codex inside a customized harness delivers pristine production results.

### 3. Grok 4.5: The Speed Daemon

Grok 4.5 has become an absolute favorite for daily iteration. While its raw cognitive capacity sits closer to Sonnet-level performance rather than the heavy-lifting tiers of Fable or GPT 5.6, it is blazingly fast and highly cost-effective. Thanks to modern agentic frameworks (like the paradigms popularized by Orent, which teach base models how to construct their own execution environments), a highly responsive model like Grok 4.5 can comfortably achieve elite production outputs without needing the most expensive reasoning models for every single line of code.

---

## Final Thoughts: The Shift in My Role

If my journey through the trenches of AI engineering has taught me anything, it's that raw model intelligence is only half the battle; the harness and the specifications you build around it dictate the final quality. I no longer view AI as a magic auto-complete tool or a quick fix for an error message. I treat it as a highly capable, infinitely scalable business and engineering partner. The models are incredibly smart — and with the right guardrails, they allow a single architect to build platforms capable of serving millions of users completely for free. My primary job has permanently shifted from writing the code manually to providing flawless structural guidance, designing rigorous specifications, and engineering clean context parameters.
