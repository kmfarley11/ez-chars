# MVP Backlog

This is the prioritized engineering backlog for the active MVP.

Use this file with:

- `../AGENTS.md`
- `current-mvp.md`

Treat `current-mvp.md` as the boundary document and this file as the execution queue.

## How To Use This Backlog With AI

### Prompting Rules

- Pair this file with `AGENTS.md` and `docs/current-mvp.md`
- Ask the AI to work on one top-level backlog item at a time
- Use the exact backlog item title in the prompt
- Tell the AI not to expand scope into `docs/vision/*`
- If the item is too large, ask the AI to decompose it into implementation slices and then execute only the first slice
- Ask the AI to run verification commands when appropriate
- Ask the AI to update this file or `docs/current-mvp.md` if completion status changes

### Good Prompt Pattern

```text
Use AGENTS.md, docs/current-mvp.md, and docs/mvp-backlog.md as the source of truth.
Focus only on the backlog item "<exact item title>".
Implement it for the current MVP only.
Do not expand scope into docs/vision.
Run check/lint/build when appropriate.
Update the MVP docs if the task meaningfully changes backlog or status.
```

### Good Prompt Pattern For Large Items

```text
Use AGENTS.md, docs/current-mvp.md, and docs/mvp-backlog.md as the source of truth.
Focus only on the backlog item "<exact item title>".
First break it into 3-5 implementation slices.
Recommend the first slice.
Then implement only that slice.
Do not expand scope into docs/vision.
Run check/lint/build when appropriate.
Update the MVP docs if the task meaningfully changes backlog or status.
```

## P0

### Complete the 5e sheet surface

Scope:

- add abilities, saves, skills, attacks, spellcasting, features, inventory, and notes sections
- keep the runtime vs organizational split explicit in the layout

Definition of done:

- the 5e sheet exposes all major MVP data sections called for in `current-mvp.md`
- a user can view and edit those sections from the 5e sheet route
- runtime information is visually distinct from organizational information
- existing stored or seeded 5e data renders without obvious breakage

### Extract and harden the storage layer

Scope:

- separate seed/demo data from the runtime store
- validate persisted data with Zod on load
- add a migration/versioning path for future schema changes

Definition of done:

- runtime state is no longer coupled to seed/demo fixtures in a single module
- persisted data is parsed and validated at the storage boundary instead of raw-cast
- invalid or outdated stored data is handled predictably
- the storage shape has an explicit place for schema versioning or migrations

### Add real character management

Scope:

- create new characters from the home view
- delete characters
- handle missing or invalid character ids cleanly

Definition of done:

- a user can create a new 5e 2014 character from the home view
- a user can delete a character from the home view or equivalent management surface
- navigating to a missing or invalid character id shows a clear state instead of silently falling back
- create and delete actions persist across reloads

### Implement JSON import/export

Scope:

- export all locally stored characters
- import with validation and user-visible error handling

Definition of done:

- a user can export current locally stored character data to JSON
- a user can import valid JSON into the app
- invalid JSON or invalid character payloads fail with a clear user-visible message
- import does not silently corrupt or partially overwrite data without a defined rule

### Add automated verification

Scope:

- add schema/parser tests
- add storage adapter tests
- add at least one end-to-end smoke path for create/edit/reload

Definition of done:

- automated tests cover schema parsing and storage boundary behavior
- at least one automated smoke path exercises core user flow
- the test command or commands are documented and runnable in the repo
- verification meaningfully reduces the risk of storage or sheet-regression bugs

## P1

### Add GitHub Actions for `check`, `lint`, and `build`

Definition of done:

- GitHub Actions runs `check`, `lint`, and `build` on pushes or pull requests
- the workflow is committed in `.github/workflows/`
- a failing quality gate produces a failing CI run

### Fix the theme bootstrap mismatch between the early `app.html` script and the runtime theme list

Definition of done:

- the early theme bootstrap and runtime theme source agree on the full theme set
- every available theme persists correctly across reloads
- the theme smoke checklist reflects the real supported themes

### Improve accessibility and mobile review of menus, dialogs, and sheet sections

Definition of done:

- critical menus and dialogs remain usable on phone-sized screens
- obvious focus, keyboard, or labeling issues in the main MVP flow are corrected
- the review is reflected in the theme or UI checklist where useful

### Refactor the repo structure so stores, fixtures, schema, and 5e feature code are less entangled

Definition of done:

- runtime stores, fixtures, schema, and feature code have clearer ownership boundaries
- high-churn feature work no longer depends on a catch-all module for unrelated concerns
- the resulting structure is easier to navigate for both humans and coding agents
- behavior remains unchanged except where the refactor explicitly supports an active backlog item

## Done Recently

- split the docs between the active MVP working set and long-term vision docs
- established `AGENTS.md` as the shortest AI-facing entry point
- completed the `src/lib/*Grid*` cleanup backlog
