# Personal Site (Blog + Projects) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a quiet Astro static site on GitHub Pages with Markdown blog posts, one page per open-source project (seed: FDF), RSS-only subscribe, and system light/dark theming.

**Architecture:** Fully static Astro site. Blog and projects are Content Collections (`src/content/blog`, `src/content/projects`). Pages under `src/pages/` render lists and detail routes. Shared layouts/components hold chrome only. CSS variables + `prefers-color-scheme` handle theme with no client JS. GitHub Actions builds with Bun and deploys `dist/` to Pages.

**Tech Stack:** Astro 5 (static), Bun, TypeScript, Markdown content collections, `@astrojs/rss`, GitHub Pages + Actions.

**Spec:** `docs/superpowers/specs/2026-07-12-personal-site-design.md`

## Global Constraints

- Package manager and scripts: **Bun only** (`bun install`, `bun run dev`, `bun run build`) — not npm/yarn/pnpm
- Hosting: **GitHub Pages** at site root (`https://giteshdalal.github.io`), base path `/`
- Output: **static only** — no SSR adapter
- Subscribe: **RSS only** at `/rss.xml` — no email capture
- Theme: **system `prefers-color-scheme` only** — no toggle, no `localStorage`
- Identity copy on home (thin, not expanded): solutions architect living the AI transition in software
- Preserve existing root `LICENSE` (MIT, Gitesh Dalal)
- Draft posts (`draft: true`) excluded from lists, static paths, home teasers, and RSS
- No client-side JS required for v1
- Do not expand v1 scope (comments, analytics, CMS, tags UI, MDX components)

## File map

| Path | Responsibility |
|------|----------------|
| `package.json` | Scripts (`dev`, `build`, `preview`) and deps |
| `astro.config.mjs` | Static site config + `site` URL for RSS/canonical |
| `tsconfig.json` | Astro TS config (scaffold) |
| `src/content.config.ts` | Blog + projects collection schemas |
| `src/content/blog/*.md` | Blog posts |
| `src/content/projects/*.md` | Project pages |
| `src/lib/content.ts` | `getPublishedPosts()`, `getProjects()` helpers |
| `src/styles/global.css` | Tokens, light/dark, typography, layout |
| `src/layouts/BaseLayout.astro` | HTML shell, nav, footer |
| `src/layouts/PostLayout.astro` | Post title/date/RSS chrome + slot |
| `src/layouts/ProjectLayout.astro` | Project title/tagline/GitHub chrome + slot |
| `src/components/RssLink.astro` | Subscribe (RSS) control |
| `src/components/PostList.astro` | Post list for home + blog index |
| `src/components/ProjectCard.astro` | Project card for home + projects index |
| `src/pages/index.astro` | Home |
| `src/pages/blog/index.astro` | Blog index |
| `src/pages/blog/[...slug].astro` | Post detail |
| `src/pages/projects/index.astro` | Projects index |
| `src/pages/projects/[...slug].astro` | Project detail |
| `src/pages/rss.xml.ts` | RSS feed endpoint |
| `public/favicon.svg` | Minimal favicon |
| `.github/workflows/deploy.yml` | Bun build + Pages deploy |
| `.gitignore` | `node_modules/`, `dist/`, `.astro/` |

---

### Task 1: Scaffold Astro + Bun project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/pages/index.astro` (temporary placeholder until Task 6), `public/favicon.svg`
- Preserve: `LICENSE`, `docs/`

**Interfaces:**
- Produces: runnable `bun run dev` / `bun run build`; `site` set to `https://giteshdalal.github.io` in Astro config

- [ ] **Step 1: Initialize Astro with Bun (official create)**

From repo root (must keep `LICENSE` and `docs/`):

```bash
bunx create-astro@latest . --template minimal --install --no-git --typescript strict --yes
```

If the scaffold refuses a non-empty directory, create in a temp folder and move Astro files up:

```bash
bunx create-astro@latest /tmp/gitesh-site --template minimal --install --no-git --typescript strict --yes
# copy package.json, astro.config.*, tsconfig.json, src/, public/, .gitignore from /tmp/gitesh-site
# do NOT overwrite LICENSE or docs/
```

