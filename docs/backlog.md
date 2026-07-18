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

1. `p1-005`: Link runtime actions to source weapons, spells, and features (builds on the completed canonical action model from `p1-060`)
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

### Link runtime actions to source weapons, spells, and features

ID:

- `p1-005`

Size:

- medium; scope after the MVP sheet is stable

Scope:

- keep the current action-economy runtime summary fully user-driven
- make it possible for runtime action rows to optionally reference source records from inventory, spells, or features
- avoid hard-coupling actions to a single source because table actions can be custom, combined, conditional, supportive, or improvised

Suggested implementation slices:

1. Define a lightweight source reference shape for runtime actions, such as inventory item, spell, feature, or custom.
2. Add UI affordances to show whether an action is custom or linked to a source record.
3. Consider source-based action suggestions without overwriting user-edited runtime summaries.

Definition of done:

- runtime actions can remain fully manual
- an action can optionally point back to the item, spell, or feature it summarizes
- source links improve navigation or editing without making the runtime action list redundant or fragile

Refinement outputs:

TODO - revisit this before proposing! Read the designs up to this point and tell the user whether `runtimeAction` includes bonus actions, reactions, etc. or _just_ actions. If _just actions_ then inform the user where runtimeBonusActions or similar may end up as part of this. PROMPT THE USER TO AGREE on whether the findings and result jive with expectations.

- **Purpose:** Allow player actions in the sheet's runtime list to link to inventory items, active spells, or class features. This enables automatic sync/reset choices and links to reference cards, reducing manual copying mistakes and streamlining table play.
- **Included behavior:**
  - Add optional `sourceId` and `sourceType` (e.g. `'inventory'`, `'spell'`, `'feature'`) properties to the D&D 5e `runtimeAction` schema.
  - Display a visual indicator (like a small external-link icon) on linked action rows that navigates to the source record card.
  - Support one-way bubbling of values: source changes automatically update action values unless overridden.
  - Support "override" fields on the runtime action row: user edits are stored as overrides that take precedence over the source value, rendering a visual "Customized" reminder indicator.
  - Support multiple runtime actions pointing to the same source ID (e.g., standard attack, two-handed attack variant, special reaction spell trigger).
  - Allow users to toggle visibility/hide source-driven actions to avoid layout clutter.
  - Provide a "suggested actions" list derived from equipped weapons, active spells, or actions-granting features.
  - Allow users to manually sync/reset text and damage fields from the source item/spell.
- **Excluded behavior:**
  - Automating mechanics checking, dice rolls, or calculations based on the source link.
  - Restricting editing: users must always be able to manually override linked values.
- **Ambiguities:**
  - _Data deletion fallback_: If a source weapon is deleted, what happens to the action? (It should turn into a "custom" action instead of deleting the action row).
- **Success:**
  - Schema supports action source references.
  - A user equips a weapon and sees it as a suggested action.
  - Clicking the link navigates to the item details, and syncing restores standard item stats.

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
  - Refactor layout elements to declare inline-size container contexts.
  - Implement CSS `@container` rules on child grid configurations to toggle column layouts natively.
  - Remove all ResizeObservers and the custom measurement Svelte component.
- **Excluded behavior:**
  - Modifying visual design tokens or card margins.
- **Ambiguities:** None.
- **Success:**
  - `GridContainerAuto.svelte` is deleted.
  - The character sheet resizes fluidly with zero Javascript-driven layout recalculations.


## Ideation Sandbox (Unsorted Ideas)

This content is a work in progress to dump rough thoughts, brainstorms, and refactor wishes before prioritizing or organizing them.

- **[Priority 1] re-organize lib a bit better, consider a ui lib vs. utility lib**
  - _Best Guess_: We want to group items under `src/lib/` logically—separating pure styling/UI primitives (like BaseButton, Heading, Table) from composite layout patterns (like GridContainer) and pure JS helper utilities (like theme, storage).
  - _Critical Question_: Should this be done purely as directories under `src/lib/` (e.g. `src/lib/ui/` vs `src/lib/utils/`), or do we want to configure new path aliases in `svelte.config.js`/`vite.config.ts` (like `$ui/*`) to enforce boundaries?
- **[Priority 2] integrate Storybook for isolated visual development and playtesting of Svelte 5 components**
  - _Best Guess_: Storybook will host isolated stories for visual atoms (e.g. `BaseButton`, `Heading`) and composite cells (`GridPrimitiveField`, `MenuButton`), letting humans and agents test styles, reactivity, states, and accessibility interactively without loading the full 5e page context.
  - _Critical Question_: What is the simplest Svelte 5 + Vite Storybook setup we can introduce without cluttering the package dependencies, and does it validate successfully inside the restricted container environment?
- **[Priority 3] evaluate a Svelte-compatible form library such as TanStack Form or Felte after the first field-binding proof surface lands; prefer reuse for draft state, validation display, dirty tracking, and array editor ergonomics if it keeps local source smaller than custom form infrastructure**
  - _Best Guess_: Evaluate if an external library handles card-wide value validation, dirty checking, and array/nested list mutations more concisely and safely than our custom `FieldDraft` implementation.
  - _Critical Question_: Will introducing a third-party form helper conflict with our "platform-native first" preference or cause unnecessary bundle size increases, given we only have local-first state storage?
