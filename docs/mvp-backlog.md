# MVP Backlog

This is the prioritized engineering backlog for the active MVP.

Use this file with:

- [../AGENTS.md](../AGENTS.md)
- [current-mvp.md](current-mvp.md)
- [ai-usage.md](ai-usage.md)

Treat [current-mvp.md](current-mvp.md) as the boundary document and this file as the execution queue.

## How To Use This Backlog With AI

- Pair this file with [AGENTS.md](../AGENTS.md) and [docs/current-mvp.md](current-mvp.md)
- Use [ai-usage.md](ai-usage.md) to choose a model, reasoning level, and prompt size before starting; default to the smallest model/reasoning level that can safely handle the requested slice
- Work on one top-level backlog item at a time
- Use the exact backlog item id from the `ID:` line in the prompt; keep the human-readable title in this file for context
- For `small` items, hand the top-level item directly to the AI
- For `medium`, `medium-to-large`, or `oversized` items, tell the AI to implement only one numbered suggested slice
- Use the parent item scope, execution guidance, dependency notes, and definition of done as design constraints for the requested slice, but do not implement neighboring slices unless explicitly asked
- If a slice description is unusually close to another slice or otherwise ambiguous, include the exact slice text as an extra clarification, but this should not be required in the normal case
- If the task is about the 5e sheet's intended layout or information grouping, also point the AI at [docs/ez-chars-5e-rough.excalidraw](ez-chars-5e-rough.excalidraw) as the design reference
- Do not expand scope into other slices or [docs/vision/](vision/)
- Before adding bespoke UI controls or new component patterns, inspect [src/lib/](../src/lib/) for existing primitives and prefer reusing or extending them; call out deliberate exceptions
- For refactor or shared-interface work, inventory existing call sites first, describe the intended common interface or migration shape before broad edits, and preserve user-visible behavior unless the slice explicitly changes it
- If a slice is exploratory or documentation-driven, ensure later suggested slices, execution guidance, or dependency notes explicitly incorporate the findings before marking the slice complete
- Ask the AI to run verification according to [docs/verification.md](verification.md)
- Ask the AI to summarize what remains from the parent backlog item
- Update this file or [docs/current-mvp.md](current-mvp.md) if the task meaningfully changes backlog or status
- Before pruning a completed backlog item, confirm every definition-of-done bullet is satisfied, not only the numbered slice text

Prompt pattern:

```text
Use AGENTS.md, docs/current-mvp.md, and docs/mvp-backlog.md as the source of truth.
Focus only on the backlog item "<exact top-level id>".
Implement only suggested slice <number>.
Use the parent item scope, execution guidance, dependency notes, and definition of done as design constraints, but implement only the requested numbered slice.
If this task is about the 5e sheet's design or layout, also use docs/ez-chars-5e-rough.excalidraw as the design reference.
Before adding bespoke UI controls or new component patterns, inspect src/lib for reusable primitives and prefer existing components; call out any deliberate exception.
For refactor or shared-interface work, inventory existing call sites first, describe the intended common interface or migration shape before broad edits, and preserve user-visible behavior unless the slice explicitly changes it.
If this task is exploratory or documentation-driven, ensure later suggested slices, execution guidance, or dependency notes explicitly incorporate the findings before marking the slice complete.
Do not expand scope to implement other slices or `docs/vision`.
Run verification according to docs/verification.md when appropriate.
Explain briefly how I can manually verify the changes.
Summarize what remains from the parent backlog item.
Update the MVP docs if the task meaningfully changes backlog or status. Prune the backlog item only when all slices and definition-of-done bullets are complete.
Suggest a one-liner commit message if you were to git commit the changes implemented.
```

## P0

No active P0 items.

## P1

Next recommended target: tackle `p1-022`, then `p1-024`, then `p1-045`.

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

### Add Svelte 5 agent tooling and audit the current app

ID:

- `p1-022`

Size:

- medium; documentation and narrow cleanup first

Scope:

- identify the preferred Svelte 5 MCP/plugin/skill workflow for agents working in this repo
- update [../AGENTS.md](../AGENTS.md), [ai-usage.md](ai-usage.md), or another agent-facing guide with when and how to use that Svelte 5 tooling
- scan the current app for Svelte 5 syntax, reactivity, lifecycle, component-boundary, and performance issues
- fix narrow, low-risk findings that improve the app as it exists today without changing feature scope
- capture larger or uncertain findings as follow-up backlog work instead of folding them into the audit
- do not add a new dependency or external tool requirement without asking first

Suggested implementation slices:

