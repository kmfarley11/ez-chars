## ADDED Requirements

### Requirement: Character-sheet editing follows explicit read-first tiers

The system SHALL classify editable character-sheet information as frequently changed runtime state, rich field or record detail, or collection content, and SHALL present each class through a predictable interaction tier. Information without an explicit runtime classification SHALL default to a read-first presentation rather than inheriting persistent inline editing controls.

#### Scenario: Editing explicitly classified runtime state

- **WHEN** a user edits a frequently changed runtime value such as current hit points
- **THEN** the value SHALL be editable directly on the sheet without opening a focused detail presentation
- **AND** entering and leaving edit state SHALL NOT cause disruptive movement of surrounding content

#### Scenario: Opening rich information

- **WHEN** a user activates the explicit detail target for a rich field or record
- **THEN** the system SHALL first present the target's available authored detail, provenance, annotations, and references together
- **AND** changing that information SHALL require a separately identifiable Edit action

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

### Requirement: Rich-detail entry preserves the reading surface

The system SHALL expose an explicit keyboard-, pointer-, touch-, and assistive-technology-operable target for opening rich detail without making an entire content container behave as an undisclosed activation target.

#### Scenario: Showing a note indicator for a rich field

- **WHEN** a read-first rich field has annotations and its compact presentation distinguishes a field label from its displayed value
- **THEN** the field SHALL present its label, then its quiet note indicator, then its displayed value
- **AND** the indicator SHALL remain separate from the field's detail action cluster

#### Scenario: Selecting text near a detail target

- **WHEN** a user selects or copies displayed character information without activating its explicit detail target
- **THEN** the selection or copy interaction SHALL remain available
- **AND** the focused detail presentation SHALL NOT open

#### Scenario: Returning from focused detail

- **WHEN** a user closes or navigates back from focused detail or editing
- **THEN** focus SHALL return to the invoking target or an equivalent stable destination
- **AND** the user SHALL return to the prior sheet or collection context

## MODIFIED Requirements

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
