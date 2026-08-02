## Why

Large equipment and spell collections already make the 2014 character sheet difficult to scan, search, and edit on a phone, and the first external playtest must exercise saturated as well as sparse characters. The product needs a bounded, accessible collection interaction that preserves quick at-a-glance use without letting long lists dominate the sheet.

## What Changes

- Introduce a consistent dense-collection experience for Weapons, Armor & Shields, Other Gear, and Spells, including useful counts, explicit empty/no-match states, deterministic text search, and complete item reachability.
- Keep equipment browsing group-local and let spell search span the logical spell collection while retaining level, cantrip, and preparation context.
- Keep ability, save DC, and attack bonus in a compact full-width Spellcasting summary, then provide one discrete full-width Spell Slots group with editable `used / max` defaults for every level before the searchable spell collection.
- Show a compact phone preview of the first five authored entries plus one count-bearing complete-browse action, then provide a full-height focused browsing surface with persistent search, visible overflow cues, and one scroll owner.
- Use bounded collection presentation on larger screens so dense lists remain usable without unbounded sheet growth.
- Give each target row a complete submenu path to focused singular-item editing and annotation while retaining bulk collection editing as a collection-level option.
- Audit the rest of the 2014 sheet for consistent collection headings, semantic structure, action placement, navigation landmarks, and appropriate—but not necessarily identical—density behavior.
- Prove the reusable interaction with realistic, stateful component examples and obtain owner approval before propagating it into the character sheet.
- Recheck saturated-sheet behavior on supported desktop and phone-sized browsers, including evidence-based Firefox profiling only if repeatable jank remains.

### Non-Goals

- Manual reordering, automatic sorting, fuzzy search, speculative filters, remote indexing, or virtualization. Stable manual ordering remains the immediately sequenced Horizon A change `BL-075`.
- A universal list framework, a broad GridContent/GridContainer rearchitecture, or a cross-system rendering contract. `BL-074` owns the follow-up component-boundary review.
- Making every short collection visually identical or requiring search and focused browsing where collection size does not justify them.
- Persistent quick-action buttons, swipe/long-press-only commands, advanced list keyboard shortcuts, whole-sheet search, or a scene/pillar mode.
- Inventory schema rebasing or separate persisted weapon, armor, and gear collections.

## Capabilities

### New Capabilities

- `dense-collection-interaction`: Responsive discovery, scanning, focused browsing, row actions, editing, annotation, and accessibility behavior for saturated on-sheet collections.

### Modified Capabilities

None.

## Impact

- Affects the reusable collection presentation, action-menu, focused-dialog, and annotation boundaries used by the 2014 sheet.
- Affects 2014 equipment and spell projections while preserving canonical record identity, authored order, validated edits, annotations, and local persistence.
- Adds realistic component-catalog evidence, a dedicated saturated default character, and browser checks across desktop and phone-sized layouts.
- Adds no runtime dependency and does not change the persisted character schema.
