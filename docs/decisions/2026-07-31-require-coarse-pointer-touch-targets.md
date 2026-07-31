# 2026-07-31 Require Explicit Coarse-Pointer Touch Targets

**Status:** Approved  
**Author:** Codex  
**Date:** 2026-07-31

## Context & Problem Statement

The character sheet is intended for phone use at active game tables, but compact controls currently mix 28–44 CSS-pixel dimensions. A previous blanket pseudo-element approach did not enlarge measurable control bounds, obscured which controls actually conformed, behaved inconsistently on native replaced controls, and risked overlapping adjacent targets.

## Decision Drivers

- Provide predictable thumb-sized controls on phone and coarse-pointer presentations.
- Preserve useful desktop density.
- Make conformance directly measurable and attributable to the control that owns activation.
- Avoid overlapping invisible target regions and avoid claiming unsupported automated coverage.
- Keep exceptions narrow enough that density cannot silently override accessibility.

## Considered Options

1. Keep existing compact controls and rely on browser defaults.
   - Preserves density, but leaves important phone actions materially below the product baseline.
2. Expand hit regions with blanket pseudo-elements.
   - Can preserve visual size, but creates difficult-to-measure and potentially overlapping regions and is unreliable for replaced controls.
3. Apply explicit minimum dimensions to touch-oriented owners only on coarse-pointer presentations.
   - Produces measurable targets and preserves desktop density, but some dense phone rows may become taller.
4. Enlarge every control at every viewport.
   - Is simple, but removes useful mouse/keyboard density without a demonstrated need.

## Decision Outcome

Use an explicit 44-by-44 CSS-pixel minimum for every non-exempt control intended for direct touch when the primary pointer is coarse. Apply minimum inline and block sizing to the actual interactive element. Do not size passive rows, cards, or collection containers unless the container itself owns the action.

Native checkboxes and radios retain their platform visual dimensions. Their explicitly associated labels or wrappers receive the padding and minimum dimensions that own the conforming hit area and transfer activation to the named input.

Allow only these exception categories:

1. inline links or controls whose literal dimensions would disrupt flowing prose;
2. small native controls whose associated label or wrapper supplies the conforming target;
3. redundant small controls with an equivalent conforming action on the same surface.

Every exception must be recorded in `docs/accessibility-control-audit.md`, keep an accessible name and visible focus, and have non-overlapping activation. Visual density alone is not an exception.

## Consequences

- Shared controls and route-owned actions can retain their current desktop dimensions.
- Dense phone rows may legitimately grow when they contain direct-touch actions.
- Structural layout regressions that cannot be resolved inside the existing surface stay unresolved and return to backlog refinement.
- Playwright geometry checks compare CSS-pixel bounding boxes directly with 44; device-pixel-ratio conversion is incorrect for this baseline.
- Inline-flow, associated-label, screen-reader, and physical-touch conclusions remain part of manual review.

## Refinements & Follow-Ups

### 2026-07-31 — Initial application

The `complete-mobile-accessibility-audit` OpenSpec change applies this policy to the current home-to-sheet flow, adds a bounded control-family audit, and protects representative geometry, keyboard order, and overlay behavior with Mobile Chrome and cross-browser checks.
