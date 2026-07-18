## Why

The 5e character sheet route currently interleaves page orchestration with extensive sheet-data projection and patch translation logic, making behavior-sensitive changes difficult to review and test. The shared field/card API is now stable enough to extract those responsibilities while preserving the current single-system MVP behavior.

## What Changes

- Separate 5e sheet metadata, data projections, and virtual patch translation from route orchestration.
- Keep character selection, Svelte state, layout composition, validation, and save dispatch at the route boundary.
- Preserve current rendering, editing, annotation, and persistence behavior through focused unit and browser regression coverage.
- Record the near-term feature-local boundary and the non-binding long-term intent for schema-registry-driven, dynamically rendered system sheets without defining a universal adapter API prematurely.

## Capabilities

### New Capabilities

- `sheet-adapter-refactoring`: Preserves the observable 5e character-sheet experience while its projection and patch responsibilities are separated into independently testable feature modules.

### Modified Capabilities

None.

## Impact

- The 5e sheet route will delegate feature-specific projection and compatibility-patch calculations to neighboring modules.
- Focused Vitest coverage will protect projection and patch behavior, while the existing Playwright suite will protect representative user journeys.
- No schema, persisted-data, storage, URL, or user-facing behavior changes are intended.
- A lightweight architecture decision will document the current local boundary and future multi-system direction without fixing registry mechanics or cross-system signatures.
