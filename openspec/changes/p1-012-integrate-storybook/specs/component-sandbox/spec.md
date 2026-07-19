## ADDED Requirements

### Requirement: Isolated Component Catalog

The repository SHALL provide a documented local command that starts an isolated catalog of reusable UI component examples without requiring character data or application navigation.

#### Scenario: Launching the component catalog

- **WHEN** a developer runs the documented catalog command
- **THEN** the local catalog starts and its baseline component examples can be selected and rendered

#### Scenario: Iterating on a component

- **WHEN** a developer changes a cataloged component or its example while the catalog is running
- **THEN** the rendered example updates without restarting or navigating through the full application

### Requirement: Representative Baseline Examples

The initial component catalog SHALL demonstrate static visual variants, control states, and an input interaction with validation feedback.

#### Scenario: Reviewing baseline states

- **WHEN** a developer opens the initial catalog
- **THEN** representative typography, button, disabled, and validated-input states are available for review

### Requirement: Executable Component Checks

The repository SHALL provide a documented local command that executes catalog examples as browser-backed component checks without requiring manual dashboard navigation.

#### Scenario: Running component checks successfully

- **WHEN** a developer or agent runs the component-check command against valid catalog examples
- **THEN** every included example renders, its declared interactions complete, and the command exits successfully

#### Scenario: Reporting a component failure

- **WHEN** an included example fails to render or a declared interaction assertion fails
- **THEN** the component-check command reports the failing example and exits unsuccessfully

### Requirement: Automated Accessibility Feedback

The component catalog SHALL evaluate every included example with supported automated accessibility rules in both the interactive catalog and the executable component-check command.

#### Scenario: Reviewing interactive accessibility results

- **WHEN** a developer inspects an example in the catalog
- **THEN** the catalog reports the supported automated accessibility findings for that example

#### Scenario: Failing an executable accessibility check

- **WHEN** an included example violates a configured automated accessibility rule
- **THEN** the component-check command reports the violation and exits unsuccessfully
