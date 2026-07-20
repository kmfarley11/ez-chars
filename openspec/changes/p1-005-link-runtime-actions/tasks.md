## 1. Versioned Schema & Migration

- [x] 1.1 Freeze the existing `dnd5e-2014.v2` character and runtime-action shapes as historical input schemas before extending the current action schema.
- [x] 1.2 Advance the canonical 5e character layout to `dnd5e-2014.v3`, add a named strict item-source schema, and allow current runtime actions to carry that optional atomic source link.
- [x] 1.3 Implement a pure v2-to-v3 migration that preserves all character data and identities without inventing source links; route supported pre-v2 inputs sequentially through the existing normalization and the new migration.
- [x] 1.4 Add schema and migration contract tests for v2 preservation, v3 linked and unlinked actions, malformed/unsupported source kinds, sequential legacy migration, repeated hydration, and unsupported future versions.
- [x] 1.5 Update factories, fixtures, storage, and import/export expectations to the v3 current layout, with round-trip coverage proving that valid item links persist and existing unlinked actions remain custom.

## 2. Inventory Suggestion Boundary

- [x] 2.1 Create `src/lib/compendium/dnd5e2014/suggestInventoryRuntimeActions.ts` with a transient `RuntimeActionSuggestion` type that requires an item source, omits persisted identity and annotations, and retains optional runtime fields for future richer suggestions.
- [x] 2.2 Implement `suggest5eInventoryRuntimeActions(items)` to asynchronously return one name/notes snapshot per explicitly equipped item in stable input order, without text matching or mechanical inference.
- [x] 2.3 Add deterministic unit tests covering equipped and unequipped items, empty input, stable ordering, source identity, absent notes, and the absence of preallocated action IDs.

## 3. Typed Intent Transactions

- [x] 3.1 Add `accept-runtime-action-suggestion` to the 5e typed intent reducer; revalidate that the source item exists and is equipped at commit time, allocate an ID through the injected `createId` boundary, and append the accepted snapshot.
- [x] 3.2 Add `resync-runtime-action` to resolve the linked source item and overwrite only `name` and `notes`, clearing stale notes when the source has none while preserving every other action field.
- [x] 3.3 Update `replace-inventory-group` to calculate IDs removed from the edited group and atomically strip matching item-source links from all affected runtime actions without changing their snapshots or order.
- [x] 3.4 Ensure the existing `replace-runtime-actions` editor path preserves source metadata on ordinary edits and still creates manual actions without a source.
- [x] 3.5 Add reducer tests for stale suggestion rejection, unique IDs across repeated acceptance from one source, resync preservation and missing-source errors, ordinary linked-action editing, multiple-link deletion fallback, and atomic validation failure.

## 4. Feature-Local UI & Storybook

- [x] 4.1 Build a feature-local 5e runtime-action component that composes the existing `GridContent` editor with inventory suggestions and linked/custom source controls; retain manual creation in loading, empty, and failure states.
- [x] 4.2 Wire suggestion acceptance and explicit "Resync from source" controls to the new typed intents and source item resolution.
- [x] 4.3 Implement route-owned source navigation that resolves the item's current inventory group, scrolls its focusable card wrapper into view, and moves keyboard focus there without adding 5e semantics to generic grid primitives.
- [x] 4.4 Provide a deterministic injectable suggestion loader and add Storybook stories for resolved suggestions, pending, empty, rejected, linked, custom, and source-control interaction states with automated accessibility checks.
- [x] 4.5 Follow the repository Svelte 5 agent workflow while implementing the component and keep any generic primitive change separately justified if actual implementation constraints invalidate composition.
- [x] 4.6 Reconcile the human Storybook playground with a small stateful harness that applies real projection, patch-decoding, and typed-intent behavior for edits, suggestion acceptance, and resync while retaining deterministic scenario loaders and callback assertions.
- [ ] 4.7 Add a feature-local row projection and render each runtime action once with name, timing, category, optional target metadata, and non-empty notes as secondary italic content.
- [ ] 4.8 Retain the existing collection-level `GridContent` Edit and Notes workflows without duplicating the runtime summary; add only a semantic-free controls-only presentation option if composition requires it, with no per-row editing or annotation contract.
- [ ] 4.9 Remove the separate action-source status list and place View-source and Resync commands in one compact, keyboard-accessible menu on each linked action row; custom actions receive no source menu or persistent status label.
- [ ] 4.10 Update the stateful Storybook playground and deterministic scenario stories to cover visible authored notes, retained card-level Edit/Notes workflows, compact linked-source commands, custom actions, and suggestion request states.

## 5. Behavioral Verification

- [x] 5.1 Add a focused Playwright flow covering suggestion acceptance, persistence after reload, source navigation, source edit plus explicit resync, and deletion fallback; assert through visible labels, roles, focus, and stored user-visible behavior.
- [x] 5.2 Run `npm run verify:smoke`, `npm run test:coverage`, `npm run build`, and `npm run build-storybook`, and report any environmental blocker exactly.
- [x] 5.3 Validate the final planning/implementation reconciliation with `openspec validate p1-005-link-runtime-actions --type change --strict`.
- [ ] 5.4 Add focused projection/component contracts and update the Chromium flow to prove authored notes remain visible, source commands navigate/resync, card-level Edit/Notes remain available, and deletion fallback removes source controls without removing the action.
- [ ] 5.5 Re-run `npm run verify:smoke`, `npm run test:coverage`, `npm run build`, `npm run build-storybook`, and strict OpenSpec validation after the row-oriented refinement.

## 6. Backlog Updates & Reconciliation

- [x] 6.1 Reconcile the runtime-action architecture ADR with implemented schema/version details and record any material implementation fallout without widening the approved adapter boundary.
- [x] 6.2 Move completed inventory-source item `p1-005` to `Done Recently` while preserving refined `p1-061` for spell and feature sources; reconcile its stable-identity, suggestion, navigation, deletion, and atomic-union details only if implementation evidence changes its assumptions.
- [x] 6.3 Remove completed `p1-005` from the `Next recommended sequence` block, keep `p1-061` explicitly prioritized, and preserve the relative priority of `p1-027` and `p1-020` unless implementation evidence changes it.
- [x] 6.4 Update `docs/active-goals.md`, `docs/import-export-json.md`, and other current-schema references from v2 to v3 where applicable.
- [ ] 6.5 Reconcile the runtime-action ADR, active-goal wording, and provisional `p1-005` Done Recently entry with the exact row-oriented implementation while preserving both `p1-061` and the generic collection-interaction backlog follow-up.

## Executor Recommendation

- **Reasoning Level:** High
- **Model Complexity:** Complex
- **Rationale:** Execution crosses a versioned strict schema, sequential migration, storage/import-export contracts, typed reducer transactions, async Svelte UI, focus management, Storybook states, and black-box browser verification. The implementation remains bounded, but preserving data semantics and source-link invariants requires careful cross-layer reasoning.