- **[Priority 4] re-org the ux: consider meta & quickref being sticky, then tabulate 3 pillars: adventure, combat, roleplay? combat could have sticky header for summary**
  - _Best Guess_: Redesign the character sheet UI. The character name/level (meta) and active reference panel stay pinned (sticky) to the screen, while the rest of the layout is nested in three tabs: Adventure (stats/skills), Combat (actions/spells/inventory), and Roleplay (bio/notes).
  - _Critical Question_: Does this imply removing the grid scroll layout entirely for mobile/desktop, or do tabs just act as filters on top of the grids? How will users react to tapping between views during fast-paced table encounters?
  - _Best Guess on drawer_: Implementing a drawer panel would act as a modal-like quick-reference slide-out for details instead of full-screen overlays, maximizing viewport utility.

## Done Recently

- split the docs between the active MVP working set and long-term vision docs
- established [AGENTS.md](../AGENTS.md) as the shortest AI-facing entry point
- completed the `Add real character management` backlog item
- completed the [src/lib/](../src/lib/) grid cleanup backlog
- completed `p0-010`: the 5e sheet now exposes the major MVP runtime and organizational sections, including seeded runtime action data, with check/lint/build passing
- completed the focused `p0-040` scroll-performance pass: reduced hidden dialog DOM, simplified hover/paint costs, removed broad `GridContainerAuto` mutation observation, and moved residual jank follow-up to `p1-025`
- completed `p1-015`: added a fast Chromium Playwright smoke suite covering seeded character navigation, responsive section collapse, Current HP editing, annotations, and JSON backup/restore; Firefox also passes, with testing strategy and execution boundaries documented
- completed `p1-026`: routine Playwright flows now fail on browser console errors and ResizeObserver loop warnings; on-demand scroll-frame profiling and a Firefox Profiler/paint-debug workflow establish repeatable performance baselines and escalation guidance
- completed `p1-025` diagnostic: a headed Firefox recording showed negligible synchronous reflow and scroll-handler time, so the cached-width/ResizeObserver trial was reverted; repeatable performance checks are deferred to `p1-026` after Playwright E2E, while `p1-027` owns the future native grid-model replacement
- completed `p0-020`: JSON backup/restore supports a versioned export envelope, file download, import file selection, import validation, replace-all import, and merge-new import that skips duplicate character IDs
- completed home action button polish: shared button chrome now aligns Create, Import, Export, and import apply actions consistently
- completed `p0-030`: local automated verification now includes Vitest tooling, schema/import-export/storage contract tests, a create/edit/reload smoke path, V8 coverage reporting, shared browser test scaffolding, and [docs/verification.md](verification.md)
- completed `p1-040`: field-level binding now uses an RFC 6902 JSON Patch contract, `immutable-json-patch` verification, split value/annotation patch projection, `FieldDraft`, a Current HP runtime proof surface, and documented field/page/store responsibility boundaries
- completed the behavioral `p1-030` field interaction pass: runtime/state primitives have persistent direct edit controls, field annotations are accessible through explicit Notes affordances, card-wide Edit remains a value/structure fallback, and card Notes dialogs now handle annotation review/add/edit flows
- completed `p1-035`: surfaced runtime/state primitive fields now render through descriptor-driven `GridContent` cards and the shared primitive renderer, the route no longer composes adjacent standalone `InlineFieldDraft` blocks beside migrated cards, card-wide Edit remains comprehensive for value/structure fallback, and Notes remains the annotation review/add/edit surface
- completed `p1-022`: added Svelte 5 agent tooling and audited the current app, migrating legacy Svelte 4 structures to Svelte 5 runes (`$props()`, `$state()`, `$derived()`) and native event properties (e.g., `onclick` instead of `on:click`) to ensure compiler-clean build and lint checks
- completed `p1-024`: drafted a new Architecture Decision Record (ADR) on modern platform primitives, audited custom UI overlays, and refactored `MenuButton.svelte` to use the native HTML Popover API and scoped CSS Anchor Positioning, eliminating custom JS focus/click-away event management
- completed `p1-045`: extracted 5e metadata, grouped sheet projections, and virtual-path compatibility patch translation into tested feature-local modules; the route now focuses on reactive selection, layout, and save dispatch, with Chromium smoke coverage preserving current behavior
- completed `p1-055`: replaced virtual 5e patch-domain dispatch with a schema-backed decoder and exhaustive typed intent reducer, preserving atomic edits, stable identities, direct primitive RFC 6902 editing, and current browser behavior
- completed `p1-060`: introduced `dnd5e-2014.v2` character hydration/serialization, migrated supported action aliases, tagged currency, titled roleplay fields, split proficiency provenance, and movement strings into one canonical model, rewired storage/import/export and 5e sheet code, and retained cross-system core flexibility with migration, round-trip, and browser smoke coverage
- completed `p1-050`: refactored the repo structure, created dedicated directories for $components, $storage, and $utils, configured Vite aliases, extracted data files into $fixtures, and updated imports to improve codebase maintainability
