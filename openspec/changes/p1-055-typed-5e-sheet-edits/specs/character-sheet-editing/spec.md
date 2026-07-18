## ADDED Requirements

### Requirement: Structured sheet edits are validated atomically

The system SHALL validate a supported structured character-sheet edit as one atomic operation before changing the stored character.

#### Scenario: Valid structured edit is committed

- **WHEN** a user saves a valid structured spell, action, proficiency, feature, inventory, currency, roleplay, scratchpad, or annotation edit
- **THEN** the system SHALL commit the complete edit to the character's canonical data

#### Scenario: Invalid structured edit is rejected

- **WHEN** a structured edit contains an unsupported target or malformed value
- **THEN** the system SHALL leave the stored character unchanged rather than committing a partial or defaulted interpretation

### Requirement: Structured edits preserve data outside their semantic target

The system MUST preserve unrelated character records and stable identities when applying a supported structured edit.

#### Scenario: One collection group is replaced

- **WHEN** a user edits one supported group within a shared character collection
- **THEN** records outside that group SHALL retain their values, annotations, ordering guarantees, and identifiers

#### Scenario: Existing record is edited

- **WHEN** a structured edit identifies an existing action, feature, inventory item, annotation, or note
- **THEN** the saved record SHALL retain its existing identifier

#### Scenario: New record is added

- **WHEN** a structured edit adds a record without an existing identifier
- **THEN** the system SHALL assign a new non-empty identifier before persistence

### Requirement: Structured and direct field editing remain behaviorally consistent

The system SHALL preserve the existing user-visible editing, annotation, validation, and persistence behavior regardless of whether a sheet surface uses structured card editing or direct primitive editing.

#### Scenario: Structured edit survives reload

- **WHEN** a user saves a supported structured edit and reloads the application
- **THEN** the sheet SHALL display the saved result through the existing local-first persistence flow

#### Scenario: Direct primitive edit remains supported

- **WHEN** a user saves a supported direct primitive field edit
- **THEN** the edit SHALL continue to update and persist without requiring conversion into a structured card edit
