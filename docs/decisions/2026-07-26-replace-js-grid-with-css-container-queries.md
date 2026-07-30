# Replace JS Grid Auto-measurement with CSS Container Queries

**Status:** Approved
**Author:** AI Agent
**Date:** 2026-07-26

## Context & Problem Statement

The `GridContainerAuto.svelte` component currently uses JavaScript `ResizeObserver` to monitor card widths and dynamically update layout columns. While functional, this JS-driven approach incurs rendering overhead and relies on JavaScript for layout logic that fundamentally belongs in the presentation layer.

As modern browsers now have excellent native support for CSS Container Queries (`@container`), we have the opportunity to eliminate this JavaScript overhead entirely, allowing the browser's optimized rendering engine to handle layout adjustments natively based on available width.

## Decision Drivers

- Performance: Reduce JS execution time and layout recalculations.
- Simplicity: Move layout responsibilities back to CSS.
- Maintainability: Remove complex Svelte ResizeObserver boilerplate.

## Considered Options

1. **Keep `GridContainerAuto.svelte`**: Maintains current behavior but keeps the performance cost of `ResizeObserver`.
2. **Native CSS `@container` queries**: Replaces JS listeners with native browser layout capabilities.

## Decision Outcome

We will adopt native CSS `@container` queries.

We will declare `container-type: inline-size` on parent structural elements and use `@container` media queries on child grid configurations to adjust column structures (e.g. `1fr` vs `1fr 1fr`).

`GridContainerAuto.svelte` will be deleted entirely.

### Consequences

- **Positive:** JS-driven layout recalculations are completely eliminated, saving CPU cycles during window resizing and initial renders.
- **Positive:** The codebase becomes simpler and more standard.
- **Negative:** Older browsers that do not support CSS Container Queries will fall back to default layouts, but this is acceptable given our modern target baseline.

## Refinements & Follow-Ups

- Remove all instances of `GridContainerAuto.svelte`.
- Refactor the character sheet sections to use `@container`.
