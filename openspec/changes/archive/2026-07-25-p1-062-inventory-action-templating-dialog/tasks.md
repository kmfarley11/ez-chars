## 1. GridContent Preparation

- [x] 1.1 Extract the action menu and Edit/Notes dialog logic from `GridContent.svelte` into reusable UI molecules.
- [x] 1.2 Update `GridContent` and `RuntimeActionsCard` to compose these new molecules directly instead of passing the controls-only flag.
- [x] 1.3 Remove the `presentation="controls-only"` prop and its conditional rendering logic from `GridContent`.
- [x] 1.4 Run `npm run test:e2e` to verify that existing bulk-edit and patch behaviors are preserved.

## 2. Domain & Logic Updates

- [x] 2.1 Update the reducer in `sheetEditIntents.ts` to explicitly allow unequipped inventory sources for runtime actions.
- [x] 2.2 Update the suggestion helper in `suggestInventoryRuntimeActions.ts` to return suggestions for all inventory items, not just equipped.
- [x] 2.3 Update the associated Vitest contract tests to assert unequipped source acceptance.
- [x] 2.4 Add Vitest unit tests for the tokenized filtering logic (case-insensitive, whitespace-tokenized across name/notes) and deterministic equipped-first sorting.

## 3. Molecule Creation

- [x] 3.1 Create the reusable trigger-independent Dialog Shell molecule with responsive layout (centered on desktop, full-height on mobile) and Step Navigation.
- [x] 3.2 Update `DialogButton.svelte` to compose the new Dialog Shell molecule to prevent duplicate dialog lifecycles (or document if it cannot be composed).
- [x] 3.3 Create the Inventory Item Picker molecule with a text search input and an "Equipped only" toggle.
- [x] 3.4 Ensure the picker maintains the selection state visibly even if the selected item is filtered out by a new search query.
- [x] 3.5 Create a focused Action Draft Form molecule to edit the name, timing, category, target, and notes.

## 4. Guided Dialog Organism

- [x] 4.1 Create the `InventoryActionDialog` organism to coordinate the Dialog Shell, Item Picker (step 1), and Draft Form (step 2).
- [x] 4.2 Ensure `InventoryActionDialog` explicitly owns the data request, pending/error state, selected source, draft edits, and current step. The `InventoryItemPicker` molecule should receive resolved items and callbacks.
- [x] 4.3 Implement internal state in the organism to handle backward navigation, maintaining the selected item, and reseeding the draft if a new item is selected.
- [x] 4.4 Implement distinct loading, failure, empty-inventory, and no-match UI states within the organism and picker.
- [x] 4.5 Connect the new dialog to the "Add action from inventory" action in `RuntimeActionsCard`, ensuring no data is saved until the final confirmation.
- [x] 4.6 Wire the "Confirm" action to dispatch the creation of the new linked runtime action with the reviewed draft values.

## 5. Verification

- [x] 5.1 Create Storybook stories for the new molecules (Picker, Dialog shell, Form) demonstrating populated, empty, filtered, loading, and error states.
- [x] 5.2 Create a realistic cluttered inventory scenario in Storybook for the `RuntimeActionsCard` organism to stress-test the picker and sorting.
- [x] 5.3 Configure explicit Storybook interaction and accessibility (a11y) checks for the new organism and molecules.
- [x] 5.4 Update the Chromium Playwright tests in `tests/characterSheet.smoke.spec.ts` to cover back/cancel/no-mutation behavior, selected-item retention during filtering, and final action creation.
- [x] 5.5 Run `npm run verify:smoke` to execute the full suite of diagnostics, unit tests, Chromium smoke suite, and Storybook checks.

## 6. Backlog Updates & Reconciliation

- [x] 6.1 Prune `p1-062` from the prioritized backlog queue in `docs/backlog.md` and move it to `## Done Recently` with a summary of the completed work.
- [x] 6.2 Reconcile the "Next recommended sequence" block in `docs/backlog.md` to shift up remaining targets.
- [x] 6.3 Review and update `docs/active-goals.md` if the change affects any active goals.
- [x] 6.4 Reconcile any implementation fallout with the ADR/design and run `openspec validate --all --strict` before archiving.

## Executor Recommendation

- **Reasoning Level**: High
- **Model Complexity**: Pro
- **Rationale**: Refactoring `GridContent` and migrating its logic requires careful attention to existing prop drilling, event bubbling, and patching logic to avoid regressions. Building the stateful multi-step form organism involves orchestrating complex UI states (loading, error, empty) and ensuring deterministic ID allocation for tests.
