## 1. Proof-Before-Propagation Batch

- [x] 1.1 Update supplemental verification record `openspec/changes/bl-084-harden-core-mobile-viability/verify.md` with mapped named stories, full cross-browser requirements, and physical-iPhone inspection steps
- [x] 1.2 Implement route-local character summary projection helper in `src/routes/characterSummary.ts` with pure unit tests in Vitest
- [x] 1.3 Implement one unique responsive character-list Storybook sandbox under `Organisms/CharacterList / Responsive` (evaluating desktop table vs. mobile `ul > li > article` card list, tuneable 768px baseline, and direct vs. menu secondary actions)
- [x] 1.4 Inventory popover menu consumers, establish default shared close-on-command seam in `MenuItemButton` / `MenuButton`, and update existing `Molecules/GridContentActionMenu` and `Molecules/MenuButton` stories
- [x] 1.5 Add WebKit $\ge 16$px input typography CSS baseline in `src/app.css`, update `GridPrimitiveField.svelte`, and verify in existing `Molecules/GridPrimitiveField` stories
- [x] 1.6 Migrate any existing Storybook `play` assertions touched by these components into Vitest or Playwright, and consolidate `Molecules/GridPrimitiveField` to a standard `Default` story export

## 2. Mid-Apply Checkpoint

- [x] 2.1 STOP — Human review and approval of isolated mobile viability proof in Storybook (`Organisms/CharacterList / Responsive`, `Molecules/GridContentActionMenu / Default`, `Molecules/GridPrimitiveField / Default`) and physical phone. Explicit human approval is required to proceed to Section 3.

## 3. Full Rollout Batch

- [x] 3.1 Integrate responsive character list (`ul > li > article` cards on mobile, semantic table on desktop) into `src/routes/+page.svelte`
- [x] 3.2 Remove duplicated ad-hoc `hidePopover()` calls in collection consumers (`GridContentListRow.svelte`, `RuntimeActionsCollection.svelte`), relying on the shared menu seam
- [x] 3.3 Audit and update all remaining form inputs, textareas, and selects (`ValidatedInputField.svelte`, `StructuredForm.svelte`, `ActionDraftForm.svelte`, `GridContentAnnotationsEditor.svelte`, `ReferencePdfViewer.svelte`, `ManagePinsDialog.svelte`) to ensure $\ge 16$px computed font size on mobile viewports
- [x] 3.4 Add Playwright black-box tests asserting mobile card list rendering, zero horizontal document overflow, popover disclosure reset on dialog trigger/close, and mobile computed input font size across Chromium, Firefox, WebKit, and Mobile Chrome

## 4. Verification & Hardening

- [x] 4.1 Run local verification suite (`npm run verify:smoke`), run complete cross-browser test matrix (`npm run test:e2e:all`), and record results in `verify.md` (physical iPhone Safari remains the focus-zoom proof)
- [x] 4.2 Validate OpenSpec change integrity with `npx openspec validate bl-084-harden-core-mobile-viability --strict`
- [x] 4.3 After the physical-iPhone focus-zoom failure, retain the explicit 16px control baseline and apply a bounded inline-focus experiment using `focus({ preventScroll: true })`; extend the mobile browser check to record scale and scroll stability around inline focus
- [x] 4.4 Re-run the inline Current HP and Death Saves proof on physical iPhone Safari and record whether the corrective experiment prevents persistent magnification without disabling pinch zoom or obscuring the focused control
- [x] 4.5 Correct the saturated Features collection's intrinsic-width overflow through the shared panel containment seam and add a mobile black-box regression proving both the collection and document remain within the viewport

## 5. Post-Apply Review & Approval

- [x] 5.1 STOP — Post-apply user review and explicit approval. The human reviewer inspected the completed physical-phone experience and explicitly approved BL-084; the remaining mobile-only PDF rendering failure stays assigned to `BL-082`.

## 6. Backlog Updates & Reconciliation (Archive-time)

- [x] 6.1 Prune `BL-084` from priority queues and catalog in `docs/backlog.md` and move a summary entry to the top of `## Done Recently` (pruning to 3-5 recent items)
- [x] 6.2 Re-sequence `## Next Recommended Sequence` in `docs/backlog.md`, promoting `BL-077` to #1
- [x] 6.3 Reconcile `docs/active-goals.md` and `docs/vision/author-desires.md` if any goal status has shifted

## Executor Recommendation

- **Executor Reasoning Level**: Medium
- **Model Complexity**: Complex (requires careful attention to Svelte 5 runes, native Popover API, accessible screen-reader markup trees, responsive layout, and physical phone verification)
