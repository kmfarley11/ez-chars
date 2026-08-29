## Why

Compact collection previews currently expose incidental record order, so players cannot reliably keep the equipment, spells, or supporting information they care about most at a glance. The first external playtest needs one familiar way to express priority while preserving the system-native meaning and storage of radically different character records.

## What Changes

- Add an opt-in Pin/Unpin experience for the 2014 Weapons, Armor & Shields, Other Gear, Spells, Features, Traits, Languages, and Tools collections.
- Present pinned entries before a predictable alphabetical baseline, including one global pinned-spell tier across spell levels while retaining each spell's level context.
- Keep pinning available for short and dense collections without forcing search onto short lists; equipment and spell rows add immediate Pin/Unpin to their established action menus while Manage Pins remains the batch workflow, and compact supporting rows retain their quiet presentation with collection-level management only.
- Preserve active search context during dense pin management and commit a saved set of pin changes atomically while cancellation leaves the character unchanged.
- Persist pin state with the owning character so priority survives reload and JSON backup/restore without requiring every system to use one shared record shape or storage location.
- **BREAKING (pre-playtest v0):** Give 2014 language and tool records durable identities and extend the current persisted character shape for priority state. Previously saved `dnd5e-2014.schema.v0` data is not promised an automatic migration and may be rejected under the existing pre-playtest compatibility policy.
- Keep Runtime Actions outside this rollout; their source and action-economy navigation remain independently owned.

## Capabilities

### New Capabilities

- `collection-priority-management`: Defines the reusable player-facing Pin/Unpin behavior, priority ordering, management workflow, persistence, and system-owned adapter boundary.

### Modified Capabilities

- `dense-collection-interaction`: Replaces incidental authored-order preview/search expectations for eligible collections with priority-first alphabetical presentation while preserving existing density thresholds and domain-specific row grammars.
- `character-data-evolution`: Extends the strict current 2014 character representation with stable language/tool identities and validated priority state that round-trips through persistence and export.

## Impact

- Affects the D&D 5e 2014 character schema, validated mutation boundaries, local persistence, JSON backup/restore, and saturated fixtures.
- Affects collection projection and presentation for inventory, spells, Features, Traits, Languages, and Tools while leaving Runtime Actions behavior unchanged.
- Adds a reusable interaction boundary whose presentation semantics are shared but whose identity, validation, and persistence remain owned by each system or domain adapter.
- Requires a lightweight ADR for that generic-interaction/system-owned-data boundary and a human-approved isolated Supporting Collection proof before broader propagation.
- Adds no third-party dependencies or network behavior.
