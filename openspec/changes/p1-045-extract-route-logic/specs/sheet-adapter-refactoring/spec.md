## ADDED Requirements

### Requirement: Decoupled and unit-testable sheet adapter calculations

The system MUST decouple the 5e sheet projections and virtual patch normalization rules into pure, stateless functions, ensuring they can be tested via Vitest in isolation without Svelte compilation or browser environments.

#### Scenario: Character projections return valid grid data structures

- **WHEN** the developer runs Vitest tests on the sheet adapter projections
- **THEN** the system MUST return valid GridContentData projections for 5e characters

#### Scenario: Patches normalize correctly

- **WHEN** the developer runs Vitest tests on the sheet adapter patch normalizer
- **THEN** the system MUST translate flat virtual grid patches back to canonical document patch operations successfully
