# Field Interaction Model

This document defines the target MVP interaction model for field-level editing and annotations on the 5e sheet. It is the source of truth for `p1-030` slice 1 and should guide the binding work in `p1-040`.

## Goals

- Make primitive runtime fields directly editable from the sheet.
- Keep annotations and source references available without making them the primary click or tap behavior.
- Preserve ordinary text selection and copy flows for values users may want to paste into search engines, VTTs, notes, or external references.
- Avoid desktop-only interaction patterns; mouse, keyboard, and touch must all have a supported path.
- Keep data persistence and validation outside the field display component. Field UI should emit focused patch intent, while the page or store applies and saves it.

## Field Types

- Primitive fields: strings, numbers, booleans, and small enums. These are the first target for direct field editing.
- Compound fields: lists, rows, grouped objects, long notes, spell groups, inventory groups, and action lists. These may continue to use focused row editors or the existing bulk editor until a narrower editor exists.
- Derived or display-only fields: calculated, roll-up, or source-only values. These should not enter edit mode unless a real bind path exists.

## Edit Affordance Strategy

The sheet should not make every field look equally editable all the time. Most table use is read, select, copy, paste, and annotation review; editing is frequent only for runtime state.

- Runtime/state fields should use a persistent or near-persistent edit affordance. Examples include current HP, temp HP, spell slots used, death saves, resource counters, conditions, and prepared/equipped toggles.
- Reference/profile fields should preserve text selection and copying as the quiet default. Editing remains available, but should use a subtler affordance such as focus/hover/touch actions, an explicit local menu, or a section edit state.
- Annotation visibility should be considered separately from value editing. A field with annotations, notes, or source references may show a persistent indicator or count even when value editing stays quiet.
- Empty annotation controls must remain discoverable through keyboard and touch flows; they should not rely on hover alone.

Use this initial classification when choosing affordance defaults:

- Runtime/state fields: current HP, temp HP, spell slots used, death saves, resource counters, conditions, prepared toggles, and equipped toggles. Default toward `editAffordance: 'persistent'` or a near-persistent equivalent because these values change during play.
- Reference/profile fields: ancestry, class, proficiencies, spells known, feature text, background, roleplay notes, inventory descriptions, and other relatively stable character facts. Default toward quieter edit affordances such as `hover` or `menu`, while prioritizing reading, text selection, copying, and annotation review.
- Ambiguous fields should choose the quieter reference/profile behavior until play usage shows they are frequently changed at the table.

Shared field components should expose affordance options directly instead of hiding behavior behind a domain label like `runtime`. Domain-specific wrappers may choose defaults, but the shared component API should stay explicit:

```ts
type EditAffordance = 'persistent' | 'hover' | 'menu';
type AnnotationAffordance = 'persistent' | 'badge' | 'hover';

interface FieldInteractionAffordances {
	editAffordance?: EditAffordance;
	annotationAffordance?: AnnotationAffordance;
}
```

- `editAffordance: 'persistent'` keeps an edit control visibly available for runtime/state fields.
- `editAffordance: 'hover'` reveals edit controls on hover/focus and must still provide a touch path.
- `editAffordance: 'menu'` routes less-common value edits through an explicit local action menu.
- `annotationAffordance: 'persistent'` keeps an annotation action visibly available.
- `annotationAffordance: 'badge'` shows annotation presence/count persistently and opens details from that indicator.
- `annotationAffordance: 'hover'` may reveal empty annotation actions on hover/focus, but cannot be the only path on keyboard or touch.

## Primary Field Action

For editable primitive fields, the primary click or tap should edit the field value.

- Mouse: clicking an editable value enters field edit mode.
- Touch: tapping an editable value enters field edit mode. Annotation access must not depend on long-press as the only gesture.
- Keyboard: editable fields should be reachable by tab focus. Enter or Space starts editing where appropriate; Escape cancels an active edit.
- Boolean fields may commit immediately through a checkbox or toggle when validation is straightforward.
- Single-line text or numeric fields may commit with Enter. Multi-line or uncertain edits should use an explicit Save or Done control.

