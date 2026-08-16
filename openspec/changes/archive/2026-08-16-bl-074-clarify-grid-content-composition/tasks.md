## 1. Baseline Inventory and Contracts

- [x] 1.1 Review current Svelte 5 first-party guidance plus the repository's native-dialog, menu, focus, touch-target, Storybook, and component-composition decisions before changing component APIs; record why any suitable local primitive is not reused.
- [x] 1.2 Record in `design.md` a complete migration inventory for every `GridContent`, `GridContainer`, focused edit/notes dialog, annotation control, dense-list, and 2014 route consumer, including its current responsibilities and intended destination.
- [x] 1.3 Add or strengthen focused tests around existing field normalization/formatting, primitive direct-edit patches, structured form collection, annotation grouping, stable list keys, focus restoration, collapse behavior, responsive layout, and nested elevation before extraction.
- [x] 1.4 Capture the current user-visible desktop and phone behavior for representative mixed-field, structured-array, annotated, dense-list, and nested/collapsible panel surfaces so later verification can distinguish refactor fallout from approved behavior.

## 2. Field, Form, and Annotation Boundaries

- [x] 2.1 Extract a display-oriented field-group body that owns normalization, field presentation selection, and field arrangement without owning card actions, dialogs, focus restoration, persistence, or save-shape adaptation.
- [x] 2.2 Keep `GridPrimitiveField` as the focused direct primitive editor and verify save, unchanged-save, invalid-number, cancel, annotation, keyboard, touch-target, and focus behavior through component and unit coverage.
- [x] 2.3 Extract the recursive structured-field form body from the focused edit dialog, remove duplicated array/non-array input markup where one leaf renderer is honest, and preserve nested values, add/remove controls, hidden fields, validation presentation, and draft cancellation.
- [x] 2.4 Recompose the focused edit workflow from the structured-form body and a native dialog boundary; reuse `DialogShell` unchanged when native form ownership suffices or make only the owner-approved narrow form/footer extension demonstrated by the proof.
- [x] 2.5 Consolidate singular and grouped annotation dialog orchestration around the existing annotation display/editor bodies while preserving read-first behavior, add/edit/remove drafts, references, cancel, modal dismissal, and trigger focus restoration.
- [x] 2.6 Recompose the card-level field organism from the display body, action menu, focused form, annotation surface, focus behavior, and current save adapters without moving validation, typed intents, persistence, source, query, or navigation ownership out of the page/domain layer.

## 3. Responsive Layout and Panel Boundaries

- [x] 3.1 Implement a focused responsive-layout component for flow, base/breakpoint counts, gaps, and child placement without border, padding, elevation, heading, or collapse responsibilities.
- [x] 3.2 Implement a focused panel-surface component for border, padding, visual surface, and nested elevation without responsive-grid or collapse responsibilities.
- [x] 3.3 Implement a focused collapsible-panel component that composes heading/toggle and panel content with local initial collapse behavior, accessible naming, touch targets, and keyboard operation.
- [x] 3.4 Replace `GridContent`'s internal use of the multi-purpose container with the field-group/layout seam and add focused coverage for one-, two-, and three-column container-responsive arrangements.
- [x] 3.5 Add component coverage for layout-only, plain surface, nested elevation, titled expanded/collapsed, initially collapsed, and responsive panel combinations without recreating the legacy combinatorial prop API.

## 4. Isolated Storybook Proof and Cleanup Plan

- [x] 4.1 Add realistic stateful stories for field-group display covering read-only, persistent and quiet direct edit, annotation presence/absence, multiline/array, empty, mixed, invalid primitive input, and responsive column states.
- [x] 4.2 Add realistic stateful stories for focused structured forms and annotation surfaces covering valid save, array add/remove, annotation add/edit/remove/cancel, references, modal dismissal, and focus return; keep domain validation in its existing owner rather than inventing generic form validation.
- [x] 4.3 Add realistic stories for responsive layout, panel surface, nested elevation, and collapse behavior, and use the proof to select final component names and minimal prop APIs.
- [x] 4.4 Document the explicit omission of the non-shipping BL-077 interaction study, deferring the bulk annotation comparison to the dedicated BL-077 scope to prevent scope creep.
- [x] 4.5 Review the existing dense-list story hierarchy and record whether the responsive preview/focused-dialog boundary is an organism while list view/row pieces remain molecules and the 2014 dense-collection workflow remains domain-owned.
- [x] 4.6 Run `npm run check`, `npm run lint`, focused unit tests, and `npm run test:storybook -- --run`; resolve automated accessibility findings and prepare a concise manual owner checklist for desktop, phone, keyboard, touch, focus, nested layout, forms, and annotations.
- [x] 4.7 Record a cleanup ledger listing the legacy container, superseded component paths, temporary adapters, and rejected interaction-study code that must be removed before final verification.

## 5. Mid-Apply Owner Gate

- [x] 5.1 **STOP — Human review and explicit approval of the component-boundary Storybook proof.** The owner reviewed field-group, primitive edit, structured-form, annotation, responsive-layout, panel, collapse, focus, and error states; approved the final names, ownership, and taxonomy; and accepted explicit deferral of the non-shipping BL-077 comparison to that dedicated behavior change. An agent MUST NOT check this task or begin route-wide migration until the owner explicitly approves the proof; requested revisions remain in Sections 2–4.

## 6. Representative 2014 Integration

