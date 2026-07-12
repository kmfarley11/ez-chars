## Context

The repository is transitioning to OpenSpec as its official steady-state engineering workflow. We need to install the `@fission-ai/openspec` tool as a dev dependency, update the agent guidelines and repository readme, record the final outcome of the spec-workflow decision, and clean up the backlog item.

## Goals / Non-Goals

**Goals:**
- Install `@fission-ai/openspec` locally and pin to version `1.6.0` in `package.json`.
- Revise `AGENTS.md` to remove transitional language, establish OpenSpec as the adopted workflow, and integrate Change-Classification Thresholds and ADR triggers.
- Explicitly define artifact responsibility boundaries in `AGENTS.md` to prevent implementation details or new behaviors from bleeding across phases.
- Add legacy documentation rules to `AGENTS.md` to protect existing design files from unnecessary migrations.
- Add explicit repository guidance in `AGENTS.md` clarifying that **Proposal Capabilities** are durable repository vocabulary representing stable behavioral concepts (behavioral concepts the system exposes) rather than implementation features, source files, modules, APIs, frameworks, or architectural details. Instruct agents to avoid using Capabilities for implementation decomposition, and state that Capability names should remain stable even if the implementation changes significantly.
- Revise `README.md` to add human-facing maintainer workflow context (including Prototyping, Exploration, Fallout, and Reconciliation steps).
- Set `docs/spec-workflow-decision.md` to status `Approved` and document the final pilot evaluation outcome.
- Mark backlog item `p1-002` as complete and add its outcome.
- Update the backlog's AI prompting guidelines to reflect the OpenSpec-first flow.

**Non-Goals:**
- Migrating existing markdown docs in `docs/` to `openspec/specs/` solely for coverage.
- Modifying any application source code.

## Decisions

- **Decision 1: Pin `@fission-ai/openspec` version to exactly `1.6.0` in `package.json`**:
  - *Rationale*: Guarantees deterministic behavior for CLI commands executed by both human developers and agents without risk of breaking changes in future releases.
- **Decision 2: Document human-driven workflow in `README.md`**:
  - *Rationale*: Keeps `AGENTS.md` focused on clean agent rules, boundaries, and checklists, while providing a clear guide in `README.md` for human maintainers.
- **Decision 3: Update `docs/spec-workflow-decision.md` with a direct "Outcome" section**:
  - *Rationale*: Summarizes evaluated pilot findings (Fruit Atlas pilot) and officially supersedes the original complex migration plans, keeping decision history accurate.
- **Decision 4: Explicitly define artifact boundaries in `AGENTS.md`**:
  - *Rationale*: Current agents tend to compress Proposal, Specification, Design, and Tasks into one step. Formally partitioning them prevents implementation details from leaking into proposals/specs, and prevents design details from leaking into tasks.
- **Decision 5: Declare legacy documentation as authoritative**:
  - *Rationale*: Avoids high-friction, low-value translation work by retaining existing docs as authoritative until modified.
- **Decision 6: Formalize Capabilities as durable vocabulary in `AGENTS.md`**:
  - *Rationale*: Prevents Capability proliferation and keeps the Specification namespace clean, mapping specs strictly to stable user-facing concepts.

## Risks / Trade-offs

- **[Risk] Workflow Friction for Trivial Edits**: Agents might try to auto-propose or auto-apply simple styling or documentation tweaks, leading to excessive workflow friction.
- **[Mitigation] Vibecoding Fast-Track Rules**: Maintain clear Change-Classification Thresholds in `AGENTS.md` that explicitly allow bypassing change directories for low-risk edits (e.g., typos, isolated styling, refactoring without behavior change).
