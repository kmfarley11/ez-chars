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

- **Terminal CLI (`openspec`)**: Global or local npm command-line tool (`@fission-ai/openspec`). Used for project initialization (`openspec init`), listing change tasks, validation of specifications (conformance check), and archiving completed changes.
- **Chat Slash Commands (`/opsx`)**: Built-in commands supported by AI coding environments (e.g., Cursor, Claude Code, Windsurf) or simulated via agent system prompts:
  - `/opsx:explore`: Investigate context.
  - `/opsx:propose`: Generate proposal, design, and tasks.
  - `/opsx:apply`: Run the implementation based on approved tasks.
  - `/opsx:sync` / `/opsx:archive`: Merge specs and archive changes.

---

## 3. Mapping OpenSpec to Current `ez-chars` Mechanisms

We evaluate how OpenSpec aligns with, complements, or duplicates existing patterns in `ez-chars`:

| `ez-chars` Mechanism                            | OpenSpec Mapping & Fit                                                                                                                                                                                                                                                    |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Durable Docs** (`docs/field-*.md`, etc.)      | **High overlap.** OpenSpec's `specs/` folder would replace or absorb our durable docs, shifting them to a unified directory structure with strict formatting guidelines (e.g. `### Requirement:`, `#### Scenario:`).                                                      |
| **Backlog Slices** (`docs/mvp-backlog.md`)      | **Workflow shift.** Instead of a single backlog file with suggested slices, each backlog item (or slice) becomes an active directory in `changes/<change_id>/`.                                                                                                           |
| **Agent Boundary** (`AGENTS.md`)                | **Excellent alignment.** `AGENTS.md` divides work between **Antigravity** (Architecture/Specs) and **Codex** (Code/Tests). OpenSpec's split between Propose (Architectural Ideation/Design) and Apply (Implementation/Execution) directly mirrors this division of labor. |
| **Skillsets** (Codex Skills)                    | **Complementary.** OpenSpec tasks can be combined with specific Codex skills (e.g. Svelte 5 UI work, storage migration) to standardise code implementation.                                                                                                               |
| **Verification Gates** (`docs/verification.md`) | **Orthogonal.** OpenSpec CLI validates the markdown syntax and structure of specs/scenarios, but does not run Svelte diagnostics or Vitest. Local verification gates must still run in `tasks.md` or a `/opsx:verify` check.                                              |
| **Svelte Tooling & Local-First Style**          | **Neutral.** OpenSpec is technology-stack agnostic. It handles specification and tasks but doesn't affect local-first implementation mechanics directly.                                                                                                                  |

---

## 4. Evaluation of OpenSpec

### 4.1 Pros

1. **Durable Knowledge Preservation:** Moving specification out of chat history and into `openspec/specs/` guarantees the agent has context on historical architecture decisions.
2. **Explicit Planning Checkpoint:** Enforces that a human approves the technical design (`design.md`) and task checklist (`tasks.md`) before any code is generated.
3. **Delta-Spec Driven:** Focusing on spec differences makes it highly compatible with existing codebase structures ("brownfield" projects).
4. **Natural Agent Division:** Cleanly separates Antigravity's role (building the proposal, design, and specs) from Codex's role (executing `tasks.md`).

### 4.2 Cons & Gaps (With Mitigations)

1. **Tooling Dependency:** Requires installing the `@fission-ai/openspec` npm package.
   - _Status:_ User approved adding this as a dev dependency. We can install `@fission-ai/openspec` locally and execute it via `npx` or local npm scripts.
2. **Slash Command Friction:** Slash commands like `/opsx:propose` depend on IDE-level support (e.g. Cursor or Claude Code).
   - _Mitigation:_ The agent can execute the equivalent terminal CLI commands directly (e.g., running `npx @fission-ai/openspec <cmd>` via the `run_command` tool) or map these actions to explicit instructions in [../AGENTS.md](../AGENTS.md) and project-local Codex skills. This bridges the gap for clients that don't natively support `/opsx:` chat shortcuts.
