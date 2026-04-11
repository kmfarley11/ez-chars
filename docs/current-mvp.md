# Current MVP

This document defines the only active product scope for near-term implementation. Use this doc with `docs/mvp-backlog.md` for day-to-day coding decisions.

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
- `npm run check`, `npm run lint`, and `npm run build` pass

## Current Status

### Done

- SvelteKit app scaffold
- 5e 2014 schema/model foundation
- reusable grid display/editing primitives
- localStorage persistence with load-time schema validation, versioned storage envelope, and recovery notice
- theme system

### Partial

- home/list view supports opening and creating characters but lacks full character management
- 5e sheet route exists but only covers part of the schema
- annotation/reference UI exists for surfaced fields

### Missing

- full 5e sheet coverage
- import/export
- tests and CI
- polished empty states and invalid-id handling
