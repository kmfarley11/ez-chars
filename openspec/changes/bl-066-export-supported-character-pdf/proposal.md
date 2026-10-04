## Why

Players should be able to take their character into a familiar, editable PDF without re-entering it by hand. BL-066 will establish an honest, bounded export path: a useful portable sheet, not a replacement for the lossless JSON backup.

## Non-Goals

- PDF import, updating existing characters from PDFs, or round-trip fidelity.
- Arbitrary, scanned, homebrew, 2024, or Shadowdark forms; OCR or inferred rules content.
- Bundling or automatically fetching the publisher's blank form, retaining uploaded templates, or server processing.
- Recalculating authored character values, exporting a full rules compendium, or embedding a hidden character backup.
- Making this P1 improvement a prerequisite for the first playtest.

## What Changes

- Offer a per-character PDF export for the implemented 2014 system, separate from JSON backup.
- Support one exact reviewed official fillable form supplied locally by the user, only after its processing and filled-output permission basis is established.
- Review what will be included, continued on additional pages, or not represented before downloading. Require acknowledgment for omitted player-authored content or meaningful game information, not merely absent internal IDs or app-only presentation state.
- Preserve mapped content that exceeds the form's fixed capacity on readable, app-authored continuation pages rather than silently clipping it. Move overflowing prose in full and continue excess collection records without duplicating their content. Explain that continuation pages are non-fillable snapshots and later PDF edits do not regenerate them.
- Keep the original supported form fields editable and verify generated appearances in representative viewers and print output.
- Reject unsupported templates and failed exports without changing stored characters. Selected files and character content stay on the device.
- Establish a real-output human proof before exposing the export throughout the application; track reviewed scalar import separately as future work.

## Capabilities

### New Capabilities

- `character-pdf-export`: Local, reviewed export of one character into a supported fillable PDF, with explicit coverage, readable overflow, and non-destructive failure.

### Modified Capabilities

None. The existing JSON import/export workflow and compatibility policy remain unchanged.

## Impact

This adds a character-level export workflow, a system-specific projection into an external form, PDF-generation support, and output-verification coverage. It does not change persisted character data. Template rights, mapping fidelity, dependency adoption, and viewer compatibility require coordinated design and verification, so this is a full OpenSpec change with an architectural decision record during implementation.

BL-066 remains P1; BL-082 remains the next recommended P0 work. The initial 2014 proof can use the existing schema without introducing a multi-system abstraction or making completion of BL-070 a technical prerequisite.
