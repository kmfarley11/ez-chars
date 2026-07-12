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

- **Agent Role Boundary:** We split duties between agents: **Antigravity** (Architectural Ideation, Backlog Refinement, & Specification writing) and **Codex** (Code Implementation & Test Execution). If you are asked to perform a task outside your designated role (e.g., asking Antigravity to write extensive implementation code, or Codex to design a new API boundary), stop, flag this to the user, and ask if they want to proceed or delegate to the other agent.
- Prefer completing the current 5e 2014 MVP before expanding systems
- Keep current MVP docs up to date when scope or backlog changes
- Before adding bespoke UI controls or new component patterns, scan [src/lib/](src/lib/) for existing primitives and reuse or extend them where practical; if a local primitive is not reused, call out why
- For Svelte 5 work, use the Svelte MCP workflow documented in [docs/ai-usage.md](docs/ai-usage.md) when the client exposes it. If it is unavailable, use the official Svelte `llms.txt` docs and the repo's `npm run check`/`npm run lint` gates instead of relying on memory of older Svelte versions.
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

---

# Moving Forwards

DISCLAIMER: the below content is new and will _become_ the truth but isn't just yet. Previously this repository used loose markdown file orchestration to document current vs. desired state, knowledge, and effort backlog. However, the intent is to adopt openspec to standardize/normalize the backlog refinement and execution process.

## OpenSpec

This repository uses OpenSpec for committed behavioral and non-trivial engineering changes.

Current preferred division of responsibility:

- `agy`: exploration, artifact refinement, and holistic review.
- `codex`: implementation, focused testing, and implementation fixes.

These are workflow preferences rather than OpenSpec requirements.

When using OpenSpec, prefer surfacing material ambiguity over silently expanding product scope or architectural direction.

- Use exploration to investigate existing behavior, ambiguity, or possible changes.
- Use an OpenSpec change workspace when behavior or a meaningful technical direction is being committed.
- Treat generated Proposal, Specification, Design, and Tasks as drafts requiring human review.
- Review artifacts in dependency order and reconcile downstream artifacts after material upstream changes.
- Use approved Tasks as the implementation source once a change is active.
- Before archive, reconcile implementation fallout into the appropriate durable artifact.
- Keep `docs/mvp-backlog.md` as the priority queue, not as the detailed execution plan for active changes.
- Do not migrate or invent repository-wide specifications merely for completeness.

### Terminology Boundary

- **Proposals & Specs**: Must remain strictly behavior- and domain-focused. They define the external contract of the system (e.g., user interactions, visible UI flows, public API inputs/outputs). Avoid internal implementation details such as specific programming languages, libraries (e.g., Express, React, Tailwind), file/directory structures, databases, or deployment tools. Avoid prescribing architectural boundaries (e.g., "frontend fetching from backend") inside specs—frame requirements from the unified system's perspective (e.g., "The application SHALL display...").
- **Design & Tasks**: House technical design decisions and implementation task steps (e.g., specific architecture choice, coding paths, styling libraries, testing setups, database schemas).

### Workflow & Communication Style

- **Default to Writing Files**: When updates to planning artifacts or code are needed, write the file updates directly to disk by default so they can be reviewed via git between prompts. Do not halt to ask for confirmation or permission first unless there is a specific question about product requirements or architectural clarity that you need resolved.
- **Clean Git State Preference**: By default, do prefer writing file updates if the git state is already clean (no unstaged changes).

### Implementation Fallout

After implementation, review material decisions, omissions, deviations, and verification discoveries before archive.

When exactly one active OpenSpec change clearly applies, use it. When multiple active changes could apply, identify the likely candidates and ask the user to select one rather than silently attaching fallout to the wrong change. When no active change applies, treat the work as repository stewardship or exploratory development unless it changes committed product behavior.

- Reconcile technical and workflow fallout into Design, Tasks, and maintainer documentation.
- Update Proposal or Specifications only when product scope, capability boundaries, or observable behavior changed.
- Treat ordinary implementation discretion as implementation detail; do not over-specify it retroactively.
- Do not archive while known material fallout remains undocumented or unresolved.
- Run `openspec validate` after modifying OpenSpec artifacts.
- Re-run affected verification after repository or implementation changes.

Preferred responsibilities:

- `codex`: report implementation fallout, apply approved technical reconciliation, update code and focused documentation, and run focused verification.
- `agy`: classify material fallout, review cross-artifact consistency, surface scope or architectural drift, and perform holistic pre-archive review.
- Human: approve changes to product scope, observable behavior, or architectural direction.

## Repository Reconciliation

Before verifying and archiving an OpenSpec change, reconcile durable repository knowledge discovered during implementation.

Classify each discovery by responsibility:

- OpenSpec (`openspec/`)
  - product scope and capabilities
  - observable requirements and scenarios
  - technical design decisions
  - implementation tasks and verification expectations

- `README.md`
  - repository purpose and navigation
  - prerequisites and installation
  - development commands
  - verification and operational usage

- `AGENTS.md`
  - human/agent responsibilities
  - review and reconciliation workflow
  - coding and maintenance conventions
  - agent-facing repository guidance

Avoid duplicating the same guidance across artifacts. Prefer linking or summarizing when another artifact is authoritative.

## Exploratory Development

Exploratory prototypes and spikes are encouraged when they reduce uncertainty before product commitment.

Perform exploratory product work on a disposable or clearly identified branch/worktree. Unless the user explicitly approves otherwise, do not merge exploratory product behavior directly into the primary branch.

Treat prototype code as evidence and research, not as committed repository behavior or as a substitute for an OpenSpec change.

When exploratory behavior is approved for long-term maintenance:

1. Capture the learned intent and observable behavior through OpenSpec Explore and/or Proposal.
2. Review and approve the resulting Proposal, Specifications, Design, and Tasks.
3. Reconcile the prototype implementation with the approved artifacts.
4. Reconcile durable repository documentation.
5. Verify the resulting behavior before merge and archive.

A prototype may be reused when it conforms to the approved artifacts, but existing prototype code does not receive automatic approval.

Preferred responsibilities:

- `codex`: build focused prototypes, report assumptions and discoveries, and later reconcile approved prototype code into the implementation.
- `agy`: help frame the exploration, distinguish discoveries from commitments, and review the resulting OpenSpec artifacts.
- Human: decide whether the prototype should be discarded, explored further, or promoted into committed product behavior.
