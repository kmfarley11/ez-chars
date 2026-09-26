## Why

Physical-phone rehearsal shows that the current mixture of inline-morphing fields, separate Edit and Notes dialogs, row menus, and card-wide bulk forms is functional but difficult to predict and cumbersome during play. Establishing a read-first interaction language now prevents that fragmentation from spreading into category navigation and additional game-system sheets.

## What Changes

- Establish a three-tier character-sheet interaction model: stable inline controls for frequently changing runtime state, read-first focused detail and editing for rich fields or records, and scan-first browsing plus explicit management for collections.
- Give an individual rich field or record one focused detail path that presents its authored information, provenance, annotations, and references together before offering an explicit Edit action.
- Remove ordinary record-level Edit and Notes/References overflow shortcuts once the focused detail path owns those actions; preserve only genuinely domain-specific commands such as source navigation and resynchronization.
- Treat one focused Edit submission as one intentional atomic save: authored and annotation changes validate and commit together, or the target remains unchanged.
- Keep collection browsing, priority, and record lifecycle distinct. Individual records open focused detail/editing, pinnable rows expose Pin/Unpin as the first-class priority action beside their detail target, collection-level Add creates one record, and eligible removal stays with that record rather than a generic batch organizer. The rollout omits the redundant batch Pin manager while retaining its reusable implementation for evidence-triggered reconsideration.
- Retire collection-wide annotation editing and overview surfaces; use quiet note indicators beside each annotated record's own text plus individual focused detail to discover and review annotations in context, without an aggregate collection-note badge.
- Preserve the user's filtered collection context and a predictable Back/focus-return path while moving between collection browse, record detail, and record editing.
- Classify direct runtime controls explicitly instead of allowing unclassified reference/profile fields to inherit noisy persistent editing controls.
- Prove the interaction model against five representative fixtures—including the saturated Spells surface—and obtain owner approval before propagating it across the 2014 sheet.

## Non-Goals

- Shipping a global or general section-wide Edit mode or making the entire sheet look and behave like a form; bounded comparison proofs remain in scope so the owner can validate this direction before rollout.
- Retaining legacy rich-record bulk editing or collection-wide bulk annotation editing as parallel editing models.
- Adopting a generic Organize Collection or reorder workflow across collections; retain the successful organizer experiment only as a clearly deferred Storybook concept until evidence shows that pinning plus singular Add/Remove is insufficient.
- Forcing frequently changed runtime values into modal detail workflows or removing efficient combat-time controls.
- Creating a universal cross-system record schema, generic domain reducer, monolithic form engine, or one item-shaped detail payload.
- Changing annotation storage, character schemas, stable identities, source/resync semantics, local-first persistence, or reference rights behavior solely for this redesign.
- Folding collection quickfilters, mobile PDF rendering, user-local document connection, or additional game systems into this change.
- Replacing the approved target-wide atomic focused draft with independently committed piecewise leaf editors; `BL-085` will compare that direction against a compact target-wide editor before any shared-workflow propagation.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `character-sheet-editing`: Define the three-tier read-first editing model, unified focused detail/edit behavior, explicit runtime classification, and atomic authored-plus-annotation saves.
- `dense-collection-interaction`: Define predictable transitions among focused collection browsing, individual record detail/editing, record lifecycle actions, and specialized priority commands while preserving browse context.

## Impact

- Affects character-sheet field affordances, focused detail/edit presentations, annotation presentation and drafting, dense and supporting collection rows, collection lifecycle actions, responsive dialog/workflow composition, and domain-owned edit adapters.
- Changes pre-playtest interaction behavior but does not change persisted character shapes, identifiers, import/export contracts, source locators, or external APIs.
- Adds no dependency and retains the current schema-validation and local-first persistence boundaries.
