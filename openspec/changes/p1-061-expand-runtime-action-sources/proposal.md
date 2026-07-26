## Why

Runtime actions can currently link only to inventory items, which forces players to recreate spell, feature, and trait text manually and leaves the approved three-kind source architecture incomplete. Completing the on-character-sheet source lifecycle now also creates the right pre-playtest schema baseline: one strict current shape without carrying every experimental predecessor as executable compatibility code.

## What Changes

- Allow every spell recorded on the character sheet to seed and link an independently editable runtime-action snapshot, regardless of prepared state.
- Allow general, class, and subclass Features plus ancestry Traits to seed and link runtime-action snapshots while keeping Features and Traits visually separate on the sheet.
- **BREAKING:** Rebase the pre-playtest character layout to `dnd5e-2014.schema.v0`, prune compatibility with earlier experimental layouts, and clearly reject outdated local or imported data instead of migrating it.
- Require stable, collision-free identities for every current spell, feature, and trait record before widening persisted action links.
- Expand the guided action-creation workflow so users can search and filter inventory, spells, Features, and Traits, review one focused draft, or create an unlinked custom action directly.
- Derive action-source candidates synchronously from character-owned records and remove obsolete loading and failure states from the local action-selection workflow.
- Preserve character-owned snapshot semantics across all source kinds, including commit-time source validation, explicit source navigation, warned resync, multiple actions per source, and safe unlinking when a source is deleted.
- Present general/manual and class/subclass entries through the Features sheet collection without prematurely normalizing their provenance or storage.

## Non-Goals

- Linking background features in this slice or merging Traits into the Features sheet collection.
- Retrospectively attaching a source to an existing custom action.
- Looking up external compendium records from the action workflow or persisting external-provider identity on runtime actions.
- Normalizing canonical feature provenance, introducing per-field inheritance or override modes, modeling action mechanics, or creating a generic multi-system source registry.
- Preserving or migrating experimental character layouts that predate the new v0 baseline; Git history, archived OpenSpec changes, and ADRs remain the historical record.
- Establishing the durable post-playtest migration chain in this slice; the first real playtest will freeze v1 and begin that compatibility obligation.

## Capabilities

### New Capabilities

- None. This change completes and broadens existing character-data, sheet-editing, action-inference, and guided-templating capabilities.

### Modified Capabilities

- `character-data-evolution`: Pre-playtest hydration and serialization will use one strict v0 baseline, reject earlier experimental layouts, and provide stable, unambiguous identities for all eligible on-sheet spell, feature, and trait sources.
- `character-sheet-editing`: The Features sheet collection will coherently edit general/manual and class/subclass entries while preserving their identities and current storage ownership; Traits remain separate.
- `runtime-action-inference`: Linked snapshot creation, presentation, navigation, resync, deletion fallback, and persistence will support spell and feature sources in addition to inventory items.
- `inventory-action-templating`: The inventory-only guided workflow will become a searchable multi-source action-creation workflow that also supports direct custom-action creation.

## Impact

- Replaces the accumulated experimental version chain with one strict `dnd5e-2014.schema.v0` hydration, serialization, local persistence, and import/export contract.
- Causes outdated local or imported characters to follow existing invalid/outdated-data recovery rather than receiving a best-effort migration.
- Widens the persisted runtime-action source union and the typed edit contracts that validate action acceptance, resync, source deletion, and feature collection edits.
- Expands the runtime-action card, guided dialog, searchable source selection, sheet navigation, and Features presentation while preserving the existing focused draft form and bulk Edit/Notes fallbacks.
- Requires schema, compatibility-pruning, projection, reducer, component, Storybook, unit, and browser-flow coverage; no new runtime dependency is expected.
- Refines the approved schema-versioning and runtime-action templating architecture decisions with the pre-playtest compatibility epoch, multi-source composition, and identity strategy.
