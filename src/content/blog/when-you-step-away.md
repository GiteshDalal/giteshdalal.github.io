---
title: "When You Step Away"
description: "Grok Bot, OpenAI's Dots and Claude Duet shipped within ten weeks of each other, and they are one product: an agent with its own computer, your logins, a memory and an approval queue. What that changes for the engineers whose systems those agents touch, and for the architects who have to draw them."
pubDate: 2026-10-27
draft: true
relatedProject: "fdf"
---

Three companies launched an always-on AI agent in ten weeks, and two of them sold it with the same words.

xAI, on 11 August: Grok Bot's agents "share a computer of their own in the cloud, so jobs do not stall when you step away."

Anthropic, on 21 October: Claude Duet "[keeps working when you step away](https://x.com/claudeai/status/2112984664256241837), and checks with you before it acts on your behalf."

In between, on 29 September, OpenAI launched Dots at DevDay with the same promise in different words: agents that carry on after you close the chat, and come back with finished work for approval.

When you step away. That phrase is the whole announcement. For as long as most of us have used these tools, stepping away ended the work. You closed the tab and the agent stopped, because there was nothing left to drive it. These launches are the end of that assumption, and most of what changes for engineers and architects follows from it.

---

## Three launches, one product

Read the three launch pages side by side and the differences are mostly branding.

