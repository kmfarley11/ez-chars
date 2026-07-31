## Why

The character sheet now has verified menu and dialog accessibility, but its remaining phone-sized controls have not been audited against the product's 44-by-44-pixel touch-target baseline or its intended keyboard reading order. Completing that audit before external playtesting will make table use more reliable while the interface is still inexpensive to adjust.

## What Changes

- Audit the interactive controls exposed by the character-sheet flow, including shared controls and sheet-specific actions, for touch-target size, spacing, accessible naming, visibility, and keyboard order.
- Require touch-oriented controls to provide explicit, non-overlapping 44-by-44 CSS-pixel targets on phone/coarse-pointer presentations.
- Record narrowly justified exceptions, the reason each exception is acceptable, and the equivalent accessible interaction path where a literal 44-by-44 target is inappropriate.
- Preserve logical DOM and keyboard order when responsive grids change their visual arrangement, without positive `tabindex` values or duplicate mobile-only controls.
- Preserve and verify the completed modal focus confinement/restoration, multi-step dialog orientation, and cross-browser popover Escape-focus behavior as part of the durable sheet interaction contract.
- Add repeatable mobile browser checks for representative target sizes, keyboard traversal, and critical sheet interactions, while retaining focused manual review for behavior that automation cannot establish reliably.
- Reconcile the accessibility checklist, verification guidance, durable touch-target decision, and `p1-020` backlog state after the audit is complete.

## Non-Goals

- Redesigning the sheet, changing its themes, or restructuring its major sections.
- Claiming comprehensive WCAG conformance or replacing screen-reader and physical-device review with automated checks.
- Enlarging every desktop control or using blanket pseudo-elements that create overlapping hit regions.
- Introducing a new component framework, accessibility dependency, or generalized cross-system UI abstraction.

## Capabilities

### New Capabilities

- `accessible-sheet-interactions`: Defines phone-sized touch targets, documented exceptions, logical keyboard order, and completion evidence for character-sheet interactions.

### Modified Capabilities

- `browser-interaction-testing`: Extends the browser-testing contract with a mobile Chromium project and representative automated accessibility checks for target sizing and keyboard interaction.

## Impact

This change affects shared UI controls, sheet-specific interactive surfaces, responsive styling, component examples, browser tests, and maintainer accessibility documentation. It does not change character data, persistence, public data APIs, or production dependencies.
