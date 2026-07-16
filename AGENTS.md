# Agent Guide

This file is the shortest current-state guide for coding agents working in this repository.

## Start Here

For active implementation work, treat these files as the current source of truth:

- [docs/active-goals.md](docs/active-goals.md)
- [docs/backlog.md](docs/backlog.md)

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

- **Agent Role Boundary:** generally, we split duties between agents: **Antigravity** (Architectural Ideation, Backlog Refinement, & Specification writing) and **Codex** (Code Implementation & Test Execution). If you are asked to perform a task outside your designated role (e.g., asking Antigravity to write extensive implementation code, or Codex to design a new API boundary), stop, flag this to the user, and ask if they want to proceed or delegate to the other agent.
- Prefer completing the current 5e 2014 MVP before expanding systems
- Keep current MVP docs up to date when scope or backlog changes
- Before adding bespoke UI controls or new component patterns, scan [src/lib/](src/lib/) for existing primitives and reuse or extend them where practical; if a local primitive is not reused, call out why
- For Svelte 5 work, follow the Svelte 5 Agent Workflow detailed at the bottom of this document when writing Svelte components, routes, or reactivity.
- If a task touches storage or schema I/O, validate or migrate persisted data rather than raw-casting parsed JSON
- If a task changes tested behavior or a stable data boundary, add or update the relevant Vitest contract tests in the same change
- If a task affects current goals, update [docs/active-goals.md](docs/active-goals.md) or [docs/backlog.md](docs/backlog.md) in the same change

## Git Constraints

- **CRITICAL:** Do NOT automatically stage (git add) any files, unless explicitly asked to.
- Modifying files requires changing them on the disk only.
- Leave staging and committing entirely to human control.

## Repo Map

- [src/routes/](src/routes/): app routes and page composition
- [src/lib/](src/lib/): reusable UI components and grid helpers
- [src/schema/](src/schema/): shared and system-specific data models
- [src/test-utils/](src/test-utils/): shared Vitest scaffolding such as browser globals and memory-backed `localStorage`
- [src/data.ts](src/data.ts): temporary character store, seed data, and localStorage baseline
- [docs/active-goals.md](docs/active-goals.md): current active goals definition
- [docs/backlog.md](docs/backlog.md): prioritized implementation backlog
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

# OpenSpec Workflow

This repository uses OpenSpec as the preferred workflow for all active, non-trivial engineering changes.

## Workflow Rules & Expectations

- **Durable Knowledge over Chat History**: Architectural decisions, specifications, and design rationale belong in version-controlled OpenSpec artifacts rather than ephemeral chat threads.
- **Backlog is for Prioritization**: The `docs/backlog.md` file serves as a prioritized queue of candidate work, not as the active execution checklist for in-progress tasks.
- **Backlog Refinement Workflow**: Before triaging new request ideas or moving them to active proposal workflows, refine backlog items using the structured refinement template (Purpose, Included/Excluded behavior, Ambiguities, Success) defined in [docs/backlog.md](docs/backlog.md).
- **Legacy Documentation Policy**: Existing repository documentation (e.g., `docs/field-*.md`, `docs/import-export-json.md`) remains authoritative until an OpenSpec change intentionally supersedes or reconciles it. Do not migrate legacy documentation solely to increase OpenSpec coverage.

## Change-Classification & ADR Triggers

To maintain engineering agility while preserving architectural rigour, we classify incoming work using the following thresholds:

| Change Type                                                                           | Workflow                                                                        |
| :------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------ |
| Typo, styling adjustment, or isolated refactor with no behavioral changes             | **Fast-track** (bypass OpenSpec changes directory; direct edit; no spec update) |
| Small behavior change with obvious scope and one or two files                         | **Compact change** (Propose -> Approve -> Apply -> Archive)                     |
| New user behavior, schema change, persistence changes, or unresolved design questions | **Full change** (Propose -> Approve -> Apply -> Archive)                        |
| Durable architectural choice or meaningful trade-off selection                        | **Change plus ADR** (Architecture Decision Record)                              |

Note: generally expect the user to drive the workflow, but definitely use the above to suggest next steps in a prompt thread as applicable.

### ADR Triggers & Format

If a change results in any of the following, the agent MUST create a lightweight ADR under `docs/decisions/`:

- A permanent architecture change (e.g., changing Svelte store architecture).
- A design trade-off selection (e.g., choosing `immutable-json-patch` over custom diffing).
- A public API boundary decision.
- A storage/schema evolution or migration strategy.
- A new package or dependency adoption.

#### Suggested ADR Format

ADRs should remain lightweight and action-oriented. Prefer files named `docs/decisions/YYYY-MM-DD-short-title.md` following this structure:

1. **Title**: Short, action-oriented, prefixed with the decision date.
2. **Metadata**: Status (`Proposed` | `Approved` | `Superseded`), Author, and Date.
3. **Context & Problem Statement**: The background, goals, and user/engineering problem being addressed.
4. **Decision Drivers**: Core constraints and qualities we are optimizing for (e.g. mobile performance, bundle size).
5. **Considered Options**: The alternatives with brief pros and cons for each.
6. **Decision Outcome**: The chosen option, rationale, and a detailed list of consequences (both positive and negative).
7. **Refinements & Follow-Ups**: Chronological sections capturing downstream decisions or changes made during implementation/refinement.

