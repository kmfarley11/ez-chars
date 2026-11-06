## Context

BL-089 extends the approved runtime-first interaction language, not the persisted schemas. [Author intent](../../../../docs/vision/author-desires.md) favors fast, mobile-friendly authorship while keeping edition semantics system-owned.

Pre-change audit evidence (retained as design context; rollout outcome below):

- `src/lib/ui/molecules/grid-primitive-field.svelte` supports number/string drafts, but its runtime branch always uses a narrow single-line input and number-oriented value typography. Its textarea currently exists only in the legacy focused edit branch.
- `src/lib/utils/gridContentHelpers.ts` explicitly excludes booleans from direct primitive editing. `gridContentTypes.ts` and the system projections need an explicit input-kind/presence contract: an absent boolean cannot be classified from its value, nor safely treated as an empty string.
- `grid-primitive-field-story.svelte` supports number/text Controls, but the named text `QuietAffordance` story selects read-first mode. The catalog does not yet honestly prove boolean or multiline Tier 1 behavior.
- `src/lib/systems/dnd5e-2014/sheet-projections.ts` puts optional `combat.inspiration` in Reference stats with a false display fallback. The 2024 `sheet-fields.ts` classifies `heroicInspiration` and multiline `conditions` as read-first; `sheet-projections.ts` already includes both in Live state.
- Both editions use `src/lib/ui/organisms/quick-reference.svelte`. Each retains its own validation and edit adapters. The 2024 runtime patch entry requires one eligible field write; its current projection otherwise maps non-number inputs to text. Both production Pages already throw when their session rejects a save, the card forwards the callback, and `GridPrimitiveField` catches the error. A void return type is not evidence that rejection is swallowed.
- `src/lib/ui/molecules/field-group-view.svelte` separately excludes `displayAs: 'checkbox'` from primitive routing. Changing eligibility helpers alone will not make those fields editable.
- Existing 2014 adapter tests locate Inspiration in Reference stats. Relocation must update those assertions without losing boolean type-rejection or note coverage.

## Goals / Non-Goals

**Goals:** Reusable, type-appropriate Tier 1 boolean/text controls; equal treatment of both editions' Inspiration; inline 2024 Conditions; preservation of notes, optional values and focused-edit alternatives; minimal phone layout disruption.

**Non-Goals:** The proposal's exclusions apply. In particular, 2014 Conditions remains an array and is not coerced into a string. No global field reclassification, condition chips/catalog, schema change, or new package is needed. BL-088 remains the separate read-first ergonomics effort.

## Decisions

### 1. Extend the shared runtime field family, not the sheets

Extend `GridPrimitiveField` and its eligibility/type contracts, extracting small shared helpers only where they simplify the implementation. Keep runtime selection explicit; read-first booleans, proficiency indicators, and ordinary string fields do not become directly editable because of their types. Preserve the existing numeric branch and its layout defaults.

Use explicit `inputKind: 'boolean'` alongside the existing number/text kinds; retain `multiline` for text. For the new controls, projections derive `binding.valuePatchOperation` from actual source presence (`add` when absent, `replace` when present), never from a false/empty display fallback. Keep `field.value` as the typed value when present, or a presentation-only false/empty fallback when absent; snapshot presence and initial value at edit start (at activation for an immediate boolean). This avoids widening every grid value to undefined or adding a second persisted presence model. Update `FieldGroupView` routing for explicitly runtime booleans while preserving read-only checkbox/status rendering elsewhere. Focused-model kind inference must also honor the explicit boolean kind when entered through notes/context.

Use native input/textarea semantics and existing `IconButton` and `FieldAnnotationControl` affordances. `readonly-checkbox.svelte` is a display primitive, not an interactive checkbox. Do not attach editing behavior to it. A small reusable interactive checkbox atom is justified only if it owns shared accessibility/target behavior rather than wrapping an input for taxonomy alone.

Alternative rejected: sheet-local Inspiration/Conditions controls. That would repeat save, notes, layout, and keyboard behavior across systems. A universal field renderer redesign is unnecessary.

### 2. Boolean activation is one validated command

