## Why

Players should be able to answer “What reactions do I have?” or “Which prepared second-level spells do I know?” without remembering search terminology or scanning unrelated records. The completed read-first editing baseline makes this the right time to prove category-aware retrieval and Runtime Action pinning before additional systems multiply the review surface.

## Non-Goals

- No universal RPG taxonomy, compendium, rules-derived availability, or automatic reclassification.
- No category/source/note filters, interactive row badges, arbitrary sorting controls, drag ordering, batch Pin manager, or saved filter preferences.
- No new edit workflow, changes to source ownership, or automatic propagation of pins between sources and actions.
- No broad responsive-layout redesign or propagation of new filters to inventory/supporting collections in this effort.

## What Changes

- Offer multi-select Runtime Action timings and Spell levels, plus a Prepared-only toggle. Choices within a category combine as alternatives; different categories and one text query narrow together, including for short populated lists. Deselecting all options removes that category's restriction.
- Keep timing controls available for populated Runtime Action collections regardless of density. Provide independent resets, accurate counts, and a combined Clear all recovery in no-match states without a permanent reset-all control. Phone previews and focused browsing use the same selected filters.
- Present action timing, category, and source-kind metadata consistently as passive badges. Deliberately approved filters share their vocabulary without making every badge interactive.
- Add immediate, persisted Runtime Action Pin/Unpin. Matching pins form one alphabetical tier; remaining actions display by timing then name. Filtering never overrides exclusion merely because an item is pinned.
- Preserve global alphabetical spell pins and level/name ordering for remaining spells. Prepared narrows results rather than adding another sort key.
- Replace authored-order Runtime Action display with deterministic timing/name display without rewriting the stored action sequence. Editing, resync, source deletion, action deletion, and JSON round trips retain the established identity and ownership guarantees.
- Keep the interaction generic enough for system-supplied choices while proving only 2014 timings, spell levels, and recorded preparation state. Use a production-backed human checkpoint before default rollout.

## Capabilities

### New Capabilities

None; extend the existing collection behavior rather than create a parallel retrieval capability.

### Modified Capabilities

- `dense-collection-interaction`: Composable quickfilters, shared preview/browse state, filter-aware counts and recovery, passive action metadata, and the revised Runtime Action display order.
- `collection-priority-management`: Runtime Action eligibility, global matching-pin precedence, deterministic domain-specific remainder ordering, identity lifecycle, and reconciliation of superseded batch/menu guidance with the already-approved first-class Pin/Unpin baseline.
- `runtime-action-inference`: Clarify that source deletion preserves the stored action sequence and action-owned priority while the visible list follows collection presentation order.

## Impact

Shared collection controls and phone browsing, the 2014 Runtime Action and Spell presentations, system-owned priority validation/persistence, and source-lifecycle verification are affected. The optional Runtime Action pin state extends the current unstable pre-playtest character format without requiring pins in existing documents; no dependency, backend, new compatibility epoch, or promised legacy migration is introduced. Existing source commands, independent editing, accessible controls, and other collections' behavior remain intact.
