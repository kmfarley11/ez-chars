## 1. UI Presentation Primitive

- [ ] 1.1 Establish the smallest shared presentation seam for the "Rule of 10", reusing `GridContentListView`, `DialogShell`, and discrete scroll-affordance pieces instead of a generic wrapper.
- [ ] 1.2 Implement the presentation logic (simple list if <=10 items, bounded/focused searchable container if >10 items).
- [ ] 1.3 Implement domain-owned projections and filtering logic for Runtime Actions and supporting collections, sharing only the proven presentation components without forcing a universal wrapper.

## 2. Isolated Presentation Proof (Mid-Apply Gate)

- [ ] 2.1 Build Storybook harnesses isolating the 2014 Runtime Actions using the new seam (proving both 10 and 11+ records).
- [ ] 2.2 Build Storybook harnesses isolating the Features presentation using the new seam (proving both 10 and 11+ records).
- [ ] 2.3 Add a short Languages or Tools example in Storybook using the new seam.
- [ ] 2.4 Implement search filtering for Runtime Actions within the harness (name, target, notes, timing, category, source label/category, source context).
- [ ] 2.5 Create desktop and phone alternatives in Storybook for 11+ items (compare inline scrolling vs focused desktop view).
- [ ] 2.6 Run diagnostics and Storybook interaction checks on the isolated proof.
- [ ] 2.7 STOP — Human review and approval (Agents CANNOT self-complete this task. Mid-Apply Gate: Review the Storybook proofs on desktop/mobile to decide the scroll-owner approach. Explicit approval unlocks route integration and rollout).

## 3. Route Integration & Rollout

- [ ] 3.1 Integrate the approved presentation pattern for Runtime Actions and Features into the main sheet route.
- [ ] 3.2 Apply the approved presentation pattern to Traits.
- [ ] 3.3 Apply the approved presentation pattern to Languages and Tools.

## 4. Verification

- [ ] 4.1 Add focused unit/component checks for the new presentation seam.
- [ ] 4.2 Add saturated desktop and mobile black-box coverage to test multiple dense collections.
- [ ] 4.3 Run relevant cross-browser verification focusing on scroll capture, responsive dialogs, focus-restoration, and modal-locking.
- [ ] 4.4 Explicitly verify that Add, Source navigation, Resync, annotations, and card editing remain fully functional across both bounded and focused states.
- [ ] 4.5 Run `npm run verify:smoke`, `npm run test:e2e:all`, and `git diff --check`.

## 5. Human Review & Approval

- [ ] 5.1 STOP — Post-apply user review and explicit approval (Agents CANNOT self-complete this task).

## 6. Backlog Updates & Reconciliation

- [ ] 6.1 Sync the delta spec to the main specs directory.
- [ ] 6.2 Validate the affected main spec.
- [ ] 6.3 Run `openspec validate --all --strict`.
- [ ] 6.4 Archive the completed OpenSpec change.
- [ ] 6.5 Prune `BL-076` from `docs/backlog.md` priority queue and refined catalog, moving it to `## Done Recently` with a brief summary.
- [ ] 6.6 Reconcile the 'Next recommended sequence' block in `docs/backlog.md` by removing the completed target and shifting others up.
- [ ] 6.7 Update `docs/active-goals.md` if applicable.

## Executor Recommendation

**Minimum capability tier:** Advanced
**Reasoning depth:** High
**Rationale:** The task involves heterogeneous projection boundaries (Runtime Actions vs. GridContentData) and requires rigorous nested-scroll and focus-restoration testing across desktop and mobile affordances. A high-reasoning executor is needed to safely adapt the presentation without breaking domain mutations.
