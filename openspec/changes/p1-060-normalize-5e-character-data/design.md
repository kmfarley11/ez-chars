## Context

The current 5e schema accepts several representations that make projection and editing more defensive than the domain requires. `systemData.runtimeActions` coexists with the legacy `attacks` alias; currency is encoded as tagged generic inventory items; fixed roleplay fields are discovered by matching general note titles; and languages are reconstructed from race and background subtrees. Root collections and several frequently edited structures are also optional because persisted documents are sparse.

Storage currently has an envelope-version dispatcher plus an isolated movement-number repair, while character parsing mostly sends data directly to the current strict schema. Import/export validates through the same parser. `meta.schemaVersion` exists but is not yet the central per-character migration discriminator, and `system.version` identifies the 5e rules/source version rather than the application data layout.

`p1-055` establishes semantic 5e edit intents before this change. Those intents should remain stable while their reducer implementations move from compatibility storage conventions to the canonical model defined here.

## Goals / Non-Goals

**Goals:**

- Establish one canonical, schema-backed 5e character model for runtime use, local persistence, and new exports.
- Dispatch explicit, pure, sequential migrations by `meta.schemaVersion` before current-schema validation.
- Preserve supported legacy data while removing action aliases, tag/title sentinels, and provenance reconstruction from steady-state code.
- Normalize structurally universal 5e collections and semantic singleton groups while retaining optionality where absence has domain meaning.
- Make load, import, save, and export use the same character hydration/serialization boundary.

**Non-Goals:**

- Changing the storage-envelope or export-envelope format solely because contained character data advances.
- Adding another game system or defining the final registry/adapter interface.
- Adding new character-sheet presentation or rules automation.
- Reorganizing the repository under `p1-050`.
- Making every 5e field required; meaningful absence remains distinct from an empty collection or empty semantic group.

## Decisions

### Decision 1: Use one canonical runtime and persisted 5e model

After hydration, application code receives the same current `CharacterDocument5e2014` shape that save and export serialize. Do not maintain a separate sparse wire model and fully hydrated runtime model. Two permanent models would add another bidirectional mapper and could reproduce the drift this change is intended to remove.

The current model requires empty root collections and structural groups that every 5e character can safely possess, including inventory, general notes, runtime actions, explicit currency, roleplay, and language/tool proficiency collections. Capability blocks whose absence is meaningful, such as spellcasting, remain optional and are initialized deliberately when an edit creates that capability.

### Decision 2: Separate data-layout version from ruleset version

Use `meta.schemaVersion` as the character data-layout discriminator and advance it to a new repository constant. Keep `system.id` as the system discriminator and `system.version` as the D&D 5e 2014 rules/source identifier.

Hydration follows:

```text
unknown input
    -> inspect system id and character schema version
    -> parse with the matching historical input schema
    -> run pure sequential migrations
    -> parse with the current canonical schema
    -> current CharacterDocument5e2014
```

Known older versions are accepted and upgraded. Missing or historically inconsistent version values that are already present in repository fixtures are classified through an explicitly tested legacy entry path. Unknown future versions are rejected rather than guessed.

This replaces isolated pre-parse repairs with version-owned migrations. The storage and export envelope versions remain unchanged because their surrounding envelope contracts do not change.

### Decision 3: Make currency an explicit 5e domain group

Add `systemData.currency`, keyed by the supported denominations. Each present denomination stores an amount and annotations; zero/absent denominations normalize consistently. Currency no longer appears in the generic `inventory` array and no longer requires an item ID or a `currency:*` tag.

Migration removes only inventory entries recognized by the existing currency-tag convention. For duplicate legacy denomination entries, it combines represented amounts deterministically and preserves valid annotations. All non-currency inventory records, IDs, tags, ordering, and annotations remain untouched.

A keyed singleton was selected over typed currency inventory items because currency is edited and rendered as a fixed 5e resource, is not equipable, and should not become an action source under `p1-005`.

### Decision 4: Give fixed roleplay fields semantic keys

Add `systemData.roleplay` with fixed 5e keys for personality traits, ideals, bonds, and flaws. Each populated field stores its body and annotations. General `notes` remains the ordered scratchpad/session/lore collection.

Migration maps the first exact legacy roleplay-title match for each key into the semantic field. Additional title collisions remain general notes so migration never silently discards authored content. General note IDs and ordering are preserved. Synthetic IDs that existed only to make a fixed roleplay field look like a general note are retired; annotation identities remain preserved.

