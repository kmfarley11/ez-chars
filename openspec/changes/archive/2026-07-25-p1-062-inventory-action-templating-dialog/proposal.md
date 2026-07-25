## Why

Users currently have to immediately commit to the first generated runtime-action suggestion from their inventory. This change allows users to deliberately choose any inventory source and review the resulting runtime-action draft in a guided two-step dialog before anything is committed to their character sheet, avoiding accidental data creation and improving the templating UX.

## What Changes

- Add a guided, two-step dialog workflow for "Add action from inventory" that does not modify character data until final confirmation.
- Introduce a searchable, filterable inventory item picker that shows all items (equipped items first by default).
- Add an "Equipped only" filter toggle to the inventory picker.
- Add local text search across item names and user-authored notes.
- Provide a focused form for editing the seeded runtime action before it is saved.
- Separate GridContent's field display from its action menu and Edit/Notes dialogs to extract reusable molecules.

## Non-Goals

- Do not introduce a universal searchable-list or wizard framework.
- Do not alter existing snapshot semantics or bulk-edit capabilities.
- Do not expand sources to spells or features (this belongs in p1-061).

## Capabilities

### New Capabilities

- `inventory-action-templating`: A guided modal workflow that presents inventory sources, allows selection via search/filtering, and provides an editable draft of a runtime action before it is committed to the character.

### Modified Capabilities

- `runtime-action-inference`: Reconciling the existing equipped-only inference requirement. The eligibility requirement is broadened: all inventory items are eligible for selection, but equipped items are prioritized in default sorting, and "Equipped only" becomes an optional view filter.

## Impact

- The existing character sheet action panel will compose the new dialog workflow.
- The existing grid display layer will be refactored to separate its visual layout from its action menu and dialog orchestration, removing conditional display props.
- New UI molecules: inventory item picker, step navigation, dialog shells, focused form sections.
- Storybook will receive new organism and molecule stories to cover the interactive flow and responsive presentation.
