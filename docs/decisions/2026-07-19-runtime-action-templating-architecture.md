# 2026-07-19 Deriving System Actions from Character Source Records

## Metadata

- Status: Approved
- Author: Antigravity, Codex, User
- Date: 2026-07-19

## Context & Problem Statement

As part of `p1-005`, we want to allow player actions in the sheet's runtime list to optionally link to and seed from inventory items, active spells, or class features. However, our core data models (`itemSchema`, `featureSchema`, etc.) in `core.ts` are strictly cross-system and generic, while `runtimeActionSchema` is system-specific (containing concepts like 5e's `bonusAction`).

The architectural problem is: **How do we derive system-specific mechanical actions from generic, cross-system items without bloating the core schemas or requiring a massive pre-authored rules database?**

## Decision Drivers

1. **Core Abstraction Purity:** We must prevent system-specific mechanics from polluting `core.ts`.
2. **Text-First, Pen-and-Paper Feel:** Avoid forcing users into complex data entry.
3. **Multiple Actions per Source:** A single item (e.g., a weapon with 1H and 2H modes) can grant multiple distinct actions.
4. **Future Scalability:** The pattern must leave the door open for future API-driven rule compendiums.

## Considered Options

### 1. Full Mechanical Modeling

Expand core schemas into discriminated unions (e.g., `WeaponItem`, `SpellItem`) with rigid mechanical properties (`damageDice`, `range`, `saveDC`). The runtime list strictly computes its actions from these raw variables.

- _Pros:_ Structured, paves the way for advanced VTT integration and dice rollers.
- _Cons:_ Massive schema migration. Violates the app's text-first ethos. Requires parsing string inputs into complex math models.

### 2. System Data Payloads (Data-Driven)

Add a `systemData: z.unknown()` property to core item schemas. The 5e system would type this as an array of `runtimeAction` templates that inherently travel with the item.

- _Pros:_ Keeps the core model generic. Items inherently know how to represent themselves mechanically in specific systems.
- _Cons:_ Adds unnecessary modeling and migration cost for the present feature. It pushes us toward maintaining a heavy, pre-authored database of items rather than relying on lightweight text entry.

### 3. The Logic Transformer (Code-Driven)

Leave core items as flat, generic text and tags. Instead of embedding templates on the items, use a 5e-specific transformer module (logic layer) that scans equipped items and dynamically infers "Suggested Actions" based on the item's name and notes. Users can accept a suggestion, which instantiates a `runtimeAction` linked via a source reference.

- _Pros:_ Avoids schema bloat. Aligns well with a text-first MVP. Leaves the door open to replace the local transformer with an API fetch in the future.
- _Cons:_ The local MVP transformer is a basic 1:1 text sync and relies on the user to manually adjust the resulting action's mechanics.

## Decision Outcome

**Chosen Option: Option 3 (The Logic Transformer)**

We will implement the Logic Transformer approach. The `runtimeActionSchema` will be updated to include an atomic source reference, but the core items will remain untouched.

**Rationale:**
This approach balances the immediate need for a lightweight, text-first user experience with the long-term vision of multi-system architecture. It avoids building a complex, pre-authored database of items for the MVP, while leaving a clean architectural boundary where an external API can provide rich data later.

## Data Architecture Decisions

**1. Snapshot vs. Bubbling (Chosen: Snapshot + Explicit Resync)**
Instead of complex "live bubbling" where unedited fields stay synced to the source item (which requires override tracking and convoluted reducers), accepted actions will be **editable snapshots**. The action's source link supports navigation to the source item and provides an explicit "Resync from source" UI action to overwrite the snapshot.

**2. Local Source Identity vs. External Identity**
A runtime action links exclusively to the _character-owned_ item/spell/feature. A future external rules provider (e.g., Open5e API) is a separate identity concern used for enrichment on the item itself. Actions must never link directly to external provider records, preserving offline ownership.

**3. Atomic Source Reference Shape**
To prevent half-linked states, the linkage will use a single atomic object on `runtimeActionSchema` rather than independent `sourceId` and `sourceType` fields.

```typescript
source?: {
  kind: 'item' | 'spell' | 'feature';
  id: string;
}
```

_(Note: As part of implementation, we must ensure `spellId` in `spellRefSchema` becomes required or generates a stable identity to support this linkage.)_

**4. Source Deletion Fallback**
Because actions are editable snapshots, deleting the linked item/spell/feature should preserve the action and convert it to a custom/unlinked action (by removing the source reference) rather than deleting the action or making it invalid.

## Refinements & Follow-Ups

**2026-07-19: Narrowing the Async Seam**
To ensure the Logic Transformer does not become tangled with the UI, we will introduce a dedicated asynchronous boundary.

- **Narrow Naming:** To explicitly enforce YAGNI and prevent this boundary from inflating into a speculative universal platform contract, the module will be narrowly named (e.g., `src/lib/compendium/dnd5e2014/suggestRuntimeActions.ts`) and expose a specific function like `async suggest5eRuntimeActions(sources)`.
- **MVP Implementation:** The function will resolve a local, synchronous 1:1 text-sync transformer.
- **Future API Readiness:** The async call shape is intentional because network lookup is a near-term roadmap item. While the async boundary preserves the calling convention and insulates the UI from parsing logic, the UI will eventually need to handle new network-specific UX states (loading, offline, ambiguous matches).
- **Scope Restriction:** This is a 5e-specific application boundary, not a multi-system registry. Future operations (like fetching spell details) are explicitly not part of this contract.
