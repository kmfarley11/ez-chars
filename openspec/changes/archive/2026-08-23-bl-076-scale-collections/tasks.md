## 1. UI Presentation Primitive

- [x] 1.1 Establish the smallest shared presentation seam for configurable domain-owned density limits, reusing `DialogShell`, list/count helpers, `GridContentListView` conventions, and discrete scroll-affordance pieces instead of its domain-specific row contract or a generic data wrapper.
- [x] 1.2 Implement the presentation logic (simple list within the applicable limit, bounded/focused searchable container above it).
- [x] 1.3 Implement domain-owned projections and filtering logic for Runtime Actions and supporting collections, sharing only the proven presentation components without forcing a universal wrapper.

## 2. Isolated Presentation Proof (Mid-Apply Gate)

- [x] 2.1 Build Storybook harnesses isolating the 2014 Runtime Actions using the new seam (proving the 5/6 boundary).
- [x] 2.2 Build Storybook harnesses isolating the Features presentation using the new seam, preserving the existing compact bullet-list grammar while proving the 7/8 threshold plus paired narrow-width preview truncation and Browse-to-full wrapping states.
- [x] 2.3 Add a short Languages or Tools example in Storybook using the new seam.
- [x] 2.4 Implement search filtering for Runtime Actions within the harness (name, target, notes, timing, category, source label/category, source context).
- [x] 2.5 Build the hybrid presentation (inline bounded browsing on desktop, focused modal on phone) in Storybook above each applicable limit, with a saturated supporting-collection story that is tall enough to prove actual overflow and wheel behavior.
- [x] 2.6 Run diagnostics and Storybook interaction checks, add visible phone-viewport review notices to phone-specific stories, and prepare the named macOS Firefox wheel playtest for owner execution at the human gate.
- [x] 2.7 STOP — Human review and approval (Agents CANNOT self-complete this task. Mid-Apply Gate: Review the selected 5/6 boundary for Runtime Actions and 7/8 boundary for supporting collections; validate desktop wheel behavior, visual scroll affordance, the mobile dialog, and narrow-width wrap/truncation behavior without horizontal scrolling. Explicit approval unlocks route integration and rollout).

## 3. Route Integration & Rollout

- [x] 3.1 Integrate the approved presentation pattern for Runtime Actions and Features into the main sheet route.
- [x] 3.2 Apply the approved presentation pattern to Traits.
- [x] 3.3 Apply the approved presentation pattern to Languages and Tools.

## 4. Verification

- [x] 4.1 Add focused unit/component checks for the new presentation seam.
- [x] 4.2 Add saturated desktop and mobile black-box coverage to test multiple dense collections.
- [x] 4.3 Run relevant cross-browser verification focusing on scroll capture, responsive dialogs, focus-restoration, and modal-locking.
- [x] 4.4 Explicitly verify that Add, Source navigation, Resync, annotations, and card editing remain fully functional across both bounded and focused states.
- [x] 4.5 Run `npm run verify:smoke`, `npm run test:e2e:all`, and `git diff --check`.

## 5. Human Review & Approval

- [x] 5.1 STOP — Post-apply user review and explicit approval (Agents CANNOT self-complete this task).

## 6. Backlog Updates & Reconciliation

- [x] 6.1 Sync the delta spec to the main specs directory.
- [x] 6.2 Validate the affected main spec.
- [x] 6.3 Run `openspec validate --all --strict`.
- [x] 6.4 Archive the completed OpenSpec change.
- [x] 6.5 Prune `BL-076` from `docs/backlog.md` priority queue and refined catalog, moving it to `## Done Recently` with a brief summary.
- [x] 6.6 Reconcile the 'Next recommended sequence' block in `docs/backlog.md` by removing the completed target and shifting others up.
- [x] 6.7 Update `docs/active-goals.md` if applicable.

## Executor Recommendation

**Minimum capability tier:** Advanced
**Reasoning depth:** High
**Rationale:** The task involves heterogeneous projection boundaries (Runtime Actions vs. GridContentData) and requires rigorous nested-scroll and focus-restoration testing across desktop and mobile affordances. A high-reasoning executor is needed to safely adapt the presentation without breaking domain mutations.