3. **Formatting Overhead & Process Weight:** OpenSpec expects specs to be structured in precise requirements/scenarios for validation, and creating a dedicated change folder for every small slice can feel heavy for a small MVP.
   - _Mitigation (Vibecoding / Fast-Track Mode):_ We can introduce a "Fast-Track" or "Vibecode" rule in [../AGENTS.md](../AGENTS.md). For small, low-risk, styling, or documentation-only slices, the agent can directly implement the changes without a formal proposal folder, provided they update a summary log or backlog status at the end of the turn. These ad-hoc changes can then be periodically triaged into the main specs.

---

## 5. Design Alternatives Exploration

### 5.1 Lightweight Markdown ADRs + Backlog Slices (Current Improved)

This alternative refines our existing raw markdown backlog (`docs/mvp-backlog.md`) and guidelines (`AGENTS.md`), adding a formal but lightweight Architecture Decision Record (ADR) system in `docs/decisions/` (or `docs/specs/`) for complex architectural changes.

#### 5.1.1 Mapping to `ez-chars` Mechanisms

| `ez-chars` Mechanism                   | ADRs + Backlog Slices Fit & Workflow                                                                                                                                                                                                            |
| :------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Durable Docs**                       | **Natural integration.** Architectural decisions are captured as markdown files under `docs/decisions/YYYY-MM-DD-title.md` or `docs/specs/feature-spec.md`. They remain permanent, searchable, versioned documents in the codebase.             |
| **Backlog Slices**                     | **Direct fit.** We continue to use a single queue (`docs/mvp-backlog.md`) with distinct, atomic suggested slices. Active task tracking remains in the backlog, checking off slices as they are completed.                                       |
| **Agent Boundary**                     | **Clean boundary.** **Antigravity** drafts the ADR/Spec and refines the backlog slice. **Codex** references the ADR/Spec to implement the code and test coverage. The definition-of-done in the backlog slice serves as Codex's task checklist. |
| **Skillsets**                          | **Fully compatible.** Project-local Codex skills can be defined to execute common tasks (e.g. running Svelte typechecks, Vitest tests, or storage validations).                                                                                 |
| **Verification Gates**                 | **Fully integrated.** The backlog slice's definition of done explicitly lists verification steps. The agent runs `npm run test` / `check` / `lint` / `build` as standard.                                                                       |
| **Svelte Tooling & Local-First Style** | **Zero-dependency.** Fits the lightweight, local-first ethos of the project. No CLI tools or IDE integrations required.                                                                                                                         |

---

### 5.2 Strict RFC/PRD Workflow

This alternative adapts a formal, document-first planning approach. Product features start as Product Requirements Documents (PRDs) under `docs/prds/` defining the "Why" and "What." Technical designs are proposed as Request for Comments (RFCs) under `docs/rfcs/` defining the "How."

#### 5.2.1 Mapping to `ez-chars` Mechanisms

| `ez-chars` Mechanism                   | Strict RFC/PRD Fit & Workflow                                                                                                                                                                                                  |
| :------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Durable Docs**                       | **Extremely high durability.** Features are fully specified in standalone PRD and RFC markdown documents (e.g. `docs/rfcs/001-field-binding.md`). These form a permanent and chronological archive of the project's evolution. |
| **Backlog Slices**                     | **Referential fit.** Backlog items are created _after_ an RFC is approved. The backlog slice references the RFC for all implementation details and maps its "Implementation Plan" to backlog tasks.                            |
| **Agent Boundary**                     | **Explicit handoff.** **Antigravity** writes the PRD and RFC. Once the human approves the RFC, **Codex** is handed the backlog slice to implement it.                                                                          |
| **Skillsets**                          | **Fully compatible.** Project-local Codex skills can be used during implementation.                                                                                                                                            |
| **Verification Gates**                 | **Structured.** The RFC's "Verification and Testing Plan" details specific checks. The agent runs standard tests/checks/lints to satisfy these.                                                                                |
| **Svelte Tooling & Local-First Style** | **Zero-dependency.** Pure markdown and git. No special CLI or IDE integrations.                                                                                                                                                |