- [x] 6.1 Migrate one representative mixed direct/read-only/annotated field card to the approved field-group and card composition, preserving RFC 6902 paths, compatibility patches, text selection, validation, persistence, and focus behavior.
- [x] 6.2 Migrate one representative inventory dense collection to the approved structured-form and annotation compositions while preserving generic stable row keys, domain semantic identity, query context, typed intents, bulk editing, and row focus restoration.
- [x] 6.3 Migrate one representative nested, responsive, titled/collapsible 2014 section to the approved layout and panel boundaries while preserving visible geometry, initial collapse, landmarks, nested elevation, and touch/keyboard behavior.
- [x] 6.4 Run focused Svelte diagnostics, unit tests, Storybook checks, and Chromium browser flows for the three representative integrations; reconcile any material boundary fallout in `design.md` before propagation.

## 7. Complete Consumer Migration and Pruning

- [x] 7.1 Migrate every remaining `GridContent` consumer to the approved field-group/card composition without changing projected data, direct/structured save ownership, annotations, validation, or user-visible Edit/Notes behavior.
- [x] 7.2 Migrate every remaining focused form and annotation consumer, including dense inventory/spell workflows, while preserving selected-row identity, source navigation, query reset/retention, typed intent translation, bulk paths, and focus restoration.
- [x] 7.3 Migrate every remaining layout, bordered card, nested panel, heading, and collapse consumer from `GridContainer` to the approved focused layout/panel components.
- [x] 7.4 Use repository search to account for every migration-ledger entry, verify there are no remaining `GridContainer` imports or render call sites, and delete the legacy component rather than retaining a compatibility-only wrapper.
- [x] 7.5 Remove superseded helpers, duplicated dialog/form/annotation orchestration, rejected BL-077 prototype code, and obsolete stories identified by the cleanup ledger; retain experimental evidence only when it has an explicit ongoing BL-077 purpose and documented owner approval.
- [x] 7.6 Re-run the focused test sets after deletion and confirm that no page-specific mutation, persistence, source, resync, query, or navigation responsibility leaked into generic components during propagation.

## 8. Documentation and Verification Fallout

- [x] 8.1 Update `docs/field-binding-contract.md` to current paths and the established direct-RFC-6902 versus typed-structured-intent ownership without turning implementation details into an OpenSpec behavior requirement.
- [x] 8.2 Reconcile `docs/field-interaction-model.md` with durable selection, copy, accessibility, explicit-commit, and persistence principles while identifying View/Edit behavior as pending `BL-077`; mark `docs/field-rendering-api.md` historical/superseded and link current guidance.
- [x] 8.3 Refine `docs/decisions/2026-07-25-classify-ui-component-composition.md` with the implemented field, form, annotation, list, layout, panel, and organism boundaries; keep the typed-edit-intents ADR authoritative and create no parallel organization-only ADR.
- [x] 8.4 Reconcile Storybook titles/descriptions and maintainer documentation so atoms, molecules, organisms, domain workflows, and page-specific black-box coverage match their implemented responsibilities.
- [x] 8.5 Run `npm run verify:smoke`, the relevant cross-browser application suite for modal/focus/responsive changes, `git diff --check`, and `openspec validate bl-074-clarify-grid-content-composition --strict`; report exact environmental blockers and complete every remaining executable check.
- [x] 8.6 Reconcile material implementation decisions, omissions, verification discoveries, cleanup results, and the owner-selected BL-077 evidence into `design.md` and `tasks.md`; update the proposal or delta spec only if explicitly approved observable scope changed.
- [x] 8.7 Confirm the cleanup ledger is empty, all retained reusable components have current consumers or durable Storybook responsibility, and the repository contains no undocumented compatibility or rejected-prototype code before presenting the final review.

## 9. Final Post-Apply Owner Gate

- [x] 9.1 **STOP — Human final review and explicit approval.** Present the final component map, representative and route-wide behavior, Storybook catalog, zero-use/deletion evidence, documentation reconciliation, verification results, and material fallout. An agent MUST NOT check this task, mark the change complete, prune `BL-074`, or begin archival until the owner explicitly approves the final result.

## 10. Backlog Updates & Reconciliation

- [x] 10.1 During archival, sync the `sheet-adapter-refactoring` delta into the main specifications and validate the resulting OpenSpec state.
- [x] 10.2 Remove `BL-074` from the P0 queue and refined backlog catalog, add a concise timestamped summary at the top of `Done Recently`, and keep that section bounded to its 3–5 newest entries.
- [x] 10.3 Re-sequence the `Next Recommended Sequence` so `BL-076` becomes the next Horizon A target followed by `BL-075`, while retaining `BL-077` as the separately prioritized P1 behavior unless owner evidence explicitly promotes it.
- [x] 10.4 Update `docs/active-goals.md` and vision/component guidance if the completed boundaries materially change their current-state descriptions, and confirm `BL-076`, `BL-069`, and `BL-070` reference the implemented ownership rather than the removed legacy wrapper.

## Executor Recommendation

Use a complex implementation model at high reasoning (Codex Sol-equivalent). The work combines Svelte 5 component API decomposition, native dialog/form/focus semantics, Storybook interaction proof, a broad but behavior-preserving route migration, and mandatory stale-code pruning; a simpler model is appropriate only for isolated documentation or test follow-ups after the mid-apply owner gate.
