## Context

The current `dnd5e-2014.v3` model persists runtime-action sources as `{ kind: 'item', id }`. Inventory candidates are projected by an inventory-specific asynchronous suggestion function, the guided dialog receives raw inventory records, the runtime-action row projection joins only inventory, and the route owns navigation to inventory-group cards.

The application has not entered external playtesting, but its executable compatibility chain already includes `0.0.1`, `char.v1`, `dnd5e-2014.v2`, and `dnd5e-2014.v3`. Preserving those experimental layouts no longer reflects a user-facing compatibility promise. It increases the amount of schema, migration, fixture, and test context that every subsequent data-model change must reconcile. Git history, archived OpenSpec changes, and ADRs already preserve the evolution rationale without requiring old documents to remain executable.

The approved runtime-action architecture already identifies `{ kind: 'item' | 'spell' | 'feature', id }` as the destination. Completing that union requires more than widening a schema literal:

- spell and nested feature references currently allow missing IDs;
- general features, class/subclass feature references, ancestry traits, and background feature references occupy overlapping feature identity spaces;
- the Features sheet surface currently projects only class-owned entries, while general features are stored separately and Traits must remain a separate user-facing collection;
- acceptance, resync, deletion fallback, source labels, and navigation all contain inventory-only lookup logic;
- the guided picker needs one coherent candidate contract without turning raw character records into a generic multi-system registry.

The application remains local-first. Runtime actions link only to character-owned records; a future compendium may add or enrich those records but is not part of action-source resolution.

## Goals / Non-Goals

**Goals:**

- Rebase the canonical pre-playtest 5e layout to one explicitly unstable `dnd5e-2014.schema.v0` epoch.
- Remove executable compatibility with earlier experimental layouts while preserving strict current, future, and unsupported-data handling.
- Require every spell and feature reference in the current shape to have stable, unambiguous identity.
- Complete the persisted runtime-action source union for inventory items, spells, and features, with ancestry Traits represented by the feature kind.
- Centralize 5e-specific source resolution, draft mapping, display context, and deletion checks.
- Generalize the guided workflow around normalized, searchable on-sheet candidates and direct custom-action creation.
- Present general/manual and class/subclass entries together as Features while keeping Traits separate.
- Preserve snapshot ownership, explicit warned resync, multiple actions per source, commit-time validation, and safe deletion fallback.
- Keep new-record ID-allocation tests deterministic without adding a dependency.

**Non-Goals:**

- Canonical feature provenance or storage normalization.
- Background-feature action sources or merging Traits into Features.
- Retrospective source attachment, link replacement, per-field inheritance, or override masks.
- External compendium lookup inside the action workflow.
- Mechanical spell, feature, attack, damage, range, or action-economy inference.
- A system-neutral source registry, universal picker framework, or provider adapter API.
- Preserving pre-v0 local data or imports, or implementing the post-playtest v1 migration chain before real playtesting begins.

## Decisions

### 1. Rebase to an explicitly unstable `dnd5e-2014.schema.v0` baseline

The current schema will require:

- a non-empty `spellId` on every current spell reference;
- a non-empty `featureId` on every current nested feature reference, including ancestry, background, class, and subclass-owned references;
- feature IDs that are unique across the character's general features and all nested feature-reference collections;
- spell IDs that are unique within the character's spell collection; and
- runtime-action sources discriminated as `item`, `spell`, or `feature`.

Traits use `{ kind: 'feature', id }`; their separate presentation is not persisted in the runtime-action source. The source resolver derives whether a feature source is a general feature, class/subclass feature, or ancestry trait. Background feature IDs participate in collision prevention but are not eligible runtime-action sources in this change.

The strict current-character validator will reject duplicate source identities and source links that do not resolve to exactly one eligible character-owned record.

`dnd5e-2014.schema.v0` identifies the pre-playtest compatibility epoch rather than an immutable public layout. The permanent `.schema.` namespace prevents retired experimental identifiers from colliding with future supported versions. Until real playtesting begins, its strict shape may be replaced in place and previously saved v0 documents may become invalid. Current v0 documents are always validated before use, so shape drift cannot enter the application silently.

The first real external playtest will establish `dnd5e-2014.schema.v1` as an immutable supported layout. From v1 onward, each version identifier denotes one frozen shape and supported upgrades use explicit historical schemas and sequential pure migrations. Reusing or mutating a v1-or-later shape is prohibited.

**Alternatives considered:**

- Add a fourth `trait` source kind. Rejected because traits are feature records in the existing 5e model and the approved three-kind union already provides an atomic identity.
- Persist collection paths or class indexes in runtime-action links. Rejected because reordering or presentation changes would make links unstable and would couple actions to current storage layout.
- Keep advancing the experimental chain to v4. Rejected because it retains compatibility work for layouts that have no user-facing preservation promise.
- Reuse v3 while changing its meaning. Rejected because a dedicated v0 epoch communicates pre-playtest instability and gives the first playtest a clear v1 starting line.

