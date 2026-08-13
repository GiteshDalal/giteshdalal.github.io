# Site Content Experience Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the existing Astro site so its homepage communicates faster, FDF presents as a product, long pages are easier to navigate, mobile navigation is cleaner, social cards are page-specific, and repository rules live only in `AGENTS.md`.

**Architecture:** Keep the site statically generated and content-driven. Extend content collection metadata, derive reading/navigation data in small tested utilities, pass resolved related content and rendered headings through dynamic routes into reusable layouts/components, and verify the built HTML as the public contract. Use one shared CSS system and checked-in OG PNG assets; add no client framework and no new runtime service.

**Tech Stack:** Astro 7, TypeScript, Bun test runner, Markdown content collections, static HTML/CSS, a dependency-free custom rehype plugin.

**Spec:** `docs/superpowers/specs/2026-08-13-site-content-experience-refresh-design.md`

## Global Constraints

- Preserve the quiet technical, single-column publication character.
- Do not invent personal history, project metrics, employment claims, or new published articles.
- Keep static output, Bun, RSS, sitemap, system-aware/persisted light-dark themes, and GitHub Pages deployment.
- Add no front-end framework and no production dependency unless the existing platform cannot satisfy a requirement.
- Use semantic HTML, visible keyboard focus, and responsive behavior down to 320 CSS pixels.
- `CLAUDE.md` must be removed after its useful guidance is consolidated into `AGENTS.md`.
- Work only on `codex/site-content-experience-refresh`; do not commit or push unless the user separately requests it.

---

### Task 1: Establish executable content metadata contracts

**Files:**
- Create: `src/lib/content-meta.ts`
- Create: `src/lib/rehype-heading-links.mjs`
- Create: `src/lib/content-meta.test.ts`
- Create: `src/lib/rehype-heading-links.test.ts`
- Modify: `src/content.config.ts`
- Modify: `src/lib/content.ts`
- Modify: `astro.config.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `estimateReadingMinutes(markdown: string, wordsPerMinute?: number): number` with a minimum result of 1 and default speed of 220 words/minute.
- Produces: `shouldShowTableOfContents(readingMinutes: number, headingCount: number): boolean`, true only with at least two headings and at least five reading minutes.
- Produces: default rehype plugin that appends one `.heading-anchor` link to every rendered `h2`/`h3` carrying an id, without double-appending.
- Produces: optional blog fields `updatedDate`, `ogImage`, `relatedProject`; optional project fields `ogImage`, `relatedPost`, and `overview`.
- Produces: `getProjectById(id)` and `getPublishedPostById(id)` lookup helpers.

- [ ] **Step 1: Write failing utility tests**

  Test literal expectations: 0/blank words → 1 minute, 220 words → 1 minute, 221 words → 2 minutes, table of contents requires both thresholds, the rehype plugin appends `href="#section-id"` and an accessible label once.

- [ ] **Step 2: Run the tests and verify RED**

  Run: `bun test src/lib/content-meta.test.ts src/lib/rehype-heading-links.test.ts`  
  Expected: failure because the modules/exports do not exist.

- [ ] **Step 3: Implement the utilities and schemas minimally**

  The project `overview` schema is an optional object with literal fields:

  ```ts
  z.object({
    audience: z.string(),
    problem: z.string(),
    capabilities: z.array(z.string()).length(3),
    supports: z.array(z.string()).min(1),
    install: z.string(),
    examplePath: z.string(),
    exampleFiles: z.array(z.string()).min(1),
    validation: z.string(),
  })
  ```

- [ ] **Step 4: Configure Markdown permalink transformation**

  Import the local rehype plugin into `astro.config.mjs` and register it under `markdown.rehypePlugins` while preserving sitemap and static output.

- [ ] **Step 5: Verify GREEN**

  Run: `bun test src/lib/content-meta.test.ts src/lib/rehype-heading-links.test.ts`  
  Expected: all utility tests pass with no warnings.

### Task 2: Build the shared reader and project experience

**Files:**
- Create: `src/components/TableOfContents.astro`
- Create: `src/components/ProjectOverview.astro`
- Create: `src/components/RelatedContent.astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/layouts/ProjectLayout.astro`
- Modify: `src/pages/blog/[...slug].astro`
- Modify: `src/pages/projects/[...slug].astro`
- Modify: `src/content/blog/three-years-with-ai.md`
- Modify: `src/content/projects/fdf.md`

**Interfaces:**
- Consumes: reading utilities, Astro render `headings`, optional content metadata, resolved related entries.
- Produces: conditional table of contents, published/updated/reading metadata, related-content footer, reusable project overview, FDF-to-essay and essay-to-FDF relationships.

- [ ] **Step 1: Build the current site and write failing output assertions**

  Create the first portion of `tests/site-output.test.ts` after running `bun run build`. Assert the post output includes an `aria-label="Table of contents"`, `11 min read`, related FDF URL, and heading permalink; assert the FDF output includes the project overview, install command, table of contents, and related essay URL.

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `bun test tests/site-output.test.ts`  
  Expected: failures for missing reader/project features against the pre-change `dist/`.

- [ ] **Step 3: Implement components and route data flow**

  Use `render(entry).headings` filtered to depths 2–3. Calculate reading minutes from `entry.body`. Resolve related ids through the Task 1 lookup helpers. Render the overview before the FDF prose and related content after prose.

- [ ] **Step 4: Add truthful frontmatter**

  Set the essay's `relatedProject` to `fdf` and `ogImage` to `/og/three-years-with-ai.png`. Set FDF's `relatedPost` to `three-years-with-ai`, `ogImage` to `/og/fdf.png`, and populate the approved overview facts from the design spec. Do not assign an `updatedDate` unless the article body itself is materially edited.

- [ ] **Step 5: Rebuild and verify GREEN**

  Run: `bun run build && bun test tests/site-output.test.ts`  
  Expected: reader and project assertions pass.

### Task 3: Refresh homepage, navigation, semantics, and responsive styling

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/projects/index.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/ProjectCard.astro`
- Modify: `src/components/ThemeToggle.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/site-output.test.ts`