1. Identify the Svelte 5 tooling or MCP/plugin setup agents should use for this repo, and document the expected workflow.
2. Run an app-wide Svelte 5 review focused on correctness, reactivity shape, lifecycle usage, and obvious render/performance pitfalls.
3. Apply targeted fixes for low-risk findings, keeping behavior and layout stable.
4. Record any larger findings as follow-up backlog items or dependency notes on the relevant existing tickets.
5. Run the relevant local verification from [docs/verification.md](verification.md).

Definition of done:

- agent-facing docs explain the Svelte 5 tooling workflow for future implementation tasks
- the current app has been reviewed with that tooling or the documented best available equivalent
- low-risk Svelte 5 correctness or performance findings are fixed and verified
- larger, risky, or ambiguous findings are explicitly captured for later work
- no dependency or external tooling requirement is added without prior approval

### Prefer platform-native HTML and CSS primitives where practical

ID:

- `p1-024`

Size:

- medium-to-large; inventory first, then implement only clear wins

Scope:

- establish guidance for agents to prefer browser/platform primitives over bespoke JavaScript, Tailwind-heavy, or package-based implementations where practical
- consider native and modern platform features such as `<dialog>`, popover and anchor positioning where browser support is acceptable, `:has()`, scroll-snap, scroll timelines, CSS-driven interaction states, and native form controls
- inventory current app surfaces that may benefit from platform-native simplification: menus, dialogs, grid measurement/layout, select/list behavior, scroll interactions, hover/focus behavior, and dense sheet sections
- evaluate candidates for accessibility, mobile behavior, browser support, maintainability, and measured performance impact before changing implementation
- coordinate with `p1-020` for accessibility/mobile findings and `p1-025` for measured dense-sheet scroll performance
- do not add a new dependency without asking first; external references such as Graffiti UI can inform evaluation but should not become dependencies by default

Suggested implementation slices:

1. Add agent-facing guidance for when to reach for native HTML/CSS primitives before custom components, JavaScript state, or new packages.
2. Inventory current custom UI/CSS patterns and identify candidates for platform-native simplification.
3. Evaluate the highest-value candidates against accessibility, mobile behavior, browser support, and maintainability.
4. Implement one narrow replacement or simplification only where the tradeoff is clearly favorable and behavior can be preserved.
5. Record deferred candidates on the relevant backlog item instead of broadening this effort.
6. Run the relevant local verification from [docs/verification.md](verification.md), plus manual checks for any touched mobile or interaction surface.

Definition of done:

- agent-facing docs include project guidance to prefer platform-native primitives where they fit
- current custom UI/CSS patterns have been inventoried for native simplification candidates
- at least one clear, low-risk improvement is implemented or all candidates are explicitly deferred with reasons
- accessibility, mobile behavior, and browser support are considered before implementation
- any performance claim is backed by verification or linked to `p1-025` for measurement
- no new dependency is added without prior approval

### Follow up on residual 5e sheet scroll performance

ID:

- `p1-025`

Size:

- medium-to-large; diagnose first, then implement narrowly

Scope:

- follow up on the remaining fast-scroll jank in the expanded 5e sheet after the focused P0 performance pass
- prioritize the dense Abilities & Proficiencies and Spells regions where manual scrolling still shows the most visible stutter
- preserve the measured layout quality that looked better than the attempted CSS auto-fit replacement
- keep this separate from the field-editing UX work in `p1-030`, the field/card API consolidation in `p1-035`, the field-binding abstraction in `p1-040`, and the route projection extraction in `p1-045`
- prefer tackling this after `p1-035` lands, unless `p1-035` itself causes a visible performance regression; that keeps profiling focused on the field/card renderer shape the app intends to keep
- use findings from `p1-022` and `p1-024` if they are available, but keep this ticket focused on measured dense-sheet scroll performance rather than broad Svelte or platform cleanup

Migrated findings from `p0-040`:

- Headless Chrome traces showed little meaningful layout/style recalculation during scripted fast scroll; the dominant trace shape was raster/draw/compositing work
- Lazy-rendering edit/help dialogs reduced initial sheet DOM from roughly 1,570 nodes and 75 closed dialogs to roughly 1,125-1,138 nodes and one app-level dialog
- Simplifying themed card shadows and removing scroll-induced hover transitions improved the issue directionally, and Help/Edit controls no longer flash during quick scroll
- A broad CSS auto-fit replacement for `GridContainerAuto` was tried and reverted because it worsened spell/proficiency and long-value movement layouts without a meaningful measured performance win
- Removing the broad subtree `MutationObserver` from `GridContainerAuto` made the code simpler and helped slightly, but the residual jank remains visible enough to deserve a later targeted pass