[Grok Bot](https://x.ai/news/introducing-grok-bot) is "your team of always-on agents." The bots sign into the tools you already use, "including platforms with no clean API or MCP," remember how you like things done, and "only come back when something needs your approval." You can run several at once, with one acting as a chief of staff over specialists. It started as an internal prototype, and xAI says teams there built bots for sales outbound, marketing campaigns, office operations and bug fixes.

[Dots](https://venturebeat.com/technology/openai-launches-dots-always-on-ai-agent-coworkers-and-chatgpt-space-where-they-can-collaborate-with-human-teams) run on GPT-6 Astra. Each gets its own cloud computer and browser, connects to more than 4,000 apps, learns your preferences and standards, and can be reached in ChatGPT, Slack or Teams. While you are inactive, a Dot reviews your connected apps for anything that needs attention. Alongside them OpenAI launched [ChatGPT Space](https://chatgpt.com/features/space/), a shared layer where employees, ChatGPT, Codex and Dots work against the same context.

[Claude Duet](https://claude.com/product/claude-duet) runs on Opus 5.5 in its own cloud computer, with more than 6,000 connectors and plugins. It "briefs you every morning, drafts next steps, then goes quiet until something needs you." For now it is a research preview, on a US waitlist for Pro and Max subscribers.

Meta's [Muse](https://www.iclarified.com/102030/meta-launches-muse-a-personal-ai-agent-that-handles-everyday-tasks) launched on 8 September in the same shape, which makes it four.

| | Grok Bot | Dots | Claude Duet |
| --- | --- | --- | --- |
| Launched | 11 August, beta | 29 September | 21 October, research preview |
| Where it works | One cloud computer, shared by all your bots | Its own cloud computer and browser | Its own cloud computer |
| What it reaches | Your tools, including ones with no clean API | 4,000+ apps | 6,000+ connectors and plugins |
| What it remembers | Conversations, and how you like things done | Your preferences, standards and habits | Your history with Claude and your connected apps |
| When it comes back | When something needs your approval | When your rules or its own review say ask | When something needs you |

Every column gives the same answers. A computer that isn't yours. Your logins. A memory that outlives the conversation. A queue of decisions waiting for you to come back. The only real difference is where each product draws the line between "it just does it" and "it asks first", and I'll come back to that line, because it's the part you will end up designing.

---

## The chat window was the stop button

In [Every Session Is a New Hire](/blog/every-session-is-a-new-hire/) I wrote about the session as the place an agent's memory gets lost. In [State Left the Session](/blog/state-left-the-session/) I argued that the protocol and the models were both moving state out of it. These launches finish the move. The session is no longer where the work happens. It's where you check in on work that happened without you.

Something goes with it that was never written down anywhere: the session was also the stop button. An agent in a chat window or a terminal worked inside a conversation you had opened, mostly while you were watching, and when you closed it, the work stopped. Nobody designed that as a safety mechanism. It was just how the products worked, and it put a boundary around every agent most of us have ever used.

```
 Chat       you ask, it answers           you close it, it stops
 Session    you hand it a task            you close it, it stops
 Standing   you give it a goal            you close it, it carries on,
            and the rules it works by     and comes back for approval
```

[Agents Don't Know How to Stop](/blog/agents-dont-know-how-to-stop/) ended on a question: is the thing keeping an agent in its lane a wall or a preference? A standing agent no longer has your attention as its wall. What stops it now is whatever you set up before you left: the goal, the rules about what it may do alone, and the limits of the computer it runs on. All three companies know this, which is why the approval queue is a headline feature on every launch page, not a footnote.

---

## Engineers went first

None of this is new to anyone who writes code with an agent. A computer to work on, access to the tools, a memory file, a permission prompt before anything risky: that's the loop Claude Code, Codex and Cursor have been running in our terminals for over a year. The new products are that loop with the IDE taken out, pointed at everyone else's work.

The way they are sold makes the lineage plain. SpaceX's $60 billion purchase of Cursor [became effective on 14 August](https://thenextweb.com/news/spacex-cursor-acquisition-completed-gpu-fleet), three days after Grok Bot launched, and Grok Bot was offered to Cursor's paid subscribers from day one, not only Grok's. Cursor now describes its own direction as "building AI teammates that can be given real work." OpenAI put Codex into ChatGPT Space beside the Dots. Duet comes from the company that makes Claude Code. The coding agent was the prototype. These are the production release.

That gives engineers a head start, and a specific one. We've already met every failure these products are about to meet in sales, operations and finance. The agent that misreads what matters. The confident answer that's wrong. The review queue that fills faster than anyone can drain it. Anthropic's Duet page says it with unusual honesty: Duet "may misread a thread or miscalibrate what's urgent," and "can miss something that arrives between checking in with you." Anyone who has worked with a coding agent for a month will read that and nod.

---

## What changes for software engineers

**Work arrives that nobody asked for.** OpenAI's own example of a Dot at work is a software one. It watches incoming customer feedback, spots recurring bugs and requests, scopes the smaller fixes, builds and tests them, and returns pull requests with demonstration videos. xAI's is similar: one bot reproduces a bug in the product's UI, files a ticket, and hands the fix to a debugging bot. Read either as an engineer and the change is in who opens the pull request. Until now, an agent's pull request had a person behind it who had asked for it. A standing agent opens one because a goal told it to, on a schedule that doesn't sleep.

[The Attempt Got Cheap](/blog/the-attempt-got-cheap/) argued that the expensive part of agentic engineering had moved from writing code to checking it. Standing agents push that further: when the attempts arrive unprompted, review becomes the bottleneck of the whole system. And [Find Issues, If Any](/blog/find-issues-if-any/) showed what a badly framed brief costs across 250 pull requests. A standing goal is a brief that never finishes running. Write it badly once and you get the same wrong question every few hours, for as long as the agent runs.

**Other people's agents will change your systems.** Engineering examples are a minority on xAI's page. Most are a sales bot keeping CRM records clean, an operations bot processing invoices out of Gmail, a demo-readiness bot that checks the environment overnight and fixes broken seed data. Each one is a change to a system an engineering team owns, made by an agent a colleague in another department set up, with no pull request and no review. That's a new kind of production change. The people who own the systems will be the ones asked to make it safe: separate scoped accounts for agents, audit trails that say which agent did what, dry runs, and operations that can be undone.

**Your interface is now an API, whether you built one or not.** Grok Bot advertises that it works across platforms "with no clean API or MCP." That means an agent driving your product's screens the way a person would, with none of the scopes, rate limits or attribution an API gives you. Shipping a proper API or an MCP server used to be about integration partners. Now it's how you set the terms on which agents use your product, instead of letting them work those terms out from the screen.

**The job moves to the ends of the loop.** I don't know what this does to the number of engineers, and I don't trust anyone who claims to. I'm more confident about what it does to the day. The middle of the loop, writing the change, is what these products automate. The two ends are not: deciding what done means and what an agent may do without asking, and judging what comes back. Those were always the senior parts of the job. They are becoming most of it.

---

## What changes for solution architects

**There is a new actor on the diagram.** OpenAI is piloting specialist Dots that each get their own organisational identity, credentials and system access, assigned to a defined business role, and it's working with Microsoft to govern them through Agent 365. That is not a chat feature. It's a new kind of principal in your architecture: one that runs in a vendor's cloud, holds live sessions to your systems, keeps a memory you don't host, and acts on its own schedule. Every question you'd ask of a new integration applies to it — where it runs, what it can reach, what it holds, who audits it — and most architecture diagrams I've seen have no box for it yet.

**Draw the boundary where the documentation draws it, not the launch post.** Grok Bot is the clearest lesson so far. Launch coverage [read the marketing](https://www.digitalapplied.com/blog/grok-bot-ai-teammates-launch-cloud-computer-2026) as each bot getting its own computer. xAI's [security documentation](https://docs.x.ai/grok-bot/approvals-security-and-privacy) is plainer: "All of your Bots share one cloud computer assigned to your user account," and "files, browser sessions, and command line credentials on that computer are available across your Bot roster." Then, in a line every architect should pin above their desk: "Do not use separate Bots as a security boundary."

That isn't a scandal. It's honest documentation, saying what the marketing didn't. A separate bot is a separate work surface, not a separate security boundary: if a payroll bot and a recruiting bot sit on the same account, the recruiting bot can use the payroll bot's open session. For every one of these products, the first question in a design review is what is actually isolated from what — per agent, per user, or per organisation — and the answer you trust is the one in the docs.

**Approval policy is architecture now.** Every product draws the line between acting and asking somewhere. Dots let users or administrators mark each action as allowed, needing approval, or prohibited; some, such as changing a password, stay with the human, and the background work a Dot does while you're away is read-only. Duet asks before sending messages or paying, and [won't trade securities or move money between accounts](https://techcrunch.com/2026/10/22/claude-duet-app-is-anthropics-bet-on-agents/). Muse has a separate Sentinel agent review anything it sends to the internet. xAI's docs list what to keep behind approval — sending, publishing, purchasing, deletion, production changes — and add a sentence worth reading twice: "An approval controls the proposed action. It does not reverse work already completed."

Someone has to decide those tiers for every system an agent can reach, and in most organisations that will be an architect. My starting point:

| What the agent does | Where I'd start |
| --- | --- |
| Read, search, summarise | Allowed |
| Draft a message, document or pull request | Allowed; a person sends or merges it |
| Send, publish, merge, update a record | Approval, unless the action can be undone |
| Pay, delete, change permissions or production | Approval, and design the action to be reversible |
| Move money, change credentials, accept terms | People only |

The table matters less than the property underneath it: reversibility. Approvals don't scale. An agent that comes back fifty times a day trains its owner to tap approve without reading. xAI's docs advise approving only actions whose target or effect you can identify, which is good advice that nobody follows on the fiftieth prompt. The way to keep approvals meaningful is to need fewer of them, and the way to need fewer is to make more actions safe to undo. That's a property of the systems the agent touches, not of the agent, and designing it in is architecture work.

**Memory is the new lock-in.** Each of these agents learns how you work, your preferences and standards and routines, and keeps it in its vendor's cloud. That's useful, and it's a migration problem waiting to happen: switch vendors, and the agent you spent months teaching starts over. It's a governance question too. In ChatGPT Space, anything written onto a shared Page is visible to everyone with access to it, including what ChatGPT writes there from memory.

The answer is the one this blog keeps returning to. The context that matters — what a system is for, what done means, which rules are binding, why a strange-looking piece of code is deliberate — belongs in documents your organisation owns, in the repository, where an agent from any vendor can read it. Vendor memory is a cache. The documents are the source of truth. That's the problem I use [FDF](/projects/fdf/) for, but the principle doesn't depend on any tool. If the only copy of your team's conventions lives in an agent's memory, you have handed your onboarding doc to a supplier.

---

Stepping away used to end the work. Now it's when the work happens.

That moves the effort, for engineers and architects alike. Less of it goes into the hours at the keyboard beside an agent. More goes into what you leave behind when you go: the goal, the rules about what it may do alone, the boundary of the computer it runs on, and the documents it reads to understand what it's working on. None of that is new. It's the brief, the permissions and the spec, the same things every post here comes back to. What's new is that they now do their job while nobody is watching.

Duet's page says it "uses good judgment when it reaches out and knows what can wait." Maybe it does. The judgment that matters most is still yours, and you use it before you step away.
