# PRD v1 — First External Playtest Contract

- **Status:** Approved target-state contract; not yet implemented
- **Owner:** Product author
- **Date:** 2026-07-31
- **Approved:** 2026-08-01
- **Last reviewed:** 2026-08-01 during `BL-067` refinement

This PRD defines the product ez-chars intends to place in its first external playtest. It does not describe the application as shipped today. The [active goals](../active-goals.md) are the authority for current behavior; the [author desires](author-desires.md) explain the longer horizon; the [dated survey synthesis](evidence/2026-08-01-pre-playtest-surveys.md) records the directional pre-playtest evidence reconciled into this revision.

Approving this document does not release product v1.0 or freeze character schemas. Those are later, evidence-based milestones defined below.

## Product Premise

ez-chars is a free, local-first, mobile-friendly character-data companion for tabletop role-playing games. Its north star is:

> Put the information a player or GM needs during play immediately at hand, and make human-authored changes or quick notes feel easier than managing a paper or PDF sheet.

The product sits between a form-fillable character sheet and a full virtual tabletop. It provides system-appropriate structure, but it does not require a complete build, adjudicate character legality, or replace the underlying rules.

## Playtest Jobs

The first external playtest must test both jobs in every target system:

1. **Player-character maintenance:** a friend can store, review, change, annotate, back up, and restore a character on a phone without an account.
2. **GM-managed sidekick or NPC use:** a GM can keep an intentionally sparse record useful at the table without completing a full player-character sheet.

The default hypothesis is that one sparse-friendly system sheet can serve both jobs. A focused lite or stat-block presentation is permitted later if the playtest shows that the regular sheet obscures rather than supports the GM job.

## Target Systems and Rules Sources

The playtest target contains three explicit systems:

- **D&D 5e 2014**, using SRD 5.1 as its rules-source line;
- **D&D 5e 2024**, using the project's adopted current SRD 5.2.x release; SRD 5.2.1 is the planning baseline, and the project will recheck and pin the latest official release before public handoff rather than preserve simultaneous behavior for earlier 5.2 releases;
- **Shadowdark**, using user-authored character data and the conservative bibliographic/page/name reference baseline in the [rules-resource policy](../rules-resource-policy.md). Bundling, excerpting, full-text processing, official form interoperability, and broader branded-content use remain separately gated.

Each system retains its own identity, rules version, validated character schema, field meanings, editing behavior, projections, and sheet layout. Shared creation, storage, backup, routing, and computed summary infrastructure may emerge, but 5e-shaped persisted fields are not a prerequisite for supporting another system.

