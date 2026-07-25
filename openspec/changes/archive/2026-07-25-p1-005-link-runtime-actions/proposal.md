## Why

Equipped inventory and runtime actions currently repeat the same player-authored names and notes without any durable relationship between them. This inventory-first slice reduces that duplicate entry while preserving the lightweight, editable runtime summary and establishes the first concrete source-link pattern from the broader runtime-action architecture. Runtime actions also need to remain concise at the table: source-management metadata must not displace the action's playable summary or hide its player-authored notes behind bulk editing.

## What Changes

- Allow users to request action suggestions from equipped inventory items, with each suggestion seeded from the item's current name and notes.
- Persist accepted suggestions as independently editable runtime-action snapshots linked to the character-owned source item.
- Keep manual custom actions available and allow more than one runtime action to link to the same item.
- Present each runtime action once, prioritizing its name, timing, category, and player-authored note content.
- Retain the existing card-level bulk Edit and Notes workflows while deferring a broader per-item interaction model for collection rows.
- Keep source navigation and explicit resync available through compact controls attached to the linked action rather than a separate source-status list.
- Preserve a linked action as a custom action if its source item is deleted.
- **BREAKING (versioned data contract):** advance the canonical D&D 5e 2014 character layout to a new version; existing supported characters remain loadable through explicit migration.

## Non-Goals

- Deriving actions from spells or features in this delivery. Those source kinds remain part of the approved architecture and are retained in follow-up `p1-061`.
- Automatically propagating source edits or tracking per-field overrides. Accepted actions are snapshots and change only through normal editing or explicit resync.
- Adding rules automation, a bundled rules database, external compendium fetching, or a generic multi-system adapter contract.
- Redesigning per-item editing for every grid-backed collection or renaming the repository-wide annotation Notes affordance; those broader UX concerns require separate evidence and follow-up.

## Capabilities

### New Capabilities

- `runtime-action-inference`: Defines inventory-based action suggestions, snapshot acceptance, source navigation, explicit resync, and safe fallback when a source item is deleted.

### Modified Capabilities

None. The existing `character-data-evolution` capability already requires sequential migration from supported older versions into the current validated representation.

## Impact

- Advances the versioned 5e character data layout and adds an optional item-source relationship to runtime actions; core inventory and feature records remain generic and flat.
- Adds an inventory-based suggestion and compact source-management workflow to a row-oriented 5e runtime-action UI while preserving manual and bulk action editing.
- Exercises schema migration, import/export round trips, typed edit reducers, focused Svelte UI, Storybook states, and browser behavior.
- Completes only the inventory-source slice of `p1-005`; backlog reconciliation must preserve the separately refined `p1-061` spell/feature follow-up.
