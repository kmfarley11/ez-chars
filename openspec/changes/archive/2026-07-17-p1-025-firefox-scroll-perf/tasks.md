## 1. Evaluate the Grid-Measurement Hypothesis

- [x] 1.1 Implement the cached-width and sub-pixel `ResizeObserver` hypothesis in `src/lib/GridContainerAuto.svelte`
- [x] 1.2 Verify that the trial preserves desktop and phone-sized layout behavior
- [x] 1.3 Revert the trial when manual verification and profiling do not show a material Firefox benefit

## 2. Classify Firefox Scroll Work

- [x] 2.1 Capture a headed Firefox Profiler trace for fast scrolling in the dense Abilities & Proficiencies and Spells regions
- [x] 2.2 Confirm that the trace does not show material synchronous reflow or application scroll-handler work, and record the renderer/compositor finding

## 3. Local Verification

- [x] 3.1 Run `npm run check` and `npm run lint` to verify clean diagnostics and code formatting
- [x] 3.2 Run `npm run test` to verify Vitest contract and unit tests pass cleanly
- [x] 3.3 Verify visual layout parity on desktop and phone-sized viewports when resizing screens or collapsing sections
- [x] 3.4 Inspect the supplied headed Firefox trace and classify the limiting work before making another performance change

## 4. Backlog Updates & Reconciliation

- [x] 4.1 Update `docs/backlog.md` with the rejected hypothesis, deferred follow-up, and next recommended target
- [x] 4.2 Reconcile `docs/active-goals.md` to note that Firefox-specific performance work is deferred

## Executor Recommendation

- **Reasoning Level:** Medium
- **Model Complexity:** Simple to Medium (e.g. Gemini 1.5 Flash / GPT-4o-mini)
- **Rationale:** The changes are fully contained inside `src/lib/GridContainerAuto.svelte`. The core tasks involve simple array caching, event throttling, and element size measurements, which do not cross complex architectural or database boundaries.
