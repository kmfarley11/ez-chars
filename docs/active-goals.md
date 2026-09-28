# Active Goals

This document defines the active delivery boundary and records what is actually implemented. Use it with [the prioritized backlog](backlog.md) for day-to-day coding decisions. [PRD v1](vision/PRD-v1.md) defines the target first external playtest, while [author desires](vision/author-desires.md) preserve longer-term intent.

## Product Statement

Prepare a local-first, mobile-friendly character-data companion for a first external playtest across D&D 5e 2014, D&D 5e 2024, and Shadowdark. A user should be able to create, open, edit, reopen, use at the table, annotate, export, and import system-native characters without needing an account.

The current application is still a D&D 5e 2014-only pre-release baseline and has not begun real external playtesting. The approved PRD v1 schedules a target; it does not represent 2024 or Shadowdark behavior as shipped and does not freeze schemas.

Character data created during this phase is experimental and is not guaranteed to survive schema changes. The 2014 pre-playtest schema uses an explicitly unstable v0 epoch. Immediately before external handoff, each supported system must receive an explicit durable schema decision; only then does the migration policy in the [character-data versioning decision](decisions/2026-07-18-version-and-normalize-5e-character-data.md) become a product compatibility promise.

## Active Delivery Scope

- preserve and polish the implemented D&D 5e 2014 sheet as the first system proof;
- add explicit D&D 5e 2024 support for the adopted SRD 5.2.1 release, with provenance rechecked before public handoff and any later-version upgrade requiring an explicit owner decision;
- add a system-native Shadowdark sheet using user-authored data and the conservative external-source locator baseline; separately gate any bundled, excerpted, ingested, transformed, branded, or official-form behavior;
- maintain a local character list with authoritative system selection, creation, opening, deletion, and recovery;
- keep scene-relevant runtime sections and flexible quick notes useful across exploration, roleplay, and combat for both representative player characters and intentionally sparse sidekick/NPC records;
- provide system-native schemas and sheets without forcing 5e root fields onto other systems;
- validate local persistence and JSON backup/restore at system and I/O boundaries;
- provide rights-classified resource and curated-section discovery, lawful document navigation, and contextual locators without requiring a normalized compendium;
- provide a clear voluntary external-playtest feedback path with owner-approved questions before inviting participants, without adding hidden telemetry or transmitting character data;
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
- Runtime actions support custom creation plus searchable inventory, spell, feature, and trait snapshots with stable source identity, source navigation, confirmed resync, and source-deletion fallback; five-item previews and dense responsive browsing keep larger action sets reachable without dominating the sheet.
- Weapons, Armor & Shields, Other Gear, and Spells provide searchable responsive dense-collection browsing, focused row editing and notes, sparse spell-slot setup, and repeatable saturated-sheet verification without making every short collection adopt the same density controls.
- Features, Traits, Languages, and Tools retain compact bullet presentation and focused record Detail/Edit while seven-item previews, search, and bounded or focused browsing keep saturated supporting collections manageable.
- Inventory, spells, Features, Traits, Languages, and Tools support stable first-class row-level Pin/Unpin priority with deterministic priority-first alphabetical presentation, reload and JSON round trips, and durable Language/Tool identities. The familiar presentation and mutation boundary are reusable while identity, validation, mutation, and persistence remain system-owned; the reusable batch manager is dormant, and Runtime Actions deliberately retain their independent order and navigation.
- Focused field-group, structured-form, annotation, dialog, responsive-layout, panel, collapsible-panel, dense-list, and domain-owned card boundaries support the implemented sheet without claiming a universal cross-system rendering contract.
- The home-to-sheet accessibility and verification baseline includes keyboard, touch, modal/popover context, mobile geometry, unit/component coverage, and black-box browser checks.
- Official SRD 5.1 and SRD 5.2.1 PDFs are self-hosted with centralized attribution and provenance; the conservative Shadowdark citation baseline and protected maintainer review boundary are established for later resource-navigation and system-sheet work.
- Rights-classified resource discovery, an app-controlled self-hosted SRD viewer, persistent general Rules access, class/equipment/spell locators, explicit external source states, and annotation reference routing are complete for the 2014 sheet. The accepted playtest baseline carries a temporary Firefox/macOS rapid-scroll compatibility notice; `BL-072` owns cross-platform classification, while `BL-082` and `BL-080` own broader phone-reader optimization and user-local PDF connection.
- The 2014 sheet now provides an owner-approved, system-owned landmark hierarchy through a responsive expanded outline and compact icon rail. Explicit jumps reopen collapsed ancestors, focus visible headings, participate in deduplicated Back/Forward history, coexist with Rules navigation, and keep Abilities & Proficiencies separate from Features & Traits without imposing 2014 vocabulary on later systems.
- Core mobile viability is established across the application: the home route adapts cleanly between a desktop data table and touch-friendly mobile card list with formatted summary projections and 44px touch targets; menu popovers use a centralized close seam that immediately resets trigger disclosure before dialog display; and a 16px mobile input typography baseline prevents involuntary iOS Safari focus zoom while preserving user pinch-to-zoom.
- The 2014 sheet now follows an owner-approved three-tier read-first interaction language: frequent runtime values retain stable inline editing, richer fields and records use focused atomic Detail/Edit with record-local Notes, and scan-first collections provide direct Add, focused eligible Remove, and row-level Pin/Unpin through shared field, group, and workflow components while domain adapters retain validation and mutation ownership.

