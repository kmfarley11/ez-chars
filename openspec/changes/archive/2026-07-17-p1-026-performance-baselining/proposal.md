## Why

We need to automatically detect scroll-jank and ResizeObserver loop limit regressions during UI updates to keep the character sheet rendering smoothly. Establishing automated baseline performance checks and documenting manual trace protocols prevents future rendering performance regressions.

## What Changes

- Configure Playwright E2E tests to intercept console events and assert that no `ResizeObserver loop limit exceeded` warnings or browser console errors/warnings occur during routine test execution.
- Implement scroll performance profiling in an on-demand, separate E2E profiling suite that tracks average FPS, reports intervals above the 16.7 ms VSync budget, and gates on dropped-frame intervals above 33.3 ms without slowing down routine developer checks.
- Document manual rendering profiling procedures under `docs/verification.md` (Firefox Profiler trace analysis at `profiler.firefox.com`, Paint Flashing, Layer borders).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `sheet-layout-performance`: Move performance verification from deferred to active status by establishing automated console/ResizeObserver assertions, on-demand scroll performance tracking, and formalizing manual Firefox trace guidelines.

## Impact

- `package.json`: Add `test:perf` script to trigger the separate scroll performance profiling suite.
- `tests/characterSheet.smoke.spec.ts`: Add listener to assert on ResizeObserver loop limits and console errors during normal smoke flows.
- `tests/performance.perf.spec.ts`: Implement on-demand scroll performance profiling and rendering statistics capture.
- `docs/verification.md`: Document standard manual steps for capturing Firefox Profiler traces and tracking layout flashes.
