# Field Rendering API Direction

This document captures the `p1-035` slice 1 inventory and target API shape for consolidating `GridContent` and `InlineFieldDraft`. It should be read with [field-interaction-model.md](field-interaction-model.md) and [field-binding-contract.md](field-binding-contract.md).

## Problem

The current field behavior works, but the component boundary is split:

- `GridContent` renders card/grid fields, card fallback `Edit`, card `Notes`, field annotation badges, lists, and compound values.
- `InlineFieldDraft` renders standalone primitive runtime editors with persistent edit controls and RFC 6902 JSON Patch output.
- The 5e route composes those side by side in some cards, which makes the page harder to scan and makes future character-sheet surfaces choose between two different field APIs.
- The 5e route originally owned a large amount of projection and binding glue: annotation path derivation, annotation lookup, repeated value/annotation save wiring, optional add-vs-replace handling, and virtual path normalization for lists and schema-backed summaries. `p1-045` moved the system-specific portions into nearby projection, patch, and metadata modules while retaining generic helpers in `src/lib/`.

The MVP target is one cohesive field/card interface that can express both runtime/state direct editing and quieter reference/profile card editing while making sheet pages mostly orchestrate which character data tidbits appear in which cards.

## Current Call-Site Inventory

In [src/routes/charsheets/5e/+page.svelte](../src/routes/charsheets/5e/+page.svelte), current usage is:

- `GridContent`: 62 call sites. This is the default display and fallback-edit path for overview, quick reference residual fields, actions, abilities/proficiencies, features/traits, spells, inventory, background, roleplay, and scratchpad sections.
- `InlineFieldDraft`: 6 call sites. These are all runtime/state primitive fields:
  - Current HP
  - Temp HP
  - Death Saves OK
  - Death Saves RIP
  - Hit Dice Remaining
  - Spell Slot Used counters, repeated once per rendered spell slot card

The route currently repeats binding glue for each `InlineFieldDraft`:

- JSON Pointer value path for direct saves
- `patchOperation` for optional fields such as temp HP and hit dice remaining
- annotation lookup through `annotationsForBindPath`
- annotation save through `handleFieldAnnotationsSave`
- persistent edit and annotation affordance props

Most `GridContent` fields already carry nearby data that could support the same behavior:

- `fieldName`
- `value`
- `bindPath`
- `annotationBindPath`
- `annotations`
- `inputKind`
- `multiline`
- `options`

The missing pieces are:

- an explicit field interaction/binding surface on `GridContentField`
- a renderer that can choose direct primitive editing or card fallback editing from that field metadata
- a small projection/binding helper layer so pages do not repeat value lookup, annotation lookup, patch path derivation, and affordance wiring for every field

## Existing Component Responsibilities

Keep and evolve these existing pieces rather than introducing a parallel field system:

- `GridContent`: should remain the card/grid renderer and own card-level fallback `Edit`/`Notes` behavior.
- `InlineFieldDraft`: should become either an internal primitive renderer used by `GridContent` or be reduced to a thin compatibility wrapper during migration.
- `FieldDraft`: should remain the primitive draft-to-JSON-Patch helper for direct value edits.
- Annotation UI should consolidate around one page-facing Notes/annotation surface. `FieldAnnotationControl`, `GridContentAnnotationsDisplay`, and `GridContentAnnotationsEditor` can remain implementation pieces, but callers should not need to coordinate all three directly.
- Page/feature code remains responsible for projecting schema data into field/card data, applying patches, validating the character, and saving.

## Page Authoring Target

The 5e route should move toward card orchestration instead of field plumbing. A future sheet page should be able to describe:

- which source object is being rendered
- which fields appear in each card
- each field's label, path, input kind, and optional display formatting
- edit and annotation affordances, such as persistent runtime edit versus quieter menu edit
- intentional virtual paths for list summaries that need feature-specific merge logic

The page should not need to separately wire:

- `annotationsForBindPath(...)`
- `handleFieldAnnotationsSave(...)`
- `toSystemDataAnnotationPath(...)`
- repeated `patchOperation` decisions for optional primitive fields
- parallel adjacent `InlineFieldDraft` components for fields already present in a `GridContent` card
- per-field annotation data when it can be derived from the field binding path

The exact helper names can evolve, but the desired authoring shape is closer to this:

```ts
const quickRefCard = fieldCard(character, [
	field.number('Current HP', ['systemData', 'combat', 'hitPoints', 'current'], {
		editAffordance: 'persistent',
		annotationAffordance: 'persistent'
	}),
	field.number('Temp HP', ['systemData', 'combat', 'hitPoints', 'temp'], {
		valuePatchOperation: 'add',
		editAffordance: 'persistent',
		annotationAffordance: 'persistent'
	}),
	field.display('Max HP', ['systemData', 'combat', 'hitPoints', 'max'])
]);
```

That example is illustrative, not a required API. The important part is that the shared resolver can convert a field descriptor plus current character into `GridContentData` with resolved values, annotation data, patch paths, and interaction metadata. This keeps future character sheet pages focused on layout and intent rather than repeating the same binding mechanics.

## Annotation Component Inventory

