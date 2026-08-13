# Site Content Experience Refresh — Design

**Date:** 2026-08-13  
**Status:** Approved for implementation  
**Repo:** `giteshdalal.github.io`

## Goal

Keep the existing quiet technical publication aesthetic while making the site faster to understand, easier to navigate on long pages, more useful on narrow screens, and more recognizable when shared.

## Experience principles

- The homepage should explain Gitesh's point of view and strongest work within one mobile viewport.
- The site remains a publication plus open-source portfolio, not a résumé, skills cloud, or personal-brand landing page.
- FDF should show its product shape before presenting its long-form argument.
- Long-form reading aids appear only when the content is long enough to need them.
- One subject-specific visual motif—the validated feature bundle—carries the visual identity; decoration stays restrained elsewhere.
- Existing content is not rewritten into invented claims. Current interests may be surfaced compactly, but new personal facts are not fabricated.

## Homepage

- Replace the paragraph-styled identity with a semantic `h1`.
- Use a concise thesis: solution architecture, AI-assisted delivery, and tools that keep humans and agents aligned.
- Reduce the biography to one short paragraph.
- Use three explicit actions: read the blog, explore FDF, connect on LinkedIn.
- Add a compact "Current work" list using only the three interests already stated on the existing homepage: FDF, the low-cost commerce rewrite, and multi-agent workflows.
- Keep the latest-writing and open-source sections.

## FDF project page

Add a reusable project overview before the Markdown body. It contains:

- Audience: teams building long-lived software with AI agents.
- Problem: intent trapped in chat disappears and documentation drifts.
- Three capabilities: feature bundles, lifecycle/status, deterministic validation.
- Supported agent tools: Claude Code, Codex, and OpenCode.
- Install command and direct GitHub action.
- A compact visual of `docs/features/payments/` ending in a successful validation result.

The existing long-form project narrative remains intact below the overview.

## Long-form reading

- Derive reading time from Markdown content at build time.
- Support an optional `updatedDate`; show it and use it as `dateModified` only when supplied.
- Generate a table of contents from level-two and level-three Markdown headings for long pages.
- Add visible, keyboard-focusable permalink anchors to rendered `h2` and `h3` headings.
- Add a related-content block at the end: the existing AI essay links to FDF and FDF links back to the essay.

## Navigation and accessibility

- Add a skip-to-content link and a stable `main` id.
- Add `aria-current="page"` to the active primary navigation entry.
- Rename the raw-feed navigation action from "Subscribe" to "RSS".
- On viewports at or below 360px, hide the redundant Home link because the GD mark already links home.
- Increase the theme toggle hit area to at least 40 by 40 CSS pixels.
- Fix project-card heading levels: `h2` on the project index and `h3` under the homepage's Open source `h2`.
- Preserve strong visible focus indicators and reduced-motion compatibility.

## Metadata and social sharing

- Make the homepage description specific to AI-assisted software delivery and open-source tooling.
- Add optional `ogImage` fields to blog and project content schemas.
- Create 1200×630 branded PNGs for Home, Blog, Projects, the AI essay, and FDF.
- Continue using the existing default image only as a fallback.

## Repository guidance

- Consolidate the duplicated `CLAUDE.md` and `AGENTS.md` guidance into one expanded `AGENTS.md` and remove `CLAUDE.md`.
- The guide must define supported commands, architecture boundaries, content rules, design/accessibility constraints, testing gates, documentation links, and Git hygiene.
- Document the new metadata fields and verification commands in `README.md`.

## Verification criteria

- `bun run build` succeeds without warnings or errors.
- Automated tests cover reading-time derivation, heading permalink transformation, and generated HTML contracts.
- Generated pages contain the homepage `h1`, skip link, active nav state, reading metadata, contents navigation, related links, FDF overview, and correct project-index heading level.
- Every new OG PNG is exactly 1200×630.
- Manual responsive verification covers 1200×900, 390×844, and 320×800 in both the homepage and at least one long-form page.
- Keyboard verification covers the skip link, theme toggle, navigation, table of contents, heading permalinks, and primary calls to action.
