# 2026-07-18 Adopt Storybook for Isolated SvelteKit Component Development

## Metadata

- **Status:** Approved
- **Author:** Antigravity, Codex, and User
- **Date:** 2026-07-18

## Context & Problem Statement

Phase 2 emphasizes developer experience before the next player-facing feature. Developing reusable Svelte components only through the main character sheet requires navigating character hydration, route state, and dense layout composition, which slows visual iteration for human developers and AI agents.

The repository needs a local component environment that exposes important states independently, provides interactive debugging for humans, and gives agents deterministic browser-backed commands for rendering, interaction, and automated accessibility checks.

## Decision Drivers

- Shorten the feedback loop for reusable Svelte 5 component work.
- Support both interactive human development and headless agent verification.
- Keep component examples typed, explicit, and easy to review.
- Surface supported automated accessibility failures early without overstating their coverage.
- Integrate with SvelteKit, Vite, Vitest, Playwright, Tailwind, and existing path aliases.
- Avoid remote hosting, CI expansion, and cloud services during the local proof surface.

## Considered Options

### 1. Custom Svelte component sandbox route

- **Pros:** No new dependency family and complete control over presentation.
- **Cons:** Requires maintaining a catalog UI, state controls, browser-test integration, and accessibility reporting already supplied by established tooling.

### 2. Storybook with SvelteKit, native Svelte stories, and dashboard-only checks

- **Pros:** Svelte-native authoring and a capable interactive catalog.
- **Cons:** Adds a second component-specific authoring syntax and leaves AI agents dependent on navigating a dashboard or adopting a separate test runner later.

### 3. Storybook with SvelteKit, TypeScript CSF, and Vitest-backed checks

- **Pros:** Uses the SvelteKit-aware framework, keeps examples as typed data and play functions, provides dashboard and CLI execution through the same stories, and integrates automated accessibility results.
- **Cons:** Adds development dependencies, browser-test configuration, and ongoing story maintenance.

## Decision Outcome

Choose Option 3.

- Adopt the aligned Storybook `10.5.2` package family with `@storybook/sveltekit`; do not use the lower-level `@storybook/svelte-vite` integration.
- Standardize catalog examples on TypeScript CSF `.stories.ts` files.
- Use `@storybook/addon-a11y` for interactive findings and `@storybook/addon-vitest` for browser-backed dashboard and CLI execution.
- Configure accessibility findings as test errors for cataloged stories.
- Keep existing unit tests and Storybook browser tests in separate named Vitest projects.
- Seed the catalog with `BaseButton`, `Heading`, and the interaction-bearing `ValidatedInputField`.
- Keep Storybook local-only; do not add publishing, CI, or visual-regression services.

### Consequences

- **Positive:** Humans can inspect and debug component states without navigating the full application.
- **Positive:** Agents can render stories, run interactions, and receive accessibility failures through repeatable local commands.
- **Positive:** TypeScript CSF stories become typed component examples and executable contracts.
- **Positive:** The SvelteKit framework preserves Kit-specific behavior and repository aliases without defaulting to bespoke Vite duplication.
- **Negative:** The development dependency graph and local verification surface become larger.
- **Negative:** Existing Vitest configuration must be separated carefully so unit and Storybook browser projects remain isolated.
- **Negative:** Stories add maintenance cost and automated accessibility checks cover only machine-detectable issues.

## Refinements & Follow-Ups

### 2026-07-19 Strategic review refinement

- Replaced the original `@storybook/svelte-vite` direction with the supported `@storybook/sveltekit` framework.
- Replaced the superseded `@storybook/test-runner` assumption with the Vitest addon and an explicit local CLI test path.
- Added a third interaction-bearing baseline story so the proof surface validates more than static rendering.
- Added deterministic dependency setup, test-project isolation, required repository gates, and explicit limits on automated accessibility coverage.
- Implementation is planned through OpenSpec change `p1-012-integrate-storybook`.
