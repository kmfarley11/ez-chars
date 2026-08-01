# Active Goals

This document defines the active delivery boundary and records what is actually implemented. Use it with [the prioritized backlog](backlog.md) for day-to-day coding decisions. [PRD v1](vision/PRD-v1.md) defines the target first external playtest, while [author desires](vision/author-desires.md) preserve longer-term intent.

## Product Statement

Prepare a local-first, mobile-friendly character-data companion for a first external playtest across D&D 5e 2014, D&D 5e 2024, and Shadowdark. A user should be able to create, open, edit, reopen, use at the table, annotate, export, and import system-native characters without needing an account.

The current application is still a D&D 5e 2014-only pre-release baseline and has not begun real external playtesting. The approved PRD v1 schedules a target; it does not represent 2024 or Shadowdark behavior as shipped and does not freeze schemas.

Character data created during this phase is experimental and is not guaranteed to survive schema changes. The 2014 pre-playtest schema uses an explicitly unstable v0 epoch. Immediately before external handoff, each supported system must receive an explicit durable schema decision; only then does the migration policy in the [character-data versioning decision](decisions/2026-07-18-version-and-normalize-5e-character-data.md) become a product compatibility promise.

## Active Delivery Scope

- preserve and polish the implemented D&D 5e 2014 sheet as the first system proof;
- add explicit D&D 5e 2024 support for one adopted current SRD 5.2.x release, rechecked and pinned before public handoff;
- add a system-native Shadowdark sheet using user-authored data and the conservative external-source locator baseline; separately gate any bundled, excerpted, ingested, transformed, branded, or official-form behavior;
- maintain a local character list with authoritative system selection, creation, opening, deletion, and recovery;
- keep scene-relevant runtime sections and flexible quick notes useful across exploration, roleplay, and combat for both representative player characters and intentionally sparse sidekick/NPC records;
- provide system-native schemas and sheets without forcing 5e root fields onto other systems;
- validate local persistence and JSON backup/restore at system and I/O boundaries;
- provide rights-classified resource and curated-section discovery, lawful document navigation, and contextual locators without requiring a normalized compendium;
- establish a heuristic baseline for dense collections, focused row editing, annotations, and whole-sheet navigation under saturated data before external testing;
- meet the mobile, keyboard, touch, assistive-technology, empty-state, and error-handling gates in PRD v1;
- use Storybook and black-box browser tests for isolated and end-to-end evidence where appropriate.

## Out Of Scope

- systems beyond 2014 D&D, the one adopted 2024 D&D release, and Shadowdark, unless the owner explicitly amends PRD v1; Cairn v1 is the leading optional fourth-system candidate rather than implicit scope
- accounts or backend storage
- shared editing or multiplayer
- durable backward compatibility for character layouts created before the first real external playtest
- dice rolling engines or heavy rules automation
- hosting premium or copyrighted rules text
- a complete character builder, normalized rules compendium/API, arbitrary PDF ingestion, OCR, or image-sheet import
- making fillable-PDF import/export a first-playtest readiness prerequisite; the [interoperability audit](fillable-pdf-interoperability-audit.md) keeps it as an early complementary proof

## Success Criteria

- all six player-character and sparse-GM scenarios plus each system's saturation stress fixture in [PRD v1](vision/PRD-v1.md) pass an owner solo-play readiness rehearsal;
- external participants complete at least one session in each target system before a product-v1.0 decision;
- data survives reload and JSON backup/restore without corruption, silent shape drift, or loss of meaningful absence;
- runtime information and flexible quick notes meet the measured mobile interaction gates;
- configured rules topics can be found and opened through the rights-approved reference path;
- critical data-safety, accessibility, table-use, and content-rights blockers are resolved before external handoff;
- the dated anonymized pre-playtest survey synthesis remains traceable to readiness priorities, and post-playtest feedback is synthesized before a product-v1.0 decision;
- local verification passes according to [docs/verification.md](verification.md).

## Current Status

### Done

This is a capability summary for the completed 2014 baseline, not a chronological changelog. Recent implementation history remains in the backlog, archived OpenSpec changes, and Git history.

- SvelteKit application, theme, local character management, validated localStorage recovery, and versioned JSON import/export are established.
- The substantial D&D 5e 2014 sheet covers runtime and organizational regions, direct and structured editing, annotations, features/traits, spells, inventory, notes, and action-economy summaries.
- Strict `dnd5e-2014.schema.v0` validation, typed feature-local projections/edit intents, deterministic persistence boundaries, and non-destructive unsupported-data handling protect the intentionally unstable pre-playtest epoch.
- Runtime actions support custom creation plus searchable inventory, spell, feature, and trait snapshots with stable source identity, source navigation, confirmed resync, and source-deletion fallback.
- Reusable grid, field-binding, dialog, Storybook, storage, and utility boundaries support the implemented sheet without claiming a universal cross-system rendering contract.
- The home-to-sheet accessibility and verification baseline includes keyboard, touch, modal/popover context, mobile geometry, unit/component coverage, and black-box browser checks.

### Partial

- 5e sheet route still does not expose every optional schema field or deeper 5e detail
- the target field interaction model, field binding/mutation contract, and field/card API are documented in [docs/field-interaction-model.md](field-interaction-model.md), [docs/field-binding-contract.md](field-binding-contract.md), and [docs/field-rendering-api.md](field-rendering-api.md); broader feature work can now build on the extracted 5e projection and typed edit boundary

### Missing

- polished empty states
- 2024 D&D and Shadowdark system schemas, creation choices, routes, sheets, and fixtures
- a system-dispatch and computed-summary boundary that does not require the home list to inspect 5e fields
- a rights-classified resource library, curated-section search, and contextual reference navigation
- owner solo-play rehearsals, saturation stress evidence, and external evidence across the PRD matrix

### Deferred

- durable character-data migration support begins when the first external playtest activates explicit system schema-v1 decisions; no general v0 migration is promised, and the final 2014 v0 receives a one-time transition only if a later approved change defines it before handoff
- CI; local verification in [docs/verification.md](verification.md) remains the current source of truth until contributor count, release cadence, or branch-protection needs justify GitHub Actions.
- Firefox-specific dense-sheet scroll optimization; the completed CSS container-query replacement and representative profile did not implicate additional application layout work. `BL-064` will recheck macOS Firefox against saturated fixtures and reopen browser-specific optimization only if repeatable evidence implicates application code. Use the profiling workflow in [docs/verification.md](verification.md) for regressions.
