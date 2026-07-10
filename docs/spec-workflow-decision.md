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

### Pros
1. **Durable Knowledge Preservation:** Moving specification out of chat history and into `openspec/specs/` guarantees the agent has context on historical architecture decisions.
2. **Explicit Planning Checkpoint:** Enforces that a human approves the technical design (`design.md`) and task checklist (`tasks.md`) before any code is generated.
3. **Delta-Spec Driven:** Focusing on spec differences makes it highly compatible with existing codebase structures ("brownfield" projects).
4. **Natural Agent Division:** Cleanly separates Antigravity's role (building the proposal, design, and specs) from Codex's role (executing `tasks.md`).

### Cons & Gaps (With Mitigations)
1. **Tooling Dependency:** Requires installing the `@fission-ai/openspec` npm package.
   * *Status:* User approved adding this as a dev dependency. We can install `@fission-ai/openspec` locally and execute it via `npx` or local npm scripts.
2. **Slash Command Friction:** Slash commands like `/opsx:propose` depend on IDE-level support (e.g. Cursor or Claude Code).
   * *Mitigation:* The agent can execute the equivalent terminal CLI commands directly (e.g., running `npx @fission-ai/openspec <cmd>` via the `run_command` tool) or map these actions to explicit instructions in [../AGENTS.md](../AGENTS.md) and project-local Codex skills. This bridges the gap for clients that don't natively support `/opsx:` chat shortcuts.
3. **Formatting Overhead & Process Weight:** OpenSpec expects specs to be structured in precise requirements/scenarios for validation, and creating a dedicated change folder for every small slice can feel heavy for a small MVP.
   * *Mitigation (Vibecoding / Fast-Track Mode):* We can introduce a "Fast-Track" or "Vibecode" rule in [../AGENTS.md](../AGENTS.md). For small, low-risk, styling, or documentation-only slices, the agent can directly implement the changes without a formal proposal folder, provided they update a summary log or backlog status at the end of the turn. These ad-hoc changes can then be periodically triaged into the main specs.

---

## 5. Next Steps & Alternatives (Human Checkpoint)

Before proceeding with OpenSpec, we must compare it with other spec/backlog approaches to ensure we select the best-fitting workflow for `ez-chars`. 

*Proposed Alternatives for Comparison:*
1. **Lightweight Markdown ADRs + Backlog Slices (Current Improved):** Refine our current `docs/mvp-backlog.md` and `AGENTS.md` guidelines. Use simple markdown ADRs (Architecture Decision Records) in `docs/decisions/` for complex features without adding a separate CLI tool or slash commands.
2. **Strict RFC/PRD Workflow:** A document-first approach where changes are proposed as RFC (Request for Comments) documents, but tasks are handled directly in the backlog or issue queue rather than delta folders.
3. **Spec-Driven Tests (BDD/Cucumber):** Utilizing Svelte/JS test suites (e.g. Vitest + Playwright) directly as the executable specifications, rather than separating specifications into markdown files.

---

*Please review the findings above. Once reviewed, we will proceed to select alternative workflows for deeper exploration.*
