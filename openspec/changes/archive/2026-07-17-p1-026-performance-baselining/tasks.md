## 1. Setup E2E Console Assertion

- [x] 1.1 In `tests/characterSheet.smoke.spec.ts` (or in a shared global setup), register `console` and `pageerror` event listeners on the `page` object
- [x] 1.2 Intercept and collect all console messages and error events during standard test execution
- [x] 1.3 Assert at the end of each test (or fail immediately) if any console errors or `ResizeObserver loop limit exceeded` warnings are found

## 2. Implement Automated Scroll Performance Profiler

- [x] 2.1 Add the `test:perf` script to `package.json` targeting performance tests, and update `playwright.config.ts` to exclude `*.perf.spec.ts` from routine E2E test runs (e.g. via `testIgnore` config)
- [x] 2.2 Create a new E2E test file `tests/performance.perf.spec.ts`
- [x] 2.3 Seed the test with mock character data and navigate to the character sheet
- [x] 2.4 Inject a browser-side frame profiling script utilizing `requestAnimationFrame` to track frame rendering time intervals
- [x] 2.5 Programmatically scroll the sheet container down and up (simulating active scrolling)
- [x] 2.6 Stop the profiling script, calculate average FPS plus 16.7ms VSync-budget and 33.3ms dropped-frame rates, and assert that local headless runs meet the target thresholds (average FPS >= 55, dropped-frame rate <= 5%)
- [x] 2.7 Run the new performance profiling suite; if the baseline fails on the current main codebase, follow the escalation plan (apply minor fixes or log a new backlog target for structural issues)

## 3. Document Manual Verification Guides

- [x] 3.1 Update `docs/verification.md` to include step-by-step instructions for manual performance checks on Firefox
- [x] 3.2 Add instructions for launching headed Firefox under Playwright (`npx playwright test --project=firefox --headed`) and using the Firefox Profiler
- [x] 3.3 Add instructions for diagnosing rendering pipeline statistics at `profiler.firefox.com` (composite thread, reflow costs, paint flashing, layer borders)
- [x] 3.4 Document the performance regression check-response workflow (minor optimization vs. structural issue logging) in `docs/verification.md`

## 4. Backlog Updates & Reconciliation

- [x] 4.1 Prune `p1-026` from `docs/backlog.md` and move it to `Done Recently` with a summary of the automated performance gating and manual profiling steps
- [x] 4.2 Reconcile the 'Next recommended target' header in `docs/backlog.md` to point to the next active priorities (e.g. `p1-045`, `p1-027`, etc.)
- [x] 4.3 Validate the final changes using `openspec validate --changes`

## Executor Recommendation

- **Reasoning Level:** Medium
- **Model Complexity:** Medium
- **Rationale:** Implementing frame profiling using `requestAnimationFrame` injected into Playwright pages and capturing console listeners requires careful async handling in Playwright contexts, but uses standard web and test APIs. A medium reasoning/complexity level is appropriate to handle the test design cleanly without errors.