### 2. Prune experimental compatibility without discarding the migration boundary

The implementation will remove pre-v0 version constants, historical document schemas, migration transforms, legacy fixtures, and tests whose only contract is accepting `0.0.1`, `char.v1`, v2, or v3 data. Those documents become explicitly outdated and unsupported.

The centralized hydration and serialization boundary remains. Hydration still:

- checks the system and declared character-data version before exposing data;
- validates current v0 data against the complete strict current schema;
- distinguishes unsupported earlier identifiers from recognizable future identifiers;
- returns explicit invalid, outdated, or future-data issues without rewriting the input; and
- serializes only validated current data.

Local storage already falls back without overwriting invalid/outdated source data and reports a recovery notice. Import similarly rejects unsupported documents without partially applying them. BL-065 communicates in advance that pre-release data preservation is not guaranteed.

New records created through the current application receive stable IDs through the sheet reducer's injected allocator. Unit tests inject deterministic values for those creation paths. Seeds, Storybook data, unit fixtures, browser fixtures, and current imports must provide the complete v0 identity shape directly; hydration does not invent missing IDs or repair collisions.

**Alternatives considered:**

- Retain the old files as unreferenced examples. Rejected because Git and archived planning artifacts preserve the evidence without leaving misleading near-current types in agent context.
- Add a temporary v3-to-v0 migration. Rejected because it recreates the compatibility work this baseline intentionally removes.
- Remove the centralized hydration boundary entirely. Rejected because strict validation and explicit version classification are the foundation required for safe v1-and-later migrations.

### 3. Keep feature storage in place and compose a Features edit projection

This change does not move records between the general feature collection and class-owned feature-reference arrays.

The Features sheet projection combines:

- general/manual feature records; and
- class and subclass feature references.

Each projected editor row carries non-persisted ownership metadata identifying either the general collection or a class index. The typed Features edit payload uses that discriminator to route updates back to the owning collection, preserve existing IDs and unexposed fields, add new manual entries to the general collection, and keep unrelated class arrays unchanged.

Ancestry Traits remain in their own card and receive a dedicated identity-preserving structured edit path so trait deletion can participate in runtime-action unlinking. Background features remain stored but are not projected into Features or offered as action sources.

**Alternatives considered:**

- Rename Class Features without including general features. Rejected because the label would misrepresent the data.
- Normalize all features into the general collection now. Rejected because source/grant provenance, duplicate grants, and external enrichment need a separate design.
- Merge Traits into Features. Rejected by the current product preference; the source workflow may share behavior without merging sheet collections.

### 4. Normalize on-sheet records into a 5e-specific source-candidate read model

A pure 5e domain module will own the discriminated switch for:

- resolving `{ kind, id }` against the current character;
- listing eligible candidates;
- deriving candidate category, source label, search text, concise context, and containing-card destination;
- producing source-owned draft text; and
- determining whether an existing link remains valid.

The UI candidate model contains a compound key derived from `kind` and `id`, the atomic persisted source, a user-facing category (`inventory`, `spell`, `feature`, or `trait`), label/detail/context, inventory or spell badges where applicable, and a source-owned text snapshot. Raw inventory, spell, and feature arrays do not enter the reusable picker API.

The candidate projection is synchronous. All inputs are already character-owned and local, while future external lookup is required to create or enrich a character-owned record before it can become an action source. The existing action-dialog loading/error seam will therefore be removed rather than retained as speculative provider infrastructure.

Svelte components receive typed immutable candidate props and report selection through callback props. Derived filtering remains side-effect-free. The picker will render the normalized row contract directly; a typed snippet prop is reserved for a later concrete need if source rows diverge beyond the normalized model.

**Alternatives considered:**

- Pass inventory, spells, Features, and Traits independently into the runtime-action card and dialog. Rejected because it spreads source-kind conditionals through UI components.
- Keep one separate dialog per source kind. Rejected because selection, search, draft review, and cancellation behavior are already the same concrete workflow.
- Build a generic system/provider registry. Rejected because only the 5e character model is implemented and external providers are outside this boundary.
- Preserve an asynchronous loader solely for future compatibility. Rejected because the future provider flow belongs before character ownership, not inside action selection.

### 5. Generalize the guided dialog without changing its two-step state model

The runtime-action card exposes one "Add action" command. The dialog keeps:

1. source/custom selection; and
2. focused draft review.

The selection step provides one text search, category filters for All, Inventory, Spells, Features, and Traits, source-specific context, and a persistent "Create custom action" option. The equipped-only filter is available only for the Inventory category; all inventory items remain eligible. Every on-sheet spell is eligible, with level and prepared state shown only as context.

Selecting a source seeds the draft, while choosing custom starts an empty unlinked draft with deterministic timing/category defaults. Navigating back retains the previous selection; no character mutation occurs until final confirmation. A compound source key prevents selection collisions between different persisted kinds.

