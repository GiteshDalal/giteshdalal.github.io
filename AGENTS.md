# Repository Instructions

## Project intent

This repository is Gitesh Dalal's static personal publication and open-source portfolio. Keep it focused on authored essays, current interests already supported by the content, and maintained projects. It is not a résumé, a metrics-driven personal-brand page, or a generic product dashboard.

## Supported commands

- `bun install` installs dependencies.
- `bun run dev -- --background` starts Astro's managed background development server. Manage it with `bunx astro dev status`, `bunx astro dev logs`, and `bunx astro dev stop`.
- `bun run build` builds the static site into untracked `dist/` output.
- `bun test` runs utility and generated-site contract tests.
- `bun run check` runs the production build and the complete test suite. Set `ASTRO_TELEMETRY_DISABLED=1` in restricted environments.
- `bun run preview` serves a completed production build.

Do not start a foreground development server in an agent session. Stop any background server you start before handing work back.

## Architecture boundaries

- Keep the site statically generated with Astro and managed with Bun.
- Content belongs in Markdown collections under `src/content/blog/` and `src/content/projects/`; schemas belong in `src/content.config.ts`.
- Collection queries and id lookups belong in `src/lib/content.ts`. Small build-time derivations and Markdown transforms belong in `src/lib/` and need focused tests.
- Reusable HTML belongs in `.astro` components and layouts. Routes resolve collection relationships and pass rendered content/headings into those components.
- Shared presentation belongs in `src/styles/global.css`. Preserve the system-aware, persisted light/dark theme.
- Do not introduce a front-end framework, client hydration, runtime service, or production dependency unless the existing static platform cannot satisfy an approved requirement.
- Treat `public/` as checked-in static assets. Do not track `dist/`.

## Astro documentation

Use the current [Astro documentation](https://docs.astro.build) and consult the relevant guide before changing that area:

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Framework components](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Markdown](https://docs.astro.build/en/guides/markdown-content/)
- [Styling](https://docs.astro.build/en/guides/styling/)
- [Internationalization](https://docs.astro.build/en/guides/internationalization/)

## Content and frontmatter rules

- Never fabricate posts, publication or update dates, personal history, employment claims, project metrics, user counts, performance claims, or commercial outcomes.
- Preserve an author's existing meaning. Surface current interests only when they are already stated in repository content.
- Blog entries require `title`, `description`, and `pubDate`. Optional fields are `draft`, `updatedDate`, `ogImage`, and `relatedProject`.
- Supply `updatedDate` only after a material article edit; it controls visible update metadata and `dateModified` structured data.
- Project entries require `title`, `tagline`, and `github`. Optional fields are `order`, `status`, `ogImage`, `relatedPost`, and `overview`.
- Related-content values are collection ids without slashes or extensions and must resolve to published content.
- A project `overview` contains `audience`, `problem`, exactly three `capabilities`, one or more `supports` values, `install`, `examplePath`, one or more `exampleFiles`, and `validation`.
- Page-specific Open Graph images live in `public/og/`; editable source artwork lives in `scripts/og/`. Social PNGs must be 1200×630.

## Design, accessibility, and SEO invariants

- Preserve the quiet technical, single-column publication character. Avoid generic card grids, dashboard chrome, decorative gradients, and animation without a content purpose.
- Use the validated feature-bundle directory as the one subject-specific signature motif; keep other decoration restrained.
- Maintain semantic heading order, one page `h1`, a keyboard-visible skip link, `main#main-content`, active navigation state, and descriptive link/control names.
- Preserve strong `:focus-visible` indicators, a theme-control target of at least 40×40 CSS pixels, and reduced-motion compatibility.
- Support 320 CSS pixels without horizontal page overflow. Long code and tables may scroll within their own containers.
- Keep canonical, Open Graph, Twitter card, and JSON-LD metadata truthful and page-specific. Use `public/og-default.jpg` only as a fallback.
- Long-form pages derive reading time from Markdown, show a contents navigation only at five or more minutes with at least two level-two/three headings, and expose visible heading permalinks.

## Testing gates

- Use test-driven development for executable behavior: add a focused failing test, observe the expected failure, implement minimally, and observe it passing.
- Human prose, configuration-only changes, and generated binary assets do not need artificial source-text tests; verify their real consumer or output contract instead.
- Utility tests cover reading-time/TOC thresholds and heading-anchor transformation.
- `tests/site-output.test.ts` treats generated HTML and social-image headers as the public contract; run a fresh build before it.
- Before completion, run `ASTRO_TELEMETRY_DISABLED=1 bun run check`. For visual changes, also verify the homepage and one long-form page at 1200×900, 390×844, and 320×800, including keyboard focus, both themes, and reduced motion.

## Preservation and Git hygiene

- Preserve unrelated user work and existing dirty-tree changes. Inspect status and diffs before editing; never overwrite work you do not own.
- Make focused changes only. Do not perform unrelated refactors or regenerate assets outside the task.
- Do not use destructive Git commands such as `git reset --hard` or `git checkout --` to discard work.
- Do not commit, push, force-push, merge, or open a pull request unless the user explicitly asks.
- Never commit secrets, local environment files, dependency caches, or generated `dist/` output.