Ensure package manager is Bun: if a lockfile other than `bun.lock` / `bun.lockb` appears, remove it and run `bun install`.

- [ ] **Step 2: Set package scripts and site URL**

`package.json` scripts must include:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://giteshdalal.github.io',
  output: 'static',
});
```

- [ ] **Step 3: Add `.gitignore` entries**

Ensure:

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 4: Add a minimal favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#111"/>
  <text x="16" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" font-weight="600" fill="#fafafa">G</text>
</svg>
```

- [ ] **Step 5: Verify build**

```bash
bun install
bun run build
```

Expected: exit 0; `dist/` created with `index.html`.

- [ ] **Step 6: Commit**

```bash
git add package.json bun.lock bun.lockb astro.config.mjs tsconfig.json .gitignore src public
git add -u
git status
git commit -m "chore: scaffold Astro site with Bun"
```

(Use whichever lockfile Bun produces: `bun.lock` or `bun.lockb`.)

---

### Task 2: Content collections, helpers, seed content

**Files:**
- Create: `src/content.config.ts`, `src/lib/content.ts`, `src/content/blog/hello-world.md`, `src/content/projects/fdf.md`
- Create empty dirs as needed under `src/content/blog/` and `src/content/projects/`

**Interfaces:**
- Produces:
  - Collections `blog` and `projects` via `src/content.config.ts`
  - `getPublishedPosts(): Promise<CollectionEntry<'blog'>[]>` — non-draft, newest `pubDate` first
  - `getProjects(): Promise<CollectionEntry<'projects'>[]>` — sorted by `order` asc, then `title` asc
- Consumes: Astro content layer APIs

- [ ] **Step 1: Define content config**

Create `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    github: z.string().url(),
    order: z.number().default(0),
    status: z.enum(['active', 'archived']).default('active'),
  }),
});

export const collections = { blog, projects };
```

- [ ] **Step 2: Add content helpers**

Create `src/lib/content.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';

export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => data.draft !== true);
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return a.data.title.localeCompare(b.data.title);
  });
}
```

- [ ] **Step 3: Seed blog post**

Create `src/content/blog/hello-world.md`:

```markdown
---
title: "Hello world"
description: "A short first post to prove the blog pipeline works."
pubDate: 2026-07-12
---

This site is where I publish notes on AI and software — and document the open-source tools I build along the way.

New posts are Markdown files in the repo. Subscribe via [RSS](/rss.xml) if you want them in your reader.
```

- [ ] **Step 4: Seed FDF project page**

Create `src/content/projects/fdf.md`:

```markdown
---
title: "FDF"
tagline: "Documentation-as-a-directory for software features"
github: "https://github.com/GiteshDalal/fdf"
order: 1
status: "active"
---

**FDF** (Feature Document Format) keeps feature work legible to humans and AI agents: each feature is Markdown + Gherkin, with design, plan, and acceptance artifacts as stem-qualified siblings, and tasks only under a paired directory. An opinionated CLI validates the bundle so docs cannot silently drift.

## Why it exists

Agentic engineering fails when project context is vibes. FDF treats stack, architecture, surfaces, and infra as living context documents, and feature status as something that must match reality.

## Try it

- Install from [GitHub releases](https://github.com/GiteshDalal/fdf/releases), [mise](https://mise.jdx.dev), or `go install`
- `fdf init` scaffolds a bundle; `fdf new group/slug` adds a feature; `fdf validate` enforces the rules
- `fdf install` wires skills into Claude Code, Codex, or OpenCode

Full source, specs, and docs live on GitHub.
```

- [ ] **Step 5: Verify content types resolve in build**

Temporarily ensure `src/pages/index.astro` still builds (placeholder is fine). Run:

```bash
bun run build
```

