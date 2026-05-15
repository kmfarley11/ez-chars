# MVP Backlog

This is the prioritized engineering backlog for the active MVP.

Use this file with:

- `../AGENTS.md`
- `current-mvp.md`

Treat `current-mvp.md` as the boundary document and this file as the execution queue.

## How To Use This Backlog With AI

- Pair this file with `AGENTS.md` and `docs/current-mvp.md`
- Work on one top-level backlog item at a time
- Use the exact backlog item id from the `ID:` line in the prompt; keep the human-readable title in this file for context
- For `small` items, hand the top-level item directly to the AI
- For `medium`, `medium-to-large`, or `oversized` items, tell the AI to implement only one numbered suggested slice
- If a slice description is unusually close to another slice or otherwise ambiguous, include the exact slice text as an extra clarification, but this should not be required in the normal case
- If the task is about the 5e sheet's intended layout or information grouping, also point the AI at `docs/ez-chars-5e-rough.excalidraw` as the design reference
- Do not expand scope into other slices or `docs/vision/*`
- Ask the AI to run verification commands when appropriate; include `npm run test` for behavior, schema, storage, import/export, or release-sensitive changes
- Ask the AI to summarize what remains from the parent backlog item
- Update this file or `docs/current-mvp.md` if the task meaningfully changes backlog or status

Prompt pattern:

```text
Use AGENTS.md, docs/current-mvp.md, and docs/mvp-backlog.md as the source of truth.
Focus only on the backlog item "<exact top-level id>".
Implement only suggested slice <number>.
If this task is about the 5e sheet's design or layout, also use docs/ez-chars-5e-rough.excalidraw as the design reference.
Do not expand scope into other slices or docs/vision.
Run test/check/lint/build when appropriate.
Explain briefly how I can manually verify the changes.
Summarize what remains from the parent backlog item.
Update the MVP docs if the task meaningfully changes backlog or status. Prune the backlog item when its fully complete.
```

## P0

Next recommended target: continue `p0-030` with slice 5 to add one thin user-centric smoke path for create/edit/reload.

### Add automated verification

ID:

- `p0-030`

Size:

- oversized; implement by suggested slice, not as one pass

Scope:

- add contract-focused tests around schema parsing, storage boundaries, and JSON import/export
- add storage adapter tests around load/save/invalid-data behavior
- add only a thin end-to-end smoke path for create/edit/reload once the stable contract tests are in place
- avoid brittle tests around current 5e route internals, exact DOM structure, grid layout, or component composition because planned P1 refactors may intentionally reshape those areas

Testing strategy:

- Prioritize tests that protect stable data contracts before refactors: 5e schema parsing, localStorage envelope load/save, invalid-data fallback, movement-number migration, JSON export envelope parsing, and import merge/replace duplicate-ID behavior.
- Place Vitest files in nearby `__tests__` folders, matching the existing `src/schema/__tests__/` pattern, unless a future test type has a clear reason to live elsewhere.
- Keep UI tests user-centric and sparse until the field-binding, route extraction, and layout/refactor direction is clearer.
- Prefer tests that survive implementation refactors over tests that assert current component structure.

Suggested implementation slices:

1. Choose and wire the test tooling and scripts for the repo, with a bias toward fast unit tests for stable contracts and a later thin browser smoke path.
2. Add schema and parser tests around the current 5e model and JSON import/export envelope.
3. Add storage adapter tests around load/save/invalid-data behavior, including migration and fallback behavior.
4. Add focused import/export behavior tests for valid export parse, invalid payload rejection, replace-all import, and merge-new duplicate-ID handling.
5. Add one end-to-end or integration smoke path for create/edit/reload after the contract tests exist, keeping it high-level and user-centric.
6. Document how to run the verification commands locally.

Slice 1 status:

- Chose Vitest for fast Node-environment contract tests around schema, storage, and import/export behavior.
- Added `npm run test` and `npm run test:watch` scripts; `test` initially used `--passWithNoTests` so tooling could land before the first test files.
- Configured Vitest in `vite.config.ts` to run non-global tests from `src/**/*.{test,spec}.{ts,js}`; contract tests may live in nearby `__tests__` folders.
- Added `npm run test:coverage` with V8 coverage and terminal/html reports for at-a-glance coverage review of current contract-test surfaces.
- Browser-level smoke tooling is intentionally deferred until the stable contract tests exist.

