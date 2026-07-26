## Context

Currently, the character import workflow is handled inline within the home page toolbar (`src/routes/+page.svelte`). When a user selects a file, the validation status, character count, and the destructive "Replace All" or "Merge New" buttons appear directly in the page layout. This creates visual clutter and can lead to accidental destructive actions due to lack of isolation.

## Goals / Non-Goals

**Goals:**

- Provide an isolated, modal-based review for both import and export workflows.
- Immediately open the OS file picker on "Import" to avoid a redundant "Choose File" dialog step.
- Display post-import success states within the dialog.

**Non-Goals:**

- Drag-and-drop file support.
- Modifying the underlying serialization or schema validation logic.

## Decisions

- **Dialog Component Architecture:** Following the UI composition ADR, `CharacterImportDialog` and `CharacterExportDialog` are feature-specific organisms colocated with the home route. They compose the reusable `DialogShell` from `src/lib/`. The route/controller retains ownership of file parsing, the `$charsArray` store, and all persistence mutations. The dialogs merely present state and emit `apply` or `confirm` intents.
- **Immediate OS File Picker & Validation Timing:** Clicking "Import Characters" programmatically triggers `.click()` on a hidden `<input type="file">`. The `onchange` handler immediately opens the `CharacterImportDialog` in a "reading" state while the file is loaded and parsed. Once parsing is complete, the dialog transitions to either an error state or a ready state. To prevent race conditions if a user cancels and selects another file while `file.text()` is pending, the route must track an import-attempt token (or equivalent guard) that is invalidated on cancellation or newer selections.
- **Success State in Dialog:** Instead of closing the dialog immediately upon "Replace All" or "Merge New", the dialog will transition to a "Success" state (e.g., `step = 'success'`), allowing the user to explicitly close it. This ensures they see how many characters were actually imported.
- **Focus Restoration:** Because the OS picker is triggered via a hidden file input, native browser focus restoration may target the wrong element. The route will retain references to the visible trigger elements (e.g., the Import button) and explicitly restore focus to them upon dialog cancellation or success dismissal.

## Risks / Trade-offs

- **Risk:** Browser security restrictions around programmatic `.click()` on file inputs.
  - **Mitigation:** The `.click()` will be triggered synchronously from a direct user click event (the "Import Characters" button), which satisfies standard browser security requirements for programmatic file input triggers.
- **Risk:** Unmounting the file input might clear its value.
  - **Mitigation:** Keep the hidden file input mounted as long as the page is mounted, or reset its value manually after the `onchange` event fires so that selecting the same file twice in a row still triggers the event.
