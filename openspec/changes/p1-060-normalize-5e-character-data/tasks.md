## 1. Establish Versioned Schema Boundaries

- [ ] 1.1 Confirm the `p1-055` typed 5e edit-intent boundary is complete and reconcile this design with its final intent and reducer names before changing canonical data.
- [ ] 1.2 Freeze representative legacy fixtures for current seeds, sparse parents, legacy-only and dual action aliases, duplicate currency tags, roleplay-title collisions, provenance splits, annotations, and unrelated records.
- [ ] 1.3 Define the new character data-layout version constant and historical input schema(s), keeping `system.version` dedicated to the 5e rules/source version.
- [ ] 1.4 Define the canonical current schema for required universal collections/groups, explicit currency, semantic roleplay fields, source-aware language/tool proficiencies, and runtime actions without the legacy alias.
- [ ] 1.5 Create `docs/decisions/2026-07-18-version-and-normalize-5e-character-data.md` recording the one-model boundary, schema-version dispatch, canonical ownership choices, and migration policy.

## 2. Implement Pure Character Migration

- [ ] 2.1 Implement schema-version classification and sequential pure migration into the current 5e schema, including the tested legacy entry path and rejection of unsupported future versions.
- [ ] 2.2 Migrate `attacks` to canonical runtime actions with deterministic behavior for documents containing both properties.
- [ ] 2.3 Migrate recognized tagged currency items into explicit denomination data while combining duplicates deterministically and preserving non-currency inventory.
- [ ] 2.4 Migrate recognized roleplay-title notes into semantic fields while preserving annotation identities, general-note IDs/order, and additional title collisions.
- [ ] 2.5 Migrate ancestry/background language and tool values into source-aware proficiency entries without display-name-only deduplication.
- [ ] 2.6 Normalize universal empty collections/groups, preserve meaningful optional capability absence, and prove migration idempotence without changing document timestamps.

## 3. Centralize Hydration and Serialization

- [ ] 3.1 Add one safe 5e hydration entry point that classifies, migrates, and current-schema-validates unknown input with explicit failure information.
- [ ] 3.2 Add a current-only serialization boundary and update the character factory and override parsing to emit canonical current documents.
- [ ] 3.3 Replace the isolated storage movement repair and direct 5e parse path with version-owned hydration while preserving existing recovery behavior for rejected local data.
- [ ] 3.4 Route import validation through hydration and ensure export emits only current validated character data without changing the surrounding export envelope unnecessarily.

## 4. Reconcile 5e Features With Canonical Data

- [ ] 4.1 Update seed/demo fixtures and shared test fixtures to current canonical data while retaining frozen legacy fixtures exclusively for migration coverage.
- [ ] 4.2 Update sheet projections to read explicit currency, roleplay, and proficiency groups and remove legacy action, inventory-tag, and note-title fallback reads.
- [ ] 4.3 Update `p1-055` intent reducers to write canonical groups and remove obsolete ID allocation or preservation rules for semantic singleton fields.
- [ ] 4.4 Remove superseded schema aliases, sentinel constants, TODOs, and compatibility helpers only after all steady-state callers use hydration and canonical data.

## 5. Contract and Browser Verification

- [ ] 5.1 Add migration contract tests for every frozen legacy fixture, collision rule, identity/annotation preservation case, timestamp stability, and unrelated-record guarantee.
- [ ] 5.2 Add hydration/serialization tests for current validation, repeated hydration, unsupported future versions, current save output, and export/import semantic round trips.
- [ ] 5.3 Update schema, storage, reducer, and projection tests for canonical required groups and meaningful optional capability absence.
- [ ] 5.4 Run the Chromium Playwright smoke suite against migrated local data and current data to protect opening, editing, reload persistence, annotations, and JSON backup/restore.

## 6. Backlog Updates & Reconciliation

- [ ] 6.1 Reconcile `docs/import-export-json.md`, schema/field maintainer docs, the sheet architecture ADR, and long-term system-design notes with the implemented version and canonical ownership rules.
- [ ] 6.2 Prune `p1-060` from `docs/backlog.md` and move it to `Done Recently` with a brief implementation and migration summary.
- [ ] 6.3 Re-sequence the `Next recommended sequence` block in `docs/backlog.md`, remove schema-semantic ambiguity from `p1-050`, and update `docs/active-goals.md` for the new current model.
- [ ] 6.4 Run `npm run test`, `npm run check`, `npm run lint`, `npm run build`, and `npm run test:e2e`; use performance profiling only if evidence indicates a regression.
- [ ] 6.5 Validate the final change with `openspec validate p1-060-normalize-5e-character-data --type change --strict`.

## Executor Recommendation

- **Reasoning Level:** High
- **Model Complexity:** Complex
- **Rationale:** This is a versioned persisted-data migration crossing schema, storage, import/export, projections, reducers, and recovery behavior. The executor must preserve authored data and identity semantics across ambiguous legacy shapes, keep migrations pure and idempotent, and avoid confusing application data versions with ruleset or envelope versions.
