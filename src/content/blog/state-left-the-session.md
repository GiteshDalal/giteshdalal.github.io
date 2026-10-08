---
title: "State Left the Session"
description: "MCP deleted sessions from the protocol, Opus 5 started writing corrections into its own memory, and a dozen frontier models shipped in three weeks. Read together, those are the same announcement."
pubDate: 2026-08-28
relatedProject: "fdf"
---

Three things happened over the last five weeks that, read separately, look like unrelated release notes. A protocol revision. A model launch. A very crowded release calendar. Read together, they are the same announcement made three times, by three different layers of the stack, to three different audiences.

The announcement is this: the session is no longer a safe place to keep anything.

---

## The protocol deleted its own memory

The [Model Context Protocol](https://modelcontextprotocol.io) shipped its [2026-07-28 specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/), and the headline change is a deletion. The `initialize`/`initialized` handshake is gone. The `Mcp-Session-Id` header is gone. Protocol version, client info, and client capabilities — the things you used to exchange once, at connection time — now travel in `_meta` on every single request.

MCP is a stateless request/response protocol now. That is a deliberate breaking change, not a workaround.

```
 Before (2025-11-25)                 After (2026-07-28)
 ─────────────────────               ──────────────────────
 client → initialize                 every request carries
 server → capabilities                 its own version,
 client → initialized                  client info,
 ─── session pinned ───                capabilities
 request  (Mcp-Session-Id)
 request  (Mcp-Session-Id)           any request → any instance
 request  (Mcp-Session-Id)           behind a round-robin LB
 ─── session dies, state gone ───
```

The operational payoff is obvious once you see it. Servers run behind a plain round-robin load balancer with no shared storage. Gateways route and meter on an `Mcp-Method` header without parsing a JSON body. Clients cache `tools/list` responses using the new `ttlMs` and `cacheScope` hints instead of re-fetching a tool catalogue that changes twice a year.

But the part worth sitting with is not the infrastructure win. It is the note in the [release candidate write-up](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/) explaining what to do when your server genuinely does need to remember something. You do not get a session back. You return a handle — a `basket_id` — and the model threads it back as an argument on the next call. The state is still there. It has just been moved somewhere the model can see.

The spec's phrasing is better than mine: state becomes "visible to the model rather than hidden away."

That sentence is doing a lot of work, and it is not really about transports.

---

## The model started keeping its own notes

[Claude Opus 5](https://www.anthropic.com/news/claude-opus-5) landed on 24 July, positioned explicitly as "a step change improvement for the Opus tier powering long-running agents." Long-running is the operative word. Not smarter on a single turn — durable across many.

The example Anthropic chose to lead with is a monitoring agent that manages part of its own memory in production. It flagged a potential anomaly, re-checked its own assumption against production, found the signal was benign, wrote the correction into its memory, and retired its own monitoring queries.

The framing in the announcement: the agent "treats its context as a living document."

Notice what is load-bearing in that sentence. It is not a bigger context window. A window is something you fill and then lose. A document is something you write, re-read later, and correct in place. When the frontier lab describes its most capable agent tier, the metaphor it reaches for is a file, not a conversation.

---

## The models underneath you keep changing anyway

Now the third thing, which is less a event than a weather pattern. Public release trackers logged roughly a dozen frontier or near-frontier releases in the first four weeks of August:

| Date | Release |
| --- | --- |
| Aug 3 | Qwen3.8-Max |
| Aug 10 | GPT-5.6-Cyber |
| Aug 11 | Nemotron 3.5 Lightning |
| Aug 12 | Grok 4.6 |
| Aug 13 | Gemini 3.7 Flash, DeepSeek-V4-Pro-0813 |
| Aug 14 | GLM-5.3, Qwen3.8-27B |
| Aug 21 | DeepSeek-V4-Flash-Vision-Exp |
| Aug 26 | GLM-5.3-Flash, Qwen3.8-Flash-Next |

Roughly one release every two days, across at least seven labs. ([llm-stats](https://llm-stats.com/llm-updates), [aireleasetracker](https://aireleasetracker.com/latest) — trackers disagree at the margins, which is itself informative.)

I have no interest in arguing which of those is best. The leaderboard will have turned over before the argument settles; half these names will be deprecated tiers by Christmas. The useful signal is the cadence, and what the cadence implies: whatever model your workflow is tuned to today, you will be running a different one within a quarter, quite possibly from a different vendor, quite possibly because your finance team looked at the token bill and made the decision for you.

Anthropic also [previewed a Model Hardware Standard](https://www.anthropic.com/news) this week — a shared specification for agents operating physical devices. Same direction of travel: standardise the interface, because the thing behind the interface is going to be swapped.

---

## Three layers, one conclusion

| Layer | Where state used to live | Where it is moving |
| --- | --- | --- |
| Transport | Pinned session on one server instance | Handles the model passes back explicitly |
| Model | Whatever fits in this context window | A document the agent reads and rewrites |
| Vendor | The model you happened to standardise on | Something you will replace within months |

Nobody coordinated this. The MCP maintainers were solving load balancing. The Opus team was solving long-horizon reliability. The release calendar is just competition. Three groups optimising for three unrelated things, all arriving at the same conclusion: **hidden, session-scoped state is a liability.**

When independent parts of a system converge on the same answer without talking to each other, that usually means the answer is structural rather than fashionable.

---

## What this means for how you actually work

The industry has been quietly externalising state at every layer it controls. It has not externalised the one layer you control, because it can't. That one is yours.

- **Stop treating the conversation as a workspace.** A chat thread is a transport, not storage. It has no schema, no validation, no diff, and no second reader. Everything in it that mattered — the constraint you explained, the approach you rejected and why — evaporates on close. The protocol just formalised this by deleting sessions outright; treat your conversations the same way.
- **Make state addressable.** The MCP pattern generalises cleanly. Instead of an agent that *knows* the architecture because you told it forty turns ago, you want an agent that *reads* the architecture from a path. `docs/architecture.md` survives a context reset. Turn 40 does not.
- **Prefer artifacts a machine can check.** Externalised state is only worth anything if the handle is still valid. A `basket_id` that points at nothing is worse than no session, because it fails silently. The same is true of a design document describing a module you refactored in March. If nothing verifies the link between the written record and the system, the record becomes an active liability — confidently wrong context, fed to every agent that reads it.
- **Assume the model gets replaced.** Given the calendar above, any workflow whose correctness depends on one model's particular habits has a shelf life measured in weeks. Anything expressed as a document in your repository is portable to whatever ships next Tuesday.
- **Write the durable layer yourself, because nobody ships it for you.** Vendors are making their layers stateless precisely *because* it scales. But state does not disappear when you delete the session — it relocates. The only place left for it is your repository.

That last point is the uncomfortable one. Every stateless design pushes a small amount of bookkeeping onto its caller. Twelve of them at once push quite a lot, and the caller here is you.

---

## The layer nobody ships for you

This is the problem I ended up building [FDF](/projects/fdf/) around, well before the protocol made the argument for me: if the durable record is going to live in the repo, it needs a shape and something that fails the build when it stops being true. A specification that drifts is just a session transcript with better formatting.

You do not need my format for this. Plenty of teams get most of the benefit from an `ARCHITECTURE.md` that someone actually maintains. What you cannot skip is the decision itself — deciding, deliberately, where your project's memory lives once you accept it is not going to live in the session.

Because that decision has been made for you at every other layer of the stack. In the space of five weeks, the transport gave up sessions, the model started writing its own notes to disk, and the market made it clear that no particular model is worth building a workflow around.

The chat window is the last place still pretending to remember things. It doesn't.