Slice 2 status:

- Added Vitest contract tests for creating, parsing, and rejecting D&D 5e 2014 character documents.
- Added tests proving seeded 5e fixture characters validate through the current schema parser.
- Added JSON backup envelope tests for valid exports, raw-array rejection, unsupported version rejection, and invalid contained character rejection.
- Removed `--passWithNoTests` from `npm run test` now that real test files exist.

Slice 3 status:

- Added storage adapter contract tests for empty storage fallback, versioned save/load, and clear behavior.
- Added migration coverage for legacy raw character arrays and legacy string movement values, including empty movement fields.
- Added invalid-data fallback coverage for malformed JSON, unsupported storage envelope versions, and stored characters that fail schema validation.

Slice 4 status:

- Extracted import application into a pure `applyCharacterImport` helper so replace-all and merge-new behavior can be tested without brittle route internals.
- Added import/export contract tests for replace-all imports and merge-new imports that skip duplicate character IDs, including duplicates already present locally and duplicates within the import payload.

AI-agent verification expectations:

- Future implementation prompts should ask agents to run `npm run test` alongside `npm run check`, `npm run lint`, and `npm run build` when the task touches behavior, schema, storage, import/export, or release-sensitive paths.
- Once tests exist for a contract, agents should update those tests in the same change that alters the contract.
- Doc-only and narrow style-only changes may run a smaller relevant subset, but agents should state what they skipped and why.

Definition of done:

- automated tests cover schema parsing, JSON import/export contracts, and storage boundary behavior
- at least one automated smoke path exercises core user flow without depending on exact 5e page layout internals
- the test command or commands are documented and runnable in the repo
- verification meaningfully reduces the risk of storage or sheet-regression bugs

## P1

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

### Add GitHub Actions for `check`, `lint`, and `build`

ID:

- `p1-010`

Size:

- small; safe to hand directly to AI

Scope:

- add a GitHub Actions workflow for the existing repo quality gates

Suggested implementation slices:

1. Add a workflow that runs `npm run check`, `npm run lint`, and `npm run build` on pull requests and pushes.
2. Confirm the workflow uses the project’s expected Node and install steps.

Definition of done:

- GitHub Actions runs `check`, `lint`, and `build` on pushes or pull requests
- the workflow is committed in `.github/workflows/`
- a failing quality gate produces a failing CI run

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

### Follow up on residual 5e sheet scroll performance

ID:

- `p1-025`

Size:

- medium-to-large; diagnose first, then implement narrowly

Scope:

- follow up on the remaining fast-scroll jank in the expanded 5e sheet after the focused P0 performance pass
- prioritize the dense Abilities & Proficiencies and Spells regions where manual scrolling still shows the most visible stutter
- preserve the measured layout quality that looked better than the attempted CSS auto-fit replacement
- keep this separate from the field-editing UX work in `p1-030`, the field-binding abstraction in `p1-040`, and the route projection extraction in `p1-045`

Migrated findings from `p0-040`:

- Headless Chrome traces showed little meaningful layout/style recalculation during scripted fast scroll; the dominant trace shape was raster/draw/compositing work
- Lazy-rendering edit/help dialogs reduced initial sheet DOM from roughly 1,570 nodes and 75 closed dialogs to roughly 1,125-1,138 nodes and one app-level dialog
- Simplifying themed card shadows and removing scroll-induced hover transitions improved the issue directionally, and Help/Edit controls no longer flash during quick scroll
- A broad CSS auto-fit replacement for `GridContainerAuto` was tried and reverted because it worsened spell/proficiency and long-value movement layouts without a meaningful measured performance win
- Removing the broad subtree `MutationObserver` from `GridContainerAuto` made the code simpler and helped slightly, but the residual jank remains visible enough to deserve a later targeted pass

Suggested implementation slices:

