# 2026-07-17 Keep sheet adapters feature-local while preserving a registry direction

**Status:** Approved  
**Author:** Codex with project owner direction  
**Date:** 2026-07-17

## Context & Problem Statement

The D&D 5e 2014 page currently combines Svelte route orchestration with system-specific projection and compatibility-patch logic. The project needs a maintainable boundary for the current sheet while preserving the long-term goal of adding TTRPG systems quickly without duplicating complete route implementations.

## Decision Drivers

- Keep the active single-system MVP easy to change and test.
- Avoid treating 5e-shaped presentation and patch rules as universal.
- Preserve a clear direction toward schema-registry-driven, dynamic Svelte rendering.
- Give future systems a reason to identify reusable seams instead of drifting independently.

## Considered Options

### Define a universal registry and adapter contract now

This would make the future direction concrete, but one implemented system does not provide enough evidence for stable projection, rendering, routing, or mutation signatures.

### Leave all logic in the route until another system exists

This avoids premature abstraction, but keeps the current route difficult to test and makes later comparison harder.

### Extract feature-local modules and defer the universal contract

This provides independently testable 5e boundaries now. A future system can compare against real modules and generalize only the seams that actually repeat.

## Decision Outcome

Keep 5e sheet metadata, projections, and compatibility patch translation in feature-local modules near the 5e route. Do not introduce a registry, adapter class, dynamic route, generated layout, or mandatory cross-system TypeScript signature as part of this extraction.

The desired long-term direction remains a system/schema registry working with dynamic Svelte rendering so new TTRPG systems can reuse loading, editing, annotation, persistence, and layout infrastructure with limited duplication. Future system proposals must evaluate the existing feature-local boundary, identify reusable seams, and document intentional deviations.

The registry location, registration mechanism, route shape, rendering model, and shared adapter API remain undecided until at least one additional system supplies concrete requirements.

### Consequences

- The current route becomes smaller and its calculations become directly testable.
- Feature-local APIs may later move or be reshaped when a second system exposes real commonality.
- Future system work has a durable architectural direction without inheriting guessed 5e-specific signatures.
- Some short-term duplication between the first two systems may be acceptable as evidence for the correct shared contract.

## Refinements & Follow-Ups

### 2026-07-17: `p1-045` implementation

The extraction produced three feature-local seams: static 5e presentation metadata, pure grouped sheet projections, and compatibility-patch translation for virtual editor paths. The route retains reactive character selection, page layout, validation, and save dispatch. Generic grid path, annotation, descriptor, and RFC 6902 application helpers remain in `src/lib/` rather than being duplicated in the feature modules.

These seams are directly testable and useful evidence for a future adapter contract, but their current aggregate projection result, virtual paths, and patch-normalization signature remain 5e page-composition details. They must not be promoted unchanged into a registry API without comparison against another system. Broader module ownership work remains under `p1-050`.
