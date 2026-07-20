# Prioritized Backlog

This is the prioritized engineering backlog for ez-chars.

Use this file with:

- [../AGENTS.md](../AGENTS.md)
- [active-goals.md](active-goals.md)

Treat [active-goals.md](active-goals.md) as the boundary document defining product scope, and this file as the prioritized queue of candidate work.

## Backlog Triage & Refinement Workflow

We expect to ideate and triage backlog items through the following workflow:

1. **Ideation Sandbox (Unsorted Ideas)**: Dump rough thoughts, refactor ideas, or feature wishes directly into the `## Ideation Sandbox` at the bottom of this file. This provides a low-friction space for human and agent brainstorming.
2. **Refinement Sessions with AI**: Before implementing a sandbox item or new request, engage in a refinement session with an AI agent (e.g., in a chat thread or via the `/opsx-explore` thinking workflow / `openspec-explore` skill). The goal is to move from rough ideas to a structured backlog item.
3. **Structured Refinement Outputs**: Refinement sessions must output the following standardized fields to define new backlog items (transitioning away from the legacy Size, Scope, Slices, and DoD structure):
   - **Purpose:** What user problem are we solving?
   - **Included behavior:** What is the smallest useful capability?
   - **Excluded behavior:** What tempting features should remain out of scope?
   - **Ambiguities:** What decisions must be made before implementation?
   - **Success:** What observable scenarios would convince you it works?
4. **Triaging to the Backlog**: Move the refined item into the prioritized backlog queues (`## P1` or `## P2`), assign it a unique ID (e.g., `p1-060`), and specify its priority context.
5. **Executing via OpenSpec**: When work begins, run `/opsx-propose` (or trigger the `/opsx:propose` workflow) to generate all planning artifacts (`proposal.md`, `design.md`, `specs/`, and `tasks.md`) within the change workspace. The refined backlog item forms the input template for the proposal.

## P0

No active P0 items.

## P1

Next recommended sequence for remaining P1 items:

**Phase 2: UX Polish & Playtest Prep**

1. `p1-061`: Extend runtime-action sources to spells and features after their stable identity and suggestion semantics are refined
2. `p1-027`: Replace custom grid auto-measurement with native CSS Container Queries
3. `p1-020`: Improve accessibility and mobile review of menus, dialogs, and sheet sections

_(Note: `p1-010` for GitHub Actions remains deferred until CI needs justify it)._

### Refine backlog and agent workflow after spec-workflow decision

ID:

- `p1-002`

Outcome:

- OpenSpec adopted.
- Future work should begin with OpenSpec exploration and active change workspaces.
- No repository-wide migration is planned.

Status:

- **Complete.** Installed local `@fission-ai/openspec`, updated agent guidelines, repository README, decision records, and backlog instructions.

### Extend runtime-action sources to spells and features

ID:

- `p1-061`

Refinement outputs:

- **Purpose:** Complete the approved runtime-action source architecture by allowing spell and feature records—not only inventory items—to seed and link runtime summaries without weakening data identity or introducing a speculative universal adapter.
- **Included behavior:**
  - Establish and migrate stable identities for the 5e spell and feature references that are selected as linkable source records.
  - Widen the atomic runtime-action source union to the supported spell and feature kinds.
  - Add source-specific suggestions, linked/custom status, navigation, explicit resync, and source-deletion fallback consistent with the inventory slice.
  - Preserve multiple actions per source and independently editable action snapshots.
- **Excluded behavior:**
  - A generic multi-system source registry, automatic per-field bubbling/override masks, dice or mechanics automation, and external-provider identity on runtime actions.
  - Assuming every spell or feature grants a runtime action without a source-specific eligibility rule.
- **Ambiguities:**
  - Which spell state qualifies for suggestions (known, prepared, active, or another explicit subset)?
  - Which root, ancestry, background, class, and subclass feature collections become sourceable, and how are stable IDs migrated without identity collisions?
  - Can the first spell/feature suggestions remain text-only, or do their concrete records require source-specific mapping before the behavior is useful?
  - Should this follow-up precede or follow the first external compendium lookup once that work is refined?
- **Success:**
  - Supported spell and feature records have stable migrated identities and may be linked without data loss or dangling references.
  - A user can discover, accept, navigate, resync, and safely unlink spell/feature-derived action snapshots through the same observable lifecycle as inventory-derived actions.
  - The implementation remains 5e- and source-specific until repeated concrete seams justify any shared composition layer.

### Add GitHub Actions for quality gates

ID:

- `p1-010`

Size:

- small; deferred until contributors, release cadence, or branch-protection needs justify CI

