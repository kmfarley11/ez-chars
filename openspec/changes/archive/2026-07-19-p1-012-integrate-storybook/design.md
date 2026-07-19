## Context

The reusable components under `src/lib/components/` are currently developed through application routes, most notably the D&D 5e sheet. That couples visual iteration to character hydration, route state, and dense layout composition. A local component sandbox should shorten that loop for humans and agents while preserving the existing SvelteKit, Vite, Vitest, and Playwright workflows.

The repository already uses Vitest 4 and Playwright. Its unit-test configuration currently lives in `vite.config.ts`; Storybook's Vitest integration extends Vite configuration, so the existing test configuration must be isolated to prevent unit and browser projects from merging accidentally.

## Goals / Non-Goals

**Goals:**

- Provide an isolated SvelteKit-aware environment for reusable Svelte 5 components.
- Use typed, reviewable component examples for visual states and interactions.
- Give humans and AI agents the same browser-backed rendering, interaction, and accessibility checks through both a dashboard and a local CLI command.
- Keep the existing unit, browser E2E, build, and performance workflows intact.
- Keep setup deterministic and limited to reviewed development-only dependencies and configuration.

**Non-Goals:**

- Automated screenshot or visual-regression comparison.
- Remote Storybook hosting, GitHub Pages deployment, or CI configuration.
- Initial stories for full pages or complex layout composites such as `GridContainer`.
- Replacing Playwright application flows, manual accessibility review, mobile review, or the later `p1-020` accessibility work.
- Claiming complete WCAG conformance from automated Axe checks.

## Decisions

### 1. Use the SvelteKit Storybook framework with an aligned, pinned package set

Adopt Storybook `10.5.2` for the initial integration and pin all direct Storybook packages to that same exact release. Configure `@storybook/sveltekit`, which is the supported framework for SvelteKit applications and supplies Kit-aware module and link handling. The lower-level `@storybook/svelte-vite` framework is not appropriate as the configured framework or a direct dependency for this repository.

Setup will be minimal and controlled: use a version-qualified initializer or equivalent explicit installation, explicitly select SvelteKit, npm, accessibility, and test features, skip automatic server startup, disable telemetry, and review every generated change. Generated onboarding examples, Svelte-CSF support, crash reporting, and unrelated ESLint or Vite modifications are not part of the accepted setup. Interactive and build scripts will retain the telemetry opt-out.

**Alternatives considered:**

- A custom Svelte sandbox route would avoid dependencies but would require maintaining a catalog, state controls, test integration, and accessibility reporting.
- `@storybook/svelte-vite` is a lower-level Svelte integration and does not provide the SvelteKit-specific support available from `@storybook/sveltekit`.

### 2. Standardize on TypeScript Component Story Format

Use TypeScript CSF files ending in `.stories.ts` and restrict the Storybook story discovery pattern to that format. Do not configure or retain `@storybook/addon-svelte-csf` as a direct dependency, generated `.stories.svelte` examples, or unrelated onboarding stories.

TypeScript CSF keeps example metadata, arguments, play functions, and assertions explicit and broadly readable by editors and coding agents. Native Svelte story syntax remains a viable future option, but supporting two story formats during this proof surface would weaken the repository convention without adding needed behavior.

### 3. Use the accessibility and Vitest addons as one executable feedback loop

Install `@storybook/addon-a11y` and `@storybook/addon-vitest`. Configure accessibility checks as errors for cataloged stories so violations affect both dashboard test status and CLI exit status. Use the Vitest addon rather than the superseded `@storybook/test-runner`.

The Storybook Vitest project will run headlessly in Chromium through Vitest Browser Mode and Playwright. Add a dedicated `test:storybook` script so agents can render every story, execute play functions, and receive accessibility results without starting or navigating the dashboard. The `storybook` script remains available for interactive development, and `build-storybook` provides a noninteractive configuration/build check.

Axe findings are an automated first line of review only. They cover supported machine-detectable rules and do not replace keyboard, screen-reader, focus, touch-target, responsive-layout, or table-play review.

