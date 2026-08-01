# System Design Notes

> [!NOTE]
> **Advisory Context:** This document preserves early cross-system design observations. 
> 
> The architectural direction for multi-system support has evolved. The current strategic direction for the core boundary, computed views, and schema auditing is now governed by [author-desires.md](author-desires.md).

This file preserves earlier broad design notes and cross-system observations. It is a long-term planning document, not the active MVP backlog.

## Candidate Long-Term Systems

- D&D 5e 2014
- D&D 5e 2024
- Level Up: Advanced 5e
- Shadowdark
- Cairn v1
- Cairn v2
- other future candidates such as ATLA, Numenera, Daggerheart, Dragonbane

## Long-Term Schema And Rendering Direction

The desired long-term architecture uses an authoritative system catalog or dispatch boundary so additional TTRPG systems can reuse document lifecycle, loading, backup, character-list summaries, and navigation without forcing their gameplay data through one schema or layout.

This is an architectural intent, not a settled adapter API. The catalog location, route shape, rendering mechanism, shared TypeScript signatures, and boundary between common and system-specific layout remain open until the 2024 implementation supplies concrete requirements. As new schemas and sheet pages are introduced, their designs should identify reusable lifecycle and computed-view seams and document intentional deviations so independently implemented systems do not drift by default.

The current D&D 5e 2014 implementation provides one useful but incomplete boundary example. Its shared root currently contains identity, features, inventory, and notes in addition to lifecycle data, while the system payload owns other 5e concepts. The [sheet-architecture decision](../decisions/2026-07-17-sheet-architecture-adapter-vs-registry.md) and the `BL-067` design audit treat those root gameplay fields as 5e-shaped evidence rather than a permanent cross-system contract. Future systems should own their complete gameplay shape and may opt into reusable annotation, reference, item, feature, or note primitives where they fit naturally.

Character data versions are per-character layout discriminators and are separate from rules/source versions and storage/export envelope versions. A future registry should eventually dispatch system-specific hydration and serialization, but the current pre-playtest `dnd5e-2014.schema.v0` boundary does not establish the final registry interface.

Shared list, search, navigation, backup, reference, and future integration needs should prefer computed system views. A common presentation projection is not a requirement that every system persist the same underlying fields. The 2014 and 2024 implementations may demonstrate useful 5e-family helpers, but Shadowdark is the required check against mistaking family similarity for a universal TTRPG contract.

## Cross-System Observations

### Recurring Needs, Not Necessarily Shared Fields

- identify a character for local ownership, listing, and navigation
- record system-native identity, names, and treasure or currency where applicable
- store gear and inventory
- represent stats and combat state
- allow player-authored notes and annotations

### Inventory And Gear

- each system has different treasure names and categories
- some systems divide items by kind, such as weapon, armor, and misc
- some systems divide items by equip slot or body location
- each system records different item properties such as weight, value, and notes

### Stats And Rolls

- all investigated systems so far have HP, STR, and DEX or close equivalents
- some systems prefer roll-under or low-target representations instead of raw modifiers
- some systems use skills and proficiencies heavily, while others barely use them

### Player Notes And Annotations

- all systems benefit from flexible user-authored notes
- some systems need notes in generic freeform sections
- some systems benefit from notes attached directly to specific fields or containers

## Earlier Design Conclusions

- build shared data points without forcing all systems into identical shapes
- expect system-specific regrouping and annotations even when the raw fields overlap
- prefer simple, flexible field entry first and add guided UX later
- preserve room for player-authored annotation everywhere it materially helps

These conclusions remain useful experience goals. They do not require the persisted core to contain one generic identity, inventory, feature, or notes model. See the [sheet-architecture decision](../decisions/2026-07-17-sheet-architecture-adapter-vs-registry.md) for the current staged boundary.
