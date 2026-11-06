## Why

Frequently changed flags and freeform text still require a read-first dialog even when presented beside directly editable runtime values. Players should be able to update Inspiration and Conditions where they use them, with the same compact, predictable interaction language across editions.

## Non-Goals

- No condition catalog, rules enforcement, automatic effects, or 2014 condition-list redesign.
- No wholesale reclassification of primitive fields, broader read-first editing redesign, or global undo system.
- No schema migration, changed note ownership, or dependency adoption.

## What Changes

- Extend the shared edit-first experience to boolean, single-line text, and multiline text, preserving established numeric editing.
- Let boolean activation commit directly with validation feedback; keep text changes draft-based with explicit Save/Cancel.
- Move 2014 Inspiration from Reference stats into Live state. Make it, 2024 Heroic Inspiration, and 2024 Conditions editable there without opening Detail, retaining edition-specific labels and existing information.
- Preserve notes, absent optional values, keyboard/touch access, selectable text, and compact responsive layouts; reject stale edits rather than overwrite values authored since editing began.
- Provide reusable examples and representative in-sheet review before normal-sheet rollout.

## Capabilities

### New Capabilities

None. This extends the established editing capability.

### Modified Capabilities

- `character-sheet-editing`: Type-appropriate direct runtime editing, optional-value preservation, independent notes, and explicit adoption for the two editions' live-state fields.

## Impact

Shared runtime field presentation, its examples and tests, and both editions' Quick Reference composition and field-save integration are affected. Existing persistence and validation boundaries remain authoritative. This is the owner-selected BL-089 P1 improvement, not a new external-playtest prerequisite; it does not replace the separate read-first ergonomics effort.
