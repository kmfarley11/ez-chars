## Why

The saturated 2014 sheet fixture demonstrates that Runtime Actions can dominate the primary play surface, while supporting collections (like Features, Traits, Languages) can create avoidable height and alignment pressure. We need to scale these collections so information remains scannable without flattening specialized action behavior or forcing unbounded scrolling on every collection.

## What Changes

- Introduce search for Runtime Actions indexing the current snapshot and source context (name, target, notes, timing, category, source label/category, source context).
- Implement a 5-item cap for information-rich Runtime Actions and a 7-item cap for compact supporting collections (Features, Traits, Languages, Tools).
- Once a collection exceeds its applicable cap, use a hybrid approach (inline scrollable container on desktop, focused dialog on phone) to avoid modal fatigue, validated by macOS/Firefox playtesting.
- Preserve complete touch, keyboard, pointer, and assistive access to every record and command.
- Maintain existing mutation and orchestration boundaries without forcing heterogeneous collections into a generic data wrapper.
- Explicitly defer ordering/favorites mechanisms to `BL-075`.

## Non-Goals

- Schema or mutation workflow changes for Runtime Actions or Supporting Collections.
- Custom ordering, sorting, or favorites mechanisms.
- Whole-sheet navigation restructuring (e.g., scene/pillar modes or persistent outlines).
- Creating a universal data wrapper/abstraction for heterogeneous collections.

## Capabilities

### Modified Capabilities

- `dense-collection-interaction`: Update to establish collection-specific density bounds, search thresholds, and the desktop vs phone affordances for large collections.

## Impact

- **UI Components:** The presentation layer for Runtime Actions, Features, Traits, Languages, and Tools.
- **Interactions:** Search states are introduced when Runtime Actions exceed 5 items or supporting collections exceed 7 items. Desktop presentation uses bounded inline scrolling, while phone users retain the focused dialog preview pattern.
- **Dependencies:** None.
