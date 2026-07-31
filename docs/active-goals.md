# Active Goals

This document defines the active delivery boundary and records what is actually implemented. Use it with [the prioritized backlog](backlog.md) for day-to-day coding decisions. [PRD v1](vision/PRD-v1.md) defines the target first external playtest, while [author desires](vision/author-desires.md) preserve longer-term intent.

## Product Statement

Prepare a local-first, mobile-friendly character-data companion for a first external playtest across D&D 5e 2014, D&D 5e 2024, and Shadowdark. A user should be able to create, open, edit, reopen, use at the table, annotate, export, and import system-native characters without needing an account.

The current application is still a D&D 5e 2014-only pre-release baseline and has not begun real external playtesting. PRD v1 approval schedules a target; it does not represent 2024 or Shadowdark behavior as shipped and does not freeze schemas.

Character data created during this phase is experimental and is not guaranteed to survive schema changes. The 2014 pre-playtest schema uses an explicitly unstable v0 epoch. Immediately before external handoff, each supported system must receive an explicit durable schema decision; only then does the migration policy in the [character-data versioning decision](decisions/2026-07-18-version-and-normalize-5e-character-data.md) become a product compatibility promise.

## Active Delivery Scope

- preserve and polish the implemented D&D 5e 2014 sheet as the first system proof;
- add explicit D&D 5e 2024 support for one adopted current SRD 5.2 release;
- add a system-native Shadowdark sheet after its written-permission or qualified-review gate defines the allowed public source integration;
- maintain a local character list with authoritative system selection, creation, opening, deletion, and recovery;
- keep runtime sections and flexible quick notes useful for both representative player characters and intentionally sparse sidekick/NPC records;
- provide system-native schemas and sheets without forcing 5e root fields onto other systems;
- validate local persistence and JSON backup/restore at system and I/O boundaries;
- provide rights-classified resource and curated-section discovery, lawful document navigation, and contextual locators without requiring a normalized compendium;
- establish a heuristic baseline for dense collections, focused row editing, and annotations before external testing;
- meet the mobile, keyboard, touch, assistive-technology, empty-state, and error-handling gates in PRD v1;
- use Storybook and black-box browser tests for isolated and end-to-end evidence where appropriate.

## Out Of Scope

- systems beyond 2014 D&D, the one adopted 2024 D&D release, and Shadowdark
- accounts or backend storage
- shared editing or multiplayer
- durable backward compatibility for character layouts created before the first real external playtest
- dice rolling engines or heavy rules automation
- hosting premium or copyrighted rules text
- a complete character builder, normalized rules compendium/API, arbitrary PDF ingestion, OCR, or image-sheet import
- making fillable-PDF import/export a first-playtest readiness prerequisite; the [interoperability audit](fillable-pdf-interoperability-audit.md) keeps it as an early complementary proof

## Success Criteria

- all six player-character and sparse-GM scenarios in [PRD v1](vision/PRD-v1.md) pass the owner-run readiness rehearsal;
- external participants complete at least one session in each target system before a product-v1.0 decision;
- data survives reload and JSON backup/restore without corruption, silent shape drift, or loss of meaningful absence;
- runtime information and flexible quick notes meet the measured mobile interaction gates;
- configured rules topics can be found and opened through the rights-approved reference path;
- critical data-safety, accessibility, table-use, and content-rights blockers are resolved before external handoff;
- local verification passes according to [docs/verification.md](verification.md).

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
- consolidated field/card API for surfaced runtime/state proof surfaces: migrated runtime primitive fields render through descriptor-driven `GridContent` cards, inline affordances act as prioritized shortcuts, and card-wide Edit remains comprehensive for card values and structure
- feature-local 5e sheet metadata, projection, schema-backed edit decoder, and exhaustive typed intent reducer; structured card edits commit atomically while the route retains reactive selection, layout, direct RFC 6902 editing, and persistence dispatch
- strict `dnd5e-2014.schema.v0` character validation and serialization: the explicitly unstable pre-playtest layout is the only accepted 5e character shape, retired experimental and unknown future layouts are rejected non-destructively, and the shared core schema remains flexible for future systems
- any on-sheet inventory item, spell, general/class/subclass feature, or ancestry trait can seed an independently editable runtime-action snapshot through one searchable, categorized two-step review workflow, alongside direct custom-action creation; runtime rows pronounce Inventory, Spell, Feature, Trait, or Custom ownership, linked rows expose source-specific navigation and confirmed resync of only source-owned text, and source deletion preserves the snapshot as a custom action
- general/manual plus class/subclass entries appear through one editable Features list while Traits remain separate; persisted owners remain unchanged, stable identities distinguish duplicate names, and background features stay outside the action-source workflow pending provenance refinement
- JSON import/export with a versioned backup envelope, immediate native file selection, focused validation/review and success dialogs, explicit replace and duplicate-skipping merge-new choices, and export confirmation before browser download
- local automated verification with Vitest contract tests, coverage reporting, current-schema/import-export/storage/version-rejection coverage, and current plus outdated-data browser smoke paths
- refactored repo structure to separate $components, $storage, and $utils from the page-specific routing, significantly improving module ownership and file navigability
- local Storybook catalog for reusable components: typed BaseButton, Heading, and ValidatedInputField examples load the application styles and aliases, hot-reload locally, and run browser-backed interaction plus automated accessibility checks separately from unit tests
- bounded home-to-sheet accessibility baseline: phone/coarse-pointer controls expose explicit 44-by-44 CSS-pixel targets or documented exceptions, responsive keyboard order skips collapsed content, modal and popover context is preserved, and representative Mobile Chrome plus cross-browser checks protect the interaction contract

### Partial

- 5e sheet route still does not expose every optional schema field or deeper 5e detail
- the target field interaction model, field binding/mutation contract, and field/card API are documented in [docs/field-interaction-model.md](field-interaction-model.md), [docs/field-binding-contract.md](field-binding-contract.md), and [docs/field-rendering-api.md](field-rendering-api.md); broader feature work can now build on the extracted 5e projection and typed edit boundary

### Missing

- polished empty states
- 2024 D&D and Shadowdark system schemas, creation choices, routes, sheets, and fixtures
- a system-dispatch and computed-summary boundary that does not require the home list to inspect 5e fields
- a rights-classified resource library, curated-section search, and contextual reference navigation
- first-playtest rehearsals and external evidence across the six-scenario matrix

### Deferred

- durable character-data migration support begins when the first external playtest activates explicit system schema-v1 decisions; no general v0 migration is promised, and the final 2014 v0 receives a one-time transition only if a later approved change defines it before handoff
- CI; local verification in [docs/verification.md](verification.md) remains the current source of truth until contributor count, release cadence, or branch-protection needs justify GitHub Actions.
- Firefox-specific dense-sheet scroll optimization; the completed CSS container-query replacement and representative profile did not implicate additional application layout work. Use the repeatable profiling workflow in [docs/verification.md](verification.md) for regressions and route structural collection scaling through `BL-064`.
