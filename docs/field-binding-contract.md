# Field Binding Contract

This document defines the field-scoped binding and mutation contract for `p1-040`. It should be read with [field-interaction-model.md](field-interaction-model.md), which defines the target user interaction model.

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
- Paths emitted in mutation payloads should use RFC 6901 JSON Pointer strings because RFC 6902 JSON Patch uses JSON Pointer paths.
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

This keeps the contract transport-agnostic and lets the mutation envelope below carry local edits without exposing transport details to field components.

## Local-First Mutation Envelope

A field or compound editor should emit a local-first mutation payload rather than calling storage directly. The payload should be an RFC 6902 JSON Patch document: an array of operation objects using the standardized operation shape exactly.

The app should use the standard operation members:

- `op`: one of `add`, `remove`, `replace`, `move`, `copy`, or `test`.
- `path`: an RFC 6901 JSON Pointer string targeting character-domain data.
- `value`: present for `add`, `replace`, and `test`.
- `from`: present for `move` and `copy`.

Do not invent parallel operation names such as `field.replace` or `list.updateItem` for the mutation API. If local tracing, source component names, timestamps, or commit reasons are useful, keep them in sidecar metadata outside the JSON Patch document; they must not be required to apply the patch.

For primitive field edits, emit `replace` at the field's JSON Pointer path. For annotation edits, emit `replace` at the annotation array's JSON Pointer path. Existing code can adapt simple `replace` operations to `GridContentPatch` during migration.

## Mutation Operations

The MVP mutation envelope should support these local operations without requiring a remote API:

- Field value update: use `replace`.
- Annotation array update: use `replace` against the annotation array path.
- Full list replacement: use `replace` against the list path.
- List insertion: use `add` against an array index path or the `/-` append path.
- List item update: resolve the current item path, optionally add a preceding `test` for stable item identity, then use `replace` for the item or nested item field.
- List item removal: resolve the current item path, optionally add a preceding `test` for stable item identity, then use `remove`.
- List item reorder: resolve current source and destination paths, optionally add identity `test` operations, then use `move`.

Annotation arrays should use full-array `replace` for the MVP. They are subordinate field or item metadata, not general character-domain lists. If annotation editing later needs item-level operations, use standard JSON Patch operations against annotation paths, preferably guarded by annotation `id` tests; do not introduce annotation-specific custom operation names by default.

This operation set covers current local-first editing while staying directly compatible with future create/read/patch/replace/delete concepts:

- `add` can represent create or insert.
- `replace` can represent field, item, annotation-array, or full-list replacement.
- `remove` can represent delete.
- `move` can represent reorder.
- `test` can guard optimistic updates and stable item identity.
- Read remains the binding contract's responsibility, not a mutation operation.

The envelope should not include HTTP methods, endpoint URLs, auth state, retries, or remote conflict policy. Those belong to a future adapter if remote storage is introduced.

## Validation And Application

Mutation validation happens after the component emits the envelope.

- The owner confirms the target path or stable item identity is still valid for the current character.
- The owner validates the next value against schema or domain rules before committing.
- Failed validation returns an error to the editing surface; it should not silently coerce unrelated data or partially apply invalid state.
- Local application remains immediate and immutable once validation passes.
- Persistence continues through the current local-first storage boundary.

JSON Patch operations apply sequentially. List operations that use array indexes must re-check the current list before applying. For growing lists, stable item identity should be preferred as soon as the schema provides it, usually by resolving the item to a current path immediately before emitting the patch and adding `test` operations where useful.

## Envelope Examples

Primitive value replacement:

```ts
[{ op: 'replace', path: '/systemData/abilities/strength/score', value: 14 }];
```

Annotation replacement:

```ts
[
	{
		op: 'replace',
		path: '/systemData/annotations/abilities/strength/score/_annotations',
		value: [{ id: 'note-1', text: 'Bless bonus often applies here.' }]
	}
];
```

List item update with stable identity:

```ts
[
	{ op: 'test', path: '/systemData/features/3/id', value: 'feature-action-surge' },
	{
		op: 'replace',
		path: '/systemData/features/3',
		value: { id: 'feature-action-surge', name: 'Action Surge', uses: '1 / short rest' }
	}
];
```

## Compatibility With Existing Grid Types

The existing grid data already contains useful pieces:

- `bindPath` is the current value patch path.
- `annotationBindPath` is the current annotation patch path.
- `annotations` is the current annotation display data.
- `GridContentPatch` is the current patch carrier with `{ path, value }`.

Later implementation can evolve these into a field-scoped binding object and JSON Patch payload without renaming everything at once. During migration, adapters may create the new contract from existing `GridContentField` data and convert simple `replace` operations back to `GridContentPatch`.

## Non-Goals For These Contract Slices

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
- Which JSON Patch operation or operation sequence is emitted on save?
- Can the mutation be adapted to current `GridContentPatch` handling during migration?
- What action commits a draft, and what action cancels it?
- Where does validation happen?
- Can the field preserve selection and copy behavior required by [field-interaction-model.md](field-interaction-model.md)?