Expected: exit 0. If content config errors, fix schema/paths before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/lib/content.ts src/content
git commit -m "feat: add blog and projects content collections"
```

---

### Task 3: Global styles, BaseLayout, RssLink

**Files:**
- Create: `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/RssLink.astro`
- Modify: `src/pages/index.astro` to use `BaseLayout` (still minimal body until Task 6)

**Interfaces:**
- Produces:
  - `BaseLayout` props: `title: string`, `description?: string`
  - Nav links: `/`, `/blog/`, `/projects/`, Subscribe → `/rss.xml`
  - `RssLink` optional prop `label?: string` default `"Subscribe (RSS)"`
- Consumes: global CSS with light + dark tokens via `prefers-color-scheme`

- [ ] **Step 1: Write global CSS**

Create `src/styles/global.css`:

```css
:root {
  --bg: #fafafa;
  --fg: #111111;
  --muted: #666666;
  --border: #e5e5e5;
  --link: #0b57d0;
  --code-bg: #f0f0f0;
  --measure: 42rem;
  --measure-wide: 48rem;
  --font-sans: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  --font-serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111111;
    --fg: #f2f2f2;
    --muted: #a0a0a0;
    --border: #2a2a2a;
    --link: #8ab4f8;
    --code-bg: #1c1c1c;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  color-scheme: light dark;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.6;
  background: var(--bg);
  color: var(--fg);
}

a {
  color: var(--link);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.15em;
}

a:hover {
  text-decoration-thickness: 2px;
}

.site-header,
.site-footer,
.site-main {
  width: min(100% - 2rem, var(--measure-wide));
  margin-inline: auto;
}

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border);
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.95rem;
}

.site-nav a {
  color: var(--fg);
  text-decoration: none;
}

.site-nav a:hover {
  color: var(--link);
  text-decoration: underline;
}

.site-main {
  padding: 2rem 0 4rem;
}

.site-footer {
  padding: 1.5rem 0 2.5rem;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.9rem;
}

.prose {
  max-width: var(--measure);
  font-family: var(--font-serif);
  font-size: 1.125rem;
  line-height: 1.75;
}

.prose :first-child {
  margin-top: 0;
}

.prose :last-child {
  margin-bottom: 0;
}

.prose h1,
.prose h2,
.prose h3 {
  font-family: var(--font-sans);
  line-height: 1.25;
  font-weight: 600;
}

.prose code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--code-bg);
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
}

.prose pre {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.5;
  background: var(--code-bg);
  padding: 1rem;
  overflow-x: auto;
  border-radius: 0.35rem;
}

.prose pre code {
  background: none;
  padding: 0;
}