The current annotation components have different responsibilities:

- `FieldAnnotationControl`: trigger plus dialog orchestration for one field. It owns the visible Notes button/badge, focus return, read-first dialog behavior, local annotation draft state, and Save/Cancel actions.
- `GridContentAnnotationsDisplay`: pure read renderer for an annotation array. It formats note text and source/reference links.
- `GridContentAnnotationsEditor`: pure edit renderer for an annotation array. It owns add/remove controls and per-annotation form controls, but emits a full replacement array through `onChange`.

That separation is useful internally, but it is not the target page-level API. The 5e route should not need to choose between these components or wire annotation draft state itself. The route should project annotation data and patch paths into field/card data; the shared field/card renderer should decide whether to show a field badge, card Notes dialog, display view, or editor view.

The current `GridContent` card Notes dialog duplicates some orchestration that `FieldAnnotationControl` already handles for single fields: read-first display, enter edit mode, draft annotations, save/cancel, and focus/dialog lifecycle. Later `p1-035` slices should consider coalescing this into a shared annotation surface, such as:

- a reusable annotation dialog/body that can render one field or multiple field groups
- a single annotation action component that accepts `annotationAffordance`, annotation data, patch capability, and group metadata
- `GridContentAnnotationsDisplay` and `GridContentAnnotationsEditor` staying as private subcomponents used by that surface

The goal is de-confliction, not necessarily one physical file. It is acceptable for display and editor subcomponents to remain separate if the page and card renderer interact with one cohesive Notes API.

## Svelte And DOM Performance Expectations

The consolidated field/card API should make the page easier to author without making the rendered sheet heavier. The 5e sheet contains many fields, menus, and potential annotation/edit dialogs, so implementation slices should treat Svelte reactivity and DOM size as part of the design:

- keep dialog bodies lazily mounted or shared where practical instead of restoring one hidden edit/notes dialog per field
- avoid renderer designs that create extra always-present wrapper/control DOM for every field when the same behavior can be expressed through metadata and conditional rendering
- avoid scroll-induced hover state churn for edit controls; mobile-safe menu or persistent affordances should remain stable during fast scrolling
- keep derived/resolved field data as plain, inspectable values and avoid per-field subscriptions or effects unless a component genuinely needs local interaction state
- preserve the current display-first behavior for reference/profile fields so selectable text remains cheap to render and easy to copy

Deeper scroll diagnosis remains in `p1-025`, but `p1-035` must not regress the DOM and rendering improvements already made during the focused performance pass.

## Target Data Shape

The grid field type now centralizes these names in [gridContentTypes.ts](../src/lib/gridContentTypes.ts). Later slices should reuse those exported types instead of redefining local affordance or patch-operation unions.

```ts
type GridFieldBinding = {
	readPath?: GridContentBindPath;
	valuePatchPath?: GridContentBindPath;
	annotationReadPath?: GridContentBindPath;
	annotationPatchPath?: GridContentBindPath;
	valuePatchOperation?: GridFieldPatchOperation;
};

type GridFieldCapabilities = {
	canEditValue?: boolean;
	canEditAnnotations?: boolean;
	isDerived?: boolean;
	copyPriority?: boolean;
};

type GridFieldInteraction = {
	editAffordance?: GridEditAffordance;
	annotationAffordance?: GridAnnotationAffordance;
};
```

The current `GridContentField` can migrate incrementally:

- `bindPath` can continue as the compatibility value patch path.
- `annotationBindPath` can continue as the compatibility annotation patch path.
- `annotations` remains display data.
- New fields can be added only when needed to express direct primitive editing cleanly.

Do not force every field to use direct editing. The interface should allow:

- primitive runtime field with persistent direct edit
- primitive reference/profile field with quieter menu edit
- display-only derived field
- compound/list field with card fallback edit
- field/card notes without value editing

## Target Component Flow

For a primitive runtime/state field:

1. Page projection creates a `GridContentField` with `value`, `inputKind`, value patch path, annotation patch path, and `editAffordance: 'persistent'`.
2. `GridContent` renders it through the shared primitive field renderer.
3. The primitive renderer uses `FieldDraft` for local value draft state.
4. Save emits a standard JSON Patch document or the current compatibility patch envelope through `GridContent`.
5. The page applies and validates the patch. The field component does not know about storage.

For a reference/profile card field:

1. Page projection creates the same field shape but defaults to quieter edit affordance, usually `menu`.
2. Display text remains selectable/copyable.
3. Card fallback `Edit` remains available for fields that do not yet have direct editors or belong to compound/list structures.
4. `Notes` remains the primary annotation review/add/edit surface.

For card-level composition:

1. Page projection should describe all fields in one `GridContentData` shape, including fields that need runtime/state affordances.
2. `GridContent` serves as the card container and action facilitator: it owns card fallback `Edit`, card `Notes`, grid/list presentation, and routing to field-level renderers.
3. Field-level renderers pick out particulars inside the card for different affordances and update cadence, such as persistent current HP editing or quiet reference text.
4. The page should not have to place separate inline editor components next to a card to express that distinction.

## Migration Shape

Use the following staged migration:

