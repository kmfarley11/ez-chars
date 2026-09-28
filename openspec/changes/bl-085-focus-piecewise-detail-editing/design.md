## Context

BL-077 established a successful read-first sheet and shared Tier 1 runtime controls. Its focused workflows still switch whole groups or records into `StructuredForm`, collecting authored values and annotations into an outer Save. BL-085 initially proposed retaining that transaction while compacting the form. Owner refinement rejected that default: a readable group can contain many fields, but a runtime edit should involve only the field the player intended to change.

Current seams to extend rather than bypass:

- `src/lib/components/FieldGroupView.svelte`, `GridPrimitiveField.svelte`, and `GridRuntimeFieldGroup.svelte` own shared rendering and runtime geometry.
- `GridContentDetailWorkflow.svelte`, `GridRecordDetailWorkflow.svelte`, `FocusedDetailWorkflow.svelte`, and `DialogShell.svelte` own focused composition, drafts, navigation, and modal behavior.
- `StructuredForm.svelte` provides input types and compound creation; its repeated leaf markup is not a reason to introduce another parallel editor implementation.
- `FieldAnnotationControl.svelte`, `GridContentAnnotationsDisplay.svelte`, and `GridContentAnnotationsEditor.svelte` own existing note/reference presentation.
- The 2014 `sheetProjections.ts`, `sheetEditDecoder.ts`, `sheetEditIntents.ts`, and collection editing adapters own writable targets, identity resolution, and candidate validation. The reducer already validates the complete candidate character. Several collection adapters currently construct full record payloads: using a stale payload for a one-field save would overwrite neighboring values.
- Ability Modifier and Proficiency Bonus are authored today. A plausible game formula is not evidence that a displayed field is computed.

The active interaction and binding documentation and the approved three-tier ADR remain the shipped baseline until implementation reconciles them. This design proposes changing the edit boundary, not weakening atomicity or introducing a storage version.

## Goals / Non-Goals

**Goals:** Reach the intended field without searching unrelated dialog content; edit and explicitly save a small target; retain safe validation and local-first persistence; make notes independently maintainable; carry the approved behavior in shared components with real production compositions.

**Non-Goals:** See `proposal.md`. In particular, do not expand rules automation, broadly redesign Tier 1 (the requested spell-slot comparison is the bounded exception), create a schema-driven universal sheet renderer, add a backend, expose unsupported fields just for completeness, or retrofit collection filtering/Runtime Action priority owned by BL-078. Record creation and specialized source-selection/resync remain coherent explicit workflows.

## Decisions

### Accepted rollout — 2026-09-27 approval, 2026-09-28 reconciliation

The owner explicitly approved the proof as presented: underlined label entry, persistent selected-field highlighting, independent field/note saves, compact read-first Used/Max slot pairs, and centered supporting-collection glyphs. Existing group/record chevrons remain; their proposed removal was not adopted. Comparison controls remain available in existing stories, not as production URL modes. The normal sheet now uses the accepted flow without a proof flag or coverage banner. Final integrated approval is still separate.

The shared dialog coordinates scalar/note drafts and bounded lifecycle operations; domain models supply fields and allowed commands. Existing collection creation and Runtime Action source selection/resync retain their specialized adapters. Draft reference preview is a reversible step within the same modal and preserves the active draft; navigation that replaces editing context still resolves dirty work first. Legacy workflows remain available for standalone consumers without a small-edit scope but are not mounted behind migrated sheet content.

Classes have no IDs in v0: guard the class-array snapshot for the entire focused session, update that guard only after this session's accepted commits, and reject external class changes rather than guessing identity from names or shifting indices. A session-local structure revision also invalidates previously captured field/action handles after its own Add/Remove, including pending Save-and-continue destinations. Add Class remains a coherent name/level creation operation; confirmed removal reconciles positional field-note attachments and class-owned feature priority/source links. Scratchpad edits resolve stable note IDs, with explicit Add and confirmed Remove. Roleplay pseudo-paths are translated by the domain adapter; saving empty text preserves attached notes instead of silently deleting the whole owner.

The theme-mode/checkbox-color observation is deferred in the backlog Ideation Sandbox, not added to rollout scope.

### 1. The transaction follows the edit, not the containing Detail view

Default to one field or one note as the active draft. A small set of genuinely coupled values may share a draft when independent saves would be invalid or misleading. One to five fields is a human-review heuristic, not an automatic grouping rule or a hard schema limit. Mere shared card ownership never justifies grouping. Do not invent cross-field constraints that the schema/domain does not enforce.

The focused surface has no global Edit mode or outer Save for existing content. Local Save validates and commits only the active edit; local Cancel returns that region to reading and discards only its draft. Earlier explicitly saved operations remain persisted after later cancellation or closing. New-record Add retains one creation draft and one final commit; do not partially persist records while filling creation fields.

