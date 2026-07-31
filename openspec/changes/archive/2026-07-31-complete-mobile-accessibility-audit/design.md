## Context

The completed first slice of `p1-020` added accessible menu/list semantics, dialog scroll locking, between-step focus handling, cross-browser popover focus restoration, Storybook accessibility coverage, and a mobile Chromium Playwright project. The remaining sheet contains a mixture of shared button primitives, compact menu actions, native form controls, and route-specific controls. Several shared defaults already meet 44 CSS pixels, while compact variants and raw controls do not.

A prior blanket pseudo-element approach was rejected because it obscured which controls were actually conforming, did not enlarge measurable element bounds, behaved inconsistently on replaced controls, and could create overlapping hit regions. This change therefore needs an explicit control inventory, a narrow sizing policy, and both automated and manual evidence.

## Goals / Non-Goals

**Goals:**

- Account for every current character-sheet control family rather than assuming shared buttons cover the whole surface.
- Give non-exempt touch controls explicit, measurable, non-overlapping 44-by-44 CSS-pixel bounds on coarse-pointer presentations.
- Preserve dense desktop layouts and logical keyboard order across responsive grid reflow.
- Bound and explain legitimate exceptions so they cannot become a general density escape hatch.
- Add repeatable mobile and cross-browser verification while retaining manual checks for semantics that automation cannot prove.
- Capture the lasting density-versus-touch decision in an ADR and close `p1-020` only after the audit has no unresolved critical controls.

**Non-Goals:**

- Redesigning sheet sections, themes, or the established grid model.
- Converting every raw control into one universal component.
- Claiming comprehensive WCAG certification or replacing screen-reader and physical-device review.
- Adding a dependency, testing framework, or system-agnostic UI registry.

## Decisions

### 1. Drive remediation from a bounded control-family audit

Create `docs/accessibility-control-audit.md` as the reviewable inventory for the current home-to-sheet flow. Group entries by shared primitive or owning surface rather than listing every repeated runtime instance. Each entry records the visible control family, accessible name source, touch-target result, keyboard-order result, automated evidence, manual evidence, and exception if any.

This audit is completed alongside implementation, not after it. It prevents a shared-primitive fix from being mistaken for a sheet-wide result and gives future controls a concrete review baseline.

**Alternative considered:** rely on Storybook and automated accessibility output alone. This was rejected because automated accessibility rules do not establish touch geometry, screen-reader comprehension, or the usability of inline exceptions.

### 2. Use explicit coarse-pointer minimum sizing

Add one small shared touch-target utility in the global style layer using `min-inline-size` and `min-block-size` of 44 CSS pixels inside a coarse-pointer media query. Apply it through shared controls where ownership is clear and directly on remaining route-specific controls when extracting a component would not otherwise improve the code.

Shared component variants retain their existing desktop sizes. Apply the policy to the actual interactive element or associated hit-area owner, not to a passive row, card, or collection container merely because it contains a control. If the whole row is itself interactive, it must meet the baseline; otherwise, audit its actionable descendants individually. A conforming child control may legitimately increase a dense row's phone-sized height. If that cost cannot be resolved without restructuring the collection, leave the audit entry unresolved and return the structural work to backlog refinement rather than treating density as an exception.

Checkboxes, radios, and similar native controls retain their native visual dimensions. Their explicitly associated label or wrapper receives the padding and minimum dimensions needed to provide the conforming hit area and transfer activation to the named input; do not attempt to force the replaced input itself to 44 by 44 pixels. Inline prose links are not forced into block-like dimensions.

**Alternatives considered:**

- Enlarge all controls at every viewport. Rejected because it needlessly removes useful desktop density.
- Restore blanket pseudo-element hit areas. Rejected because the resulting regions are difficult to measure, can overlap, and are unreliable on replaced controls.
- Introduce a general control framework. Rejected because the current repeated need is satisfied by one policy utility plus existing primitives.

### 3. Bound exception categories in policy and audit evidence

Create a lightweight touch-target ADR that records the 44 CSS-pixel coarse-pointer baseline, the explicit-sizing choice, and the only acceptable exception categories:

1. an inline link or control whose literal sizing would disrupt flowing text;
2. a small native control whose associated label or wrapper supplies the conforming hit area;
3. a redundant small control with an equivalent conforming action on the same surface.

Every exception must be named in the audit and retain an accessible name, visible focus, and non-overlapping activation. Density alone is not an exception.

**Alternative considered:** leave exceptions to implementation judgment. Rejected because the audit would become irreproducible and later agents could gradually weaken the baseline.

### 4. Preserve keyboard order through document structure

Responsive layouts continue to use one semantic DOM sequence. Implementation must not add positive `tabindex`, duplicate desktop/mobile interactive copies, or CSS ordering that makes focus contradict the visible reading order. Hidden or collapsed content must be removed from sequential focus.

