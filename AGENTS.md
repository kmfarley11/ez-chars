# Agent Guide

This file is the shortest current-state guide for coding agents working in this repository.

## Start Here

For active implementation work, treat these files as the current source of truth:

- [docs/active-goals.md](docs/active-goals.md)
- [docs/backlog.md](docs/backlog.md)

Do not use [docs/vision/](docs/vision/) as the active backlog unless the task is explicitly about roadmap, future-system exploration, or long-term planning.

For roadmap exploration, PRD work, or promotion of a new feature into the backlog, also consult [docs/vision/author-desires.md](docs/vision/author-desires.md). It is an advisory statement of author intent and product horizons, not an execution gate or a substitute for approved active scope.

## Product Scope Source

For current product scope, in/out-of-scope decisions, and success criteria, use [docs/active-goals.md](docs/active-goals.md). For prioritized work, use [docs/backlog.md](docs/backlog.md). Use [docs/vision/author-desires.md](docs/vision/author-desires.md) to evaluate horizon fit during exploration and proposal work; once a change is approved, do not reopen its scope solely because every advisory decision-filter prompt is not satisfied.

## Current State

- [src/schema/](src/schema/) contains typed Zod-backed data models; 5e 2014 is the only implemented system schema and validates one explicitly unstable pre-playtest `dnd5e-2014.schema.v0` shape while rejecting retired experimental and unknown future layouts
- [`src/routes/+page.svelte`](src/routes/+page.svelte) is the home/list view
- [`src/routes/charsheets/5e/+page.svelte`](src/routes/charsheets/5e/+page.svelte) is the only real sheet page
- [`src/data.ts`](src/data.ts) currently mixes seed data, store wiring, and localStorage persistence
- [src/lib/](src/lib/) contains the reusable grid display/editing primitives
- The 5e UI currently exposes only part of the full schema
- Vitest covers schema migration, storage, import/export, and typed edit contracts; CI remains deferred
- `immutable-json-patch` is the selected RFC 6902 patch library for the field-binding work; reuse the representative JSON Patch fixture in [src/test-utils/jsonPatchFixtures.ts](src/test-utils/jsonPatchFixtures.ts) for patch/binding tests

## Working Rules

- **Agent Self-Maintenance:** If you are asked to read, review, or modify this `AGENTS.md` file and notice it has exceeded 400 lines, you MUST proactively warn the user that the file is becoming too large and should be pruned or reorganized to maintain optimal AI attention and performance.
- **Path Portability:** All files committed to the repository (documentation, specifications, designs, proposals, task checklists) MUST use repo-relative paths (e.g., `docs/backlog.md` or relative links like `../../src/lib/`) rather than absolute file paths or machine-specific `file://` URIs. This guarantees documents are portable across developer environments, CI systems, and execution machines.
- Prefer completing the current 5e 2014 MVP before expanding systems
- Keep current MVP docs up to date when scope or backlog changes
- Before adding bespoke UI controls or new component patterns, scan [src/lib/](src/lib/) for existing primitives and reuse or extend them where practical; if a local primitive is not reused, call out why
- Prefer platform-native interaction primitives where they preserve required behavior, accessibility, and layout; see [the platform-native UI primitives decision](docs/decisions/2026-07-17-prefer-platform-native-ui-primitives.md) for the evaluation and exceptions.
- For touch-oriented home or character-sheet controls, inherit the explicit coarse-pointer target policy in [the touch-target decision](docs/decisions/2026-07-31-require-coarse-pointer-touch-targets.md); update [the bounded control-family audit](docs/accessibility-control-audit.md) when a new control does not inherit a conforming shared pattern or needs an approved exception.
- For Svelte 5 work, follow the Svelte 5 Agent Workflow detailed at the bottom of this document when writing Svelte components, routes, or reactivity.
- If a task touches storage or schema I/O, validate persisted data against the declared compatibility epoch or apply only explicitly supported migrations rather than raw-casting parsed JSON
- Follow [the character-data versioning decision](docs/decisions/2026-07-18-version-and-normalize-5e-character-data.md) when changing persisted character shapes: pre-playtest `dnd5e-2014.schema.v0` may reject earlier experimental data, while `dnd5e-2014.schema.v1` and later identifiers are immutable and require frozen historical schemas plus explicit sequential migrations; do not restore unsupported legacy shapes merely for compatibility coverage
- If a task changes tested behavior or a stable data boundary, add or update the relevant Vitest contract tests in the same change
- If a task affects current goals, update [docs/active-goals.md](docs/active-goals.md) or [docs/backlog.md](docs/backlog.md) in the same change
- When adding or reclassifying component stories, follow the [component composition taxonomy](docs/decisions/2026-07-25-classify-ui-component-composition.md): atoms are primitives, molecules are focused groupings of primitives, and organisms compose molecules into cohesive regions or workflows; templates and pages remain deferred.

