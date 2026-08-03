## Why

The proven 2014 sheet now depends on field, collection, dialog, layout, and panel components whose overlapping responsibilities make isolated review and safe reuse harder than necessary. Clarifying these boundaries before runtime collections, contextual resources, and additional game systems consume them reduces maintenance risk while concrete 2014 and Storybook evidence is available.

## What Changes

- Establish focused, reusable boundaries for field-group display, structured forms, annotation presentation and editing, card actions, dialog orchestration, responsive layout, and panel behavior while preserving the accepted 2014 sheet experience.
- Preserve direct primitive editing, stable collection identity, typed structured edits, validation, persistence, and system-specific source or navigation behavior with their current owners.
- Replace the multi-purpose legacy grid/container boundary across its current consumers and remove the obsolete compatibility surface once the approved replacement has been propagated.
- Add representative stateful and failure-oriented component examples, then require explicit owner approval of the isolated proof before broad sheet migration.
- Reconcile component classification, field-binding, interaction, rendering, and maintainer guidance with the resulting ownership model.
- Record the separately refined View/Edit/annotation redesign as follow-up behavior rather than silently delivering it through this refactor.

## Non-Goals

- No visible character-sheet redesign, new editing behavior, schema or persistence change, or additional game-system implementation.
- No universal TTRPG renderer, form engine, field registry, collection framework, card abstraction, page template, or cross-system domain adapter.
- No delivery or character-sheet integration of the separately proposed View/Edit/annotation interaction redesign; isolated comparison stories may inform its later proposal.
- No indefinite compatibility wrapper retained solely to avoid completing the approved migration.

## Capabilities

### New Capabilities

- None. This change reorganizes the implementation of already specified behavior.

### Modified Capabilities

- `sheet-adapter-refactoring`: Extend its behavior-preservation contract to cover reusable field, form, annotation, dialog, layout, and panel decomposition plus complete retirement of a superseded internal boundary. Existing user behavior remains unchanged.

## Impact

- Reusable Svelte component and internal developer API boundaries for field groups, forms, annotations, dialogs, responsive layout, panels, and dense-list composition.
- Current 2014 sheet composition and its Storybook, unit, and browser verification surfaces.
- Component-composition and field-system maintainer documentation.
- No dependency, canonical schema, storage format, or public data-contract changes are expected.
