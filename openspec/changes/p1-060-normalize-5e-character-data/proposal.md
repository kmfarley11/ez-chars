## Why

The 5e sheet currently reconstructs domain meaning from optional parents, a legacy action alias, inventory tags, note titles, and proficiencies split across source records. A normalized, versioned data boundary is needed so editing and projection code can operate on one validated model while existing local and exported characters continue to load without loss.

## What Changes

- Add an explicit hydration and serialization boundary for D&D 5e 2014 character data.
- Advance the 5e character schema version and migrate supported older documents into one canonical shape.
- Retire the legacy `attacks` alias in favor of runtime actions.
- Store currency and roleplay fields through explicit 5e domain properties instead of inventory-tag and note-title conventions.
- Represent language/proficiency provenance without requiring flattened editor rows to be written back into ancestry or background records.
- Preserve general inventory, scratchpad notes, stable IDs, annotations, and import/export round trips through migration.
- **BREAKING (versioned data contract):** newly saved and exported 5e characters use the new canonical schema shape; supported older shapes remain accepted through explicit migration.

## Capabilities

### New Capabilities

- `character-data-evolution`: Defines versioned character hydration, canonicalization, migration, serialization, and preservation requirements.

### Modified Capabilities

None.

## Impact

- Affects 5e Zod schemas and types, schema-version dispatch, localStorage loading/saving, import/export validation, 5e seed fixtures, sheet projections, and typed edit reducers introduced by `p1-055`.
- Requires a lightweight ADR because it selects persisted schema shapes and a migration strategy.
- Changes versioned character JSON but does not add dependencies, backend services, accounts, another game system, or new sheet presentation.