Suggested implementation slices:

1. Re-profile in a headed browser with visual paint/debug tooling and scripted scroll traces, focused on dense Abilities & Proficiencies and Spells surfaces. If `p1-035` has landed, use the consolidated field/card renderer as the baseline.
2. Prototype a narrow `GridContainerAuto` measurement change only for the specific dense surfaces that profiling identifies, and keep visual parity as a requirement.
3. Evaluate whether targeted lazy mounting, section-level deferral, or reduced always-rendered dense content would improve scroll smoothness without hiding expected MVP sheet data.
4. If profiling points at route/module update cost instead of paint, coordinate with `p1-045` rather than duplicating projection or patch extraction work here.
5. Re-run desktop and phone-sized manual scroll checks plus the relevant local verification from [docs/verification.md](verification.md).

Definition of done:

- fast scrolling the dense 5e sheet regions is visibly smoother on desktop and phone-sized viewports
- profiling shows a concrete improvement rather than only a code-shape cleanup
- visual layout remains at least as good as the measured layout restored after the reverted CSS auto-fit attempt
- any broader refactor discovered during the pass is linked to `p1-045` or `p1-050` instead of folded into this item

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

1. Extract static 5e sheet metadata and options: ability metadata, skill metadata, spell slot metadata, runtime action options, inventory tags, and roleplay note metadata.
2. Extract pure projection builders for current sheet surfaces: overview, quick reference, abilities/proficiencies/features/traits, runtime actions, spells, inventory, and organizational notes.
3. Extract patch normalization helpers for virtual paths: runtime actions, spell levels, proficiency languages, class features, inventory groups/currency, and organizational notes.
4. Add focused tests around projection and patch helpers once `p0-030` test tooling exists.
5. Leave [+page.svelte](../src/routes/charsheets/5e/+page.svelte) as mostly layout/orchestration and verify no user-visible behavior changed.

Definition of done:

- [+page.svelte](../src/routes/charsheets/5e/+page.svelte) no longer owns most 5e-specific projection or patch normalization logic
- virtual path handling has a clearer feature-local home
- extracted helpers are easier to test and reuse
- existing sheet editing behavior remains unchanged
- relevant local verification from [docs/verification.md](verification.md) passes

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
- evaluate a Svelte-compatible form library such as TanStack Form or Felte after the first field-binding proof surface lands; prefer reuse for draft state, validation display, dirty tracking, and array editor ergonomics if it keeps local source smaller than custom form infrastructure

## Done Recently

- split the docs between the active MVP working set and long-term vision docs
- established [AGENTS.md](../AGENTS.md) as the shortest AI-facing entry point
- completed the `Add real character management` backlog item
- completed the [src/lib/](../src/lib/) grid cleanup backlog
- completed `p0-010`: the 5e sheet now exposes the major MVP runtime and organizational sections, including seeded runtime action data, with check/lint/build passing
- completed the focused `p0-040` scroll-performance pass: reduced hidden dialog DOM, simplified hover/paint costs, removed broad `GridContainerAuto` mutation observation, and moved residual jank follow-up to `p1-025`
- completed `p0-020`: JSON backup/restore supports a versioned export envelope, file download, import file selection, import validation, replace-all import, and merge-new import that skips duplicate character IDs
- completed home action button polish: shared button chrome now aligns Create, Import, Export, and import apply actions consistently
- completed `p0-030`: local automated verification now includes Vitest tooling, schema/import-export/storage contract tests, a create/edit/reload smoke path, V8 coverage reporting, shared browser test scaffolding, and [docs/verification.md](verification.md)
- completed `p1-040`: field-level binding now uses an RFC 6902 JSON Patch contract, `immutable-json-patch` verification, split value/annotation patch projection, `FieldDraft`, a Current HP runtime proof surface, and documented field/page/store responsibility boundaries
- completed the behavioral `p1-030` field interaction pass: runtime/state primitives have persistent direct edit controls, field annotations are accessible through explicit Notes affordances, card-wide Edit remains a value/structure fallback, and card Notes dialogs now handle annotation review/add/edit flows
- completed `p1-035`: surfaced runtime/state primitive fields now render through descriptor-driven `GridContent` cards and the shared primitive renderer, the route no longer composes adjacent standalone `InlineFieldDraft` blocks beside migrated cards, card-wide Edit remains comprehensive for value/structure fallback, and Notes remains the annotation review/add/edit surface