The dialog organism composes the searchable picker molecule, existing action-draft form molecule, and dialog shell. The runtime-action card remains the route-specific organism coordinating the dialog, row presentation, bulk Edit/Notes fallbacks, and source commands.

### 6. Define source-owned text per concrete record kind

Draft and resync mapping is explicit:

- inventory item: owns action `name` and `notes`;
- spell: owns action `name` and `notes`;
- general feature: owns action `name` and `notes`, where notes use the first non-empty value of summary and description;
- class/subclass feature: owns action `name` only; and
- ancestry trait: owns action `name` only.

Acceptance seeds a draft from this mapping, but the user's reviewed draft is the saved snapshot. Resync re-resolves the current source and overwrites only the fields owned by that source kind. Removing inventory/spell notes or general-feature summary/description clears the corresponding snapshot notes on resync. Name-only class features and Traits never clear action-authored notes.

The UI requires confirmation before dispatching resync and explains that source-owned text may replace direct edits. No per-field selection is introduced.

### 7. Keep source lifecycle enforcement in typed domain edits

Action acceptance and resync re-resolve the source at commit time rather than trusting candidate display data. A custom draft creates an action without `source`. Multiple actions may retain the same source.

Structured edits that can remove inventory items, spells, general/class features, or Traits mark the affected source namespace for reconciliation. After the candidate character has applied the complete edit batch, one shared reconciliation pass removes links that no longer resolve while preserving action identity, order, snapshot fields, and annotations. This avoids duplicating unlink logic across each collection reducer without running speculative cleanup after unrelated primitive edits.

The runtime-action row projection uses the same resolver to produce source label and destination context. The route receives the atomic source reference for navigation, resolves its current containing card, scrolls that card into view, and moves focus to it:

- inventory source → current inventory group card;
- spell source → current spell-level card;
- general or class/subclass feature source → Features card;
- ancestry trait source → Traits card.

### 8. Test current contracts and pure domain behavior below component rendering

Current-schema validation, version rejection, source resolution, candidate filtering, draft mapping, resync ownership, and deletion reconciliation will be pure TypeScript units covered with nearby Vitest tests. Storage and import/export tests cover valid v0 round trips plus invalid, outdated, and future inputs without preserving historical business transformations. Storybook covers picker and dialog states with realistic mixed candidates, including duplicate names across categories, empty categories, filtered selection, custom creation, and mobile layout. Black-box Playwright covers the main persisted user flows and asserts roles, labels, text, focus, and reload behavior rather than component internals.

This follows first-party Svelte guidance to keep typed component inputs immutable, use derived state for filtering, and test extractable logic outside component rendering where possible.

## Risks / Trade-offs

- **[Risk] Existing local or exported characters become unsupported.** → Deliver BL-065 first, preserve explicit invalid/outdated recovery, never overwrite rejected source data, and limit the reset to the period before real playtesting.
- **[Risk] Treating v0 as mutable could normalize careless schema changes.** → Require every breaking v0 edit to pass strict I/O tests and reconcile the schema-versioning ADR; freeze immutable v1 before the first external playtest.
- **[Risk] Combining general and class-owned Features makes the bulk editor harder to reason about.** → Use an explicit ownership discriminator, preserve unexposed record fields, and cover mixed add/edit/delete batches with reducer tests.
- **[Risk] One `feature` source kind spans several collections.** → Enforce one character-wide feature identity namespace and centralize resolution in an exhaustive discriminated switch.
- **[Risk] Removing the asynchronous seam could appear to reduce future API readiness.** → Keep external lookup on the character-record side of the ownership boundary; reintroduce asynchronous UI only for a concrete provider workflow.
- **[Risk] Source-category filters and nested dialog state increase interaction coverage.** → Reuse the existing two-step shell and draft form, keep filtering pure, and add mixed-source Storybook and browser scenarios.
- **[Risk] Resync ownership differs between general and nested features.** → Make ownership explicit in one domain mapper and display a confirmation before every resync.

## Migration Plan

1. Deliver BL-065 so the pre-release preservation boundary is visible before the reset.
2. Replace the current version constant and strict current schema with the complete `dnd5e-2014.schema.v0` shape, including required source identities and the widened source union.
3. Remove pre-v0 historical schemas, transforms, fixtures, and compatibility expectations while retaining centralized current validation, serialization, and explicit outdated/future rejection.
4. Update all current seeds and test fixtures to v0, then prove current round trips and non-destructive rejection through schema, storage, import/export, and browser tests.
5. Widen the source resolver, typed edit intents, and UI in the same change so every reader understands the only persisted shape the application can produce.
6. Reconcile both schema-versioning and runtime-action ADRs before archival.

Rollback consists of reverting the application change and restoring repository-owned development fixtures from Git. User data written by an incompatible pre-playtest layout is not guaranteed to survive either direction of the reset. Rejected local or imported data must not be overwritten automatically.

## Open Questions

No product-scope questions block implementation. During apply, implementation may choose exact internal type and component names provided the persisted identity rules, source ownership, feature/trait separation, and observable workflow remain unchanged.
