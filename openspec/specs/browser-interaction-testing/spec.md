# browser-interaction-testing Specification

## Purpose

Establish the project's automated browser testing standard, guaranteeing fast E2E smoke coverage for user workflows (navigation, edits, viewport layouts, annotations, backups) on Chromium by default, with structured capabilities to verify Firefox and WebKit rendering pipelines.
## Requirements
### Requirement: Fast Chromium local smoke testing

The E2E framework MUST run a Chromium-based test pass in under 5 seconds locally, verifying core user workflows against a pre-started dev server.

#### Scenario: Running the Chromium suite locally

- **WHEN** the user runs `npm run test:e2e` against a pre-started dev server at `http://localhost:5173`
- **THEN** the system MUST execute the smoke tests in Chromium and report results in under 5 seconds

### Requirement: Multi-browser capability (Firefox/WebKit)

The framework MUST support testing against Firefox and WebKit browser engines on demand to support cross-browser functional verification.

#### Scenario: Running all tests across all configured browsers

- **WHEN** the user runs `npm run test:e2e:all`
- **THEN** the system MUST execute the functional E2E smoke tests successfully across all configured browsers (Chromium, Firefox, and WebKit)

#### Scenario: Verifying layout on Firefox specifically

- **WHEN** the user runs a Playwright pass targeting Firefox specifically (e.g. `npx playwright test --project=firefox`)
- **THEN** the system MUST execute the functional E2E smoke tests successfully inside Firefox

### Requirement: Core workflow coverage

The template E2E suite MUST verify page navigation, mobile/desktop viewport adjustments, section collapse states, field value updates (Current HP), note annotations (D&D Beyond and SRD links), and export/import round-tripping.

#### Scenario: Seeding and executing the E2E workflow

- **WHEN** the E2E test runs, it programmatically seeds `localStorage` with mock character data before load, navigates to the character sheet, collapses/expands sections, edits HP, inserts notes annotations, and performs a JSON backup download/upload cycle
- **THEN** the page MUST render all edits, display annotations badge links, restore the character on import, and run without console errors

