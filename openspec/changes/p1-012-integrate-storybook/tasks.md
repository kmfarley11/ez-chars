## 1. Controlled Storybook Setup

- [ ] 1.1 Verify that the development Node and npm versions satisfy Storybook `10.5.2` requirements before changing dependencies.
- [ ] 1.2 Initialize Storybook `10.5.2` with explicit SvelteKit, npm, accessibility, and test selections plus no-dev and telemetry-disabled options; keep every direct Storybook package on the same exact version and in `devDependencies`.
- [ ] 1.3 Review the generated dependency and configuration diff; remove onboarding/demo stories, Svelte-CSF configuration, crash reporting, and unrelated ESLint or Vite changes. Confirm that `@storybook/svelte-vite`, `@storybook/test-runner`, and `@storybook/addon-svelte-csf` are not retained as direct dependencies or configured integrations.
- [ ] 1.4 Add local scripts for the no-open, telemetry-disabled interactive Storybook server, telemetry-disabled static Storybook build, and Storybook-only Vitest project, and ignore generated static Storybook output.

## 2. SvelteKit, Styling, Accessibility, and Test Integration

- [ ] 2.1 Configure `.storybook/main.ts` with `@storybook/sveltekit`, `@storybook/addon-a11y`, `@storybook/addon-vitest`, and a story-discovery pattern restricted to TypeScript `.stories.ts` files.
- [ ] 2.2 Configure `.storybook/preview.ts` to import `src/app.css` and fail catalog tests on configured automated accessibility violations.
- [ ] 2.3 Verify that all current SvelteKit aliases (`$components`, `$storage`, `$utils`, and `$fixtures`) resolve in Storybook and its static build; add explicit Storybook alias configuration only if a reproducible failure requires it.
- [ ] 2.4 Move the existing unit-test configuration from `vite.config.ts` into `vitest.config.ts` without changing its Node environment, include patterns, shared setup, or coverage behavior.
- [ ] 2.5 Define separate named `unit` and `storybook` Vitest projects, configuring the Storybook project for headless Chromium through Vitest Browser Mode and Playwright.
- [ ] 2.6 Keep `test`, `test:watch`, and `test:coverage` scoped to the unit project, and configure `test:storybook` to run only the Storybook project from the CLI.

## 3. Baseline TypeScript CSF Stories

- [ ] 3.1 Add `BaseButton.stories.ts` with representative size and shading variants, a disabled state, and an icon-only state with an accessible name.
- [ ] 3.2 Add `Heading.stories.ts` with representative semantic visual variants.
- [ ] 3.3 Add `ValidatedInputField.stories.ts` with valid and invalid examples plus a play-function assertion that exercises input and callback/validation behavior.
- [ ] 3.4 Confirm that all three story files render in the catalog, appear in the Storybook test widget, pass their declared interactions, and report automated accessibility status.

## 4. Documentation and Verification

- [ ] 4.1 Update `docs/verification.md` with the interactive Storybook, static Storybook build, and Storybook component-test commands, including the distinction between automated accessibility findings and manual accessibility review.
- [ ] 4.2 Run the interactive Storybook server, verify the three catalog entries and accessibility panel, and confirm hot reload after a temporary component or story edit that is reverted before handoff.
- [ ] 4.3 Run `npm run build-storybook` and `npm run test:storybook -- --run` as noninteractive Storybook gates.
- [ ] 4.4 Run `npm audit`, `npm run test`, `npm run test:coverage`, `npm run check`, `npm run lint`, and `npm run build` to verify dependency health, the isolated unit project, Svelte diagnostics, formatting, linting, and the production build.
- [ ] 4.5 Run `npm run test:e2e`, `npm run test:e2e:all`, and `npm run test:perf` because the change affects browser-facing dependencies and build/test tooling.
- [ ] 4.6 If any browser binary or host dependency prevents a required suite from running, record the exact environmental blocker and complete every remaining executable gate.

## 5. Backlog Updates & Reconciliation

- [ ] 5.1 Remove `p1-012` from the prioritized P1 queue in `docs/backlog.md` and add it to `## Done Recently` with a concise summary of the local catalog and executable component-test loop.
- [ ] 5.2 Update `docs/active-goals.md` current status to record the completed Storybook catalog and local component/accessibility verification workflow.
- [ ] 5.3 Re-sequence the `Next recommended sequence` block so `p1-005` is next, while retaining its requirement for renewed exploration and user agreement before proposal or implementation.
- [ ] 5.4 Reconcile material implementation fallout into the design, tasks, ADR, and verification guide, then run strict OpenSpec validation before archive.

## Executor Recommendation

**Recommended Executor:** Codex with medium reasoning and moderate implementation complexity.

**Rationale:** The component stories are small, but the work requires controlled dependency adoption, SvelteKit-specific Storybook configuration, Vitest project isolation, browser-backed interaction/a11y testing, and broad dependency-change verification. No unresolved product or architecture decision remains.
