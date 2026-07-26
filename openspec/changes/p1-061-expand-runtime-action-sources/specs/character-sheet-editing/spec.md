## ADDED Requirements

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
