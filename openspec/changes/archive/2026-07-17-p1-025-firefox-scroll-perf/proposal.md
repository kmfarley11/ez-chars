## Why

Users experience noticeable scroll jank (particularly on Firefox) when scrolling through dense 5e sheet regions. The initial `GridContainerAuto` measurement hypothesis needed validation before its added complexity could be retained.

## What Changes

- Profile a representative headed Firefox scroll recording and classify the limiting work.
- Revert the cached-width and sub-pixel observer experiment when the recording does not identify grid measurement as a material cost.
- Record the outcome and defer repeatable performance checks and any grid-model replacement to their dedicated backlog items.

## Capabilities

### New Capabilities

None. This change closes a rejected performance hypothesis without shipping a user-visible behavior change.

### Modified Capabilities

None.

## Impact

- `src/lib/GridContainerAuto.svelte`: Trial optimization was reverted after profiling did not implicate it.
- `docs/backlog.md`: Records the profile result and routes future work to `p1-026` and `p1-027`.
