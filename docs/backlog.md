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
4. **Triaging to the Backlog**: Assign the refined item a durable priority-neutral ID (e.g., `BL-065`), create its detailed definition once in the refined backlog catalog, and add a link to that definition in the appropriate P0/P1/P2 queue.
5. **Recommending an Execution Path**: End every exploration or refinement with an explicit recommendation, using [the repository change-classification and ADR thresholds](../AGENTS.md#change-classification--adr-triggers): direct/ad hoc implementation, an ADR-only update, a compact OpenSpec change, or a full OpenSpec change. State separately whether an ADR is triggered, whether a durable spec delta is likely, and whether the coding or architectural scope benefits from OpenSpec's proposal, design, and task artifacts. Include a short rationale and identify any unresolved decision that blocks implementation. Human-authored and agent-assisted direct coding follow the same classification.
6. **Executing the Chosen Path**: Fast-track work may proceed directly without an OpenSpec change. ADR-only work may create or update the decision record directly. For compact or full OpenSpec classifications, run `/opsx-propose` (or trigger the `/opsx:propose` workflow) to generate the planning artifacts (`proposal.md`, `design.md`, `specs/`, and `tasks.md`) within the change workspace, adding an ADR when separately triggered. The refined backlog item forms the input template for the proposal.

### Backlog ID Rules

- Existing `p0-*`, `p1-*`, and `p2-*` IDs are grandfathered durable identifiers. Do not rename them merely because their priority changes.
- Assign new refined items the next unused priority-neutral `BL-NNN` identifier. Keep three zero-padded digits through `BL-999`; expand only when that capacity is actually exhausted.
- Treat the numeric suffix as identity, not ranking or execution order. Priority belongs in the P0/P1/P2 queue and the "Next recommended sequence."
- Before allocating an ID, scan current backlog entries and active or archived OpenSpec changes; consult Git history if the candidate may have been removed. Never reuse a completed, removed, or abandoned ID.
- Leave raw sandbox ideas unnumbered until they are refined and promoted. Do not create hierarchical variants such as `BL-065a`; implementation slices belong in OpenSpec tasks.
- Name the corresponding OpenSpec change `bl-NNN-short-slug`, preserving the backlog identity in lowercase kebab-case.

### Priority Classes

These are roadmap priorities, not permanent properties of an item:

- **P0 — Product prerequisite:** Work necessary to satisfy the current product goals and call the scoped product the product we intend to deliver. Active P0 work takes precedence over improvements and feature expansion.
- **P1 — Priority improvement:** High-value product, UX, developer-UX, reliability, or maintainability work that should generally be addressed before broadening the product with lower-priority features. The current product may remain usable without it.
- **P2 — Future feature work:** New or expanded product capability intentionally deferred until the relevant P0 prerequisites and selected P1 improvements are complete.

Priority may change as goals and evidence change. Reprioritize an item by moving only its ID link between the queues below; never rename its ID or cut and paste its detailed definition. Priority is also distinct from readiness: a blocked or trigger-deferred item may retain its strategic priority while being omitted from the next recommended sequence.

## Current Priority Queues

These lightweight queues record priority membership only. Detailed definitions live once in the [refined backlog catalog](#refined-backlog-catalog).

### P0 — Product Prerequisites

No active P0 items.

### P1 — Priority Improvements

- [`BL-067` — Schedule PRD v1 and active-goals refinement](#schedule-prd-v1-and-active-goals-refinement)
- [`BL-064` — Scale dense collection rendering and discovery](#scale-dense-collection-rendering-and-discovery)
- [`p1-027` — Replace custom grid auto-measurement with native CSS Container Queries](#replace-custom-grid-auto-measurement-with-native-css-container-queries)
- [`p1-020` — Improve accessibility and mobile review of menus, dialogs, and sheet sections](#improve-accessibility-and-mobile-review-of-menus-dialogs-and-sheet-sections)
- [`BL-063` — Move character import review and confirmation into a dialog](#move-character-import-review-and-confirmation-into-a-dialog)
- [`p1-010` — Add GitHub Actions for quality gates](#add-github-actions-for-quality-gates) _(trigger-deferred and omitted from the recommended sequence until CI needs justify it)_

### P2 — Future Feature Work

- [`BL-066` — Support official character sheet PDF import and export](#support-official-character-sheet-pdf-import-and-export)

## Next Recommended Sequence

_Goal: UX Polish & Playtest Prep_

1. `BL-067`: Define the first-playtest/v1 milestone and its durable compatibility promise
2. `BL-064`: Scale dense collection rendering and discovery
3. `p1-027`: Replace custom grid auto-measurement with native CSS Container Queries
4. `p1-020`: Improve accessibility and mobile review of menus, dialogs, and sheet sections
5. `BL-063`: Move character import review and confirmation into a dialog

## Refined Backlog Catalog

Each active refined item has one stable detailed definition in this catalog. Queue entries and the recommended sequence point here; reprioritization must not relocate or duplicate these definitions. When an item is completed and archived, remove its queue link and catalog definition, then retain only the bounded summary required by [Done Recently](#done-recently).

### Scale dense collection rendering and discovery

ID:

- `BL-064`

Sequencing context:

- Explore soon after the source-expansion slice because large weapon, gear, spell, and feature collections already make sheet cards unwieldy, and additional source types will increase that pressure.

Refinement outputs:

- **Purpose:** Keep large character collections readable and navigable without allowing a single inventory, spell, feature, or action list to dominate the sheet.
- **Included behavior:**
  - Audit representative large weapon, gear, spell, feature, and runtime-action collections before choosing one proof surface.
  - Evaluate responsive bounded presentation, local scrolling, search, lightweight filtering, result counts, and explicit empty/no-match states.
  - Preserve complete keyboard, touch, and screen-reader access to every item; bounded presentation must not make content undiscoverable.
  - Search primary labels plus useful authored details where that behavior is predictable for the selected collection.
  - Use realistic cluttered Storybook fixtures and main-flow browser coverage to test large collections on desktop and phone-sized viewports.
  - Reuse the inventory picker’s filtering concepts only where a second concrete collection demonstrates the same contract; do not force collection rendering through the source-picker API.
  - Coordinate with `p1-020` on nested scrolling and mobile accessibility, and with the collection-row interaction sandbox idea on row controls.
- **Excluded behavior:**
  - Changing collection-row edit or annotation affordances.
  - Remote search, fuzzy ranking, indexing, virtualization, or a universal list framework without measured need.
  - Applying one arbitrary fixed height to every collection regardless of density or viewport.
- **Ambiguities:**
  - Which collection should prove the pattern first: weapons/gear, spell lists, or another demonstrably dense surface?
  - On phone-sized screens, should large collections use contained scrolling, progressive disclosure, or an expanded focused view to avoid awkward nested scrolling?
  - Which filters beyond text search are genuinely useful for each concrete collection?
- **Success:**
  - A character with realistically large collections remains easy to scan and navigate without excessive page growth.
  - Every item remains reachable by keyboard, touch, and assistive technology.
  - Search and filtering behavior is deterministic, responsive, and scoped to proven collection needs.
  - Any reusable boundary is extracted from at least two compatible consumers rather than anticipated similarity.

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
  - Implement explicit between-step focus restoration for multi-step dialogs to improve keyboard and screen-reader orientation (e.g., focusing the heading or first field).
  - Evaluate whether modal interactions should lock document scrolling or contain touch overscroll; preserve background scrolling only when it does not move the user’s sheet context unexpectedly.
  - Add descriptive aria-labels to all icon-only buttons.
  - Document review guidelines in `docs/theme-visual-checklist.md`.
- **Excluded behavior:**
  - Major sheet section restructuring or changing colors/themes.
- **Ambiguities:** None.
- **Success:**
  - Dialog focus trap operates correctly (focus stays inside the modal until dismissed).
  - Opening, interacting with, and closing a dialog does not unexpectedly change the user’s background sheet position; the chosen scroll behavior is documented and consistent.
  - Screen reader navigation reads all action buttons logically.
  - Touch interaction feels fluid and behaves correctly on phone screens.

### Move character import review and confirmation into a dialog

ID:

- `BL-063`

Sequencing context:

- Follow the higher-impact sheet and collection work; the current inline import flow is functional, but its validation messages and destructive replace action add visual clutter to the home page and now have a proven dialog-shell pattern to build on.

Refinement outputs:

- **Purpose:** Give character import a focused, accessible review and confirmation workflow instead of rendering transient file status and apply controls directly in the home-page toolbar.
- **Included behavior:**
  - Open a focused import workflow from the existing "Import Characters" command and keep file selection, validation feedback, file summary, and apply choices within that workflow.
  - Reuse the native dialog shell and focused form/status patterns where their current APIs fit; extend them only for concrete import needs.
  - Preserve the existing validated export-envelope boundary and the current Merge New and Replace All semantics.
  - Clearly distinguish invalid JSON, unsupported or invalid export data, ready-to-import state, and successful completion.
  - Explain duplicate skipping for Merge New and the destructive effect of Replace All before either action is applied.
  - Canceling or dismissing the workflow must leave local character data unchanged and restore focus to the import trigger.
  - Retain browser coverage for invalid input, merge, replace, cancellation, and persisted results.
- **Excluded behavior:**
  - Changing the backup format, schema migration policy, merge identity rules, or export workflow.
  - Adding drag-and-drop, multi-file import, cloud storage, or a generic file-workflow framework.
- **Ambiguities:**
  - Should the dialog open before file selection, or should the system file picker open first and the review dialog appear only after a file is chosen?
  - After a successful import, should confirmation remain in the dialog or close it and use a concise page-level status?
- **Success:**
  - Import validation and apply controls no longer expand the home-page toolbar.
  - A user can select, validate, review, merge, replace, or cancel without accidental mutation.
  - Replace All receives appropriately prominent confirmation and both apply modes retain their existing tested data behavior.

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

  - The character sheet resizes fluidly with zero Javascript-driven layout recalculations.

### Support official character sheet PDF import and export

ID:

- `BL-066`

Sequencing context:

- Defer until the core local 5e playtest flow is stable.

Refinement outputs:

- **Purpose:** Allow users to easily import and export their characters using the official D&D 5e character sheet PDF format, making the transition to and from table play seamless.
- **Included behavior:**
  - Parse data from a standard official 5e PDF into the local character schema.
  - Export a local character to a fillable official 5e PDF.
- **Excluded behavior:**
  - Supporting homebrew or third-party PDF layouts.
- **Ambiguities:**
  - Which specific official PDF version should be the canonical target?
  - Should PDF export support overflowing text with continuation sheets?
- **Success:**
  - A user can upload an official PDF and instantly have a playable local character.
  - A user can export their character to a PDF and print it for a physical game.

### Schedule PRD v1 and active-goals refinement

ID:

- `BL-067`

Sequencing context:

- Execute next, before the first real external playtest. The completed v0 baseline deliberately postpones durable compatibility, so the playtest/v1 starting line must be explicit before outside users depend on it.

Refinement outputs:

- **Purpose:** Transition from an MVP development phase into a defined v1.0 release by establishing clear product requirements, documentation, and success criteria.
- **Included behavior:**
  - Audit the completed MVP features against current user expectations.
  - Draft and finalize a PRD v1 detailing supported platforms, playtest goals, and finalized functional scope.
  - Update `docs/active-goals.md` to memorialize exiting pre-release and cutting v1 only after successful one-shot playtests across at least 3 distinct systems (e.g., 5e 2014, 5e 2024, and one non-5e system like Shadowdark).
  - Explicitly document that there will be no migration support from `v0` to `v1`.
- **Excluded behavior:**
  - Adding new feature implementation tasks as part of this planning item.
  - Supporting a migration path for any pre-v1 experimental character data.
- **Ambiguities:** None.
- **Success:**
  - A formal PRD v1 artifact is created.
  - `docs/active-goals.md` is updated with clear v1 release criteria and the 3-system playtest threshold.
  - The absence of a v0-to-v1 migration is clearly communicated.

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

- Revisit the complete atomic-design hierarchy when page-level reuse becomes concrete.
  - _Why_: The repository currently has evidence for atoms, molecules, and emerging organisms, but not enough repeated route-level composition to define templates and Pages without speculative taxonomy or file churn.
  - _Current direction_: Treat the existing three levels as staged adoption, not rejection of templates and Pages. Do not prioritize a repository-wide audit ahead of current product work.
  - _Triggers_: A second system-specific sheet; character creation or another substantial route-level workflow; duplicated top-level composition across two or more routes; demand for page-level Storybook examples; route tests blocked by mixed layout and concrete data; or P1-062 reconciliation showing that organisms are carrying page-template responsibilities.
  - _Constraints_: Audit before reorganizing; preserve SvelteKit route semantics; distinguish atomic-design Pages from dialog steps/panels; do not invent generic templates without at least two concrete consumers.
  - _Refinement trigger_: When any trigger occurs, perform a focused repository audit, refine the component-composition ADR, and promote implementation work to a numbered backlog item only if the evidence justifies it.
- Revisit collection-row edit and annotation interaction UX across runtime actions, inventory, spells, features, proficiencies, and other aggregate item renderings.
  - _Why_: Permanent Edit and Notes buttons on every row could overwhelm dense sheet surfaces and keyboard tab order, while bulk-only dialogs make focused changes cumbersome and hide item-local annotation context.
  - _Explore_: A consistent row-action model; one compact explicit menu; hover/focus emphasis; persistent indicators when annotations exist; optional right-click or long-press shortcuts that open the same actions; and whether the annotation affordance should be renamed from Notes to Annotations.
  - _Related boundary_: `BL-064` owns bounded, scrollable, and searchable collection discovery; this idea owns how an already-discovered row is edited or annotated.
  - _Constraints_: Preserve text selection and copying, provide equivalent mouse/keyboard/touch paths, never require hover or long-press, retain explicit focus behavior, and keep bulk editing as a fallback during migration. Build on [the field interaction model](field-interaction-model.md) and [field rendering API](field-rendering-api.md) rather than adding collection-specific conventions independently.
  - _Open questions_: Which collection should prove the pattern, whether row selection and editing should remain distinct actions, when controls should be persistent versus revealed, how annotation presence changes affordance priority, and whether context-menu gestures are valuable enough to support as secondary shortcuts.
  - _Refinement trigger_: Explore before expanding direct per-item controls across collections or standardizing new `GridContent` row-action APIs; coordinate sequencing with the accessibility/mobile review so that review evaluates the intended interaction model.
- Explore source-backed runtime actions as source content plus explicit player overrides rather than fully materialized snapshots.
  - _Why_: Under the current snapshot contract, ordinary edits change the same `name` and `notes` fields that explicit resync later replaces, so resync can erase intentional player detail even though the action remains linked.
  - _Playtest decision (2026-07-25)_: Retain snapshot-and-explicit-resync semantics for the multi-source expansion, with a required overwrite warning before resync. An override-aware persisted model remains a future refactor.
  - _Explore_: Separate source-derived base values from player overrides; per-field modes such as inherit, replace, or append; a resync review that lets the user choose which base or effective fields may be replaced; and a deliberately shallow link that computes effective display content without weakening offline ownership.
  - _Constraints_: Never discard player-authored content silently, preserve deterministic data evolution and source-deletion fallback, keep current 5e behavior usable offline, and avoid a generic cross-system override framework until concrete spell/feature cases justify one.
  - _Open questions_: Which fields are source-owned, how normal editing creates or clears an override, whether annotations are always action-owned, how source deletion materializes the effective action, and whether the persisted model stores base values, override operations, or both.
  - _Refinement trigger_: Revisit after inventory, spell, and feature snapshots have broader playtest evidence, or before a schema change that needs per-field source provenance.
- Explore retrospectively linking an existing custom runtime action to an on-sheet source.
  - _Why_: Quick custom entry is useful when the player knows the action before organizing its source record, but requiring deletion and recreation later would discard action identity and authored detail.
  - _Current direction_: Attaching a source should preserve the existing action snapshot by default. Explicit resync remains the operation that replaces source-owned fields, with its normal overwrite warning.
  - _Explore_: A source-selection command on custom actions; whether linking should offer an optional reviewed "Use source text now" choice; how field differences are previewed; and whether changing an existing link belongs in the same interaction.
  - _Constraints_: Preserve action identity and authored fields, validate the source at commit time, never link directly to external-provider records, and do not blur linking with silent resync.
  - _Refinement trigger_: Revisit after the completed multi-source picker and source-specific resync behavior have playtest evidence.
- Reconcile canonical feature storage and explicit feature provenance before external compendium integration.
  - _Why_: General features have richer top-level records while ancestry, background, class, and subclass features currently live as nested lightweight references. The completed source expansion projects the selected collections coherently, but long-term provider enrichment and provenance-aware editing need a deliberate canonical model.
  - _Current direction_: Keep Traits visually separate, present general/manual plus class/subclass entries through Features, preserve current storage locations, and derive available source context from those locations.
  - _Explore_: Canonical feature content versus feature grants/references; explicit manual, ancestry, background, class, subclass, and external-provider provenance; duplicate grants; source deletion; and migration from existing top-level and nested records.
  - _Constraints_: Preserve stable identities and annotations, avoid duplicating editable content across canonical records and grants, retain offline ownership, and do not add provider-specific fields to generic core records prematurely.
  - _Refinement trigger_: Refine before background features become action sources or before an external compendium begins adding or enriching character-owned features.
- Consider an in-app side panel to help host the character's system-relevant SRD pdf for player convenience.
  - Consider that srd ref links could autonav in the side panel instead of a new tab.

## Done Recently

- `2026-07-26` completed `p1-061`: rebased 5e characters to the strict pre-playtest `dnd5e-2014.schema.v0` layout and expanded the guided runtime-action workflow across inventory, spells, Features, Traits, and custom entry with stable source identity, source-pronounced runtime rows, navigation, confirmed source-owned resync, deletion fallback, and mixed-source automated coverage
- `2026-07-26` completed `BL-065`: added a global pre-release warning banner to manage data preservation expectations before the v0 schema baseline reset
- `2026-07-25` completed `p1-062`: added a guided, searchable inventory-action templating dialog with final draft review; extracted focused card-action and dialog molecules; and preserved the existing bulk Edit/Notes workflows
- `2026-07-25` completed `p1-005`: advanced 5e characters to `dnd5e-2014.v3`, added persisted item-source links for independently editable runtime-action snapshots, and delivered equipped-item suggestions, single-entry playable action rows with authored notes, compact source navigation/resync menus, deletion fallback, retained card-level Edit/Notes workflows, Storybook states, and end-to-end coverage while leaving spell and feature sources to a follow-up
- `2026-07-19` completed `p1-012`: added a local SvelteKit Storybook catalog with typed BaseButton, Heading, and ValidatedInputField stories; isolated browser-backed interaction and automated accessibility checks now run through the Storybook Vitest project
