# Decision Article: Spec-Driven Workflow and Backlog Alternatives

**Status:** Draft / Evaluating  
**Author:** Antigravity (Architectural Agent)  
**Date:** 2026-07-10  

---

## 1. Executive Summary

This decision article evaluates specification-driven development (SDD) workflows for the `ez-chars` repository. Specifically, we investigate **OpenSpec** (by Fission-AI) as a lightweight in-repository specification framework. We analyze how its repo model, CLI/slash command workflows, and spec lifecycle fit with our current local-first MVP backlog, agent-boundary model (`AGENTS.md`), and validation gates. 

We compare OpenSpec to our current raw markdown slice workflow and outline a human-in-the-loop checkpoint to decide which other alternatives are worth comparing before refining `p1-002`.

---

## 2. What is OpenSpec?

OpenSpec is an open-source framework designed to implement **Spec-Driven Development (SDD)** in AI-assisted coding. It establishes a structured boundary between planning and code generation.

### 2.1 Repository Model & Folder Structure
OpenSpec introduces a dedicated workspace directory, typically structured as:
```text
openspec/
├── specs/                   # The active system specifications (Source of Truth)
│   └── <feature_path>/
│       └── spec.md          # Living documentation of current behavior
└── changes/                 # Workspaces for active change proposals
    └── <change_id>/
        ├── proposal.md      # The "Why" and "What" of the change
        ├── design.md        # The "How" (technical approach, file modifications)
        ├── tasks.md         # Checklist of implementation tasks
        └── specs/           # "Delta specs" defining spec changes for this proposal
```

### 2.2 Core Workflow & Lifecycle
OpenSpec operates in a cyclical lifecycle:
1. **Explore:** Analyze the codebase and requirements to understand the problem.
2. **Propose:** The agent creates a change folder under `changes/<change_id>/` with `proposal.md`, `design.md`, `tasks.md`, and delta specs.
3. **Approve:** The human reviews, modifies, and approves these planning artifacts.
4. **Apply:** The agent implements the code step-by-step using the approved `tasks.md` checklist.
5. **Sync/Archive:** Delta specs are merged into `specs/` (updating the source of truth), and the completed change folder is cleaned up or moved to the archive.

### 2.3 CLI & Slash Command Model
* **Terminal CLI (`openspec`)**: Global or local npm command-line tool (`@fission-ai/openspec`). Used for project initialization (`openspec init`), listing change tasks, validation of specifications (conformance check), and archiving completed changes.
* **Chat Slash Commands (`/opsx`)**: Built-in commands supported by AI coding environments (e.g., Cursor, Claude Code, Windsurf) or simulated via agent system prompts:
  * `/opsx:explore`: Investigate context.
  * `/opsx:propose`: Generate proposal, design, and tasks.
  * `/opsx:apply`: Run the implementation based on approved tasks.
  * `/opsx:sync` / `/opsx:archive`: Merge specs and archive changes.

---

## 3. Mapping OpenSpec to Current `ez-chars` Mechanisms

We evaluate how OpenSpec aligns with, complements, or duplicates existing patterns in `ez-chars`:

| `ez-chars` Mechanism | OpenSpec Mapping & Fit |
| :--- | :--- |
| **Durable Docs** (`docs/field-*.md`, etc.) | **High overlap.** OpenSpec's `specs/` folder would replace or absorb our durable docs, shifting them to a unified directory structure with strict formatting guidelines (e.g. `### Requirement:`, `#### Scenario:`). |
| **Backlog Slices** (`docs/mvp-backlog.md`) | **Workflow shift.** Instead of a single backlog file with suggested slices, each backlog item (or slice) becomes an active directory in `changes/<change_id>/`. |
| **Agent Boundary** (`AGENTS.md`) | **Excellent alignment.** `AGENTS.md` divides work between **Antigravity** (Architecture/Specs) and **Codex** (Code/Tests). OpenSpec's split between Propose (Architectural Ideation/Design) and Apply (Implementation/Execution) directly mirrors this division of labor. |
| **Skillsets** (Codex Skills) | **Complementary.** OpenSpec tasks can be combined with specific Codex skills (e.g. Svelte 5 UI work, storage migration) to standardise code implementation. |
| **Verification Gates** (`docs/verification.md`) | **Orthogonal.** OpenSpec CLI validates the markdown syntax and structure of specs/scenarios, but does not run Svelte diagnostics or Vitest. Local verification gates must still run in `tasks.md` or a `/opsx:verify` check. |
| **Svelte Tooling & Local-First Style** | **Neutral.** OpenSpec is technology-stack agnostic. It handles specification and tasks but doesn't affect local-first implementation mechanics directly. |

