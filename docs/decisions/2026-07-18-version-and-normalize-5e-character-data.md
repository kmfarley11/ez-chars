# 2026-07-18 Version and normalize D&D 5e 2014 character data

**Status:** Approved  
**Author:** Codex with project owner direction  
**Date:** 2026-07-18

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

Use `meta.schemaVersion` as the data-layout discriminator for each character. The current D&D 5e 2014 layout is `dnd5e-2014.v2`; the repository-supported legacy values are `0.0.1` and `char.v1`. `system.id` continues to select the game system, and `system.version` continues to identify the rules/source release (`SRD-5.1-2023`). Storage-envelope and export-envelope versions remain unchanged.

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
