# Personal site + blog + open-source projects — Design

**Date:** 2026-07-12  
**Status:** Approved for implementation planning  
**Repo:** `giteshdalal.github.io`  
**Live URL:** `https://giteshdalal.github.io`

## Goal

Build a quiet, multi-page personal site that:

- Says almost nothing personal beyond a thin identity line (solutions architect living the AI transition in software).
- Hosts a **Medium-simple blog** of takes on AI / software, authored as Markdown in-repo.
- Documents **open-source projects** with **one page per project** and a clear GitHub link.
- Lets readers **subscribe via RSS only** (no email capture in v1).

## Non-goals (v1)

- Long about/resume/CV page
- Email newsletter, comments, search, tags/categories UI
- Analytics, CMS, MDX-heavy interactive posts
- Manual theme toggle or persisted theme preference
- Single-page scroll-only marketing site

## Stack

| Choice | Decision |
|--------|----------|
| Framework | **Astro** (static site generation) |
| Package manager / scripts | **Bun** (`bun install`, `bun run dev`, `bun run build`) |
| Content | Markdown in Astro **Content Collections** |
| Hosting | **GitHub Pages** from this repo |
| CI | GitHub Actions: Bun → build → deploy `dist/` |
| Client JS | None required for v1 |

## Site map

| Route | Purpose |
|-------|---------|
| `/` | Minimal home: identity, latest posts, project cards |
| `/blog/` | Post index (title, date, description) |
| `/blog/<slug>/` | Article (reading layout) |
| `/projects/` | Index of all open-source projects |
| `/projects/<slug>/` | Project detail + GitHub CTA |
| `/rss.xml` | Full feed of published posts |

**Global nav (sparse):** Home · Blog · Projects · Subscribe (→ `/rss.xml`)

## Information architecture

### Home

- One-line identity: solutions architect living the AI transition in software.
- No long bio.
- Latest posts (e.g. 3–5).
- Project cards (title, tagline → project page).

### Blog

- List + detail pages only.
- Reading experience: narrow measure (~65–70ch), generous line-height, calm hierarchy.
- Each post and the blog index expose **Subscribe (RSS)** → `/rss.xml`.

### Projects

- One Markdown entry → one page.
- Page content: what it is, why it exists, how to try it (as needed).
- Primary external CTA: **GitHub** URL from frontmatter.
- v1 seed content: **FDF** (`https://github.com/GiteshDalal/fdf`), copy aligned with the public project story (docs-as-directory, CLI validation, agent harness installs) without embedding the full FDF repo.

## Content model

### Blog — `src/content/blog/<slug>.md`

```yaml
---
title: string          # required
description: string    # required; index + RSS summary
pubDate: date          # required
draft: boolean         # optional; default false; drafts excluded from lists, routes, and RSS
---
```

Body: Markdown article body.

### Projects — `src/content/projects/<slug>.md`

```yaml
---
title: string          # required
tagline: string        # required; cards + page subtitle
github: string         # required; absolute GitHub URL
order: number          # optional; lower first; default 0 or by title
status: string         # optional; "active" | "archived" for display only
---
```

Body: project page prose.

### Publish flow

1. Add or edit a Markdown file under the appropriate collection.
2. Commit and push to `main`.
3. GitHub Actions builds with Bun and deploys to Pages.
4. Local preview: `bun run dev`.

Draft posts (`draft: true`) must not appear in home teasers, `/blog/`, post routes, or RSS.

## Visual system

**Tone:** Quiet technical — whitespace, minimal chrome, almost no decoration.

**Typography**

- UI / nav / labels: system sans stack (`system-ui`, etc.).
- Post body: system serif stack for a Medium-adjacent reading feel.
- Code: monospace with subtle background; no loud syntax themes required in v1.

**Layout**

- Single column; prose max-width ~680px; home/project listings may use ~720–800px if needed.
- No gradients, hero art, or shadow-based card systems as the design language.

**Color & theme**

