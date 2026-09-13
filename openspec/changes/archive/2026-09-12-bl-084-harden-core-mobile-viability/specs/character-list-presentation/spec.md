## ADDED Requirements

### Requirement: Character listing presents human-readable summary values

The character listing view SHALL present character display properties (character name, system label, class summary, and updated date, with identifier as a fallback for missing names) as formatted, human-readable text rather than raw serialized data structures or JSON representations.

#### Scenario: Character row or card is rendered

- **WHEN** a character from storage is prepared for display in the character list
- **THEN** its identity name, system identity, class summary, and updated timestamp SHALL be presented as formatted, human-readable strings
- **AND** the character identifier SHALL serve as fallback text if an identity name is absent

### Requirement: Desktop viewports render a semantic table

On desktop viewports (at or above the responsive layout breakpoint), the character list SHALL render a semantic HTML `<table>` with appropriate column headers, row elements, and action cells.

#### Scenario: Desktop viewport displays character list

- **WHEN** the user views the character list on a viewport at or above the responsive layout breakpoint
- **THEN** the character records SHALL be presented within a semantic `<table>` element with column headers and rows
- **AND** each row SHALL contain cells for identity, system, classes, updated timestamp, and primary/secondary actions

### Requirement: Mobile viewports render an accessible card list

On mobile viewports (below the responsive layout breakpoint), the character list SHALL render a semantic list (`<ul role="list">`) containing list items (`<li>`) with card articles (`<article>`) rather than a horizontally overflowing table.

#### Scenario: Mobile viewport displays character cards

- **WHEN** the user views the character list on a viewport below the responsive layout breakpoint
- **THEN** the character records SHALL be presented as a stacked list of cards within an unordered list (`<ul role="list">`) where each card is a list item (`<li>`)
- **AND** the viewport SHALL NOT produce document-level horizontal overflow
- **AND** each card SHALL provide interactive touch targets of at least 44 by 44 CSS pixels on coarse-pointer presentations, without overlapping adjacent targets, for opening the character and accessing secondary management actions

### Requirement: Character selection and management actions remain consistent across viewports

Activating a character record to open its sheet or accessing secondary actions (such as deletion) SHALL execute the identical operations and state transitions regardless of whether rendered as a desktop table row or mobile card.

#### Scenario: Character is selected to open sheet

- **WHEN** a user activates the primary open action on either a desktop table row or a mobile card
- **THEN** the application SHALL navigate to the appropriate system character sheet URL with the character's identifier

#### Scenario: Character deletion is invoked

- **WHEN** a user activates the delete action from a desktop table row or a mobile card
- **THEN** a confirmation dialog SHALL be presented
- **AND** confirming deletion SHALL remove the character from storage and refresh the list
