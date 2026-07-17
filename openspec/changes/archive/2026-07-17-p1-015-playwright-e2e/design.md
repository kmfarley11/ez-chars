## Context

Currently, the repository has unit tests (via Vitest) but lacks automated browser integration testing. Introducing E2E tests prevents coding agents from creating slow, custom NodeJS wrappers and ensures that user interactions, viewport layouts, and file conversions remain functional.

## Goals / Non-Goals

**Goals:**

- Setup Playwright E2E testing framework.
- Configure Chromium as the default runner for fast local execution (< 5s).
- Configure Firefox and WebKit projects to support cross-browser verification.
- Write a canonical smoke test that seeds data, performs value edits, checks notes annotations, and verifies imports/exports.
- Commit a testing strategy ADR mapping Playwright, Storybook, and Svelte Testing Library.

**Non-Goals:**

- Writing comprehensive unit testing suites for individual Svelte components (deferred).
- Adding screenshot visual comparisons or Docker requirements.

## Decisions

### Decision 1: Playwright Test Runner & Folder Layout

We choose `@playwright/test` for E2E testing. E2E tests will live in a top-level `tests/` directory to separate integration testing from Vitest unit tests in `src/__tests__/`.

_Alternatives Considered:_

- _Vitest Browser Mode:_ Good for unit testing, but lacks native multi-tab and file download helpers that Playwright excels at.
- _Cypress:_ Heavy runner with complex setup and longer boot time.

### Decision 2: Pre-started Dev Server Lifecycle

Playwright will target `http://localhost:5173`. The config is set to reuse the existing Vite server if it is already running (`reuseExistingServer: true`), allowing sub-second test starts.

### Decision 3: Local Storage Seeding

We use `page.addInitScript` to write mock character fixtures straight to `localStorage` before the page scripts load. This eliminates the need to record slow character creation UI flows.

### Decision 4: Testing Strategy ADR

We will commit `docs/decisions/2026-07-17-testing-strategy.md` to document testing strategy:

1. **Near-Term:** Playwright E2E smoke tests for fast user interaction checks.
2. **Mid-Term:** Storybook isolated playtesting once components are extracted.
3. **Deferred Long-Term:** Svelte Testing Library component tests once structure stabilizes.

## Risks / Trade-offs

- **[Risk]** Playwright execution requires node dependencies.
  - **[Mitigation]** We restrict E2E smoke tests to a single, fast-running canonical suite to keep local execution under 5 seconds.
