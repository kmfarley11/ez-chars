## Why

Phase 2 shifts near-term emphasis toward developer experience so reusable UI work can proceed faster and with less dependence on the full character-sheet state and layout. Human developers and AI agents need an isolated, repeatable way to inspect component states and catch rendering, interaction, and automated accessibility failures early.

## What Changes

- Add a local catalog for developing reusable UI components independently from application and character state.
- Establish typed component examples as reviewable contracts for important visual and interaction states.
- Add repeatable browser-backed component and accessibility checks that work both interactively and from a local command.
- Seed the catalog with representative static, stateful, and input-validation examples that prove the workflow without expanding into page-level coverage.

## Non-Goals

- Cataloging full pages or complex character-sheet layouts in this initial change.
- Hosting or publishing the component catalog.
- Adding cloud visual-regression services or continuous-integration workflows.
- Replacing application end-to-end tests, manual accessibility review, or mobile playtesting.

## Capabilities

### New Capabilities

- `component-sandbox`: Isolated local component development with repeatable rendering, interaction, and automated accessibility feedback.

### Modified Capabilities

None.

## Impact

- **Developer workflow:** Adds a component-focused development and verification loop alongside the existing application workflow.
- **Tooling:** Adds local development-only dependencies and browser-backed component-test configuration.
- **Runtime:** Does not change production behavior, character data, storage, or schema boundaries.