## Artifact Responsibility Boundaries

To ensure predictable agent behavior, we enforce strict responsibility boundaries for each OpenSpec artifact. Agents tend to compress these phases into a single generation step; however, they MUST treat each artifact as a separate boundary:

- **Proposal (`proposal.md`)** answers **why**. It defines the purpose, scope, capabilities, and non-goals. It does NOT contain implementation details.
- **Specification (`specs/<capability>/spec.md`)** answers **what**. It defines the observable behavior, normative requirements (SHALL/MUST), and testable scenarios (WHEN/THEN). It does NOT contain implementation details or coding paths.
- **Design (`design.md`)** answers **how**. It defines the architecture, technical approach, decisions, and trade-offs.
- **Tasks (`tasks.md`)** answer **what work**. It is a checkable list of implementation steps, sequencing, and verification gates.

Agents MUST avoid bleeding implementation details into the Proposal or Specification, and MUST NOT introduce new behavioral requirements or scope changes in the Design or Tasks.

## Proposal Capabilities as Durable Vocabulary

Capabilities defined in the Proposal and Specification represent **durable repository vocabulary**—stable behavioral concepts that the system exposes—rather than implementation features.

- Capabilities identify stable behavioral concepts that future changes introduce, modify, or depend upon.
- Agents MUST NOT use Capabilities for implementation decomposition, source files, modules, APIs, frameworks, or other architectural details.
- Capability names should remain stable even if the underlying code is completely rewritten.

## Preferred Agent Responsibilities

The repository prefers:

- **Antigravity**: exploration, repository analysis, OpenSpec artifact generation, artifact refinement, holistic review.
- **Codex**: implementation, focused testing, implementation fixes, repository reconciliation.

These are preferences rather than hard boundaries. When work naturally spans both areas, complete the adjacent work if it is small and directly supports the user's request. Surface significant architectural or scope decisions rather than stopping solely because work crosses a preferred responsibility.

## Workflow & Communication Style

- **Default to Writing Files**: When updates to planning artifacts or code are needed, write the file updates directly to disk by default so they can be reviewed via git tooling between prompts. DO NOT stage (`git add`) changes yourself unless explicitly asked to (see [the git constraints section](#git-constraints)).
- **Prefer asking forgiveness over permission**: Do not halt to ask for confirmation or permission first unless there is a specific question about product requirements or architectural clarity that you need resolved.
- **Answer questions directly**: If the prompt is directly a question though, directly answer the question and ask the user if they'd like to proceed based on the answer.

## Implementation Fallout & Reconciliation

After implementation, review material decisions, omissions, deviations, and verification discoveries before archive.

- Reconcile technical and workflow fallout into Design, Tasks, and maintainer documentation.
- Update Proposal or Specifications only when product scope, capability boundaries, or observable behavior changed.
- Treat ordinary implementation discretion as implementation detail; do not over-specify it retroactively.
- Do not archive while known material fallout remains undocumented or unresolved.
- Run `openspec validate` after modifying OpenSpec artifacts.
- Re-run affected verification after repository or implementation changes.

### Preferred Roles in Reconciliation:

- `codex`: report implementation fallout, apply approved technical reconciliation, update code and focused documentation, and run focused verification.
- `agy`: classify material fallout, review cross-artifact consistency, surface scope or architectural drift, and perform holistic pre-archive review.
- Human: approve changes to product scope, observable behavior, or architectural direction.

## Svelte 5 Agent Workflow

For Svelte component, route, reactivity, lifecycle, accessibility, or performance work, prefer the official Svelte AI tooling before relying on model memory. Svelte 5 differs enough from older Svelte patterns that agents should verify current syntax and recommendations against first-party docs.

- **Svelte MCP Tooling:** Use this repo's dev-only `@sveltejs/mcp` stdio server (also available through `npm run mcp:svelte`) when the client exposes MCP.
  In Codex CLI, a repo-local stdio MCP configuration is:

  ```toml
  [mcp_servers.svelte]
  command = "./node_modules/.bin/svelte-mcp"
  ```

  If using remote MCP:

  ```toml
  experimental_use_rmcp_client = true

  [mcp_servers.svelte]
  url = "https://mcp.svelte.dev/mcp"
  ```

- **Fallback Documentation:** If MCP is unavailable, see if you can start it yourself, otherwise inform the user but read the official first-party docs for LLMs to proceed:
  - Svelte LLM docs: [svelte.dev/llms.txt](https://svelte.dev/llms.txt)
  - Svelte Kit LLM docs: [svelte.dev/docs/kit/llms.txt](https://svelte.dev/docs/kit/llms.txt)
- **Local Validation:** Always pair Svelte-tool findings with this repo's local gates (`npm run check` for Svelte diagnostics and `npm run lint` for formatting/ESLint). Keep Svelte MCP as a dev-only tool; do not move it to runtime dependencies.
