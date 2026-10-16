# Component Sandbox

## Purpose

Provide an isolated, browser-backed catalog for reviewing reusable UI states, exercising representative interactions, and receiving automated accessibility feedback.

## Requirements

### Requirement: Isolated Component Catalog

The repository SHALL provide a documented local command that starts an isolated catalog of reusable UI examples without requiring saved user characters or application navigation. Fixture-backed system examples SHALL use isolated, resettable example state rather than reading or changing a user's stored characters.

#### Scenario: Launching the component catalog

- **WHEN** a developer runs the documented catalog command
- **THEN** the local catalog starts and its baseline component examples can be selected and rendered

#### Scenario: Iterating on a component

- **WHEN** a developer changes a cataloged component or its example while the catalog is running
- **THEN** the rendered example updates without restarting or navigating through the full application

#### Scenario: Editing and resetting a canonical example

- **WHEN** a reviewer edits and resets a fixture-backed sheet example
- **THEN** the changes affect only that example's working state
- **AND** reset restores its canonical fixture without changing other examples, fixture originals, or saved user characters

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

### Requirement: Discoverable Example Ownership and Provenance

The catalog SHALL distinguish reusable design-system examples, system-owned current examples, application-owned examples when retained, and intentionally deferred concepts through visible navigation and descriptions. It SHALL identify material sandbox limitations without presenting retired or experimental interactions as the current application baseline. Provenance, limitations, and manual review directions SHALL be accessible in the rendered catalog, not only in non-displayed metadata.

#### Scenario: Finding an accepted interaction pattern

- **WHEN** a reviewer looks for current runtime editing, read-first detail, collection, or sheet-navigation examples
- **THEN** the catalog identifies the applicable reusable or system-owned examples and their review purpose
- **AND** any retained conceptual alternatives are explicitly distinguished from approved production behavior

#### Scenario: Finding a deferred workflow

- **WHEN** a reviewer opens the retained Collection Organizer concept
- **THEN** its description identifies it as deferred rather than available production behavior

#### Scenario: Reading example guidance

- **WHEN** a reviewer opens a canonical example or interaction proof in the catalog
- **THEN** the rendered catalog visibly provides its provenance, material host limitations, and manual review directions
- **AND** explanatory content is distinguishable from actual interactive proof controls

### Requirement: Representative Shared Use-Case Sandboxes

The catalog SHALL provide representative reusable arrangements for runtime fields, read-first independently saved detail, searchable and pinnable collections, and sheet navigation without requiring a complete game-system model to understand those shared interactions. Its examples SHALL collectively expose materially distinct sparse/dense, long-content, dirty-work, and rejected-save states with explicit manual review directions. Interaction and viewport checks SHALL reuse an existing sandbox when no distinct initial composition or state is required.

#### Scenario: Reviewing a focused edit failure

- **WHEN** a reviewer follows the shared read-first sandbox's directions to edit a field and encounter a rejected save
- **THEN** the example exposes the same shared editing and recovery interaction used by its production consumers
- **AND** the reviewer can also exercise dirty-work handling without navigating to a separate story for each command

#### Scenario: Reviewing collection density across viewports

- **WHEN** a reviewer opens a representative collection sandbox and changes between desktop and phone viewports
- **THEN** search, priority, and density behavior remain reviewable in that sandbox
- **AND** additional examples are reserved for materially different fixtures, layout boundaries, or states

### Requirement: Production-Backed Canonical Sheet Examples

The catalog SHALL provide Bryltin, Zindra, and saturated 2014 character examples that reflect the current application's sheet composition and editing behavior. Their displayed content and interactions SHALL be backed by the production implementation rather than a separately maintained approximation. Example hosts SHALL disclose differences in persistence and browser-navigation effects; real application routing and persistence verification SHALL remain separate.

#### Scenario: Reviewing a canonical character

- **WHEN** a reviewer selects Bryltin, Zindra, or the saturated character
- **THEN** the catalog presents that canonical character through the current production sheet composition with working editing, notes, collection priority, and navigation controls appropriate to the fixture
- **AND** any sandbox-specific host behavior is identified rather than silently substituting inert controls

#### Scenario: Updating a production interaction

- **WHEN** the production sheet's shared rendering or editing behavior is updated
- **THEN** canonical sheet examples use that updated implementation without requiring a parallel story-specific implementation of the same behavior

#### Scenario: Exercising simulated write rejection

- **WHEN** a reviewer enables a canonical example's rejection control and attempts a mutation within its declared scope
- **THEN** the character remains unchanged and the interaction retains its existing failure and draft-handling behavior
- **AND** the guidance distinguishes simulated commit rejection from actual persistence failures

### Requirement: Evidence-Preserving Prototype Retirement

When superseding a prototype or redundant example, maintainers SHALL record its production consumers and unique interaction, state, or layout evidence and map that evidence to retained examples or appropriate automated tests before removal. Live workflows SHALL NOT be removed solely because an older proof uses them.

#### Scenario: Retiring a historical editing proof

- **WHEN** an obsolete proof presents editing semantics that differ from the current application
- **THEN** its unique useful evidence is mapped to a current example or automated check before the proof is retired
- **AND** current catalog guidance no longer presents that proof as the accepted interaction pattern

#### Scenario: Discovering a live fallback consumer

- **WHEN** a retirement inventory finds that production still uses a workflow demonstrated by an old proof
- **THEN** removing the proof preserves that production workflow and its relevant coverage unless a separately approved change replaces its behavior

### Requirement: Discoverable Component Maintenance Guidance

Human and agent contributor entry points SHALL direct maintainers to consistent guidance for locating component implementations, stories, tests, and canonical system examples. That guidance SHALL document naming conventions and exceptions, shared versus system-owned versus application-owned placement, intentionally retained locations, dependency direction, reuse and extension expectations, and proportionate verification and documentation responsibilities. It SHALL describe the delivered structure rather than presenting proposed locations as already available.

#### Scenario: Finding a component and its evidence

- **WHEN** a maintainer starts from the repository's human or agent guide to locate a reusable control
- **THEN** linked navigation identifies the implementation, its representative catalog example, and relevant tests
- **AND** the maintainer can distinguish those from system-owned compositions and deferred concepts

#### Scenario: Contributing a shared component change

- **WHEN** a maintainer consults the contribution guidance before adding or changing a UI component
- **THEN** it explains how to inspect existing reusable components and consumers, choose shared, system, or application ownership, apply naming conventions, and update appropriate stories, tests, and navigation
- **AND** it directs humans and agents to the same conventions without requiring a duplicated standards manual