---

## 4. Evaluation of OpenSpec

### 4.1 Pros
1. **Durable Knowledge Preservation:** Moving specification out of chat history and into `openspec/specs/` guarantees the agent has context on historical architecture decisions.
2. **Explicit Planning Checkpoint:** Enforces that a human approves the technical design (`design.md`) and task checklist (`tasks.md`) before any code is generated.
3. **Delta-Spec Driven:** Focusing on spec differences makes it highly compatible with existing codebase structures ("brownfield" projects).
4. **Natural Agent Division:** Cleanly separates Antigravity's role (building the proposal, design, and specs) from Codex's role (executing `tasks.md`).

### 4.2 Cons & Gaps (With Mitigations)
1. **Tooling Dependency:** Requires installing the `@fission-ai/openspec` npm package.
   * *Status:* User approved adding this as a dev dependency. We can install `@fission-ai/openspec` locally and execute it via `npx` or local npm scripts.
2. **Slash Command Friction:** Slash commands like `/opsx:propose` depend on IDE-level support (e.g. Cursor or Claude Code).
   * *Mitigation:* The agent can execute the equivalent terminal CLI commands directly (e.g., running `npx @fission-ai/openspec <cmd>` via the `run_command` tool) or map these actions to explicit instructions in [../AGENTS.md](../AGENTS.md) and project-local Codex skills. This bridges the gap for clients that don't natively support `/opsx:` chat shortcuts.
3. **Formatting Overhead & Process Weight:** OpenSpec expects specs to be structured in precise requirements/scenarios for validation, and creating a dedicated change folder for every small slice can feel heavy for a small MVP.
   * *Mitigation (Vibecoding / Fast-Track Mode):* We can introduce a "Fast-Track" or "Vibecode" rule in [../AGENTS.md](../AGENTS.md). For small, low-risk, styling, or documentation-only slices, the agent can directly implement the changes without a formal proposal folder, provided they update a summary log or backlog status at the end of the turn. These ad-hoc changes can then be periodically triaged into the main specs.

---

## 5. Design Alternatives Exploration

### 5.1 Lightweight Markdown ADRs + Backlog Slices (Current Improved)
This alternative refines our existing raw markdown backlog (`docs/mvp-backlog.md`) and guidelines (`AGENTS.md`), adding a formal but lightweight Architecture Decision Record (ADR) system in `docs/decisions/` (or `docs/specs/`) for complex architectural changes.

#### 5.1.1 Mapping to `ez-chars` Mechanisms
| `ez-chars` Mechanism | ADRs + Backlog Slices Fit & Workflow |
| :--- | :--- |
| **Durable Docs** | **Natural integration.** Architectural decisions are captured as markdown files under `docs/decisions/YYYY-MM-DD-title.md` or `docs/specs/feature-spec.md`. They remain permanent, searchable, versioned documents in the codebase. |
| **Backlog Slices** | **Direct fit.** We continue to use a single queue (`docs/mvp-backlog.md`) with distinct, atomic suggested slices. Active task tracking remains in the backlog, checking off slices as they are completed. |
| **Agent Boundary** | **Clean boundary.** **Antigravity** drafts the ADR/Spec and refines the backlog slice. **Codex** references the ADR/Spec to implement the code and test coverage. The definition-of-done in the backlog slice serves as Codex's task checklist. |
| **Skillsets** | **Fully compatible.** Project-local Codex skills can be defined to execute common tasks (e.g. running Svelte typechecks, Vitest tests, or storage validations). |
| **Verification Gates** | **Fully integrated.** The backlog slice's definition of done explicitly lists verification steps. The agent runs `npm run test` / `check` / `lint` / `build` as standard. |
| **Svelte Tooling & Local-First Style** | **Zero-dependency.** Fits the lightweight, local-first ethos of the project. No CLI tools or IDE integrations required. |

