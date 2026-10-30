# Local Verification

Use these commands to verify changes before handing work back.

Use Node 22.17 or newer for the SvelteKit 3/Vite 8 toolchain. After switching Node, use `npm ci` and restart any existing dev/Storybook servers before testing. Playwright and its test runner are version-aligned; install their browser binaries with `npx playwright install` when a test reports a missing executable.

## Node Runtime Mismatch

**Reported failure (2026-10-28):** running `npm run deploy` failed during SvelteKit prerendering with `TypeError: Promise.withResolvers is not a function`, originating in `@sveltejs/kit/src/core/postbuild/queue.js`. Local diagnosis found the shell selecting nvm's Node 20.19.5, where that API is undefined, despite a newer compatible Node also being installed. This is a build-time Node mismatch, not the earlier iPhone PDF-stream error.

From the repository root, in the same terminal that will run deployment:

```bash
node --version
command -v node
nvm install # reads .nvmrc; installs the latest Node 22 patch
nvm use
node --version # must satisfy >=22.17
npm ci
npm run build # prerender and static output must complete; does not publish
```

Only then run `npm run deploy` when publishing is intended. With another version manager, select a compatible Node using its equivalent commands. `.nvmrc` is a selection hint, not automatic shell configuration; nvm users must run `nvm use` in new shells unless they have separately configured auto-switching. Neither `engines` nor the existing install-time `engine-strict` setting switches the runtime used by already-installed scripts. Do not patch SvelteKit's queue or add a Promise polyfill to support the obsolete build runtime.

**Agent retest (2026-10-28):** the installed compatible Node 26.5.0 exposes `Promise.withResolvers`; `npm run build` completed prerendering and wrote the static site successfully under that runtime, with the existing fallback-page warning. The newly documented nvm Node 22 installation was not performed, and no deployment was published. Documentation formatting and whitespace checks passed. Dependencies and application code were unchanged.

**Node 22 retest (2026-10-29):** after `nvm use`, Node 22.23.4 / npm 10.9.9 passed diagnostics, lint, 386 unit tests, production and Storybook builds, 349 cross-browser checks (27 expected project-specific skips), 115 Storybook checks, the Chromium performance gate, and 22 strict OpenSpec validations. Audit still reports the six low affected-package findings covered by the accepted deepmerge exception. No deployment was published. The install resolved svelte-check's picomatch peer mismatch; the lockfile retains that addition while restoring 39 unrelated Linux `libc` constraints omitted by npm 10's lockfile writer. Review lockfile diffs after changing npm versions; runtime selection alone does not prevent package-manager metadata churn.

## Related Decisions And Checklists

- [Testing strategy decision](decisions/2026-07-17-testing-strategy.md) defines the Vitest and Playwright testing boundaries.
- [Theme visual checklist](theme-visual-checklist.md) covers manual UI and theme review before deployment.
- [Character-sheet interaction audit](accessibility-control-audit.md) records the bounded control-family accessibility baseline and evidence.
- [Coarse-pointer touch-target decision](decisions/2026-07-31-require-coarse-pointer-touch-targets.md) defines the 44 CSS-pixel policy and exceptions.
- [Platform-native UI primitives decision](decisions/2026-07-17-prefer-platform-native-ui-primitives.md) records the platform-first interaction policy and its narrowly retained compatibility behavior.

This document is the canonical operational guide for verification commands, performance thresholds, and profiling response. Keep decision rationale in the linked records rather than duplicating it here.

## Routine Smoke Gate

```bash
npm run verify:smoke
```

Runs the normal pre-handoff feedback loop: Svelte diagnostics, formatting and ESLint, unit tests, Chromium application smoke tests, and headless Chromium Storybook interaction/accessibility checks. It stops at the first failure.

This is a convenience command, not a replacement for the full or dependency-change gates below. It intentionally omits production and static-Storybook builds, coverage, `npm audit`, cross-browser tests, and performance checks.

## Comprehensive Automated Gate

```bash
npm run verify:all
```

Runs every non-interactive automated check: dependency audit; diagnostics; formatting and linting; unit tests and coverage; production and static-Storybook builds; Storybook browser checks; Chromium, Firefox, and WebKit application smoke tests; and the Chromium performance baseline. Use it for a comprehensive local handoff or when explicitly requested, rather than as the routine iteration command.

`verify:all` runs `test:e2e:all`, which already includes Chromium, so it does not also run the redundant Chromium-only `test:e2e` command.

## Main Gates

Run the full set before considering behavior, schema, storage, import/export, or release-sensitive changes complete:

```bash
npm run test
npm run check
npm run lint
npm run build
```

For doc-only or narrow style-only changes, run the relevant subset and state what you skipped. For routine source changes, start with `npm run verify:smoke`; run the full set or dependency-change requirements when their scope applies.

## Test Commands

```bash
npm run test
```

Runs the Vitest contract and smoke tests once.

## Component Catalog

```bash
npm run storybook
```

Starts the local Storybook catalog at `http://localhost:6006` without opening a browser. Use it to inspect component states, the Controls panel, and the Accessibility panel while iterating; cataloged component and story edits hot-reload.

