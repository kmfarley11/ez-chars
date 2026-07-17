## Why

Coding agents need a structured, lightweight automated testing framework to verify user-facing browser interactions (like element clicks, edits, viewports, and backup files) without writing ad-hoc, unbounded NodeJS-based crawler scripts. Introducing Playwright E2E smoke testing ensures fast, repeatable functional verification for both developers and agents.

## What Changes

- Install `@playwright/test` and establish a sub-5-second local E2E smoke test suite.
- Configure Playwright to run Chromium by default for speed, while configuring multi-browser setups (including Firefox and WebKit) to support targeted cross-browser verification.
- Write an Architecture Decision Record (ADR) documenting near-term (Playwright E2E), mid-term (Storybook), and long-term (Svelte Testing Library component tests) strategies.
- Create a canonical smoke test that seeds `localStorage` and verifies navigation, responsive layouts, value edits, annotations, and JSON backups.
- Update repository guidelines in `docs/verification.md` and `AGENTS.md` to establish test execution limits.

## Capabilities

### New Capabilities

- `browser-interaction-testing`: Establishes the project's automated browser testing standard, guaranteeing fast E2E smoke coverage for user workflows (navigation, edits, viewport layouts, annotations, backups) on Chromium by default, with structured capabilities to verify Firefox and WebKit rendering pipelines.

### Modified Capabilities

None.

## Impact

- `package.json`: Add `@playwright/test` devDependency and scripts (`test:e2e`, `test:e2e:all`).
- `playwright.config.ts`: Create Playwright configuration targeting `http://localhost:5173`.
- `tests/characterSheet.smoke.spec.ts`: Add canonical E2E smoke test file.
- `docs/decisions/`: Commit the testing strategy ADR.
- `docs/verification.md` & `AGENTS.md`: Document E2E test runs.
