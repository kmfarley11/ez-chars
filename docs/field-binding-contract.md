# Field Binding Contract

This document defines the field-scoped binding contract for `p1-040` slice 1. It should be read with [field-interaction-model.md](field-interaction-model.md), which defines the target user interaction model.

## Purpose

The field binding contract lets a displayed sheet field read one value, draft one edit, and emit one focused save intent without knowing how the character is stored. It should replace page-specific whole-card save glue over time, while staying compatible with the existing `bindPath`, `annotationBindPath`, and `GridContentPatch` concepts.

This is a contract definition, not a full implementation slice.

## Field Binding Shape

A field-scoped binding should describe these paths separately:

- `readPath`: where the display value is read from in the normalized character data.
- `valuePatchPath`: where a committed value edit is written.
- `annotationReadPath`: where annotation data is read, when annotations exist for the field.
- `annotationPatchPath`: where a committed annotation edit is written.

For simple schema-backed fields, `readPath` and `valuePatchPath` are usually the same. They are still separate because projected fields, derived display labels, and future compatibility shims may need to read from one place and write to another.

For annotations, read and patch paths should be explicit even when they can be derived from the value path. This keeps field components from needing to know 5e-specific annotation storage rules.

## Path Rules

- Paths are arrays of string or number segments, matching the current `GridContentBindPath` convention.
- A missing `valuePatchPath` means the field is display-only for value editing.
- A missing `annotationPatchPath` means the field has no editable annotation target.
- Paths point to character-domain data, not component-local display tree positions.
- Array-index paths are allowed, but callers must treat them as current-character positions and avoid reusing stale bindings after list reordering.
- Field components must not synthesize 5e annotation paths from value paths. The page or binding factory owns that projection.

## Compound And List Bindings

Primitive field bindings should not be forced to carry every list and object use case. Growing character data such as features, spells, inventory, runtime actions, languages, notes, and similar collections should be treated as compound containers that can expose item-level bindings.

The preferred scalable model is:

- Container binding: the list or grouped object owns add, remove, reorder, and whole-list fallback behavior.
- Item binding: each persisted item can become its own addressable editing and annotation surface.
- Field binding: primitive fields inside an item can use the scalar field contract when they have a safe value patch path.

This avoids both extremes: a permanent one-dialog bulk editor for a large list, and fragile anonymous primitive bindings for every array cell.

For MVP-simple cases, replacing a full array can remain acceptable. For growing lists, later mutation work should prefer stable item identity over raw array indexes when the schema supports it. Array-index paths may still be used as a current implementation detail, but item-level editing and annotations should move toward stable IDs or durable keys for insert, update, remove, and reorder behavior.

## Field Capabilities

The binding should expose computed field capabilities for component-control facilitation. These are presentation-layer facts derived by the binding/projection layer; they are not stored character fields, persisted UI capability flags, or storage adapter rules.

- `canEditValue`: true when the field has a value patch path and the value type has an editor.
- `canEditAnnotations`: true when the field has an annotation patch path.
- `isDerived`: true when the displayed value is calculated or assembled from other data.
- `copyPriority`: a hint for values where selection and copying should take precedence over fast edit activation.

These capabilities support rendering controls, gestures, labels, and affordances without forcing every field component to infer behavior from shape or path presence alone. They should not be used as persistence authority. Save paths and mutation semantics decide what can be submitted; schema and domain validation decide what can actually be applied.

## Commit Boundaries

A field edit should have one clear commit boundary.

- Starting edit creates a local draft from the current field value.
- Cancel discards the draft and emits no patch.
- Save emits a patch only when the committed value differs from the current read value.
- Validation and schema coercion happen in the owning route, store, or domain helper, not inside a generic field display component.
- If validation fails, the field remains in edit mode or receives an error from the owner; it should not silently write invalid data.

For single-line primitive fields, Enter may be a commit action. For multi-line or ambiguous fields, an explicit Save or Done control is preferred.

## Save Semantics

Value saves and annotation saves are distinct operations even when they are initiated from the same displayed field.

- A value save emits a value patch to `valuePatchPath`.
- An annotation save emits an annotation patch to `annotationPatchPath`.
- A field component may emit both operations from the same UI surface, but the operations should remain distinguishable.
- The page or store applies patches immutably, persists them through the existing local-first storage path, and handles validation errors.
- Field components must not know whether persistence is LocalStorage, import/export, or a future remote transport.

This keeps the contract transport-agnostic and leaves the future mutation-envelope work to later `p1-040` slices.

## Compatibility With Existing Grid Types

The existing grid data already contains useful pieces:

- `bindPath` is the current value patch path.
- `annotationBindPath` is the current annotation patch path.
- `annotations` is the current annotation display data.
- `GridContentPatch` is the current patch carrier with `{ path, value }`.

Later implementation can evolve these into a field-scoped binding object without renaming everything at once. During migration, adapters may create the new contract from existing `GridContentField` data.

## Non-Goals For Slice 1

- Do not implement inline editors.
- Do not introduce a remote sync layer or HTTP-aware mutation model.
- Do not replace all page-level patch normalization.
- Do not remove the card-wide edit dialog.
- Do not choose the first proof surface yet, unless a later slice asks for it.

## Review Checklist For Implementers

Before implementing later slices, confirm that the proposed API answers:

- Which value is displayed?
- Which path receives a value patch?
- Which annotations are displayed?
- Which path receives an annotation patch?
- Can this field edit values, annotations, both, or neither?
- Is this binding a primitive field, a compound container, or an item within a compound container?
- If this is an item binding, does it have a stable identity or only a current array position?
- What action commits a draft, and what action cancels it?
- Where does validation happen?
- Can the field preserve selection and copy behavior required by [field-interaction-model.md](field-interaction-model.md)?
