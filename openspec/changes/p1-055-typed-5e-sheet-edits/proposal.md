## Why

Structured 5e card edits currently cross into domain logic as arbitrary paths paired with `unknown` values, forcing repetitive guard code and making supported edits difficult to enumerate or evolve safely. With the route decomposition complete, now is the right time to establish an explicit edit boundary before persisted 5e data shapes change.

## What Changes

- Give every currently supported structured 5e sheet edit an explicit, validated intent.
- Make structured edits atomic: valid edits preserve unrelated character data and identities, while malformed edits are rejected without partial mutation.
- Route card-wide structured editing through the new boundary and retire the virtual compatibility-path dispatcher.
- Preserve direct primitive RFC 6902 editing, annotations, persistence, and all current user-visible sheet behavior.
- Keep the edit vocabulary feature-local to 5e rather than declaring a universal multi-system adapter contract.

## Capabilities

### New Capabilities

- `character-sheet-editing`: Defines atomic, validated structured character-sheet edits and preservation of unrelated character data.

### Modified Capabilities

None.

## Impact

- Affects the 5e sheet editing boundary, structured card save dispatch, projection metadata used to identify edit intent, and nearby contract tests.
- Replaces most or all responsibilities currently held by `src/routes/charsheets/5e/sheetPatches.ts`.
- Does not change the persisted character schema, storage envelope, dependencies, layout, or cross-system architecture.