### 5.3 Spec-Driven Tests / BDD (Behavior Driven Development)

This alternative uses executable test suites (Gherkin/Cucumber feature files, or Vitest/Playwright tests with BDD-style `describe`/`it`/`given`/`when`/`then` syntax) as the primary specification. The code and tests themselves serve as the living documentation.

#### 5.3.1 Mapping to `ez-chars` Mechanisms

| `ez-chars` Mechanism                   | Spec-Driven Tests / BDD Fit & Workflow                                                                                                                                                                                                               |
| :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Durable Docs**                       | **Code-level durability.** The specification lives in test files (e.g. `src/schema/__tests__/character.spec.ts`). It cannot drift from actual behavior without failing, but it is less readable for non-technical stakeholders compared to markdown. |
| **Backlog Slices**                     | **Direct test alignment.** Backlog slices are implemented by first writing failing spec tests, then writing code to pass them.                                                                                                                       |
| **Agent Boundary**                     | **Test-first boundary.** **Antigravity** drafts the test suite structure and mock data models. **Codex** writes the actual code and test implementation, verifying success when tests turn green.                                                    |
| **Skillsets**                          | **Excellent fit.** Pairs naturally with Codex skills for test execution, mock setups, and Svelte component rendering assertions.                                                                                                                     |
| **Verification Gates**                 | **Deeply unified.** Running `npm run test` executes both the test suite and the behavioral specification.                                                                                                                                            |
| **Svelte Tooling & Local-First Style** | **Dependency-heavy.** Often requires additional test runners, mounting libraries, or Gherkin parsers (e.g. Cucumber plugins) to write readable features.                                                                                             |

### 5.4 GitHub Spec Kit

GitHub Spec Kit (`spec-kit`) is an open-source toolkit and framework designed for Spec-Driven Development (SDD) with AI agents. It uses a python-based CLI tool (`specify`) to enforce structured phase gates: Constitution -> Specify -> Plan -> Tasks -> Implement.

#### 5.4.1 Mapping to `ez-chars` Mechanisms

| `ez-chars` Mechanism                   | GitHub Spec Kit Fit & Workflow                                                                                                                                                          |
| :------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Durable Docs**                       | **Extremely high.** Stores memory and specs under a `.specify/` folder. It uses `constitution.md` to enforce immutable codebase principles and rules that the agent must always follow. |
| **Backlog Slices**                     | **Direct task integration.** It generates task lists (`/speckit.tasks`) which can map onto backlog items or execution scripts.                                                          |
| **Agent Boundary**                     | **Highly rigid phases.** The CLI guides the agent through structured gates. Antigravity handles Constitution, Specification, and Planning. Codex handles Tasks and Implementation.      |
| **Skillsets**                          | **Native integration.** Automatically sets up agent-specific directories and custom tools/skills (e.g. `.claude/skills/`) to integrate with the agent's context.                        |
| **Verification Gates**                 | **Compatible.** Integrates standard verification steps into the task checklist.                                                                                                         |
| **Svelte Tooling & Local-First Style** | **Heavyweight.** Requires Python and the `uv`/`uvx` package manager to run the CLI. Adds complex `.specify/` structures and agent configurations to the workspace.                      |

### 5.5 Example Mapping + Selective Gherkin (Hybrid BDD)

This hybrid alternative combines **Example Mapping** (a structured conversation framework to discover Rules, Examples, Questions, and Stories) with **selective Gherkin syntax specs** (Given-When-Then format written in markdown files). Crucially, Gherkin syntax is only executed as automated tests for complex core logic (e.g. state patches, HP math, schema parsing); standard UI and styling behaviors remain documented as simple text scenarios without test-automation overhead.

