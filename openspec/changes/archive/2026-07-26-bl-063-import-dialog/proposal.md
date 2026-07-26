## Why

The current inline character import flow is functional but adds visual clutter to the home page by rendering transient file status, validation messages, and destructive apply controls directly in the toolbar. Moving import review and export confirmation into focused dialogs provides a cleaner, more accessible workflow while preventing accidental mutations.

## What Changes

- Modifies the "Import Characters" action to immediately trigger the OS file picker.
- Introduces an Import Dialog that opens after file selection to handle validation feedback, file summaries, and "Merge New" vs "Replace All" choices via a stateful review/success lifecycle.
- Presents the final import success proclamation inside the dialog.
- Introduces an Export Confirmation Dialog ("Export all X characters?") before handing off the serialized payload to the browser's download pipeline.
- Preserves the existing validated export-envelope boundary and merge/replace semantics.
- Excludes drag-and-drop, cloud storage, or changes to the underlying serialization format.

## Capabilities

### New Capabilities

- `import-export-workflow`: Defines the interactive lifecycle for importing and exporting character files via structured review dialogs, ensuring destructive actions (like Replace All) are explicitly confirmed before application.

## Impact

- **Affected Code**: The home page import/export toolbar controls.
- **Interactions**: The user workflow shifts from page-level inline controls to a focused, modal-based review process.
