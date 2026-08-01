# 2026-07-18 Version and normalize D&D 5e 2014 character data

- **Status:** Approved
- **Author:** Codex with project owner direction
- **Date:** 2026-07-18
- **Last reviewed:** 2026-08-01
- **Latest refinement:** `BL-067` retained JSON/versioned schemas as canonical while adding an immediate interoperability/recovery review trigger for any post-v1 schema reset.

## Context & Problem Statement

The D&D 5e 2014 sheet previously accepted sparse documents and reconstructed domain meaning from compatibility conventions: `attacks` aliased runtime actions, tagged inventory records represented currency, titled general notes represented fixed roleplay fields, and ancestry/background records owned language and tool proficiencies. Local storage also repaired movement strings outside a character-version migration.

Those conventions made steady-state projection and editing defensive, while `meta.schemaVersion` did not yet control data evolution. The project needs a reliable migration boundary before playtesting without imposing 5e-specific requirements on the shared cross-system core schema or prematurely defining a universal system registry.

## Decision Drivers

- Give runtime code, local persistence, and new exports one validated 5e model.
- Preserve supported authored values, annotations, provenance, record identities, and unrelated data through upgrades.
- Reject unknown future character versions rather than guessing.
- Keep the shared core document flexible enough for systems with different structural needs.
- Improve maintainer and coding-agent comprehension before broader repository and playtesting work.

## Considered Options

### Keep compatibility reads and repair values at each caller

This minimizes the immediate schema change, but every projection, reducer, storage adapter, and import path must continue understanding historical representations. Compatibility behavior can drift and new migrations have no reliable ordering.

### Maintain separate sparse persistence and hydrated runtime models

This gives each model a narrow purpose, but requires a permanent bidirectional mapper. Save, export, and edit code can diverge from hydration, recreating the same ambiguity at a different boundary.

### Migrate at one character-level boundary into one current model

This makes historical knowledge explicit and testable. Application features receive only the current shape, while persistence and export validate that same shape before writing.

## Decision Outcome

