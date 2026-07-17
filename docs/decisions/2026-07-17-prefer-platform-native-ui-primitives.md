# 2026-07-17 Prefer Platform-Native UI Primitives

**Status:** Approved  
**Author:** Codex  
**Date:** 2026-07-17

## Context & Problem Statement

The local-first sheet needs menus, dialogs, and responsive layouts that remain accessible and responsive on phone-sized viewports. Custom JavaScript used to simulate browser overlay behavior adds event and layout work that the platform can often provide directly.

## Decision Drivers

- Preserve keyboard and light-dismiss behavior with less application code.
- Reduce overlay clipping and manual focus/click-away handling.
- Keep interactions usable on current desktop and mobile browsers.
- Avoid new UI dependencies and preserve existing visual behavior.

## Considered Options

1. Continue custom Svelte state and DOM event handling for all interactive UI.
   - Predictable browser support, but duplicates platform behavior and adds maintenance.
2. Prefer modern platform-native HTML and CSS where it preserves behavior.
   - Uses native `<dialog>`, Popover API, anchor positioning, and declarative CSS; requires feature-aware fallbacks for newer CSS.
3. Add a third-party positioning or component library.
   - Broad capability, but adds runtime and maintenance cost outside the MVP's needs.

## Decision Outcome

Prefer platform-native primitives when they preserve the required interaction, accessibility, and layout behavior. Use scoped component CSS for component-local anchors; use shared CSS only for an intentionally shared overlay system. Keep narrowly justified Svelte state or DOM measurement where native CSS would regress the current layout or behavior.

For newer features such as CSS Anchor Positioning, retain a visually usable non-anchor fallback and verify the supported browser set before making it a required interaction path. Native behavior supplements Svelte rather than replacing it: Svelte remains responsible for application data and any state the platform does not manage.

## UI Pattern Inventory

| Pattern                   | Current location                                                             | Current approach                                                             | Decision / follow-up                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Modal overlays            | `DialogButton.svelte`, `FieldAnnotationControl.svelte`, `GridContent.svelte` | Native `<dialog>` with Svelte state for lazy rendering and focus restoration | Retain; `<dialog>` already provides modal focus and Escape behavior.                                                                    |
| Dropdown menus            | `MenuButton.svelte`                                                          | `$state`, conditional rendering, and `focusout` click-away logic             | Replace with an auto popover and scoped anchor positioning in this change.                                                              |
| Collapsible sheet regions | `GridContainer.svelte`, 5e sheet route                                       | Svelte state plus conditional mounting                                       | Retain; unmounting dense collapsed content is a deliberate mobile performance behavior that `<details>` would not necessarily preserve. |
| Auto-sizing grids         | `GridContainerAuto.svelte`                                                   | `ResizeObserver`, DOM measurement, and animation-frame scheduling            | Retain; a prior CSS auto-fit attempt regressed the measured layout. Profile under `p1-025` before changing.                             |
| Tooltips                  | No dedicated tooltip component                                               | Native `title` attributes and label text where needed                        | Do not introduce a bespoke tooltip system without a specific accessibility and interaction need.                                        |

## Consequences

- New overlays should first evaluate `<dialog>`, Popover API, and CSS positioning before adding custom document listeners or measurement code.
- Platform support and graceful fallback behavior are part of the implementation review for newer primitives.
- This is guidance, not a mandate to replace working Svelte state or measurement code without a measured benefit.

## Refinements & Follow-Ups

### 2026-07-17 — Initial application

`MenuButton.svelte` is the first selected replacement candidate. `p1-025` retains ownership of scroll and measurement performance work.