.meta {
  color: var(--muted);
  font-family: var(--font-sans);
  font-size: 0.95rem;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stack-lg {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section-title {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 0.75rem;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.post-list li {
  margin: 0;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border);
}

.post-list a {
  color: var(--fg);
  text-decoration: none;
  font-weight: 500;
}

.post-list a:hover {
  color: var(--link);
  text-decoration: underline;
}

.project-card {
  display: block;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
  color: inherit;
  text-decoration: none;
}

.project-card:hover .project-card-title {
  color: var(--link);
  text-decoration: underline;
}

.project-card-title {
  font-family: var(--font-sans);
  font-weight: 600;
  margin: 0 0 0.25rem;
}

.project-card-tagline {
  margin: 0;
  color: var(--muted);
}

.page-title {
  font-family: var(--font-sans);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  line-height: 1.2;
  margin: 0 0 0.5rem;
}

.identity {
  font-family: var(--font-sans);
  font-size: 1.15rem;
  margin: 0;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin: 1.5rem 0;
  font-family: var(--font-sans);
}

.button-link {
  display: inline-block;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 0.35rem;
  color: var(--fg);
  text-decoration: none;
  font-family: var(--font-sans);
  font-size: 0.95rem;
}

.button-link:hover {
  border-color: var(--link);
  color: var(--link);
}
```

- [ ] **Step 2: Create RssLink**

Create `src/components/RssLink.astro`:

```astro
---
interface Props {
  label?: string;
}
const { label = 'Subscribe (RSS)' } = Astro.props;
---
<a class="rss-link" href="/rss.xml">{label}</a>

<style>
  .rss-link {
    font-family: var(--font-sans);
    font-size: 0.95rem;
  }
</style>
```

- [ ] **Step 3: Create BaseLayout**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Notes on AI and software, and open-source projects.' } = Astro.props;
const fullTitle = title === 'Home' ? 'Gitesh Dalal' : `${title} · Gitesh Dalal`;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate" type="application/rss+xml" title="Gitesh Dalal" href="/rss.xml" />
    <title>{fullTitle}</title>
  </head>
  <body>
    <header class="site-header">
      <a href="/" class="site-wordmark">Gitesh Dalal</a>
      <nav class="site-nav" aria-label="Primary">
        <a href="/">Home</a>
        <a href="/blog/">Blog</a>
        <a href="/projects/">Projects</a>
        <a href="/rss.xml">Subscribe</a>
      </nav>
    </header>
    <main class="site-main">
      <slot />
    </main>
    <footer class="site-footer">
      <p>© {new Date().getFullYear()} Gitesh Dalal</p>
    </footer>
  </body>
</html>

<style>
  .site-wordmark {
    font-weight: 600;
    color: var(--fg);
    text-decoration: none;
  }
  .site-wordmark:hover {
    color: var(--link);
  }
</style>
```

- [ ] **Step 4: Wire placeholder home through BaseLayout**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Home">
  <p class="identity">Solutions architect living the AI transition in software.</p>
</BaseLayout>
```

- [ ] **Step 5: Verify build + theme CSS present**

```bash
bun run build
grep -q "prefers-color-scheme" dist/_astro/*.css || grep -rq "prefers-color-scheme" dist/
```

Expected: build exit 0; dark-mode media query present in emitted CSS (path may vary — search under `dist/`).

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/RssLink.astro src/pages/index.astro
git commit -m "feat: add base layout, global styles, and system theme"
```

---

### Task 4: Blog list, post pages, PostList, PostLayout

**Files:**
- Create: `src/components/PostList.astro`, `src/layouts/PostLayout.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`

**Interfaces:**
- Consumes: `getPublishedPosts()` from `src/lib/content.ts`
- Produces:
  - `PostList` props: `posts: CollectionEntry<'blog'>[]`
  - Routes: `/blog/`, `/blog/<slug>/`
  - Drafts never get static paths

- [ ] **Step 1: Create PostList**

Create `src/components/PostList.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'blog'>[];
}

const { posts } = Astro.props;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
---
{posts.length === 0 ? (
  <p class="meta">No posts yet.</p>
) : (
  <ul class="post-list">
    {posts.map((post) => (
      <li>
        <a href={`/blog/${post.id}/`}>{post.data.title}</a>
        <div class="meta">{formatDate(post.data.pubDate)} — {post.data.description}</div>
      </li>
    ))}
  </ul>
)}
```

Note: In Astro Content Layer, entry id is the slug path without extension (e.g. `hello-world`). If your Astro version exposes `post.slug` instead, use that consistently everywhere.

- [ ] **Step 2: Create PostLayout**

Create `src/layouts/PostLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';
import RssLink from '../components/RssLink.astro';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
}

const { title, description, pubDate } = Astro.props;
const formatted = pubDate.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---
<BaseLayout title={title} description={description}>
  <article class="stack">
    <header>
      <h1 class="page-title">{title}</h1>
      <p class="meta">
        <time datetime={pubDate.toISOString()}>{formatted}</time>
      </p>
    </header>
    <div class="prose">
      <slot />
    </div>
    <p class="cta-row">
      <RssLink />
      <a href="/blog/">← All posts</a>
    </p>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Blog index page**

Create `src/pages/blog/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostList from '../../components/PostList.astro';
import RssLink from '../../components/RssLink.astro';
import { getPublishedPosts } from '../../lib/content';

const posts = await getPublishedPosts();
---
<BaseLayout title="Blog" description="Notes on AI and software.">
  <div class="stack">
    <div>
      <h1 class="page-title">Blog</h1>
      <p class="meta">Takes on AI and software. <RssLink /></p>
    </div>
    <PostList posts={posts} />
  </div>
</BaseLayout>
```

- [ ] **Step 4: Blog post page**

Create `src/pages/blog/[...slug].astro`:

```astro
---
import { render } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';
import { getPublishedPosts } from '../../lib/content';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<PostLayout
  title={post.data.title}
  description={post.data.description}
  pubDate={post.data.pubDate}
>
  <Content />
</PostLayout>
```

- [ ] **Step 5: Verify blog output**

```bash
bun run build
test -f dist/blog/index.html
test -f dist/blog/hello-world/index.html
grep -q "Hello world" dist/blog/hello-world/index.html
grep -q "rss.xml" dist/blog/hello-world/index.html
```

Expected: all checks exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/PostList.astro src/layouts/PostLayout.astro src/pages/blog
git commit -m "feat: add blog index and post pages"
```

---

### Task 5: Projects list, project pages, ProjectCard, ProjectLayout

**Files:**
- Create: `src/components/ProjectCard.astro`, `src/layouts/ProjectLayout.astro`, `src/pages/projects/index.astro`, `src/pages/projects/[...slug].astro`

**Interfaces:**
- Consumes: `getProjects()` from `src/lib/content.ts`
- Produces:
  - `ProjectCard` props: `project: CollectionEntry<'projects'>`
  - Routes: `/projects/`, `/projects/fdf/`
  - GitHub CTA uses `project.data.github`

- [ ] **Step 1: Create ProjectCard**

Create `src/components/ProjectCard.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  project: CollectionEntry<'projects'>;
}

const { project } = Astro.props;
---
<a class="project-card" href={`/projects/${project.id}/`}>
  <h3 class="project-card-title">{project.data.title}</h3>
  <p class="project-card-tagline">{project.data.tagline}</p>
</a>
```

- [ ] **Step 2: Create ProjectLayout**

Create `src/layouts/ProjectLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  tagline: string;
  github: string;
  status?: 'active' | 'archived';
}

const { title, tagline, github, status = 'active' } = Astro.props;
---
<BaseLayout title={title} description={tagline}>
  <article class="stack">
    <header>
      <h1 class="page-title">{title}</h1>
      <p class="meta">{tagline}{status === 'archived' ? ' · Archived' : ''}</p>
      <p class="cta-row">
        <a class="button-link" href={github} rel="noopener noreferrer">View on GitHub</a>
        <a href="/projects/">← All projects</a>
      </p>
    </header>
    <div class="prose">
      <slot />
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Projects index**

Create `src/pages/projects/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { getProjects } from '../../lib/content';

const projects = await getProjects();
---
<BaseLayout title="Projects" description="Open-source projects.">
  <div class="stack">
    <h1 class="page-title">Projects</h1>
    <div>
      {projects.map((project) => (
        <ProjectCard project={project} />
      ))}
    </div>
  </div>
</BaseLayout>
```

- [ ] **Step 4: Project detail page**

Create `src/pages/projects/[...slug].astro`:

```astro
---
import { render } from 'astro:content';
import ProjectLayout from '../../layouts/ProjectLayout.astro';
import { getProjects } from '../../lib/content';

export async function getStaticPaths() {
  const projects = await getProjects();
  return projects.map((project) => ({
    params: { slug: project.id },
    props: { project },
  }));
}

const { project } = Astro.props;
const { Content } = await render(project);
---
<ProjectLayout
  title={project.data.title}
  tagline={project.data.tagline}
  github={project.data.github}
  status={project.data.status}
>
  <Content />
</ProjectLayout>
```

- [ ] **Step 5: Verify project output**

```bash
bun run build
test -f dist/projects/index.html
test -f dist/projects/fdf/index.html
grep -q "github.com/GiteshDalal/fdf" dist/projects/fdf/index.html
grep -q "Documentation-as-a-directory" dist/projects/fdf/index.html
```

Expected: all checks exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectCard.astro src/layouts/ProjectLayout.astro src/pages/projects
git commit -m "feat: add project index and FDF project page"
```

---

### Task 6: Home page

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getPublishedPosts()`, `getProjects()`, `PostList`, `ProjectCard`, `BaseLayout`
- Produces: home with identity, latest 5 posts, all project cards

- [ ] **Step 1: Implement home**

Replace `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PostList from '../components/PostList.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { getPublishedPosts, getProjects } from '../lib/content';

const posts = (await getPublishedPosts()).slice(0, 5);
const projects = await getProjects();
---
<BaseLayout title="Home" description="Notes on AI and software, and open-source projects.">
  <div class="stack-lg">
    <section>
      <p class="identity">Solutions architect living the AI transition in software.</p>
    </section>

    <section>
      <h2 class="section-title">Latest writing</h2>
      <PostList posts={posts} />
      <p class="meta" style="margin-top: 1rem;">
        <a href="/blog/">All posts</a>
      </p>
    </section>

    <section>
      <h2 class="section-title">Open source</h2>
      <div>
        {projects.map((project) => (
          <ProjectCard project={project} />
        ))}
      </div>
    </section>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Verify home**

```bash
bun run build
grep -q "Solutions architect living the AI transition" dist/index.html
grep -q "Hello world" dist/index.html
grep -q "FDF" dist/index.html
```

Expected: all greps match.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble home with posts and projects"
```

---

### Task 7: RSS feed

**Files:**
- Create: `src/pages/rss.xml.ts`
- Depends: `@astrojs/rss` package

**Interfaces:**
- Consumes: `getPublishedPosts()`, `Astro.site` from config
- Produces: `/rss.xml` with title, description, link, items (title, pubDate, description, link)

- [ ] **Step 1: Install RSS package**

```bash
bun add @astrojs/rss
```

- [ ] **Step 2: Create RSS endpoint**

Create `src/pages/rss.xml.ts`:

```ts
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: 'Gitesh Dalal',
    description: 'Notes on AI and software.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
```

- [ ] **Step 3: Verify RSS**

```bash
bun run build
test -f dist/rss.xml
grep -q "Hello world" dist/rss.xml
grep -q "/blog/hello-world" dist/rss.xml
```

Expected: feed exists and includes the seed post. Confirm a draft would be excluded by temporarily setting `draft: true` on the seed post, rebuilding, grepping absence, then restoring `draft: false` (do not commit draft=true).

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock bun.lockb src/pages/rss.xml.ts
git commit -m "feat: add RSS feed for blog posts"
```

---

### Task 8: GitHub Pages deploy workflow + final verification

**Files:**
- Create: `.github/workflows/deploy.yml`
- Optionally modify: repo GitHub Pages settings (manual in GitHub UI — document only)

**Interfaces:**
- Produces: workflow on `push` to `main` + `workflow_dispatch`; Bun install/build; upload Pages artifact; deploy

- [ ] **Step 1: Write deploy workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

If `bun install --frozen-lockfile` fails because the lockfile format does not support that flag, use `bun install --frozen-lockfile` when `bun.lock` exists; otherwise `bun install` and document the flag that works with the installed Bun version.

- [ ] **Step 2: Full local smoke checklist**

```bash
bun run build
test -f dist/index.html
test -f dist/blog/index.html
test -f dist/blog/hello-world/index.html
test -f dist/projects/index.html
test -f dist/projects/fdf/index.html
test -f dist/rss.xml
grep -q "Solutions architect living the AI transition" dist/index.html
grep -q "github.com/GiteshDalal/fdf" dist/projects/fdf/index.html
grep -q "Hello world" dist/rss.xml
```

Optional preview:

```bash
bun run preview
```

Manually confirm in browser: nav links, FDF GitHub button, RSS link, and OS light/dark color change (toggle system appearance).

- [ ] **Step 3: Commit workflow**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy Astro site to GitHub Pages with Bun"
```

- [ ] **Step 4: Pages settings (human / after push)**

After pushing `main`:

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Confirm workflow succeeds
3. Open `https://giteshdalal.github.io` and re-run smoke mentally

Do not force-push or change branch protection as part of this task.

---

## Spec coverage checklist (plan self-review)

| Spec requirement | Task |
|------------------|------|
| Astro + Bun + static | 1, 8 |
| Home identity + latest posts + project cards | 6 |
| `/blog/`, `/blog/<slug>/` | 4 |
| `/projects/`, `/projects/<slug>/` | 5 |
| Markdown frontmatter blog/projects | 2 |
| Draft exclusion | 2 (`getPublishedPosts`), 4 paths, 7 RSS |
| RSS `/rss.xml` + Subscribe discoverability | 3 nav, 4 post/blog, 7 |
| Quiet technical CSS + system dark/light | 3 |
| Components list from spec | 3–5 |
| FDF seed + GitHub link | 2, 5 |
| GitHub Actions Pages deploy | 8 |
| No email, no theme toggle, no CMS | respected throughout |

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-12-personal-site.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — run tasks in this session with executing-plans checkpoints  

Which approach?
