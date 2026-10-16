## Why

The component catalog mixes current production behavior with older standalone proofs, making it difficult to identify reliable examples before a second system reuses them. BL-086 will make the shared design language discoverable and keep canonical sheet examples faithful to the application without erasing system-specific behavior.

## Non-Goals

- Redesigning approved player interactions or changing saved characters, schemas, persistence policy, or canonical fixture contents.
- Implementing another game system, universal sheet rendering, a dynamic field registry, or a speculative template framework.
- Making every organism generic, adding a story for every component or interaction, or deleting useful coverage to reduce file count.
- Adopting dependencies, consolidating all icon implementations, or renaming unrelated repository files.

## What Changes

- Distinguish generic Design System examples, system-owned sheet examples, and explicitly deferred Concepts in the catalog.
- Organize shared UI by compositional responsibility and keep system-owned organisms, full sheets, and application-owned controls distinct, with consistent kebab-case naming for new or moved source files and folders where framework conventions permit. Document intentionally retained locations rather than forcing every component into the design system.
- Demonstrate reusable sheet-arrangement use cases with compact, representative organism sandboxes rather than duplicating whole system models in generic examples.
- Provide recognizable Bryltin, Zindra, and saturated-character examples using the same production sheet composition and editing behavior as the application, with isolated, resettable fixture state.
- Remove duplicate proof-specific binding/save logic and retire superseded prototypes only after mapping their unique interaction, state, and layout evidence to retained examples or automated tests. Preserve the intentionally deferred Collection Organizer concept.
- Preserve current application behavior, accessible interactions, sparse/dense coverage, and saved-data safety while establishing a trustworthy foundation for multi-system work.
- Provide concise human and agent navigation to component implementations, stories, tests, and canonical examples, plus a shared maintainer guide for naming, reuse, contribution, and ongoing maintenance. Make example provenance, limitations, and review guidance visibly available in the catalog. Establish only the conventions needed for this structure, not a comprehensive new standards program.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `component-sandbox`: Require clear example provenance, representative shared use-case coverage, isolated canonical sheet examples, discoverable maintainer guidance, and preservation of unique evidence when superseding prototypes.

## Impact

This affects the component catalog, shared UI organization, 2014 sheet composition and its host boundary, fixture-backed examples, relevant tests, and contributor guidance. The existing composition decision will be amended to recognize concrete system-owned Pages and shared-versus-domain ownership. Application routing and persistence remain production responsibilities; catalog examples do not replace end-to-end verification.

BL-086 remains a P1 foundation improvement intentionally sequenced before broad BL-070 implementation. It needs a full coordinated change and an ADR amendment, with a small human-reviewed composition proof before wider migration. No dependency adoption or intentional player-facing behavior change is proposed.
