# Capability: character-sheet-editing

## Purpose

Define atomic, identity-preserving character-sheet edits that keep structured card workflows and direct field editing consistent through validation and persistence.

## Requirements

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

### Requirement: Features and Traits retain distinct sheet ownership

The system SHALL present general/manual features together with class and subclass features through the Features sheet collection while preserving each record's current owning collection, and SHALL keep ancestry Traits in a separate sheet collection.

#### Scenario: Viewing Features

- **WHEN** a character has general, class, subclass, and ancestry-trait records
- **THEN** the Features sheet collection SHALL include the general, class, and subclass records
- **AND** the ancestry-trait records SHALL remain in the separate Traits sheet collection

#### Scenario: Adding a manual Feature

- **WHEN** a user adds a new entry through the Features editing workflow without class ownership
- **THEN** the system SHALL save it as a general feature with a new stable identity
- **AND** existing class and subclass feature collections SHALL remain unchanged

#### Scenario: Editing mixed Feature ownership

- **WHEN** one valid structured edit changes general and class-owned Feature entries together
- **THEN** each entry SHALL be committed back to its existing owning collection
- **AND** unrelated feature records, unexposed authored fields, annotations, class order, and existing identities SHALL be preserved

#### Scenario: Editing Traits

- **WHEN** a user adds or edits an ancestry Trait
- **THEN** the system SHALL retain it in the separate ancestry-trait collection with a stable identity
- **AND** the Features collection SHALL remain unchanged
