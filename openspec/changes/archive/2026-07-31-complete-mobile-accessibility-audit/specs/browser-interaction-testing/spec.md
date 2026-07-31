## MODIFIED Requirements

### Requirement: Multi-browser capability (Firefox/WebKit)

The framework MUST support testing against Firefox and WebKit browser engines and a phone-sized, coarse-pointer Chromium presentation on demand to support cross-browser and mobile functional verification.

#### Scenario: Running all tests across all configured browsers

- **WHEN** the user runs `npm run test:e2e:all`
- **THEN** the system MUST execute the functional E2E smoke tests successfully across all configured browser projects (desktop Chromium, Firefox, WebKit, and mobile Chromium)

#### Scenario: Verifying layout on Firefox specifically

- **WHEN** the user runs a Playwright pass targeting Firefox specifically (e.g. `npx playwright test --project=firefox`)
- **THEN** the system MUST execute the functional E2E smoke tests successfully inside Firefox

#### Scenario: Verifying the phone-sized presentation specifically

- **WHEN** the user runs a Playwright pass targeting the documented mobile Chromium project
- **THEN** the system MUST execute the functional E2E smoke tests with a phone-sized viewport and coarse-pointer input characteristics

## ADDED Requirements

### Requirement: Representative mobile accessibility coverage

The browser suite SHALL provide repeatable checks for representative non-exempt touch-target dimensions, logical keyboard interaction, modal focus confinement and restoration, and critical phone-sized sheet workflows. These checks SHALL use visible roles, labels, text, and rendered bounds rather than component internals, CSS classes, or snapshots.

#### Scenario: Measuring representative touch targets

- **WHEN** the mobile Chromium accessibility checks render representative navigation, sheet-section, editing, annotation, dialog, menu, spell, inventory, and runtime-action controls
- **THEN** every checked non-exempt control SHALL expose rendered interactive bounds of at least 44 by 44 CSS pixels
- **AND** the test SHALL identify any failing control by its user-visible role and name

#### Scenario: Exercising representative keyboard order

- **WHEN** the browser checks navigate a responsive sheet flow with keyboard input
- **THEN** focus SHALL move through visible controls in logical task order
- **AND** hidden or collapsed controls SHALL be skipped

#### Scenario: Automated checks cannot establish an exception

- **WHEN** target usability depends on inline text flow, a labeled native-control hit area, screen-reader interpretation, or physical-device behavior
- **THEN** the automated suite SHALL defer that conclusion to the documented manual audit rather than treating an unsupported machine check as proof