### Decision 5: Add source-aware language and tool proficiency entries

Add `systemData.proficiencies.languages` and `systemData.proficiencies.tools` as explicit entries with a name and optional provenance descriptor. Provenance uses a small 5e vocabulary for ancestry, background, class, feature, and other sources, plus an optional source identifier where one exists.

Migration moves legacy race and background language/tool values into this collection with the matching provenance. The source choice records remain focused on the selected race/background rather than serving as the mutable owner of all character-earned proficiencies. Existing skill/save mechanics are unchanged because they do not currently require flattened card values to be reconstructed into provenance owners.

The schema does not deduplicate solely by display name: two sources may intentionally grant or document the same proficiency. Presentation may derive a unique display list without erasing provenance.

### Decision 6: Retire `attacks` through migration

The canonical schema contains `runtimeActions` only. Migration uses `runtimeActions` when already present; otherwise it copies legacy `attacks`. It then removes `attacks`. If both exist, canonical `runtimeActions` wins and legacy records not already represented by ID are preserved only when doing so does not create ambiguous duplicates; the exact deterministic merge rule is covered by fixtures.

The new character factory and seed fixtures emit only the canonical property.

### Decision 7: Centralize hydration and serialization at every I/O boundary

Provide one safe hydration entry point for stored and imported 5e values and one serialization entry point that accepts only the current validated model. LocalStorage loading, import validation, constructor overrides, save, and export all use these boundaries as appropriate.

Migration is pure and idempotent. It preserves `createdAt` and `updatedAt`; loading old data is not itself a user edit. Once hydrated data reaches the store, the existing persistence subscription may write the canonical representation back safely.

### Decision 8: Record the migration strategy as an ADR

Create `docs/decisions/2026-07-18-version-and-normalize-5e-character-data.md` documenting the one-model choice, character-level version dispatch, canonical currency/roleplay/proficiency ownership, compatibility guarantees, and relationship to the future schema registry. These are persisted-schema and migration decisions and therefore require a durable ADR.

## Risks / Trade-offs

- **[Risk] Legacy data is silently dropped during canonicalization.** → Build representative fixtures for every alias/sentinel, collision, annotation, and unrelated-record case; compare pre/post semantic content explicitly.
- **[Risk] Existing unversioned or inconsistently versioned fixtures cannot be classified.** → Define a narrow, tested legacy classifier from known repository shapes; reject unknown future versions rather than broad-casting arbitrary data.
- **[Risk] Migration mutates timestamps or IDs unexpectedly.** → Require pure functions, preserve document/record identity where the canonical concept remains identity-addressable, and assert timestamp/ID stability in contract tests.
- **[Risk] Required empty groups increase JSON size.** → Accept a small local-storage cost for one reliable runtime model; do not materialize large optional capability blocks without semantic presence.
- **[Risk] Updating data shape destabilizes `p1-005` or future systems.** → Keep changes 5e-local, document explicit currency/proficiency/action ownership, and retain semantic typed intents as the editing boundary.
- **[Trade-off] Fixed roleplay and currency singleton records lose legacy container IDs.** → Preserve user-visible content and annotation IDs; retire synthetic IDs that no longer identify movable collection records.
- **[Risk] Automatic write-back makes rollback difficult after release.** → Keep migrations one-way in production but retain legacy fixtures and migration code; during implementation, do not remove the previous parser until full storage/import/export verification passes.

## Migration Plan

1. Freeze representative legacy character fixtures, including current seeds, dual action aliases, duplicate currency tags, roleplay-title collisions, provenance splits, annotations, and sparse structures.
2. Add historical input schema(s), the new schema-version constant, pure migration functions, and the current canonical schema without changing live I/O call sites.
3. Implement and contract-test hydration and serialization, including idempotence and future-version rejection.
4. Rewire local storage and import/export parsing to hydrate; update factories, fixtures, projections, and `p1-055` reducers to current canonical data.
5. Remove legacy aliases and sentinel lookup from steady-state code only after compatibility tests and browser flows pass.
6. If a migration defect appears before release, restore the previous I/O call sites while retaining the isolated new schemas and fixtures for correction.

## Open Questions

None block proposal readiness. Exact schema-version string and provenance field names should follow existing naming conventions during implementation and be recorded in the ADR; they must not change the ownership decisions above.