#### 5.5.1 Mapping to `ez-chars` Mechanisms

| `ez-chars` Mechanism                   | Example Mapping + Selective Gherkin Fit & Workflow                                                                                                                                                                                             |
| :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Durable Docs**                       | **Very high.** Example maps and Gherkin scenarios are stored as clean, human-readable markdown files (e.g. `docs/specs/hp-binding.spec.md`). These are readable for both humans and agents.                                                    |
| **Backlog Slices**                     | **Direct alignment.** Each rule and example from the map directly forms the suggested slices or the slice's definition of done.                                                                                                                |
| **Agent Boundary**                     | **Highly cooperative.** **Antigravity** runs the Example Mapping process (structuring Rules, Examples, and Questions). Once resolved, **Codex** translates complex examples into Vitest suites and implements the code.                        |
| **Skillsets**                          | **Fully compatible.** Pairs with Codex skills for test wiring and schema validation.                                                                                                                                                           |
| **Verification Gates**                 | **Optimized.** Complex rules are verified automatically by running Vitest on the selective tests. UI and simple state are verified manually or via standard smoke tests, keeping the test runner fast.                                         |
| **Svelte Tooling & Local-First Style** | **Lightweight.** No heavy BDD/Gherkin parser package is required; the Gherkin syntax in markdown serves as readable documentation, and selective tests are written using standard Vitest assertions (e.g. `test('Given... When... Then...')`). |

---

### 5.6 Side-by-Side Comparison Matrix

| Feature / Dimension           | OpenSpec (with Mitigations)                                        | ADRs + Backlog Slices (Current Improved)                     | Strict RFC/PRD Workflow                                       | Spec-Driven Tests / BDD                                             | GitHub Spec Kit                                               | Example Mapping + Selective Gherkin                                                   |
| :---------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------ | :------------------------------------------------------------ | :------------------------------------------------------------------------------------ |
| **Tooling Dependency**        | Requires `@fission-ai/openspec` (dev dependency).                  | None (pure markdown and git).                                | None (pure markdown and git).                                 | May require additional BDD parsers/test libraries.                  | Requires Python, `uv`/`uvx`, and `specify-cli`.               | None (Gherkin specs in markdown, Vitest for selective tests).                         |
| **Workspace Overhead**        | Introduces `openspec/` with active and archived changes.           | None. Keeps docs in `docs/` or backlog.                      | High. Adds structured `docs/prds/` and `docs/rfcs/`.          | Low. Keeps specs inside `__tests__/` folders.                       | High. Adds `.specify/` configuration and agent skill files.   | Low. Keeps spec maps in `docs/specs/` or `__tests__/`.                                |
| **Spec-to-Code Traceability** | Strong. Merges delta specs into main specs via CLI `archive` step. | Moderate. Relies on manual document updates and Git history. | Very Strong. Numbered RFCs map directly to commit boundaries. | Absolute. Executable tests and code are directly coupled.           | Very Strong. Enforces strict mapping of specs to tasks.       | Strong. Rules and Gherkin examples map directly to unit tests and slices.             |
| **Process Friction**          | Higher. Enforces proposal/design/task folder creation.             | Lower. Highly flexible, easy to write and update.            | High. Requires writing separate PRD/RFC documents.            | High. Writing BDD specs for UI can be verbose.                      | Very High. Strict multi-stage phase gates.                    | Moderate. Requires structuring requirements into rules and examples.                  |
| **Vibecoding / Fast-Track**   | Requires explicit rules to bypass proposal folders.                | Native. Agent can immediately vibecode and update docs.      | Poor. Requires formal RFC cycles before coding.               | Mixed. Can prototype code, but requires retrofitting test suites.   | Extremely Poor. Enforces rigid step-by-step gates.            | Native. Fast-track edits are permitted, adding rules/examples only for complex logic. |
| **Agent Coordination**        | Automated task runner interface via `tasks.md` and `/opsx:apply`.  | Manual checklist alignment via backlog slice.                | Explicit handoff: spec (RFC) is finalized before code starts. | Green-light feedback: Codex writes implementation until tests pass. | Highly automated. Integrates custom skills/commands directly. | Highly structured. Spec maps provide clear, testable boundaries for Codex.            |

