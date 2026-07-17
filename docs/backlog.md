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

Next recommended target: tackle `p1-015`, then `p1-045`, then `p1-026` after Playwright E2E is available.

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

### Standardize lightweight browser interaction testing

ID:

- `p1-015`

Size:

- medium; address before major route or feature changes

Scope:

- define a standard, lightweight framework for browser interaction testing using Playwright E2E
- configure Playwright to run on Chromium by default for maximum execution speed, while allowing multi-browser verification (Chromium, Firefox, WebKit) when needed
- draft an Architecture Decision Record (ADR) documenting near-term (Playwright E2E smoke tests) vs. mid-term (Storybook playtesting) vs. deferred long-term (Svelte Testing Library component tests) testing strategies
- limit execution time and prevent agents from generating slow, unbounded NodeJS-based browser automation wrappers

Suggested implementation slices:

1. Draft a lightweight ADR under `docs/decisions/` defining the near-term, mid-term, and deferred long-term testing strategies (E2E vs. Storybook vs. unit testing).
2. Install and configure Playwright E2E in the repository, default-configured to run Chromium for speed (`npm run test:e2e`), with support for full multi-browser test runs (`npm run test:e2e:all`).
3. Create a single canonical Playwright smoke test file that runs fast, verifying:
   - Page navigation, viewport resizing (mobile vs. desktop layout verification), and collapsing/expanding character sheet grid sections.
   - Core value edits (e.g., Current HP card changes) and adding/editing field annotations (including inserting a D&D Beyond web link and verifying a local SRD reference document link).
   - Exporting local characters to JSON, downloading the file, and re-importing it to ensure data round-tripping works seamlessly.
4. Update `docs/verification.md` and `AGENTS.md` to reference the E2E suite, enforce execution limits (e.g. under 5s local runtime), and restrict agents from writing custom Node-based automation wrappers.

Definition of done:

- Playwright E2E is configured with scripts in `package.json` (`npm run test:e2e` for Chromium, `npm run test:e2e:all` for all browsers)
- the local E2E smoke test runs in less than 5 seconds in Chromium
- the testing strategy ADR is committed under `docs/decisions/`
- verification instructions are updated in `docs/verification.md` and agent guidelines are synced in `AGENTS.md`
- all check, lint, and build stages pass cleanly

Refinement outputs:

- **Purpose:** Prevent coding agents from writing ad-hoc, slow, or unbounded NodeJS browser testing scripts by establishing a fast, lightweight Playwright E2E smoke suite and documenting our long-term testing roadmap in an ADR.
- **Included behavior:**
  - Configure Playwright E2E for component/page-level interaction testing.
  - Set Chromium as the default browser for fast local verification (`npm run test:e2e`).
  - Provide script triggers to verify against other engines like Firefox and WebKit (`npm run test:e2e:all`).
  - Configure tests to run against a pre-started dev server (`http://localhost:5173`) to keep test startups sub-second. Agents have authority to spin up background servers or prompt users if offline.
  - Programmatically seed mock fixtures directly into `localStorage` before page load to speed up sheet interaction tests and bypass manual creation clicks.
  - Write a template test suite verifying: loading, viewports (mobile vs. desktop), collapsing/expanding grid sections, editing HP values, adding/updating notes annotations (verifying D&D Beyond web links and local SRD references), and exporting & re-importing JSON backups.
  - Write a testing strategy ADR mapping near-term (Playwright), mid-term (Storybook), and deferred long-term (Svelte Testing Library unit tests).
- **Excluded behavior:**
  - Writing extensive unit testing suites for Svelte components before the planned refactoring settles.
  - Adding visual screenshot snapshot comparisons or heavy Docker dependencies.
- **Ambiguities:**
  - _Testing Harness_: Playwright is selected for initial UI testing because Svelte Testing Library lacks layout engines to verify mobile viewport responsive behaviors, CSS anchoring, and native popovers. Svelte Testing Library unit testing is deferred until component structures stabilize.
  - _Server Lifecycle & Seeding_: Reconciled. Playwright runs against the pre-started developer server, and tests seed `localStorage` directly rather than executing UI character creation flows.
- **Success:**
  - `npm run test:e2e` executes and validates the template test in under 5 seconds.
  - The testing strategy ADR is documented under `docs/decisions/`.

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
5. Re-check mobile sheet interaction after any sheet-performance follow-up lands, but keep performance diagnosis and fixes in `p1-025`.

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

### Establish continuous UI performance regression checking

ID:

- `p1-026`

Size:

- medium; explore after Playwright E2E lands

Scope:

- configure Playwright E2E tests to assert that no `ResizeObserver loop limit exceeded` warnings or console errors are printed during test flows
- explore tracing scroll performance metrics (CPU layout/paint times) in local headless test runs
- add standard profiling steps in `docs/verification.md` for manual frame-rate and layout-flash tracking

Refinement outputs:

- **Purpose:** Automatically detect scroll-jank and layout-loop regressions during UI updates by introducing performance assertions inside our E2E testing gates.
- **Included behavior:**
  - Track and assert on browser console warnings/errors related to ResizeObservers and layout performance in Playwright E2E tests.
  - Document manual profiling steps (Paint Flashing, Layer borders) under `docs/verification.md`.
