## Context

The `ez-chars` project aims to maintain a lightweight, local-first web client with clean architecture. Some UI controls (such as menus, dialogs, and layout elements) currently use custom JavaScript logic to simulate standard browser overlay and overlay-interaction behaviors (such as focus containment, click-away dismissals, and absolute overlays). By replacing these with modern platform-native primitives, we can simplify our codebase, reduce rendering and event-binding cycles, and align with baseline standards.

## Repository UI Pattern Scan

A quick review of the UI interaction components in the codebase reveals the following patterns:

1. **Overlay Dialogs (`DialogButton.svelte`, `FieldAnnotationControl.svelte`, `GridContent.svelte`)**:
   - _Current State_: Already use native HTML `<dialog>` elements with backdrop clicking dismiss helpers.
   - _Status_: Aligned with platform-native guidelines. No modifications needed.
2. **Dropdown Menus (`MenuButton.svelte`)**:
   - _Current State_: Uses Svelte state variables and custom JavaScript focus loss and click-away listeners.
   - _Status_: **Primary candidate for refactoring** to use HTML Popover API and scoped CSS Anchor Positioning.
3. **Collapsible Sections (`GridContainer.svelte`, `5e/+page.svelte`)**:
   - _Current State_: Toggle state using Svelte variables and Svelte conditional `{#if !isCollapsed}` rendering.
   - _Tradeoff_: While native `<details>` and `<summary>` could replace these, Svelte conditional rendering keeps the DOM clean by completely unmounting hidden nodes, which is a major performance benefit on mobile screens with collapsed sections. They will remain Svelte-conditional.
4. **Auto-measuring grid (`GridContainerAuto.svelte`)**:
   - _Current State_: Uses JavaScript `ResizeObserver` to recalculate columns.
   - _Tradeoff_: A CSS auto-fit replacement was tried but degraded visual layout. The resize observer remains a performance profiling concern that is scoped under `p1-025` for scroll profiling rather than platform syntax changes.

## Goals / Non-Goals

**Goals:**

- Formulate and document guidance for developers/agents to prioritize native HTML/CSS elements (e.g., `<dialog>`, HTML popover, CSS `:has()`, `:focus-within`, CSS scroll-snap) over custom JS wrappers.
- Audit the codebase to build an inventory of custom UI wrappers and identify native baseline replacements.
- Refactor `MenuButton.svelte` to replace its custom JavaScript-based dropdown click-away and focus-out logic with native HTML/CSS-native capabilities, maintaining 100% visual parity and behavioral backward compatibility.
- Ensure the simplified components are clean, Svelte-idiomatic, and pass all existing automated tests.

**Non-Goals:**

- Completely rewriting major structural layout grids or performance-measurement structures (which are scoped under `p1-025`).
- Moving away from Svelte's reactive model; state bindings for properties (like open/closed values) should remain integrated with Svelte 5 runes.
- Changing the visual style, themes, or colors of the sheet.

## Decisions

### Decision 1: Target candidate for native overlay simplification

We will refactor `MenuButton.svelte` to simplify its toggle and dismiss mechanics.

- **Option A (HTML Popover API with CSS Anchor Positioning) [Chosen]**: Use `popover="auto"` on the menu list and `popovertarget` on the trigger button, with CSS Anchor Positioning (properly scoped within the component) to position the dropdown relative to the button.
  - _Pros_: Top-layer rendering prevents clipping or overflow issues in parent layout structures; browser natively handles automatic light-dismiss (clicking outside or pressing the ESC key); simplifies component code.
  - _Cons_: Relies on newer baseline standard CSS Anchor Positioning, but this can be scoped within the Svelte component cleanly to avoid wider stylesheet pollution.
- **Option B (Native HTML `<details>` and `<summary>` elements)**: Use a standard details dropdown.
  - _Pros_: Completely native HTML/CSS positioning and toggling, 100% browser support, zero layout shift.
  - _Cons_: Requires custom JS click-away code to auto-close when clicking elsewhere, and styling `<summary>` markers requires CSS resets.
- **Option C (Refined Svelte 5 idiomatic events with native activeElement/blur checks)**: Keep the absolute-position layout inside the relative wrapper, but replace legacy custom focus-loss logic with a clean Svelte-idiomatic backdrop overlay or clean `onfocusout` check using modern CSS `:focus-within` transitions.
  - _Pros_: 100% control over layout and placement; doesn't break existing absolute position behavior; zero positioning regressions.
  - _Cons_: Still requires a tiny amount of Svelte state, but event handling is simplified.

### Decision 2: Guidance documentation placement

We want to document this best practice durable decision cleanly without cluttering the repository docs directory with ad-hoc files.

- **Decision**: Draft a lightweight Architecture Decision Record (ADR) under `docs/decisions/` capturing the preference for platform-native primitives over custom JS component overlay state. Link to this decision in the main `AGENTS.md` rules and update the main spec requirements (`openspec/specs/native-ui-interaction/spec.md`) which will act as the durable requirements source.

## Risks / Trade-offs

- **[Risk] Positioning regressions in dropdown menus** → _Mitigation_: Use CSS Anchor Positioning scoped directly to the component, verify it positions correctly, and ensure fallback layout styles are clean if any anchor binding issues occur.
- **[Risk] Focus trap / Accessibility loss** → _Mitigation_: Native popover elements handle light-dismiss and ESC-to-close behavior natively, but ensure correct ARIA roles (e.g. `role="menu"` on the list, `aria-expanded` and `aria-haspopup` on the button trigger) are preserved or enhanced.