Alternative rejected: selective expansion inside a target-wide draft. It reduces visible form controls but retains accumulated unsaved work, long-form navigation, and an ambiguous outer Save. Immediate onchange/blur autosave is also rejected.

### 2. One active editor per focused surface, with explicit dirty-work resolution

Keep the surrounding Detail readable, with only the selected editor expanded. Use existing compact Save/Cancel icon controls and accessible names. Boolean editors use clear field-specific checkbox labels, not repeated generic Enabled labels. Saving a boolean remains explicit; a checkbox must not silently persist merely because Pin/Unpin and existing Prepared shortcuts are immediate commands.

Suggested state model:

```text
Reading → Edit field/note → local draft
                              ├─ Save valid → Reading (committed)
                              ├─ Save invalid → same draft + error
                              └─ Cancel → Reading (unchanged by this edit)

Dirty draft + switch/Close/Back/Escape
    → inline resolution: Save and continue / Discard and continue / Keep editing
```

A clean editor can leave without a prompt. An explicitly activated local Cancel discards directly; indirect navigation must not silently discard. Failed Save and continue stays on the active editor. This protection covers in-app workflow navigation and modal dismissal, not guaranteed draft recovery after browser termination/reload. Use the existing logical surface for resolution, not a nested confirmation modal. Preserve reference inspection/return context; source actions that would replace the current edited content must resolve dirty work first.

After local Save/Cancel, restore focus to that field/note's control and keep scroll context. After removal, use the nearest surviving appropriate control. Outer Close returns to the original sheet/collection invoker. Pinning, sorting, or filtering must not redirect an edit to a different record.

### 3. Require field reachability, not a button beside every leaf

Separate sheet navigation density from editing granularity inside Detail. Default to the existing single group entry when a small coherent detail view makes its fields and local Edit controls readily apparent. This does not couple their saves. Judge that sufficiency using actual phone composition and content length, not an automatic field-count threshold.

Where group-only entry makes the player search unrelated content, offer a targeted path for the individually displayed field. Reuse the same focused surface with a stable field target; once rendered, reveal it and focus its named control/heading without automatically entering edit mode. Do not turn the entire text row into a hidden click target or add persistent Save/Cancel to the sheet.

Compare two restrained presentations only where targeting is useful: the existing field label as a subtly styled, explicitly recognizable detail control, or a selective compact chevron where a label control is unclear. Opening a dialog uses button semantics even if the control looks like quiet text; a real navigation destination uses a link. Label controls need visible interaction cues, focus treatment, and touch operation while neighboring values remain selectable. They still add keyboard stops and touch targets, so eliminating icons is not sufficient proof of improved ergonomics. Do not rely on hover-only controls, long press, or invisible clickability.

Retain group overview access without automatically duplicating it with a leaf icon on every row. A collection row continues to open its selected record; no new per-property controls are mandated in its scan-first presentation. Do not build a second dialog search index as a workaround for poor targeting. The independent small-edit save contract is fixed; the least obstructive entry presentation is what the human proof settles.

**2026-09-27 proof refinement:** The owner selected underlined label entry; it is now the proof default (`entry=label`). The bordered alternative remains available as `entry=button`, alongside chevron/group comparisons. Eligible canonical scalar labels use the same entry grammar across nested Score/Modifier summaries, all six Save rows, Proficiency Bonus, and other supported read-first groups. Group `>` opens an overview; field entry reveals/focuses the selected field with a steady tinted background and leading border. The marker follows a deliberately activated local editor, does not fade on a timer, and never starts editing automatically. Group overview has no initial selected-field marker.

Collection names use the same label-button alongside the existing `>` and invoke the same record callback; Pin, badges, and selectable detail text stay outside the target. This entry-only proof includes inventory/supporting rows and Runtime Actions whose internal editing remains unmigrated. Keep group overview access while label entry becomes primary. Full-row activation is not selected: rows contain independent commands, and pointer-only cues do not establish touch discoverability. `DetailLabelButton` composes `BaseButton` for shared focus/touch behavior instead of inventing another button primitive. Character Name can open a one-field canonical model when its wider group includes the not-yet-migrated Class Levels array. Class Levels opens the existing editor; do not treat positional array indices as durable identity. The proof banner documents coverage and unmigrated dialogs display an explicit notice. Their eventual confirmed Remove action belongs below detail fields, as in the spell proof, not alongside Close.

