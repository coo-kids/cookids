---
name: bun-workspaces
description: Maintain Cookids Bun workspaces, scripts, generated content, and Bun tests. Use for workspace or build tooling changes.
---

# Bun workspaces for Cookids

Run commands from the repository root. Use `bun install`, `bun run build`, and `bun test`; do not introduce npm, pnpm, or Yarn lockfiles.

`contents/catalog.yml` and `contents/site.yml` are the editable source. Vite les transforme en modules côté SPA et `Bun.file` les charge côté backend : aucun fichier intermédiaire ne doit être généré.

Consult [the official Bun llms reference](references/bun.llms.txt.md) when a Bun/runtime choice is not obvious.
