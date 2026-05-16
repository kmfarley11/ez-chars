# Agent Guide

This file is the shortest current-state guide for coding agents working in this repository.

## Start Here

For active implementation work, treat these files as the current source of truth:

- [docs/current-mvp.md](docs/current-mvp.md)
- [docs/mvp-backlog.md](docs/mvp-backlog.md)

Do not use [docs/vision/](docs/vision/) as the active backlog unless the task is explicitly about roadmap, future-system exploration, or long-term planning.

## Current Product Scope

- Single-system MVP: D&D 5e 2014 only
- Local-first web app; no backend or accounts
- Editable, mobile-friendly character sheet
- JSON import/export is implemented for MVP backup and restore
- Additional systems, cloud sync, PDF workflows, and Storybook are deferred

## Current State

- [src/schema/](src/schema/) contains typed Zod-backed data models; 5e 2014 is the only implemented system schema
- [`src/routes/+page.svelte`](src/routes/+page.svelte) is the home/list view
- [`src/routes/charsheets/5e/+page.svelte`](src/routes/charsheets/5e/+page.svelte) is the only real sheet page
- [`src/data.ts`](src/data.ts) currently mixes seed data, store wiring, and localStorage persistence
- [src/lib/](src/lib/) contains the reusable grid display/editing primitives
- The 5e UI currently exposes only part of the full schema
- Vitest is wired for contract tests, but storage coverage and CI are still incomplete
- `immutable-json-patch` is the selected RFC 6902 patch library for the field-binding work; reuse the representative JSON Patch fixture in [src/test-utils/jsonPatchFixtures.ts](src/test-utils/jsonPatchFixtures.ts) for patch/binding tests

## Working Rules

- Prefer completing the current 5e 2014 MVP before expanding systems
- Keep current MVP docs up to date when scope or backlog changes
- Before adding bespoke UI controls or new component patterns, scan [src/lib/](src/lib/) for existing primitives and reuse or extend them where practical; if a local primitive is not reused, call out why
- If a task touches storage or schema I/O, validate or migrate persisted data rather than raw-casting parsed JSON
- If a task changes tested behavior or a stable data boundary, add or update the relevant Vitest contract tests in the same change
- If a task affects current goals, update [docs/current-mvp.md](docs/current-mvp.md) or [docs/mvp-backlog.md](docs/mvp-backlog.md) in the same change

## Repo Map

- [src/routes/](src/routes/): app routes and page composition
- [src/lib/](src/lib/): reusable UI components and grid helpers
- [src/schema/](src/schema/): shared and system-specific data models
- [src/test-utils/](src/test-utils/): shared Vitest scaffolding such as browser globals and memory-backed `localStorage`
- [src/data.ts](src/data.ts): temporary character store, seed data, and localStorage baseline
- [docs/current-mvp.md](docs/current-mvp.md): current MVP definition
- [docs/mvp-backlog.md](docs/mvp-backlog.md): prioritized implementation backlog
- [docs/verification.md](docs/verification.md): local verification command guide
- [docs/vision/](docs/vision/): long-term human-facing vision docs
- [docs/ext/](docs/ext/): third-party reference docs/assets

## Quality Gates

Place Vitest files in nearby `__tests__` folders, such as [`src/schema/__tests__/`](src/schema/__tests__/), so contract tests stay close to the code they protect without mixing test files into implementation file lists.
Use existing shared test scaffolding from [src/test-utils/](src/test-utils/) for browser-like globals or memory-backed storage; do not duplicate ad hoc `MemoryStorage` or `window` setup inside individual tests.
Use [src/test-utils/jsonPatchFixtures.ts](src/test-utils/jsonPatchFixtures.ts) for representative nested JSON Patch fixture data; it is purpose-built patch scaffolding, not canonical 5e schema seed data.
Use [docs/verification.md](docs/verification.md) as the canonical local command guide, including when to run the full gate set, smaller subsets, and coverage reporting.

## Useful Context

- [README.md](README.md) is the human-oriented repo overview
- [docs/index.md](docs/index.md) is the docs map
- [docs/theme-visual-checklist.md](docs/theme-visual-checklist.md) is the current UI/theme smoke checklist
