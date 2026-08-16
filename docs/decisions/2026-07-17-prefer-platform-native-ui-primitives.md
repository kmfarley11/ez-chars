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

| Pattern                   | Current location                                                | Current approach                                                               | Decision / follow-up                                                                                                                    |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Modal overlays            | `DialogShell.svelte` and its focused consumers                  | Native `<dialog>` with Svelte state for lazy rendering and focus restoration   | Retain; the shell may expose narrow cancellation interception when a focused editor must discard its draft before dismissal.            |
| Simple popovers           | `MenuButton.svelte`; composed by `GridContentActionMenu.svelte` | Native Popover API with scoped anchor positioning and a narrow WebKit fallback | Retain for simple menus while preserving the documented fallback behavior.                                                              |
| Collapsible sheet regions | `CollapsiblePanel.svelte`, 5e sheet route                       | Svelte state plus conditional mounting                                         | Retain; unmounting dense collapsed content is a deliberate mobile performance behavior that `<details>` would not necessarily preserve. |
| Responsive layout grids   | `ResponsiveGrid.svelte`                                         | Standard responsive CSS Grid classes                                           | Retain as the focused layout-only successor to the multi-purpose `GridContainer`; this is separate from the earlier auto-sizing audit.  |
| Tooltips                  | No dedicated tooltip component                                  | Native `title` attributes and label text where needed                          | Do not introduce a bespoke tooltip system without a specific accessibility and interaction need.                                        |

## Consequences

- New overlays should first evaluate `<dialog>`, Popover API, and CSS positioning before adding custom document listeners or measurement code.
- Platform support and graceful fallback behavior are part of the implementation review for newer primitives.
- This is guidance, not a mandate to replace working Svelte state or measurement code without a measured benefit.

## Refinements & Follow-Ups

### 2026-07-17 — Initial application

`MenuButton.svelte` is the first selected replacement candidate. The completed `p1-025` diagnostic informed the current approach; `p1-027` owns the future grid-model replacement, with profiling guidance in [docs/verification.md](../verification.md).

### 2026-07-30 — WebKit Escape Focus Fallback

Cross-browser Playwright verification found that WebKit correctly dismisses native popovers on Escape, but does not consistently restore invoker focus natively upon dismissal. To preserve keyboard usability without replacing the native popover behavior, `MenuButton.svelte` retains a narrowly scoped post-dismissal focus fallback using an animation frame listener, while native popover dismissal remains authoritative.

### 2026-08-13 — Focused dialog, panel, and layout boundaries

BL-074 centralized reusable modal lifecycle in `DialogShell.svelte`, including a narrow cancellation hook for editors that must discard a draft before the dialog closes. It also replaced the multi-purpose `GridContainer` with `CollapsiblePanel`, `PanelSurface`, and `ResponsiveGrid`. These are responsibility splits, not new native substitutes: the dialog remains platform-native, collapse remains intentionally stateful, and responsive layout remains CSS-owned.
