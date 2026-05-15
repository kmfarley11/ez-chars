# Agent Guide

This file is the shortest current-state guide for coding agents working in this repository.

## Start Here

For active implementation work, treat these files as the current source of truth:

- `docs/current-mvp.md`
- `docs/mvp-backlog.md`

Do not use `docs/vision/*` as the active backlog unless the task is explicitly about roadmap, future-system exploration, or long-term planning.

## Current Product Scope

- Single-system MVP: D&D 5e 2014 only
- Local-first web app; no backend or accounts
- Editable, mobile-friendly character sheet
- JSON import/export is implemented for MVP backup and restore
- Additional systems, cloud sync, PDF workflows, and Storybook are deferred

## Current State

- `src/schema/*` contains typed Zod-backed data models; 5e 2014 is the only implemented system schema
- `src/routes/+page.svelte` is the home/list view
- `src/routes/charsheets/5e/+page.svelte` is the only real sheet page
- `src/data.ts` currently mixes seed data, store wiring, and localStorage persistence
- `src/lib/*Grid*` contains the reusable grid display/editing primitives
- The 5e UI currently exposes only part of the full schema
- Vitest is wired for contract tests, but schema/storage/import-export coverage and CI are still incomplete

## Working Rules

- Prefer completing the current 5e 2014 MVP before expanding systems
- Keep current MVP docs up to date when scope or backlog changes
- If a task touches storage or schema I/O, validate or migrate persisted data rather than raw-casting parsed JSON
- If a task changes tested behavior or a stable data boundary, add or update the relevant Vitest contract tests in the same change
- If a task affects current goals, update `docs/current-mvp.md` or `docs/mvp-backlog.md` in the same change

## Repo Map

- `src/routes/`: app routes and page composition
- `src/lib/`: reusable UI components and grid helpers
- `src/schema/`: shared and system-specific data models
- `src/data.ts`: temporary character store, seed data, and localStorage baseline
- `docs/current-mvp.md`: current MVP definition
- `docs/mvp-backlog.md`: prioritized implementation backlog
- `docs/vision/`: long-term human-facing vision docs
- `docs/ext/`: third-party reference docs/assets

## Quality Gates

- `npm run test`
- `npm run check`
- `npm run lint`
- `npm run build`

Run the relevant subset for small/doc-only changes, but run all four before considering behavior, schema, storage, import/export, or release-sensitive work complete.

## Useful Context

- `README.md` is the human-oriented repo overview
- `docs/index.md` is the docs map
- `docs/theme-visual-checklist.md` is the current UI/theme smoke checklist
