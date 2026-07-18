## 1. Define the Typed Edit Boundary

- [ ] 1.1 Inventory every currently emitted virtual 5e card patch and map it to one semantic edit intent, including multi-patch currency and organizational-note batches.
- [ ] 1.2 Define the feature-local discriminated intent union, atomic result/error types, and injectable ID-factory option without introducing a cross-system interface.
- [ ] 1.3 Add schema-backed editor payload parsers for spells, actions, languages, class features, inventory, currency, roleplay, scratchpad, and annotations.
- [ ] 1.4 Create `docs/decisions/2026-07-18-use-typed-5e-sheet-edit-intents.md` recording the decoder/reducer boundary, validated-next-character result, and non-binding multi-system implications.

## 2. Decode and Reduce Structured Edits

- [ ] 2.1 Implement a narrow decoder that classifies current generic editor output, coalesces related patches, and returns typed intents or explicit issues without transforming canonical character data.
- [ ] 2.2 Implement immutable, exhaustive intent reduction for spells, runtime actions, proficiency languages, and class features while preserving unrelated records and existing IDs.
- [ ] 2.3 Implement immutable, exhaustive intent reduction for inventory groups and currency while preserving records outside the edited semantic target.
- [ ] 2.4 Implement immutable, exhaustive intent reduction for roleplay fields, scratchpad notes, and annotations while preserving existing identities and unrelated notes.
- [ ] 2.5 Validate the final candidate character once per batch and return failure without mutation or a partially committed result.

## 3. Integrate the Sheet Save Path

- [ ] 3.1 Rewire the 5e card-wide save dispatcher to decode and reduce typed intents, committing only successful validated results.
- [ ] 3.2 Preserve the separate direct primitive RFC 6902 save path and its current validation and persistence ownership.
- [ ] 3.3 Remove superseded virtual-path domain dispatch and reduce `sheetPatches.ts` to a clearly named thin adapter or delete it if no compatibility responsibility remains.

## 4. Regression Coverage

- [ ] 4.1 Add decoder tests for every recognized edit family, coalesced batch, malformed payload, and unsupported target.
- [ ] 4.2 Add reducer tests for exhaustiveness, atomic failure, input immutability, stable-ID preservation, deterministic new IDs, default/deletion behavior, and preservation of unrelated records.
- [ ] 4.3 Reuse the current projection/patch fixtures to prove behavioral equivalence for all supported structured edits before removing superseded tests.
- [ ] 4.4 Run the Chromium Playwright smoke suite to protect structured editing, direct primitive editing, annotations, reload persistence, and sheet UI state.

## 5. Backlog Updates & Reconciliation

- [ ] 5.1 Reconcile `docs/field-binding-contract.md`, `docs/field-rendering-api.md`, and the sheet adapter ADR with the final typed boundary and any remaining compatibility adapter.
- [ ] 5.2 Prune `p1-055` from `docs/backlog.md` and move it to `Done Recently` with a brief implementation summary.
- [ ] 5.3 Reconcile the `Next recommended target` header in `docs/backlog.md` and update `docs/active-goals.md` if the implementation changes its status or remaining work.
- [ ] 5.4 Run `npm run test`, `npm run check`, `npm run lint`, `npm run build`, and `npm run test:e2e`; use performance profiling only if evidence indicates a regression.
- [ ] 5.5 Validate the final change with `openspec validate p1-055-typed-5e-sheet-edits --type change --strict`.

## Executor Recommendation

- **Reasoning Level:** High
- **Model Complexity:** Complex
- **Rationale:** The implementation replaces a behavior-sensitive compatibility boundary across multiple editor families. The executor must distinguish external decoding from domain reduction, preserve atomicity and identity semantics, retain two intentional save mechanisms, and prove equivalence before deleting guarded legacy code.