---

### 5.2 Strict RFC/PRD Workflow
This alternative adapts a formal, document-first planning approach. Product features start as Product Requirements Documents (PRDs) under `docs/prds/` defining the "Why" and "What." Technical designs are proposed as Request for Comments (RFCs) under `docs/rfcs/` defining the "How."

#### 5.2.1 Mapping to `ez-chars` Mechanisms
| `ez-chars` Mechanism | Strict RFC/PRD Fit & Workflow |
| :--- | :--- |
| **Durable Docs** | **Extremely high durability.** Features are fully specified in standalone PRD and RFC markdown documents (e.g. `docs/rfcs/001-field-binding.md`). These form a permanent and chronological archive of the project's evolution. |
| **Backlog Slices** | **Referential fit.** Backlog items are created *after* an RFC is approved. The backlog slice references the RFC for all implementation details and maps its "Implementation Plan" to backlog tasks. |
| **Agent Boundary** | **Explicit handoff.** **Antigravity** writes the PRD and RFC. Once the human approves the RFC, **Codex** is handed the backlog slice to implement it. |
| **Skillsets** | **Fully compatible.** Project-local Codex skills can be used during implementation. |
| **Verification Gates** | **Structured.** The RFC's "Verification and Testing Plan" details specific checks. The agent runs standard tests/checks/lints to satisfy these. |
| **Svelte Tooling & Local-First Style** | **Zero-dependency.** Pure markdown and git. No special CLI or IDE integrations. |

---

### 5.3 Side-by-Side Comparison Matrix

| Feature / Dimension | OpenSpec (with Mitigations) | ADRs + Backlog Slices (Current Improved) | Strict RFC/PRD Workflow |
| :--- | :--- | :--- | :--- |
| **Tooling Dependency** | Requires `@fission-ai/openspec` (dev dependency). | None (pure markdown and git). | None (pure markdown and git). |
| **Workspace Overhead** | Introduces `openspec/` with active and archived change folders. | None. Keeps docs in `docs/` or backlog. | High. Adds structured `docs/prds/` and `docs/rfcs/` directories. |
| **Spec-to-Code Traceability** | Strong. Merges delta specs into main specs via CLI `archive` step. | Moderate. Relies on manual document updates and Git history. | Very Strong. Clear, numbered RFCs map directly to commit boundaries. |
| **Process Friction** | Higher. Enforces proposal/design/task folder creation and spec validation. | Lower. Highly flexible, easy to write and update. | High. Requires writing separate PRD/RFC documents before coding. |
| **Vibecoding / Fast-Track** | Requires explicit rules to bypass formal change folder creation. | Native. Agent can immediately vibecode and update docs. | Poor. Discourages fast/ad-hoc changes; requires formal RFC cycles. |
| **Agent Coordination** | Automated task runner interface via `tasks.md` and `/opsx:apply`. | Manual checklist alignment via backlog slice. | Explicit handoff: spec (RFC) is finalized before code (backlog) starts. |

---

## 6. Next Steps & Alternatives (Human Checkpoint)

We have now analyzed three options:
1. **OpenSpec (Mitigated/Dev Dependency):** A spec-first framework using active changes folders and delta spec merges.
2. **Lightweight Markdown ADRs + Backlog Slices:** A zero-dependency markdown-based workflow using a single backlog queue and decision documents.
3. **Strict RFC/PRD Workflow:** A formal document-first approach separating product requirements and technical design into numbered archives.

Before making a final choice, we can explore the last remaining alternative or select a winner and run a trial:

*Remaining Alternative for Comparison (if requested):*
- **Spec-Driven Tests / BDD:** Evaluating defining features as executable test suites (Gherkin/Vitest) rather than text documents.

---

*Please review the updated comparison matrix. Choose which option to proceed with or if we should explore the remaining BDD alternative.*
