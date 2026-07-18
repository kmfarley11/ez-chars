## 1. Establish Feature-Local Boundaries

- [ ] 1.1 Audit route-local path, annotation, and descriptor helpers against existing `src/lib/` utilities and identify which behavior is genuinely 5e-specific.
- [ ] 1.2 Extract shared 5e sheet metadata while keeping single-owner constants with their projection or patch module.
- [ ] 1.3 Extract virtual-path constants with the patch rules that own them rather than exposing them as a cross-system contract.
- [ ] 1.4 Create `docs/decisions/2026-07-17-sheet-architecture-adapter-vs-registry.md` documenting feature-local modules now, the desired schema-registry plus dynamic-Svelte-rendering direction, and the deliberate deferral of registry mechanics and universal signatures until another system provides evidence.

## 2. Extract Data Projection Logic

- [ ] 2.1 Create feature-local projection module(s) under `src/routes/charsheets/5e/` using cohesive current sheet surfaces as their boundaries.
- [ ] 2.2 Reuse generic grid path, annotation, and descriptor utilities where their existing behavior matches; extract only 5e-specific annotation-path and presentation rules.
- [ ] 2.3 Move overview, quick-reference, ability/proficiency/feature, runtime-action, spell, inventory, and organizational-note projections into focused functions without forcing them through one generic `GridContentData` return type.
- [ ] 2.4 Rewire `+page.svelte` to derive its current card groups from the extracted projections while retaining Svelte state, selected-character lookup, layout, validation, and save dispatch.

## 3. Extract Compatibility Patch Translation

- [ ] 3.1 Create a feature-local patch module containing virtual-path recognition, normalization, coalescing, default insertion, annotation conversion, and no-op removal.
- [ ] 3.2 Preserve the existing `GridContentPatch[]` input and output contract, including array paths and `undefined` deletion semantics consumed by `applyGridPatches`.
- [ ] 3.3 Add an injectable ID factory, defaulted to the production `createId`, for normalization paths that allocate annotations, actions, items, currency records, or notes.
- [ ] 3.4 Rewire the card-wide save dispatcher to use the extracted normalizer without changing the separate RFC 6902 direct-field save path.

## 4. Implement Regression Coverage

- [ ] 4.1 Add nearby Vitest files for projection and patch modules, splitting tests by responsibility when that makes failures easier to diagnose.
- [ ] 4.2 Test representative projections for every rendered sheet region, including annotation resolution, optional values, and legacy runtime-action fallback behavior.
- [ ] 4.3 Test every virtual patch family, multi-patch currency and organizational-note coalescing, schema-backed defaults, annotation conversion, no-op removal, preservation of unrelated records, and deterministic injected IDs.
- [ ] 4.4 Run the Chromium Playwright smoke suite to protect navigation, field save/reload, annotation editing, and sheet UI state through the refactor.

## 5. Backlog Updates & Reconciliation

- [ ] 5.1 Run `npm run test`, `npm run check`, `npm run lint`, `npm run build`, and `npm run test:e2e`; use the performance workflow only if evidence indicates a regression.
- [ ] 5.2 Prune `p1-045` from `docs/backlog.md` and move it to `Done Recently` with a brief implementation summary.
- [ ] 5.3 Reconcile the `Next recommended target` header in `docs/backlog.md` and update `docs/active-goals.md` if implementation changes its status or remaining work.
- [ ] 5.4 Reconcile the ADR and long-term system-design documentation with material implementation discoveries without inventing a registry API.
- [ ] 5.5 Validate the final change with `openspec validate p1-045-extract-route-logic --type change --strict`.

## Executor Recommendation

- **Reasoning Level:** High
- **Model Complexity:** Complex
- **Rationale:** The extraction crosses a large Svelte route and several behavior-sensitive projection and compatibility-patch branches. The executor must preserve Svelte reactivity, legacy patch semantics, identity behavior, and existing user flows while avoiding premature generic abstractions.
