---
title: "FDF - Feature Document Format"
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
