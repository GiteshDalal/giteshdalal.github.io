# giteshdalal.github.io

Personal site: thin identity, a Markdown blog, and one page per open-source project. Built with **Astro** (static), managed with **Bun**, hosted on **GitHub Pages**.

Live URL: [https://giteshdalal.com](https://giteshdalal.com) (GitHub Pages; repo still `giteshdalal.github.io`)

## Prerequisites

- [Bun](https://bun.sh) (package manager and scripts)
- Git

Node is not required day to day; Astro’s engine constraint may still expect a recent Node if you run tooling outside Bun.

## Setup

```bash
git clone https://github.com/GiteshDalal/giteshdalal.github.io.git
cd giteshdalal.github.io
bun install
```

## Day-to-day commands

| Command | What it does |
|--------|----------------|
| `bun run dev -- --background` | Managed background dev server (usually http://localhost:4321) |
| `bun run build` | Production build into `dist/` |
| `bun test` | Utility and generated-site contract tests |
| `bun run check` | Production build followed by every test |
| `bun run preview` | Serve the production build locally |

Theme (light/dark) follows **system preference** on first visit. Use the **sun/moon button** in the header to toggle; your choice is stored in `localStorage` under the key `theme`.

## Site map

| Path | Content |
|------|---------|
| `/` | Site thesis, current work, latest writing, project cards |
| `/blog/` | All published posts |
| `/blog/<slug>/` | Single post |
| `/projects/` | All projects |
| `/projects/<slug>/` | Project page + GitHub CTA |
| `/rss.xml` | RSS feed of published posts |

## Add a blog post

1. Create a Markdown file under `src/content/blog/`.  
   Filename becomes the URL slug: `my-post.md` → `/blog/my-post/`.

2. Use this frontmatter:

```markdown
---
title: "Your title"
description: "One-line summary for the index and RSS"
pubDate: 2026-07-12
# draft: true
# updatedDate: 2026-08-13
# ogImage: "/og/my-post.png"
# relatedProject: "fdf"
---

Post body in Markdown.
```

| Field | Required | Notes |
|-------|----------|--------|
| `title` | yes | Shown on the page and in lists |
| `description` | yes | Blog index, home teaser, RSS |
| `pubDate` | yes | Sort date (`YYYY-MM-DD` is fine) |
| `draft` | no | Default `false`. If `true`, excluded from home, `/blog/`, post routes, and RSS |
| `updatedDate` | no | Material update date; shown on the post and used as structured `dateModified` only when supplied |
| `ogImage` | no | Site-root path to a page-specific 1200×630 social image |
| `relatedProject` | no | Project collection id to show after the article |

3. Preview: `bun run dev` → open `/blog/your-slug/`.

4. Publish: commit and push to `main` (see [Deploy](#deploy)).

Example seed post: `src/content/blog/hello-world.md`.

## Add a project

1. Create a Markdown file under `src/content/projects/`.  
   Filename becomes the URL slug: `fdf.md` → `/projects/fdf/`.

2. Use this frontmatter:

```markdown
---
title: "Project name"
tagline: "Short one-liner for cards"
github: "https://github.com/you/repo"
order: 1
status: "active"
# ogImage: "/og/project-name.png"
# relatedPost: "post-id"
# overview:
#   audience: "Who this is for"
#   problem: "The problem it solves"
#   capabilities: ["First", "Second", "Third"]
#   supports: ["Tool name"]
#   install: "install command"
#   examplePath: "docs/features/example/"
#   exampleFiles: ["example.spec.md"]
#   validation: "validation result"
---

Project page body in Markdown.
```

| Field | Required | Notes |
|-------|----------|--------|
| `title` | yes | Page title and card title |
| `tagline` | yes | Subtitle on cards and the project page |
| `github` | yes | Absolute GitHub URL (“View on GitHub”) |
| `order` | no | Lower numbers first (default `0`); ties break by title |
| `status` | no | `active` (default) or `archived` (shown on the page) |
| `ogImage` | no | Site-root path to a page-specific 1200×630 social image |
| `relatedPost` | no | Published blog collection id to show after the project narrative |
| `overview` | no | Product summary containing audience, problem, exactly three capabilities, supported tools, install command, example bundle, and validation result |

3. Preview: `bun run dev` → open `/projects/your-slug/`.

4. Publish: commit and push to `main`.

Example seed project: `src/content/projects/fdf.md`.

## Drafts

- Set `draft: true` on a **blog** post to keep it out of public lists, static post pages, and RSS.
- Remove `draft` or set `draft: false` when ready to publish.
- Project pages have no draft flag in v1 — omit or don’t commit unfinished project files until they are ready.

## Reading experience

- Reading time is derived from each Markdown body at build time at 220 words per minute, with a one-minute minimum.
- A table of contents appears when a page takes at least five minutes to read and has at least two `h2`/`h3` headings.
- Rendered `h2` and `h3` headings receive keyboard-focusable permalink anchors.
- Related project/post ids are resolved at build time and rendered after the long-form body.

## Social images

Page-specific editable SVG artwork lives under `scripts/og/`; the corresponding deployed 1200×630 PNG assets live under `public/og/`. Home, Blog, Projects, the AI essay, and FDF each have a distinct image. Content without an `ogImage` continues to use `public/og-default.jpg`.

## RSS

- Feed: `/rss.xml` (published posts only, newest first).
- The nav **RSS** action, blog index, and post footers link to the feed.
- There is no email newsletter in v1.

## Deploy

Deploy is automatic from **`main`** via GitHub Actions (`.github/workflows/deploy.yml`):

1. `bun install --frozen-lockfile`
2. `bun run build`
3. Upload `dist/` to GitHub Pages

**First-time (or if the site does not update):**

1. Push `main` to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Confirm the **Deploy to GitHub Pages** workflow succeeds under the Actions tab.

Site config uses:

- `site: https://giteshdalal.com` (`astro.config.mjs`); custom domain via `public/CNAME`
- Static output, base path `/`

## Layout of the repo (content-focused)

```text
src/
├── content/
│   ├── blog/           # posts (*.md)
│   └── projects/       # project pages (*.md)
├── content.config.ts   # frontmatter schemas
├── lib/                # collection lookups, metadata utilities, Markdown transforms
├── pages/              # routes
├── layouts/            # BaseLayout, PostLayout, ProjectLayout
├── components/         # PostList, ProjectCard, RssLink
└── styles/global.css   # quiet technical + system light/dark
public/                 # favicon, Open Graph images, and static assets
scripts/og/             # editable SVG sources for social images
tests/                  # generated-site output contracts
.github/workflows/      # Pages deploy
docs/superpowers/       # design + implementation plan
```

## Design docs

- Spec: `docs/superpowers/specs/2026-07-12-personal-site-design.md`
- Plan: `docs/superpowers/plans/2026-07-12-personal-site.md`
- Refresh spec: `docs/superpowers/specs/2026-08-13-site-content-experience-refresh-design.md`
- Refresh plan: `docs/superpowers/plans/2026-08-13-site-content-experience-refresh.md`

## License

MIT — see `LICENSE`.
