# Shared UI

System-neutral components live in [atoms](atoms/), [molecules](molecules/) and [organisms](organisms/). Stories are colocated as `*.stories.ts`; tests use nearby `__tests__/` directories. Find these in Storybook under **Design System**.

Looking for interaction tiers? **Molecules / Edit-first (Tier 1 Field)** covers inline editing;
**Organisms / Read-first Detail (Tier 2 Field)** covers focused detail; **Organisms / Collections (Tier 3 Field)** covers generic collection rendering, search, pinning and row edits.
These are interaction patterns, not additional composition levels. Collection creation/removal and system-specific filters are demonstrated in Systems; the deferred organizer is not the collection baseline. **Molecules / Table**
shows the shared row/cell/header primitives together.

Start with the [component maintenance guide](../../../docs/component-maintenance.md) for naming, reuse, dependency boundaries and contribution checks. Game rules and character-sheet composition belong in [systems](../systems/README.md), not here. Neutral data/edit contracts may remain in `src/lib/utils/`.