---

## 6. Recommendation: Mitigated OpenSpec + Example Mapping (Hybrid)

To address the "loosey-goosey" feel of a single raw backlog file while keeping the process organic and free of excessive overhead, we recommend adopting a **Mitigated OpenSpec + Example Mapping (Hybrid)** workflow.

### 6.1 Core Concepts of the Recommended Workflow

1. **High-Level Roadmap:** Keep [docs/mvp-backlog.md](mvp-backlog.md) as the simple, prioritized backlog queue for humans and agents to scan.
2. **Isolated Task Execution (No "Loosey-Goosey" Backlogs):** When starting a non-trivial backlog item (e.g. `p1-002`, `p1-022`), the agent creates an OpenSpec change folder: `openspec/changes/<change_id>/`. This isolates active execution tasks (`tasks.md`) from the main backlog, preventing clutter and intermediate checkbox noise.
3. **Structured & Organic Specifications:** Within the change folder, the agent defines the feature's behavior in `proposal.md` and `design.md` using **Example Mapping** (organizing rules, examples, and open questions) and **selective Gherkin scenarios** (Given-When-Then format) for complex behavior.
4. **Durable Knowledge Base:** When a change is completed, the agent runs `npx openspec archive` (or simulates it). This automatically merges the Gherkin scenarios into a permanent, searchable spec catalog under `openspec/specs/` and archives the change history, preserving learned behavior.
5. **Vibecoding Fast-Track:** For minor styling tweaks, typo corrections, or simple text modifications, agents are explicitly allowed to bypass the OpenSpec folders and edit code directly, provided they log the change in a brief summary or update the backlog status at the end of the turn.

---

## 7. Evaluation and Rejections

- **Rejected: Strict RFC/PRD Workflow.** Too heavyweight. For a single-developer, local-first web app, writing full PRDs and RFCs for every detail generates massive document overhead and slows down iteration.
- **Rejected: Full Spec-Driven Tests / Executable BDD.** Writing automated BDD tests (Cucumber/Gherkin integration tests) for every UI component or Svelte visual element introduces massive boilerplate, test runner latency, and fragile selector maintenance.
- **Rejected: Raw Markdown Backlog Slices (Current unimproved).** Leaving the backlog as a single, growing file makes active tasks hard to isolate, leads to spec drift, and requires frequent manual cleaning and agent handholding to nitpick task lists.
- **Rejected: GitHub Spec Kit.** The Python dependency (`uv`/`uvx`) and highly rigid phase gates add unnecessary environment friction and overhead compared to a lightweight Node dev-dependency like `@fission-ai/openspec`.

---

## 8. Consequences and Follow-Ups for `p1-002`

Adopting this workflow means that in the follow-on task **`p1-002`**, we will perform the following restructuring:

1. **Dev-Dependency Installation:** Add `@fission-ai/openspec` to `devDependencies` in `package.json`.
2. **Backlog Refining:** Reorganize [docs/mvp-backlog.md](mvp-backlog.md) to reference specs and OpenSpec change IDs.
3. **Agent Integration (`AGENTS.md`):** Update the agent guide to instruct **Antigravity** (to run the Explore/Propose cycle, create Example Maps, and design tasks) and **Codex** (to run the Apply/Archive cycle, execute `tasks.md`, and write selective tests).
4. **Fast-Track Rules:** Explicitly document the boundaries of the "Vibecoding Fast-Track" in the guidelines.

---

_Please review the finalized recommendation. We are ready to proceed with refining backlog item `p1-002` to implement this chosen specs/backlog workflow once this decision is approved._
