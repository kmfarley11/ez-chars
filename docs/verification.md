# Local Verification

Use these commands to verify changes before handing work back.

## Related Decisions And Checklists

- [Testing strategy decision](decisions/2026-07-17-testing-strategy.md) defines the Vitest and Playwright testing boundaries.
- [Theme visual checklist](theme-visual-checklist.md) covers manual UI and theme review before deployment.
- [Platform-native UI primitives decision](decisions/2026-07-17-prefer-platform-native-ui-primitives.md) records the current measured-grid constraint; [p1-027 in the backlog](backlog.md#replace-custom-grid-auto-measurement-with-native-css-container-queries) owns its future replacement.

This document is the canonical operational guide for verification commands, performance thresholds, and profiling response. Keep decision rationale in the linked records rather than duplicating it here.

## Main Gates

Run the full set before considering behavior, schema, storage, import/export, or release-sensitive changes complete:

```bash
npm run test
npm run check
npm run lint
npm run build
```

For doc-only or narrow style-only changes, run the relevant subset and state what you skipped.

## Test Commands

```bash
npm run test
```

Runs the Vitest contract and smoke tests once.

## Browser E2E Commands

```bash
npm run test:e2e
```

Runs the canonical Playwright smoke suite in Chromium. The config reuses a dev server already listening on `http://localhost:5173`; otherwise, Playwright starts the local Vite server for the run.

```bash
npm run test:e2e:all
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Use the all-browser command or an individual project when a change needs cross-browser confirmation. The default local gate is Chromium so routine feedback remains fast.

```bash
npm run test:perf
```

Runs the on-demand headless Chromium scroll-frame baseline. It reports frame timing for diagnosis and fails when average FPS drops below 55 or more than 5% of intervals exceed 33.3 ms (a missed-frame interval). The 16.7 ms VSync-budget rate is diagnostic only because normal headless scheduling can fluctuate around that boundary.

For a non-gating Firefox comparison, run:

```bash
PLAYWRIGHT_PERF=1 npx playwright test tests/performance.perf.spec.ts --project=firefox
```

Treat this as comparative evidence only. Headless Firefox frame timing can help identify a large regression, but it does not replace a headed Firefox Profiler recording for the previously observed subjective scroll jank.

## Manual Firefox Performance Checks

Use this workflow for a Firefox-specific rendering regression or a failing `test:perf` baseline:

1. Start the app with `npm run dev`, then reproduce the interaction in Firefox. To exercise the smoke flow in a visible browser, run `npx playwright test --project=firefox --headed`.
2. Visit [profiler.firefox.com](https://profiler.firefox.com/) in Firefox, enable the Profiler toolbar button, choose the Firefox Platform preset, and start recording. Reproduce the fast-scroll issue for 5–10 seconds, then capture the profile. Save it locally or upload only after reviewing the data-sharing prompt.
3. In the profiler, inspect the web-content `GeckoMain` thread first, then the Compositor and Renderer/GPU threads. Compare `Reflow`, `Styles`, and `ResizeObserver` markers with `DisplayList`, WebRender, paint, and composite markers. High compositor/renderer work with negligible reflow points away from a JavaScript layout fix.
4. Enable Firefox DevTools Paint Flashing and Layer Borders while reproducing the issue. Broad or repeated flashing suggests repaint/display-list work; stable layers with long compositor samples suggest the rendering pipeline instead.

### Performance Regression Response

1. Re-run `npm run test:perf` with the machine otherwise idle to confirm the result; do not treat a single timing sample as a new threshold.
2. If the profiler identifies a recent, narrow listener, style, or layout regression, fix it in the active change and rerun the routine E2E and performance suites.
3. If the work is structural or dominated by paint/compositing, record the profile result in the relevant backlog item rather than adding a browser-specific workaround. `p1-027` owns replacement of the JavaScript grid measurement model.
4. Change a performance threshold only with updated OpenSpec artifacts and repeatable baseline evidence.

```bash
npm run test:watch
```

Runs Vitest in watch mode while developing tests.

```bash
npm run test:coverage
```

Runs Vitest with V8 coverage and writes an HTML report to `coverage/`. Use this when adding or reviewing contract tests and you want an at-a-glance view of covered schema, storage, and import/export surfaces.

## App Checks

```bash
npm run check
```

Runs SvelteKit sync and Svelte type diagnostics.

```bash
npm run lint
```

Runs Prettier checks and ESLint.

```bash
npm run build
```

Builds the static production app. Use this before release-sensitive handoff or after config/dependency changes.

## Dev Server

```bash
npm run dev
```

Starts the local Vite dev server.

After dependency or SvelteKit/Vite config changes, restart stale dev processes before judging browser behavior. If the app shows stale module errors, stop existing Vite/Node processes and restart with:

```bash
npm run dev -- --force
```
