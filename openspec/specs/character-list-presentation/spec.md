# Character List Presentation Specification

## Purpose

Provide a responsive, accessible presentation of stored character summaries on the home route, adapting smoothly between a semantic desktop data table and touch-friendly mobile card list without layout overflow or behavioral discrepancy.

## Requirements

### Requirement: Character listing presents human-readable summary values

The character listing view SHALL present each supported character's display name, system/edition label, system-appropriate summary, and updated date as formatted human-readable text rather than raw serialized data. Classes and levels SHALL remain visible where applicable to D&D characters, without requiring all systems or sparse characters to supply class information. The document identifier SHALL serve as fallback for an absent display name.

#### Scenario: Character row or card is rendered

- **WHEN** a supported character is prepared for display in the character list
- **THEN** its name, system/edition, supplied summary, and updated timestamp SHALL be readable strings
- **AND** the character identifier SHALL serve as fallback text if a name is absent

#### Scenario: Mixed editions and sparse summaries

- **WHEN** the list contains 2014 and 2024 characters, including a character without class information
- **THEN** the editions SHALL be distinguishable and absent summary facts SHALL not be invented

### Requirement: Desktop viewports render a semantic table

On desktop viewports (at or above the responsive layout breakpoint), the character list SHALL render a semantic HTML table with appropriate column headers, row elements, and action cells.

#### Scenario: Desktop viewport displays character list

- **WHEN** the user views the character list on a viewport at or above the responsive layout breakpoint
- **THEN** records SHALL be presented within a semantic table with column headers and rows
- **AND** each row SHALL contain identity, system, system-appropriate summary, updated timestamp, and primary/secondary actions

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
