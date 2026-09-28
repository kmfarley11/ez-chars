## Why

The read-first sheet is useful during play, but changing one value can still require opening and navigating a broad record or group form. BL-085 makes the edit follow the player's immediate intention: reach the relevant field, change it, explicitly save it, and continue playing without managing unrelated fields or an accumulating dialog-wide draft.

## Non-Goals

- Global sheet Edit mode, general section-wide forms, hidden autosave, or multiple simultaneous unsaved editors within one focused surface.
- Turning read-first sheet content into persistent inline forms, broadly redesigning established Tier 1 runtime controls, or reintroducing collection-wide editing. The owner-requested comparison of spell-slot Used/Max as read-first information is a bounded exception; other runtime values keep their classification.
- Rules-legality enforcement, new calculated statistics, a backend, schema migration, or a universal cross-system field model.
- Expanding record-removal eligibility, changing note attachment/reference storage, a character-wide notes index, or collection filtering and priority redesign.
- Replacing coherent new-record creation with partially persisted records.

## What Changes

- Make the intended read-first field easy to reach without searching unrelated dialog content. Retain group entry where a small coherent detail view makes its fields readily apparent; add targeted entry where it materially reduces navigation, without mandating a separate sheet button for every leaf.
- Replace broad existing-target Edit sessions with directly activatable field-local editors and explicit local Save/Cancel. Permit a small coupled editor only when the values form one meaningful edit, not merely because they share a card.
- Change the save boundary: each deliberate edit commits independently; cancelling a later edit or closing Detail does not undo earlier saves. A focused view has no additional outer Save.
- Preserve atomic validation for each requested edit against the resulting character, with actionable local errors and no partial mutation on failure.
- Keep one active editor per focused surface and protect dirty work when switching targets or leaving. Preserve reading context, focus return, phone scroll ownership, and stable runtime geometry.
- Make existing notes directly readable and individually editable; offer compact Add note for empty eligible targets. Editing a note does not put the entire record into edit mode.
- Restrict Clear/Remove to eligible optional information, notes, and removable records. Required values remain editable rather than deletable.
- Keep authored, derived, and unavailable information distinguishable by available actions. Use optional accessible explanations for genuinely calculated values rather than mandatory visible Calculated labels; semantic badges do not determine editability.
- Permit correcting a recorded spell's level without removing and recreating the spell or losing its notes and priority. This changes the stored spell level, not casting or upcasting behavior.

## Capabilities

### New Capabilities

None. This refines the existing interaction language.

### Modified Capabilities

- `character-sheet-editing`: Small explicit edit transactions, targeted detail entry, dirty-work protection, local validation feedback, on-demand note operations, and eligibility-aware controls replace the whole-focused-session save contract.
- `dense-collection-interaction`: Record detail adopts independent field and note edits while preserving collection context, record identity, Add, eligible Remove, Pin/Unpin, and specialized source commands.

## Impact

The shared field, focused-detail, note, and structured-editing surfaces and their 2014 domain adapters are affected. Existing-target save behavior changes deliberately; persisted character shapes and established record-creation semantics do not. No new dependency is planned.

This is a full OpenSpec change because it modifies interacting behavioral contracts across the shared editor and real sheet compositions. The existing three-tier interaction decision requires an amendment when the proof is accepted. Production-backed human review must establish field reachability, save comprehension, and repeated-edit ergonomics before broad rollout. That gate includes a provisional whole-sheet composition with representative revised regions beside unchanged content, using sparse and saturated data to assess cumulative visual/action density rather than relying only on isolated components. Automated checks must preserve validation, identity, and unrelated data.