The MVP should prefer predictable explicit commit behavior over surprising blur-save behavior until the field validation and focus model are proven.

## Text Selection And Copy

Users should still be able to select and copy displayed field values for external search, notes, VTTs, or rules lookup.

- Selection should take precedence once the user drags across text or uses keyboard selection shortcuts.
- Double-click or drag selection should not be swallowed by edit activation.
- Copying focused display text should remain possible before entering edit mode.
- If primary click-to-edit conflicts with reliable selection, prefer a slightly more deliberate edit trigger, such as click-to-focus followed by Enter, an edit affordance, or edit-on-second-click for long text values.
- Short numeric and boolean fields can favor faster edit behavior because copy/search needs are lower.
- Long text, spell names, feature names, item names, and notes should favor easy selection and copying because external lookup is a common table flow.
- Persistent edit controls are appropriate for runtime/state fields, but should not become the default for long reference fields where visible controls would add noise and compete with reading or copying.

The intended precedence is: preserve explicit text selection and copy gestures first, then provide direct editing with the least extra friction that still works consistently across mouse, keyboard, and touch.

## Annotation Action

Annotations should open through a secondary, explicit affordance near the field.

- The affordance must be keyboard focusable and touch accessible.
- The affordance should have an accessible label that names the field and the annotation action.
- Fields with existing annotations or source references may show a small persistent indicator.
- Empty annotation controls may be revealed on focus, active field state, or a stable section-level editing state, but they must not be available only through hover.
- Opening and closing annotation UI should return focus to the originating field or annotation control.

The current help and annotation data should remain valid. This model changes the intended access path, not the stored annotation shape.

## Bulk Edit Fallback

The existing card-wide edit dialog can remain during the migration.

- It is acceptable as a fallback for compound fields and multi-field surfaces.
- It should not remain the only way to edit primitive runtime fields once the direct field model lands.
- Later slices should decide whether card-wide editing remains useful for non-runtime organizational sections.

## Patch Semantics

Field-level edit UI should emit focused patch intent instead of constructing whole-card edits.

- Value edits patch the field's value bind path.
- Annotation edits patch the field's annotation bind path.
- Display components should not know whether persistence is LocalStorage, import/export, or a future transport.
- The owning route or store remains responsible for validation, migration, persistence, and error handling.

This keeps direct editing aligned with the future shared binding and patch abstraction work in `p1-040`.

## Visual And Interaction Expectations

- Editable values should have a subtle, consistent affordance without making dense runtime sections noisy.
- Annotation controls should not cause layout shift while scrolling.
- Focus states should be visible and consistent with the app theme.
- Runtime field editing should preserve the sheet's dense at-table readability.
- Runtime edit controls may be visibly present by default because those fields change during play.
- Reference-field edit controls should be quieter by default so the sheet remains useful as a readable, selectable, copyable reference surface.
- Annotation presence should be easier to notice than edit capability. Reviewing existing annotations and sources is a first-class sheet behavior, not an advanced edit-only flow.
- Direct field editing is the MVP behavior even though the rough sheet reference mentions clickable rolls; dice rolling remains out of MVP scope.

## Manual Review Checklist

When the model is implemented, verify:

- A mouse user can edit a primitive field and separately open annotations.
- A keyboard user can focus the field, edit it, cancel it, save it, and open annotations.
- A touch user can edit the field and open annotations without relying on hover or long-press.
- Focus returns to a sensible place after edit or annotation UI closes.
- Existing help, source references, and annotation data remain visible and editable where they already existed.

## Open Follow-Ups

- Exact inline editor styling and controls belong to implementation slices.
- The first field surface used to prove the model should be chosen during `p1-040` or `p1-030` slice 2.
- Whether annotations open as a dialog, popover, or side panel can remain implementation-specific as long as the accessibility and touch requirements above are met.