1. Re-profile in a headed browser with visual paint/debug tooling and scripted scroll traces, focused on dense Abilities & Proficiencies and Spells surfaces.
2. Prototype a narrow `GridContainerAuto` measurement change only for the specific dense surfaces that profiling identifies, and keep visual parity as a requirement.
3. Evaluate whether targeted lazy mounting, section-level deferral, or reduced always-rendered dense content would improve scroll smoothness without hiding expected MVP sheet data.
4. If profiling points at route/module update cost instead of paint, coordinate with `p1-045` rather than duplicating projection or patch extraction work here.
5. Re-run desktop and phone-sized manual scroll checks plus `npm run check`, `npm run lint`, and `npm run build`.

Definition of done:

- fast scrolling the dense 5e sheet regions is visibly smoother on desktop and phone-sized viewports
- profiling shows a concrete improvement rather than only a code-shape cleanup
- visual layout remains at least as good as the measured layout restored after the reverted CSS auto-fit attempt
- any broader refactor discovered during the pass is linked to `p1-045` or `p1-050` instead of folded into this item

### Refine field-level editing and annotation UX

ID:

- `p1-030`

Size:

- medium-to-large; scope to one interaction slice before implementation

Scope:

- reduce the mismatch between runtime sheet editing needs and the current bulk edit-dialog workflow
- move toward direct field interaction for editing while preserving access to field annotations
- define the target interaction model before heavy implementation work; later implementation slices should lean on the shared field-binding/patch abstraction item instead of page-specific glue or transport-specific code
- avoid locking the UX to desktop-only gestures; any annotation access pattern must still work for touch and keyboard users

Suggested implementation slices:

1. Define the target field interaction model for the MVP: primary click/tap edits a field, while annotations open through a secondary gesture or explicit affordance that also works on mobile.
2. Apply the shared field-binding/patch abstractions to let individual primitive fields enter edit mode without opening a bulk form for the whole card.
3. Add field-level annotation access and viewing behavior without regressing current annotation data or help content.
4. Decide whether the existing bulk edit dialog stays as a fallback for multi-field edits or is reduced to non-runtime surfaces only.
5. Run a keyboard, touch, and focus-management pass on the new interaction model and document any new expectations in the UI checklist.

Dependency notes:

- Start with slice 1 of this item first so the target interaction model is explicit before abstraction work hardens around the wrong UX.
- After slice 1 is decided, most of the remaining implementation for this item should depend on `p1-040`, especially slices 2-4.
- In practice, the expected order is: `p1-030` slice 1 -> `p1-040` slices -> `p1-030` slices 2-5 -> optional `p1-045`/`p1-050` cleanup.

Definition of done:

- a user can directly edit individual runtime-relevant fields from the sheet without depending on a card-wide bulk form
- field annotations remain accessible from the same surfaces without hidden desktop-only assumptions
- the resulting interaction model is usable on mouse, keyboard, and touch flows
- the grid component structure is clearer about display mode vs inline-edit mode vs annotation mode

### Stabilize field-level binding and patch flows

ID:

- `p1-040`

Size:

- medium-to-large; implement by slice before broad rollout

Scope:

- extract a shared field-scoped binding model from the current page- and card-wide grid edit flow
- make per-field reads, drafts, value saves, and annotation saves explicit without requiring page-specific bulk-form glue
- keep the abstraction transport-agnostic and API-ready: model local edits in a way that can later map cleanly to remote create/read/patch/replace/delete flows without putting HTTP or auth concerns into field components
- support inline sheet editing and annotation work without turning this into a generalized data-layer rewrite

Suggested implementation slices:

1. Define the field-scoped binding contract around read paths, value patch paths, annotation patch paths, commit boundaries, and save semantics.
2. Define a local-first mutation envelope whose semantics can later map cleanly to create/read/patch/replace/delete flows, while remaining transport-agnostic in the current app.
3. Separate value patch projection from annotation patch projection so field components can consume them independently.
4. Introduce field-scoped draft/edit/cancel helpers that do not require opening a card-wide dialog.
5. Prove the abstraction on one current runtime sheet surface before wider rollout, with the page layer applying local changes immediately and an optional persistence/sync layer left as a lower-level concern.
6. Document how grid components, page layers, and data/store layers divide responsibility, including that field components must not know about HTTP endpoints, auth, or remote transport details.

