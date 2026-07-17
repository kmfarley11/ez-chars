## Context

`GridContainerAuto.svelte` dynamically allocates grid columns from container width and child sizes. A cached-width and sub-pixel `ResizeObserver` experiment preserved layout behavior but gave no perceivable Firefox scroll improvement, so the remaining question was whether the measured grid work was actually responsible.

## Goals / Non-Goals

**Goals:**

- Classify a representative headed Firefox profile before retaining another performance change.
- Preserve current behavior when the trace does not support the grid-measurement hypothesis.
- Record the evidence and defer repeatable verification and grid replacement to their dedicated work.

**Non-Goals:**

- Automating browser-performance profiling before Playwright E2E is in place.
- Replacing the custom grid model; that remains `p1-027`.
- Modifying Svelte store persistence, route projection, or general layout styles.

## Decisions

### Decision 1: Reject the cached-width and sub-pixel observer hypothesis

The Firefox recording does not implicate synchronous grid layout work: it contains one `Reflow (sync)` marker lasting 0.018 ms, and `FireScrollEvent` work has a 0.078 ms 95th percentile. The trial therefore adds complexity without evidence of benefit and is reverted.

_Alternatives Considered:_

- _Keep the trial because it is behaviorally safe:_ Rejected; retaining an unproven cache makes future refactors harder.
- _Make another grid micro-optimization:_ Rejected; the trace does not identify it as a material cost.

### Decision 2: Defer rendering-pipeline investigation and automation

The profile's renderer thread records 85 `Composite #2` spans above 16.7 ms, including 79 above 33.3 ms. This points more strongly to Firefox rendering/compositing than to the application scroll handler, but marker timing alone does not establish a Firefox engine defect or a safe product fix. `p1-026` will add repeatable browser checks after Playwright E2E exists; `p1-027` remains the appropriate place to replace JavaScript grid measurement with native CSS.

_Alternatives Considered:_

- _Add ad hoc performance automation now:_ Rejected; it would duplicate the planned Playwright foundation and create fragile pre-E2E tooling.
- _Add a Firefox-specific CSS workaround:_ Rejected; the trace does not identify a narrow, validated workaround.

## Risks / Trade-offs

- **[Risk]** Residual Firefox jank remains unresolved.
  - **[Mitigation]** Keep the representative profile finding in the backlog; revisit with repeatable measurements after `p1-015` enables the `p1-026` Playwright work, or when `p1-027` replaces the JavaScript grid model.

## Firefox Profiling Checkpoint

The cached-width and sub-pixel observer change preserved Chrome and Safari behavior but did not improve Firefox subjectively. The supplied headed Firefox profile confirmed that layout/ResizeObserver and application scroll-handler work are not material in the recorded interaction. It showed renderer/compositor frame spans that exceed the frame budget, so this change closes as a rejected grid hypothesis rather than claiming a performance win.
