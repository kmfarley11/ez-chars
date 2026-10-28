## Why

BL-070 introduces the second supported system without making the 2014 character shape universal. Players should recognize their edition's terminology and retain the familiar editing, notes, navigation, and collection experience established by the current sheet, while maintainers reuse genuine common behavior rather than copying whole sheets for naming differences.

## Non-Goals

- Shadowdark implementation, a universal RPG renderer, a complete character builder, automatic rules enforcement, or conversion between 2014 and 2024 characters.
- Mandatory full-character completion, separate simple/full character formats, or a selectable compact/stat-block mode in this change.
- Full 2014 feature parity, automatic population of default rules actions, automatic source propagation, or override-aware merging. Existing 2014 source workflows remain intact.
- PDF import/export, redistribution of official character-sheet templates, ingestion of unapproved local documents, or a new dependency by default.
- Durable v1 compatibility promises or migration of previous experimental v0 shapes.

## What Changes

- Close bounded 2014 runtime coverage gaps through focused edits for save/skill bonuses, Expertise, Passive Perception, Inspiration, Player Name and subclass, without automatic calculations or changing existing source ownership.

- Add explicit 2014/2024 creation choices and system-correct listing, opening, editing, persistence, and JSON backup/restore. Unsupported systems and versions remain recoverable instead of opening as a guessed 2014 character.
- Deliver a sparse-friendly 2024 sheet for the adopted SRD 5.2.1 release: identity/origin, runtime values and defenses, checks/proficiencies, authored actions, features/feats/mastery, equipment/currency, optional spellcasting, and quick notes. Unknown information may remain absent.
- Allow custom 2024 actions or editable snapshots from character-owned inventory, spells and features/feats. Copy only name and description; keep timing and notes player-owned. Explicit refresh warns that copied text may be overwritten; deleting a source preserves the detached action.
- Make source inspection and refresh discoverable together in action Detail across both editions. Users can edit the source and return without losing unsaved work, stacking dialogs or navigating away from their sheet position.
- Preserve familiar interactions while displaying edition-appropriate vocabulary. Naming differences alone must not require parallel interaction implementations; real semantic differences must not be disguised by shared labels.
- Keep common character lifecycle concerns separate from system-owned gameplay data. Reusable item and annotation concepts do not require every system to use identical storage locations or equipment rules.
- Give both D&D inventories explicit, system-owned item classification; renaming an item no longer changes its equipment group through hidden name conventions.
- **BREAKING (pre-playtest v0):** Rebase the 2014 character layout within its explicitly unstable epoch and introduce a separate 2024 epoch. Earlier incompatible records need not migrate, but rejected stored data remains untouched and downloadable until an explicit reset. The pre-release preservation disclaimer remains visible.
- Supply the correct preferred and contextual rules source for each sheet, preserving reader, draft, focus, and browser-history behavior.
- Preserve the current 2014 experience and canonical example content while proving a small real 2024 slice before broader rollout.

### Selected action-source boundary

The owner selected bounded source assistance on 2026-10-23. Prove inventory-to-action creation, explicit refresh and source deletion before broad rollout; add spell and feature/feat sources as their authored regions land. This reduces repeated transcription without silently deriving actions or promising full 2014 source parity. The existing visual approval stands; the focused extension still requires human review.

## Capabilities

### New Capabilities

- `multi-system-characters`: Explicit system selection, system-correct sheet access, and independent character ownership across supported systems.
- `dnd5e-2024-sheet`: Sparse-friendly 2024 character authorship and runtime use with familiar interaction patterns and edition-native terminology.

### Modified Capabilities

- `character-data-evolution`: Per-system current-model validation, the approved v0 rebase, recoverable rejection, and explicit inventory classification.
- `character-list-presentation`: System-provided human-readable summaries without requiring a shared class/identity layout.
- `import-export-workflow`: Validated mixed-system backups with all-or-nothing rejection and preserved identity/content.
- `contextual-reference-navigation`: Correct preferred and contextual source selection for both D&D editions, including 2024 action references.

## Impact

Touches character creation, system selection and sheet access, persistence/recovery, JSON interchange, both D&D data models, sheet composition, references, canonical examples, and their regression coverage. The 2014 UI remains the accepted baseline; changes to its data location and item classification must preserve authored content, record identity, notes, and priority in maintained examples. Existing architecture and data-versioning decisions will be refined during implementation. No new runtime service or dependency is planned.