Dependency notes:

- This item should usually begin only after slice 1 of `p1-030` establishes the intended interaction model.
- Once that interaction model is chosen, this item becomes the main technical prerequisite for most of the remaining inline-edit UX work.
- This item is an enabler for field-level editing and annotation UX, not a standalone data-layer redesign.
- This item should make future backend support easier, but current implementations should stay client-driven and local-first unless a backlog item explicitly introduces remote behavior.

Definition of done:

- a field component can read and write a single bound path without page-specific save glue
- value edits and annotation edits use consistent patch semantics
- the abstraction is transport-agnostic and API-ready enough that a future remote adapter could consume the same mutation semantics without rewriting field components
- inline edit flows no longer depend on a card-wide bulk form
- the abstraction is proven on at least one current sheet surface and is clear enough to reuse

### Extract 5e sheet projection and patch logic from the route

ID:

- `p1-045`

Size:

- medium-to-large; implement after the performance pass and after the initial field-binding direction is clear

Scope:

- reduce the size and responsibility of `src/routes/charsheets/5e/+page.svelte`
- move 5e-specific `GridContentData` projection builders out of the route
- move virtual path constants and patch normalization helpers into feature-local modules
- keep the route focused on selected-character lookup, layout composition, collapse state, and save dispatch
- do not define the inline-edit interaction model or shared field-binding contract; that belongs to `p1-030` and `p1-040`
- do not reorganize unrelated stores, fixtures, or schema folders; that belongs to `p1-050`
- preserve current behavior unless a slice explicitly supports an active feature item

Suggested implementation slices:

1. Extract static 5e sheet metadata and options: ability metadata, skill metadata, spell slot metadata, runtime action options, inventory tags, and roleplay note metadata.
2. Extract pure projection builders for current sheet surfaces: overview, quick reference, abilities/proficiencies/features/traits, runtime actions, spells, inventory, and organizational notes.
3. Extract patch normalization helpers for virtual paths: runtime actions, spell levels, proficiency languages, class features, inventory groups/currency, and organizational notes.
4. Add focused tests around projection and patch helpers once `p0-030` test tooling exists.
5. Leave `+page.svelte` as mostly layout/orchestration and verify no user-visible behavior changed.

Definition of done:

- `+page.svelte` no longer owns most 5e-specific projection or patch normalization logic
- virtual path handling has a clearer feature-local home
- extracted helpers are easier to test and reuse
- existing sheet editing behavior remains unchanged
- `npm run check`, `npm run lint`, and `npm run build` pass

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

### WIP other refactor/rework bucket

This content is a work in progress to dump thoughts before execution or further organization.

- re-organize lib a bit better, consider a ui lib vs. utility lib
  - consider the ui lib organizing by primitives vs. composites vs. patterns
  - consider adding storybook to help playtest the concepts etc.
- re-org the ux: consider meta & quickref being sticky, then tabulate 3 pillars: adventure, combat, roleplay? combat could have sticky header for summary
  - note: the thought is to make most of the screen real-estate while avoiding complex UI. so less headers, but more clicking and less scrolling perhaps.
  - implementing a drawer of sorts wouldn't be a bad idea either

## Done Recently

- split the docs between the active MVP working set and long-term vision docs
- established `AGENTS.md` as the shortest AI-facing entry point
- completed the `Add real character management` backlog item
- completed the `src/lib/*Grid*` cleanup backlog
- completed `p0-010`: the 5e sheet now exposes the major MVP runtime and organizational sections, including seeded runtime action data, with check/lint/build passing
- completed the focused `p0-040` scroll-performance pass: reduced hidden dialog DOM, simplified hover/paint costs, removed broad `GridContainerAuto` mutation observation, and moved residual jank follow-up to `p1-025`
- completed `p0-020`: JSON backup/restore supports a versioned export envelope, file download, import file selection, import validation, replace-all import, and merge-new import that skips duplicate character IDs
- completed home action button polish: shared button chrome now aligns Create, Import, Export, and import apply actions consistently
