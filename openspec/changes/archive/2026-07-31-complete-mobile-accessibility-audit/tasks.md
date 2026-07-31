## 1. Audit Baseline and Durable Policy

- [x] 1.1 Create `docs/accessibility-control-audit.md` with bounded control-family entries for navigation, collapsible sheet sections, primitive editing, annotations, card actions, dialogs, spells, inventory, runtime actions, and source selection; record accessible-name ownership, touch-target status, keyboard-order status, automated/manual evidence, and exceptions.
- [x] 1.2 Capture baseline mobile Chromium measurements and phone-sized keyboard traversal for each control family, and mark every discovered failure or unverified exception in the audit before remediation.
- [x] 1.3 Create a lightweight touch-target ADR under `docs/decisions/` recording the 44 CSS-pixel coarse-pointer baseline, explicit non-overlapping sizing, preserved desktop density, allowed exception categories, and rejection of blanket pseudo-element hit areas.

## 2. Shared Control Remediation

- [x] 2.1 Add the scoped coarse-pointer touch-target utility using explicit 44 CSS-pixel minimum inline/block sizing without pseudo-elements or overlapping hit regions.
- [x] 2.2 Apply and verify the policy across `BaseButton` variants and composed triggers such as `OpenCloseToggleButton` and `MenuButton`, preserving their existing desktop dimensions.
- [x] 2.3 Apply and verify the policy for `MenuItemButton`, dialog navigation/actions, and shared form controls; for native checkboxes and radios, place the required padding and minimum dimensions on the explicitly associated label or wrapper while retaining the native input's visual dimensions.
- [x] 2.4 Add or update Storybook examples for affected compact, icon-only, menu, dialog, and form-control states so visible coarse-pointer variants remain reviewable and automated accessibility checks stay clean.

## 3. Sheet-Specific Control Remediation

- [x] 3.1 Remediate navigation and sheet-section expand/collapse controls that are not fully owned by the shared button policy.
- [x] 3.2 Remediate direct primitive edit, save/cancel, annotation, and card-action controls while retaining their established visible names and focus restoration.
- [x] 3.3 Remediate the individual actionable descendants within spell, feature, trait, inventory, collection-row, runtime-action, and source-picker surfaces, including filters and compact actions; do not size passive row/card containers unless the container is itself the control, and leave layout costs requiring collection restructuring unresolved for backlog refinement.
- [x] 3.4 Implement and verify qualifying associated-label, inline-flow, or equivalent-action exceptions; record each exception and its evidence in the audit, and leave density-only failures unresolved.

## 4. Keyboard and Focus Order

- [x] 4.1 Audit and correct document order across responsive sheet grids so phone-sized visual reading order matches sequential keyboard order without positive `tabindex`, duplicate responsive controls, or hidden focus targets.
- [x] 4.2 Add focused browser coverage proving collapsed or responsive-hidden sheet controls leave the keyboard sequence while the next visible task remains reachable.
- [x] 4.3 Add focused browser coverage for modal focus confinement and invoker restoration, and preserve the existing multi-step dialog and cross-browser popover focus contracts.

## 5. Mobile and Component Verification

- [x] 5.1 Add targeted Mobile Chrome Playwright checks that locate representative navigation, sheet, editing, annotation, menu, dialog, spell, inventory, runtime-action, and source-picker controls by visible roles/names and assert their returned CSS-pixel width and height are each at least 44; do not normalize locator bounding boxes or DOM client rectangles by `devicePixelRatio`.
- [x] 5.2 Add representative phone-sized keyboard-flow checks using actual browser input, keeping platform-dependent or assistive-technology-only conclusions in the manual audit.
- [x] 5.3 Update `docs/verification.md` with the focused mobile accessibility command and explain which touch, keyboard, screen-reader, and physical-device conclusions remain manual.
- [x] 5.4 Complete the phone-sized accessibility section of `docs/theme-visual-checklist.md`, including dense collection wrapping, non-overlapping activation, visible focus, associated-label hit areas, inline exceptions, and overlay context preservation.

## 6. Audit Closure and Quality Gates

- [x] 6.1 Resolve every audit entry as conforming, corrected, or explicitly excepted; confirm that no critical control family remains unresolved and that the audit stays bounded rather than enumerating repeated runtime instances.
- [x] 6.2 Run the official Svelte tooling against every modified Svelte component and resolve all reported issues before local gates.
- [x] 6.3 Run `npm run verify:smoke`, the documented focused Mobile Chrome project, `npm run test:e2e:all`, and `npm run test:perf`; record any environmental blocker or layout/performance fallout in the audit and design.
- [x] 6.4 Run `openspec validate complete-mobile-accessibility-audit --type change --strict` and reconcile material implementation decisions or deviations into the design, tasks, ADR, and maintainer documentation without retroactively over-specifying ordinary implementation details.

## 7. Backlog Updates & Reconciliation

- [x] 7.1 Remove `p1-020` from the P1 priority queue and refined backlog catalog only after the audit and verification requirements are complete.
- [x] 7.2 Add a concise timestamped `p1-020` completion entry to `Done Recently`, prune that section to its bounded recent history, and remove the completed item from the `Next Recommended Sequence`.
- [x] 7.3 Re-sequence the remaining recommended targets so the next backlog item is explicit and update `docs/active-goals.md` if the completed mobile/accessibility status changes its current product-status wording.

## Executor Recommendation

Use a complex coding model with high reasoning for the audit and remediation because the work crosses Svelte component ownership, responsive CSS, keyboard behavior, exceptions, Storybook, and black-box Playwright evidence. A Codex Sol-class executor is recommended for the implementation and verification passes; a simpler model can assist with mechanical audit-table and documentation updates after the control classifications are settled.