- Light-first palette: near-white background, near-black text, muted gray for meta.
- One restrained link/accent color.
- **Dark theme supported** via CSS `prefers-color-scheme`.
- Theme follows **system preference on load** only — no in-site toggle and no `localStorage` theme override in v1.
- Light and dark share the same layout; only surfaces and text contrast change.

## Components (minimal)

| Piece | Role |
|-------|------|
| `BaseLayout` | HTML shell, nav, footer, global styles |
| `PostLayout` | Blog article chrome (title, date, RSS CTA) |
| `ProjectLayout` | Project chrome (title, tagline, GitHub CTA) |
| `PostList` | Reusable list for home + `/blog/` |
| `ProjectCard` | Home / projects index card |
| `RssLink` | Consistent “Subscribe (RSS)” control |

Fully static HTML/CSS; no client-side JS required for theme or navigation.

## Repo layout

```
/
├── src/
│   ├── content/
│   │   ├── blog/
│   │   └── projects/
│   ├── layouts/
│   ├── components/
│   ├── pages/              # index, blog/, projects/, rss.xml.ts
│   └── styles/             # global + light/dark tokens
├── public/                 # favicon, static assets
├── astro.config.mjs
├── package.json
├── bun.lock
├── .github/workflows/deploy.yml
└── docs/superpowers/specs/ # design docs (this file)
```

Preserve the existing root `LICENSE` (MIT, Gitesh Dalal).

## Build & deploy

1. Workflow on push to `main` (and optionally `workflow_dispatch`).
2. Checkout → setup Bun → `bun install --frozen-lockfile` (or equivalent) → `bun run build`.
3. Publish Astro `outDir` (`dist/`) to GitHub Pages.
4. Site at domain root: base path `/` (user/organization Pages for `giteshkumar` / `giteshdalal.github.io` pattern — this repo is the Pages source).

Astro config must emit a fully static site suitable for Pages (no SSR adapter required).

## RSS

- Endpoint: `/rss.xml`.
- Source: published blog posts only, newest first.
- Item fields at minimum: title, link, description (or content snippet), pubDate.
- Discoverability: nav “Subscribe”, plus RSS link on blog index and post layout.

## Seed content (implementation)

- **Project:** FDF — title, tagline from public positioning, GitHub `https://github.com/GiteshDalal/fdf`, body sufficient for a useful project page (not a full docs portal).
- **Blog:** zero or one sample post is acceptable; collection and routes must work empty or with a single post.
- Home identity string fixed as agreed (wording may be lightly edited for grammar, not expanded into a bio).

## Testing & verification

- `bun run build` succeeds locally and in CI.
- Smoke after deploy or local preview:
  - `/`, `/blog/`, one post (if present), `/projects/`, `/projects/fdf/`, `/rss.xml`
  - GitHub link on FDF page resolves
  - RSS lists only non-draft posts
  - OS light/dark preference changes site colors without a toggle
- No automated E2E required in v1 beyond build success; optional later.

## Success criteria

1. Site leads with thin identity + blog + projects — not a personal brand dump.
2. New post = new Markdown file + push → appears on index, home teaser, and RSS.
3. FDF has its own page with a working GitHub CTA; more projects use the same pattern.
4. Posts read quiet and Medium-simple.
5. Subscribe = RSS only, easy to find.
6. Theme follows system light/dark on load.
7. Bun + Astro + GitHub Actions deploy to `giteshdalal.github.io` from `main`.

## Open decisions closed in this design

| Topic | Decision |
|-------|----------|
| Primary orientation | Blog + projects; minimal personal |
| Subscribe | RSS only |
| Authoring | Markdown in repo |
| Visual | Quiet technical |
| Theme | System `prefers-color-scheme` |
| Framework | Astro |
| Toolchain | Bun |
| Hosting | GitHub Pages |

## Implementation note

Next step after this spec is approved on disk: write an implementation plan (`docs/superpowers/plans/…`) then implement. Do not expand v1 scope without updating this document.
