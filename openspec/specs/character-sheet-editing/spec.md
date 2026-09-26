# Capability: character-sheet-editing

## Purpose

Define atomic, identity-preserving character-sheet edits that keep structured card workflows and direct field editing consistent through validation and persistence.

## Requirements

### Requirement: Structured sheet edits are validated atomically

The system SHALL validate a supported structured character-sheet edit, including authored and annotation changes composed in one focused draft, as one atomic operation before changing the stored character.

#### Scenario: Valid structured edit is committed

- **WHEN** a user saves a valid structured spell, action, proficiency, feature, inventory, currency, roleplay, scratchpad, or annotation edit
- **THEN** the system SHALL commit the complete edit to the character's canonical data

#### Scenario: Valid combined edit is committed once

- **WHEN** a focused structured edit contains valid authored and annotation changes for the same target
- **THEN** the system SHALL validate and commit the combined result as one operation
- **AND** it SHALL NOT require an intermediate annotation or authored-value save

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

### Requirement: Character-sheet editing follows explicit read-first tiers

The system SHALL classify editable character-sheet information as frequently changed runtime state, rich field or record detail, or collection content, and SHALL present each class through a predictable interaction tier. Information without an explicit runtime classification SHALL default to a read-first presentation rather than inheriting persistent inline editing controls.

#### Scenario: Editing explicitly classified runtime state

- **WHEN** a user edits a frequently changed runtime value such as current hit points or carried currency
- **THEN** the value SHALL be editable directly on the sheet without opening a focused detail presentation
- **AND** entering and leaving edit state SHALL NOT cause disruptive movement of surrounding content

#### Scenario: Presenting neighboring runtime values

- **WHEN** multiple runtime values share one responsive grid
- **THEN** each value surface SHALL fill its allocated grid track rather than shrink to its content
- **AND** entering edit state SHALL preserve the surrounding track allocation

#### Scenario: Opening rich information

- **WHEN** a user activates the explicit detail target for a rich field or record
- **THEN** the system SHALL first present the target's available authored detail, provenance, annotations, and references together
- **AND** changing that information SHALL require a separately identifiable Edit action

#### Scenario: Opening a bounded group of rich information

- **WHEN** multiple non-runtime fields share one visually bounded sheet group
- **THEN** the group SHALL expose one explicit detail target for the complete group
- **AND** its focused Edit SHALL make every eligible authored field in that group reachable without adding persistent inline controls to each value

#### Scenario: Presenting an unclassified editable field

- **WHEN** an editable field has not been explicitly classified as frequently changed runtime state
- **THEN** the field SHALL use the read-first interaction tier
- **AND** it SHALL NOT expose persistent inline Save and Cancel controls merely because its value is primitive

### Requirement: Focused editing commits authored and annotation changes together

The system SHALL treat authored values and annotations changed during one focused editing session as one local draft and one atomic save operation. Save SHALL commit the complete valid draft once, while Cancel or failed validation SHALL leave the stored target unchanged.

#### Scenario: Saving authored and annotation changes

- **WHEN** a user changes authored information and annotations in one focused editing session and saves a valid draft
- **THEN** the system SHALL commit both kinds of change together
- **AND** the target SHALL retain its stable identity

#### Scenario: Rejecting an invalid unified draft

- **WHEN** any authored or annotation value in the focused draft is invalid
- **THEN** the system SHALL keep the complete draft available with actionable validation feedback
- **AND** it SHALL leave the stored character unchanged

#### Scenario: Cancelling a unified draft

- **WHEN** a user cancels focused editing after changing authored information, annotations, or both
- **THEN** the system SHALL discard the complete draft
- **AND** it SHALL leave the stored character unchanged
- **AND** it SHALL return to the same target's read-first detail without dismissing the focused workflow

#### Scenario: Removing and restoring an annotation before save

- **WHEN** a user removes an annotation during focused editing and invokes Undo before saving
- **THEN** the annotation SHALL be restored within the draft
- **AND** neither removal nor restoration SHALL change the stored target before the outer Save action

#### Scenario: Offering annotations for a field with no notes

- **WHEN** an editable focused field supports annotations but its draft contains none
- **THEN** the editor SHALL expose one compact Add annotation action without reserving an expanded zero-count annotation section
- **AND** the complete annotation editor SHALL appear only after the user deliberately starts an annotation

### Requirement: Rich-detail entry preserves the reading surface

The system SHALL expose an explicit keyboard-, pointer-, touch-, and assistive-technology-operable target for opening rich detail without making an entire content container behave as an undisclosed activation target.

#### Scenario: Showing a note indicator for a rich field

- **WHEN** a read-first rich field has annotations and its compact presentation distinguishes a field label from its displayed value
- **THEN** the field SHALL present its quiet note indicator inline with its label when space allows, followed by its displayed value
- **AND** the indicator SHALL remain separate from the field's detail action cluster

#### Scenario: Reading compact rich fields consistently

- **WHEN** a bounded sheet group presents several read-first primitive values
- **THEN** the default compact presentation SHALL use one shared label-and-value grammar across those values
- **AND** a section MAY explicitly request a stacked label-over-value variant when its information hierarchy justifies the additional height

#### Scenario: Selecting text near a detail target

- **WHEN** a user selects or copies displayed character information without activating its explicit detail target
- **THEN** the selection or copy interaction SHALL remain available
- **AND** the focused detail presentation SHALL NOT open

#### Scenario: Returning from focused detail

- **WHEN** a user closes or navigates back from focused detail or editing
- **THEN** focus SHALL return to the invoking target or an equivalent stable destination
- **AND** the user SHALL return to the prior sheet or collection context
