---
name: tsed-ordering
description: Maintain Cookids Ts.ED DTO validation, DI services, JSON mapping, and order-domain contracts. Use for order API and backend service changes.
---

# Ts.ED ordering flow

Use `@tsed/schema` decorators on DTOs, `@tsed/ajv` as the validation authority, and `@tsed/json-mapper` to deserialize input and serialize output. Keep each injectable service, DTO, model, adapter, error, and reusable utility in its own file.

`OrderService` owns price resolution and totals. Repositories and mail services are injected ports; Vercel-specific code must not enter this package.

Consult [the official Ts.ED llms reference](references/tsed.llms.txt.md) before changing metadata, validation, or DI conventions.
