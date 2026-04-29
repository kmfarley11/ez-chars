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

### Complete the 5e sheet surface

ID:

- `p0-010`

Size:

- oversized; implement by suggested slice, not as one pass

Scope:

- add abilities, saves, skills, attacks, spellcasting, features, inventory, and notes sections
- keep the runtime vs organizational split explicit in the layout

Suggested implementation slices:

1. Finish the abilities/proficiencies runtime section as a proficiency-bonus row plus six ability-based columns.
2. Simplify saves and skills in that section to MVP proficiency indicators; defer expertise and ad hoc bonuses to annotations.
3. Add spells as an explicit runtime section per the excalidraw.
4. Add features & traits & misc proficiencies to the ability score section per the excalidraw
5. Add inventory as a dedicated runtime section per the excalidraw
6. Add background, roleplay, & notes as an organizational section per the excalidraw.
7. Refine the page layout so runtime vs organizational information is visually and structurally clear.
8. Run a render/edit pass against seeded data and fix breakage caused by the expanded surface.
9. Fix the styling on grid content so that it doesn't wrap the skill boxes and score vs. mod stuff

Status:

- slices 1-5 & 9 are complete: the runtime surface now covers abilities/proficiencies, traits/class-features/misc proficiency cards, an explicit spells section, and a dedicated inventory/equipment section; other slices still need to finish the rest of the sheet and refine layout/details

Definition of done:

- the 5e sheet exposes all major MVP data sections called for in `current-mvp.md`
- a user can view and edit those sections from the 5e sheet route
- runtime information is visually distinct from organizational information
- existing stored or seeded 5e data renders without obvious breakage

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

## P1

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
- In practice, the expected order is: `p1-030` slice 1 -> `p1-040` slices -> `p1-030` slices 2-5 -> optional `p1-050` cleanup.

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

### Refactor the repo structure so stores, fixtures, schema, and 5e feature code are less entangled

ID:

- `p1-050`

Size:

- oversized and risky; only tackle in slices or alongside an active feature item

Scope:

- reduce coupling between stores, fixtures, schema modules, and 5e page-specific logic
- keep this item focused on module ownership and navigability, not as a substitute for the field-binding/patch abstraction work
- improve navigability without changing behavior unnecessarily
- review duplicated or provenance-bound schema storage that currently forces awkward feature-layer glue

Dependency notes:

- This item is a cleanup/supporting refactor, not the primary dependency for inline field editing.
- Prefer landing the first usable field-binding/patch abstraction before using this item to reorganize where those modules live.

Suggested implementation slices:

1. Move seed/demo data into an explicit fixtures module.
2. Move storage logic into its own module.
3. Extract 5e page-specific mapping and binding glue into feature-local modules.
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