The audit follows representative keyboard paths through navigation, collapsible sheet regions, direct field editing, card menus, dialogs, spells, inventory, and runtime actions. Existing modal and popover focus behavior becomes part of the durable accessibility contract.

**Alternative considered:** repair visual/DOM mismatch with explicit tabindex values. Rejected because it is brittle across responsive states and creates a separate focus model to maintain.

### 5. Combine targeted geometry checks with black-box interaction tests

Add focused mobile Chromium checks that locate representative controls through user-visible roles and names, then inspect rendered bounds for the 44-by-44 baseline. Keyboard checks use actual browser input for representative responsive flows. Existing cross-browser tests continue to protect native dialog and popover behavior, including the narrow WebKit focus fallback.

Playwright locator bounding boxes and DOM client rectangles already report viewport geometry in CSS pixels. Geometry assertions compare their returned width and height directly with 44 and must not divide or multiply those measurements by `window.devicePixelRatio`; device scale affects device-pixel output such as screenshots, not the CSS-pixel target baseline.

Storybook demonstrates affected shared-control variants and runs configured accessibility checks, but does not claim to prove platform-native behavior from synthetic events. Manual audit evidence remains required for inline links, associated-label hit areas, screen-reader reading order, and physical touch use.

The mobile project remains an on-demand/full-gate project so routine desktop smoke feedback stays fast. The verification guide documents the focused mobile command.

**Alternative considered:** make one exhaustive E2E loop over every DOM control. Rejected because it would be brittle, slow, and unable to distinguish legitimate exceptions from regressions.

### 6. Verify layout cost and reconcile planning artifacts

Run the routine smoke gate, the focused mobile project, all configured browser projects, and the existing performance baseline after remediation. Complete the theme/accessibility checklist manually at a phone-sized viewport. Validate the OpenSpec artifacts before archival.

Once all audit entries are resolved, archive the change with spec synchronization, remove `p1-020` from the active backlog and recommended sequence, add a bounded Done Recently entry, and update active goals only if its current status wording needs reconciliation.

## Risks / Trade-offs

- **[Risk] Explicit minimum sizes increase wrapping or card height on dense phone layouts.** → Apply the policy only for coarse pointers, inspect representative dense spell/inventory/runtime collections, and keep structural collection scaling in its existing backlog item.
- **[Risk] A shared utility creates false confidence that all controls are covered.** → Require the control-family audit and route-specific review before completion.
- **[Risk] Automated geometry checks become brittle when copy changes.** → Locate controls by stable roles and accessible names, cover representative families, and keep exhaustive accounting in the audit rather than E2E.
- **[Risk] Exceptions expand until the baseline is ineffective.** → Limit categories in the ADR and require named evidence for every exception.
- **[Risk] Touch sizing changes keyboard or visual order accidentally.** → Preserve one DOM sequence, prohibit positive tabindex, and test representative responsive traversal.
- **[Risk] Emulated mobile Chromium misses physical-device or assistive-technology behavior.** → Retain manual phone/coarse-pointer, screen-reader orientation, and cross-browser checklist steps.

## Migration Plan

No data migration is required. Implement and verify shared primitives first, then sheet-specific controls and documented exceptions. Each sizing change is independently reversible by removing the utility from the affected owner; the audit identifies the corresponding verification to rerun. If a layout regression cannot be corrected without restructuring a section, leave that entry unresolved and return it to backlog refinement rather than broadening this change silently.

## Open Questions

None. The audit may discover individual controls that require classification, but the exception policy and escalation path are defined above.

## Implementation Findings

- The home character table exposed selection only through a pointer-clickable row. The implementation retained that convenience while adding one explicit, named native Open button per character so keyboard and assistive-technology users have a conforming equivalent action.
- Compact card-action triggers needed both a conforming button and enough reserved card space for the larger coarse-pointer owner. The existing desktop offset remains unchanged; the coarse-pointer presentation reserves the full target width without sizing the passive card.
- The shared coarse-pointer rule applies directly to explicit `.touch-target` owners and to the existing `.theme-input` form-control family, excluding native checkbox, radio, and file inputs. Checkbox and radio labels own their conforming hit areas; the hidden file input retains its conforming visible Import-button path.
- Chromium can transiently report the document body as the active element while native modal focus wraps. Browser coverage therefore permits that noninteractive boundary state but fails if focus reaches any interactive background element; modal background content remains inert and invoker restoration remains required.
- Automated review closes the measurable geometry, non-overlap, keyboard-order, and overlay regression work. Physical thumb comfort, screen-reader interpretation, inline-flow usability, and associated-label clarity remain explicit human checks before external playtesting rather than unsupported automated claims.
