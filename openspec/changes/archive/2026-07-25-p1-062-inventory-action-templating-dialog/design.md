## Context

The current `RuntimeActionsCard` creates a runtime action immediately upon selecting an inventory suggestion. We are moving to a guided dialog workflow to allow users to preview and edit a draft of the action before creation. Additionally, we are formally classifying our UI components into atoms, molecules, and organisms, as approved in the `2026-07-25-classify-ui-component-composition` ADR, to keep reusable pieces distinct from feature-specific workflows.

## Goals / Non-Goals

**Goals:**

- Implement a two-step guided dialog for inventory-to-action templating.
- Build an inventory-focused picker molecule with local search, filtering, and "equipped-first" sorting.
- Extract reusable dialog shells, step navigation, and focused form sections as UI molecules.
- Re-architect `GridContent` to separate its display logic from the action menu/dialog orchestration, eliminating the need for a `presentation="controls-only"` prop.
- Use `RuntimeActionsCard` to orchestrate this new multi-step dialog organism.

**Non-Goals:**

- Do not build a universal, generic searchable-list or wizard framework; keep implementations focused until a second concrete consumer appears.
- Do not add spell or feature sources in this change.
- Do not alter the whole-collection bulk action editor or persistence semantics (snapshot and explicit resync remain the same).

### Note on Asynchronous Loading

The existing `RuntimeActionsCard` already has an asynchronous loading/error boundary for suggestions. We will retain this boundary and explicitly handle pending and rejected loading states within the new guided dialog workflow.

## Decisions

### 1. UI Component Composition Taxonomy

Following the ADR, we will classify the new UI pieces explicitly:

- **Molecules**: Reusable native dialog shell, step navigation component, focused runtime-action form section, and the inventory item picker. The item picker will handle native search inputs and single-choice selection. We will extract a trigger-independent dialog shell molecule and explicitly update `DialogButton.svelte` to compose this new shell unless implementation discovers a documented technical blocker. This avoids maintaining two separate native-dialog implementations.
- **Organisms**: The stateful multi-step dialog form that coordinates the picker and form steps, and the `RuntimeActionsCard` which composes this dialog.

### 2. GridContent Refactoring

Currently, `RuntimeActionsCard` passes `presentation="controls-only"` to `GridContent` to reuse its Edit/Notes workflow.

- **Decision**: We will separate the visual field layout of `GridContent` from its orchestration of the action menu and Edit/Notes dialogs. The focused menu, dialog, and form pieces will become molecules that both the `GridContent` organism and the `RuntimeActionsCard` organism can compose directly.
- **Rationale**: This removes the artificial `controls-only` conditional display mode from `GridContent` and promotes better reuse of the underlying molecules.

### 3. Inventory Item Picker State and Filtering

The picker will receive all inventory items.

- **Sorting**: We will default to a stable sort that places equipped items first.
- **Filtering**: A local text search will perform case-insensitive, whitespace-tokenized matching on both the item's name and its authored notes/details. An "Equipped only" toggle will filter out unequipped items without removing them from eligibility.
- **Selection & Async Lifecycle**: `InventoryActionDialog` (the organism) explicitly owns the data request, pending/error state, selected source, draft edits, and current step. `InventoryItemPicker` (the molecule) receives resolved items and selection callbacks, while owning only its ephemeral search/filter state and derived results.
- **Draft Defaults**: The selected item's name and notes will directly seed the draft. Deterministic defaults for the other fields will be: Timing: `action`, Category: `effect`, Target: `empty`.

### 4. Reducer and Suggestion Helper Updates

The current reducer explicitly rejects sources unless `equipped === true`, and the suggestion helper also filters unequipped items.

- **Decision**: We must explicitly update `sheetEditIntents.ts` to accept unequipped inventory sources and update `suggestInventoryRuntimeActions.ts` to return all items. The associated Vitest contract tests must also be updated to assert this new behavior.

### 5. Dialog Presentation

We will reuse one workflow state model across responsive presentations.

- **Decision**: The `<dialog>` element will be styled as a centered, constrained modal on larger screens, and adapt to a full-height, full-width presentation on mobile screens.

## Risks / Trade-offs

- **Risk**: State loss during navigation back and forth between the picker and the draft form.
  **Mitigation**: Preserving same-source draft edits across Back -> Next is preferred but not a release requirement. The multi-step organism will retain the selected inventory item, and deliberately choosing a new source in the picker will reseed the draft and overwrite pending edits.
- **Risk**: Extracting molecules from `GridContent` may accidentally break existing collection Edit/Notes workflows.
  **Mitigation**: The refactoring will be accompanied by targeted Storybook updates and Chromium browser smoke tests to verify the existing bulk-edit interactions remain intact.
- **Risk**: Final confirmation allocates action identity (UUIDs) through the reducer, which can cause non-deterministic test failures.
  **Mitigation**: We will ensure deterministic ID-allocation treatment in the tests by explicitly reusing the reducer's existing injected `createId` utility instead of relying on a global UUID mock.

## Implementation Reconciliation

### GridContent Dialog Lifecycle

The bulk Edit and Notes forms remain focused dialog molecules rather than composing `DialogShell`: their existing form and annotation-editor structures own specialized control footers that would otherwise require expanding the shell API without a second consumer. Each dialog exposes an optional post-close callback instead, allowing `GridContent` and `RuntimeActionsCard` to return focus to their Card actions trigger after the native dialog closes. This preserves the pre-extraction keyboard behavior while keeping `GridContent` free of dialog internals.
