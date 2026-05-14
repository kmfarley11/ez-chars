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
- Ask the AI to run verification commands when appropriate
- Ask the AI to summarize what remains from the parent backlog item
- Update this file or `docs/current-mvp.md` if the task meaningfully changes backlog or status

Prompt pattern:

```text
Use AGENTS.md, docs/current-mvp.md, and docs/mvp-backlog.md as the source of truth.
Focus only on the backlog item "<exact top-level id>".
Implement only suggested slice <number>.
If this task is about the 5e sheet's design or layout, also use docs/ez-chars-5e-rough.excalidraw as the design reference.
Do not expand scope into other slices or docs/vision.
Run check/lint/build when appropriate.
Explain briefly how I can manually verify the changes.
Summarize what remains from the parent backlog item.
Update the MVP docs if the task meaningfully changes backlog or status. Prune the backlog item when its fully complete.
```

## P0

Next recommended target: start with `p0-040` slice 1 to profile the 5e sheet scroll jank. If profiling shows a localized rendering/layout fix, land that before continuing JSON import/export.

### Implement JSON import/export

ID:

- `p0-020`

Size:

- oversized; implement by suggested slice, not as one pass

Scope:

- export all locally stored characters
- import with validation and user-visible error handling

Suggested implementation slices:

1. Define the exported JSON shape and import semantics.
2. Add export UI and file download behavior.
3. Add import UI and file selection behavior.
4. Validate imported payloads and surface clear errors for invalid files or data.
5. Finalize overwrite, merge, or replace behavior and document it in the UI or docs.

Definition of done:

- a user can export current locally stored character data to JSON
- a user can import valid JSON into the app
- invalid JSON or invalid character payloads fail with a clear user-visible message
- import does not silently corrupt or partially overwrite data without a defined rule

### Add automated verification

ID:

- `p0-030`

Size:

- oversized; implement by suggested slice, not as one pass

Scope:

- add schema/parser tests
- add storage adapter tests
- add at least one end-to-end smoke path for create/edit/reload

Suggested implementation slices:

1. Choose and wire the test tooling and scripts for the repo.
2. Add schema and parser tests around the current 5e model.
3. Add storage adapter tests around load/save/invalid-data behavior.
4. Add one end-to-end or integration smoke path for create/edit/reload.
5. Document how to run the verification commands locally.

Definition of done:

- automated tests cover schema parsing and storage boundary behavior
- at least one automated smoke path exercises core user flow
- the test command or commands are documented and runnable in the repo
- verification meaningfully reduces the risk of storage or sheet-regression bugs

### Improve 5e sheet scroll performance

ID:

- `p0-040`

Size:

- medium-to-large; diagnose first, then implement targeted slices

Scope:

- reduce visible jank/stutter when quickly scrolling the expanded 5e sheet
- focus on rendering, layout measurement, paint cost, and hidden DOM weight rather than broad feature refactors
- preserve the current sheet behavior while reducing unnecessary work during scroll

Current suspicion:

- `GridContainerAuto` is likely expensive at scale because each `GridContent` instance mounts resize and mutation observers, queries measured children, reads layout widths, and may update column count
- each `GridContent` currently renders edit/help dialogs even when closed, increasing hidden DOM size across the full sheet
- nested bordered/shadowed `theme-grid-layer` cards may increase paint cost during fast scroll
- hover/focus edit controls may trigger opacity transitions as the pointer crosses many cards while scrolling
- the large 5e page module and derived data projections are a maintainability/update-cost concern, but are less likely to be the direct cause of scroll jank unless profiling shows scripting/layout spikes

Slice 1 findings:

- Headless Chrome DevTools trace against seeded `char-001` and `char-002` routes showed no meaningful `Layout`, `UpdateLayoutTree`, or `RecalculateStyles` time during scripted fast scroll
- The dominant trace cost was raster/draw/compositing work, with top events including `RasterizerTaskImpl::RunOnWorkerThread`, `RasterTask`, `DisplayItemList::Raster`, `ProxyMain::BeginMainFrame`, and `MainFrame.Draw`
- DOM footprint during the trace was roughly 1,570 nodes, 75 closed dialogs, 94 measured grid items, 44 themed grid-layer cards, and a 4,600-4,800px document height
- `GridContainerAuto` observers remain a likely mount/resize/edit cost, but the captured fast-scroll jank is more strongly pointing at paint/raster/card-surface cost than repeated layout measurement
- Trace was collected through headless Chrome DevTools Protocol, not a visual paint-flashing session, so a headed Chrome paint-flashing check should still confirm the visual diagnosis when implementing fixes

Slice 5 status:

