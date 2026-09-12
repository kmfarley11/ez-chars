## 1. Isolated Landmark-Navigation Proof

- [x] 1.1 Create and maintain the linked [verification record](verify.md) with the smallest unique sandbox, reusable interaction bullets, expected outcomes, dated automated evidence, owner decisions, and post-apply status.
- [x] 1.2 Define and validate the 2014-owned parent/child landmark descriptor tree, including unique fragments, parent references, visible order, optional icon keys, and resolvable destinations independent of mounted panels.
- [x] 1.3 Add the sheet-local context/coordinator for mounted destination controllers, ancestor expansion, post-render scrolling, heading focus, and direct navigation resolution without introducing an application store or universal system registry; defer route-history integration to task 3.4.
- [x] 1.4 Extend the shared `CollapsiblePanel` only with domain-neutral heading ID, optional icon content, externally requested expansion, and focus seams; add a 2014 feature-local navigable composition that translates landmark descriptors into those inputs while preserving ordinary independent collapse behavior.
- [x] 1.5 Audit existing icon primitives and `BL-079`, then add only the minimum centralized feature-local icon vocabulary needed to compare eight fixed-size destination shortcuts without a dependency or repository-wide icon migration.
- [x] 1.6 Build one configurable, stateful Storybook sandbox for the `16rem` complete outline, `3rem` rail, preferred phone rail, labeled-outline fallback, nested collapsed destinations, and independent Abilities & Proficiencies and Features & Traits panels; do not add Storybook `play` functions or viewport-only duplicate stories.
- [x] 1.7 Add focused Vitest contracts for descriptor integrity, generic panel behavior, and nested navigation resolution, then run the relevant unit, Svelte diagnostic, lint, and Storybook checks and record dated results in `verify.md`.
- [x] 1.8 Address owner proof feedback before approval: keep the measurement banner from obscuring jump targets; compact the fine-pointer outline while retaining coarse-pointer targets and bounded overflow; verify that each native pointer tooltip and accessible name derives from the matching destination label; and iterate the eight destination icons in the same sandbox until the owner explicitly finalizes the bounded icon set. Do not broaden this into `BL-079` icon consolidation.

## 2. STOP — Human Proof Review and Approval

- [x] 2.1 **STOP — Human review and approval:** Using [verify.md](verify.md), the owner reviews viewport and remaining sheet-workspace widths around the initial `1280px` proxy, expanded and minified desktop behavior, the preferred phone icon rail and labeled-outline fallback in portrait and landscape, finalized icon and label comprehension, fixed touch targets, the bounded panel split, hidden-destination expansion/focus, and disclosure focus/return behavior. Explicit approval selects the responsive threshold, phone/labeled-outline presentation, and finalized icon direction and unlocks Section 3; the agent MUST NOT check this task or begin route propagation without that approval. Route history, Rules interaction, saturated scrolling, and Firefox/macOS paint behavior are deliberately reserved for Sections 4 and 5 after route integration.

## 3. Approved 2014 Route Rollout

- [x] 3.1 Reconcile the owner-selected responsive threshold and whether it is viewport- or container-relative, exact binary widths, phone presentation, labeled-outline behavior, and icon set into `design.md`, the capability spec when observable behavior changes, `docs/backlog.md`, and `verify.md`; decide whether the resulting context boundary triggers an ADR or refinement of the existing sheet-architecture decision.
- [x] 3.2 Integrate the approved navigation composition into the saturated 2014 route with selectable Overview, Runtime, and Organizational parents plus the eight approved child landmarks, all driven from the 2014 descriptor tree.
- [x] 3.3 Split Abilities & Proficiencies from Features & Traits into independent navigable collapse units without reorganizing the remaining sheet regions or cards.
- [x] 3.4 Implement deduplicated fragment-history entries and Back/Forward resolution through the coordinator so different explicit destinations create entries, repeated current-destination actions only reposition/refocus, hidden historical targets reopen and focus, ordinary scrolling leaves history unchanged, and unchanged-fragment Rules closure retains its existing invoker-focus precedence.
- [x] 3.5 Complete the approved wide, tighter-desktop, and phone layouts without persistent preferences, continuous resizing, observer-driven active tracking, document-level overflow, undersized controls, or obstruction of the Rules path.
- [x] 3.6 Remove temporary or redundant proof fixtures while retaining the smallest unique navigation sandbox, its manual interaction callouts, and application fixture needed for future review.
- [x] 3.7 Update `docs/accessibility-control-audit.md` for every new rail, outline, disclosure, and navigable-heading control family or document why it inherits an existing conforming shared pattern.

## 4. Automated and Manual Verification

- [x] 4.1 Add or update Playwright application coverage for landmark order and labels, direct visible and hidden jumps, focus, independent collapse, fragments, repeated-current-destination history deduplication, Back/Forward reopening, responsive rail/outline behavior, and interleaved Rules close/focus history using visible roles and labels rather than component internals.
- [x] 4.2 Add or update Mobile Chrome geometry and keyboard coverage for fixed 44-by-44 CSS-pixel controls, non-overlap, logical visible order, labeled-outline recovery, and absence of document-level horizontal overflow.
- [x] 4.3 Run `npm run verify:smoke`, `npm run build`, `npm run build-storybook`, `npm run test:e2e:all`, `npm run test:perf`, and the non-gating Firefox performance comparison; record dated commands and outcomes in `verify.md`.
- [x] 4.4 Perform the manual desktop, phone portrait/landscape, keyboard, touch, assistive-technology, theme, and headed Firefox/macOS rapid-scroll checks in `verify.md`, recording any material deviance and its backlog destination.
- [x] 4.5 Perform a final implementation and artifact coherence review, reconcile every deferred finding or evidence trigger into `docs/backlog.md`, and present the resulting scope, verification evidence, and material fallout to the owner.

## 5. STOP — Post-Apply User Review and Approval

- [x] 5.1 **STOP — Final owner review and approval:** The owner reviews the complete 2014 route behavior, retained Storybook sandbox, automated evidence, physical responsive behavior, accessibility results, history/Rules interaction, Firefox finding, and backlog-reconciled follow-ups. The agent MUST leave this task unchecked until the owner explicitly approves the post-apply result; archival is not authorized before that approval.

## 6. Backlog Updates & Reconciliation

- [x] 6.1 **Archive time:** Confirm every unresolved follow-up and evidence trigger has an existing, updated, raw-ideation, or newly refined destination in `docs/backlog.md` before removing the active change.
- [x] 6.2 **Archive time:** Remove `BL-073` from the P0 queue and refined catalog, add a dated summary to the top of `Done Recently`, and prune that section to its bounded 3–5 entries.
- [x] 6.3 **Archive time:** Remove `BL-073` from and re-sequence the `Next Recommended Sequence` block so `BL-084` becomes the next target unless newer evidence changes the order.
- [x] 6.4 **Archive time:** Update `docs/active-goals.md` to describe the delivered sheet-navigation baseline and any explicitly deferred limitation.
- [x] 6.5 **Archive time:** Sync the delta spec into the main capability spec, preserve the archived delta operation headings, repair archive-relative supplemental links, and run strict validation for the affected main spec followed by `openspec validate --all --strict`.

## Executor Recommendation

Use a high-reasoning, complex-capability executor. The work combines Svelte context and conditional rendering, focus and fragment-history semantics, responsive/sticky layout, touch geometry, Storybook proof design, Playwright browser behavior, and a known browser/platform paint risk; the named owner gates require careful artifact reconciliation rather than autonomous rollout.
