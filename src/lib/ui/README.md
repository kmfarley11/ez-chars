# Shared UI

[QuickReference](organisms/quick-reference.svelte) composes live and reference data panels for both 5e editions. It accepts projected fields and save callbacks, not a character or system flag. Its evidence is in the existing system Pages and 2014 section-composition story rather than a duplicate sandbox.

Linked-record Detail uses [DetailSource](molecules/detail-source.svelte) and [SmallEditDialog](organisms/small-edit-dialog.svelte) through the neutral `SmallEditModel.source` contract. Both edition adapters supply live source resolution and refresh ownership; the shared dialog handles dirty decisions, one-dialog navigation, Back/Close and focus. Review this composition in the existing Systems Pages rather than a second story-only implementation.

System-neutral components live in [atoms](atoms/), [molecules](molecules/) and [organisms](organisms/). Stories are colocated as `*.stories.ts`; tests use nearby `__tests__/` directories. Find these in Storybook under **Design System**.

Looking for interaction tiers? **Molecules / Edit-first (Tier 1 Field)** covers inline editing;
**Organisms / Read-first Detail (Tier 2 Field)** covers focused detail; **Organisms / Collections (Tier 3 Field)** covers generic collection rendering, search, pinning and row edits.
These are interaction patterns, not additional composition levels. Collection creation/removal and system-specific filters are demonstrated in Systems; the deferred organizer is not the collection baseline. **Molecules / Table**
shows the shared row/cell/header primitives together.

Start with the [component maintenance guide](../../../docs/component-maintenance.md) for naming, reuse, dependency boundaries and contribution checks. Game rules and character-sheet composition belong in [systems](../systems/README.md), not here. Neutral data/edit contracts may remain in `src/lib/utils/`.