**Spellcasting comparison:** Flatten the summary into the shared responsive field grid (Ability, Save DC, Attack Bonus), not slash-separated prose. Trial each slot level as read-first Used/Max in a small shared `GridContentCard`, with label targeting and independent saves. `slots=runtime` on the sheet or `readFirstSlots=false` in the existing story restores the established layout for comparison. Other Tier 1 controls remain unchanged; adoption waits for task 2.1. A targeted slot intent initializes only the selected missing pair and preserves annotated zero levels and unrelated slots; the older bulk replacement's pruning semantics are inappropriate here. Spell Level uses the stable-ID spell adapter and a separate destination level while the current level still guards the target; validate 0–9, retain notes/pins, and never interpret this as an upcast action.

### 4. Share presentation; preserve domain-owned mutations

**Compact-pair proof refinement:** Spell-slot levels reuse the existing nested labeled-value presentation used by Score/Modifier (`1st: 1 Used / 4 Max`), retaining child bindings, targeted reveal, and note indicators. This is presentation metadata passed through `GridContentCard`/`FieldGroupView`, not a new spell-only renderer or component family. `IconPrefixedListItem` offers centered alignment for supporting-collection headings containing taller label controls while retaining first-line alignment for prose. Duplicate record chevron removal remains a recommendation pending owner choice; current group overview and record entry controls are retained.

Extend the existing projection/capability and binding seams only as needed to describe local editable targets, optional clearing, coupled units, and selected-entry identity. Do not persist UI metadata. Reuse the common field/input/action rendering from Tier 1 where appropriate inside Detail without reclassifying those fields as sheet-level runtime values. Extract duplicated input presentation from the current structured form if needed; retain its useful creation/coupled form behavior.

Coordinate one active draft and focus in the shared focused workflow; keep the selected value/note identity, allowed mutations, and candidate construction in domain adapters. A collection one-field edit resolves the latest record by stable ID, merges only the deliberate changed property into current data, and then uses the existing typed reducer. Generic code must not infer a writable path from a display label or invent annotation attachment paths.

Validation has two layers: immediate local feedback for parse/field problems, and authoritative domain/full-character validation before commit. Preserve raw numeric drafts so invalid/empty input is not silently converted to zero. Return actionable errors to the relevant editor; preserve a summary for cross-field failures that cannot be attached to that leaf. Do not replace useful issues with only a console warning or a generic failed-save message.

Apply against current state, preserving unrelated properties, annotations, ordering, and IDs. If the selected field/note changed or disappeared while editing, reject stale work with recoverable feedback rather than overwrite or recreate it. Reuse existing guarded patches and stable-ID resolution; this is a local stale-target safeguard, not a multiplayer conflict system. Keep full-character validation at explicit Save, not per keystroke across the whole document.

### 5. Notes are small independent edits; removal respects ownership

Existing note counts open the relevant notes for reading, not a wall of textareas. Add note starts one note draft; editing an existing note affects only it. Name/text/reference/tag fields belonging to that note can be one cohesive editor. Keep user-facing Note/Notes wording, quiet target-local counts, and source inspection. Empty eligible targets expose compact Add note inside focused context, with no reserved empty section. Tier 1 retains its existing compact sheet affordance; its note surface adopts the same focused note behavior.

For the proof, existing-note removal is a local staged operation with Undo before its explicit confirmation/Save, not an outer record Save. Cancelling creation simply discards the unsaved note. Merge the selected note operation into the latest annotation collection by identity, preserving untouched entries and existing storage shapes.

Required values have no Delete. Optional Clear is a named deliberate edit which preserves absence rather than substituting zero/false; the adapter decides whether the stored optional value can safely be removed. Clearing a value does not implicitly delete its attached notes. Existing record removal remains confirmed and ownership-aware, including current ancestry-trait restrictions. No generic delete-every-leaf API is implied.

### 6. Read-only context stays readable and compact

Editability comes from capabilities and writable domain targets, not badge styling or whether a value appears mathematically derivable. Keep computed values readable rather than disabled-looking. Where explanation is useful, provide supplemental calculated/source context reachable through pointer, keyboard, and touch; avoid a permanent Calculated badge and do not rely solely on hover/native title. Reuse an existing suitable disclosure primitive or add the smallest accessible one only if necessary. Do not invent computed fields to demonstrate it: a shared component fixture can cover derived/unavailable states when production has no representative case.

### 7. Production-backed proof before propagation

Use the smallest existing story set, listed in `verify.md`, to exercise the actual shared changes with real domain reducers: abilities/proficiencies, mixed prose/value read-first content, spells/collection records, and a Tier 1 counterexample. Reuse viewports and manual interactions rather than creating action-specific stories. A small additional fixture is justified for a truly missing derived/coupled/error case, not as an all-in-one bespoke replica.