Scope:

- add a GitHub Actions workflow for the existing repo quality gates
- keep local verification in [docs/verification.md](verification.md) as the current source of truth until CI becomes worthwhile
- do not add CI just to replace the current explicit local verification plus manual `npm run deploy` release workflow

Defer rationale:

- Current development is primarily local and manually verified between the developer and AI agents.
- Releases are explicit through `npm run deploy`, so there is no automatic release path that CI needs to guard yet.
- GitHub Actions would catch forgotten local checks, but it can also add noise, queue time, and possible minute/quota consumption before the product and contributor workflow are stable.

Suggested implementation slices:

1. Add a workflow that runs `npm run check`, `npm run lint`, and `npm run build` on pull requests and pushes.
2. Confirm the workflow uses the project’s expected Node and install steps.

Definition of done:

- GitHub Actions runs `check`, `lint`, and `build` on pushes or pull requests
- the workflow is committed in `.github/workflows/`
- a failing quality gate produces a failing CI run

Refinement outputs:

- **Purpose:** Automatically run tests, formatting checks, and Svelte diagnostics in the cloud on every pull request or push to prevent regressions and keep main branches stable.
- **Included behavior:**
  - Create a `.github/workflows/verify.yml` workflow file.
  - Triggers on pushes and pull requests to the `main` branch.
  - Uses standard Node setup and cached `node_modules` for speed.
  - Executes `npm run check`, `npm run lint`, and `npm run test` in sequence.
- **Excluded behavior:**
  - Automated deployment steps or CD pipelines.
  - Multi-node version matrix testing (testing on the project Node version is enough).
- **Ambiguities:** None.
- **Success:**
  - Merging code with a broken test or type warning triggers a failing status check in GitHub.
  - Clean pushes trigger a green passing check.

### Improve accessibility and mobile review of menus, dialogs, and sheet sections

ID:

- `p1-020`

Size:

- medium-to-large; scope to one surface before implementation if possible

Scope:

- review the MVP flow for mobile usability and obvious accessibility gaps
- prioritize menus, dialogs, and sheet-section interaction surfaces

Suggested implementation slices:

1. Review and fix nav/menu behavior on phone-sized screens.
2. Review and fix dialog accessibility and keyboard behavior.
3. Review and fix sheet-section readability and interaction on mobile.
4. Update the UI checklist to reflect any new review expectations.
5. Re-check mobile sheet interaction after any sheet-performance follow-up lands; use the profiling guidance in [docs/verification.md](verification.md) for performance diagnosis and keep structural grid replacement in `p1-027`.

Definition of done:

- critical menus and dialogs remain usable on phone-sized screens
- obvious focus, keyboard, or labeling issues in the main MVP flow are corrected
- the review is reflected in the theme or UI checklist where useful

Refinement outputs:

- **Purpose:** Ensure the D&D character sheet is fully accessible and comfortable to use on mobile phones at active game tables.
- **Included behavior:**
  - Scaffold and run Storybook accessibility checks (`addon-a11y`) for MenuButton and Dialog components to drive accessibility fixes.
  - Audit all sheet interactive nodes to ensure touch targets meet the 44x44px minimum standard.
  - Maintain correct keyboard navigation order across grid layouts.
  - Verify native `<dialog>` modals correctly trap and release focus.
  - Add descriptive aria-labels to all icon-only buttons.
  - Document review guidelines in `docs/theme-visual-checklist.md`.
- **Excluded behavior:**
  - Major sheet section restructuring or changing colors/themes.
- **Ambiguities:** None.
- **Success:**
  - Dialog focus trap operates correctly (focus stays inside the modal until dismissed).
  - Screen reader navigation reads all action buttons logically.
  - Touch interaction feels fluid and behaves correctly on phone screens.

### Replace custom grid auto-measurement with native CSS Container Queries

ID:

- `p1-027`

Size:

- large; research spike after Svelte route extraction settles

Scope:

- replace javascript-driven `GridContainerAuto.svelte` measurements with native CSS Grid container query selectors (`@container`)
- configure card components as container contexts (`container-type: inline-size`)
- preserve the visual layout rules for intermediate split-screen widths
- delete `GridContainerAuto.svelte` and its associated ResizeObservers entirely

Baseline evidence (2026-07-17):

- The new headless Chromium scroll-frame probe met the 55 FPS average threshold while 36.7% of intervals landed just above 16.7 ms. The probe now reports that VSync-budget rate diagnostically and gates on dropped-frame intervals above 33.3 ms, which is the stable missed-frame signal. A diagnostic Firefox run also passed (57.1 FPS, 3.3% dropped frames), so headless automation does not reproduce the subjective Firefox jank; retain headed Firefox Profiler traces for that investigation. Re-run the probe after this structural replacement and compare the full statistics before changing its threshold.

