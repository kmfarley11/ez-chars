# MVP Backlog

This is the prioritized engineering backlog for the active MVP.

Use this file with:

- `../AGENTS.md`
- `current-mvp.md`

Treat `current-mvp.md` as the boundary document and this file as the execution queue.

## How To Use This Backlog With AI

- Pair this file with `AGENTS.md` and `docs/current-mvp.md`
- Work on one top-level backlog item at a time
- Use the exact backlog item title in the prompt
- For `small` items, hand the top-level item directly to the AI
- For `medium`, `medium-to-large`, or `oversized` items, tell the AI to implement only one named suggested slice
- Do not expand scope into other slices or `docs/vision/*`
- Ask the AI to run verification commands when appropriate
- Ask the AI to summarize what remains from the parent backlog item
- Update this file or `docs/current-mvp.md` if the task meaningfully changes backlog or status

Prompt pattern:

```text
Use AGENTS.md, docs/current-mvp.md, and docs/mvp-backlog.md as the source of truth.
Focus only on the backlog item "<exact top-level item title>".
Implement only suggested slice <number>: "<exact slice text>".
Do not expand scope into other slices or docs/vision.
Run check/lint/build when appropriate.
Summarize what remains from the parent backlog item.
Update the MVP docs if the task meaningfully changes backlog or status.
```

## P0

### Complete the 5e sheet surface

Size:

- oversized; implement by suggested slice, not as one pass

Scope:

- add abilities, saves, skills, attacks, spellcasting, features, inventory, and notes sections
- keep the runtime vs organizational split explicit in the layout

Suggested implementation slices:

1. Add abilities, saves, and skills as an explicit runtime section.
2. Add attacks and spellcasting as an explicit runtime section.
3. Add features, inventory, and notes as organizational sections.
4. Refine the page layout so runtime vs organizational information is visually and structurally clear.
5. Run a render/edit pass against seeded data and fix breakage caused by the expanded surface.

Definition of done:

- the 5e sheet exposes all major MVP data sections called for in `current-mvp.md`
- a user can view and edit those sections from the 5e sheet route
- runtime information is visually distinct from organizational information
- existing stored or seeded 5e data renders without obvious breakage

### Extract and harden the storage layer

Size:

- oversized; implement by suggested slice, not as one pass

Scope:

- separate seed/demo data from the runtime store
- validate persisted data with Zod on load
- add a migration/versioning path for future schema changes

Suggested implementation slices:

1. Split seed/demo fixtures out of the current runtime store module.
2. Introduce a dedicated storage adapter module for load/save behavior.
3. Validate persisted character payloads at load time with Zod.
4. Add a versioned storage envelope or migration hook for future schema evolution.
5. Add user-visible handling for invalid or outdated stored data where needed.

Status:

- slice 1 is complete: seed/demo fixtures now live in an explicit fixtures module
- slice 2 is complete: load/save behavior now lives in a dedicated storage adapter module

Definition of done:

- runtime state is no longer coupled to seed/demo fixtures in a single module
- persisted data is parsed and validated at the storage boundary instead of raw-cast
- invalid or outdated stored data is handled predictably
- the storage shape has an explicit place for schema versioning or migrations

### Add real character management

Size:

- medium; can be done in one pass if tightly scoped, otherwise split first

Scope:

- create new characters from the home view
- delete characters
- handle missing or invalid character ids cleanly

Suggested implementation slices:

1. Add a create-new-character flow from the home view.
2. Add delete-character controls and persistence behavior.
3. Add a clear missing-or-invalid-id state on the 5e sheet route.

Definition of done:

- a user can create a new 5e 2014 character from the home view
- a user can delete a character from the home view or equivalent management surface
- navigating to a missing or invalid character id shows a clear state instead of silently falling back
- create and delete actions persist across reloads

### Implement JSON import/export

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

### Fix the theme bootstrap mismatch between the early `app.html` script and the runtime theme list

Size:

- small; safe to hand directly to AI

Scope:

- align the early boot theme logic with the runtime theme source of truth
- preserve theme persistence across reloads

Suggested implementation slices:

1. Make the early bootstrap accept the full supported theme set.
2. Verify that every runtime theme persists correctly and keep the checklist aligned.

Definition of done:

- the early theme bootstrap and runtime theme source agree on the full theme set
- every available theme persists correctly across reloads
- the theme smoke checklist reflects the real supported themes

### Improve accessibility and mobile review of menus, dialogs, and sheet sections

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

### Refactor the repo structure so stores, fixtures, schema, and 5e feature code are less entangled

Size:

- oversized and risky; only tackle in slices or alongside an active feature item

Scope:

- reduce coupling between stores, fixtures, schema modules, and 5e page-specific logic
- improve navigability without changing behavior unnecessarily

Suggested implementation slices:

1. Move seed/demo data into an explicit fixtures module.
2. Move storage logic into its own module.
3. Extract 5e page-specific mapping logic into a feature-local module.
4. Reorganize folders only after behavior-critical extractions are complete.

Definition of done:

- runtime stores, fixtures, schema, and feature code have clearer ownership boundaries
- high-churn feature work no longer depends on a catch-all module for unrelated concerns
- the resulting structure is easier to navigate for both humans and coding agents
- behavior remains unchanged except where the refactor explicitly supports an active backlog item

## Done Recently

- split the docs between the active MVP working set and long-term vision docs
- established `AGENTS.md` as the shortest AI-facing entry point
- completed the `src/lib/*Grid*` cleanup backlog