- Implemented by replacing the blurred outer `theme-grid-layer` shadows with cheaper depth cues from background tint and border contrast
- Preserves the existing boxed sheet hierarchy while reducing per-card raster/paint work during fast scroll
- Still needs re-profiling after the remaining slices to confirm the end-to-end jank target on desktop and phone-sized viewports

Slice 4 status:

- Implemented by lazy-rendering `GridContent` edit/help dialogs only after the user opens them
- Removes the previously observed always-mounted closed dialogs from the initial sheet DOM while preserving edit/help behavior
- Still needs re-profiling to quantify the resulting DOM reduction and scroll impact

Slice 6 status:

- Implemented by removing opacity transitions from `GridContent` help/edit controls
- Keeps keyboard focus reveal while limiting hover reveal to fine-pointer devices, reducing scroll-induced hover animation work
- Follow-up tightened pointer behavior so wheel scrolling clears visible controls and stationary cursors do not reveal controls just because content scrolls underneath them
- Still needs re-profiling with slice 7 to confirm whether hover churn remains a meaningful contributor

Slice 7 findings and smoke check:

- Re-profiled seeded `char-001` and `char-002` routes after slices 4, 5, and 6 using the same headless Chrome DevTools scripted fast-scroll trace as slice 1, plus a phone-sized `390x844` viewport pass
- Desktop DOM footprint dropped from roughly 1,570 nodes and 75 closed dialogs to roughly 1,125-1,138 nodes and one app-level dialog; measured grid items and themed grid-layer cards stayed at 94 and 44
- Desktop traces still showed no meaningful `Layout`, `UpdateLayoutTree`, or `RecalculateStyles` time during scripted scroll
- Desktop raster/draw/compositing remained the dominant trace shape, but raster task time improved directionally: `char-001` `RasterizerTaskImpl::RunOnWorkerThread` was about 139 ms vs. about 171 ms in slice 1, and `char-002` was about 97 ms vs. about 115 ms in slice 1
- Phone-sized traces also showed no layout/style recalculation during scripted scroll; top costs were main-frame animation/draw and raster work, with about 50-62 ms of rasterizer task time
- Manual follow-up confirmed Help/Edit controls no longer flash during quick scroll and remain open/closed as expected
- Manual follow-up also confirmed fast-scroll jank is improved but still present, most noticeably through the dense Abilities & Proficiencies and Spells regions
- Expected manual smoke check: open a seeded 5e sheet, expand the main regions, quick-scroll desktop and mobile/narrow viewports, confirm Help/Edit controls do not flash while wheel scrolling under a stationary cursor, then open/close one Help and Edit dialog and confirm closed dialogs are not retained across the sheet
- Remaining risk: the dense Abilities & Proficiencies and Spells regions still concentrate many `GridContent`/`GridContainerAuto` surfaces, so the next data-driven target is `GridContainerAuto` measurement/observer behavior in slices 2 and 3

Suggested implementation slices:

1. Profile the 5e sheet in Chrome Performance with paint flashing and identify whether the dominant cost is scripting/layout or paint/compositing.
2. Make `GridContainerAuto` measurement opt-in or replace it with CSS grid behavior for surfaces that do not require runtime width measurement.
3. Remove or narrow the `MutationObserver` in `GridContainerAuto`; prefer mount/resize recalculation unless profiling proves content mutation measurement is necessary.
4. Lazy-render `GridContent` edit/help dialogs only after the user opens them.
5. Reduce inner card paint cost by simplifying nested shadows or moving depth cues to cheaper border/background treatments.
6. Review hover/focus edit controls for scroll-induced transition churn and disable or simplify transitions where they cause jank.
7. Re-profile desktop and phone-sized viewports and document the expected performance smoke check.

Definition of done:

- fast scrolling the seeded 5e sheet is visibly smoother on desktop and phone-sized viewports
- profiling confirms the main source of jank was addressed
- `npm run check`, `npm run lint`, and `npm run build` pass
- any remaining known performance risks are documented with follow-up slices or backlog items

## P1

### Link runtime actions to source weapons, spells, and features

ID:

- `p1-005`

Size:

- medium; scope after the MVP sheet and import/export flows are stable

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
5. Re-check mobile sheet interaction after `p0-040` lands, but keep performance diagnosis and fixes in `p0-040`.

Definition of done:

- critical menus and dialogs remain usable on phone-sized screens
- obvious focus, keyboard, or labeling issues in the main MVP flow are corrected
- the review is reflected in the theme or UI checklist where useful

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

## Done Recently

- split the docs between the active MVP working set and long-term vision docs
- established `AGENTS.md` as the shortest AI-facing entry point
- completed the `Add real character management` backlog item
- completed the `src/lib/*Grid*` cleanup backlog
- completed `p0-010`: the 5e sheet now exposes the major MVP runtime and organizational sections, including seeded runtime action data, with check/lint/build passing
