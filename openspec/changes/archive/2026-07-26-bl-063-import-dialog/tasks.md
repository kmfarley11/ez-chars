## 1. Dialog Component Creation

- [x] 1.1 Create `src/routes/components/CharacterImportDialog.svelte` as a route-specific organism using the reusable `DialogShell`. It must present state (reading, error, ready, success) and emit intents (apply/cancel).
- [x] 1.2 Create `src/routes/components/CharacterExportDialog.svelte` as a route-specific organism using the reusable `DialogShell` to present confirmation and emit intents.
- [x] 1.3 Add component stories for the dialogs covering error, ready, destructive confirmation, and success states.

## 2. Refactoring Import/Export Flow

- [x] 2.1 Refactor the home page toolbar (`src/routes/+page.svelte`) to remove inline validation and apply controls.
- [x] 2.2 Wire the "Import Characters" button to trigger a hidden `<input type="file">` `.click()` event to open the native OS file chooser directly.
- [x] 2.3 Wire the `<input>` `onchange` handler to open `CharacterImportDialog` in a reading state, parse the file, and then transition the dialog to an error or ready state.
- [x] 2.4 Retain ownership of the file parsing, validation, and storage mutations within the route controller (`+page.svelte`), passing state to the dialogs and listening to their emitted intents.
- [x] 2.5 Track an import-attempt token in the route during `file.text()` to prevent stale reads from overriding newer dialog states if the user cancels and re-selects quickly.
- [x] 2.6 Ensure the route handles the "Merge New" and "Replace All" intents from the dialog, performs the mutation, and signals the dialog to transition to its success state.
- [x] 2.7 Hook the confirmation intent from `CharacterExportDialog` in the route to trigger the existing JSON serialization and browser download pipeline.
- [x] 2.8 explicitly restore focus to the "Import Characters" or "Export Characters" buttons after their respective dialogs are cancelled or successfully dismissed, since native restoration fails for hidden inputs.

## 3. Verification

- [x] 3.1 Expand Playwright smoke test coverage:
  - [x] Invalid JSON versus unsupported data
  - [x] Merge New duplicate skipping and persistence
  - [x] Replace All warning text
  - [x] Cancellation explicitly preserving data
  - [x] Export cancellation without a download
  - [x] Cancellation/reselection while a read remains pending
- [x] 3.2 Run full verification suite (`npm run verify:smoke`) to ensure formatting, linting, tests, and builds all pass cleanly.
- [x] 3.3 Run `npm run build` to verify production compilation.

## 4. Backlog Updates & Reconciliation

- [x] 4.1 Prune `BL-063` from `docs/backlog.md` and move it to "Done Recently" with a summary.
- [x] 4.2 Reconcile the "Next recommended sequence" header in `docs/backlog.md` to shift up the remaining priorities.

## Executor Recommendation

- **Reasoning level:** Medium/High
- **Model complexity:** Medium
- **Rationale:** Requires careful management of native file input lifecycles, focus restoration, destructive persistence testing, and browser testing coverage against a stateful dialog interaction model.