### Partial

- 5e sheet route still does not expose every optional schema field or deeper 5e detail
- the current field interaction and binding/mutation contracts are documented in [docs/field-interaction-model.md](field-interaction-model.md) and [docs/field-binding-contract.md](field-binding-contract.md); the component-composition ADR owns the current field/card boundaries, while [docs/field-rendering-api.md](field-rendering-api.md) is retained only as historical rationale
- the completed `BL-074` refactor retired the legacy `GridContent` and `GridContainer` boundaries after decomposing them into focused field-group, structured-form, annotation, dialog, responsive-layout, surface, collapsible-panel, and domain-owned card responsibilities; completed `BL-076` exercised those seams for Runtime and supporting collections, completed `BL-075` layered reusable Pin/Unpin UX over domain-owned identity and persistence, and completed `BL-077` established shared read-first field/group/workflow behavior without claiming a universal collection or system model

### Missing

- polished empty states
- 2024 D&D and Shadowdark system schemas, creation choices, routes, sheets, and fixtures
- a system-dispatch and computed-summary boundary that does not require the home list to inspect 5e fields
- explicit collection-owned quickfilters beyond text search, including Runtime Action timing and Spell level/Prepared state, plus Runtime Action player priority; P0 `BL-078` owns that proof and persisted action Pin/Unpin before external handoff
- final integrated review of BL-085's approved focused-editing rollout: targeted labels and independently saved field/note edits now use shared UI and full candidate validation across the 2014 sheet; class/scratchpad lifecycle remains explicit, and final user approval is still required before later sheets inherit the completed baseline
- final mobile rules-reader control refinement beyond the acceptable default-collapsed `BL-069` navigation baseline; P0 `BL-082` owns the evidence-driven toolbar, disclosure, and auto-hide decision before matrix hardening
- an owner-approved external-playtest question set and verified in-app feedback path; the final P0 `BL-081` gate owns delivery before invitations are sent
- continued owner solo-play rehearsals and external evidence across the PRD matrix; saturated 2014 rehearsal validated the revised spell, inventory, Runtime Action, supporting-collection, and whole-sheet navigation surfaces, while completed `BL-084` and `BL-077` resolved core mobile viability and the read-first interaction baseline, and P0 `BL-085` and `BL-082` own the remaining compound-editor polish and rules-reader blockers found during final review.

### Deferred

- durable character-data migration support begins when the first external playtest activates explicit system schema-v1 decisions; no general v0 migration is promised, and the final 2014 v0 receives a one-time transition only if a later approved change defines it before handoff
- CI; local verification in [docs/verification.md](verification.md) remains the current source of truth until contributor count, release cadence, or branch-protection needs justify GitHub Actions.
- Broader Firefox-specific dense-sheet scroll optimization remains deferred. Final `BL-069` review supplied evidence against both the original translucent sticky row and compositor-forcing hints on its compact replacement; the bounded control now avoids blur, layout containment, and forced transforms, but rapid scrolling still produces black/unpainted regions in the owner's Firefox-on-macOS environment. The pre-release notice recommends another current browser when this disrupts play. `BL-072` owns headed Firefox comparison on macOS and a non-macOS environment, profiling, supported-platform classification, and the decision to retain, revise, or remove that notice.