Before the gate, also expose a provisional whole-sheet composition through an existing suitable sandbox or an explicit review-only app opt-in. Reuse actual sheet layout and shared components; do not copy the route into a parallel proof renderer. Wire representative revised regions (abilities, quick reference, prose, and spells) beside unchanged content so their cumulative affordance cost is visible. The pre-gate proof need not finish every domain adapter, but it must show realistic repetition and surrounding navigation/Rules controls; record coverage limits rather than claiming the whole sheet is migrated. Sparse and saturated fixtures may share controls in one sandbox. A new whole-sheet sandbox is justified only if no existing review surface can represent this materially distinct composition.

The named mid-apply gate is **Focused editing and save-boundary approval**. It requires both isolated interaction evidence and whole-sheet review, not one in place of the other. The owner first scans without interacting to judge reading hierarchy, icon/border repetition, spacing, and action density; then performs a single-field edit and several proficiency edits to test whether visual restraint costs too much navigation. Repeat with sparse and saturated data, narrow phones, and desktop, including keyboard-stop burden and coarse-pointer target expansion. Also assess local Save/Cancel comprehension, dirty navigation, and notes. Until approved, default production behavior and broad adapter propagation wait; any app-based review uses an explicit provisional opt-in. Remove temporary opt-ins once the accepted rollout is complete.

After rollout, require another explicit integrated-sheet review. Passing the isolated proof or automated tests is not that approval.

### 8. Testing and durable decisions

Use Vitest for state transitions, minimal mutation units, preservation/stale-target cases, and validation. Keep Playwright black-box app tests for save A/cancel B, targeted navigation, focus/dirty guards, notes, reload, backup round trips, and geometry. No Storybook play functions. Inject deterministic ID factories using the existing reducer option or mock the existing ID helper for note/component tests. Freeze clocks only where assertions depend on timestamps; no new random or timed behavior is required.

Amend `docs/decisions/2026-09-12-use-three-tier-read-first-sheet-interactions.md` after proof acceptance, preserving the old rule as history and explicitly replacing its operative target-wide-draft statement. Update `docs/field-interaction-model.md` and `docs/field-binding-contract.md` during rollout. No new dependency or standalone ADR is expected.

## Risks / Trade-offs

- Repeated local Save may slow proficiency maintenance → time the human task qualitatively against the old form; adjust compact control/focus flow at the gate, not by quietly restoring whole-card transactions.
- Leaf entry affordances may crowd the whole sheet even when each card looks fine → prefer group entry where sufficient, compare restrained targeted alternatives where needed, and require a pre-rollout whole-sheet scan plus runtime-task review. Preserve the coarse-pointer 44px policy, visible discoverability, selectable values, and manageable keyboard navigation.
- Full record adapters can overwrite untouched values → merge only the edited unit into the latest stable-ID target; test unexposed fields and notes explicitly.
- Replacing a note array can erase neighboring note edits → resolve current notes at commit and apply only the selected note operation.
- Selected-entry scrolling/focus can jump during rerenders → key by stable target, reveal once on entry, and avoid resetting drafts or scrolling on every projection update.
- More granular edits alter cancellation expectations → no outer Cancel/Save, local action labels, and explicit save-A/cancel-B proof.
- Existing specialized workflows and old specs have historical wording → reconcile requirements directly affected by this change; do not use BL-085 to redesign source creation/resync or dormant batch pin management.

## Migration Plan

No persisted-data migration. First audit current consumers and mutation paths; implement shared proof behavior provisionally; stop for the named gate; then propagate by interaction family and amend the ADR/docs. Re-run relevant verification and stop for integrated owner approval. Archive only afterward, syncing both capability deltas and reconciling the backlog.

Before rollout, abandoning the proof only removes provisional behavior. After rollout, reverting UI code must not pretend to roll back already saved character values; independent committed edits are normal valid character data.

## Open Questions

The original proof questions below are retained as history; the accepted rollout section above records their resolution. None blocks implementation. Final integrated review may still identify ergonomic adjustments:

- Which groups are already readily reachable through one group entry, and where does targeted access materially help? For the latter, do recognizable label controls or selective chevrons best balance discovery, visual density, touch targets, and keyboard stops in the full sheet?
- Are repeated proficiency Edit/Save operations fast enough, and where should focus land to make the next edit convenient without unexpected auto-activation?
- Which existing domain cases actually require a coupled editor? Inventory during task 1.1; propose no grouping merely for layout convenience. If none do, retain the extension seam and test contract without adding a production exception.
- Does local note removal with Undo and explicit confirmation remain understandable and compact? Keep protection against accidental loss even if presentation changes at review.

Deferred work discovered during proof or rollout must be reconciled into `docs/backlog.md`, not left only here or in `verify.md`.
