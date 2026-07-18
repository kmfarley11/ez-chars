## Why

The 5e character sheet route ([+page.svelte](../../src/routes/charsheets/5e/+page.svelte)) is currently bloated with static constants, data projections, and virtual JSON patch translation logic. Extracting these calculations into separate, pure modules improves codebase maintainability, allows isolated testing of sheet projections and patches, and establishes a clean sheet adapter pattern for future TTRPG systems.

## What Changes

- Extract 5e constants (ability, skill, spell level metadata, tags, and keywords) into a local `sheetConstants.ts` file in the route folder.
- Extract 5e data projection functions (mapping the character record to flat `GridContentData` card schemas) into a local `sheetProjections.ts` file.
- Extract 5e virtual patch detection, normalization, and coalescing helpers into a local `sheetPatches.ts` file.
- Redefine `+page.svelte` to focus solely on route orchestrations, state management, Svelte component composition, and event/save handlers.
- Write an Architecture Decision Record (ADR) under `docs/decisions/` documenting the near-term local route folders vs. long-term unified dynamic registry.
- Add comprehensive Vitest unit tests in `src/routes/charsheets/5e/__tests__/sheetHelpers.test.ts` to verify projection builders and patch mergers in isolation.

## Capabilities

### New Capabilities

- `sheet-adapter-refactoring`: Decouples the 5e sheet layout projections and virtual patch translation logic into stateless adapter modules, enabling isolated Vitest coverage.

### Modified Capabilities

None.

## Impact

- `src/routes/charsheets/5e/+page.svelte`: Major reduction in size (bloat removed, delegate to helpers).
- `src/routes/charsheets/5e/sheetConstants.ts`: New file housing static 5e sheet configuration parameters.
- `src/routes/charsheets/5e/sheetProjections.ts`: New file containing pure functions for card-level data projections.
- `src/routes/charsheets/5e/sheetPatches.ts`: New file containing pure functions for JSON Patch normalization and coalescing.
- `src/routes/charsheets/5e/__tests__/sheetHelpers.test.ts`: New test file containing Vitest unit tests for the extracted helpers.
- `docs/decisions/2026-07-17-sheet-architecture-adapter-vs-registry.md`: New ADR documenting the sheet layout adapter strategy and dynamic route roadmap.
