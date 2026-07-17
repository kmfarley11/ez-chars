## MODIFIED Requirements

### Requirement: Deferred repeatable performance verification

The project MUST run repeatable browser-performance and console regression checking in our E2E testing gates, and document manual verification procedures.

#### Scenario: No ResizeObserver loops or console errors

- **WHEN** the user runs the routine E2E smoke tests (e.g. `npm run test:e2e`)
- **THEN** the system MUST fail the test run if any browser console error or `ResizeObserver loop limit exceeded` warning is intercepted, with no performance profiling overhead

#### Scenario: Scroll performance tracking on demand

- **WHEN** the user runs the dedicated performance profiling suite (e.g. via `npm run test:perf`)
- **THEN** the system MUST execute scroll profiling, collect average FPS plus both 16.7 ms VSync-budget and 33.3 ms dropped-frame rates, and assert the average-FPS and dropped-frame baseline thresholds

#### Scenario: Manual Firefox Profiler trace capture

- **WHEN** a developer is diagnosing rendering bottlenecks or verifying scroll smoothness manually
- **THEN** the developer SHALL follow the manual verification guidelines to capture headed Firefox performance profiles and analyze them at `profiler.firefox.com`
