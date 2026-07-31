# Multi-System Core and Computed-View Audit

- **Status:** Planning evidence for the first multi-system proposal
- **Date:** 2026-07-31
- **Runtime impact:** None; this audit does not change a schema

## Question

Which parts of the current shared character document represent genuinely shared lifecycle infrastructure, and which parts persist D&D 5e-shaped gameplay concepts that should be owned by an explicit system schema?

This audit compares the current 2014 implementation with the target 2024 D&D and Shadowdark experiences. The latter two are product requirements and publisher-form evidence, not implemented schemas. Final field names belong to their own OpenSpec changes.

## Current Boundary

The shared schema in `src/schema/zod/core.ts` currently requires:

- `meta`, including document ID, schema version, and timestamps;
- `system`, including system ID and optional rules version/source;
- `identity`, including a required name plus player name, pronouns, ancestry/lineage, background, alignment, appearance, description, tags, and annotations;
- optional root `features`, `inventory`, and `notes` collections;
- `systemData` as an unknown payload;
- optional root annotations.

The same module defines useful annotation, reference, feature, item, and note primitives. Reusable types and required root placement are different decisions: a system may reuse an annotation or reference shape without persisting it at the same path as 2014 D&D.

Current shared consumers also assume more than lifecycle metadata. `src/schema/storedCharacters.ts` parses the core before dispatch, and `src/lib/components/Table.svelte` reads 5e-shaped identity and class data directly to render the home list. These are concrete seams to replace with system parsing and a computed list summary rather than evidence that all systems should persist those fields.

## Three-System Comparison

| Current core concept | 2014 D&D evidence | 2024 D&D evidence | Shadowdark evidence | Audit conclusion |
| --- | --- | --- | --- | --- |
| Document ID and character-data version | Required for local identity and strict v0 validation | Required for authoritative dispatch and future evolution | Required for the same lifecycle reasons | Strong shared lifecycle candidate |
| Created/updated timestamps | Used by current local records | Useful but not a gameplay rule | Useful but not a gameplay rule | Shared lifecycle candidate, though exact requiredness can be reconsidered independently |
| System ID | Selects 2014 parsing and sheet behavior | Must distinguish 2024 from 2014 despite family similarity | Must select a non-5e schema and sheet | Required shared discriminator |
| Rules/source version | Records `SRD-5.1-2023` today | Must identify the one adopted SRD 5.2 release | Must identify the permission-cleared rules/source basis | Shared lifecycle concept; value semantics remain system-owned |
| Root identity object | Convenient for the current sheet and list | Similar labels exist, but 2024 origin/species vocabulary differs | Official form has Name, Race, Class, Level, Title, Alignment, Background, and Deity, but that does not make the 5e object universal | Keep identity data system-owned; project a shared list label/summary |
| Root features | 2014 general features coexist with nested class/background/ancestry feature references | 2024 will need its own feature, feat, mastery, origin, and class vocabulary | Official form combines “Talents / Spells” into one text area | 5e-shaped persistence; not a shared root requirement |
| Root inventory with generic item fields | Current 2014 groups project from generic records plus tags | Likely useful but system rules and fields differ | Official form exposes 20 gear slots, free-to-carry, and three coin fields | System-owned collections; shared search/display views may emerge |
| Root general notes | Current 2014 also has semantic roleplay and field annotations | Useful authoring capability, placement not yet proven | Sparse notes remain a product requirement, but the official sheet has no equivalent root model | Reuse note primitives where helpful; do not require one root notes array |
| Root annotations | Useful across 2014 fields and records | Desired product behavior | Desired product behavior, but storage location is unproven | Share annotation/reference vocabulary, not mandatory root placement |
| Opaque `systemData` | Contains most current 2014 behavior | Can contain a future explicit 2024 document | Can contain an explicit Shadowdark document | Directionally correct ownership, but “opaque payload under a 5e-heavy core” is heavier than necessary |

## Recommended Target Direction

The first multi-system proposal should evaluate a small validated envelope containing only authoritative lifecycle and dispatch data, with the complete gameplay document owned by the selected system. A likely direction is:

- document identity and character-data version;
- explicit system identity and adopted rules/source version;
- system-owned character data;
- only lifecycle metadata proven necessary across all systems.

This is a direction, not a frozen property list or TypeScript interface. The second-system proposal must decide whether `meta.schemaVersion` remains where it is, whether timestamps remain mandatory, and how unknown-system data fails non-destructively. It must not rename or move the 2014 v0 shape casually merely to produce aesthetic uniformity.

Reusable annotation, reference, note, item, or feature schemas may remain library primitives. Reuse must be opt-in from a system schema; it does not make the primitive a required root field.

## Computed Views for Shared Consumers

Shared application experiences should ask each supported system for narrow, read-only projections rather than inspect gameplay fields directly.

Evidence supports these first computed views:

### Character-list summary

Enough information to render and search the local list:

- stable character ID;
- primary display name with a safe fallback;
- system ID and user-facing system/rules label;
- optional system-native subtitle or concise summary;
- optional search text derived by that system.

The list must not require ancestry, alignment, or class values from every system.

### Sheet destination

An authoritative system-selected route or destination for opening a character. This is lifecycle/navigation behavior, not a promise that all system sheets share one layout or component contract.

### Backup and recovery description

Enough metadata to explain which parser/version accepted or rejected a document and to review import behavior. The system still owns hydration, validation, serialization, and migrations.

### Contextual reference topics

System code may project configured topics such as character creation, equipment, spells, or system-native equivalents into the document-navigation index. The underlying character data need not persist identical reference fields.

Possible future summaries for Dungeons and Dashboards, global search, or runtime dashboards remain deferred until a concrete consumer defines the minimum data and versioning contract.

## Explicit System Identity

The playtest must treat the systems as distinct even when code is shared:

- 2014 D&D retains its own system ID, SRD 5.1 rules version, strict schema, projections, edit intents, and layout;
- 2024 D&D receives a different system ID, adopted SRD 5.2.1 rules version, schema, projections, edit behavior, and layout;
- Shadowdark receives its own system ID, permission-cleared source version, schema, projections, edit behavior, and layout.

2014 and 2024 may share 5e-family helpers after comparison. Family reuse is not proof of a universal TTRPG adapter. Shadowdark is the required check against promoting D&D conventions into shared contracts.

## Decisions Required in the 2024 Proposal

The `BL-070` proposal must resolve:

1. the smallest envelope accepted before system-specific validation;
2. the registry or dispatch vocabulary needed for creation, parse/serialize, list summary, and sheet destination;
3. non-destructive behavior for unknown systems and unsupported versions;
4. whether 2014 v0 is reshaped before external playtesting or retained until the explicit final-v0 decision;
5. how shared primitives are imported without creating mandatory root collections;
6. which 5e-family helpers are proven by both D&D systems and remain explicitly non-universal;
7. focused contract tests for dispatch, summaries, backup/restore, and system isolation.

Do not define a universal rendering schema, generic field registry, or shared edit-intent API in advance. System-specific sheet composition remains feature-local until repeated implementation evidence supports another seam.