## Git Constraints

- **CRITICAL:** Do NOT automatically stage (git add) any files, unless explicitly asked to, or unless you are specifically navigating the OpenSpec archive workflow.
- Modifying files requires changing them on the disk only.
- Leave staging and committing entirely to human control.
- **Commit Messages:** When drafting commit messages, avoid using backticks (`) or unescaped quotes, as these cause interpolation or syntax errors when passed to `git commit -m "..."` in Bash.

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
For routine source changes, begin with `npm run verify:smoke`; it runs diagnostics, linting, unit tests, the Chromium application smoke suite, and Storybook component checks. It does not replace the full or dependency-change gates in [docs/verification.md](docs/verification.md).
Use `npm run verify:all` only for a deliberately comprehensive automated pass or when directly requested; it includes audit, coverage, builds, cross-browser, and performance checks.

### Dependency Change Smoke Gate

When an agent changes `package.json`, `package-lock.json`, or another dependency or build-tool manifest, it MUST run `npm audit`, the full set in [Main Gates](docs/verification.md#main-gates), and the canonical Chromium smoke suite in [Browser E2E Commands](docs/verification.md#browser-e2e-commands). For changes to SvelteKit, Vite, Playwright, browser-facing dependencies, or build tooling, it MUST also run the applicable cross-browser and performance checks described in that same section. If a browser suite cannot run because its binary or host libraries are unavailable, report the exact environmental blocker and run every remaining executable gate; do not classify it as an application regression without test evidence.

## Browser E2E Boundaries

The [testing strategy decision](docs/decisions/2026-07-17-testing-strategy.md) defines these durable boundaries; use [docs/verification.md](docs/verification.md) for commands, performance thresholds, and profiling response.

- Use `npm run test:e2e` for the fast Chromium smoke suite; use `npm run test:e2e:all` or a named Playwright project only when cross-browser coverage is relevant.
- Keep browser tests in `tests/` black-box: seed fixture data with `page.addInitScript` and assert visible roles, labels, text, downloads, and uploads instead of component internals, CSS classes, or snapshots.
- Do not replace repeatable browser checks with ad-hoc Node browser-control scripts. Start or reuse the Vite server through Playwright configuration and keep the routine Chromium suite small enough for fast local feedback.

## Useful Context

- [README.md](README.md) is the human-oriented repo overview
- [docs/index.md](docs/index.md) is the docs map
- [docs/theme-visual-checklist.md](docs/theme-visual-checklist.md) is the current UI/theme smoke checklist

# OpenSpec Workflow

This repository uses OpenSpec as the preferred workflow for all active, non-trivial engineering changes.

## Workflow Rules & Expectations

- **Durable Knowledge over Chat History**: Architectural decisions and their rationale belong in version-controlled ADRs; behavioral specifications and coordinated change planning belong in OpenSpec artifacts. Neither belongs only in ephemeral chat threads.
- **Backlog is for Prioritization**: The `docs/backlog.md` file serves as a prioritized queue of candidate work, not as the active execution checklist for in-progress tasks.
- **Backlog Refinement Workflow**: Before triaging new request ideas or moving them to active proposal workflows, refine backlog items using the structured refinement template (Purpose, Included/Excluded behavior, Ambiguities, Success) defined in [docs/backlog.md](docs/backlog.md). Create the detailed definition once in the refined backlog catalog, add its ID link to the appropriate lightweight priority queue, and update the "Next recommended sequence" block when it is actionable.
- **Vision Check During Refinement**: For roadmap exploration, PRD work, or promotion of a new feature, compare the proposal with [docs/vision/author-desires.md](docs/vision/author-desires.md) and call out material horizon or product-boundary tension. Treat its decision filter as discussion prompts rather than hard acceptance criteria; the human owner may deliberately override it.
- **Refinement Exit Recommendation**: At the end of every backlog exploration or refinement, explicitly recommend the next execution path using [the change-classification and ADR thresholds](#change-classification--adr-triggers): direct/ad hoc implementation, an ADR-only update, a compact OpenSpec change, or a full OpenSpec change. State separately whether an ADR is triggered. Also state whether the work is likely to add, modify, or remove a durable specification requirement and whether its coding or architectural scope benefits from OpenSpec's proposal, design, and task artifacts; these are the primary OpenSpec triggers. Briefly explain the classification and call out any unresolved decision that must precede implementation. Whether the direct work will be human-authored or agent-assisted does not change the classification.
- **Backlog Identity**: Preserve existing legacy `p0-*`, `p1-*`, and `p2-*` IDs. Assign new refined items the next unused priority-neutral `BL-NNN` ID according to [the backlog ID rules](docs/backlog.md#backlog-id-rules); priority changes never rename an ID, completed or abandoned IDs are never reused, and raw sandbox ideas remain unnumbered. Name a corresponding OpenSpec change `bl-NNN-short-slug`.
- **Backlog Priority Movement**: Apply the P0/P1/P2 meanings in [the backlog priority classes](docs/backlog.md#priority-classes). Reprioritize an item by moving only its ID link between the lightweight queues; do not relocate or duplicate its detailed catalog definition. Treat priority as distinct from readiness and recommended execution order.
- **Workflow Skill Overrides**: When executing OpenSpec workflows (explore, propose, apply, archive), agents MUST follow these repository-specific rules over the generic skill instructions:
  - **Explore**: If a feature idea is refined but no proposal is started, explicitly offer to capture the "Refined feature idea" into the `docs/backlog.md` priority queue.
  - **Propose**: When generating `tasks.md`, always ensure the final section includes (1) a named post-apply user review and explicit approval task that agents cannot self-complete and (2) explicit archive-time tasks to prune the completed backlog item from `docs/backlog.md` and re-sequence the "Next recommended sequence" priority queue block.
  - **Apply**: Agents may complete implementation, reconciliation, and verification tasks, but MUST leave the named post-apply user review/approval task unchecked. After presenting the resulting change scope, verification evidence, and material fallout, stop for explicit human approval. A request to begin applying the change, a clean self-review, or passing automation is not approval of the resulting implementation.
  - **Archive**:
    - Archive only after the human owner has reviewed the post-apply result and explicitly approved it. A direct archive request made after that review may serve as approval; do not require redundant confirmation. Do not infer approval from an earlier request to implement through completion.
    - If the change includes delta specs, ALWAYS sync them to the main specs directory automatically without prompting the user for permission.
    - Preserve the archived change's delta specs as historical artifacts with their operation headings (`## ADDED Requirements`, `## MODIFIED Requirements`, or `## REMOVED Requirements`).
    - Main specs are durable capability documents, not delta artifacts. Merge each delta into the affected main spec and ensure the result uses a capability title, a meaningful non-placeholder `## Purpose`, and `## Requirements`. NEVER copy delta operation headings into `openspec/specs/`.
    - After syncing, run strict validation for every affected main spec and then run `openspec validate --all --strict`. Do not consider archival complete while an affected main spec is invalid; reconcile or explicitly report unrelated pre-existing validation failures.
    - After performing the archive, reconcile the backlog. Check if the change corresponds to a prioritized backlog item in `docs/backlog.md`. If it does: remove its ID link from the lightweight priority queue, remove its detailed definition from the refined backlog catalog, add a brief, timestamped entry to the top of `## Done Recently`, prune older entries in that section so only the 3-5 most recent items remain (to prevent unbounded file growth), verify the completed change has been removed from the "Next recommended sequence" block and the remaining targets are properly shifted up, and update `docs/active-goals.md` if the change affects goals.
    - During this process also ALWAYS include a useful commit message.
- **Legacy Documentation Policy**: Existing repository documentation (e.g., `docs/field-*.md`, `docs/import-export-json.md`) remains authoritative until an OpenSpec change intentionally supersedes or reconciles it. Do not migrate legacy documentation solely to increase OpenSpec coverage. If a legacy document contains a `> [!WARNING]` or `> [!NOTE]` blockquote at the top indicating it is a historical artifact or has been superseded, agents MUST respect that warning and defer to the linked superseding document for active product direction.

## Change-Classification & ADR Triggers

To maintain engineering agility while preserving architectural rigour, we classify incoming work using the following thresholds:

| Change Type                                                                                                                                            | Workflow                                                                        |
| :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| No likely durable spec delta and a local, obvious implementation with no meaningful design trade-off, including typos, styling, fixes, or refactors    | **Fast-track** (bypass OpenSpec changes directory; direct edit; no spec update) |
| Durable architectural decision or meaningful trade-off with no likely spec delta and no implementation scope needing coordinated planning              | **ADR-only** (create or update the decision record directly)                    |
| Likely narrow spec delta with settled behavior and compact implementation scope                                                                        | **Compact change** (Propose -> Approve -> Apply -> Archive)                     |
| Broad or interacting spec deltas, schema or persistence changes, unresolved design questions, or implementation scope that needs coordinated artifacts | **Full change** (Propose -> Approve -> Apply -> Archive)                        |

ADR need and OpenSpec need are independent (but not mutually exclusive) decisions. An ADR records a durable decision and its rationale; OpenSpec records behavioral deltas and coordinates substantial design and implementation work. Do not create an OpenSpec change merely to create or edit an ADR. Use ADR-only when the decision record is the only durable artifact needed. When an ADR trigger coincides with compact or full change criteria, use the appropriate OpenSpec workflow plus the ADR.

Do not recommend OpenSpec solely because an item was explored, refined, placed in the backlog, or will be implemented by an agent. Recommend it when a durable spec change is likely or when the coding or architectural scope justifies coordinated proposal, design, and task artifacts. Generally expect the user to drive the workflow, but use these thresholds to recommend the next step explicitly.

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
2. **Metadata**: Status (`Proposed` | `Approved` | `Superseded`), Author, original decision Date, and Last reviewed date. When refinements exist, add a concise Latest refinement line naming or linking the change/backlog/implementation context so readers can find the current amendment without scanning the whole file.
3. **Context & Problem Statement**: The background, goals, and user/engineering problem being addressed.
4. **Decision Drivers**: Core constraints and qualities we are optimizing for (e.g. mobile performance, bundle size).
5. **Considered Options**: The alternatives with brief pros and cons for each.
6. **Decision Outcome**: The chosen option, rationale, and a detailed list of consequences (both positive and negative).
7. **Refinements & Follow-Ups**: Chronological sections capturing downstream decisions or changes made during implementation/refinement.

When reviewing or amending an ADR, update **Last reviewed**, refresh **Latest refinement**, and append the durable rationale/outcome under **Refinements & Follow-Ups**. Preserve the original decision as history, but do not leave the opening outcome materially misleading: add an explicit supersession note near it when a later refinement changes the operative rule. If the fundamental decision is replaced rather than narrowed, mark the ADR `Superseded` and link the replacement ADR instead of accumulating contradictory amendments.

## Artifact Responsibility Boundaries

To ensure predictable agent behavior, we enforce strict responsibility boundaries for each OpenSpec artifact. Agents tend to compress these phases into a single generation step; however, they MUST treat each artifact as a separate boundary:

- **Proposal (`proposal.md`)** answers **why**. It defines the purpose, scope, capabilities, and non-goals. It does NOT contain implementation details.
- **Specification (`specs/<capability>/spec.md`)** answers **what**. It defines the observable behavior, normative requirements (SHALL/MUST), and testable scenarios (WHEN/THEN). It does NOT contain implementation details or coding paths.
- **Design (`design.md`)** answers **how**. It defines the architecture, technical approach, decisions, and trade-offs.
- **Tasks (`tasks.md`)** answer **what work**. It is a checkable list of implementation steps, sequencing, and verification gates.

Agents MUST avoid bleeding implementation details into the Proposal or Specification, and MUST NOT introduce new behavioral requirements or scope changes in the Design or Tasks.

### Artifact Quality & Writing Guidelines

- **Focus on Observable Behavior:** Keep `proposal.md` and `specs/` readable and free of technical jargon. Do not list specific filenames, code imports, class properties, or store names in these files. Describe the system requirements in terms of what the user or developer observes and what behavior MUST be preserved.
- **Clearly Delineate Scope Limits:** Explicitly define "Non-Goals" early in the proposal to establish strict boundaries and avoid feature creep during refactoring.
- **Identify Testing Non-Determinism in Design:** If a design involves time, random generation, or UUID/ID allocation, the design MUST specify how these dependencies are injected or mocked so that unit tests remain fully deterministic.
- **Resist Premature Abstraction (YAGNI):** Do not design generic system facades, registry interfaces, or universal adapter signatures when only a single TTRPG system is implemented. If the abstraction is user-requested, document the user's long-term architectural intent in the vision documents (e.g., `docs/vision/system-design-notes.md`) and design roadmap rather than freezing it into premature present-day code API contracts.

### Defensive Architecture & Planning Heuristics

To ensure high-quality proposals and reduce implementation fallout, agents MUST apply the following heuristics during the Proposal and Design phases:

- **Dependency Hygiene:** When introducing third-party tools or dependencies, designs MUST explicitly specify how to avoid auto-generated boilerplate, telemetry, and default onboarding files. Pin versions strictly.
- **Test Environment Isolation:** When adding new testing frameworks or browser-backed tools, designs MUST explicitly define how they will remain isolated from the existing unit test configuration (e.g., separate config files, named projects) to prevent environment pollution.
- **Proof-of-Concept Depth:** When proposing a new pattern or tool, the baseline implementation tasks MUST include at least one stateful, interactive, or error-handling example (not just static "happy path" rendering).
- **Verification Gate Enforcement:** Proposals that touch dependencies, build tools, or E2E boundaries MUST explicitly include tasks to run the full suite of repository verification gates (`npm audit`, E2E, performance, coverage) before archival.

## Proposal Capabilities as Durable Vocabulary

Capabilities defined in the Proposal and Specification represent **durable repository vocabulary**—stable behavioral concepts that the system exposes—rather than implementation features.

- Capabilities identify stable behavioral concepts that future changes introduce, modify, or depend upon.
- Agents MUST NOT use Capabilities for implementation decomposition, source files, modules, APIs, frameworks, or other architectural details.
- Capability names should remain stable even if the underlying code is completely rewritten.

## Provider-Neutral Execution Guidance

Route work by required capability, reasoning depth, tools, and context—not agent name.

- An active agent meeting the task's minimum capability and reasoning recommendation should execute directly.
- Do not delegate solely because another agent is historically preferred.
- Use subagents only for concrete independent work where the benefit exceeds coordination and approval overhead.
- Obtain explicit user opt-in before delegation that may create additional approval prompts.
- If the current model is below the required tier, explain the mismatch and ask whether to switch or proceed.
- The active agent remains responsible for review, verification, reconciliation, and communication.

Use provider-neutral task labels such as:

- Minimum capability tier: Standard | Advanced | Frontier
- Reasoning depth: Medium | High

## Workflow & Communication Style

- **Default to Writing Files**: When updates to planning artifacts or code are needed, write the file updates directly to disk by default so they can be reviewed via git tooling between prompts. DO NOT stage (`git add`) changes yourself unless explicitly asked to (see [the git constraints section](#git-constraints)).
- **Use Structured Edit Tools**: Use the environment’s native structured patch or file-editing tools for ordinary repository changes. Do not use shell redirection, heredocs (`>`, `>>`, `cat <<EOF`), or disposable Python/Node scripts merely to create or modify repository files. If structured editing is unavailable or a large mechanical transformation is materially safer as a script, explain the exception, keep temporary helpers outside the repository when possible, remove any temporary artifacts before completion, and account for every untracked file with `git status --short`.
- **Prefer asking forgiveness over permission**: Do not halt to ask for confirmation or permission first unless there is a specific question about product requirements or architectural clarity that you need resolved.
- **Answer questions directly**: If the prompt is directly a question though, directly answer the question and ask the user if they'd like to proceed based on the answer.

## Review Workflows

When the user asks you to review changes, specifically:

- Do NOT make any direct edits to the code.
- Summarize the unstaged changes, include the staged changes WHEN SPECIFICALLY REQUESTED.
- Suggest commit message text should the user wish to proceed.

Otherwise, adjust your behavior based on the specific phrasing:

- **"Review the changes"**: Perform a standard code review. Look for correctness, logical errors, and standard best practices.
- **"Strategically review the changes"** (or any phrasing indicating another agent wrote the code, or that a thorough analysis is necessary): Act as a strategic reviewer and synthesizer. Do all typical code review exercises but with an eye for scrutiny for cohesion in particular. i.e.:
  - Scrutinize changes for human and agent readability/maintainability foremost.
  - Where applicable (addressing ADR or openspec etc.)...
    - Verify if all proposed objectives and requirements were met.
    - Clarify what the next backlog item is after we finish review/archival.
  - Evaluate whether the current changelist and the next item reflect the short vs. long term vision as maintained by our backlog docs.

## Implementation Fallout & Reconciliation

After implementation, review material decisions, omissions, deviations, and verification discoveries before archive.

- Reconcile technical and workflow fallout into Design, Tasks, and maintainer documentation.
- Update Proposal or Specifications only when product scope, capability boundaries, or observable behavior changed.
- Treat ordinary implementation discretion as implementation detail; do not over-specify it retroactively.
- Keep the final post-apply user review/approval task open until the human has reviewed the resulting implementation and explicitly accepted it; agents may not close this gate through self-review.
- Do not archive while known material fallout remains undocumented or unresolved.
- Run `openspec validate` after modifying OpenSpec artifacts.
- Re-run affected verification after repository or implementation changes.

### Preferred Roles in Reconciliation:

- `codex`: report implementation fallout, apply approved technical reconciliation, update code and focused documentation, and run focused verification.
- `agy`: classify material fallout, review cross-artifact consistency, surface scope or architectural drift, and perform holistic pre-archive review.
- Human: approve changes to product scope, observable behavior, or architectural direction.

## Svelte 5 Agent Workflow

For Svelte component, route, reactivity, lifecycle, accessibility, or performance work, prefer the official Svelte AI tooling before relying on model memory. Svelte 5 differs enough from older Svelte patterns that agents should verify current syntax and recommendations against first-party docs.

- **Svelte MCP Tooling:** Use this repo's dev-only `@sveltejs/mcp` stdio server (also available through `npm run mcp:svelte`) when the client exposes MCP. The human setup steps for Codex CLI and other clients live in [README.md](README.md#optional-svelte-mcp-setup-for-coding-agents); do not assume that a registered server is exposed to the current agent session.

- **Fallback Documentation:** If MCP is unavailable, see if you can start it yourself, otherwise inform the user but read the official first-party docs for LLMs to proceed:
  - Svelte LLM docs: [svelte.dev/llms.txt](https://svelte.dev/llms.txt)
  - Svelte Kit LLM docs: [svelte.dev/docs/kit/llms.txt](https://svelte.dev/docs/kit/llms.txt)
- **Local Validation:** Always pair Svelte-tool findings with this repo's local gates (`npm run check` for Svelte diagnostics and `npm run lint` for formatting/ESLint). Keep Svelte MCP as a dev-only tool; do not move it to runtime dependencies.