**Interfaces:**
- Produces: semantic homepage thesis, compact current-work list, `/projects/fdf/` primary CTA, skip link, `main#main-content`, active nav state, RSS label, adaptive project heading level, and 320px-safe navigation.

- [ ] **Step 1: Add failing built-HTML assertions**

  Assert `/index.html` has exactly one `h1`, a skip link to `#main-content`, the shortened thesis, the three current-work labels, and an FDF CTA. Assert Blog/Projects navigation receives `aria-current="page"`, the nav label is RSS rather than Subscribe, and `/projects/index.html` uses `h2` for FDF.

- [ ] **Step 2: Verify RED against the current build**

  Run: `bun test tests/site-output.test.ts`  
  Expected: the new homepage/navigation/semantics assertions fail.

- [ ] **Step 3: Implement markup and layout changes**

  Keep homepage copy within the approved design; use existing facts only. Give `ProjectCard` a `headingLevel: 'h2' | 'h3'` prop with `h3` default and pass `h2` on the projects index.

- [ ] **Step 4: Implement responsive and focus CSS**

  Add a visually hidden skip link that becomes visible on focus, a 40px theme toggle, active-nav styling, project-overview/TOC/related-content styling, heading permalink styling, and an `@media (max-width: 360px)` rule that hides `.nav-home` and keeps the remaining navigation in one row without horizontal overflow.

- [ ] **Step 5: Rebuild and verify GREEN**

  Run: `bun run build && bun test tests/site-output.test.ts`  
  Expected: homepage/navigation/semantics assertions pass along with Task 2 assertions.

### Task 4: Add distinctive social cards