- **Excluded behavior:**
  - Integrating heavyweight automated lighthouse gating or cloud device grids.
- **Ambiguities:** None.
- **Success:**
  - Automated E2E runs report console errors if layout loops are triggered.
  - Clear manual verification performance guidelines are available.

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

### Extract 5e sheet projection and patch logic from the route

ID:

- `p1-045`

Size:

- medium-to-large; implement after the field rendering/editing API is consolidated enough to avoid extracting the wrong route shape, and after `p1-022`/`p1-024` unless an urgent feature needs the extraction sooner

Scope:

- reduce the size and responsibility of [src/routes/charsheets/5e/+page.svelte](../src/routes/charsheets/5e/+page.svelte)
- move 5e-specific `GridContentData` projection builders out of the route
- move virtual path constants and patch normalization helpers into feature-local modules
- keep the route focused on selected-character lookup, layout composition, collapse state, and save dispatch
- do not define the inline-edit interaction model or shared field-binding contract; that belongs to `p1-030` and `p1-040`
- do not reorganize unrelated stores, fixtures, or schema folders; that belongs to `p1-050`
- preserve current behavior unless a slice explicitly supports an active feature item
- build on the completed consolidated field/card API instead of preserving route-local adjacent field editor composition
- coordinate with `p1-025` if profiling points at route/module update cost rather than paint-only scroll cost

Suggested implementation slices:

1. Before or alongside the extraction, propose a compact browser-smoke suite that protects user-facing behavior: open a seeded character from home, edit and reload Current HP, enter/cancel/close Notes editing, and toggle a sheet region and the theme menu. Keep it black-box, using accessible roles/labels and visible behavior rather than component internals, CSS classes, or snapshots.
2. Extract static 5e sheet metadata and options: ability metadata, skill metadata, spell slot metadata, runtime action options, inventory tags, and roleplay note metadata.
3. Extract pure projection builders for current sheet surfaces: overview, quick reference, abilities/proficiencies/features/traits, runtime actions, spells, inventory, and organizational notes.
4. Extract patch normalization helpers for virtual paths: runtime actions, spell levels, proficiency languages, class features, inventory groups/currency, and organizational notes.
5. Add focused tests around projection and patch helpers once `p0-030` test tooling exists.
6. Leave [+page.svelte](../src/routes/charsheets/5e/+page.svelte) as mostly layout/orchestration and verify no user-visible behavior changed.

Definition of done:

- [+page.svelte](../src/routes/charsheets/5e/+page.svelte) no longer owns most 5e-specific projection or patch normalization logic
- virtual path handling has a clearer feature-local home
- extracted helpers are easier to test and reuse
- existing sheet editing behavior remains unchanged
- browser-smoke coverage protects the representative edit, annotation, and UI-state workflows during route-level refactoring
- relevant local verification from [docs/verification.md](verification.md) passes

Svelte 5 audit finding (2026-07-16):

- The Svelte 5 route is compiler-clean, but its current single-file shape still owns static metadata, projection builders, virtual path constants, and patch normalization in addition to layout orchestration. This is an ownership/readability concern for the planned extraction, not a reason to make an unrelated rune migration.
- Storybook remains deferred and should not be a prerequisite for this browser-smoke coverage: browser flows validate application behavior, while Storybook can later provide isolated component and visual review.

Refinement outputs:

- **Purpose:** Clean up the bloated route file [+page.svelte](../src/routes/charsheets/5e/+page.svelte) by separating data projections and JSON patch logic from visual layout orchestration. This makes route edits less error-prone and allows testing raw calculations in isolation.
- **Included behavior:**
  - Extract static 5e metadata and dropdown arrays to a local helper file.
  - Move HP, spell slots, and action patch builders to pure helper functions.
  - Introduce a browser smoke test suite to guarantee zero layout or behavioral regression during refactoring.
- **Excluded behavior:**
  - Restructuring the component structure in `src/lib/`.
  - Rewriting character loading or persistence stores.
- **Ambiguities:**
  - _Location_: Should helpers live in the route folder? (Yes, under `src/routes/charsheets/5e/` since they are highly coupled to the page composition details).
  - _SvelteKit Page Loaders_: Reconciled. Keep reactive Svelte store subscriptions (like `$charsArray`) inside the `+page.svelte` component script. This ensures character updates propagate dynamically. Only extract static metadata constants and pure, non-reactive JSON patch/projection calculation functions.
- **Success:**
  - Route file size decreases significantly and focuses purely on layout composition.
  - Pure helper modules are fully covered by Vitest tests.
  - The browser smoke test suite passes cleanly.

### Refactor the repo structure so stores, fixtures, schema, and 5e feature code are less entangled

ID:

- `p1-050`

Size:

- oversized and risky; only tackle in slices or alongside an active feature item

Scope:

- reduce coupling between stores, fixtures, schema modules, and 5e page-specific logic
- keep this item focused on module ownership and navigability, not as a substitute for the field-binding/patch abstraction work
- do not duplicate `p1-045`; route-level 5e projection and patch extraction should happen there first
- improve navigability without changing behavior unnecessarily
- review duplicated or provenance-bound schema storage that currently forces awkward feature-layer glue

