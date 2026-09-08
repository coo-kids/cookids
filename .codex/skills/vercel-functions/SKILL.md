---
name: vercel-functions
description: Maintain Cookids Vercel deployment configuration and its thin API function adapters. Use for Vercel functions, headers, environment settings, or release automation.
---

# Vercel Functions for Cookids

The root `api/orders.ts` is only the Vercel discovery entrypoint. Keep HTTP adaptation in `apps/api/api/orders.ts` and business logic in `packages/domain`.

Production deploys automatically from GitHub `main` after the repository and Vercel project are connected. Do not place secrets in repository files; map them in the appropriate Vercel environment.

Consult [the official Vercel llms reference](references/vercel.llms.txt.md) before changing deployment behavior.
