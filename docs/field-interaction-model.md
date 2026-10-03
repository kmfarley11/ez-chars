# Field Interaction Model

This document defines the current read-first interaction model for editing and annotations on the 5e character sheet. It should be read with [field-binding-contract.md](field-binding-contract.md), which defines mutation and validation ownership.

## Goals

- Keep the sheet dense, readable, selectable, and useful during play.
- Make frequently changing runtime values fast to update without making every value look editable.
- Give rich fields and records one predictable path from reading to editing.
- Keep annotations and source references attached to the specific field or record they describe.
- Use the same logical workflow for mouse, keyboard, and touch, with responsive presentation rather than separate behaviors.
- Keep validation, schema knowledge, persistence, and domain mutation outside generic presentation components.

## Safe Default

Missing interaction classification means **read-first**. A primitive type or writable path alone does not opt a value into inline editing.

Projection code explicitly classifies each target into one of three tiers or an intentionally specialized workflow:

1. Stable inline runtime editing
2. Read-first focused detail
3. Scan-first collection interaction

Domain-owned exceptions, such as Runtime Action source commands, remain specialized when collapsing them into a generic workflow would lose important semantics.

## Tier 1: Stable Inline Runtime Editing

Tier 1 is reserved for values that change repeatedly during play, including current and temporary HP, death saves, remaining hit dice, and carried currency.

- The read state stays compact and exposes a persistent Edit control.
- Editing replaces the value in the same stable geometry rather than opening another surface.
- Confirm and Cancel are explicit, compact, keyboard-focusable, and touch accessible.
- Enter may confirm a valid single-line edit; Escape cancels.
- Cancel emits no mutation and restores the prior display value.
- Saving uses the field's focused patch or typed intent and preserves unrelated character data.
- Annotations remain available through the field's focused annotation/detail path; inline runtime controls do not grow into a general rich-record editor.

Tier 1 is an explicit opt-in. Slowly changing profile data, long prose, rich records, and collections do not become inline editors simply because they contain primitive values.

The projection-owned `interaction.tier` value is the semantic source of truth for this choice. `editAffordance` only selects how an already classified target presents its control; it must not be used to infer Tier 1 behavior. A missing tier therefore remains read-first even when the field is writable or an older projection still supplies an edit-affordance hint.

Spell Slots deliberately uses the owner-approved read-first compact pair (`1st: 1 Used / 4 Max`) shared with Score/Modifier presentation. Each label opens its own selected field within the level's Detail; a targeted save preserves the sibling, unrelated levels, and annotated zero slots. This is a bounded density trade-off, not a reclassification of other runtime controls.

Alignment is a shared presentation option, independent of interaction tier. `displayAlign` defaults to left and propagates through field groups and primitive read/edit controls; the owner-approved BL-085 presentation centers spellcasting summary, compact slot pairs, Proficiency Bonus, and currency only. Runtime content centers within its value column, not underneath its separate trailing actions; that action column reserves room for both Save and Cancel on phones to avoid shifting the value when editing. Reverting a group's alignment does not change its mutation or focus behavior.

## Tier 2: Read-First Focused Detail

Tier 2 covers profile/background values and singular structured cards whose detail, provenance, references, or annotations deserve room to read.

- Sheet content remains selectable and copyable.
- An underlined label button opens the full detail and highlights the intended field without automatically editing. Collection names similarly open their record. Do not duplicate usable label entry with a group/field/record chevron; retain a fallback only when there is no usable label entry. Neighboring text remains selectable; whole rows are not hidden activation targets.
- Detail presents authored content first, followed by provenance/references and per-record annotations where present.
- Each eligible field or note has its own explicit Edit/Save/Cancel. Only one editor is active; there is no outer Save or whole-dialog rollback for existing data.
- Save validates one complete candidate and commits atomically. Validation failure commits nothing and keeps the draft available for correction.
- Cancel while editing returns to detail rather than dismissing the whole workflow.
- Dirty switching, Back, Close, or Escape offers Save and continue / Discard and continue / Keep editing in the same surface. Saved edits survive later cancellation. A source preview preserves a note draft while temporarily displaying the PDF in the same dialog.
- Removing an annotation from the draft remains undoable until Save.
- A field with no draft annotations shows one compact Add note action rather than an expanded zero-count editor; the full editor appears only after deliberate entry or when annotations already exist.
- Compact read-first primitives use the shared inline `Label: value` presentation by default. A section may explicitly request the shared stacked label-over-value variant when the additional emphasis is worth its vertical cost.

The focused workflow is not a global or section-wide edit mode. Each explicit Save validates the full candidate character but commits only the selected small edit. New-record creation retains one complete draft and final Add. The BL-085 proof and final integrated application review are approved; final approval was recorded on 2026-10-02.

## Tier 3: Scan-First Collections

Tier 3 covers repeatable collections such as equipment, spells, Features, Traits, Languages, Tools, and Runtime Actions.

- The sheet preserves compact browsing, search where density requires it, bounded scrolling, and useful saturation behavior.
- Add is a direct collection-level action that asks only for the initial authored data needed to create a record.
- Eligible records use their clickable name for Detail, with first-class Pin/Unpin as a separate action. A fallback Detail control remains only where name entry is unavailable.
- Detail opens the selected record through the Tier 2 view/edit workflow.
- Eligible Remove is scoped to the selected record, requires confirmation, and returns focus to a stable nearby destination after the record disappears.
- Pinning is immediate, preserves stable record identity, and may reorder the collection with a brief reduced-motion-aware transition.
- Row-level Pin/Unpin is the rollout priority path. The reusable batch manager remains dormant and may return only if playtest evidence shows repeated individual changes are materially slow.
- Metadata uses compact semantic badges; note count is record-local and appears last among metadata badges.