Refinement outputs:

- **Purpose:** Eliminate JS ResizeObserver rendering overhead entirely by utilizing modern native CSS Container Queries to handle layout column adjustments based on card width.
- **Included behavior:**
  - Add GridCard stories to Storybook to prove the new Container Queries work in isolation before replacing the active grid.
  - Refactor layout elements to declare inline-size container contexts.
  - Implement CSS `@container` rules on child grid configurations to toggle column layouts natively.
  - Remove all ResizeObservers and the custom measurement Svelte component.
- **Excluded behavior:**
  - Modifying visual design tokens or card margins.
- **Ambiguities:** None.
- **Success:**
  - `GridContainerAuto.svelte` is deleted.
  - The character sheet resizes fluidly with zero Javascript-driven layout recalculations.

## Ideation Sandbox (Raw / Rough Ideas)

This content is a work in progress to dump rough thoughts, brainstorms, and refactor wishes before prioritizing or organizing them.

### Roughly Prioritized and Vaguely Refined

- **[Priority 3] evaluate a Svelte-compatible form library such as TanStack Form or Felte after the first field-binding proof surface lands; prefer reuse for draft state, validation display, dirty tracking, and array editor ergonomics if it keeps local source smaller than custom form infrastructure**
  - _Best Guess_: Evaluate if an external library handles card-wide value validation, dirty checking, and array/nested list mutations more concisely and safely than our custom `FieldDraft` implementation.
  - _Critical Question_: Will introducing a third-party form helper conflict with our "platform-native first" preference or cause unnecessary bundle size increases, given we only have local-first state storage?
- **[Priority 4] re-org the ux: consider meta & quickref being sticky, then tabulate 3 pillars: adventure, combat, roleplay? combat could have sticky header for summary**
  - _Best Guess_: Redesign the character sheet UI. The character name/level (meta) and active reference panel stay pinned (sticky) to the screen, while the rest of the layout is nested in three tabs: Adventure (stats/skills), Combat (actions/spells/inventory), and Roleplay (bio/notes).
  - _Critical Question_: Does this imply removing the grid scroll layout entirely for mobile/desktop, or do tabs just act as filters on top of the grids? How will users react to tapping between views during fast-paced table encounters?
  - _Best Guess on drawer_: Implementing a drawer panel would act as a modal-like quick-reference slide-out for details instead of full-screen overlays, maximizing viewport utility.

### Raw Human Ideation, Unsorted

- Consider rebasing the schemas before we actually cut a live playtest (i.e reset the schema to v1 or v0, prune old unused schema versions)
- Consider an in-app side panel to help host the character's system-relevant SRD pdf for player convenience.
  - Consider that srd ref links could autonav in the side panel instead of a new tab.

## Done Recently

- `2026-07-19` completed `p1-005`: advanced 5e characters to `dnd5e-2014.v3`, added persisted item-source links for independently editable runtime-action snapshots, and delivered equipped-item suggestions, explicit resync, source navigation, deletion fallback, Storybook states, and end-to-end coverage while retaining `p1-061` for spell and feature sources
- `2026-07-19` completed `p1-012`: added a local SvelteKit Storybook catalog with typed BaseButton, Heading, and ValidatedInputField stories; isolated browser-backed interaction and automated accessibility checks now run through the Storybook Vitest project
- `2026-07-18` completed `p1-050`: refactored the repo structure, created dedicated directories for $components, $storage, and $utils, configured Vite aliases, extracted data files into $fixtures, and updated imports to improve codebase maintainability
- `2026-07-18` completed `p1-060`: introduced `dnd5e-2014.v2` character hydration/serialization, migrated supported action aliases, tagged currency, titled roleplay fields, split proficiency provenance, and movement strings into one canonical model, rewired storage/import/export and 5e sheet code, and retained cross-system core flexibility with migration, round-trip, and browser smoke coverage
- `2026-07-18` completed `p1-055`: replaced virtual 5e patch-domain dispatch with a schema-backed decoder and exhaustive typed intent reducer, preserving atomic edits, stable identities, direct primitive RFC 6902 editing, and current browser behavior
- `2026-07-18` completed `p1-045`: extracted 5e metadata, grouped sheet projections, and virtual-path compatibility patch translation into tested feature-local modules; the route now focuses on reactive selection, layout, and save dispatch, with Chromium smoke coverage preserving current behavior