### 4. Isolate the existing Vitest suite from Storybook browser tests

Move the current unit-test configuration out of `vite.config.ts` into `vitest.config.ts`, preserving its include patterns, Node environment, shared setup file, and coverage behavior. Define separate named `unit` and `storybook` projects so each can run independently.

Keep the existing `test`, `test:watch`, and `test:coverage` workflows scoped to the unit project. Scope `test:storybook` to the Storybook project. The Storybook project may extend the application Vite configuration for SvelteKit and Tailwind processing, but it must not inherit or merge the unit project's test environment or include patterns.

### 5. Reuse SvelteKit aliases and application styling

Import `src/app.css` from the Storybook preview so Tailwind, theme tokens, and component styles match the application. Rely on `@storybook/sveltekit` for the existing SvelteKit aliases (`$components`, `$storage`, `$utils`, and `$fixtures`), and verify them through stories and the static Storybook build. Add Storybook-specific aliases only if a reproducible resolution failure demonstrates that they are needed.

### 6. Prove static, state, and interaction workflows with three stories

Create TypeScript CSF stories for:

- `BaseButton`, covering representative size, shading, disabled, and accessible icon-only states.
- `Heading`, covering its semantic visual variants.
- `ValidatedInputField`, covering valid and invalid states plus a play-function interaction assertion.

The third story proves that the sandbox supports callbacks, user interaction, validation feedback, and browser assertions rather than serving only as a static gallery.

### 7. Keep the catalog local and document its commands

Document the interactive server, static build, and component-test commands in the repository's verification guide. Do not publish Storybook, add a CI workflow, or add cloud services in this change. Ignore generated static Storybook output so local verification does not dirty the worktree.

## Risks / Trade-offs

- **[Risk] Storybook expands the development dependency graph.** → Keep packages in `devDependencies`, pin the direct Storybook package family to one reviewed release, run `npm audit`, and verify that the production application build remains unchanged.
- **[Risk] An initializer introduces unrelated files or configuration.** → Use version-qualified, feature-limited setup; inspect the generated diff; and remove onboarding, alternative story formats, telemetry configuration, and unrelated tool changes.
- **[Risk] Storybook tests interfere with existing Vitest contracts.** → Separate named unit and browser projects, preserve current unit scripts, and run the full existing test and coverage configuration after migration.
- **[Risk] Automated accessibility results create false confidence.** → Describe Axe as limited automated feedback and retain `p1-020`, browser E2E, and manual accessibility/mobile review as separate work.
- **[Risk] SvelteKit aliases or Tailwind styles differ in Storybook.** → Verify all existing aliases, import the production stylesheet, build Storybook statically, and add fallback configuration only for demonstrated failures.
- **[Risk] Agents cannot use an interactive dashboard reliably.** → Make the headless `test:storybook` and `build-storybook` commands required verification paths.

## Migration Plan

1. Record the current unit-test behavior, then install the aligned Storybook package set and its browser-test provider as development dependencies.
2. Create the minimal SvelteKit-aware Storybook configuration and isolate the unit and Storybook Vitest projects.
3. Add the three baseline TypeScript CSF stories and their interaction/accessibility configuration.
4. Document the new local commands and run dependency, application, Storybook, browser, cross-browser, and performance gates.
5. If the integration must be rolled back, remove the Storybook dependencies, configuration, scripts, and stories, then restore the pre-change unit-test configuration in `vite.config.ts`.

## Open Questions

None.

## Implementation Reconciliation

### 2026-07-19

- The unit project extends the application Vite configuration, while the Storybook project loads SvelteKit only for Svelte transformation and lets the Storybook Vitest addon supply its own catalog configuration. This prevents unit-test settings from leaking into browser-backed catalog checks.
- The SvelteKit deployment base is empty only when the `STORYBOOK_TEST` command environment is set. Vitest Browser Mode serves its runner at the origin root; retaining the GitHub Pages base there prevented catalog tests from loading. Unit, development, and production paths retain `/ez-chars`.