BL-078 extends row-level Pin/Unpin to Runtime Actions. Matching pins appear alphabetically first; remaining actions display by timing then name without rewriting stored sequence. Action pins survive source resync/detachment and are removed with the action itself. Spell pins remain globally alphabetical above level/name-ordered matches. The owner approved this default rollout and final integrated result on 2026-10-03.

Runtime Actions and Spells expose text search plus explicitly chosen quickfilters even in short populated lists. Shared toggle chips supply accessible selection and reset presentation; system-owned adapters supply vocabulary and filtering rather than deriving a taxonomy from badges. Timing or level selections combine as alternatives, while text and Prepared-only compose as additional restrictions. Independent resets preserve the other restrictions; only no-match recovery exposes Clear all. Preview, Browse, and Detail share temporary retrieval state, which resets for a fresh session or different character and never enters exported character data. Other collections retain their existing search/density behavior.

The current model does **not** provide collection-wide rich-record editing, a card-wide annotation editor, aggregate note counts, or a collection-wide annotation overview. Ordinary Edit/Notes overflow accelerators are removed once focused detail covers the same record. A specialized menu may remain for genuinely distinct commands, such as Runtime Action View Source and Resync.

## Focused Workflow Presentation

Desktop and phone use the same view/edit/back state model.

- Desktop uses a bounded detail surface.
- Phone uses a full-height surface with one scroll owner and no nested modal.
- Query and browse context remain intact while a record is inspected or edited.
- Local Cancel returns to reading. Back/Close resolves any dirty editor before returning to the collection or sheet; source Back restores the prior reading/editor position.
- Save, Cancel, Close, priority movement, and removal restore focus deterministically when the original trigger still exists, or to a stable equivalent such as Add or the reopened collection.

Generic presentation coordinates view/edit/back/focus behavior. Domain adapters continue to own the actual draft shape, validation, mutation intent, stable identity, and preservation of unexposed data.

## Annotations And References

The persisted and engineering model remains an annotation because an entry may include structured source context, but the player-facing UI calls these entries **Notes**. Buttons, headings, badges, accessible names, and validation messages should use Note/Notes consistently; implementation types, paths, and technical documentation may continue to use annotation.

- Annotation presence is a quiet record-local badge, not a collection-wide total.
- The actual annotation text is read in that field or record's focused detail.
- Per-field attachment is selective rather than an expectation that every value receives notes. `BL-081` will ask whether players find meaningful attachment points and can later rediscover notes; that evidence may trigger a coarser or cross-record discovery path.
- Each note is independently edited and saved, preserving other notes and the authored value. Note text, title, reference, and tags form one coherent note draft.
- Source/reference links remain readable before entering Edit.
- Annotation access cannot depend on hover or long-press.
- Removing a draft annotation is recoverable until Save; persisted annotations are unchanged by Cancel.

## Text Selection And Copy

Reading remains the primary sheet behavior outside Tier 1.

- Display text stays selectable and copyable for external lookup, notes, VTTs, and rules references.
- Long names, feature text, spell details, equipment descriptions, and notes favor explicit Detail/Edit controls rather than click-to-edit.
- Visible controls must not swallow drag selection, keyboard selection shortcuts, or copy behavior.
- Runtime values may favor faster editing because their repeated update need outweighs long-text selection needs.

## Mutation Boundary

- Primitive Tier 1 edits emit focused RFC 6902 patch intent where a direct binding is appropriate.
- Tier 2 and Tier 3 focused edits submit one selected value/note operation to a domain-owned adapter, which resolves the latest stable-ID record and rejects a changed or removed target.
- A domain adapter constructs and validates one candidate character before commit.
- Lifecycle and priority commands such as Add, confirmed Remove, Pin/Unpin, View Source, and Resync remain explicit commands outside the authored-content draft.
- Generic components do not infer schema ownership, synthesize 5e annotation paths, or persist data directly.

## Accessibility And Touch

- All Edit, Detail, Add, Pin/Unpin, Confirm, Cancel, Back, Close, and menu actions are keyboard focusable and have contextual accessible names.
- Touch actions do not rely on hover or long-press.
- Coarse-pointer controls inherit the repository touch-target policy.
- Validation feedback is associated with the affected editor and does not close the workflow.
- Focus returns to the invoking control or a deliberate stable fallback after dismissal or mutation.

## Manual Review Checklist

- Edit and cancel a Tier 1 runtime value without layout jump or mutation.
- Save a Tier 1 value with keyboard and touch-sized controls.
- Open a Tier 2 field by its label, save its value, then cancel a different value/note edit: only the explicit save persists. Try dirty switching and source preview/return.
- Remove and undo a draft annotation, then verify Cancel leaves persisted data unchanged.
- Add, inspect, edit, pin, unpin, and remove representative Tier 3 records while preserving search and scroll context.
- Confirm notes appear only on their own record and no collection-wide Edit/Notes surface competes with focused detail.
- Confirm Runtime Action source commands retain their distinct source semantics.
- Repeat the focused workflow on a phone-sized surface and verify one scroll owner, Back behavior, and deterministic focus return.

## Non-Goals

- A global sheet edit mode or general section-wide edit mode.
- Generic collection organization beyond current row-level Pin/Unpin behavior.
- Collection-wide rich-record editing or annotation review.
- A universal field, record, or multi-system mutation reducer.
- Persisting UI workflow state in the character schema.