Use a labeled checkbox with a conforming touch target. Pointer activation or Space issues one typed boolean save through the owning system's validated path. No intermediate pencil, Save/Cancel row, confirmation dialog, or autosave-on-render. Retain control focus after success. On failure, restore the committed checked state, keep focus, and announce a nearby error. A second intentional activation reverses a saved true/false value; do not introduce global undo.

Optional flags remain optional. An absent value renders unchecked, with an accessible description identifying it as not recorded; first activation explicitly records true. Distinguish presence from the displayed checked value, choose add versus replace from actual data, and never serialize false simply because a checkbox mounted. Preserve existing optional-clearing access through Detail where available; do not add a three-state cycling checkbox.

Preserve the existing synchronous save contract through `QuickReference`, card/display routing and system handlers: production rejection throws and the shared control catches it; retain support for explicit false rejection where an existing host uses it. Successful return follows validated acceptance, not an optimistic write. Do not introduce a new result framework merely to replace void callback types. Confirm the complete wrapper chain with rejection tests, including a missing save handler that must not report a successful edit.

Apply this state matrix to the new boolean/text controls before implementing their UI:

| Initial source state | User action                               | Save intent / outcome                                                                                 |
| -------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Missing boolean      | View only                                 | Unchecked, described as unrecorded; no write                                                          |
| Missing boolean      | Activate                                  | Add typed true only if still absent                                                                   |
| Present false/true   | Activate                                  | Replace with opposite boolean, checking original value                                                |
| Missing text         | Cancel or Save unchanged empty draft      | No write; remains absent                                                                              |
| Missing text         | Author text and Save                      | Add text only if still absent                                                                         |
| Present text         | Save changed text, including empty string | Replace after original-value check; empty remains authored                                            |
| Any state            | Save rejected                             | No candidate committed; boolean reflects current committed state, text retains draft, error announced |

For existing leaves, reuse original-value checks in the draft/patch helpers. For an originally absent new runtime boolean/text field, enforce an absence precondition at the owning runtime save boundary before applying its add. RFC JSON Patch object-member add can overwrite an existing value, and `FieldDraft` currently emits add without a test; schema validation alone does not detect that stale save. Reject if the field has become present, preserving the newer value and the local text draft. Scope this guard to the newly supported runtime fields; do not redefine general JSON Patch add behavior or broaden numeric editing in this change. Both adapters continue validating the complete candidate. Tests must distinguish this conflict from ordinary schema rejection.

### 3. Text keeps an explicit local draft

Single-line text uses a text-sized value presentation and available-width input, not the numeric maximum width. Following the 2026-10-31 proof feedback, multiline text uses content-sized read/edit surfaces with matching width, padding, line height and wrapping, capped at 12rem with internal scrolling. A hidden, accessibility-excluded CSS grid mirror sizes the textarea as text changes or the containing column narrows; no per-keystroke layout measurement or resize observer is needed. Read mode retains selectable text and keyboard scrolling; explicit and trailing line breaks occupy the same space in both modes. This replaces the initial two-row editor that shrank three-line values on entry. Existing Detail remains available via the established notes/context path when useful.

Pencil starts editing; Save commits one field, Cancel/Escape discards only that draft. Enter saves single-line text unless an IME composition is active; Enter inserts a newline for multiline text. Use explicit Save for multiline rather than adding a shortcut requirement. Do not save on blur. Preserve the draft on rejection and return focus to the pencil on Save/Cancel. Notes remain independent; follow the existing Tier 1 pattern of requiring Save/Cancel before opening notes while editing, rather than introducing nested or competing drafts.

Opening/cancelling an absent text field must not create an empty persisted field. Explicitly clearing previously authored Conditions saves an empty string through its current optional-string contract; it does not delete notes or invent a condition-list conversion. Stable allocated width, mobile font sizing, and bounded editing height matter more than forcing long prose into a numeric tile. The human proof decides whether any bounded height change is acceptable.

### 4. Edition-owned classification and relocation only