Use `meta.schemaVersion` as the data-layout discriminator for each character. This decision introduced D&D 5e 2014 layout `dnd5e-2014.v2`; at the time of this decision, the current layout became `dnd5e-2014.v3`, and repository-supported legacy values were `0.0.1`, `char.v1`, and `dnd5e-2014.v2`. The [2026-07-26 pre-playtest refinement](#2026-07-26-establish-a-pre-playtest-v0-epoch-and-future-migration-contract) supersedes that compatibility set. `system.id` continues to select the game system, and `system.version` continues to identify the rules/source release (`SRD-5.1-2023`). Storage-envelope and export-envelope versions remain unchanged.

Hydration inspects the system and character data version, validates with the matching historical schema, applies pure ordered migration steps, and then validates the current schema. Current documents are validated directly. Unsupported future versions fail explicitly and are not rewritten.

The current 5e document is also the runtime, persistence, and export model. It always contains empty root feature, inventory, and general-note collections plus these 5e structural groups:

- `runtimeActions`, with no `attacks` alias;
- explicit denomination-keyed `currency`, outside inventory;
- semantic `roleplay`, outside titled general notes;
- source-aware `proficiencies.languages` and `proficiencies.tools`.

Spellcasting remains optional because absence represents a capability the character does not possess. The shared core schema keeps its root collections optional: these required defaults are evidence-backed 5e requirements, not a cross-system mandate.

Migration uses these preservation rules:

- canonical runtime actions win ID collisions; a uniquely identified legacy-only action is appended when dual properties exist, while ambiguous duplicate legacy IDs are not guessed;
- duplicate tagged currency amounts are combined, their valid annotations are retained, and non-currency inventory order and identities are unchanged;
- the first exact recognized roleplay-title match moves to its semantic key, while additional collisions remain ordered general notes;
- ancestry/background language and tool values become separate provenance-bearing entries without display-name-only deduplication;
- movement-string repair belongs to the legacy version step;
- document timestamps do not change merely because hydration occurred.

Serialization accepts only the current validated model. Local storage, JSON import, JSON export, and factory overrides use the centralized hydration or serialization boundary appropriate to their direction.

### Consequences

- Steady-state sheet code no longer contains historical action, currency-tag, roleplay-title, or proficiency-owner fallbacks.
- Newly saved and exported 5e JSON uses a breaking but explicitly versioned shape.
- Supported historical data remains loadable and can be written back canonically after hydration.
- The migration code and frozen legacy fixtures remain part of the compatibility contract.
- Adding a future system still requires its own evidence-based schema and migration policy; this decision does not define a registry or universal adapter API.
- Required empty groups add a small amount of persisted JSON.

## Refinements & Follow-Ups

### 2026-07-18: Preserve all current MVP roleplay fields

The implementation audit found that the live 5e sheet exposes eight fixed semantic roleplay fields, while the initial design text named only personality traits, ideals, bonds, and flaws. The canonical group preserves all currently supported fields: motives, personality traits, ideals, bonds, flaws, other background/history, factions and organizations, and other character information. This reconciles the design with existing MVP behavior and avoids silently demoting or hiding authored data before playtesting.

### Future system registry work

Use this 5e boundary as implementation evidence, not as a mandatory cross-system interface. A second implemented system should compare which versioning, root defaults, and semantic groups are genuinely shared before extracting registry contracts or changing the core document requirements.

### 2026-07-26: Establish a pre-playtest v0 epoch and future migration contract

The application has not begun real external playtesting, but its executable compatibility surface already spans several rapidly changing experimental layouts. Preserving those layouts indefinitely would turn short-lived development artifacts into product obligations and increase schema, fixture, test, and coding-agent context before any user has been promised durable data.

The following refinement supersedes the earlier supported-version set while retaining the centralized hydration architecture:

1. `dnd5e-2014.schema.v0` identifies the pre-playtest compatibility epoch. The `.schema.` namespace permanently distinguishes the new compatibility line from retired experimental identifiers such as `dnd5e-2014.v2`; those identifiers will never be reused. Until the first real external playtest, the current strict v0 shape may be replaced in place. Previously saved v0 data may consequently fail current validation.
2. The p1-061 baseline removes executable compatibility with `0.0.1`, `char.v1`, `dnd5e-2014.v2`, and `dnd5e-2014.v3`. Those layouts are rejected as outdated and are not migrated into v0.
3. Rejected local or imported data must not be overwritten automatically. Existing invalid/outdated recovery remains the user-visible fallback, and the pre-release warning communicates that preservation is not guaranteed.
4. Git history, archived OpenSpec changes, and ADRs preserve schema evolution and rationale. Historical runtime schemas and fixtures are retained only when they implement a current compatibility promise.
5. Storage-envelope and export-envelope versions remain separate concerns. Rebasing the character layout does not require renumbering either envelope unless its own structure changes.

The first real external playtest establishes `dnd5e-2014.schema.v1` as an immutable supported character layout. Before that playtest begins, the repository must decide explicitly whether the final v0 shape receives a one-time v0-to-v1 migration; no earlier v0 shape is implicitly supported.

From v1 onward, schema evolution follows this contract:

- Each character-data version denotes one frozen strict shape. Never change the accepted meaning of a released v1-or-later identifier.
- A breaking persisted-shape change increments the character-data version and preserves the immediately preceding strict schema as a historical input.
- Hydration validates the declared historical shape, applies explicit pure migrations one version at a time, validates each next-version result, and finally validates the current representation.
- Migration functions operate only on character data. They do not read UI state, storage, clocks, randomness, network data, or process-global allocation state.
- Migrations preserve authored content, stable identities, annotations, meaningful absence, and collection order unless an approved specification and ADR explicitly define otherwise.
- Every supported version retains a representative frozen fixture and tests for its single-step migration, the complete sequential chain, current idempotence, import/export round trips, future-version rejection, and non-destructive failure.
- Supported v1-or-later versions remain supported by default. Pruning them requires a separately approved compatibility reset, advance user communication, an ADR, and a recovery or export strategy appropriate to the product's maturity.

This contract intentionally avoids a generic migration framework before it is needed. Explicit historical schemas and small sequential functions remain preferable because they keep each transformation auditable and prevent one large oldest-to-current converter from becoming brittle.

### 2026-07-26: Pre-playtest v0 implementation outcome

The p1-061 implementation established `dnd5e-2014.schema.v0` as the sole executable 5e character layout. Hydration now distinguishes a valid current document, an outdated or otherwise unsupported document, and a well-formed future `.schema.vN` declaration. It does not carry historical schemas, transformation functions, or frozen legacy fixtures for retired experimental layouts.

The strict current schema requires unique inventory, spell, and feature identities and validates linked runtime-action sources against character-owned records. Inventory identity uniqueness is enforced even before a record is linked because the atomic item source and keyed source picker cannot distinguish colliding IDs. Storage and import preserve rejected source data and surface recovery rather than rewriting it. Current serialization, storage, and export round trips all emit the same validated v0 shape. This is the intentionally small pre-playtest implementation of the migration boundary; the sequential historical-schema contract above does not become executable until an immutable v1-or-later layout exists.

### 2026-08-01: Post-v1 reset requires an escape-path review

If playtest or later evidence calls for a fundamental schema reset after durable v1 promises begin, the project must immediately prioritize a recovery and interchange review before asking users to cross the reset. That review includes bounded editable-PDF export/import where exact forms, mappings, and rights make it viable, alongside JSON export and explicit migration/recovery options.

This is a prioritization trigger, not a change in canonical storage: external PDF forms are lossy and cannot replace validated JSON, schema identifiers, migrations, or preservation of application-owned identities, annotations, references, and unbounded collections.
