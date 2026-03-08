# Grid Cleanup Backlog

This tracks the incremental cleanup passes for `src/lib/*Grid*`.

## Completed (Batch 1)

- [x] Consolidate duplicate reference href logic into shared helper.
- [x] Remove unused exports/helpers from `characterGridHelpers.ts`.
- [x] Simplify stale collapse branching and TODO in `GridContainer.svelte`.

## Completed (Batch 2)

- [x] Move reference href helper into `characterGridHelpers.ts` (remove temp helper file).
- [x] De-duplicate recursive tree update logic in `characterGridHelpers.ts`.
- [x] Throttle/coalesce `GridContainerAuto.svelte` recalculation triggers.

## Completed (Batch 3)

- [x] Split `GridContent.svelte` pure logic into `gridContentHelpers.ts`.
- [x] Add a short data-path contract comment (`path` vs `bindPath` vs `annotationBindPath`).

## Remaining

- None.