- 2014: remove Inspiration from `quickRefReferenceData` and add it to `quickRefLiveData`, after the existing runtime counters. Keep `systemData.combat.inspiration` and its annotation path unchanged.
- 2024: classify Heroic Inspiration and Conditions as runtime in `sheet-fields.ts`; retain their positions below death-save values in Live state, edition labels, and persisted paths. Correct projection of input kind and optional presence rather than relying on value coercion.
- Do not reorder unrelated sections, change default collapse behavior, or combine the editions' schemas. Continue full-candidate validation and independent field commits in each adapter.

### 5. Proof before normal-sheet propagation

First extend the existing Tier 1 story with honest boolean, short-text, and multiline fixtures and an explicit numeric regression case. Reuse fixtures/Controls for absent/false/true, notes, long values, rejection and viewport changes; create a new sandbox only where the state cannot be usefully reached in the existing one. Use static stories, never play functions.

Default to one temporary, non-persisted `runtimeTypeProof` option on each production Page, exposed as a Control in the existing canonical stories. Thread it through the edition projection and corresponding runtime eligibility where needed; reuse the same save adapters, not story-owned mutations or copied sheets. Normal routes omit it and keep the old classifications until approval. If pre-gate phone/persistence review requires the app, map a temporary `runtimeTypeProof=1` query to that same option rather than creating another proof mechanism. Clearly label proof mode; document exact launch details in verify.md. Remove the option and any query support after approval. New shared branches must leave existing numeric presentation unchanged pre-gate.

The human gate reviews checkbox immediacy, optional-state clarity, notes discoverability, text density, mobile read/edit geometry, and both Inspiration placements. Approval unlocks default classification/relocation and removal of temporary proof scaffolding. A supplemental [verify.md](verify.md) owns concise story callouts, interactions, recorded findings, and evidence; tasks own completion state.

## Risks / Trade-offs

- Accidental flag toggles → Clear label/checked state, native keyboard behavior, touch target spacing, and a directly reversible second activation; assess in the proof.
- False success or stale checked display → Explicit rejection propagation and tests through the actual system adapters, including an absent leaf and a conflicting edit.
- Missing values coerced to false/empty strings → Separate raw presence from presentation and assert no writes on render, cancel or unchanged text save.
- Long Conditions takes too much sheet space → Bounded editor, wrapping read text and phone/saturated proof; no condition restructuring in this change.
- Text entry breaks IME/newlines or mobile focus → Type-specific Enter behavior, existing mobile typography, and keyboard/touch verification.
- Broad boolean eligibility activates proficiency controls → Require explicit runtime metadata; test adjacent read-first booleans unchanged.
- Proof hides rollout mismatches → Use both production Pages and adapters before approval, then verify ordinary routes after the flag is removed.

## Migration Plan

No data migration or schema-version change. Existing values and notes remain at the same paths. After proof approval, enable the new field classifications and move the 2014 presentation. Rollback restores classifications/layout without rewriting stored data. Do not leave a long-lived parallel editor or proof flag.

## Approval / Rollout Outcome

The owner explicitly approved task 2.1 on 2026-10-31 after rounded checkbox and content-sized multiline refinements. The ordinary sheets now use those shared controls; temporary Page/query options and proof banners are removed. Edition metadata owns runtime selection, and runtime boolean/text saves retain presence/type/conflict guards outside any proof flag. Existing numeric-only grouped saves are unchanged. Final ordinary-route review was approved on 2026-11-06, including the bounded closure refinements below and archival.

The final review identified a smaller read-state minimum height for single-line text on phones. Reuse the existing runtime-value sizing rule so short text and its input share the 44px mobile minimum; this does not change multiline sizing or field activation. Split the long recovery, creation and Inspiration browser journeys into independently seeded tests so each retains a meaningful scope within the existing time budget. Preserve all assertions, default concurrency and timeouts; do not add retries to conceal failures.

No presentation decision remains unresolved for this rollout. Broader Tier 1 label/value activation is captured in BL-088; optional 2014 Conditions UI is captured in the existing sheet-coverage ideation entry in the backlog. Neither is included here.

If feedback changes value-save ownership, optional-value semantics, or schema shape, stop and revise the plan before rollout. No new ADR is currently triggered: these are type-specific applications of existing shared UI/system-owned validation boundaries, not a replacement architecture.
