## Why

The PRD v0 successfully established the stack and first 2014 5e sheet, but the repository does not yet define the bounded product milestone between that baseline and the author's much broader vision. A PRD v1 and playtest roadmap are needed now so near-term work can support three concrete systems and useful rules references without simultaneously becoming a character builder, compendium, VTT, or cloud product.

## What Changes

- Define a target-state PRD v1 for the first external playtest, clearly separated from current implemented behavior.
- Establish D&D 5e 2014, D&D 5e 2024, and Shadowdark as the required playtest systems, with explicit player-character and sparse sidekick/NPC scenarios.
- Define a rights-classified, document-oriented reference experience that prefers self-hosted PDFs and useful indexes when verified licenses allow them, without assuming that a free price grants those rights.
- Require an early audit of the current shared character schema so system-native persisted data can remain independent while computed views serve genuinely shared application needs.
- Evaluate available editable character-sheet PDFs for all three systems before durable schema decisions, treating PDF import/export as interoperability rather than the canonical data store.
- Define the milestone gates between PRD approval, playtest readiness, first durable schema versions, external playtesting, and a product v1.0 release.
- Reframe active goals and the backlog around separately approved architectural and implementation epics rather than one broad multi-system effort.
- Record the author's longer-term product desires and non-goals without moving future-horizon work into active scope.
- Explicitly retain the pre-release decision that experimental v0 character data has no general migration guarantee.

## Capabilities

### New Capabilities

- `product-scope-planning`: The repository's durable contract for distinguishing author vision, target product requirements, active implementation scope, milestone gates, and separately executable roadmap epics.

### Modified Capabilities

- None.

## Impact

- **Documentation:** Adds PRD v1 and author-intent artifacts; updates active goals, vision indexes, architecture decisions, and backlog prioritization.
- **Planning:** Produces separately refinable work for the core-schema boundary, multi-system foundations, 2024 5e, Shadowdark, rules-resource navigation, editable-PDF interoperability, and cross-system playtest hardening.
- **Product state:** No application behavior changes in this change; the product remains pre-release and 2014-only until later approved changes are implemented.
- **Data compatibility:** No schema changes in this change; the v0-to-v1 decision remains tied to the actual first external playtest boundary.
- **Dependencies:** No package or runtime dependency changes.
