# Current MVP

This document defines the only active product scope for near-term implementation. Use this doc with [docs/mvp-backlog.md](mvp-backlog.md) for day-to-day coding decisions.

## Product Statement

Build a local-first, mobile-friendly web app for viewing and editing D&D 5e 2014 character sheets. A user should be able to create, open, edit, reopen, export, and import characters without needing an account.

## In Scope

- single system: D&D 5e 2014
- home/list view for local characters
- create, open, edit, and delete characters
- deep-linkable 5e character sheet route
- runtime sections that are usable at the table
- organizational sections that do not crowd runtime info
- field-level annotations and source references where they improve usability
- LocalStorage persistence with schema validation at I/O boundaries
- JSON import/export for backup and restore
- mobile- and desktop-usable UI
- basic accessibility, empty states, and error handling

## Out Of Scope

- additional game systems
- accounts or backend storage
- shared editing or multiplayer
- PDF import/export
- Storybook
- dice rolling engines or heavy rules automation
- hosting premium or copyrighted rules text

## Success Criteria

- a user can create or open a character and reach an editable sheet quickly
- data survives reloads without corruption or silent shape drift
- exported JSON can be imported back into the app
- the main sheet is usable on phone-sized screens
- local verification passes according to [docs/verification.md](verification.md)

## Current Status

### Done

- SvelteKit app scaffold
- 5e 2014 schema/model foundation
- reusable grid display/editing primitives
- localStorage persistence with load-time schema validation, versioned storage envelope, and recovery notice
- basic character management: create, open, and delete from the home view, plus clear invalid-id handling on the 5e route
- theme system
- major 5e sheet surface for the MVP: overview, quick reference, abilities/proficiencies/features/traits, action-economy runtime summaries, spells, inventory, and background/roleplay/notes, with runtime and organizational regions visually separated
- field-level editing and annotation UX for surfaced runtime/state fields: high-frequency runtime values have persistent direct edit controls, reference/profile cards keep quieter menu-driven fallback editing, and Notes dialogs support annotation review/add/edit flows
- JSON import/export with a versioned backup envelope, file download, file validation, replace behavior, and merge-new behavior that skips duplicate character IDs
- local automated verification with Vitest contract tests, coverage reporting, schema/import-export/storage coverage, and a thin create/edit/reload smoke path

### Partial

- 5e sheet route still does not expose every optional schema field or deeper 5e detail
- the target field interaction model, field binding/mutation contract, and field rendering consolidation direction are documented in [docs/field-interaction-model.md](field-interaction-model.md), [docs/field-binding-contract.md](field-binding-contract.md), and [docs/field-rendering-api.md](field-rendering-api.md); `GridContent` and `InlineFieldDraft` still need implementation work toward that shared field/card API, including simpler field/card descriptor authoring, before route-level projection and patch glue extraction can leave the sheet ready for broader feature work

### Missing

- polished empty states

### Deferred

- CI; local verification in [docs/verification.md](verification.md) remains the current source of truth until contributor count, release cadence, or branch-protection needs justify GitHub Actions.