```bash
npm run build-storybook
npm run test:storybook -- --run
```

The first command builds the local static catalog into the ignored `storybook-static/` directory. The second runs every catalog story in headless Chromium, including declared play-function interactions and configured automated accessibility checks. It is separate from `npm run test`, which remains the Node-based unit suite.

Automated accessibility checks report supported machine-detectable findings only. They do not replace keyboard, focus, screen-reader, touch-target, responsive-layout, or table-play review; retain those checks for the relevant application work, including `p1-020`.

The Storybook project allows 30 seconds per check: the production-backed saturated Page takes roughly 19 seconds to render and audit locally. This preserves the full accessibility audit rather than disabling rules to meet the former 15-second default. It is a catalog-check timeout, not an application interaction-performance budget.

Canonical Character Sheet stories use on-demand accessibility scans in the human Canvas: open Accessibility and choose Run test. Automatic full-sheet scans previously blocked interaction for roughly 19 seconds. The normal CLI gate still audits these stories, with a setup guard requiring an accessibility report for every story; no rules are disabled. The Storybook test panel's explicit component-only mode is respected, without requiring an audit report for a scan the reviewer disabled. Other stories retain automatic Canvas scans.

## Browser E2E Commands

For changes to the production-backed catalog hosts, also run the opt-in catalog regression suite:

```bash
npx playwright test --config playwright.catalog.config.ts
```

It starts/reuses Storybook on port 6006 and exercises real sandbox edits and reset in Chromium with light and dark browser preferences. It also resets with Rules open, reopens the reader, and checks that the browser URL/history and a sentinel application-storage value stay unchanged. It checks the app-themed host foreground as well as DOM visibility: DOM-visible text can still be unreadable against a mismatched host background. This suite uses existing Playwright dependencies, is excluded from application test discovery, and is not included in `verify:smoke` or `verify:all`. It does not replace manual visual review, story-switching checks, or application persistence/navigation tests.

Run it separately from other browser suites, and avoid file edits or builds that can hot-reload its development server during interactions. Its single-worker, 60-second per-flow budget accommodates full-sheet mount/edit/reset work. Canonical flows measured 1.5–1.7 seconds after separating on-demand Canvas scans from automatic test audits (previously roughly 21 seconds). This timeout is not an app performance threshold or a promise about cold-server startup.

```bash
npm run test:e2e
```

Runs the canonical Playwright smoke suite in Chromium. The config reuses a dev server already listening on `http://localhost:5173`; otherwise, Playwright starts the local Vite server for the run.

Keep the workspace quiet during application browser suites as well as catalog suites: file edits, formatting, coverage generation or builds can trigger development-server reloads during an interaction. If a trace shows an unexpected navigation/Vite reconnect, inspect it and rerun with no concurrent writes or heavy checks before diagnosing an application regression. `npm run test:e2e -- --workers=1` provides a serialized diagnostic run without changing assertions, retries or timeouts; it does not erase a failed earlier run from the evidence record.

```bash
npm run test:e2e:all
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
```

Use the all-browser command or an individual project when a change needs cross-browser or mobile confirmation. The default local gate is Chromium so routine feedback remains fast.

For the focused phone-sized accessibility regression suite, run:

```bash
npx playwright test tests/mobileAccessibility.smoke.spec.ts --project="Mobile Chrome"
```

This suite measures representative touch owners directly in CSS pixels, checks that adjacent source filters do not overlap, follows the keyboard order across collapsed sheet content, and verifies modal focus confinement and invoker restoration. It deliberately does not divide geometry by `devicePixelRatio`.

Automation does not establish physical thumb comfort, screen-reader interpretation, inline-flow exception usability, or whether a native checkbox/radio label feels clear when the visible input remains small. Review those conclusions on a physical or equivalently configured phone and with the relevant assistive technology using [the theme visual checklist](theme-visual-checklist.md); record any newly approved exception in [the control audit](accessibility-control-audit.md).

```bash
npm run test:perf
```

Runs the on-demand headless Chromium scroll-frame baseline. It reports frame timing for diagnosis and fails when average FPS drops below 55 or more than 5% of intervals exceed 33.3 ms (a missed-frame interval). The 16.7 ms VSync-budget rate is diagnostic only because normal headless scheduling can fluctuate around that boundary.

For a non-gating Firefox comparison, run:

```bash
npm run test:perf:compare
```

The comparison runs three serialized samples in both Chromium and Firefox, prints the median frame cadence, and writes a compact local report to `performance-results/scroll-frame-comparison.json`. The report retains the preceding run's timestamp and medians so a later run can expose a directional change without treating different browser engines as interchangeable. Chromium continues to enforce the repository's performance thresholds; Firefox is comparative evidence only.

Interpret a headless Firefox delta as a signal to investigate, not as an end-user slowdown by itself. `requestAnimationFrame` measures content-process callback cadence; it does not establish that each frame was painted and composited correctly, and headless scheduling may differ materially from a warmed visible browser. Conversely, a smooth headed cadence does not disprove a transient black or incomplete frame. Headless Firefox frame timing can help identify a large directional regression, but it does not expose reliable paint, compositor, or GPU evidence and does not replace a headed Firefox Profiler recording for the previously observed subjective scroll jank. Do not promote the Firefox median to a fixed gate without repeatable evidence from the supported execution environment.