1. Add the explicit interaction/binding fields to the grid types and renderer without changing existing output.
2. Add the smallest descriptor/resolver helper needed to derive field values, annotation paths, annotation data, and patch metadata from character data.
3. Prove the shared primitive renderer and resolver on one quick-reference card.
4. Move the remaining runtime primitive fields into `GridContentData` projection.
5. Remove the adjacent `InlineFieldDraft` blocks from the route after the migrated fields render through `GridContent`.
6. Keep card fallback `Edit` for compound/list/mixed cards and avoid moving annotations back into the edit dialog.

Slice 2 should introduce the minimal shared renderer/API and binding-resolver shape needed for steps 1 and 2. Slice 3 should migrate exactly one quick-reference card to prove the shape before broader rollout.

Slice 2 implementation note:

- `GridPrimitiveField` is the shared primitive field renderer for direct value edits and field annotations.
- `InlineFieldDraft` now uses `GridPrimitiveField` as a compatibility wrapper instead of owning a separate rendering/editing implementation.
- `GridContent` can route fields with explicit binding/capability/interaction metadata to `GridPrimitiveField`, while existing card rendering remains unchanged for fields that do not opt in.
- `resolveGridFieldDescriptor` and `resolveGridFieldDescriptors` provide the first descriptor/resolver shape for deriving values, annotation data, patch paths, capabilities, and affordances from source data.
- Slice 3 should prove this by migrating one quick-reference card without changing the surrounding sheet layout.

Slice 3 implementation note:

- The first Quick Reference card is the current proof surface.
- Its route code now declares current HP, temp HP, max HP, initiative, and armor class through field descriptors and resolves them into one `GridContentData` payload.
- `GridContent` now renders persistent direct primitive fields in a top card section before the remaining grid content, which preserves the existing Quick Reference card shape while removing adjacent route-local `InlineFieldDraft` wiring for that card.
- Later slices should reuse this pattern for the other runtime cards before broader route extraction.

Slice 4 implementation note:

- The remaining runtime primitive surfaces now follow the same pattern.
- The second and third Quick Reference cards resolve persistent direct fields through descriptors instead of adjacent route-local inline editors.
- Spell slot used counters now live inside each slot card's `GridContentData` payload, so the slot cards no longer need separate top-level `InlineFieldDraft` wiring in the route.
- The route no longer needs standalone `InlineFieldDraft` usage for the current migrated runtime/state surfaces; the next review should focus on fallback Edit and Notes behavior rather than additional primitive migration.

Slice 5 implementation note:

- Card descriptors should define every field that belongs in the card, and card-wide Edit should remain comprehensive across those fields.
- Direct primitive affordances are prioritized shortcuts for frequent runtime/state edits; they do not remove those fields from the bulk Edit flow.
- Notes remains the explicit annotation review/add/edit surface, separate from value editing.

Slice 6 closure note:

- `p1-035` is complete for the current migrated runtime/state field surfaces: the 5e route no longer renders standalone `InlineFieldDraft` blocks beside `GridContent`, and the compatibility `InlineFieldDraft` component now delegates to the shared primitive renderer.
- `p1-045` subsequently extracted the remaining route-local projection builders and virtual-path translation into feature-local 5e modules without expanding the shared field/card API.
- `p1-055` replaced that translation monolith with a narrow schema-backed decoder and an exhaustive typed 5e intent reducer. Card-wide structured edits commit one validated next character, while direct primitive fields retain their existing RFC 6902 path.
- `p1-060` normalized the hydrated 5e model beneath that boundary. Projections now read explicit runtime-action, currency, roleplay, and source-aware proficiency groups without historical aliases, tags, or title matching. Compatibility with older persisted/exported data is owned by character hydration rather than rendering code.
- Future field/card work should preserve the completed split: descriptor-driven `GridContent` data owns card composition, direct primitive affordances are shortcuts for frequent runtime edits, card-wide Edit remains the comprehensive value/structure fallback, and Notes remains the annotation surface.

## Guardrails

- Preserve the `p1-030` behavior: runtime/state fields stay fast to edit, reference/profile fields stay readable and selectable, and annotations stay explicit through Notes.
- Preserve the `p1-040` boundary: field components emit patch intent; page/store code applies, validates, and persists.
- Preserve the `p0-040`/`p1-025` performance lessons: do not increase always-mounted dialog/control DOM or add renderer patterns that visibly worsen fast scrolling.
- Keep the completed 5e projections, decoder, and typed intent reducer feature-local. Their current signatures are evidence for a future multi-system contract, not a shared adapter API by themselves.
- Do reduce repeated page-level field plumbing where it directly supports the shared field/card API. `p1-035` defined the renderer-facing shape, and `p1-045` extracted the 5e-specific composition around it.
- Do not introduce a second new field system. Evolve existing grid and draft primitives.
- Do not expose more annotation component surfaces to the 5e route. Consolidate around a field/card Notes API, with display/editor components used internally.
- Prefer adding metadata to projected field/card data over adding page-local glue that separately binds values and annotations.
- Do not remove card-wide fallback editing until compound/list surfaces have narrower replacements.
