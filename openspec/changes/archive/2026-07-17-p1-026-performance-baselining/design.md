## Context

To protect the rendering speed of the character sheet (specifically the card grid sections), we want to catch ResizeObserver loop limits and layout/scroll jank during automated E2E testing.

## Goals / Non-Goals

**Goals:**

- Catch ResizeObserver loop errors and general console errors automatically during normal Playwright E2E smoke tests.
- Build a dedicated scroll performance profiling test script (`tests/performance.perf.spec.ts`) that programmatically scrolls the sheet and records client-side frame timings (FPS, frame budget exceeded) when run via a dedicated performance script.
- Document step-by-step instructions in `docs/verification.md` for manual performance verification (Firefox Profiler trace captures, Paint Flashing, Layer borders).

**Non-Goals:**

- Creating custom browser extensions or integrating third-party paid visual or performance monitoring platforms.
- Running performance profiling tests on every routine developer test pass (performance tests will be run on demand via a separate script).
- Fixing structural grid auto-measurement rendering overhead (this is explicitly deferred to `p1-027` Container Queries).

## Baseline Actions & Escalation

When the automated performance E2E tests fail (FPS < 55 or dropped-frame rate > 5%):

1. **Identify the cause:** Follow the manual profiling guide using the Firefox Profiler to pinpoint the bottleneck (e.g. style recalculation, paint time, long Svelte microtasks).
2. **Minor optimizations:** If the regression is due to a recent styling or listener change, fix it within the active implementation task.
3. **Structural regressions:** If the baseline reveals a deep architectural issue that cannot be solved quickly, log a new backlog item with the profile trace link as evidence and adjust the baseline threshold temporarily if blocking routine development.

## Decisions

### Decision 1: Playwright Console Assertion Hook

We will add a global page listener in `tests/characterSheet.smoke.spec.ts` (or a helper) that intercepts `page.on('console', msg => ...)` and `page.on('pageerror', err => ...)`. If any console error, uncaught exception, or ResizeObserver warning (e.g., matching `/ResizeObserver/`) is detected, the test run will fail.

_Alternatives Considered:_

- _Testing Library warning trackers:_ Node-based and unable to intercept actual browser-engine ResizeObserver warnings.

### Decision 2: Separate Client-Side Scroll Performance Script

We will implement a dedicated scroll test in `tests/performance.perf.spec.ts` and set up a separate script `npm run test:perf` in `package.json` targeting this file. By using the `.perf.spec.ts` suffix (or configured ignore lists in `playwright.config.ts`), we ensure routine runs of `npm run test:e2e` bypass this performance measurement, preserving sub-5-second developer runs. The performance test will:

1. Seed the character data and open the page.
2. Inject a browser-side frame recorder that uses `requestAnimationFrame` to record the interval between frames during a smooth scroll action.
3. Programmatically scroll the sheet container down and up.
4. Stop the frame recorder and return average FPS, the percentage of intervals exceeding the 16.7 ms VSync budget, and the percentage exceeding 33.3 ms (a missed-frame interval).
5. Assert that average FPS remains above 55 and dropped-frame rate is at or below 5% under headless Chromium. Report the 16.7 ms rate as a diagnostic rather than a pass/fail gate.

The first baseline averaged above 55 FPS but reported 36.7% of intervals just over 16.7 ms. At a nominal 60 Hz cadence, small headless scheduling variance around that boundary does not itself represent a visibly dropped frame. A 33.3 ms interval represents a missed VSync and is the stable gating signal; retaining the 16.7 ms rate preserves sensitivity for diagnosis.

_Alternatives Considered:_

- _Playwright tracing/CDP profiling:_ Offers deep tracing but is complex to parse programmatically in a cross-browser way. Client-side `requestAnimationFrame` timing is lightweight, cross-browser, and directly measures user-perceived frame drops.
- _Including profiling in the main E2E suite:_ Rejected because profiling runs introduce execution noise and execution time overhead, which conflicts with the need for fast, deterministic routine E2E feedback.

### Decision 3: Documented Firefox Manual Profiling

For Firefox-specific paint/compositor analysis, we will document how to run headed Firefox under Playwright (`npx playwright test --project=firefox --headed`), use the DevTools Profiler, upload to `profiler.firefox.com`, and check the composite thread.

## Cross-Browser Baseline Checkpoint

The same headless probe was run as a diagnostic in both browser projects. Chromium recorded 60.0 FPS with a 0% dropped-frame rate; Firefox recorded 57.1 FPS with a 3.3% dropped-frame rate. Both meet the local gate, so the probe does not reproduce the subjective Firefox jank found in headed manual testing. Keep Chromium as the only gating project and use the Firefox probe for comparison; use a headed Firefox Profiler recording to investigate a user-perceived regression.

## Risks / Trade-offs

- **[Risk]** Headless runner CPU throttling on CI or virtualization may cause false performance test failures.
  - **[Mitigation]** The performance profiling assertions (e.g. FPS thresholds) will only be enforced on local runs or with a configurable tolerance flag, so that CI resource starvation doesn't break standard functional builds.