The dated calibration evidence and remaining compatibility decision are recorded under [`BL-072`](backlog.md#harden-the-three-system-external-playtest-matrix). Repeat that comparison after meaningful rendering or sheet-density changes; do not treat ordinary run-to-run movement as a durable regression without a warmed headed reproduction or profile.

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

Runs Vitest with V8 coverage and writes an HTML report to `coverage/`. The runner-level configuration explicitly includes `src/schema/` and `src/lib/storage/`, excluding generated code and tests. This is boundary coverage, not whole-application UI coverage; do not compare its percentages with historical reports that accidentally included generated/application modules. Use it when adding or reviewing schema, storage, and import/export contracts.

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

### Static deployment routing

The GitHub Pages fallback is `build/404.html`; `build/index.html` remains the prerendered home page. A build should emit both without `adapter_fallback_overwrites`.

For a production-route check, build first, then run the existing browser suite in preview mode:

```bash
PLAYWRIGHT_PREVIEW=1 npx playwright test tests/navigation.smoke.spec.ts tests/multi-system.smoke.spec.ts tests/referenceReaderProof.smoke.spec.ts --grep 'direct sheet load and refresh|serves adopted SRDs|serves PDF.js|native popover|links third-party|compact reader keeps Find|2024 reader uses its source' --workers=1
```

Preview mode starts its own server on port 4173 and refuses to reuse another server, keeping these checks separate from development. This checks the production home page, static resources, and direct sheet loads/refreshes with character IDs. Preview does not reproduce GitHub Pages' custom-404 handling. After deployment, also open and refresh saved links to both `/ez-chars/charsheets/5e?id=<2014-character-id>` and `/ez-chars/charsheets/5e2024?id=<2024-character-id>` on a device containing those characters. Confirm the same character remains selected.

Preview serves the pre-adapter client output. Also verify the final deployment directory, including unchanged PDF.js support files and exclusion of local-only documents:

```bash
diff -qr --exclude=local-only --exclude='.*' docs/ext build/docs/ext
for asset_dir in cmaps iccs image_decoders standard_fonts wasm; do
  diff -qr "node_modules/pdfjs-dist/$asset_dir" "build/pdfjs/$asset_dir" || exit 1
done
test ! -e build/docs/ext/local-only
test -s build/index.html && test -s build/404.html
```

The asset plugins in `vite.config.ts` copy during the client bundle's `writeBundle`, using that bundle's actual output directory before SvelteKit prerendering/adaptation. Do not restore top-level `config.build.outDir` plus `closeBundle`: in the multi-environment build this targeted `dist/` rather than the output consumed by preview and the adapter. No extra post-build copy or manual staging of assets is required.

**2026-10-29 evidence:** Node 22.23.4: diagnostics and lint passed; 51 unit files / 386 tests passed; production build emitted both HTML files without the fallback-overwrite warning. The focused preview run passed 15 checks (including both system deep links and refreshes across all four browser projects), skipped the existing desktop-only About check on Mobile Chrome, and failed all four SRD-serving checks. Reproduction: run the build and preview command above; requests to `/ez-chars/docs/ext/5e2014/SRD_CC_v5.1.pdf` fail. The generated `build/` also lacks `docs/ext/` and `pdfjs/`, while the asset plugins use the resolved Vite output directory and assets exist under `dist/`. This is an agent-observed production-asset packaging gap, not a routing-test failure or an accepted deployment exception. BL-072 tracks correction before the next deployment. Retest must verify both SRDs and PDF.js support assets in the deployed directory, retain the local-only exclusion, and rerun these browser checks. No deployment was performed.

**2026-10-30 fix/retest:** Corrected both asset plugins' output/lifecycle handling. Production assets match their sources byte-for-byte; local-only documents remain absent and both HTML entry files exist without the overwrite warning. `verify:smoke` passed (386 unit tests, 92 Chromium checks with five existing project-specific skips, 115 Storybook checks). The expanded production-preview matrix passed 31 checks with one existing mobile About skip, including both SRDs, all five support-asset categories, reader/search behavior and both sheet routes. The earlier packaging gap is resolved, not waived. Audit remains at the previously accepted six low-severity affected-package findings; dependencies are unchanged. No deployment or physical-device verification was performed.

The static Storybook build also passed with source-identical document/support assets and no local-only directory. Coverage passed (97.35% lines across the configured schema/storage boundary), as did the canonical Chromium scroll-performance gate. This was a focused cross-browser production check plus the full routine smoke gate, not a rerun of every cross-browser application test.

## Dev Server

```bash
npm run dev
```

Starts the local Vite dev server.

After dependency or SvelteKit/Vite config changes, restart stale dev processes before judging browser behavior. If the app shows stale module errors, stop existing Vite/Node processes and restart with:

```bash
npm run dev -- --force
```