**Files:**
- Create: `scripts/og/home.svg`
- Create: `scripts/og/blog.svg`
- Create: `scripts/og/projects.svg`
- Create: `scripts/og/three-years-with-ai.svg`
- Create: `scripts/og/fdf.svg`
- Create: `public/og/home.png`
- Create: `public/og/blog.png`
- Create: `public/og/projects.png`
- Create: `public/og/three-years-with-ai.png`
- Create: `public/og/fdf.png`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/layouts/ProjectLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/projects/index.astro`
- Modify: `tests/site-output.test.ts`

**Interfaces:**
- Produces: five unique 1200×630 PNGs using the site's black, off-white, muted gray, and blue palette; layouts/pages pass their specific image through the existing `BaseLayout.image` prop.

- [ ] **Step 1: Add failing OG assertions**

  Assert each built page references the expected `/og/*.png`; parse each PNG IHDR and assert `{ width: 1200, height: 630 }`.

- [ ] **Step 2: Verify RED**

  Run: `bun test tests/site-output.test.ts`  
  Expected: missing files and page-specific metadata failures.

- [ ] **Step 3: Create source artwork and raster assets**

  Use a consistent typographic system. Home, Blog, and Projects use concise page theses; the essay uses its title/date; FDF uses the feature-bundle directory motif. Rasterize locally with `qlmanage`/`sips` or another already-available tool; do not add a runtime dependency solely for asset generation.

- [ ] **Step 4: Wire page-specific metadata and verify GREEN**

  Run: `bun run build && bun test tests/site-output.test.ts`  
  Expected: all page metadata and image-dimension assertions pass.

### Task 5: Consolidate repository rules and complete verification

**Files:**
- Modify: `AGENTS.md`
- Delete: `CLAUDE.md`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `tests/site-output.test.ts`

**Interfaces:**
- Produces: one authoritative repository instruction file and documented commands/metadata.
- Produces scripts: `test` = `bun test`; `check` = `bun run build && bun test`.

- [ ] **Step 1: Expand `AGENTS.md` and remove `CLAUDE.md`**

  Include sections for project intent, supported commands, architecture boundaries, Astro documentation requirements, content/frontmatter rules, accessibility/SEO/design invariants, testing gates, preservation of user changes, and non-destructive Git behavior.

- [ ] **Step 2: Update README**

  Document `updatedDate`, `ogImage`, related-content ids, project overview fields, reading/TOC behavior, OG sources/assets, `bun test`, and `bun run check`. Remove stale wording that still calls the nav item Subscribe.

- [ ] **Step 3: Run automated verification**

  Run: `bun run check`  
  Expected: build exits 0; every Bun test passes; no warnings or errors.

- [ ] **Step 4: Run browser verification**

  Start only with `bunx astro dev --background` or the equivalent local binary background command required by `AGENTS.md`. Verify homepage and a long page at 1200×900, 390×844, and 320×800; verify no horizontal overflow, active nav, skip-link focus, 40px theme control, TOC navigation, heading permalink focus, both themes, and reduced-motion compatibility. Stop the server with `astro dev stop`.

- [ ] **Step 5: Inspect scope and repository state**

  Confirm `CLAUDE.md` is deleted, `AGENTS.md` is the sole instruction file at the root, only planned files changed, no generated `dist/` files are tracked, and unrelated user work remains untouched.

## Plan self-review

- Spec coverage: every approved recommendation maps to Tasks 2–5; truthful content constraints prevent fabricated posts while the homepage surfaces existing work.
- Shared interfaces: content schemas and helpers land before layouts consume them; OG fields land before page wiring; heading-level behavior is explicit per page context.
- File ownership: a single developer owns all writable files because layouts, schemas, styles, tests, and generated output overlap.
- Verification: utility tests demonstrate RED/GREEN; built-site tests assert public output; independent browser/tester review covers responsive and keyboard behavior.