Dependency notes:

- This item is a cleanup/supporting refactor, not the primary dependency for inline field editing.
- Prefer landing the first usable field-binding/patch abstraction before using this item to reorganize where those modules live.
- Prefer landing `p1-045` before moving or reorganizing 5e feature modules more broadly.

Svelte 5 audit finding (2026-07-16):

- `$charsArray` store subscriptions remain compatible with the audited Svelte 5 components and need no rune-class migration for correctness. `src/data.ts` still combines seed data, store wiring, and persistence, so separating those ownership concerns remains the appropriate scope for this item rather than a syntax-cleanup follow-up.

Suggested implementation slices:

1. Move seed/demo data into an explicit fixtures module.
2. Move storage logic into its own module.
3. Integrate the feature-local modules created by `p1-045` into the broader folder structure if their final location needs adjustment.
4. Reorganize folders only after behavior-critical extractions are complete.
5. Review duplicated 5e schema storage such as proficiencies/languages split across multiple origins, and document or refactor where cross-origin player-earned data should live.
6. Review inventory storage compared to excalidraw visuals then follow up on schema vs. page implementations. Ensure there is a dedicated space for coinage vs. weapons vs. armor vs. other. And ensure that weapons vs. armor can house proficiency vs. damage type details as applicable.
7. Follow up on inventory visuals to more closely match the excalidraw visuals after the schema gets properly updated.

Definition of done:

- runtime stores, fixtures, schema, and feature code have clearer ownership boundaries
- high-churn feature work no longer depends on a catch-all module for unrelated concerns
- the resulting structure is easier to navigate for both humans and coding agents
- behavior remains unchanged except where the refactor explicitly supports an active backlog item

Refinement outputs:

- **Purpose:** Clean up imports and package layouts by separating seed data, storage loading, and schema definitions from our runtime state variables. This ensures clean boundaries and speeds up codebase navigation for developers and agents.
- **Included behavior:**
  - Extract mock/seed data into `src/fixtures/`.
  - Move Svelte components into a dedicated visual folder: `src/lib/components/`.
  - Move localStorage and state persistence helpers into `src/lib/storage/`.
  - Move pure JS helper utilities (formatters, URL parsers) into `src/lib/utils/`.
  - Review and clean up circular imports and proficiency schema redundancies.
- **Excluded behavior:**
  - Modifying the core player/character JSON schema layout itself.
- **Ambiguities:**
  - _Folder Reorganization_: Reconciled. Separate non-visual storage/utilities from UI files by using a clean single-level subdirectory model (`src/lib/components/` for visual atoms, `src/lib/storage/` for loaders, `src/lib/utils/` for helpers, and `src/fixtures/` for mocks), preventing flat-folder clutter.
- **Success:**
  - Circular dependency checks report zero errors.
  - All existing storage contract tests continue to pass.

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
- completed `p1-025` diagnostic: a headed Firefox recording showed negligible synchronous reflow and scroll-handler time, so the cached-width/ResizeObserver trial was reverted; repeatable performance checks are deferred to `p1-026` after Playwright E2E, while `p1-027` owns the future native grid-model replacement
- completed `p0-020`: JSON backup/restore supports a versioned export envelope, file download, import file selection, import validation, replace-all import, and merge-new import that skips duplicate character IDs
- completed home action button polish: shared button chrome now aligns Create, Import, Export, and import apply actions consistently
- completed `p0-030`: local automated verification now includes Vitest tooling, schema/import-export/storage contract tests, a create/edit/reload smoke path, V8 coverage reporting, shared browser test scaffolding, and [docs/verification.md](verification.md)
- completed `p1-040`: field-level binding now uses an RFC 6902 JSON Patch contract, `immutable-json-patch` verification, split value/annotation patch projection, `FieldDraft`, a Current HP runtime proof surface, and documented field/page/store responsibility boundaries
- completed the behavioral `p1-030` field interaction pass: runtime/state primitives have persistent direct edit controls, field annotations are accessible through explicit Notes affordances, card-wide Edit remains a value/structure fallback, and card Notes dialogs now handle annotation review/add/edit flows
- completed `p1-035`: surfaced runtime/state primitive fields now render through descriptor-driven `GridContent` cards and the shared primitive renderer, the route no longer composes adjacent standalone `InlineFieldDraft` blocks beside migrated cards, card-wide Edit remains comprehensive for value/structure fallback, and Notes remains the annotation review/add/edit surface
- completed `p1-022`: added Svelte 5 agent tooling and audited the current app, migrating legacy Svelte 4 structures to Svelte 5 runes (`$props()`, `$state()`, `$derived()`) and native event properties (e.g., `onclick` instead of `on:click`) to ensure compiler-clean build and lint checks
- completed `p1-024`: drafted a new Architecture Decision Record (ADR) on modern platform primitives, audited custom UI overlays, and refactored `MenuButton.svelte` to use the native HTML Popover API and scoped CSS Anchor Positioning, eliminating custom JS focus/click-away event management
