## 1. Extract 5e Sheet Constants

- [ ] 1.1 Create `src/routes/charsheets/5e/sheetConstants.ts`
- [ ] 1.2 Move static metadata objects (abilityMetadata, skillMetadata, spellSlotLevelMetadata, roleplayNoteMetadata, etc.) out of `+page.svelte`
- [ ] 1.3 Move tag constants and keyword arrays (inventoryWeaponKeywords, inventoryArmorShieldKeywords, etc.) out of `+page.svelte`
- [ ] 1.4 Create `docs/decisions/2026-07-17-sheet-architecture-adapter-vs-registry.md` documenting the sheet adapter architecture decisions and dynamic route registry roadmap

## 2. Extract Data Projection Logic

- [ ] 2.1 Create `src/routes/charsheets/5e/sheetProjections.ts`
- [ ] 2.2 Move data projection helper functions (toSystemDataAnnotationPath, annotationsAtPath, withFieldAnnotations, createInventoryListField, etc.) out of `+page.svelte`
- [ ] 2.3 Move high-level `GridContentData` projections (runtimeActionData, roleplayNoteData, metaPrimaryData, quickRefPrimaryData, etc.) out of `+page.svelte` and convert them into pure projection functions under the sheet adapter signature (e.g. `project5eCharacter`)
- [ ] 2.4 Update imports in `+page.svelte` and replace local helper references with the new projection calls

## 3. Extract JSON Patch Translation Logic

- [ ] 3.1 Create `src/routes/charsheets/5e/sheetPatches.ts`
- [ ] 3.2 Move virtual path path-matching functions (isSpellLevelListPath, isRuntimeActionListPath, etc.) out of `+page.svelte`
- [ ] 3.3 Move patch merger and normalizer helpers (mergeSpellLevelPatch, mergeRuntimeActionListPatch, mergeInventoryPatches, etc.) out of `+page.svelte`
- [ ] 3.4 Combine them into a single pure patch translator function `normalize5ePatches` matching the adapter contract, and update the save dispatcher in `+page.svelte` to use it

## 4. Implement Unit Tests

- [ ] 4.1 Create `src/routes/charsheets/5e/__tests__/sheetHelpers.test.ts`
- [ ] 4.2 Write Vitest unit tests verifying that character projections correctly map nested document nodes to the flat `GridContentData` structures
- [ ] 4.3 Write Vitest unit tests verifying that client-side patches containing virtual path tags are correctly translated and normalized to canonical JSON Patches

## 5. Backlog Updates & Reconciliation

- [ ] 5.1 Run all check, lint, and test scripts (including `npm run test` and `npm run test:e2e`) to ensure zero behavioral regression
- [ ] 5.2 Prune `p1-045` from `docs/backlog.md` and move it to `Done Recently` with a brief summary
- [ ] 5.3 Reconcile the 'Next recommended target' header in `docs/backlog.md` to point to the next active priorities (e.g. `p1-027`, etc.)
- [ ] 5.4 Add a low-priority backlog item (e.g. `p2-080`) to `docs/backlog.md` to track unified dynamic route sheet loading when more systems are implemented
- [ ] 5.5 Validate the final change configuration using `openspec validate --changes`

## Executor Recommendation

- **Reasoning Level:** Medium
- **Model Complexity:** Complex
- **Rationale:** While the refactoring consists mostly of moving code out of a bloated file into separate modules, the virtual path translation and patching logic contains intricate nested indexing and path checks. The executor must accurately re-wire these functions without changing Svelte runtime dynamics, requiring a reasoning model capable of handling large-scale file splits and importing contexts.
