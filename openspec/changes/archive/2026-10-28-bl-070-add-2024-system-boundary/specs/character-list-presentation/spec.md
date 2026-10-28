## MODIFIED Requirements

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