Shadowdark remains a playtest system even though its sources remain external. Its minimum sheet does not redistribute rules content or claim to be a character builder: users author their own data, and the app points them to the official source through conservative locators. A fourth, clearly licensed system ([Cairn v1.0](https://cairnrpg.com/first-edition/cairn-srd/)) is the leading optional candidate, but it enters this PRD only through an explicit owner-approved scope amendment when it would provide otherwise missing architectural or resource evidence.

## Minimum Product Experience

### Character ownership and navigation

A user can:

- create a character by selecting one of the target systems;
- identify a character and its system from the local character list;
- open the correct system-specific sheet through a stable destination;
- edit only the data they know, save locally, reopen it, delete it deliberately, and recover non-destructively from invalid or unsupported input;
- export all supported characters to validated JSON and restore them through a reviewed import flow.
- reach an applicable SRD, quickstart, or other registered source index while reviewing or editing character data, so official source material can facilitate manual entry and lookup without becoming a builder or compendium.

### Runtime-first sheets

Every target sheet must:

- surface its most important current state, defenses, actions or abilities, carried equipment, and quick notes without requiring edit mode;
- surface system-relevant exploration, roleplay, or scene information where the scenario needs it rather than treating runtime as combat-only;
- permit absent optional data without broken, misleading, or completion-blocking presentation;
- keep quick user-authored notes no more than two deliberate control activations from the open sheet;
- provide a clear way to change surfaced runtime values without navigating through an unrelated creation workflow;
- preserve user-authored language and annotations instead of forcing all detail into fixed rules fields.

The exact fields and organization are system-native. Similar labels across systems do not imply identical stored shapes.

Runtime-first does not require combat, exploration, and roleplay to receive equal visual weight. Combat may remain especially prominent where its rules density and time sensitivity warrant it. This playtest contract does not require a pillar selector or scene mode, and it does not permit required information to become unreachable merely because a focus is active.

Sheets should nevertheless share a recognizable interaction language where the concepts genuinely fit: accessible cards and rows, focused editing, annotations, data bindings, dialogs, navigation landmarks, and predictable feedback should be reused or adapted rather than rebuilt as unrelated page monoliths. This is a presentation and interaction goal, not a universal persisted schema or rendering-description language.

The existing rough 5e, Shadowdark, and Cairn Excalidraw files are non-normative design evidence. The relevant implementation epics must audit their runtime priorities, visual anchors, and system-specific groupings before starting fresh, while remaining free to reject details that do not survive accessibility, mobile, saturation, or implementation evidence.

### Rights-safe reference access

A user can:

- browse or search supported resource titles and curated section metadata;
- find a configured topic such as character creation, actions, spells, or equipment and navigate to the lawful document location;
- reach a relevant resource locator from supported editing contexts without being required to follow it;
- use a stable self-hosted source when the project has verified redistribution rights, or a conservative external locator when it has not.

The resource catalog is a document-navigation index. It may store titles, topics, section labels, page numbers, anchors, and URLs, but the playtest does not require normalized rules records, full-text ingestion, semantic search, or a public compendium API.

### Mobile and accessible operation

The complete matrix must work at a 360-by-800 CSS-pixel viewport and at desktop width with:

- no document-level horizontal overflow during the core scenario;
- keyboard access in a logical responsive order;
- visible focus and programmatic names for core controls;
- touch targets and documented exceptions that meet the repository accessibility baseline;
- dialogs, menus, scrolling regions, and resource navigation that do not strand focus or hide required content.

## Playtest Scenario Matrix

Each row is a required end-to-end scenario. Example character concepts make the evidence repeatable; they do not add rules validation or a builder requirement.

| System | Representative player character | Intentionally sparse GM record | Reference proof | Exit evidence |
| --- | --- | --- | --- | --- |
| D&D 5e 2014 / SRD 5.1 | A spellcasting character with current HP, defenses, at least one spell, inventory item, feature, runtime action, and authored note | A sidekick or NPC with a name, minimal defenses/HP, one useful action, and one note while unrelated player fields remain absent | Find and open the configured character-creation, equipment, and spell sections; expose at least one contextual locator from editing | Both records survive reload and JSON backup/restore; the user can find runtime state, change HP, use or inspect an action, and add a quick note on mobile |
| D&D 5e 2024 / adopted current SRD 5.2.x | A character demonstrating 2024-native origin/species, a class feature or weapon mastery, an action, equipment, and optional spellcasting | A sparse ally or opponent with only identity, runtime defenses/state, one action or ability, and a note | Find and open the adopted 2024 character-creation, equipment, actions, and spell sections without falling back to the 2014 source | The system is unmistakable in creation/list/sheet/backup; native 2024 data round-trips without being coerced into the 2014 schema |
| Shadowdark / conservative external-source scope | A low-level crawler with core stats, defenses/HP, gear slots, one attack or ability, talents or spells where applicable, and an authored note | A hireling, companion, or NPC with a name, the few runtime values used at the table, one capability, and one note | Navigate to the official quickstart acquisition page and configured bibliographic page/name locations without hosting or ingesting the source | The compact system shape remains usable without 5e-only fields, survives backup/restore, and supplies enough runtime information for a short encounter or scene |

For each scenario, the tester begins with a supplied fixture, performs at least one edit and one quick-note change, reloads, exports, removes or isolates the local record, imports the backup, and confirms the restored visible values.

### Saturation stress overlay

Before external handoff, each system also needs a deliberately saturated fixture or overlay representative of campaign growth. It should contain enough items, actions or abilities, features or equivalents, modifiers, annotations, and long or repeated notes to expose excessive page growth, ambiguous placement, hidden controls, nested-scroll problems, and slow retrieval.

The owner rehearses the same runtime, editing, note, reference, mobile, keyboard, reload, and backup tasks against both sparse and saturated data. The sheet must retain understandable visual and navigation anchors, and each authored fact should have a reasonably clear home. Collection search, a whole-sheet search, a sheet outline, sticky summaries, tabs, or focused expansion are candidate remedies only when this stress evidence demonstrates the need; this PRD does not preselect one.

## Persistence and Interchange

Validated system documents are the full-fidelity source of truth. JSON is the lossless backup and restore format for those documents.

Publisher-provided fillable character-sheet PDFs are early interoperability targets and schema evidence, not canonical storage. Before durable schemas freeze, maintainers must audit each available form's version, rights, field identifiers, capacity, transformations, and information loss. The audit determines which bounded PDF export or import slices, if any, are prerequisites for external playtesting.

Images, scans, OCR, inferred extraction, arbitrary uploads, and server-side document processing are outside this playtest contract.

## Explicit Non-Goals

- a complete character-creation wizard or mandatory step-by-step fillout;
- rules legality validation, optimization, encounter automation, initiative, or dice rolling;
- cloud accounts, synchronization, shared editing, or multiplayer;
- a general-purpose normalized rules compendium, rules-serving API, or character-builder content service;
- premium-content hosting, unlicensed redistribution, or treating free price as processing permission;
- simultaneous support for every revision in the D&D 2024 SRD line;
- a mandatory dedicated NPC schema or stat-block mode before the sparse-sheet hypothesis is tested;
- a mandatory pillar selector, automatically inferred scene mode, or default hiding of sheet sections;
- image/scanned-sheet import, OCR, semantic indexing, or arbitrary user document uploads;
- live integration with D&D Beyond, Dungeons and Dashboards, or another external product;
- systems or horizons beyond the three-system target without a separate scope decision.

## Milestones

These milestones are deliberately separate:

1. **PRD v1 approved:** the human owner accepts this target contract and the roadmap can execute its independent epics. The app remains pre-release and 2014-only behavior remains the shipped baseline until changed.
2. **Playtest ready:** every automated gate and owner solo-play rehearsal below passes, content use stays within the documented source classification, and the sparse, representative, and saturated scenario fixtures are usable.
3. **First external playtest begins:** the supported build is handed to outside participants. Before handoff, every target system receives an explicit durable character-schema decision. This activates v1-or-later compatibility promises; it is not caused by PRD approval alone.
4. **Findings reconciled:** critical findings are fixed, lesser findings are deliberately accepted, deferred, or backlogged, and the PRD/active goals/ADRs reflect any changed product or architecture decisions.
5. **Product v1.0 decision:** the owner decides whether the reconciled product merits a public v1.0 label. This decision is not automatic after one playtest session.

## Playtest-Readiness Gates

The build is ready to give external testers only when all of the following are true:

- **Scenario completeness:** all six matrix scenarios pass an owner solo-play rehearsal on a phone-sized viewport; each of the three player-character scenarios also passes at desktop width.
- **Sparse-to-saturated navigation:** each system's saturation fixture remains operable at phone and desktop widths; the owner can find declared runtime values, edit a specified collection row, locate an annotation, and add a note without losing context or relying on undocumented duplicate placement.
- **Guided maintenance:** a tester unfamiliar with part of the sheet can identify a reasonable place to enter one known value, understand that unrelated data may remain absent, and reach the configured authoritative reference without being forced through a creation wizard.
- **Fast runtime access:** from an open sheet, each scenario's declared current state, primary action/capability, and quick notes are visible or reachable with at most one deliberate control activation. Scrolling within the sheet is not counted as leaving the runtime context.
- **Flexible quick notes:** a tester can create or amend the scenario's quick note with at most two deliberate control activations from the open sheet, without completing unrelated fields.
- **Data safety:** every scenario's edits survive reload; its JSON export imports into an isolated local state; identity, runtime values, collections, annotations, and meaningful absence match after restore; invalid or unsupported imports do not overwrite valid local data.
- **Reference finding:** for each configured scenario topic, the tester can identify a relevant indexed section within 30 seconds, open the intended document location, and return without losing an in-progress sheet edit.
- **Mobile/accessibility:** the representative mobile viewport has no document-level horizontal overflow; automated accessibility and keyboard checks pass; all baseline touch targets or approved exceptions are accounted for.
- **Rights and provenance:** every exposed source is present in the source register with an adopted version, authoritative URL, classification, permitted use, attribution instruction, and unresolved constraints. Shadowdark behavior stays within the cleared scope.
- **Verification:** the repository's applicable smoke, unit, component, and cross-browser gates pass for all implemented system flows.
- **No critical blocker:** there is no known path that loses or silently corrupts authored data, prevents a core scenario by keyboard or touch, exposes material outside its approved rights classification, or makes the wrong system/schema appear valid.

## Product-v1.0 Decision Gates

After external testing, a product-v1.0 decision requires:

- at least one completed external session for each target system, with the six scenarios collectively exercised;
- every critical finding resolved and reverified;
- every high-impact finding either resolved or explicitly accepted with rationale, owner, and backlog destination;
- no unresolved source-rights claim in public product behavior;
- durable schema identifiers, compatibility promises, recovery behavior, and source versions documented for the released systems;
- playtest observations reconciled into active goals, prioritized backlog items, specifications, and ADRs where their authority applies;
- post-playtest feedback, including a short external survey administered outside the application, synthesized with response count, limitations, and resulting decisions;
- explicit feedback on whether contextual references, empty states, focused editing, and transparent aids provided enough guidance or whether a bounded creation workflow should be promoted;
- an explicit human-owner approval rather than an inferred release from passing automation.

## Compatibility Boundary

The current `dnd5e-2014.schema.v0` remains an unstable pre-playtest epoch. No general v0-to-v1 migration is promised. Immediately before the first external playtest, maintainers must explicitly choose whether the final 2014 v0 shape receives one bounded, one-time transition to its first durable version; earlier v0 shapes remain unsupported.

Every target system must begin external playtesting with a declared durable version policy consistent with the [character-data versioning decision](../decisions/2026-07-18-version-and-normalize-5e-character-data.md). Schema identifiers are independent of this PRD's approval and the eventual product v1.0 label.

If evidence after that boundary calls for a fundamental schema reset, the project must immediately revisit durable escape and interchange paths—including bounded editable-PDF export/import where the forms and rights make it viable—before asking users to cross the reset. PDF remains a lossy interoperability format rather than a replacement for JSON, explicit versions, migrations, and recovery.
